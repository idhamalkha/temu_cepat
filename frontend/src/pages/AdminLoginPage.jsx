import React, { useState, useEffect } from 'react';
import { LogIn, CheckCircle } from 'lucide-react';
import LogoNav from '../components/LogoNav';
import '../styles/admin-login.css';

export default function AdminLoginPage({ setCurrentPage, setAdminToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  const handleBackToHome = () => {
    setIsExiting(true);
    setTimeout(() => {
      setCurrentPage('landing');
    }, 300);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save token to localStorage
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_id', data.admin.id_admin);
        localStorage.setItem('admin_name', data.admin.nama_admin);

        // Call parent callback
        if (setAdminToken) {
          setAdminToken(data.token);
        }

        setSuccess('Login berhasil!');
        
        // Trigger exit animation and redirect
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setCurrentPage('admin');
          }, 400);
        }, 600);
      } else {
        setError(data.detail || 'Login gagal. Periksa username dan password Anda.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`admin-login-wrapper ${isExiting ? 'admin-login-exit' : ''}`}>
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <LogoNav size={56} className="logo-color" />
          </div>
          <h1 className="admin-login-title">Admin Panel</h1>
          <p className="admin-login-subtitle">Masuk untuk mengelola laporan dan notifikasi</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            <CheckCircle size={16} className="success-icon" />
            {success}
          </div>
        )}

        <form className="admin-login-form" onSubmit={handleLogin} style={{ opacity: success ? 0.5 : 1, pointerEvents: success ? 'none' : 'auto' }}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success}
              required
            />
          </div>

          <button className="admin-login-button" type="submit" disabled={loading || success}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Loading...
              </>
            ) : success ? (
              <>
                <CheckCircle size={16} />
                Berhasil!
              </>
            ) : (
              <>
                <LogIn size={16} />
                Masuk
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Kembali ke <a onClick={handleBackToHome}>halaman utama</a></p>
        </div>
      </div>
    </div>
  );
}
