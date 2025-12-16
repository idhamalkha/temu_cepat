from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from urllib.parse import urlparse, urlunparse

database_url = os.getenv("DATABASE_URL")

# Clean up the DATABASE_URL for SQLAlchemy async
if database_url:
    # Replace postgresql:// with postgresql+asyncpg://
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Remove query parameters that asyncpg doesn't support
    parsed = urlparse(database_url)
    # Rebuild URL without query string
    database_url = urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        '',  # Remove query string
        parsed.fragment
    ))
else:
    database_url = "postgresql+asyncpg://user:password@host:port/dbname"

engine = create_async_engine(database_url, echo=True)
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_async_session():
    async with async_session_maker() as session:
        yield session
