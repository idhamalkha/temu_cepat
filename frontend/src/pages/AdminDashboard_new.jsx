import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Clock, Search, Filter, TrendingUp, BarChart3 } from 'lucide-react';
import ReportCard from '../components/ReportCard';
import NotificationDropdown from '../components/NotificationDropdown';
import { laporanAPI, notifikasiAPI } from '../api';
import '../styles/admin-dashboard.css';

export default function AdminDashboard({ setCurrentPage }) {
  const [notifikasi, setNotifikasi] = useState([]);
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notifData, laporanData] = await Promise.all([
        notifikasiAPI.getAll(),
        laporanAPI.getAll(null, 100)
      ]);
      setNotifikasi(notifData || []);
      setLaporan(laporanData || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notifikasiAPI.markRead(id);
      fetchData();
    } catch (err) {
      alert('Gagal mengubah status: ' + (err.message || 'Error'));
    }
  };

  const handleDeleteLaporan = async (id) => {
    if (!window.confirm('Hapus laporan ini?')) return;
    try {
      await laporanAPI.delete(id, true);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus laporan: ' + (err.message || 'Error'));
    }
  };

  const handleViewDetail = (laporan) => {
    console.log('View detail:', laporan);
  };

  const stats = {
    total: laporan.length,
    aktif: laporan.filter(l => l.status === 'Aktif').length,
    selesai: laporan.filter(l => l.status === 'Selesai').length,
    proses: laporan.filter(l => l.status === 'Dalam Proses').length
  };

  const filteredLaporan = laporan.filter(item => {
    const matchSearch = item.nama_item?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.nama_pelapor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stat card component
  const StatCard = ({ icon: Icon, label, value, subtext, color, bgColor }) => (
    <div className="stat-card-wrapper">
      <div className="stat-card-content">
        <div className={`stat-icon ${bgColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="stat-text">
          <p className="stat-label">{label}</p>
          <h3 className="stat-number">{value}</h3>
          <p className="stat-subtext">{subtext}</p>
        </div>
      </div>
      <div className={`stat-bar ${color}`}></div>
    </div>
  );

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <header className="admin-header-wrapper">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <button 
              onClick={() => setCurrentPage('landing')}
              className="admin-back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="admin-header-text">
              <h1 className="admin-title">Admin Dashboard</h1>
              <p className="admin-subtitle">Kelola dan pantau semua laporan dengan mudah</p>
            </div>
          </div>
          <div className="admin-header-right">
            <NotificationDropdown 
              notifikasi={notifikasi}
              onMarkRead={handleMarkRead}
              onRefresh={fetchData}
            />
            <button 
              onClick={fetchData}
              className="admin-refresh-btn"
            >
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard 
            icon={FileText}
            label="Total Laporan"
            value={stats.total}
            subtext="Semua laporan"
            color="stat-blue"
            bgColor="bg-blue"
          />
          <StatCard 
            icon={CheckCircle}
            label="Aktif"
            value={stats.aktif}
            subtext="Sedang berjalan"
            color="stat-green"
            bgColor="bg-green"
          />
          <StatCard 
            icon={Clock}
            label="Dalam Proses"
            value={stats.proses}
            subtext="Menunggu tindakan"
            color="stat-amber"
            bgColor="bg-amber"
          />
          <StatCard 
            icon={TrendingUp}
            label="Selesai"
            value={stats.selesai}
            subtext="Sudah terselesaikan"
            color="stat-purple"
            bgColor="bg-purple"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="error-alert-wrapper">
            <div className="error-alert-icon">⚠️</div>
            <p className="error-alert-text">{error}</p>
          </div>
        )}

        {/* Search & Filter */}
        {!loading && laporan.length > 0 && (
          <div className="search-filter-wrapper">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Cari laporan, pelapor, atau item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-wrapper">
              <Filter className="filter-icon" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>
        )}

        {/* Section Header */}
        {!loading && filteredLaporan.length > 0 && (
          <div className="section-header">
            <h2 className="section-title">Daftar Laporan</h2>
            <p className="section-subtitle">Menampilkan {filteredLaporan.length} dari {laporan.length} laporan</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Memuat laporan...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredLaporan.length === 0 && laporan.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p className="empty-title">Tidak ada laporan</p>
            <p className="empty-text">Laporan baru akan muncul di sini</p>
          </div>
        )}

        {/* No Search Results */}
        {!loading && filteredLaporan.length === 0 && laporan.length > 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p className="empty-title">Tidak ada laporan yang cocok</p>
            <p className="empty-text">Coba ubah pencarian atau filter Anda</p>
          </div>
        )}

        {/* Reports Grid */}
        {!loading && filteredLaporan.length > 0 && (
          <div className="reports-grid">
            {filteredLaporan.map((item) => (
              <ReportCard 
                key={item.id_laporan} 
                laporan={item} 
                onDelete={handleDeleteLaporan}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
