from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.wilayah import Wilayah

async def get_all_provinsi(session: AsyncSession):
    # Return Wilayah objects grouped by id_provinsi, nama_provinsi
    result = await session.execute(select(Wilayah.id_provinsi, Wilayah.nama_provinsi).distinct())
    # Use namedtuple-like access for compatibility with improved endpoint
    return result.all()

async def get_kota_by_provinsi(session: AsyncSession, id_provinsi: int):
    result = await session.execute(select(Wilayah).where(Wilayah.id_provinsi == id_provinsi))
    return result.scalars().all()
