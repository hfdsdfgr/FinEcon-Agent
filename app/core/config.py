import os
from pathlib import Path

DB_PATH = Path(os.getenv("FINECON_DB_PATH", "data/finecon.sqlite3"))
LOG_LEVEL = os.getenv("FINECON_LOG_LEVEL", "INFO")
