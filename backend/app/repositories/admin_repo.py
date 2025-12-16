"""
Admin repository: database query logic for admin operations
"""
from typing import Optional
import asyncpg
from db.connection import Database


async def get_admin_by_username(
    db: Database, username: str
) -> Optional[asyncpg.Record]:
    """
    Retrieve admin by username.
    """
    query = """
    SELECT id_admin, nama_admin, username, password_hash
    FROM admin
    WHERE username = $1
    """
    return await db.fetchrow(query, username)


async def create_admin(
    db: Database,
    nama_admin: str,
    username: str,
    password_hash: str,
) -> asyncpg.Record:
    """
    Create a new admin user.
    """
    query = """
    INSERT INTO admin (nama_admin, username, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id_admin, nama_admin, username
    """
    return await db.fetchrow(query, nama_admin, username, password_hash)


async def get_admin_by_id(
    db: Database, admin_id: int
) -> Optional[asyncpg.Record]:
    """
    Retrieve admin by id.
    """
    query = """
    SELECT id_admin, nama_admin, username
    FROM admin
    WHERE id_admin = $1
    """
    return await db.fetchrow(query, admin_id)
