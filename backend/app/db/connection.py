import os
import asyncpg
from typing import Any, Optional, Sequence
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Database:
    def __init__(self):
        # Load DATABASE_URL from environment (set in .env file)
        self.dsn = os.environ.get("DATABASE_URL")
        self.pool: Optional[asyncpg.pool.Pool] = None

    async def connect(self):
        if not self.dsn:
            raise RuntimeError("DATABASE_URL environment variable not set")
        self.pool = await asyncpg.create_pool(dsn=self.dsn, min_size=1, max_size=5)

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    async def fetch(self, query: str, *args) -> Sequence[asyncpg.Record]:
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query: str, *args) -> Optional[asyncpg.Record]:
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)

    async def fetchval(self, query: str, *args) -> Any:
        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)

    async def execute(self, query: str, *args) -> str:
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
