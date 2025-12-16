import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, LogOut, AlertCircle, X, Trash2 } from 'lucide-react';
import { laporanAPI } from '../api';
import '../styles/admin-dashboard-new.css';

export default function AdminDashboard({ setCurrentPage, setAdminToken }) {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [searchActive, setSearchActive] = useState(false);

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

  const handleDeleteLaporan = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeletingId(deleteTargetId);
      const response = await laporanAPI.delete(deleteTargetId, true);
      // After successful deletion, refresh the list
      await fetchLaporan();
      setDeletingId(null);
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      // Close detail modal if open
      if (selectedDetail?.id_laporan === deleteTargetId) {
        setSelectedDetail(null);
      }
    } catch (err) {
      alert('Gagal menghapus laporan: ' + (err.message || 'Error'));
      setDeletingId(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
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
            <div className="admin-dashboard-search-group">
              <div className={`admin-dashboard-search-inner ${searchActive ? 'active' : ''}`}>
                <Search size={18} className="admin-dashboard-search-icon" />
                <input
                  type="text"
                  placeholder="Cari laporan, pelapor, atau lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchActive(true)}
                  onBlur={() => setSearchActive(false)}
                />
              </div>
            </div>
            <div className="admin-dashboard-filter-tabs">
              {['all', 'Aktif', 'Selesai', 'Dihapus'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`admin-dashboard-filter-tab ${filterStatus === status ? 'active' : ''}`}
                >
                  {status === 'all' ? 'Semua Status' : status}
                </button>
              ))}
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
                      onClick={() => setSelectedDetail(item)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="admin-dashboard-modal-overlay admin-dashboard-delete-modal-overlay">
          <div className="admin-dashboard-modal">
            <div className="admin-dashboard-modal-header">
              <div className="admin-dashboard-modal-icon delete">
                <Trash2 size={24} />
              </div>
              <h2>Hapus Laporan?</h2>
            </div>
            <p className="admin-dashboard-modal-message">
              Laporan ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?
            </p>
            <div className="admin-dashboard-modal-buttons">
              <button
                onClick={cancelDelete}
                className="admin-dashboard-modal-cancel"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === deleteTargetId}
                className="admin-dashboard-modal-confirm delete"
              >
                {deletingId === deleteTargetId ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="admin-dashboard-modal-overlay" onClick={() => setSelectedDetail(null)}>
          <div className="admin-dashboard-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-dashboard-detail-header">
              <h2>Detail Laporan</h2>
              <button 
                onClick={() => setSelectedDetail(null)}
                className="admin-dashboard-detail-close"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="admin-dashboard-detail-content">
              {selectedDetail.foto_url && (
                <div className="admin-dashboard-detail-image">
                  <img src={selectedDetail.foto_url} alt={selectedDetail.judul_laporan} />
                </div>
              )}
              
              <div className="admin-dashboard-detail-body">
                <div className="admin-dashboard-detail-section">
                  <h3>Informasi Barang</h3>
                  <div className="admin-dashboard-detail-item">
                    <label>Judul</label>
                    <p>{selectedDetail.judul_laporan}</p>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <label>Kategori</label>
                    <p>{selectedDetail.kategori_nama || '—'}</p>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <label>Deskripsi</label>
                    <p>{selectedDetail.deskripsi || '—'}</p>
                  </div>
                </div>

                <div className="admin-dashboard-detail-section">
                  <h3>Lokasi & Waktu</h3>
                  <div className="admin-dashboard-detail-item">
                    <label>Lokasi Hilang</label>
                    <p>{selectedDetail.lokasi_hilang || selectedDetail.lokasi || '—'}</p>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <label>Tanggal Hilang</label>
                    <p>{selectedDetail.tanggal_hilang ? formatDate(selectedDetail.tanggal_hilang) : '—'}</p>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <label>Dilaporkan Pada</label>
                    <p>{selectedDetail.created_at ? formatDate(selectedDetail.created_at) : '—'}</p>
                  </div>
                </div>

                <div className="admin-dashboard-detail-section">
                  <h3>Informasi Pelapor</h3>
                  <div className="admin-dashboard-detail-item">
                    <label>Nama</label>
                    <p>{selectedDetail.nama_pelapor}</p>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <label>Email</label>
                    <p>
                      {selectedDetail.email_pelapor ? (
                        <a href={`mailto:${selectedDetail.email_pelapor}`} style={{ color: '#d97706', textDecoration: 'none' }}>
                          {selectedDetail.email_pelapor}
                        </a>
                      ) : '—'}
                    </p>
                  </div>
                  <div className="admin-dashboard-detail-item">
                    <label>Kontak</label>
                    <p>
                      {selectedDetail.kontak_pelapor ? (
                        <a href={`https://wa.me/${selectedDetail.kontak_pelapor.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#d97706', textDecoration: 'none' }}>
                          {selectedDetail.kontak_pelapor}
                        </a>
                      ) : '—'}
                    </p>
                  </div>
                </div>

                <div className="admin-dashboard-detail-section">
                  <h3>Status</h3>
                  <div className={`admin-dashboard-detail-status ${
                    selectedDetail.status === 'Aktif' ? 'active' : 
                    selectedDetail.status === 'Selesai' ? 'done' : 
                    'deleted'
                  }`}>
                    {selectedDetail.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-dashboard-detail-actions">
              <button 
                onClick={() => handleDeleteLaporan(selectedDetail.id_laporan)}
                className="admin-dashboard-detail-delete-btn"
              >
                🗑 Hapus Laporan
              </button>
              <button 
                onClick={() => setSelectedDetail(null)}
                className="admin-dashboard-detail-close-btn"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
