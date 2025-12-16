from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class LaporanCreate(BaseModel):
    """Request model for creating a new laporan"""
    nama_pelapor: str = Field(..., max_length=100)
    kontak_pelapor: Optional[str] = None
    email_pelapor: Optional[str] = None
    judul_laporan: str = Field(..., max_length=150)
    deskripsi: Optional[str] = None
    lokasi_hilang: Optional[str] = None
    id_kota: Optional[int] = None
    tanggal_hilang: Optional[date] = None
    id_kategori: Optional[int] = None
    foto_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class LaporanOut(BaseModel):
    """Response model for laporan"""
    id_laporan: int
    token_cookie: str
    nama_pelapor: str
    judul_laporan: str
    status: str


class LaporanDetail(BaseModel):
    """Detailed response model for laporan"""
    id_laporan: int
    nama_pelapor: str
    judul_laporan: str
    deskripsi: Optional[str]
    status: str
    created_at: Optional[str]
    nama_barang: Optional[str] = None  # Alias untuk judul_laporan
    kategori: Optional[str] = None
    kategori_nama: Optional[str] = None
    lokasi: Optional[str] = None  # Alias untuk lokasi_hilang
    lokasi_hilang: Optional[str] = None
    tanggal_hilang: Optional[str] = None
    foto_url: Optional[str] = None
    email_pelapor: Optional[str] = None
    kontak_pelapor: Optional[str] = None
