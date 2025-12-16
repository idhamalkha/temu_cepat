import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, LogOut, AlertCircle } from 'lucide-react';
import { laporanAPI, notifikasiAPI } from '../api';
import '../styles/admin-dashboard-new.css';

export default function AdminDashboard({ setCurrentPage, setAdminToken }) {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const data = await laporanAPI.getAll(null, 100);
      setLaporan(data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal mengambil laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLaporan = async (id) => {
    if (!window.confirm('Hapus laporan ini?')) return;
    try {
      setDeletingId(id);
      await laporanAPI.delete(id, true);
      fetchLaporan();
      setDeletingId(null);
    } catch (err) {
      alert('Gagal menghapus laporan: ' + (err.message || 'Error'));
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminToken(null);
    setShowLogoutModal(false);
    setCurrentPage('admin-login');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const stats = {
    total: laporan.length,
    aktif: laporan.filter(l => l.status === 'Aktif').length,
    selesai: laporan.filter(l => l.status === 'Selesai').length,
    dihapus: laporan.filter(l => l.status === 'Dihapus').length
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const filteredLaporan = laporan.filter(item => {
    const matchSearch = 
      item.nama_pelapor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.judul_laporan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lokasi_hilang?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-dashboard-wrapper">
      <header className="admin-dashboard-header">
        <div className="admin-dashboard-header-content">
          <div className="admin-dashboard-header-left">
            <button 
              onClick={() => setCurrentPage('landing')}
              className="admin-dashboard-back-btn"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="admin-dashboard-header-text">
              <h1>Admin Dashboard</h1>
              <p>Kelola dan pantau semua laporan</p>
            </div>
          </div>
          <div className="admin-dashboard-header-right">
            <button 
              onClick={fetchLaporan}
              className="admin-dashboard-btn"
            >
              Refresh
            </button>
            <button 
              onClick={handleLogout}
              className="admin-dashboard-logout-btn"
              title="Keluar dari admin"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="admin-dashboard-main">
        {/* Stats Grid */}
        <div className="admin-dashboard-stats-grid">
          <div className="admin-dashboard-stat-card">
            <div className="admin-dashboard-stat-icon blue">📊</div>
            <div>
              <p className="admin-dashboard-stat-label">Total Laporan</p>
              <h3 className="admin-dashboard-stat-value">{stats.total}</h3>
              <p className="admin-dashboard-stat-subtext">Semua laporan</p>
            </div>
          </div>
          <div className="admin-dashboard-stat-card">
            <div className="admin-dashboard-stat-icon blue">⏳</div>
            <div>
              <p className="admin-dashboard-stat-label">Aktif</p>
              <h3 className="admin-dashboard-stat-value">{stats.aktif}</h3>
              <p className="admin-dashboard-stat-subtext">Sedang berjalan</p>
            </div>
          </div>
          <div className="admin-dashboard-stat-card">
            <div className="admin-dashboard-stat-icon green">✓</div>
            <div>
              <p className="admin-dashboard-stat-label">Selesai</p>
              <h3 className="admin-dashboard-stat-value">{stats.selesai}</h3>
              <p className="admin-dashboard-stat-subtext">Sudah terselesaikan</p>
            </div>
          </div>
          <div className="admin-dashboard-stat-card">
            <div className="admin-dashboard-stat-icon red">🗑</div>
            <div>
              <p className="admin-dashboard-stat-label">Dihapus</p>
              <h3 className="admin-dashboard-stat-value">{stats.dihapus}</h3>
              <p className="admin-dashboard-stat-subtext">Sudah dihapus</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="admin-dashboard-error">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Search and Filter */}
        {!loading && laporan.length > 0 && (
          <div className="admin-dashboard-controls">
            <div className="admin-dashboard-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Cari laporan, pelapor, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="admin-dashboard-filter">
              <Filter size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Selesai">Selesai</option>
                <option value="Dihapus">Dihapus</option>
              </select>
            </div>
          </div>
        )}

        {/* Section Header */}
        {!loading && filteredLaporan.length > 0 && (
          <div className="admin-dashboard-section-header">
            <h2 className="admin-dashboard-section-title">Daftar Laporan</h2>
            <p className="admin-dashboard-section-subtitle">Menampilkan {filteredLaporan.length} dari {laporan.length} laporan</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="admin-dashboard-loading">
            <div className="admin-dashboard-spinner">
              <div className="admin-dashboard-spinner-ring"></div>
              <p>Memuat laporan...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredLaporan.length === 0 && laporan.length === 0 && (
          <div className="admin-dashboard-empty">
            <div className="admin-dashboard-empty-icon">📋</div>
            <p className="admin-dashboard-empty-title">Tidak ada laporan</p>
            <p className="admin-dashboard-empty-text">Laporan baru akan muncul di sini</p>
          </div>
        )}

        {!loading && filteredLaporan.length === 0 && laporan.length > 0 && (
          <div className="admin-dashboard-empty">
            <div className="admin-dashboard-empty-icon">🔍</div>
            <p className="admin-dashboard-empty-title">Tidak ada laporan yang cocok</p>
            <p className="admin-dashboard-empty-text">Coba ubah pencarian atau filter Anda</p>
          </div>
        )}

        {/* Laporan Grid */}
        {!loading && filteredLaporan.length > 0 && (
          <div className="admin-dashboard-grid">
            {filteredLaporan.map((item) => (
              <div key={item.id_laporan} className="admin-dashboard-card">
                {/* Card Image */}
                <div className="admin-dashboard-card-image">
                  {item.foto_url ? (
                    <img src={item.foto_url} alt={item.judul_laporan} onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <div className="admin-dashboard-card-image-placeholder">📦</div>
                  )}
                </div>

                {/* Card Content */}
                <div className="admin-dashboard-card-content">
                  <div className="admin-dashboard-card-category">{item.kategori_nama || 'Kategori'}</div>
                  <h3 className="admin-dashboard-card-title">{item.judul_laporan}</h3>
                  <div className="admin-dashboard-card-reporter">Pelapor: {item.nama_pelapor}</div>
                  
                  <div className={`admin-dashboard-card-status ${
                    item.status === 'Aktif' ? 'active' : 
                    item.status === 'Selesai' ? 'done' : 
                    'deleted'
                  }`}>
                    {item.status}
                  </div>

                  {item.deskripsi && (
                    <p className="admin-dashboard-card-description">{item.deskripsi}</p>
                  )}

                  <div className="admin-dashboard-card-meta">
                    <div className="admin-dashboard-card-meta-item">
                      <div className="admin-dashboard-card-meta-label">Lokasi</div>
                      <div>{item.lokasi_hilang || item.lokasi || '—'}</div>
                    </div>
                    <div className="admin-dashboard-card-meta-item">
                      <div className="admin-dashboard-card-meta-label">Tanggal Hilang</div>
                      <div>{item.tanggal_hilang ? formatDate(item.tanggal_hilang) : '—'}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="admin-dashboard-card-actions">
                    <button 
                      className="admin-dashboard-card-action-btn view"
                    >
                      👁 Lihat
                    </button>
                    <button 
                      onClick={() => handleDeleteLaporan(item.id_laporan)}
                      disabled={deletingId === item.id_laporan}
                      className="admin-dashboard-card-action-btn delete"
                    >
                      {deletingId === item.id_laporan ? '...' : '✕ Hapus'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="admin-dashboard-modal-overlay">
          <div className="admin-dashboard-modal">
            <div className="admin-dashboard-modal-header">
              <div className="admin-dashboard-modal-icon">
                <LogOut size={24} />
              </div>
              <h2>Keluar dari Admin?</h2>
            </div>
            <p className="admin-dashboard-modal-message">
              Anda akan keluar dari dashboard admin. Anda perlu login kembali untuk mengakses dashboard.
            </p>
            <div className="admin-dashboard-modal-buttons">
              <button
                onClick={cancelLogout}
                className="admin-dashboard-modal-cancel"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="admin-dashboard-modal-confirm"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
