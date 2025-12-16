from pydantic import BaseModel, Field
from typing import Optional


class AdminLogin(BaseModel):
    """Request model for admin login"""
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)


class AdminOut(BaseModel):
    """Response model for admin"""
    id_admin: int
    nama_admin: str
    username: str


class AdminLoginResponse(BaseModel):
    """Response model for successful login"""
    success: bool
    token: str
    admin: AdminOut
    message: str
