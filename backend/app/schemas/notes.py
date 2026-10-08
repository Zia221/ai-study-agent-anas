from pydantic import BaseModel, Field


class NotesRequest(BaseModel):
    topic: str


class StudyNote(BaseModel):
    heading: str
    content: str
    key_points: list[str]


class GeneratedNotes(BaseModel):
    title: str
    topic: str
    summary: str
    sections: list[StudyNote]