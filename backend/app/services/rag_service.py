import logging
import math
import os

import chromadb
from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

logger = logging.getLogger(__name__)


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


chroma_client = chromadb.PersistentClient(
    path="./chroma_data"
)


collection = chroma_client.get_or_create_collection(
    name="study_documents"
)


def create_embedding(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )

    return response.data[0].embedding


def add_chunks(
    chunks: list[str],
    document_name: str,
    document_id: int,
    user_id: int,
) -> int:

    logger.info("Adding document chunks to RAG")

    if not chunks:
        return 0

    ids = []
    embeddings = []
    documents = []
    metadatas = []

    for index, chunk in enumerate(chunks):

        chunk_id = (
            f"user-{user_id}-"
            f"document-{document_id}-"
            f"chunk-{index}"
        )

        embedding = create_embedding(chunk)

        ids.append(chunk_id)
        embeddings.append(embedding)
        documents.append(chunk)

        metadatas.append({
            "document_id": document_id,
            "document_name": document_name,
            "user_id": user_id,
            "chunk_index": index,
        })

    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )

    logger.info("Document chunks indexed successfully")

    return len(chunks)


def cosine_similarity(
    vector_a: list[float],
    vector_b: list[float],
) -> float:

    dot_product = sum(
        a * b
        for a, b in zip(vector_a, vector_b)
    )

    magnitude_a = math.sqrt(
        sum(a * a for a in vector_a)
    )

    magnitude_b = math.sqrt(
        sum(b * b for b in vector_b)
    )

    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    return dot_product / (
        magnitude_a * magnitude_b
    )


def search(
    query: str,
    user_id: int,
    limit: int = 5,
    min_similarity: float = 0.30,
) -> list[dict]:

    logger.info("RAG search started")

    query_embedding = create_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=limit,
        where={
            "user_id": user_id,
        },
        include=[
            "documents",
            "metadatas",
            "embeddings",
        ],
    )

    documents = results.get("documents") or [[]]
    metadatas = results.get("metadatas") or [[]]
    embeddings = results.get("embeddings") or [[]]

    documents = documents[0]
    metadatas = metadatas[0]
    embeddings = embeddings[0]

    relevant_chunks = []

    for document, metadata, embedding in zip(
        documents,
        metadatas,
        embeddings,
    ):

        similarity = cosine_similarity(
            query_embedding,
            embedding,
        )

        if similarity >= min_similarity:
            relevant_chunks.append({
                "text": document,
                "metadata": metadata,
                "similarity": similarity,
            })

    logger.info("RAG search completed")

    return relevant_chunks


def delete_document_chunks(
    document_id: int,
    user_id: int,
) -> int:

    logger.info("Deleting document chunks from RAG")

    results = collection.get(
        where={
            "$and": [
                {"user_id": user_id},
                {"document_id": document_id},
            ]
        }
    )

    ids = results.get("ids", [])

    if ids:
        collection.delete(ids=ids)

    logger.info("Document chunks deleted from RAG")

    return len(ids)