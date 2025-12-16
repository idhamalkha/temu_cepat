from sqlalchemy import Column, Integer, String
from db.base_class import Base

class Wilayah(Base):
    __tablename__ = "wilayah"
    id_kota = Column(Integer, primary_key=True, index=True)
    nama_kota = Column(String(100), nullable=False)
    id_provinsi = Column(Integer, nullable=False)
    nama_provinsi = Column(String(100), nullable=False)
