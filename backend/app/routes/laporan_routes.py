"""
Laporan routes: endpoint definitions for lost item reports
"""
from fastapi import APIRouter, Response, Cookie, Depends, UploadFile, File
from typing import Optional
import os
import logging

from db.dependencies import get_db
from db.connection import Database
from models.laporan import LaporanCreate, LaporanOut
from controllers import laporan_controller
from utils.github_storage import GitHubStorage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/laporan", tags=["laporan"])


@router.post("", response_model=LaporanOut)
async def create_laporan(
    laporan: LaporanCreate,
    response: Response,
    db: Database = Depends(get_db),
    laporan_token: Optional[str] = Cookie(None)
):
    """Create a new laporan (lost item report)"""
    return await laporan_controller.create_laporan_handler(
        laporan=laporan, response=response, db=db, laporan_token=laporan_token
    )


@router.get("/mine")
async def get_my_laporan(
    laporan_token: Optional[str] = Cookie(None),
    db: Database = Depends(get_db)
):
    """Get laporan for the current reporter (via cookie)"""
    return await laporan_controller.get_my_laporan_handler(
        laporan_token=laporan_token, db=db
    )


@router.get("/{id_laporan}")
async def get_laporan_detail(
    id_laporan: int,
    db: Database = Depends(get_db)
):
    """Get a single laporan by ID with full details"""
    return await laporan_controller.get_laporan_by_id_handler(
        id_laporan=id_laporan, db=db
    )


@router.patch("/{id_laporan}/found")
async def mark_found(
    id_laporan: int,
    laporan_token: Optional[str] = Cookie(None),
    db: Database = Depends(get_db)
):
    """Mark a laporan as found ('Selesai')"""
    return await laporan_controller.mark_found_handler(
        id_laporan=id_laporan, laporan_token=laporan_token, db=db
    )


@router.delete("/{id_laporan}")
async def delete_laporan(
    id_laporan: int,
    admin: Optional[bool] = False,
    db: Database = Depends(get_db)
):
    """Delete a laporan (admin only)"""
    return await laporan_controller.delete_laporan_handler(
        id_laporan=id_laporan, admin=admin, db=db
    )


@router.get("")
async def list_all_laporan(
    status: Optional[str] = None,
    id_kategori: Optional[int] = None,
    id_provinsi: Optional[int] = None,
    id_kota: Optional[int] = None,
    limit: int = 100,
    db: Database = Depends(get_db)
):
    """List laporan with optional filters (kategori, provinsi, kota, status)"""
    return await laporan_controller.list_laporan_handler(
        status=status,
        id_kategori=id_kategori,
        id_provinsi=id_provinsi,
        id_kota=id_kota,
        limit=limit,
        db=db
    )


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload image to GitHub storage"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            return {
                "success": False,
                "message": "Hanya file gambar yang diizinkan"
            }

        # Read content and validate size (5MB max)
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            return {
                "success": False,
                "message": "Ukuran file tidak boleh lebih dari 5MB"
            }

        # Upload to GitHub (pass raw bytes to avoid temp files)
        github_storage = GitHubStorage()
        url = github_storage.upload_file(content, filename=file.filename)

        return {
            "success": True,
            "url": url,
            "message": "File berhasil diupload"
        }

    except Exception as e:
        logger.exception(f"Upload error: {str(e)}")
        return {
            "success": False,
            "message": f"Gagal upload file: {str(e)}"
        }



@router.post("/logout")
async def logout(response: Response):
    """Clear laporan_token cookie (logout reporter)."""
    return await laporan_controller.logout_handler(response=response)
