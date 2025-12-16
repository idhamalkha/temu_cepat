# Laporan Barang Hilang - Backend

This is a small FastAPI backend that implements laporan (lost item reports) and admin notifications with cookie-based reporter authentication (token_cookie UUID stored in a cookie).

Getting started
1. Create a Python virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate   # or on Windows: .env\Scripts\activate
pip install -r requirements.txt
```

2. Set DATABASE_URL environment variable. Example (Neon/Postgres):

```
export DATABASE_URL="postgresql://neondb_owner:...@.../neondb?sslmode=require&channel_binding=require"
```

3. Apply the SQL schema:

```python
python -c "import asyncpg, os, asyncio; async def run(): conn = await asyncpg.connect(dsn=os.environ['DATABASE_URL']); sql=open('sql/schema.sql').read(); await conn.execute(sql); await conn.close(); asyncio.run(run())"
```

Or use psql / any migration tool to run `sql/schema.sql`.

4. Run the app:

```bash
uvicorn main:app --reload --port 8000
```

Endpoints
- POST /laporan -> create a laporan, returns id and token_cookie and sets cookie `laporan_token` (HttpOnly)
- GET /laporan/mine -> read laporan for reporter (cookie required)
- PATCH /laporan/{id}/found -> mark your laporan as 'Selesai' (cookie required)
- DELETE /laporan/{id}?admin=true -> mark laporan as 'Dihapus' (temporary admin flag)
- GET /laporan -> list laporan (admin)
- GET /notifikasi -> list notifications
- PATCH /notifikasi/{id}/read -> mark notification read

Notes
- This initial implementation uses a simple admin query parameter as a stand-in for admin auth. Integrate proper authentication for production.
- The SQL uses `gen_random_uuid()` from the `pgcrypto` extension; ensure your PostgreSQL provider allows creating extensions (Neon supports this in most cases). If unavailable, change to uuid_generate_v4() and enable the `uuid-ossp` extension.
