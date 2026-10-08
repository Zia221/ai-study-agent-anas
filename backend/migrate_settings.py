import sqlite3

connection = sqlite3.connect("study_agent.db")
cursor = connection.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS user_settings (
    id INTEGER PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium',
    test_question_count INTEGER NOT NULL DEFAULT 10,
    learning_style TEXT NOT NULL DEFAULT 'balanced',
    tutor_response_length TEXT NOT NULL DEFAULT 'balanced',
    tutor_examples INTEGER NOT NULL DEFAULT 1,
    tutor_follow_up_questions INTEGER NOT NULL DEFAULT 1,
    theme TEXT NOT NULL DEFAULT 'dark',
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

connection.commit()
connection.close()

print("User settings migration completed.")