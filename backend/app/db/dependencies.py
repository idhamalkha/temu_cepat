from typing import Optional
from db.connection import Database

# Global reference to DB instance
db_instance: Optional[Database] = None

def set_db(db: Database):
    """
    Dipanggil sekali dari main.py untuk menyimpan instance database,
    agar bisa diakses router dan repository via dependency injection.
    """
    global db_instance
    db_instance = db


def get_db() -> Database:
    """
    Dependency untuk FastAPI.
    Router/repository akan memanggil ini untuk dapat akses ke database.
    """
    if db_instance is None:
        raise RuntimeError("Database belum diinisialisasi. Pastikan set_db() dipanggil pada startup.")
    return db_instance
