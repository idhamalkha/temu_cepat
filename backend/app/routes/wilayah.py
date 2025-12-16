from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from db.session import get_async_session
from repositories.wilayah_repository import get_all_provinsi, get_kota_by_provinsi

router = APIRouter(prefix="/wilayah", tags=["Wilayah"])

@router.get("/provinsi")
async def provinsi(session: AsyncSession = Depends(get_async_session)):
    data = await get_all_provinsi(session)
    # Remove duplicates and return sorted list
    seen = set()
    provinsi_list = []
    for p in data:
        key = (p.id_provinsi, p.nama_provinsi)
        if key not in seen:
            provinsi_list.append({"id_provinsi": p.id_provinsi, "nama_provinsi": p.nama_provinsi})
            seen.add(key)
    provinsi_list.sort(key=lambda x: x["nama_provinsi"])
    return provinsi_list

@router.get("/kota/{id_provinsi}")
async def kota(id_provinsi: int, session: AsyncSession = Depends(get_async_session)):
    data = await get_kota_by_provinsi(session, id_provinsi)
    # Return sorted list of cities for the province
    kota_list = [{"id_kota": k.id_kota, "nama_kota": k.nama_kota} for k in data]
    kota_list.sort(key=lambda x: x["nama_kota"])
    return kota_list
