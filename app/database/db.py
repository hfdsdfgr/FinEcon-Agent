from contextlib import contextmanager
import json
import sqlite3
from app.core.exceptions import FinEconError


class Database:
    """Small SQLite JSON store. Connections are local to each operation."""
    def __init__(self, path):
        self.path = str(path)

    def initialize(self):
        from pathlib import Path
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        with self.connect() as conn:
            conn.execute("CREATE TABLE IF NOT EXISTS tasks (task_id TEXT PRIMARY KEY, state TEXT NOT NULL, report TEXT)")

    @contextmanager
    def connect(self):
        try:
            conn = sqlite3.connect(self.path, timeout=10)
            try:
                with conn:
                    yield conn
            finally:
                conn.close()
        except sqlite3.Error as exc:
            raise FinEconError("Database unavailable", "storage_error", 500) from exc

    def save(self, state, report=None):
        try:
            with self.connect() as conn:
                conn.execute("INSERT INTO tasks(task_id,state,report) VALUES(?,?,?) ON CONFLICT(task_id) DO UPDATE SET state=excluded.state, report=COALESCE(excluded.report,tasks.report)",
                             (state.task_id, state.model_dump_json(), report.model_dump_json() if report else None))
        except sqlite3.Error as exc:
            raise FinEconError("Unable to persist task", "storage_error", 500) from exc

    def get(self, task_id):
        try:
            with self.connect() as conn:
                row = conn.execute("SELECT state, report FROM tasks WHERE task_id=?", (task_id,)).fetchone()
        except sqlite3.Error as exc:
            raise FinEconError("Unable to read task", "storage_error", 500) from exc
        if row is None:
            raise FinEconError("Task not found", "not_found", 404)
        return json.loads(row[0]), json.loads(row[1]) if row[1] else None
