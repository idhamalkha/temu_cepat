from pydantic import BaseModel
from typing import Optional


class NotifikasiOut(BaseModel):
    """Response model for notifikasi"""
    id_notifikasi: int
    id_laporan: Optional[int]
    pesan: str
    status_baca: bool
    created_at: Optional[str]
