"""
Notifikasi repository: database query logic for notification operations
"""
from typing import Optional, Sequence
import asyncpg
from db.connection import Database


async def create_notifikasi(
    db: Database, id_laporan: int, pesan: str
) -> Optional[asyncpg.Record]:
    """
    Create a new notification (triggered when laporan is created or updated).
    """
    query = """
    INSERT INTO notifikasi (id_laporan, pesan)
    VALUES ($1, $2)
    RETURNING id_notifikasi, id_laporan, pesan, status_baca, created_at
    """
    return await db.fetchrow(query, id_laporan, pesan)


async def list_notifikasi(
    db: Database, unread_only: bool = False
) -> Sequence[asyncpg.Record]:
    """
    List notifications for admin.
    If unread_only=True, only return unread notifications.
    """
    if unread_only:
        query = """
        SELECT id_notifikasi, id_laporan, pesan, status_baca, created_at 
        FROM notifikasi 
        WHERE status_baca = FALSE 
        ORDER BY created_at DESC
        """
        return await db.fetch(query)
    else:
        query = """
        SELECT id_notifikasi, id_laporan, pesan, status_baca, created_at 
        FROM notifikasi 
        ORDER BY created_at DESC
        """
        return await db.fetch(query)


async def mark_notifikasi_read(
    db: Database, id_notifikasi: int
) -> Optional[asyncpg.Record]:
    """
    Mark a notification as read (status_baca = TRUE).
    Returns the updated row or None if not found.
    """
    query = """
    UPDATE notifikasi 
    SET status_baca = TRUE 
    WHERE id_notifikasi = $1 
    RETURNING id_notifikasi, status_baca
    """
    return await db.fetchrow(query, id_notifikasi)
