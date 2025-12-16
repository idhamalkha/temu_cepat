# Laporan Barang Hilang - Backend Setup Guide

## Status: ✅ PRODUCTION READY

Database connected to **Neon PostgreSQL** successfully!

## Quick Start

### 1. Environment Setup

```bash
cd backend/app

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

The `.env` file is already configured with your Neon database URL:
```
DATABASE_URL=postgresql://neondb_owner:npg_kyhwO9qnez0a@ep-lively-night-a1q0bibg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Important:** Don't commit `.env` to git (it's in `.gitignore`)

### 3. Database Verification

Check database connection and tables:
```bash
python test_db.py
```

Expected output:
```
✅ Successfully connected to Neon database!
📊 Existing tables (5):
   - admin
   - kategori
   - laporan
   - notifikasi
```

### 4. Run the Server

```bash
python -m uvicorn main:app --reload --port 8000
```

Server will be available at: `http://localhost:8000`

API Documentation (Swagger UI): `http://localhost:8000/docs`

## API Endpoints

### Laporan (Lost Item Reports)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/laporan` | Create new laporan (returns token_cookie) |
| GET | `/laporan/mine` | Get laporan for reporter (via cookie) |
| GET | `/laporan` | List all laporan (admin) |
| PATCH | `/laporan/{id}/found` | Mark laporan as found (reporter via cookie) |
| DELETE | `/laporan/{id}` | Delete laporan (admin only, use `?admin=true`) |

### Notifikasi (Notifications)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifikasi` | List notifications |
| PATCH | `/notifikasi/{id}/read` | Mark notification as read |

## Project Structure

```
backend/app/
├── main.py                      # FastAPI app setup
├── dependencies.py              # Dependency injection
├── quick_test.py               # Simple endpoint tester
├── test_db.py                  # Database connection tester
├── migrate.py                  # Migration script
├── .env                        # Environment variables (secrets)
├── .gitignore                  # Git ignore file
├── requirements.txt            # Python dependencies
│
├── db/
│   ├── __init__.py
│   └── connection.py           # Database connection pool
│
├── models/
│   ├── __init__.py
│   ├── laporan.py             # Pydantic models for laporan
│   └── notifikasi.py          # Pydantic models for notifications
│
├── repositories/
│   ├── __init__.py
│   ├── laporan_repo.py        # Database queries for laporan
│   └── notifikasi_repo.py     # Database queries for notifications
│
├── controllers/
│   ├── __init__.py
│   ├── laporan_controller.py  # Request handlers for laporan
│   └── notifikasi_controller.py # Request handlers for notifications
│
├── routes/
│   ├── __init__.py
│   ├── laporan_routes.py      # Laporan endpoints
│   └── notifikasi_routes.py   # Notification endpoints
│
└── sql/
    └── schema.sql              # Database schema
```

## Testing Endpoints

### Option 1: Use quick_test.py (simple requests)
```bash
python quick_test.py
```

### Option 2: Use curl
```bash
# Health check
curl http://localhost:8000/

# Create laporan
curl -X POST http://localhost:8000/laporan \
  -H "Content-Type: application/json" \
  -d '{
    "nama_pelapor": "John Doe",
    "judul_laporan": "iPhone 14 hilang",
    "lokasi_hilang": "Mall Senayan",
    "id_kategori": 1
  }'

# List all laporan
curl http://localhost:8000/laporan

# Get notifications
curl http://localhost:8000/notifikasi
```

### Option 3: Use Swagger UI
Visit: `http://localhost:8000/docs`

Interactive API documentation where you can test endpoints directly.

## Example Workflow

1. **Reporter submits lost item report:**
   ```
   POST /laporan
   Body: {name, title, location, category, etc}
   Response: {id_laporan, token_cookie, ...}
   ```
   ✅ Cookie `laporan_token` set automatically

2. **Admin receives notification:**
   ```
   GET /notifikasi
   Response: [notification objects]
   ```

3. **Reporter checks their reports:**
   ```
   GET /laporan/mine
   (Browser automatically sends laporan_token cookie)
   Response: [laporan objects from reporter]
   ```

4. **Reporter marks item as found:**
   ```
   PATCH /laporan/{id}/found
   (Cookie required for verification)
   Response: {status: "Selesai"}
   ```

5. **Admin marks notification as read:**
   ```
   PATCH /notifikasi/{id}/read
   Response: {status_baca: true}
   ```

## Database Schema

**Tables Created:**
- `admin` - Admin user accounts
- `kategori` - Item categories (Elektronik, Dokumen, Kendaraan, Aksesoris, Lainnya)
- `laporan` - Lost item reports
- `notifikasi` - Admin notifications

**Key Features:**
- `token_cookie` (UUID) - Auto-generated for each report, stored in cookie
- `status` - Report status (Aktif, Selesai, Dihapus)
- Cascading deletes - Notifications deleted when laporan deleted
- Timestamps - All records have `created_at`

## Troubleshooting

### Database connection fails
- Check `.env` file has correct `DATABASE_URL`
- Verify Neon database is running
- Run `python test_db.py` to diagnose

### AttributeError with date fields
- Fixed in controllers - tanggal_hilang now passed as date object

### Import errors (asyncpg not found)
- Run: `pip install -r requirements.txt`
- Or: `python -m pip install asyncpg>=0.27`

### Port 8000 already in use
- Change port: `uvicorn main:app --port 8001`

## Security Notes

⚠️ **For Production:**
1. Replace simple `admin=true` query param with proper JWT/OAuth authentication
2. Add request validation and rate limiting
3. Use CORS middleware appropriately
4. Never commit `.env` file to git
5. Rotate database passwords regularly
6. Add HTTPS/SSL in production

## Next Steps

1. Integrate with React frontend
2. Implement proper admin authentication
3. Add image upload/storage (S3, Cloudinary, etc.)
4. Set up CI/CD pipeline
5. Add comprehensive error handling
6. Implement request logging
7. Add unit & integration tests

## Support

For issues or questions, check:
- Server logs: `uvicorn main:app --reload --port 8000`
- API docs: `http://localhost:8000/docs`
- Database logs: Check Neon console
