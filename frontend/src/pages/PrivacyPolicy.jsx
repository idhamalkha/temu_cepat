import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/privacy-policy.css';

export default function PrivacyPolicy({ setCurrentPage, onNavigateToSection, setPendingSectionScroll }) {
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Scroll to top when page mounts
    window.scrollTo(0, 0);
    setIsEntering(true);
  }, []);

  const handleLogoClick = () => {
    setIsEntering(false);
    setTimeout(() => {
      setCurrentPage('landing');
    }, 300);
  };

  return (
    <div className={`privacy-wrapper ${isEntering ? 'page-entering' : 'page-exiting'}`}>
        <Navbar setCurrentPage={setCurrentPage} onLogoClick={handleLogoClick} onNavigateToSection={onNavigateToSection} setPendingSectionScroll={setPendingSectionScroll} />

      {/* Hero Section */}
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <h1 className="privacy-hero-title">Kebijakan Privasi</h1>
          <p className="privacy-hero-subtitle">Kami berkomitmen melindungi privasi Anda. Pelajari bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="privacy-content">
        <div className="privacy-container">
          <div className="content-section">
            <h2>Pengumpulan Data</h2>
            <p>Kami mengumpulkan informasi yang Anda berikan secara langsung saat membuat laporan barang hilang. Informasi ini mencakup nama, nomor telepon, deskripsi barang, lokasi, dan foto.</p>
          </div>

          <div className="content-section">
            <h2>Penggunaan Data</h2>
            <p>Data Anda digunakan untuk memproses laporan barang hilang dan membantu komunitas dalam pencarian. Kami tidak akan pernah menjual atau membagikan data pribadi Anda kepada pihak ketiga tanpa persetujuan Anda.</p>
          </div>

          <div className="content-section">
            <h2>Keamanan Data</h2>
            <p>Kami menggunakan enkripsi dan teknologi keamanan lainnya untuk melindungi data Anda dari akses tidak sah. Namun, tidak ada metode transmisi internet yang 100% aman.</p>
          </div>

          <div className="content-section">
            <h2>Hak Anda</h2>
            <p>Anda memiliki hak untuk mengakses, mengubah, atau menghapus data pribadi Anda kapan saja. Untuk melakukan ini, hubungi kami melalui email yang tersedia di halaman kontak.</p>
          </div>

          <div className="content-section">
            <h2>Perubahan Kebijakan</h2>
            <p>Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memposting kebijakan baru di halaman ini dan memperbarui tanggal "Terakhir diperbarui" di bawah.</p>
          </div>

          <div className="last-updated">
            <p>Terakhir diperbarui: 15 November 2025</p>
          </div>
        </div>
      </section>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
