import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Heart, Search } from 'lucide-react';
import LaporanForm from './pages/LaporanForm_v2';
import MyLaporan from './pages/MyLaporan';
import LaporanDetail from './pages/LaporanDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EntranceAnimation from './components/EntranceAnimation';
import { maybeRestoreCookieFromLocalStorage, laporanAPI } from './api';
import LogoNav from './assets/Logo-Nav.svg';
import LogoFooter from './assets/Logo-Footer.svg';
import './styles/navbar.css';
import './styles/landing.css';

// Intersection Observer Hook untuk scroll animations
function useScrollAnimation(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Uncomment jika ingin trigger sekali saja:
        // observer.unobserve(entry.target);
      }
    }, {
      threshold: 0.1,
      ...options
    });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
}

// Page wrapper with transition animation
function PageWrapper({ children, isTransitioning }) {
  return (
    <div
      className="page-transition-wrapper"
      style={{
        opacity: 1,
        animation: 'fadeInUp 0.5s ease-out',
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPageRaw] = useState(() => {
    // Load persisted page from localStorage only on initial load
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      // If URL has changed, use it
      const pathToPage = {
        '/': 'landing',
        '/about': 'about',
        '/privacy-policy': 'privacy-policy',
        '/terms-and-conditions': 'terms-and-conditions',
        '/laporan': 'laporan-form',
        '/my-laporan': 'my-laporan',
        '/admin': 'admin',
        '/admin-login': 'admin-login'
      };
      
      // Check if path starts with /laporan/ (detail page)
      if (window.location.pathname.startsWith('/laporan/')) {
        return 'laporan-detail';
      }
      
      return pathToPage[window.location.pathname] || 'landing';
    }
    const saved = localStorage.getItem('temu_cepat_current_page');
    return saved || 'landing';
  });
  const [token, setToken] = useState(localStorage.getItem('laporan_token'));
  const [adminToken, setAdminTokenRaw] = useState(localStorage.getItem('admin_token'));
  const [pendingSectionScroll, setPendingSectionScroll] = useState(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [selectedLaporanId, setSelectedLaporanId] = useState(() => {
    // Extract laporan ID from URL if on detail page
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/laporan/')) {
      const id = window.location.pathname.split('/')[2];
      return id ? parseInt(id, 10) : null;
    }
    return null;
  });

  // Wrapper for setCurrentPage to ensure proper navigation
  const setCurrentPage = (page) => {
    setCurrentPageRaw(page);
    localStorage.setItem('temu_cepat_current_page', page);
    window.scrollTo(0, 0); // Auto-scroll to top on page change
  };

  // Wrapper for setAdminToken to sync with localStorage
  const setAdminToken = (token) => {
    setAdminTokenRaw(token);
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  };

  // Monitor admin_token changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('laporan_token'));
      const newAdminToken = localStorage.getItem('admin_token');
      setAdminTokenRaw(newAdminToken);
      
      // If admin token was removed and we're on admin page, redirect to landing
      if (!newAdminToken && currentPage === 'admin') {
        setCurrentPage('landing');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentPage]);

  // Try to restore cookie from localStorage if user enabled fallback (opt-in)
  useEffect(() => {
    try {
      maybeRestoreCookieFromLocalStorage();
    } catch (e) {
      // ignore
    }
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update URL based on current page and handle browser back/forward buttons
  useEffect(() => {
    const pageToUrl = {
      'landing': '/',
      'about': '/about',
      'privacy-policy': '/privacy-policy',
      'terms-and-conditions': '/terms-and-conditions',
      'laporan-form': '/laporan',
      'my-laporan': '/my-laporan',
      'admin': '/admin',
      'admin-login': '/admin-login'
    };
    
    let url = pageToUrl[currentPage] || '/';
    
    // If on laporan-detail page, append the ID to URL
    if (currentPage === 'laporan-detail' && selectedLaporanId) {
      url = `/laporan/${selectedLaporanId}`;
    }
    
    // Push state to history
    window.history.pushState({ page: currentPage, laporanId: selectedLaporanId }, '', url);
    // Also save to localStorage so it persists on refresh
    localStorage.setItem('temu_cepat_current_page', currentPage);

    const handlePopState = (event) => {
      // This handles browser back/forward buttons
      setIsPageTransitioning(true);
      
      if (event.state && event.state.page) {
        // Update both state and localStorage when back/forward
        setCurrentPageRaw(event.state.page);
        if (event.state.page === 'laporan-detail' && event.state.laporanId) {
          setSelectedLaporanId(event.state.laporanId);
        }
        localStorage.setItem('temu_cepat_current_page', event.state.page);
      } else {
        // If no state, go to landing
        setCurrentPageRaw('landing');
        setSelectedLaporanId(null);
        localStorage.setItem('temu_cepat_current_page', 'landing');
      }
      
      setTimeout(() => setIsPageTransitioning(false), 300);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage, selectedLaporanId]);

  if (currentPage === 'landing') {
    return (
      <>
        <EntranceAnimation />
        <PageWrapper isTransitioning={isPageTransitioning}><LandingPage setCurrentPage={setCurrentPage} setSelectedLaporanId={setSelectedLaporanId} adminToken={adminToken} pendingSectionScroll={pendingSectionScroll} setPendingSectionScroll={setPendingSectionScroll} /></PageWrapper>
      </>
    );
  }

  if (currentPage === 'about') {
    return <PageWrapper isTransitioning={isPageTransitioning}><About setCurrentPage={setCurrentPage} setPendingSectionScroll={setPendingSectionScroll} /></PageWrapper>;
  }

  if (currentPage === 'privacy-policy') {
    return <PageWrapper isTransitioning={isPageTransitioning}><PrivacyPolicy setCurrentPage={setCurrentPage} setPendingSectionScroll={setPendingSectionScroll} /></PageWrapper>;
  }

  if (currentPage === 'terms-and-conditions') {
    return <PageWrapper isTransitioning={isPageTransitioning}><TermsAndConditions setCurrentPage={setCurrentPage} setPendingSectionScroll={setPendingSectionScroll} /></PageWrapper>;
  }

  if (currentPage === 'laporan-form') {
    return <PageWrapper isTransitioning={isPageTransitioning}><LaporanForm setCurrentPage={setCurrentPage} setToken={setToken} /></PageWrapper>;
  }

  if (currentPage === 'my-laporan') {
    return <PageWrapper isTransitioning={isPageTransitioning}><MyLaporan setCurrentPage={setCurrentPage} /></PageWrapper>;
  }

  if (currentPage === 'admin-login') {
    return <PageWrapper isTransitioning={isPageTransitioning}><AdminLoginPage setCurrentPage={setCurrentPage} setAdminToken={setAdminToken} /></PageWrapper>;
  }

  if (currentPage === 'laporan-detail' && selectedLaporanId) {
    return (
      <>
        <Navbar setCurrentPage={setCurrentPage} adminToken={adminToken} />
        <LaporanDetail laporanId={selectedLaporanId} setCurrentPage={setCurrentPage} />
        <Footer setCurrentPage={setCurrentPage} />
      </>
    );
  }

  if (currentPage === 'admin') {
    // Check if admin is logged in
    if (!adminToken) {
      setCurrentPage('admin-login');
      return null;
    }
    return <PageWrapper isTransitioning={isPageTransitioning}><AdminDashboard setCurrentPage={setCurrentPage} setAdminToken={setAdminToken} /></PageWrapper>;
  }

  return null;
}

function LandingPage({ setCurrentPage, setSelectedLaporanId, adminToken, pendingSectionScroll, setPendingSectionScroll }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [carouselList, setCarouselList] = useState([]);
  const [eksplorasiList, setEksplorasiList] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eksplorasiLoading, setEksplorasiLoading] = useState(false);
  const [filterLokasi, setFilterLokasi] = useState('');
  const [expandedFaqIdx, setExpandedFaqIdx] = useState(null);
  
  // Scroll animation refs
  const [carouselRef, carouselVisible] = useScrollAnimation();
  const [eksplorasiRef, eksplorasiVisible] = useScrollAnimation();
  const [faqRef, faqVisible] = useScrollAnimation();
  const [ctaRef, ctaVisible] = useScrollAnimation();
  const [province, setProvince] = useState('');
  const [provinceId, setProvinceId] = useState(null);
  const [citySelected, setCitySelected] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [provincePanelOpen, setProvincePanelOpen] = useState(false);
  const [cityPanelOpen, setCityPanelOpen] = useState(false);
  const [provinceClosing, setProvinceClosing] = useState(false);
  const [cityClosing, setCityClosing] = useState(false);
  const [eksplorasiLimit, setEksplorasiLimit] = useState(12);
  const [categorySelected, setCategorySelected] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
  const [categoryClosing, setCategoryClosing] = useState(false);
  const provinceRef = useRef(null);
  const cityRef = useRef(null);
  const categoryRef = useRef(null);
  const searchRef = useRef(null);

  // fetch province list from backend
  const fetchProvinceOptions = async () => {
    try {
      const response = await fetch('http://localhost:8000/wilayah/provinsi');
      if (response.ok) {
        const data = await response.json();
        setProvinceOptions(data);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  // fetch city list for selected province
  const fetchCityOptions = async (provId) => {
    if (!provId) { setCityOptions([]); return; }
    try {
      const response = await fetch(`http://localhost:8000/wilayah/kota/${provId}`);
      if (response.ok) {
        const data = await response.json();
        setCityOptions(data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // fetch category list from backend
  const fetchCategoryOptions = async () => {
    try {
      const response = await fetch('http://localhost:8000/kategori');
      if (response.ok) {
        const data = await response.json();
        setCategoryOptions(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // fetch laporan untuk carousel (tanpa filter, selalu menampilkan semua aktif)
  const fetchCarouselList = async (limit = 200) => {
    try {
      setLoading(true);
      const data = await laporanAPI.getAll(null, limit, {});
      setCarouselList(data || []);
    } catch (error) {
      console.error('Error fetching carousel laporan:', error);
      setCarouselList([]);
    } finally {
      setLoading(false);
    }
  };

  // fetch laporan untuk eksplorasi (dengan filter)
  const fetchEksplorasiList = async (limit = 200) => {
    try {
      setEksplorasiLoading(true);
      // Build filters object
      const filters = {};
      if (categorySelected.length > 0) {
        filters.id_kategori = categorySelected[0].id_kategori;
      }
      if (provinceId) {
        filters.id_provinsi = provinceId;
      }
      if (citySelected.length > 0) {
        filters.id_kota = citySelected[0].id_kota;
      }
      
      const data = await laporanAPI.getAll(null, limit, filters);
      setEksplorasiList(data || []);
    } catch (error) {
      console.error('Error fetching eksplorasi laporan:', error);
      setEksplorasiList([]);
    } finally {
      setEksplorasiLoading(false);
    }
  };

  useEffect(() => {
    fetchCarouselList();
    fetchProvinceOptions();
  }, []);
  
  // When province changes, fetch cities and reset city selection
  useEffect(() => {
    if (provinceId) {
      fetchCityOptions(provinceId);
    } else {
      setCityOptions([]);
    }
    setCitySelected([]);
  }, [provinceId]);

  // When filters change (kategori, provinsi, kota), fetch eksplorasi dengan filters
  useEffect(() => {
    // Clear eksplorasi list first untuk trigger animasi saat data muncul kembali
    setEksplorasiList([]);
    // Reset limit untuk mulai dari awal
    setEksplorasiLimit(12);
    // Delay kecil untuk efek visual yang lebih jelas
    const timer = setTimeout(() => {
      fetchEksplorasiList();
    }, 100);
    return () => clearTimeout(timer);
  }, [categorySelected, provinceId, citySelected]);

  // Close panels when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (provinceRef.current && !provinceRef.current.contains(e.target)) {
        if (provincePanelOpen) {
          setProvinceClosing(true);
          setTimeout(() => { setProvincePanelOpen(false); setProvinceClosing(false); }, 200);
        }
      }
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        if (cityPanelOpen) {
          setCityClosing(true);
          setTimeout(() => { setCityPanelOpen(false); setCityClosing(false); }, 200);
        }
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        if (categoryPanelOpen) {
          setCategoryClosing(true);
          setTimeout(() => { setCategoryPanelOpen(false); setCategoryClosing(false); }, 200);
        }
      }
      // clicking outside search won't close it, but can be used later
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [provincePanelOpen, cityPanelOpen, categoryPanelOpen]);

  // Handle scroll to section when returning from other pages or clicking on landing
  useEffect(() => {
    if (pendingSectionScroll) {
      setTimeout(() => {
        const element = document.getElementById(pendingSectionScroll) || document.querySelector(`.${pendingSectionScroll}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setPendingSectionScroll(null);
      }, 100);
    }
  }, [pendingSectionScroll, setPendingSectionScroll]);

  const lokasiBersama = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta', 'Makassar'];
  const faqItems = [
    { q: 'Bagaimana cara membuat laporan barang hilang?', a: 'Klik tombol "Mulai Melaporkan", isi form dengan detail barang, lokasi, dan foto. Laporan Anda akan langsung terlihat oleh ribuan pengguna.' },
    { q: 'Apakah perlu login untuk membuat laporan?', a: 'Tidak perlu login! Siapa saja bisa membuat laporan dengan mudah tanpa membuat akun.' },
    { q: 'Berapa lama barang hilang saya ditemukan?', a: 'Kami tidak bisa menjamin waktu pasti, tapi dengan ribuan pengguna aktif, peluang menemukan barang Anda lebih tinggi.' },
    { q: 'Bagaimana jika barang saya sudah ditemukan?', a: 'Anda bisa mengubah status laporan menjadi "Ditemukan" melalui dashboard Anda.' },
    { q: 'Apa yang perlu saya lakukan jika melihat barang hilang orang lain?', a: 'Anda bisa menghubungi pemilik barang melalui informasi kontak yang tersedia di laporan.' },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId) || document.querySelector(`.${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="landing-wrapper">
      <Navbar setCurrentPage={setCurrentPage} adminToken={adminToken} scrollToSection={scrollToSection} setPendingSectionScroll={setPendingSectionScroll} />

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-subtitle">Selamat Datang di</p>
            <h1 className="hero-title">Temu Cepat</h1>
            <p className="hero-description">
              Platform digital untuk membantu masyarakat melaporkan, menemukan, dan saling berbagi informasi tentang barang-barang yang hilang dengan cara yang mudah, cepat, dan aman.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => setCurrentPage('laporan-form')}>Mulai Melaporkan</button>
            </div>
          </div>
        </div>
      </section>

      <section className="carousel-section" ref={carouselRef}>
        {loading ? (
          <div className="loading-state">⏳ Memuat laporan terbaru...</div>
        ) : carouselList.length === 0 ? (
          <div className="empty-state">Belum ada laporan. Jadilah yang pertama melaporkan barang hilang!</div>
        ) : (
          <div className="carousel-wrapper">
            <div className="carousel-main">
              {/* Filter only 'Aktif' status and triplicate for seamless infinite scroll */}
              {[...carouselList.filter(l => l.status === 'Aktif'), ...carouselList.filter(l => l.status === 'Aktif'), ...carouselList.filter(l => l.status === 'Aktif')].map((laporan, idx) => (
                <div key={idx} className="carousel-card">
                  {/* Card Header with Reporter Name */}
                  <div className="carousel-header">
                    <div className="carousel-reporter">
                      <span className="reporter-name">{laporan.nama_pelapor}</span>
                    </div>
                  </div>

                  {/* Card Image */}
                  <div className="carousel-image">
                    {laporan.foto_url ? (
                      <img src={laporan.foto_url} alt={laporan.judul_laporan} />
                    ) : (
                      <div className="image-placeholder"><Heart size={40} /></div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="carousel-content">
                    <h3 className="carousel-title">{laporan.judul_laporan}</h3>
                    
                    <div className="carousel-meta">
                      <div className="meta-item">
                        <span className="meta-label">Kategori</span>
                        <span className="meta-value">{laporan.kategori_nama || '—'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Lokasi</span>
                        <span className="meta-value">{laporan.lokasi_hilang || '—'}</span>
                      </div>
                    </div>

                    <div className="carousel-status-wrapper">
                      <span className="meta-label">Status</span>
                      <span className={`meta-value status ${laporan.status?.toLowerCase()}`}>{laporan.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="eksplorasi-section" id="eksplorasi-section" ref={eksplorasiRef}>
        <div className="eksplorasi-header">
          <h2 className={`section-title ${eksplorasiVisible ? 'fade-in-up' : ''}`} style={{ fontFamily: 'Times New Roman' }}>Eksplorasi</h2>
          <p className={`eksplorasi-description ${eksplorasiVisible ? 'fade-in-up' : ''}`}>Di sini tersedia berbagai pilihan barang hilang yang telah dikurasi dari beragam lokasi. Temukan barang yang Anda cari dengan memfilter berdasarkan lokasi dan kategori.</p>
        </div>

        <div className="filter-buttons">
          {/* Province dropdown (single select, from backend) */}
          <div ref={provinceRef} className={`filter-group dropdown ${provincePanelOpen ? 'active' : ''}`}>
            <button className="dropdown-toggle" onClick={() => { const opening = !provincePanelOpen; setProvincePanelOpen(opening); setCityPanelOpen(false); if (opening && provinceOptions.length === 0) fetchProvinceOptions(); }}>
              {province || 'Pilih Provinsi'}
              <span className={`caret ${provincePanelOpen ? 'open' : ''}`}>{provincePanelOpen ? '−' : '+'}</span>
            </button>
            {(provincePanelOpen || provinceClosing) && (
              <div className={`dropdown-panel ${provinceClosing ? 'closing' : ''}`}>
                <ul className="checkbox-list">
                  {provinceOptions.length > 0 ? (
                    provinceOptions.map((prov) => (
                      <li key={prov.id_provinsi} className="checkbox-item" onClick={() => { setProvince(prov.nama_provinsi); setProvinceId(prov.id_provinsi); setProvinceClosing(true); setTimeout(() => { setProvincePanelOpen(false); setProvinceClosing(false); }, 200); }}>
                        <input type="radio" name="prov" checked={province === prov.nama_provinsi} readOnly /> {prov.nama_provinsi}
                      </li>
                    ))
                  ) : (
                    <li className="checkbox-item" style={{ color: '#999' }}>Memuat provinsi...</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* City dropdown (checkbox list, multi-select, from backend) */}
          <div ref={cityRef} className={`filter-group dropdown ${cityPanelOpen ? 'active' : ''}`}>
            <button className="dropdown-toggle" onClick={() => { const opening = !cityPanelOpen; setCityPanelOpen(opening); setProvincePanelOpen(false); }}>
              {citySelected.length > 0 ? citySelected.map(c => c.nama_kota).join(', ') : 'Pilih Kota'}
              <span className={`caret ${cityPanelOpen ? 'open' : ''}`}>{cityPanelOpen ? '−' : '+'}</span>
            </button>
            {(cityPanelOpen || cityClosing) && (
              <div className={`dropdown-panel ${cityClosing ? 'closing' : ''}`}>
                <ul className="checkbox-list">
                  {cityOptions.map((c) => (
                    <li key={c.id_kota} className="checkbox-item">
                      <label>
                        <input type="checkbox" checked={citySelected.some(sel => sel.id_kota === c.id_kota)} onChange={(e) => {
                          if (e.target.checked) setCitySelected(prev => [...prev, c]);
                          else setCitySelected(prev => prev.filter(sel => sel.id_kota !== c.id_kota));
                        }} /> {c.nama_kota}
                      </label>
                    </li>
                  ))}
                </ul>
                <div className="dropdown-actions">
                  <button className="btn btn-reset" onClick={() => setCitySelected([])}>Reset</button>
                  <button className="btn btn-apply" onClick={() => { setCityClosing(true); setTimeout(() => { setCityPanelOpen(false); setCityClosing(false); }, 200); }}>Terapkan</button>
                </div>
              </div>
            )}
          </div>

          {/* Category dropdown (checkbox list, multi-select, from backend) */}
          <div ref={categoryRef} className={`filter-group dropdown ${categoryPanelOpen ? 'active' : ''}`}>
            <button className="dropdown-toggle" onClick={() => { const opening = !categoryPanelOpen; setCategoryPanelOpen(opening); setProvincePanelOpen(false); setCityPanelOpen(false); if (opening && categoryOptions.length === 0) fetchCategoryOptions(); }}>
              {categorySelected.length > 0 ? categorySelected.map(c => c.nama_kategori).join(', ') : 'Pilih Kategori'}
              <span className={`caret ${categoryPanelOpen ? 'open' : ''}`}>{categoryPanelOpen ? '−' : '+'}</span>
            </button>
            {(categoryPanelOpen || categoryClosing) && (
              <div className={`dropdown-panel ${categoryClosing ? 'closing' : ''}`}>
                <ul className="checkbox-list">
                  {categoryOptions.length > 0 ? (
                    categoryOptions.map((cat) => (
                      <li key={cat.id_kategori} className="checkbox-item">
                        <label>
                          <input type="checkbox" checked={categorySelected.some(sel => sel.id_kategori === cat.id_kategori)} onChange={(e) => {
                            if (e.target.checked) setCategorySelected(prev => [...prev, cat]);
                            else setCategorySelected(prev => prev.filter(sel => sel.id_kategori !== cat.id_kategori));
                          }} /> {cat.nama_kategori}
                        </label>
                      </li>
                    ))
                  ) : (
                    <li className="checkbox-item" style={{ color: '#999' }}>Memuat kategori...</li>
                  )}
                </ul>
                <div className="dropdown-actions">
                  <button className="btn btn-reset" onClick={() => setCategorySelected([])}>Reset</button>
                  <button className="btn btn-apply" onClick={() => { setCategoryClosing(true); setTimeout(() => { setCategoryPanelOpen(false); setCategoryClosing(false); }, 200); }}>Terapkan</button>
                </div>
              </div>
            )}
          </div>

          <div className="search-group" ref={searchRef}>
            <div className={`search-inner ${searchActive ? 'active' : ''}`}>
              <Search size={18} className="search-icon" />
              <div className="search-input-wrapper">
                <input 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onFocus={() => setSearchActive(true)}
                  onBlur={() => { setSearchActive(false); }}
                  type="text" 
                  placeholder="Cari barang..." 
                />
              </div>
            </div>
          </div>
        </div>

        {eksplorasiLoading && (
          <div className="eksplorasi-loading">
            <div className="eksplorasi-spinner">
              <div className="spinner"></div>
              <p>Memfilter laporan...</p>
            </div>
          </div>
        )}

        {!eksplorasiLoading && (
        <>
        <div className="eksplorasi-grid">
          {eksplorasiList
            .filter(laporan => {
              // search filter (client-side only)
              const text = ((laporan.nama_barang || '') + ' ' + (laporan.deskripsi || '') + ' ' + (laporan.kategori_nama || '')).toLowerCase();
              const matchesSearch = searchQuery ? text.includes(searchQuery.toLowerCase()) : true;

              // status filter - only aktif
              const matchesStatus = laporan.status === 'Aktif';

              return matchesSearch && matchesStatus;
            })
            .slice(0, eksplorasiLimit)
            .map((laporan, idx) => (
              <div key={`${laporan.id_laporan}-${idx}`} className="eksplorasi-card eksplorasi-card-new fade-in-up">
                <div className="eksplorasi-header-new">
                  <span className="eksplorasi-reporter">{laporan.nama_pelapor}</span>
                </div>
                <div className="eksplorasi-image-new">
                  {laporan.foto_url ? (
                    <img src={laporan.foto_url} alt={laporan.judul_laporan} />
                  ) : (
                    <div className="image-placeholder"><Heart size={32} /></div>
                  )}
                </div>
                <div className="eksplorasi-content-new">
                  <h3 className="eksplorasi-title-new">{laporan.judul_laporan}</h3>
                  <div className="eksplorasi-meta-new">
                    <div className="meta-item-new">
                      <span className="meta-label-new">Kategori</span>
                      <span className="meta-value-new">{laporan.kategori_nama}</span>
                    </div>
                    <div className="meta-item-new">
                      <span className="meta-label-new">Lokasi</span>
                      <span className="meta-value-new">{laporan.lokasi_hilang}</span>
                    </div>
                  </div>
                  <div className="eksplorasi-footer-new">
                    <span className={`meta-value-new status ${laporan.status?.toLowerCase()}`}>{laporan.status}</span>
                    <button 
                      className="eksplorasi-view-btn"
                      onClick={() => {
                        setSelectedLaporanId(laporan.id_laporan);
                        setCurrentPage('laporan-detail');
                      }}
                    >
                      Lihat
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {eksplorasiList
          .filter(laporan => {
            const text = ((laporan.nama_barang || '') + ' ' + (laporan.deskripsi || '') + ' ' + (laporan.kategori_nama || '')).toLowerCase();
            const matchesSearch = searchQuery ? text.includes(searchQuery.toLowerCase()) : true;
            const matchesStatus = laporan.status === 'Aktif';
            return matchesSearch && matchesStatus;
          }).length > eksplorasiLimit && (
          <div className="eksplorasi-load-more-container">
            <button 
              className="eksplorasi-load-more-btn"
              onClick={() => setEksplorasiLimit(prev => prev + 12)}
            >
              Muat lebih banyak
            </button>
          </div>
        )}
        </>
        )}
      </section>

      <section className="faq-section" id="faq-section" ref={faqRef}>
        <h2 className={`faq-title ${faqVisible ? 'fade-in-up' : ''}`}>Pertanyaan yang Sering Diajukan</h2>
        <div className="faq-container">
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              className={`faq-item ${faqVisible ? 'fade-in-up' : ''} ${expandedFaqIdx === idx ? 'expanded' : ''}`}
              onClick={() => setExpandedFaqIdx(expandedFaqIdx === idx ? null : idx)}
            >
              <div className="faq-question">
                <span>{item.q}</span>
                <span className="faq-icon" style={{ transform: expandedFaqIdx === idx ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
              </div>
              <div className="faq-answer-wrapper">
                <div className="faq-answer">{item.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="final-cta-section" ref={ctaRef}>
        <div className="final-cta-content">
          <h2 className={`final-cta-title ${ctaVisible ? 'fade-in-up' : ''}`}>Siap Membantu?</h2>
          <p className={`final-cta-desc ${ctaVisible ? 'fade-in-up' : ''}`}>Jangan biarkan barang berharga hilang begitu saja. Laporkan sekarang dan bantu menemukan barang yang hilang.</p>
          <div className="final-cta-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => setCurrentPage('laporan-form')}>Buat Laporan Sekarang</button>
            <button className="btn btn-secondary btn-lg" onClick={() => setCurrentPage('my-laporan')}>Lihat Laporan Lainnya</button>
          </div>
        </div>
      </section>

      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
