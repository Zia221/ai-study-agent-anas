from datetime import datetime

from pydantic import BaseModel


class RecentTest(BaseModel):
    id: int
    topic: str
    score: int
    correct_answers: int
    total_questions: int
    created_at: datetime


class TopicProgress(BaseModel):
    topic: str
    tests_taken: int
    average_score: int


class TopicInsight(BaseModel):
    topic: str
    average_score: int
    tests_taken: int
    status: str


class ProgressInsights(BaseModel):
    improvement: int
    trend: str
    strongest_topic: str | None
    weakest_topic: str | None
    topic_insights: list[TopicInsight]
    recommendation: str

class ProgressSummary(BaseModel):
    tests_taken: int
    average_score: int
    best_score: int
    recent_tests: list[RecentTest]
    topic_progress: list[TopicProgress]
    insights: ProgressInsights