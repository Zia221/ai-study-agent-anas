from fastapi import APIRouter

from app.services.rag_service import search


router = APIRouter(
    prefix="/api/rag",
    tags=["RAG"],
)


@router.get("/search")
async def search_documents(
    query: str,
    limit: int = 5,
):
    results = search(
        query=query,
        limit=limit,
        
    )

    return {
        "query": query,
        "results": results,
    }