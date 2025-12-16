from fastapi import APIRouter, Depends
from db.dependencies import get_db
from db.connection import Database
from typing import List, Dict

router = APIRouter(prefix="/kategori", tags=["kategori"])


@router.get("")
async def get_all_kategori(db: Database = Depends(get_db)):
    """Get all product categories"""
    try:
        query = "SELECT id_kategori, nama_kategori FROM kategori ORDER BY id_kategori ASC"
        rows = await db.fetch(query)
        
        if not rows:
            return []
        
        return [
            {
                "id_kategori": row["id_kategori"],
                "nama_kategori": row["nama_kategori"]
            }
            for row in rows
        ]
    except Exception as e:
        return {"error": str(e)}


@router.get("/{id_kategori}")
async def get_kategori_by_id(id_kategori: int, db: Database = Depends(get_db)):
    """Get specific category by ID"""
    try:
        query = "SELECT id_kategori, nama_kategori FROM kategori WHERE id_kategori = $1"
        row = await db.fetchrow(query, id_kategori)
        
        if not row:
            return {"error": "Kategori tidak ditemukan"}
        
        return {
            "id_kategori": row["id_kategori"],
            "nama_kategori": row["nama_kategori"]
        }
    except Exception as e:
        return {"error": str(e)}
