# Temu Cepat 🚀

**Temu Cepat** adalah aplikasi web untuk manajemen dan pelaporan yang memungkinkan pengguna membuat, melacak, dan mengelola laporan dengan efisien. Aplikasi ini dibangun dengan teknologi modern menggunakan **FastAPI** untuk backend dan **React** untuk frontend.

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Folder](#struktur-folder)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## ✨ Fitur

- **Manajemen Laporan**: Buat, edit, dan hapus laporan dengan mudah
- **Admin Dashboard**: Dashboard khusus untuk administrator
- **Notifikasi Real-time**: Sistem notifikasi untuk update laporan
- **Kategori Laporan**: Organisasi laporan berdasarkan kategori
- **Wilayah Management**: Kelola wilayah dan area laporan
- **Authentication**: Sistem login aman untuk pengguna
- **Cache Images**: Caching otomatis untuk performa optimal

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL / SQLite
- **ORM**: SQLAlchemy
- **Storage**: GitHub API (untuk penyimpanan gambar)
- **Python**: 3.8+

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **CSS Preprocessor**: PostCSS
- **Linting**: ESLint

## 📦 Prasyarat

Sebelum menjalankan aplikasi, pastikan Anda sudah memiliki:

- **Node.js** (v16 atau lebih baru) dan npm
- **Python** (3.8 atau lebih baru)
- **Git**
- **PostgreSQL** (opsional, bisa menggunakan SQLite)

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/idhamalkha/temu_cepat.git
cd temu_cepat
```

### 2. Setup Backend

```bash
cd backend/app

# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
# Untuk Windows:
venv\Scripts\activate
# Untuk Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Buat file .env (lihat SETUP_GUIDE.md untuk konfigurasi)
cp .env.example .env
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install
```

## 🏃 Menjalankan Aplikasi

### Backend

```bash
cd backend/app

# Aktifkan virtual environment terlebih dahulu
# Kemudian jalankan:
python main.py

# Atau menggunakan uvicorn:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend akan berjalan di `http://localhost:8000`

**Dokumentasi API**: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Development mode
npm run dev

# Build untuk production
npm run build

# Preview build
npm run preview
```

Frontend akan berjalan di `http://localhost:5173` (default Vite)

## 📁 Struktur Folder

```
temu_cepat/
├── backend/
│   └── app/
│       ├── controllers/          # Logika kontroller
│       ├── models/               # Database models
│       ├── repositories/         # Data access layer
│       ├── routes/               # API routes
│       ├── db/                   # Database configuration
│       ├── utils/                # Utility functions
│       ├── sql/                  # SQL scripts
│       ├── scripts/              # Maintenance scripts
│       ├── cache/                # Cache files
│       ├── main.py               # Entry point
│       ├── requirements.txt      # Python dependencies
│       ├── README.md             # Backend documentation
│       └── SETUP_GUIDE.md        # Setup guide
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Page components
│   │   ├── styles/               # CSS styles
│   │   ├── utils/                # Utility functions
│   │   ├── api.js                # API client
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── public/                   # Static assets
│   ├── package.json              # Node dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind configuration
│   └── README.md                 # Frontend documentation
│
├── .gitignore
├── README.md                     # File ini
└── LICENSE                       # MIT License
```

## 📚 Dokumentasi Tambahan

- [Backend Setup Guide](backend/app/SETUP_GUIDE.md)
- [Frontend Guide](frontend/FRONTEND_GUIDE.md)
- [Admin Login Guide](frontend/ADMIN_LOGIN_GUIDE.md)

## 🤝 Kontribusi

Kami menerima kontribusi dari komunitas! Untuk berkontribusi:

1. Fork repository ini
2. Buat branch fitur Anda (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📝 Lisensi

Project ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detailnya.

## 👥 Tim

Dikembangkan oleh Tim Kelompok SUPER DE - Semester 5

## 📞 Kontak & Support

Jika Anda memiliki pertanyaan atau menemukan bug, silakan buat issue di repository ini.

---

**Dibuat dengan ❤️ menggunakan FastAPI dan React**
