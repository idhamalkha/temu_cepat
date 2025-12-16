"""
Admin routes for authentication and admin operations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta
import jwt
import bcrypt
from typing import Optional
from pydantic import BaseModel

from db.connection import Database
from db.dependencies import get_db
from models.admin import AdminLogin, AdminLoginResponse, AdminOut
from repositories.admin_repo import get_admin_by_username, get_admin_by_id, create_admin
from repositories import laporan_repo

router = APIRouter(prefix="/admin", tags=["admin"])

# JWT Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"  # TODO: Move to .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    try:
        # hashed_password from DB is a string like "$2b$12$..."
        # bcrypt.checkpw expects: checkpw(password: bytes, hashed_password: bytes)
        # We need to encode the hash string to bytes for bcrypt to verify it
        hashed_bytes = hashed_password.encode('utf-8') if isinstance(hashed_password, str) else hashed_password
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_bytes)
    except (ValueError, AttributeError, TypeError) as e:
        print(f"Password verification error: {e}")
        return False


def create_access_token(admin_id: int, username: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode = {
        "admin_id": admin_id,
        "username": username,
        "exp": expire,
        "iat": datetime.utcnow()
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


@router.post("/login", response_model=AdminLoginResponse)
async def login(
    credentials: AdminLogin,
    db: Database = Depends(get_db)
):
    """
    Admin login endpoint.
    Returns JWT token if credentials are valid.
    """
    # Get admin from database
    admin = await get_admin_by_username(db, credentials.username)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    
    # Verify password
    if not verify_password(credentials.password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    
    # Create token
    token = create_access_token(admin["id_admin"], admin["username"])
    
    return AdminLoginResponse(
        success=True,
        token=token,
        admin=AdminOut(
            id_admin=admin["id_admin"],
            nama_admin=admin["nama_admin"],
            username=admin["username"]
        ),
        message="Login successful"
    )


@router.post("/verify")
async def verify_admin_token(token: str):
    """
    Verify if a JWT token is valid.
    """
    try:
        payload = verify_token(token)
        return {
            "valid": True,
            "admin_id": payload.get("admin_id"),
            "username": payload.get("username")
        }
    except HTTPException:
        raise


@router.get("/profile/{admin_id}")
async def get_admin_profile(
    admin_id: int,
    db: Database = Depends(get_db)
):
    """
    Get admin profile by ID.
    """
    admin = await get_admin_by_id(db, admin_id)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found",
        )
    
    return AdminOut(
        id_admin=admin["id_admin"],
        nama_admin=admin["nama_admin"],
        username=admin["username"]
    )


@router.post("/create", tags=["admin-internal"])
async def create_new_admin(
    nama_admin: str,
    username: str,
    password: str,
    db: Database = Depends(get_db)
):
    """
    Create a new admin user.
    
    **⚠️ INTERNAL USE ONLY - Use via Swagger UI (/docs) only**
    
    Parameters:
    - nama_admin: Full name of admin
    - username: Username for login
    - password: Plain text password (will be hashed with bcrypt)
    
    Returns:
    - Admin details without password hash
    """
    # Check if username already exists
    existing = await get_admin_by_username(db, username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Hash the password
    hashed_password = hash_password(password)
    
    # Create new admin
    new_admin = await create_admin(db, nama_admin, username, hashed_password)
    
    return {
        "success": True,
        "admin": AdminOut(
            id_admin=new_admin["id_admin"],
            nama_admin=new_admin["nama_admin"],
            username=new_admin["username"]
        ),
        "message": f"Admin '{username}' created successfully"
    }


@router.post("/cleanup")
async def trigger_cleanup(
    token: str,
    days: int = 30,
    db: Database = Depends(get_db)
):
    """
    Admin endpoint to trigger cleanup manually.
    Provide admin JWT `token` (from /admin/login). Optionally specify `days` window (default 30).
    Returns the number of affected laporan and records a cleanup log.
    """
    # Verify token and admin privileges
    try:
        payload = verify_token(token)
    except HTTPException:
        raise

    admin_username = payload.get("username")

    # Run cleanup
    affected = await laporan_repo.cleanup_old_laporan(db, days=days)
    # Record cleanup log
    try:
        await laporan_repo.record_cleanup_log(db, affected, days=days, triggered_by=admin_username)
    except Exception:
        # don't fail the endpoint if logging fails, but notify
        return {"success": True, "affected": affected, "logged": False}

    return {"success": True, "affected": affected, "logged": True}
