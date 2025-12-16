import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import okelogo from '../assets/Logo-Nav.svg';

export default function Navbar({ setCurrentPage, onLogoClick, scrollToSection, setPendingSectionScroll, adminToken }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Manage body class when menu opens/closes
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('navbar-menu-open');
    } else {
      document.body.classList.remove('navbar-menu-open');
    }
    
    return () => {
      document.body.classList.remove('navbar-menu-open');
    };
  }, [mobileMenuOpen]);

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      setCurrentPage('landing');
    }
    setMobileMenuOpen(false);
  };

  const handleSectionClick = (sectionId) => {
    // If already on landing page, scroll immediately
    if (scrollToSection) {
      setMobileMenuOpen(false);
      scrollToSection(sectionId);
    } else {
      // If on another page, set pending scroll and change page
      setCurrentPage('landing');
      setMobileMenuOpen(false);
      if (setPendingSectionScroll) {
        setPendingSectionScroll(sectionId);
      }
    }
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">
        <div className="navbar-logo" onClick={handleLogoClick}>
          <div className="navbar-bookmark">
            <img src={okelogo} alt="Logo" className="navbar-logo-image" />
          </div>
          <span className="navbar-brand">Temu<br/>Cepat</span>
        </div>

        <div className="navbar-right-group">
          <div className="navbar-links-desktop">
            <a className="navbar-link" onClick={() => handleSectionClick('eksplorasi-section')}>EKSPLORASI</a>
            <a className="navbar-link" onClick={() => handleSectionClick('faq-section')}>FAQ</a>
            <a className="navbar-link" onClick={() => setCurrentPage('my-laporan')}>HISTORY</a>
          </div>

          <div className="navbar-actions">
            {adminToken ? (
              <button className="navbar-cta navbar-cta-admin" onClick={() => setCurrentPage('admin')}>MENU ADMIN</button>
            ) : (
              <button className="navbar-cta navbar-cta-secondary" onClick={() => setCurrentPage('admin-login')}>ADMIN LOGIN</button>
            )}
            <button className="navbar-cta navbar-cta-primary" onClick={() => setCurrentPage('laporan-form')}>LAPORKAN</button>

            <button className="navbar-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="navbar-mobile-backdrop active" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="navbar-mobile-menu-header">
          <button className="navbar-mobile-close" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <a className="navbar-mobile-link" onClick={() => handleSectionClick('eksplorasi-section')}>EKSPLORASI</a>
        <a className="navbar-mobile-link" onClick={() => handleSectionClick('faq-section')}>FAQ</a>
        <a className="navbar-mobile-link" onClick={() => { setCurrentPage('my-laporan'); setMobileMenuOpen(false); }}>HISTORY</a>
        <div className="navbar-mobile-menu-divider"></div>
        {adminToken ? (
          <a className="navbar-mobile-link navbar-mobile-admin-login is-admin" onClick={() => { setCurrentPage('admin'); setMobileMenuOpen(false); }}>MENU ADMIN</a>
        ) : (
          <a className="navbar-mobile-link navbar-mobile-admin-login" onClick={() => { setCurrentPage('admin-login'); setMobileMenuOpen(false); }}>ADMIN LOGIN</a>
        )}
        <button className="navbar-cta navbar-cta-primary" onClick={() => { setCurrentPage('laporan-form'); setMobileMenuOpen(false); }}>LAPORKAN</button>
      </div>
    </nav>
  );
}
