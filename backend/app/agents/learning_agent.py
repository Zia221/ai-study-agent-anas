from langgraph.graph import StateGraph, START, END

from app.agents.learning_state import LearningState
from app.agents.learning_nodes import (
    load_student_preferences,
    retrieve_material,
    teach_topic,
    create_practice,
    evaluate_practice,
    decide_next_action,
)


def build_learning_graph(db):
    graph = StateGraph(LearningState)

    # -------------------------
    # Stage 1: Learning
    # -------------------------

    graph.add_node(
        "load_preferences",
        lambda state: load_student_preferences(
            state,
            db,
        ),
    )

    graph.add_node(
        "retrieve_material",
        retrieve_material,
    )

    graph.add_node(
        "teach",
        lambda state: teach_topic(
            state,
            db,
        ),
    )

    graph.add_node(
        "practice",
        lambda state: create_practice(
            state,
            db,
        ),
    )

    # Stage 1 flow
    graph.add_edge(
        START,
        "load_preferences",
    )

    graph.add_edge(
        "load_preferences",
        "retrieve_material",
    )

    graph.add_edge(
        "retrieve_material",
        "teach",
    )

    graph.add_edge(
        "teach",
        "practice",
    )

    graph.add_edge(
        "practice",
        END,
    )

    return graph.compile()


def build_evaluation_graph():
    graph = StateGraph(LearningState)

    # -------------------------
    # Stage 2: Evaluation
    # -------------------------

    graph.add_node(
        "evaluate",
        evaluate_practice,
    )

    graph.add_node(
        "decide",
        decide_next_action,
    )

    # Stage 2 flow
    graph.add_edge(
        START,
        "evaluate",
    )

    graph.add_edge(
        "evaluate",
        "decide",
    )

    graph.add_edge(
        "decide",
        END,
    )

    return graph.compile()