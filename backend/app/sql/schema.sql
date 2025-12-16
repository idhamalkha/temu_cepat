-- Enable extension for UUID generation (pgcrypto provides gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tabel Admin
CREATE TABLE IF NOT EXISTS admin (
    id_admin SERIAL PRIMARY KEY,
    nama_admin VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kategori (
    id_kategori SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL
);

-- 2b. Tabel Wilayah (Provinsi & Kota)
CREATE TABLE IF NOT EXISTS wilayah (
    id_kota SERIAL PRIMARY KEY,
    nama_kota VARCHAR(100) NOT NULL,
    id_provinsi INT NOT NULL,
    nama_provinsi VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS laporan (
    id_laporan SERIAL PRIMARY KEY,
    token_cookie UUID DEFAULT gen_random_uuid(),
    nama_pelapor VARCHAR(100) NOT NULL,
    kontak_pelapor VARCHAR(100),
    email_pelapor VARCHAR(100),
    judul_laporan VARCHAR(150) NOT NULL,
    deskripsi TEXT,
    id_kota INT REFERENCES wilayah(id_kota) ON DELETE SET NULL,
    tanggal_hilang DATE,
    lokasi_hilang TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    id_kategori INT REFERENCES kategori(id_kategori) ON DELETE SET NULL,
    foto_url TEXT,
    status VARCHAR(50) DEFAULT 'Aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Notifikasi untuk Admin
CREATE TABLE IF NOT EXISTS notifikasi (
    id_notifikasi SERIAL PRIMARY KEY,
    id_laporan INT REFERENCES laporan(id_laporan) ON DELETE CASCADE,
    pesan TEXT,
    status_baca BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Data Awal Kategori
INSERT INTO kategori (nama_kategori)
VALUES 
('Elektronik'),
('Dokumen'),
('Kendaraan'),
('Aksesoris'),
('Lainnya')
ON CONFLICT DO NOTHING;

-- 6. Cleanup logs to record automated/manual cleanup runs
CREATE TABLE IF NOT EXISTS cleanup_logs (
    id_log SERIAL PRIMARY KEY,
    run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    triggered_by VARCHAR(100),
    days_window INT,
    affected_count INT
);
