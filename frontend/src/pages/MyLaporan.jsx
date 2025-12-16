import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { laporanAPI } from '../api';
import '../styles/my-laporan.css';

export default function MyLaporan({ setCurrentPage }) {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('Aktif');
  const [deletingId, setDeletingId] = useState(null);

  // Local cache key and TTL
  const CACHE_KEY = 'my_laporan_cache_v1';
  const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  // Offline action queue (for optimistic updates when offline)
  const ACTION_QUEUE_KEY = 'laporan_action_queue_v1';

  const loadActionQueue = () => {
    try {
      const raw = localStorage.getItem(ACTION_QUEUE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  };

  const saveActionQueue = (queue) => {
    try {
      localStorage.setItem(ACTION_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save action queue', e);
    }
  };

  const enqueueAction = (action) => {
    const q = loadActionQueue();
    q.push(action);
    saveActionQueue(q);
  };

  const processQueue = async () => {
    const q = loadActionQueue();
    if (!q || q.length === 0) return;
    // Try to process sequentially
    const remaining = [];
    for (const act of q) {
      try {
        if (act.type === 'markFound') {
          await laporanAPI.markFound(act.id);
        } else if (act.type === 'delete') {
          await laporanAPI.delete(act.id);
        }
        // if success, continue
      } catch (e) {
        // keep remaining for retry later
        remaining.push(act);
      }
    }
    saveActionQueue(remaining);
    // Refresh from server if any processed
    if (remaining.length < q.length) {
      fetchLaporan();
    }
  };

  const saveLocalHistory = (items) => {
    try {
      const payload = {
        items,
        savedAt: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore storage errors
      console.warn('Failed to save laporan cache', e);
    }
  };

  const loadLocalHistory = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const payload = JSON.parse(raw);
      if (!payload.expiresAt || Date.now() > payload.expiresAt) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return payload.items || null;
    } catch (e) {
      console.warn('Failed to load laporan cache', e);
      return null;
    }
  };

  useEffect(() => {
    fetchLaporan();
    // process queued actions on mount
    processQueue();

    const handleOnline = () => {
      processQueue();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const data = await laporanAPI.getMyLaporan();
      setLaporan(data || []);
      setError('');
      // update local cache on successful fetch
      if (data && data.length >= 0) saveLocalHistory(data);
    } catch (err) {
      // If server returned 401 (unauthorized) treat as "no reports" and show empty state
      const is401 = (err && ((err.response && err.response.status === 401) || err.status === 401 || (typeof err.message === 'string' && err.message.includes('401'))));

      // Try to load from local cache when backend is unreachable
      const cached = loadLocalHistory();
      if (cached !== null) {
        // we have a cache (maybe empty). Show cached items.
        setLaporan(cached);
        if (cached.length > 0) {
          setError('Menampilkan data lokal (offline)');
        } else {
          // cached but empty: do not show a fetch error, the UI already shows "Tidak ada laporan..."
          setError('');
        }
      } else if (is401) {
        // treat 401 as empty result (do not show an error banner)
        setLaporan([]);
        setError('');
      } else {
        // no cache available at all -> show error
        setError(err.message || 'Gagal mengambil laporan');
        setLaporan([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFound = async (id) => {
    if (!window.confirm('Tandai laporan ini sebagai selesai?')) return;
    // Optimistic update: mark locally first
    setLaporan(prev => prev.map(p => p.id_laporan === id ? { ...p, status: 'Selesai' } : p));
    saveLocalHistory(laporan.map(p => p.id_laporan === id ? { ...p, status: 'Selesai' } : p));
    try {
      await laporanAPI.markFound(id);
      fetchLaporan();
    } catch (err) {
      // enqueue for retry
      enqueueAction({ type: 'markFound', id, ts: Date.now() });
      alert('Anda sedang offline atau server bermasalah. Perubahan akan dikirim ulang saat online.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus laporan ini? Tindakan ini tidak dapat dibatalkan.')) return;
    // Optimistic delete: mark as Dihapus locally
    setDeletingId(id);
    setLaporan(prev => prev.map(p => p.id_laporan === id ? { ...p, status: 'Dihapus' } : p));
    saveLocalHistory(laporan.map(p => p.id_laporan === id ? { ...p, status: 'Dihapus' } : p));
    try {
      await laporanAPI.delete(id);
      fetchLaporan();
      setDeletingId(null);
    } catch (err) {
      enqueueAction({ type: 'delete', id, ts: Date.now() });
      setDeletingId(null);
      alert('Anda sedang offline atau server bermasalah. Penghapusan akan dikirim ulang saat online.');
    }
  };

  const filteredLaporan = laporan.filter(l => l.status === filter);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Aktif':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"><Clock className="w-3 h-3" /> Aktif</span>;
      case 'Selesai':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"><CheckCircle className="w-3 h-3" /> Selesai</span>;
      case 'Dihapus':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold"><AlertCircle className="w-3 h-3" /> Dihapus</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
  };



  return (
    <div className="my-laporan-wrapper">
      <header className="my-laporan-header">
        <div className="my-laporan-header-content">
          <button onClick={() => setCurrentPage('landing')} className="my-laporan-back-btn">
            <ArrowLeft size={20} />
          </button>
          <div className="my-laporan-header-text">
            <h1>Laporan Saya</h1>
          </div>
        </div>
      </header>

      <main className="my-laporan-main">
        {error && (
          <div className="my-laporan-error">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="my-laporan-filters">
          {['Aktif', 'Selesai', 'Dihapus'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`my-laporan-filter-btn ${filter === status ? 'active' : 'inactive'}`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading && (
          <div className="my-laporan-loading">
            <div className="my-laporan-spinner">
              <div className="my-laporan-spinner-ring"></div>
              <p>Memuat laporan Anda...</p>
            </div>
          </div>
        )}

        {!loading && filteredLaporan.length === 0 && (
          <div className="my-laporan-empty">
            <AlertCircle className="my-laporan-empty-icon" size={80} />
            <p className="my-laporan-empty-text">Tidak ada laporan dengan status '{filter}'</p>
            {filter === 'Aktif' && (
              <button onClick={() => setCurrentPage('laporan-form')} className="my-laporan-empty-cta">
                Buat Laporan Baru
              </button>
            )}
          </div>
        )}

        {!loading && filteredLaporan.length > 0 && (
          <div className="my-laporan-grid">
            {filteredLaporan.map(item => (
              <div key={item.id_laporan} className="my-laporan-card">
                {/* Card Image */}
                <div className="my-laporan-card-image">
                  {item.foto_url ? (
                    <img src={item.foto_url} alt={item.judul_laporan} onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <div className="my-laporan-card-image-placeholder">🖼</div>
                  )}
                </div>

                {/* Card Content */}
                <div className="my-laporan-card-content">
                  <div className="my-laporan-card-category">{item.kategori_nama || 'Kategori'}</div>
                  <h3 className="my-laporan-card-title">{item.judul_laporan}</h3>
                  <div className={`my-laporan-card-status ${
                    item.status === 'Aktif' ? 'active' : 
                    item.status === 'Selesai' ? 'done' : 
                    'deleted'
                  }`}>
                    {item.status}
                  </div>
                  
                  {item.deskripsi && (
                    <p className="my-laporan-card-description">{item.deskripsi}</p>
                  )}

                  <div className="my-laporan-card-meta">
                    <div className="my-laporan-card-meta-item">
                      <div className="my-laporan-card-meta-label">Lokasi</div>
                      <div>{item.lokasi_hilang || item.lokasi || '—'}</div>
                    </div>
                    <div className="my-laporan-card-meta-item">
                      <div className="my-laporan-card-meta-label">Tanggal Hilang</div>
                      <div>{item.tanggal_hilang ? formatDate(item.tanggal_hilang) : '—'}</div>
                    </div>
                  </div>

                  {/* Primary Actions */}
                  <div className="my-laporan-card-actions">
                    {item.status === 'Aktif' && (
                      <button 
                        onClick={() => handleMarkFound(item.id_laporan)}
                        className="my-laporan-card-action-btn done"
                      >
                        ✓ Selesai
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(item.id_laporan)}
                      disabled={deletingId === item.id_laporan}
                      className="my-laporan-card-action-btn delete"
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
    </div>
  );
}
