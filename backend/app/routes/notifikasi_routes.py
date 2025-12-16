"""
Notifikasi routes: endpoint definitions for notifications
"""
from fastapi import APIRouter, Depends
from typing import Optional

from db.dependencies import get_db
from db.connection import Database
from controllers import notifikasi_controller

router = APIRouter(prefix="/notifikasi", tags=["notifikasi"])


@router.get("")
async def list_notifikasi(
    unread_only: Optional[bool] = False,
    db: Database = Depends(get_db)
):
    """List notifications for admin"""
    return await notifikasi_controller.list_notifikasi_handler(
        unread_only=unread_only, db=db
    )


@router.patch("/{id_notifikasi}/read")
async def mark_notif_read(
    id_notifikasi: int,
    db: Database = Depends(get_db)
):
    """Mark a notification as read"""
    return await notifikasi_controller.mark_notif_read_handler(
        id_notifikasi=id_notifikasi, db=db
    )
