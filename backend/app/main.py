from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add app directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import asyncio
from db.connection import Database
from db.dependencies import set_db
from routes import laporan_routes, notifikasi_routes, wilayah, admin_routes, kategori_routes
from repositories import laporan_repo

# Initialize app and database
app = FastAPI(
    title="Laporan Barang Hilang API",
    description="API for managing lost item reports with admin notifications",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Database()
set_db(db)  # Make db available globally via dependencies


@app.on_event("startup")
async def startup():
    """Initialize database connection on startup"""
    await db.connect()
    # Run an initial cleanup on startup and schedule daily cleanups
    try:

        # run one cleanup immediately and record it
        affected = await laporan_repo.cleanup_old_laporan(db)
        if affected:
            print(f"[cleanup] Marked {affected} laporan(s) as 'Dihapus' on startup")
        try:
            await laporan_repo.record_cleanup_log(db, affected, days=30, triggered_by='startup')
        except Exception:
            # If logging fails, continue (don't block startup)
            print("[cleanup] Failed to record cleanup log on startup")

        async def _cleanup_loop():
            while True:
                try:
                    affected = await laporan_repo.cleanup_old_laporan(db)
                    if affected:
                        print(f"[cleanup] Marked {affected} laporan(s) as 'Dihapus'")
                    try:
                        await laporan_repo.record_cleanup_log(db, affected, days=30, triggered_by='scheduled')
                    except Exception:
                        print("[cleanup] Failed to record scheduled cleanup log")
                except Exception as e:
                    print(f"[cleanup] Error during cleanup: {e}")
                # Sleep 24 hours
                await asyncio.sleep(24 * 60 * 60)

        # Schedule background task (doesn't block startup)
        asyncio.create_task(_cleanup_loop())
    except Exception as e:
        print(f"[startup] Cleanup scheduling failed: {e}")


@app.on_event("shutdown")
async def shutdown():
    """Close database connection on shutdown"""
    await db.disconnect()


# Register routers
app.include_router(laporan_routes.router)
app.include_router(notifikasi_routes.router)
app.include_router(wilayah.router)
app.include_router(admin_routes.router)
app.include_router(kategori_routes.router)


@app.get("/")
async def root():
    """API health check"""
    return {"message": "Laporan Barang Hilang API is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
