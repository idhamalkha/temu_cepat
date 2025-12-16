"""
Laporan repository: database query logic for laporan operations
"""
from typing import Optional, Sequence
import asyncpg
from uuid import uuid4
from db.connection import Database


async def create_laporan(
    db: Database,
    nama_pelapor: str,
    kontak_pelapor: Optional[str],
    email_pelapor: Optional[str],
    judul_laporan: str,
    deskripsi: Optional[str],
    id_kota: Optional[int],
    tanggal_hilang: Optional[str],
    lokasi_hilang: Optional[str],
    latitude: Optional[float],
    longitude: Optional[float],
    id_kategori: Optional[int],
    foto_url: Optional[str],
    token_cookie: Optional[str] = None,
) -> asyncpg.Record:
    """
    Create a new laporan and return the created row.
    If token_cookie is provided, use it (for multiple laporan per reporter).
    Otherwise, PostgreSQL generates a new UUID.
    """
    # The `laporan` table stores `id_kota` (reference to `wilayah`) instead of a
    # free-text `lokasi_hilang` column in the current schema. To be compatible
    # with the DB schema, insert `id_kota` (use NULL when not provided) and
    # keep `tanggal_hilang` in its column.
    
    # Generate new token if not provided
    if not token_cookie:
        token_cookie = str(uuid4())
    
    query = """
    INSERT INTO laporan (nama_pelapor, kontak_pelapor, email_pelapor, judul_laporan, 
                         deskripsi, tanggal_hilang, lokasi_hilang, latitude, longitude, id_kategori, foto_url, id_kota, token_cookie)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id_laporan, token_cookie, nama_pelapor, judul_laporan, status
    """
    # If caller provided a text `lokasi_hilang` (string), we don't have an
    # `id_kota` mapping here, so pass None for id_kota. If you want to persist
    # the raw text location, add a `lokasi_hilang` column to the DB schema.
    return await db.fetchrow(
        query,
        nama_pelapor,
        kontak_pelapor,
        email_pelapor,
        judul_laporan,
        deskripsi,
        tanggal_hilang,
        lokasi_hilang,
        latitude,
        longitude,
        id_kategori,
        foto_url,
        id_kota,
        token_cookie,
    )


async def get_laporan_by_token(
    db: Database, token_cookie: str
) -> Sequence[asyncpg.Record]:
    """
    Retrieve all laporan for a specific reporter (by token_cookie).
    """
    query = """
    SELECT 
        l.id_laporan, l.nama_pelapor, l.judul_laporan, l.kontak_pelapor, 
        l.email_pelapor, l.deskripsi, l.tanggal_hilang, l.lokasi_hilang, l.latitude, l.longitude,
        l.id_kategori, l.foto_url, l.status, l.created_at,
        w.id_kota, w.nama_kota, w.id_provinsi, w.nama_provinsi, k.nama_kategori
    FROM laporan l
    LEFT JOIN wilayah w ON l.id_kota = w.id_kota
    LEFT JOIN kategori k ON l.id_kategori = k.id_kategori
    WHERE token_cookie = $1
    ORDER BY l.created_at DESC
    """
    return await db.fetch(query, token_cookie)


async def mark_laporan_found(
    db: Database, id_laporan: int, token_cookie: str
) -> Optional[asyncpg.Record]:
    """
    Mark a laporan as 'Selesai' (found) if token matches.
    Returns the updated row or None if not found/unauthorized.
    """
    query = """
    UPDATE laporan 
    SET status = 'Selesai' 
    WHERE id_laporan = $1 AND token_cookie = $2 
    RETURNING id_laporan, status
    """
    return await db.fetchrow(query, id_laporan, token_cookie)


async def delete_laporan(
    db: Database, id_laporan: int
) -> Optional[asyncpg.Record]:
    """
    Mark a laporan as 'Dihapus' (deleted by admin).
    Returns the updated row or None if not found.
    """
    query = """
    UPDATE laporan 
    SET status = 'Dihapus' 
    WHERE id_laporan = $1 
    RETURNING id_laporan
    """
    return await db.fetchrow(query, id_laporan)


async def get_laporan_by_id(
    db: Database,
    id_laporan: int
) -> asyncpg.Record:
    """
    Get a single laporan by ID with full details including kategori and wilayah info.
    """
    query = """
    SELECT 
        l.id_laporan, l.nama_pelapor, l.judul_laporan, l.kontak_pelapor, 
        l.email_pelapor, l.deskripsi, l.tanggal_hilang, l.lokasi_hilang, l.latitude, l.longitude,
        l.id_kategori, l.foto_url, k.nama_kategori, l.status, l.created_at,
        w.id_kota, w.nama_kota, w.id_provinsi, w.nama_provinsi
    FROM laporan l
    LEFT JOIN kategori k ON l.id_kategori = k.id_kategori
    LEFT JOIN wilayah w ON l.id_kota = w.id_kota
    WHERE l.id_laporan = $1
    """
    return await db.fetchrow(query, id_laporan)


async def list_laporan(
    db: Database, 
    status: Optional[str] = None, 
    id_kategori: Optional[int] = None,
    id_provinsi: Optional[int] = None,
    id_kota: Optional[int] = None,
    limit: int = 100
) -> Sequence[asyncpg.Record]:
    """
    List laporan (admin view) with full details including kategori.
    Can filter by status, kategori, provinsi, or kota if provided.
    """
    query = """
    SELECT 
        l.id_laporan, l.nama_pelapor, l.judul_laporan, l.kontak_pelapor, 
        l.email_pelapor, l.deskripsi, l.tanggal_hilang, l.lokasi_hilang, l.latitude, l.longitude,
        l.id_kategori, l.foto_url, k.nama_kategori, l.status, l.created_at,
        w.id_kota, w.nama_kota, w.id_provinsi, w.nama_provinsi
    FROM laporan l
    LEFT JOIN kategori k ON l.id_kategori = k.id_kategori
    LEFT JOIN wilayah w ON l.id_kota = w.id_kota
    WHERE 1=1
    """
    
    params = []
    param_count = 1
    
    if status:
        query += f" AND l.status = ${param_count}"
        params.append(status)
        param_count += 1
    
    if id_kategori:
        query += f" AND l.id_kategori = ${param_count}"
        params.append(id_kategori)
        param_count += 1
    
    if id_provinsi:
        query += f" AND w.id_provinsi = ${param_count}"
        params.append(id_provinsi)
        param_count += 1
    
    if id_kota:
        query += f" AND w.id_kota = ${param_count}"
        params.append(id_kota)
        param_count += 1
    
    query += f" ORDER BY l.created_at DESC LIMIT ${param_count}"
    params.append(limit)
    
    return await db.fetch(query, *params)


async def cleanup_old_laporan(db: Database, days: int = 30) -> int:
    """
    Mark laporan older than `days` (based on `tanggal_hilang`) as 'Dihapus'.
    Returns the number of rows affected.
    This helps automatically hide/remove reports that are older than the allowed window.
    """
    # Use a fixed-interval SQL expression for portability: 30 days -> INTERVAL '30 days'
    query = f"""
    UPDATE laporan
    SET status = 'Dihapus'
    WHERE status = 'Aktif'
      AND tanggal_hilang IS NOT NULL
      AND tanggal_hilang <= CURRENT_DATE - INTERVAL '{days} days'
    RETURNING id_laporan
    """
    rows = await db.fetch(query)
    affected_count = len(rows) if rows is not None else 0
    return affected_count


async def record_cleanup_log(db: Database, affected: int, days: int = 30, triggered_by: str = None):
    """
    Insert a record into cleanup_logs to track cleanup runs.
    """
    query = """
    INSERT INTO cleanup_logs (triggered_by, days_window, affected_count)
    VALUES ($1, $2, $3)
    RETURNING id_log
    """
    row = await db.fetchrow(query, triggered_by, days, affected)
    return row
