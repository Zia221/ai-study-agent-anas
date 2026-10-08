import sqlite3

connection = sqlite3.connect("study_agent.db")
cursor = connection.cursor()

columns = cursor.execute(
    "PRAGMA table_info(users)"
).fetchall()

column_names = [column[1] for column in columns]

if "google_id" not in column_names:
    cursor.execute(
        "ALTER TABLE users ADD COLUMN google_id TEXT"
    )

    print("Added google_id column.")

else:
    print("google_id already exists.")

connection.commit()
connection.close()

print("Google authentication migration completed.")