import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/about.css';

export default function About({ setCurrentPage, onNavigateToSection, setPendingSectionScroll }) {
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Scroll to top when About page mounts
    window.scrollTo(0, 0);
    
    // Trigger enter animation
    setIsEntering(true);
  }, []);

  const handleLogoClick = () => {
    setIsEntering(false);
    // Wait for animation to complete before navigating
    setTimeout(() => {
      setCurrentPage('landing');
    }, 300);
  };

  return (
    <div className={`about-wrapper ${isEntering ? 'page-entering' : 'page-exiting'}`}>
        <Navbar setCurrentPage={setCurrentPage} onLogoClick={handleLogoClick} onNavigateToSection={onNavigateToSection} setPendingSectionScroll={setPendingSectionScroll} />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">Tentang Temu Cepat</h1>
          <p className="about-hero-subtitle">Temu Cepat adalah platform komunitas yang hadir untuk membantu siapa saja menemukan barang hilang dengan cara yang lebih mudah, cepat, dan terarah. Kami ingin memastikan bahwa setiap orang memiliki tempat yang aman dan sederhana untuk melaporkan kehilangan, sekaligus memberikan kesempatan bagi orang lain untuk membantu.</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="about-container">
          <div className="story-content">
            <h2>Kisah Kami</h2>
            <p>Temu Cepat lahir dari sebuah pertanyaan sederhana: "Bagaimana jika ada cara yang lebih mudah dan efektif untuk menemukan barang hilang?" Kami percaya bahwa dengan kekuatan komunitas, tidak ada barang yang benar-benar hilang selamanya.</p>
            <div className="story-divider"></div>
            <p>Setiap laporan yang dibuat adalah cerita harapan. Setiap pengguna yang membantu adalah pahlawan bagi seseorang. Itulah mengapa kami membangun Temu Cepat — untuk menghubungkan orang-orang dan membuat perbedaan nyata dalam kehidupan mereka.</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="about-container">
          <h2>Nilai-Nilai Kami</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Komunitas</h3>
              <p>Kami percaya pada kekuatan saling membantu dan kolaborasi untuk mencapai tujuan bersama.</p>
            </div>
            <div className="value-card">
              <h3>Kepercayaan</h3>
              <p>Privasi dan keamanan data pengguna adalah prioritas utama kami setiap hari.</p>
            </div>
            <div className="value-card">
              <h3>Aksesibilitas</h3>
              <p>Platform kami dirancang agar mudah digunakan oleh siapa saja, tanpa memerlukan keahlian khusus.</p>
            </div>
            <div className="value-card">
              <h3>Efektivitas</h3>
              <p>Setiap fitur dirancang untuk memaksimalkan peluang menemukan barang hilang Anda kembali.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
