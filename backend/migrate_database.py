import sqlite3

connection = sqlite3.connect("study_agent.db")

cursor = connection.cursor()

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'processing',
        uploaded_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """
)

print("Documents table created or already exists.")

columns = cursor.execute(
    "PRAGMA table_info(documents)"
).fetchall()

column_names = [column[1] for column in columns]

if "file_path" not in column_names:
    cursor.execute(
        "ALTER TABLE documents ADD COLUMN file_path TEXT"
    )

    print("Added file_path column to documents.")

else:
    print("file_path column already exists.")

connection.commit()
connection.close()

print("Database migration completed.")