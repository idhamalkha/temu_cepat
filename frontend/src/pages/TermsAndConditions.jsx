import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/terms-and-conditions.css';

export default function TermsAndConditions({ setCurrentPage, onNavigateToSection, setPendingSectionScroll }) {
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
    <div className={`terms-wrapper ${isEntering ? 'page-entering' : 'page-exiting'}`}>
        <Navbar setCurrentPage={setCurrentPage} onLogoClick={handleLogoClick} onNavigateToSection={onNavigateToSection} setPendingSectionScroll={setPendingSectionScroll} />

      {/* Hero Section */}
      <section className="terms-hero">
        <div className="terms-hero-content">
          <h1 className="terms-hero-title">Ketentuan Penggunaan</h1>
          <p className="terms-hero-subtitle">Harap baca ketentuan penggunaan ini dengan seksama sebelum menggunakan platform Temu Cepat.</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="terms-content">
        <div className="terms-container">
          <div className="content-section">
            <h2>1. Penerimaan Syarat dan Ketentuan</h2>
            <p>Dengan mengakses dan menggunakan Temu Cepat, Anda menerima dan setuju untuk terikat oleh ketentuan dan kondisi perjanjian ini. Jika Anda tidak setuju dengan bagian mana pun dari ketentuan ini, maka Anda tidak berhak menggunakan layanan kami.</p>
          </div>

          <div className="content-section">
            <h2>2. Lisensi Penggunaan</h2>
            <p>Kami memberikan lisensi terbatas, tidak eksklusif, dan dapat dibatalkan kepada Anda untuk menggunakan Temu Cepat untuk tujuan pribadi yang sah. Anda tidak diperbolehkan untuk mereproduksi, menjual, menyebarluaskan, atau mengeksploitasi konten apa pun dari layanan kami tanpa izin tertulis dari kami.</p>
          </div>

          <div className="content-section">
            <h2>3. Konten Pengguna</h2>
            <p>Dengan mengirimkan laporan barang hilang, foto, atau konten lainnya ke Temu Cepat, Anda memberikan kami lisensi untuk menggunakan, memodifikasi, dan menampilkan konten tersebut. Anda bertanggung jawab penuh atas konten yang Anda posting dan harus memastikan bahwa konten tersebut tidak melanggar hak siapa pun.</p>
          </div>

          <div className="content-section">
            <h2>4. Pembatasan Tanggung Jawab</h2>
            <p>Temu Cepat disediakan atas dasar "sebagaimana adanya". Kami tidak memberikan jaminan apa pun, baik tersurat maupun tersirat, tentang keandalan, ketepatan waktu, atau kinerja layanan. Kami tidak bertanggung jawab atas kerugian atau kerusakan yang timbul dari penggunaan layanan kami.</p>
          </div>

          <div className="content-section">
            <h2>5. Perilaku Pengguna</h2>
            <p>Anda setuju untuk tidak menggunakan Temu Cepat untuk tujuan yang merugikan, ilegal, atau melanggar hak orang lain. Ini termasuk tetapi tidak terbatas pada posting konten yang kasar, menyesatkan, atau melanggar privasi orang lain.</p>
          </div>

          <div className="content-section">
            <h2>6. Penghentian Akses</h2>
            <p>Kami berhak untuk menangguhkan atau menghentikan akses Anda ke Temu Cepat kapan saja, tanpa pemberitahuan sebelumnya, jika kami percaya bahwa Anda telah melanggar ketentuan ini atau melakukan aktivitas yang berbahaya.</p>
          </div>

          <div className="content-section">
            <h2>7. Perubahan Layanan</h2>
            <p>Kami berhak untuk memodifikasi atau menghentikan layanan Temu Cepat kapan saja, dengan atau tanpa pemberitahuan kepada Anda. Kami juga berhak untuk memperbarui ketentuan ini dari waktu ke waktu.</p>
          </div>

          <div className="content-section">
            <h2>8. Hukum yang Berlaku</h2>
            <p>Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Negara Kesatuan Republik Indonesia. Setiap perselisihan yang timbul dari ketentuan ini akan diselesaikan melalui pengadilan yang berwenang di Indonesia.</p>
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
