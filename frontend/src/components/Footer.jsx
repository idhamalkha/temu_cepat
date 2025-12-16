import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LogoFooter from '../assets/Logo-Footer.svg';
import '../styles/footer.css';

export default function Footer({ setCurrentPage }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && showPopup) {
        handleClosePopup();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showPopup]);

  const handleComingSoon = () => {
    setShowPopup(true);
    setIsClosing(false);
  };

  const handleClosePopup = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 300);
  };

  return (
    <footer className="landing-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={LogoFooter} alt="Logo" />
          </div>
          <p className="footer-copy">© Copyright Temu Cepat, 2025.</p>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Jadi bagian dari kami</h4>
            <ul>
              <li><a onClick={() => setCurrentPage('about')}>Tentang Kami</a></li>
              <li><a onClick={handleComingSoon}>Gabung Komunitas</a></li>
              <li><a onClick={handleComingSoon}>Gabung Tim</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Bantuan dan Panduan</h4>
            <ul>
              <li><a onClick={() => setCurrentPage('privacy-policy')}>Kebijakan Privasi</a></li>
              <li><a onClick={() => setCurrentPage('terms-and-conditions')}>Ketentuan Penggunaan</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Coming Soon Popup */}
      {showPopup && (
        <div className={`popup-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClosePopup}>
          <div className={`popup-container ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={handleClosePopup}>
              <X size={20} />
            </button>
            <div className="popup-content">
              <h2>Fitur Segera Hadir</h2>
              <p>Kami sedang mempersiapkan fitur ini untuk memberikan pengalaman terbaik bagi Anda.</p>
              <p className="popup-subtitle">Terima kasih atas kesabaran Anda!</p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
