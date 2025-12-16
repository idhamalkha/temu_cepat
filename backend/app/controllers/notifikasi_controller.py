"""
Notifikasi controller: FastAPI endpoint handlers for notification operations
"""
from fastapi import HTTPException
from typing import Optional, List
from db.connection import Database
from models.notifikasi import NotifikasiOut
from repositories import notifikasi_repo


async def list_notifikasi_handler(
    unread_only: Optional[bool] = False, db: Database = None
) -> List[NotifikasiOut]:
    """
    GET /notifikasi
    List notifications for admin.
    """
    rows = await notifikasi_repo.list_notifikasi(db=db, unread_only=unread_only)
    return [
        NotifikasiOut(
            id_notifikasi=r[0],
            id_laporan=r[1],
            pesan=r[2],
            status_baca=r[3],
            created_at=str(r[4]) if r[4] else None,
        )
        for r in rows
    ]


async def mark_notif_read_handler(
    id_notifikasi: int, db: Database = None
) -> dict:
    """
    PATCH /notifikasi/{id_notifikasi}/read
    Mark a notification as read.
    """
    row = await notifikasi_repo.mark_notifikasi_read(db=db, id_notifikasi=id_notifikasi)
    if not row:
        raise HTTPException(status_code=404, detail="Notifikasi not found")

    return {"id_notifikasi": row[0], "status_baca": row[1]}
