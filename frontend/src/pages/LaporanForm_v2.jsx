import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { ArrowLeft, AlertCircle, Check, Calendar, MapPin, Upload, X } from 'lucide-react';
import { laporanAPI, saveToken } from '../api';
import '../styles/laporan-form.css';

// Portal helper: renders popup content into document.body and positions it
function DropPortal({ anchorRef, show, children, offsetY = 6, matchWidth = true, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const portalRef = useRef(null);

  useLayoutEffect(() => {
    function update() {
      const a = anchorRef && anchorRef.current;
      if (!a) return;
      const rect = a.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + offsetY,
        left: rect.left + window.scrollX,
        width: matchWidth ? rect.width : rect.width
      });
    }

    if (show) {
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
    }

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchorRef, show, offsetY, matchWidth]);

  // Close portal on click outside (but not inside dropdown/calendar)
  useEffect(() => {
    if (!show) return;

    function handleClickOutside(e) {
      const portal = portalRef.current;
      const anchor = anchorRef?.current;
      
      // Don't close if clicking inside portal or anchor
      if (portal && portal.contains(e.target)) return;
      if (anchor && anchor.contains(e.target)) return;
      
      onClose && onClose();
    }

    // Delay to avoid immediate close on portal open
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, anchorRef, onClose]);

  if (!show) return null;

  const style = {
    position: 'absolute',
    top: pos.top + 'px',
    left: pos.left + 'px',
    width: pos.width + 'px',
    pointerEvents: 'auto',
    zIndex: 9999
  };

  return ReactDOM.createPortal(
    <div style={style} ref={portalRef} data-drop-portal="true">
      {children}
    </div>,
    document.body
  );
}

// Utility: format bytes into human-readable string
const formatBytes = (bytes, decimals = 1) => {
  if (!bytes) return '';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k)) || 0;
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function LaporanForm({ setCurrentPage, setToken }) {
  const [formData, setFormData] = useState({
    nama_pelapor: '',
    kontak_pelapor: '',
    email_pelapor: '',
    judul_laporan: '',
    deskripsi: '',
    lokasi_hilang: '',
    id_provinsi: '',
    id_kota: '',
    tanggal_hilang: '',
    id_kategori: '',
    foto_url: '',
    latitude: '',
    longitude: ''
  });

  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const fileInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const datePickerRef = useRef(null);
  const provinceDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const categorySearchRef = useRef(null);
  const provinceSearchRef = useRef(null);
  const citySearchRef = useRef(null);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingAddressSuggestions, setLoadingAddressSuggestions] = useState(false);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const mapsScriptLoadedRef = useRef(false);
  const addressDebounceRef = useRef(null);
  const addressCacheRef = useRef(new Map());
  const cityCenterCacheRef = useRef(new Map());
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionListRef = useRef(null);
  const mapboxKey = import.meta.env.VITE_MAPBOX_API_KEY || window.VITE_MAPBOX_API_KEY || null;
  const lokasiInputRef = useRef(null);

  // Fetch provinces on mount
  useEffect(() => {
    fetchProvinces();
    fetchCategories();
  }, []);

  // Load Google Maps Places API only if MAPBOX key not present and GOOGLE key is provided
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // If Mapbox is configured, we prefer Mapbox and skip loading Google script
    if (mapboxKey) return;

    if (window.google && window.google.maps && window.google.maps.places) {
      mapsScriptLoadedRef.current = true;
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      const dummy = document.createElement('div');
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummy);
      return;
    }

    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || window.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) return; // no key provided

    const id = 'gmaps-places-script';
    if (document.getElementById(id)) return;

    const script = document.createElement('script');
    script.id = id;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      mapsScriptLoadedRef.current = true;
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        const dummy = document.createElement('div');
        placesServiceRef.current = new window.google.maps.places.PlacesService(dummy);
      }
    };
    document.head.appendChild(script);
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    if (formData.id_provinsi) {
      fetchCities(formData.id_provinsi);
    } else {
      setCities([]);
    }
  }, [formData.id_provinsi]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // If click is inside any portal popup, ignore (portal popups live in document.body)
      if (e.target && e.target.closest && e.target.closest('[data-drop-portal]')) return;

      if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(e.target)) {
        setShowProvinceDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When category dropdown opens, focus search input without scrolling the page
  useEffect(() => {
    if (showCategoryDropdown) {
      setTimeout(() => {
        categorySearchRef.current && categorySearchRef.current.focus && categorySearchRef.current.focus({ preventScroll: true });
      }, 0);
    }
  }, [showCategoryDropdown]);

  useEffect(() => {
    if (showProvinceDropdown) {
      setTimeout(() => {
        provinceSearchRef.current && provinceSearchRef.current.focus && provinceSearchRef.current.focus({ preventScroll: true });
      }, 0);
    }
  }, [showProvinceDropdown]);

  useEffect(() => {
    if (showCityDropdown) {
      setTimeout(() => {
        citySearchRef.current && citySearchRef.current.focus && citySearchRef.current.focus({ preventScroll: true });
      }, 0);
    }
  }, [showCityDropdown]);

  // cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    };
  }, []);

  // Format date string (YYYY-MM-DD) to Indonesian long format, e.g. "16 November 2025"
  const formatDateIndo = (isoDateStr) => {
    if (!isoDateStr) return '';
    try {
      const d = new Date(isoDateStr + 'T00:00:00');
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (err) {
      return isoDateStr;
    }
  };

  // Generic input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Format contact display: insert space every 4 digits for readability
  const formatContactDisplay = (raw) => {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '');
    return digits.match(/.{1,4}/g)?.join(' ') || digits;
  };

  // Contact input handler: keep formData.kontak_pelapor as raw digits (no spaces)
  const handleContactChange = (e) => {
    const input = e.target.value || '';
    const digits = input.replace(/\D/g, '');
    // Optionally limit length to 20 digits to avoid extremely long input
    const limited = digits.slice(0, 20);
    setFormData(prev => ({ ...prev, kontak_pelapor: limited }));
  };

  const fetchProvinces = async () => {
    try {
      const response = await fetch('http://localhost:8000/wilayah/provinsi');
      const data = await response.json();
      setProvinces(data || []);
    } catch (err) {
      console.error('Error fetching provinces:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:8000/kategori');
      const data = await res.json();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchCities = async (provinceId) => {
    try {
      const response = await fetch(`http://localhost:8000/wilayah/kota/${provinceId}`);
      const data = await response.json();
      setCities(data || []);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  };

  // Address autocomplete: fetch predictions from Places AutocompleteService
  const nominatimSearch = async (query, cityName = '') => {
    if (!query) return [];
    const q = encodeURIComponent(cityName ? `${query} ${cityName}` : query);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=id&limit=6&addressdetails=1`;
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'SUPER-DE-App/1.0 (contact@example.com)' } });
      if (!res.ok) return [];
      const items = await res.json();
      return items.map(it => ({ description: it.display_name, lat: parseFloat(it.lat), lng: parseFloat(it.lon), raw: it }));
    } catch (err) {
      return [];
    }
  };

  const mapboxSearch = async (query, cityName = '') => {
    if (!query || !mapboxKey) return [];
    try {
      const q = encodeURIComponent(cityName ? `${query} ${cityName}` : query);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${mapboxKey}&autocomplete=true&country=id&limit=6`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data || !data.features) return [];
      return data.features.map(f => ({ description: f.place_name, lat: f.center[1], lng: f.center[0], raw: f }));
    } catch (err) {
      return [];
    }
  };

  // Select a suggestion (Mapbox/Nominatim object or Google with place_id)
  const selectAddressPrediction = async (prediction) => {
    if (!prediction) return;

    // If prediction already includes lat/lng (Mapbox or Nominatim), use it directly
    if (prediction.lat !== undefined && prediction.lng !== undefined) {
      setFormData(prev => ({ ...prev, lokasi_hilang: prediction.description, latitude: prediction.lat, longitude: prediction.lng }));
      setAddressSuggestions([]);
      setHighlightedIndex(-1);
      return;
    }

    // If Google Places is available and prediction has place_id, fetch details
    if (placesServiceRef.current && prediction.place_id) {
      placesServiceRef.current.getDetails({ placeId: prediction.place_id }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setFormData(prev => ({ ...prev, lokasi_hilang: prediction.description || place.formatted_address || place.name, latitude: lat, longitude: lng }));
        } else {
          setFormData(prev => ({ ...prev, lokasi_hilang: prediction.description || (place && place.formatted_address) || prev.lokasi_hilang }));
        }
        setAddressSuggestions([]);
        setHighlightedIndex(-1);
      });
      return;
    }

    // Fallback: set description only
    setFormData(prev => ({ ...prev, lokasi_hilang: prediction.description || prev.lokasi_hilang }));
    setAddressSuggestions([]);
    setHighlightedIndex(-1);
  };

  // Keyboard navigation for suggestions
  const handleAddressKeyDown = (e) => {
    if (!addressSuggestions || addressSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => (i < addressSuggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => (i > 0 ? i - 1 : addressSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < addressSuggestions.length) {
        e.preventDefault();
        selectAddressPrediction(addressSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setAddressSuggestions([]);
      setHighlightedIndex(-1);
    }
  };

  // Address autocomplete: unified handler with debounce and provider preference (Mapbox > Google > Nominatim)
  const handleAddressChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, lokasi_hilang: val }));

    if (!val) {
      setAddressSuggestions([]);
      return;
    }

    // debounce
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    addressDebounceRef.current = setTimeout(async () => {
      setLoadingAddressSuggestions(true);
      const cityName = cities.find(c => String(c.id_kota) === String(formData.id_kota))?.nama_kota || '';

      // build cache key
      const cacheKey = `q:${val}|city:${cityName}|provider:${mapboxKey ? 'mapbox' : (mapsScriptLoadedRef.current ? 'google' : 'nominatim')}`;
      if (addressCacheRef.current.has(cacheKey)) {
        setAddressSuggestions(addressCacheRef.current.get(cacheKey));
        setLoadingAddressSuggestions(false);
        setHighlightedIndex(-1);
        return;
      }

      // Try Mapbox first (with proximity if available)
      if (mapboxKey) {
        let proximityParam = null;
        const cityKey = `${formData.id_provinsi || ''}:${formData.id_kota || ''}`;
        if (cityCenterCacheRef.current.has(cityKey)) {
          proximityParam = cityCenterCacheRef.current.get(cityKey);
        } else if (formData.id_kota) {
          // fetch city center and cache it
          try {
            const center = await getCityCenter(
              provinces.find(p => String(p.id_provinsi) === String(formData.id_provinsi))?.nama_provinsi || '',
              cities.find(c => String(c.id_kota) === String(formData.id_kota))?.nama_kota || ''
            );
            if (center) cityCenterCacheRef.current.set(cityKey, center);
            proximityParam = center || null;
          } catch (err) {
            // ignore
          }
        }

        const results = await mapboxSearch(val, cityName);
        // if proximity available, try again with proximity param to bias results
        if (proximityParam && mapboxKey) {
          try {
            const q = encodeURIComponent(cityName ? `${val} ${cityName}` : val);
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${mapboxKey}&autocomplete=true&country=id&limit=6&proximity=${proximityParam.lng},${proximityParam.lat}`;
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (data && data.features && data.features.length) {
                const biased = data.features.map(f => ({ description: f.place_name, lat: f.center[1], lng: f.center[0], raw: f }));
                addressCacheRef.current.set(cacheKey, biased);
                setAddressSuggestions(biased);
                setLoadingAddressSuggestions(false);
                setHighlightedIndex(-1);
                return;
              }
            }
          } catch (err) {
            // fallthrough to results
          }
        }

        addressCacheRef.current.set(cacheKey, results);
        setAddressSuggestions(results);
        setLoadingAddressSuggestions(false);
        setHighlightedIndex(-1);
        return;
      }

      // Then Google if loaded
      if (mapsScriptLoadedRef.current && autocompleteServiceRef.current) {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: cityName ? `${val} ${cityName}` : val,
            componentRestrictions: { country: 'id' },
            types: ['address']
          },
          (predictions, status) => {
            setLoadingAddressSuggestions(false);
            if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
              setAddressSuggestions([]);
              return;
            }
            const filtered = cityName ? predictions.filter(p => p.description.toLowerCase().includes(cityName.toLowerCase())) : predictions;
            const mapped = filtered.map(p => ({ description: p.description, place_id: p.place_id }));
            addressCacheRef.current.set(cacheKey, mapped);
            setAddressSuggestions(mapped);
            setHighlightedIndex(-1);
          }
        );
        return;
      }

      // Fallback to Nominatim
      const nomi = await nominatimSearch(val, cityName);
      addressCacheRef.current.set(cacheKey, nomi);
      setAddressSuggestions(nomi);
      setLoadingAddressSuggestions(false);
      setHighlightedIndex(-1);
    }, 300);
  };

  // File select / upload handler
  const handleFileSelect = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setError('Hanya file gambar yang diizinkan');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file tidak boleh lebih dari 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploadingFile(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('http://localhost:8000/laporan/upload-image', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          foto_url: data.url
        }));
        setError('');
      } else {
        setError(data.message || 'Gagal upload gambar');
      }
    } catch (err) {
      setError('Gagal upload gambar: ' + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDateSelect = (date) => {
    if (!date) return;
    // Use local date components to avoid timezone shifts when converting to ISO
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setFormData(prev => ({
      ...prev,
      tanggal_hilang: dateStr
    }));
    setShowDatePicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.nama_pelapor?.trim()) throw new Error('Nama pelapor harus diisi');
      if (!formData.kontak_pelapor?.trim()) throw new Error('Nomor kontak harus diisi');
      if (!formData.email_pelapor?.trim()) throw new Error('Email harus diisi');
      if (!formData.judul_laporan?.trim()) throw new Error('Judul laporan harus diisi');
      if (!formData.deskripsi?.trim()) throw new Error('Deskripsi harus diisi');
      if (!formData.id_provinsi) throw new Error('Provinsi harus dipilih');
      if (!formData.id_kota) throw new Error('Kota harus dipilih');
      if (!formData.tanggal_hilang) throw new Error('Tanggal hilang harus dipilih');
      if (!formData.id_kategori) throw new Error('Kategori barang harus dipilih');
      if (!formData.foto_url) throw new Error('Foto barang harus diupload');

      const response = await laporanAPI.create(formData);
      saveToken(response.token_cookie);
      setToken(response.token_cookie);
      setSuccess(true);

      setTimeout(() => {
        setCurrentPage('my-laporan');
      }, 2000);
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Gagal membuat laporan');
      setLoading(false);
    }
  };

  const filteredProvinces = provinces.filter(p => 
    p.nama_provinsi?.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  const filteredCities = cities.filter(c =>
    c.nama_kota?.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="laporan-wrapper">
      {/* Header */}
      <header className="laporan-header">
        <div className="laporan-header-content">
          <button
            onClick={() => setCurrentPage('landing')}
            className="laporan-back-btn"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="laporan-header-text">
            <h1>Laporkan Barang Hilang</h1>
            <p>Isi form di bawah untuk melaporkan barang yang hilang</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="laporan-main">
        {success && (
          <div className="success-message">
            <Check size={20} />
            <span>Laporan berhasil dibuat! Mengalihkan ke halaman laporan Anda...</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="laporan-form">
          {/* Section 1: Informasi Pelapor */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-number">1</div>
              <h2 className="section-title-laporanform">Informasi Pelapor</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Nama Lengkap <span className="form-label-required">*</span>
                </label>
                <input
                  type="text"
                  name="nama_pelapor"
                  value={formData.nama_pelapor}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Nomor Kontak <span className="form-label-required">*</span>
                </label>
                <input
                  type="tel"
                  name="kontak_pelapor"
                  value={formatContactDisplay(formData.kontak_pelapor)}
                  onChange={handleContactChange}
                  className="form-input"
                  placeholder="08xx xxxx xxxx"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Email <span className="form-label-required">*</span>
              </label>
              <input
                type="email"
                name="email_pelapor"
                value={formData.email_pelapor}
                onChange={handleChange}
                className="form-input"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          {/* Section 2: Detail Barang */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-number">2</div>
              <h2 className="section-title-laporanform">Detail Barang Hilang</h2>
            </div>

            <div className="form-group">
              <label className="form-label">
                Judul Laporan <span className="form-label-required">*</span>
              </label>
              <input
                type="text"
                name="judul_laporan"
                value={formData.judul_laporan}
                onChange={handleChange}
                className="form-input"
                placeholder="Contoh: Handphone Samsung Galaxy S21 Hilang di Mall"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Deskripsi Detail <span className="form-label-required">*</span>
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Deskripsikan barang hilang dengan detail (warna, ciri khusus, kondisi, dll)"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group location-select" ref={categoryDropdownRef}>
                <label className="form-label">
                  Kategori Barang <span className="form-label-required">*</span>
                </label>
                <div
                  className="form-input"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  style={{ cursor: 'pointer' }}
                >
                  {categories.find(c => String(c.id_kategori) === String(formData.id_kategori))?.nama_kategori || 'Pilih kategori barang'}
                </div>
                <DropPortal 
                  anchorRef={categoryDropdownRef} 
                  show={showCategoryDropdown}
                  onClose={() => setShowCategoryDropdown(false)}
                >
                  <div className="category-dropdown">
                    <input
                      ref={categorySearchRef}
                      type="text"
                      placeholder="Cari kategori..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: 'none',
                        outline: 'none',
                        borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        background: 'rgba(255, 253, 245, 0.8)',
                        boxSizing: 'border-box'
                      }}
                    />
                    {categories
                      .filter(cat => cat.nama_kategori?.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map(category => (
                        <div
                          key={category.id_kategori}
                          className={`category-option ${String(formData.id_kategori) === String(category.id_kategori) ? 'selected' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({
                              ...prev,
                              id_kategori: category.id_kategori
                            }));
                            setShowCategoryDropdown(false);
                            setCategorySearch('');
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {category.nama_kategori}
                        </div>
                      ))}
                  </div>
                </DropPortal>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Tanggal Hilang <span className="form-label-required">*</span>
                </label>
                <div className="date-picker-wrapper">
                  <div
                    className="form-input date-input-field"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    style={{ cursor: 'pointer' }}
                    ref={dateInputRef}
                  >
                    <Calendar size={18} style={{ color: '#d97706' }} />
                    <span>{formData.tanggal_hilang ? formatDateIndo(formData.tanggal_hilang) : 'Pilih tanggal'}</span>
                  </div>
                  
                  <DropPortal 
                    anchorRef={dateInputRef} 
                    show={showDatePicker} 
                    offsetY={8} 
                    matchWidth={false}
                    onClose={() => setShowDatePicker(false)}
                  >
                    <div className="calendar-popup" ref={datePickerRef}>
                      <CalendarPicker
                        onSelect={handleDateSelect}
                        currentMonth={currentCalendarMonth}
                        onMonthChange={setCurrentCalendarMonth}
                      />
                    </div>
                  </DropPortal>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Lokasi */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-number">3</div>
              <h2 className="section-title-laporanform">Lokasi Barang Hilang</h2>
            </div>

            <div className="location-inputs">
              <div className="form-group location-select" ref={provinceDropdownRef}>
                <label className="form-label">
                  Provinsi <span className="form-label-required">*</span>
                </label>
                <div
                  className="form-input"
                  onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                  style={{ cursor: 'pointer' }}
                >
                  <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#d97706' }} />
                  {provinces.find(p => String(p.id_provinsi) === String(formData.id_provinsi))?.nama_provinsi || 'Pilih provinsi'}
                </div>
                <DropPortal 
                  anchorRef={provinceDropdownRef} 
                  show={showProvinceDropdown} 
                  offsetY={6}
                  onClose={() => setShowProvinceDropdown(false)}
                >
                  <div className="location-dropdown">
                    <input
                      ref={provinceSearchRef}
                      type="text"
                      placeholder="Cari provinsi..."
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: 'none',
                        outline: 'none',
                        borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        background: 'rgba(255, 253, 245, 0.8)',
                        boxSizing: 'border-box'
                      }}
                    />
                    {filteredProvinces.map(province => (
                      <div
                        key={province.id_provinsi}
                        className={`location-option ${String(formData.id_provinsi) === String(province.id_provinsi) ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({
                            ...prev,
                            id_provinsi: province.id_provinsi,
                            id_kota: ''
                          }));
                          setShowProvinceDropdown(false);
                          setProvinceSearch('');
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {province.nama_provinsi}
                      </div>
                    ))}
                  </div>
                </DropPortal>
              </div>

              <div className="form-group location-select" ref={cityDropdownRef}>
                <label className="form-label">
                  Kota/Kabupaten <span className="form-label-required">*</span>
                </label>
                <div
                  className="form-input"
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  style={{ cursor: 'pointer' }}
                >
                  <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem', color: '#d97706' }} />
                  {cities.find(c => String(c.id_kota) === String(formData.id_kota))?.nama_kota || 'Pilih kota'}
                </div>
                <DropPortal 
                  anchorRef={cityDropdownRef} 
                  show={showCityDropdown} 
                  offsetY={6}
                  onClose={() => setShowCityDropdown(false)}
                >
                  <div className="location-dropdown">
                    <input
                      ref={citySearchRef}
                      type="text"
                      placeholder="Cari kota..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: 'none',
                        outline: 'none',
                        borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        background: 'rgba(255, 253, 245, 0.8)',
                        boxSizing: 'border-box'
                      }}
                    />
                    {filteredCities.map(city => (
                      <div
                        key={city.id_kota}
                        className={`location-option ${String(formData.id_kota) === String(city.id_kota) ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({
                            ...prev,
                            id_kota: city.id_kota
                          }));
                          setShowCityDropdown(false);
                          setCitySearch('');
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {city.nama_kota}
                      </div>
                    ))}
                  </div>
                </DropPortal>
              </div>
            </div>

            <div className="form-group address-input-wrapper">
              <label className="form-label">
                Lokasi Detail (Alamat)
              </label>
              <input
                type="text"
                name="lokasi_hilang"
                value={formData.lokasi_hilang}
                onChange={handleAddressChange}
                onKeyDown={handleAddressKeyDown}
                className="form-input"
                ref={lokasiInputRef}
                placeholder="Masukkan lokasi detail, misal: Jalan Sudirman No 123"
                autoComplete="off"
              />
              <DropPortal anchorRef={lokasiInputRef} show={addressSuggestions && addressSuggestions.length > 0} onClose={() => { setAddressSuggestions([]); setHighlightedIndex(-1); }}>
                <div className="address-suggestion" ref={suggestionListRef}>
                  {addressSuggestions.map((pred, idx) => (
                    <div
                      key={pred.place_id || pred.raw?.id || `${pred.lat}_${pred.lng}_${idx}`}
                      className={`address-suggestion-item ${highlightedIndex === idx ? 'highlighted' : ''}`}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseLeave={() => setHighlightedIndex(-1)}
                      onMouseDown={(e) => { e.preventDefault(); selectAddressPrediction(pred); }}
                    >
                      {pred.description}
                    </div>
                  ))}
                </div>
              </DropPortal>
            </div>
          </div>

          {/* Section 4: Foto Barang */}
          <div className="form-section">
            <div className="section-header">
              <div className="section-number">4</div>
              <h2 className="section-title-laporanform">Foto Barang</h2>
            </div>

            <div
              className="file-upload-area"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="file-upload-icon">📸</div>
              <p className="file-upload-text">Drag dan drop atau klik untuk upload foto</p>
              <p className="file-upload-hint">Format: JPG, PNG | Max: 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="file-input"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </div>

            {(filePreview || selectedFile) && (
              <div className="file-preview-card">
                <div className="file-preview-media">
                  <div className="placeholder" aria-hidden>
                    <svg width="44" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h3l2-3h6l2 3h3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,249,240,0.7)"/><circle cx="12" cy="13" r="3" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <img src={filePreview} alt="Preview" className="file-preview-image" onClick={() => setPreviewOpen(true)} style={{ cursor: 'zoom-in' }} />
                  {uploadingFile && (
                    <div className="file-upload-overlay">
                      <div className="spinner"></div>
                      <div className="uploading-text">Mengupload...</div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="file-remove-btn"
                    onClick={() => {
                      setFilePreview(null);
                      setSelectedFile(null);
                      setFormData(prev => ({ ...prev, foto_url: '' }));
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    aria-label="Hapus foto"
                  >
                    ×
                  </button>
                </div>
                <div className="file-meta">
                  <div className="file-name">{selectedFile?.name || 'Foto Barang'}</div>
                  <div className="file-size">{selectedFile ? formatBytes(selectedFile.size) : ''}</div>
                </div>
              </div>
            )}

            {uploadingFile && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>Mengupload foto...</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentPage('landing')}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || uploadingFile}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Mengirim...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Laporkan Barang
                </>
              )}
            </button>
          </div>
        </form>

        {previewOpen && (
          <div className="image-modal" onClick={() => setPreviewOpen(false)}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="image-modal-close" onClick={() => setPreviewOpen(false)}>×</button>
              <img src={filePreview || formData.foto_url} alt="Preview Large" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Calendar Picker Component
function CalendarPicker({ onSelect, currentMonth, onMonthChange }) {
  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const today = new Date();
  const days = [];
  const firstDay = firstDayOfMonth(currentMonth);

  // Previous month days
  const prevMonthDays = daysInMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      isOtherMonth: true
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth(currentMonth); i++) {
    days.push({
      day: i,
      isOtherMonth: false,
      date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
    });
  }

  // Next month days
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      isOtherMonth: true
    });
  }

  return (
    <>
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
        >
          ‹
        </button>
        <div className="calendar-month-year">
          {currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </div>
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-days">
        {days.map((day, idx) => (
          <button
            key={idx}
            type="button"
            className={`calendar-day ${day.isOtherMonth ? 'other-month' : ''} ${
              day.date && day.date.toDateString() === today.toDateString() ? 'today' : ''
            }`}
            onClick={() => day.date && onSelect(day.date)}
            disabled={day.isOtherMonth}
          >
            {day.day}
          </button>
        ))}
      </div>
    </>
  );
}
