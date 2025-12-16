import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Mail, Share2, Heart, MapPin, Calendar } from 'lucide-react';
import { laporanAPI } from '../api';
import '../styles/laporan-detail.css';

export default function LaporanDetail({ laporanId, setCurrentPage }) {
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchLaporanDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/laporan/${laporanId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch laporan: ${response.status}`);
        }
        
        const data = await response.json();
        setLaporan(data);
        
        // Check if saved in localStorage
        const saved = localStorage.getItem(`laporan_saved_${laporanId}`);
        setIsSaved(!!saved);
      } catch (err) {
        console.error('Error fetching laporan:', err);
        setError(err.message || 'Gagal memuat detail laporan');
      } finally {
        setLoading(false);
      }
    };

    fetchLaporanDetail();
  }, [laporanId]);

  const toggleSave = () => {
    if (isSaved) {
      localStorage.removeItem(`laporan_saved_${laporanId}`);
    } else {
      localStorage.setItem(`laporan_saved_${laporanId}`, 'true');
    }
    setIsSaved(!isSaved);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 - ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak diketahui';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const handleWhatsApp = () => {
    const message = `Saya memiliki informasi tentang barang pada laporan ini ~\n\n"${laporan.judul_laporan}"\n\n${window.location.href}`;
    const whatsappUrl = `https://wa.me/${laporan.kontak_pelapor ? laporan.kontak_pelapor.replace(/\D/g, '') : ''}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = () => {
    const subject = `Pertanyaan tentang: ${laporan.judul_laporan}`;
    const body = `Halo ${laporan.nama_pelapor},\n\nSaya tertarik dengan laporan Anda tentang "${laporan.judul_laporan}".\n\nDetail laporan: ${window.location.href}`;
    const emailUrl = `mailto:${laporan.email_pelapor}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: laporan.judul_laporan,
        text: `Lihat laporan: ${laporan.judul_laporan}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link disalin ke clipboard');
    }
  };

  if (loading) {
    return (
      <div className="laporan-detail-page">
        <div className="laporan-detail-loading">
          <div className="laporan-detail-spinner"></div>
          <p>Memuat detail laporan...</p>
        </div>
      </div>
    );
  }

  if (error || !laporan) {
    return (
      <div className="laporan-detail-page">
        <div className="laporan-detail-error">
          <h2>Laporan tidak ditemukan</h2>
          <p>{error || 'Laporan yang Anda cari tidak tersedia.'}</p>
          <button 
            className="btn btn-primary"
            onClick={() => setCurrentPage('landing')}
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="laporan-detail-page">
      {/* Header dengan back button */}
      <div className="laporan-detail-header">
        <button 
          className="laporan-detail-back"
          onClick={() => setCurrentPage('landing')}
          title="Kembali ke halaman sebelumnya"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Main content - 2 column layout */}
      <div className="laporan-detail-container">
        {/* LEFT COLUMN: Data */}
        <div className="laporan-detail-left">
          {/* Metadata bar */}
          <div className="laporan-detail-metadata-bar">
            <div className="metadata-item">
              <span className="metadata-label">Kategori</span>
              <span className="metadata-value">{laporan.kategori_nama || 'N/A'}</span>
            </div>
            <div className="metadata-item">
              <span className={`metadata-status status-${laporan.status?.toLowerCase() || 'aktif'}`}>
                {laporan.status || 'Aktif'}
              </span>
            </div>
          </div>

          {/* Title and reporter */}
          <div className="laporan-detail-title-section">
            <h1 className="laporan-detail-title">{laporan.judul_laporan}</h1>
            <p className="laporan-detail-reporter">
              Dilaporkan oleh <span className="reporter-name">{laporan.nama_pelapor}</span>
            </p>
          </div>

          {/* Description */}
          <div className="laporan-detail-description">
            <h3>Deskripsi</h3>
            <p>{laporan.deskripsi || 'Tidak ada deskripsi'}</p>
          </div>

          {/* Details grid */}
          <div className="laporan-detail-details">
            <div className="detail-item">
              <div className="detail-icon">
                <MapPin size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Lokasi Hilang</span>
                <span className="detail-value">{laporan.lokasi_hilang || laporan.lokasi || 'Tidak diketahui'}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <Calendar size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Tanggal Hilang</span>
                <span className="detail-value">
                  {formatDate(laporan.tanggal_hilang)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="laporan-detail-contact-info">
            <h3>Informasi Kontak</h3>
            <div className="contact-item">
              <span className="contact-label">Nama:</span>
              <span className="contact-value">{laporan.nama_pelapor}</span>
            </div>
            {laporan.kontak_pelapor && (
              <div className="contact-item">
                <span className="contact-label">WhatsApp/Telepon:</span>
                <span className="contact-value">{formatPhoneNumber(laporan.kontak_pelapor)}</span>
              </div>
            )}
            {laporan.email_pelapor && (
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <span className="contact-value">{laporan.email_pelapor}</span>
              </div>
            )}
          </div>

          {/* Coordinates if available */}
          {laporan.latitude && laporan.longitude && (
            <div className="laporan-detail-coordinates">
              <p className="coordinates-label">Koordinat GPS:</p>
              <p className="coordinates-value">
                {laporan.latitude.toFixed(6)}, {laporan.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Image & Action Buttons */}
        <div className="laporan-detail-right">
          {/* Image section */}
          <div className="laporan-detail-image-section">
            {laporan.foto_url ? (
              <img src={laporan.foto_url} alt={laporan.judul_laporan} className="laporan-detail-image" />
            ) : (
              <div className="laporan-detail-image-placeholder">
                <Heart size={64} />
              </div>
            )}
          </div>

          {/* Action buttons below image */}
          <div className="laporan-detail-actions">
            <button 
              className="action-btn whatsapp-btn"
              onClick={handleWhatsApp}
              disabled={!laporan.kontak_pelapor}
              title={laporan.kontak_pelapor ? 'Hubungi via WhatsApp' : 'Nomor WhatsApp tidak tersedia'}
            >
              <MessageCircle size={20} />
              <span>WhatsApp</span>
            </button>
            
            <button 
              className="action-btn email-btn"
              onClick={handleEmail}
              disabled={!laporan.email_pelapor}
              title={laporan.email_pelapor ? 'Kirim Email' : 'Email tidak tersedia'}
            >
              <Mail size={20} />
              <span>Email</span>
            </button>
            
            <button 
              className="action-btn share-btn"
              onClick={handleShare}
              title="Bagikan laporan ini"
            >
              <Share2 size={20} />
              <span>Bagikan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
