"""
Laporan controller: FastAPI endpoint handlers for laporan operations
"""
from fastapi import HTTPException, Cookie, Response
import os
from typing import Optional, List
from db.connection import Database
from models.laporan import LaporanCreate, LaporanOut, LaporanDetail
from repositories import laporan_repo, notifikasi_repo


async def create_laporan_handler(
    laporan: LaporanCreate, response: Response, db: Database, 
    laporan_token: Optional[str] = Cookie(None)
) -> LaporanOut:
    """
    POST /laporan
    Create a new laporan and return token_cookie (sets HttpOnly cookie).
    If user already has a token from previous laporan, reuse it.
    """
    row = await laporan_repo.create_laporan(
        db=db,
        nama_pelapor=laporan.nama_pelapor,
        kontak_pelapor=laporan.kontak_pelapor,
        email_pelapor=laporan.email_pelapor,
        judul_laporan=laporan.judul_laporan,
        deskripsi=laporan.deskripsi,
        id_kota=getattr(laporan, 'id_kota', None),
        tanggal_hilang=laporan.tanggal_hilang,  # Pass date object as-is
        lokasi_hilang=getattr(laporan, 'lokasi_hilang', None),
        latitude=getattr(laporan, 'latitude', None),
        longitude=getattr(laporan, 'longitude', None),
        id_kategori=laporan.id_kategori,
        foto_url=laporan.foto_url,
        token_cookie=laporan_token,  # Pass existing token if available
    )

    if not row:
        raise HTTPException(status_code=500, detail="Failed to create laporan")

    # Create admin notification
    await notifikasi_repo.create_notifikasi(
        db=db,
        id_laporan=row[0],
        pesan=f"Laporan baru: {row[3]}",
    )

    # Set HttpOnly persistent cookie for reporter so it survives browser restarts.
    # Use environment variable `USE_SECURE_COOKIE=true` when running over HTTPS in production.
    token = row[1]
    max_age = 60 * 60 * 24 * 30  # 30 days
    secure_flag = os.getenv('USE_SECURE_COOKIE', 'false').lower() == 'true'
    response.set_cookie(
        key="laporan_token",
        value=str(token),
        httponly=True,
        max_age=max_age,
        expires=max_age,
        samesite='lax',
        secure=secure_flag,
        path='/'
    )

    return LaporanOut(
        id_laporan=row[0],
        token_cookie=str(row[1]),
        nama_pelapor=row[2],
        judul_laporan=row[3],
        status=row[4],
    )


async def get_my_laporan_handler(
    laporan_token: Optional[str] = Cookie(None), db: Database = None
) -> List[LaporanDetail]:
    """
    GET /laporan/mine
    Retrieve laporan for the current reporter (via cookie token).
    If no token or no laporan found, return empty list with 200 status.
    """
    if not laporan_token:
        # No token = no reports for this user (anonymous user without a session)
        return []

    rows = await laporan_repo.get_laporan_by_token(db=db, token_cookie=laporan_token)
    # Repository SELECT columns now:
    # 0:id_laporan,1:nama_pelapor,2:judul_laporan,3:kontak_pelapor,
    # 4:email_pelapor,5:deskripsi,6:tanggal_hilang,7:lokasi_hilang,8:latitude,9:longitude,
    # 10:id_kategori,11:foto_url,12:status,13:created_at,
    # 14:id_kota,15:nama_kota,16:id_provinsi,17:nama_provinsi,18:nama_kategori
    return [
        LaporanDetail(
            id_laporan=r[0],
            nama_pelapor=r[1],
            judul_laporan=r[2],
            deskripsi=r[5],
            status=r[12],
            created_at=str(r[13]) if r[13] else None,
            nama_barang=r[2],
            kategori=r[18],
            kategori_nama=r[18],
            lokasi=(r[7] or (f"{r[15]}, {r[17]}" if r[15] and r[17] else (r[15] or None))),
            lokasi_hilang=r[7],
            tanggal_hilang=str(r[6]) if r[6] else None,
            foto_url=r[11]
        )
        for r in rows
    ]


async def mark_found_handler(
    id_laporan: int, laporan_token: Optional[str] = Cookie(None), db: Database = None
) -> dict:
    """
    PATCH /laporan/{id_laporan}/found
    Mark a laporan as 'Selesai' (found) by the reporter.
    """
    if not laporan_token:
        raise HTTPException(status_code=401, detail="Unauthorized - missing laporan_token cookie")

    row = await laporan_repo.mark_laporan_found(
        db=db, id_laporan=id_laporan, token_cookie=laporan_token
    )
    if not row:
        raise HTTPException(status_code=404, detail="Laporan not found or unauthorized")

    return {"id_laporan": row[0], "status": row[1]}


async def delete_laporan_handler(
    id_laporan: int, admin: Optional[bool] = False, db: Database = None
) -> dict:
    """
    DELETE /laporan/{id_laporan}
    Mark a laporan as 'Dihapus' (deleted by admin).
    Note: admin parameter is temporary; integrate proper auth.
    """
    if not admin:
        raise HTTPException(status_code=403, detail="Admin access required to delete laporan")

    row = await laporan_repo.delete_laporan(db=db, id_laporan=id_laporan)
    if not row:
        raise HTTPException(status_code=404, detail="Laporan not found")

    # Create notification
    await notifikasi_repo.create_notifikasi(
        db=db,
        id_laporan=id_laporan,
        pesan="Laporan dihapus oleh admin",
    )

    return {"id_laporan": row[0], "deleted": True}


async def get_laporan_by_id_handler(
    id_laporan: int,
    db: Database = None
) -> LaporanDetail:
    """
    GET /laporan/{id_laporan}
    Get a single laporan by ID with full details.
    """
    row = await laporan_repo.get_laporan_by_id(db=db, id_laporan=id_laporan)
    
    if not row:
        raise HTTPException(status_code=404, detail="Laporan not found")
    
    # Same column mapping as list_laporan_handler
    return LaporanDetail(
        id_laporan=row[0],
        nama_pelapor=row[1],
        judul_laporan=row[2],
        kontak_pelapor=row[3],
        email_pelapor=row[4],
        nama_barang=row[2],
        deskripsi=row[5],
        lokasi=(f"{row[16]}, {row[18]}" if row[16] and row[18] else (row[16] or None)),
        lokasi_hilang=row[7],
        tanggal_hilang=str(row[6]) if row[6] else None,
        kategori_nama=row[12],
        foto_url=row[11],
        status=row[13],
        created_at=str(row[14]) if row[14] else None,
    )


async def logout_handler(response: Response) -> dict:
    """
    POST /laporan/logout
    Clear the reporter's cookie (HttpOnly) to log out the anonymous reporter.
    """
    # delete_cookie will instruct the browser to remove the cookie
    response.delete_cookie(key="laporan_token", path='/')
    return {"logged_out": True}


async def list_laporan_handler(
    status: Optional[str] = None,
    id_kategori: Optional[int] = None,
    id_provinsi: Optional[int] = None,
    id_kota: Optional[int] = None,
    limit: int = 100,
    db: Database = None
) -> List[LaporanDetail]:
    """
    GET /laporan
    List laporan (admin view) with optional filters.
    """
    rows = await laporan_repo.list_laporan(
        db=db,
        status=status,
        id_kategori=id_kategori,
        id_provinsi=id_provinsi,
        id_kota=id_kota,
        limit=limit
    )
    # Repository returns columns in this order:
    # 0:id_laporan, 1:nama_pelapor, 2:judul_laporan, 3:kontak_pelapor, 4:email_pelapor, 
    # 5:deskripsi, 6:tanggal_hilang, 7:lokasi_hilang, 8:latitude, 9:longitude,
    # 10:id_kategori, 11:foto_url, 12:nama_kategori, 13:status, 14:created_at,
    # 15:id_kota, 16:nama_kota, 17:id_provinsi, 18:nama_provinsi
    return [
        LaporanDetail(
            id_laporan=r[0],
            nama_pelapor=r[1],
            judul_laporan=r[2],
            kontak_pelapor=r[3],
            email_pelapor=r[4],
            nama_barang=r[2],
            deskripsi=r[5],
            lokasi=(f"{r[16]}, {r[18]}" if r[16] and r[18] else (r[16] or None)),
            lokasi_hilang=r[7],
            tanggal_hilang=str(r[6]) if r[6] else None,
            kategori_nama=r[12],
            foto_url=r[11],
            status=r[13],
            created_at=str(r[14]) if r[14] else None,
        )
        for r in rows
    ]
