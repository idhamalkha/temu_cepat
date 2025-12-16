import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function NotificationDropdown({ notifikasi, onMarkRead, onRefresh }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifikasi.filter(n => !n.status_baca).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}h lalu`;
    if (diffDays < 7) return `${diffDays}d lalu`;

    return date.toLocaleDateString('id-ID');
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        className="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifikasi"
        aria-label="Buka notifikasi"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <div className="notification-header-top">
              <h3 className="notification-title">Notifikasi</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="notification-close-btn"
                aria-label="Tutup notifikasi"
              >
                <X size={20} />
              </button>
            </div>
            {unreadCount > 0 && (
              <p className="notification-unread-info">
                <AlertCircle size={14} /> {unreadCount} belum dibaca
              </p>
            )}
          </div>

          {/* Content */}
          <div className="notification-content">
            {notifikasi.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">🔔</div>
                <p className="notification-empty-text">Tidak ada notifikasi</p>
                <p className="notification-empty-subtext">Notifikasi baru akan muncul di sini</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifikasi.map((notif, idx) => (
                  <div 
                    key={idx} 
                    className={`notification-item ${!notif.status_baca ? 'unread' : ''}`}
                  >
                    <div className="notification-item-indicator">
                      {!notif.status_baca ? (
                        <div className="notification-unread-dot"></div>
                      ) : (
                        <CheckCircle size={16} className="notification-read-icon" />
                      )}
                    </div>
                    <div className="notification-item-content">
                      <p className="notification-item-title">{notif.judul}</p>
                      <p className="notification-item-message">{notif.isi}</p>
                      <p className="notification-item-time">{formatDate(notif.created_at)}</p>
                    </div>
                    <button
                      onClick={() => onMarkRead?.(notif.id_notifikasi)}
                      className="notification-item-action"
                      title={notif.status_baca ? 'Tandai belum dibaca' : 'Tandai dibaca'}
                      aria-label="Tandai notifikasi"
                    >
                      {notif.status_baca ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifikasi.length > 0 && (
            <div className="notification-footer">
              <button 
                onClick={() => {
                  onRefresh?.();
                  setIsOpen(false);
                }}
                className="notification-refresh-btn"
              >
                <span>Refresh</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
