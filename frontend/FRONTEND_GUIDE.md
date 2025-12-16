# Frontend - Laporan Barang Hilang React App

## 🚀 Status: Production Ready

Beautiful React + Tailwind CSS frontend untuk aplikasi Laporan Barang Hilang dengan design modern dan responsif.

## 📋 Requirements

- Node.js 16+ 
- npm atau yarn
- Backend server running on `http://localhost:8000`

## ⚡ Quick Start

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Server akan berjalan di: `http://localhost:5173` (atau port lain yang ditampilkan)

## 📁 Project Structure

```
frontend/
├── public/                      # Static assets
├── src/
│   ├── App.jsx                 # Main app dengan routing
│   ├── index.css               # Global styles + Tailwind
│   ├── main.jsx                # Entry point
│   └── pages/
│       ├── LaporanForm.jsx     # Form untuk laporan barang hilang
│       ├── MyLaporan.jsx       # Halaman status laporan user
│       └── AdminDashboard.jsx  # Dashboard admin
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Features

### Landing Page
- Hero section dengan gradient animation
- Features showcase dengan hover effects
- Statistics display
- Call-to-action buttons
- Responsive navigation

### Laporan Form (Create Report)
- Multi-step form dengan visual indicators
- Form validation
- Category selection
- Date picker
- Real-time feedback

### My Laporan (User Reports)
- List laporan dengan status display
- Mark as found functionality
- Refresh data
- Cookie-based authentication
- Responsive grid layout

### Admin Dashboard
- Real-time statistics
- Notification management
- Laporan management dengan filter
- Delete functionality
- Tab-based interface

## 🔗 API Integration

Frontend berkomunikasi dengan backend melalui:

```javascript
const API_BASE_URL = 'http://localhost:8000'
```

### Endpoints Used:

```
POST   /laporan              - Create new report
GET    /laporan/mine         - Get user's reports (requires cookie)
PATCH  /laporan/{id}/found   - Mark report as found
DELETE /laporan/{id}         - Delete report (admin)
GET    /laporan              - List all reports
GET    /notifikasi           - Get notifications
PATCH  /notifikasi/{id}/read - Mark notification as read
```

## 🔐 Authentication

- Token disimpan di **localStorage** (mensimulasikan cookie behavior)
- Setiap request ke `/laporan/mine` dikirim dengan token di header
- Admin dashboard tidak memiliki auth (temporary)

## 🎭 Tailwind CSS + Lucide Icons

### Tailwind Configuration
```javascript
{
  colors: {
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#ff6b6b'
  }
}
```

### Icons dari Lucide React
```javascript
import { ChevronDown, Search, MapPin, Heart, etc } from 'lucide-react'
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly buttons dan inputs
- Adaptive grid layouts

## 🌐 CORS Configuration

Jika frontend dan backend di domain berbeda, pastikan backend memiliki CORS middleware:

```python
# Backend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔄 Cookie Handling

### Simulating Cookies dengan localStorage:

```javascript
// Save token (setelah create laporan)
localStorage.setItem('laporan_token', response.data.token_cookie)

// Retrieve token
const token = localStorage.getItem('laporan_token')

// Send in requests
headers: {
  Cookie: `laporan_token=${token}`
}
```

## 🎯 Performance Optimizations

1. **Code Splitting** - Lazy loading dengan React.lazy()
2. **Asset Optimization** - Optimized images dan SVGs
3. **CSS Optimization** - Tailwind purge unused styles
4. **Minification** - Production build terkompresi

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code (jika eslint tersedia)
npm run lint
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "axios": "^1.x",
    "lucide-react": "^latest"
  },
  "devDependencies": {
    "vite": "^4.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

## 🚀 Deployment

### Build untuk Production:
```bash
npm run build
```

Hasil build ada di folder `dist/`

### Deploy ke Vercel:
```bash
npm i -g vercel
vercel
```

### Deploy ke Netlify:
```bash
npm i -g netlify-cli
netlify deploy
```

### Deploy ke server sendiri:
1. Build: `npm run build`
2. Upload `dist/` folder ke server
3. Configure web server untuk serve `dist/index.html`

## ⚙️ Environment Variables

Buat file `.env.local` untuk development:
```
VITE_API_URL=http://localhost:8000
```

Gunakan di code:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL
```

## 🐛 Troubleshooting

### Dependencies not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### Backend CORS errors
- Tambah CORS middleware di backend
- Check API URL di `App.jsx`
- Verify backend sedang running

### Tailwind styles not applying
- Check `tailwind.config.js` content paths
- Run `npm run build` untuk rebuild
- Clear browser cache

## 📚 Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [Lucide Icons](https://lucide.dev)
- [Axios Docs](https://axios-http.com)

## 👨‍💻 Development Tips

1. **Use React DevTools** - Debug components lebih mudah
2. **Tailwind IntelliSense** - Install VSCode extension untuk autocomplete
3. **Hot Module Reload** - Vite otomatis reload ketika ada perubahan
4. **Network Tab** - Debug API calls di DevTools

## 📝 Future Improvements

- [ ] Add image upload dengan preview
- [ ] Implement proper authentication (JWT)
- [ ] Add search dan filter di laporan
- [ ] Implement pagination
- [ ] Add notification sound
- [ ] Dark/Light theme toggle
- [ ] Progressive Web App (PWA)
- [ ] Offline support dengan Service Workers

## 📄 License

Project ini adalah tugas akademik untuk Semester 5 SUPER DE.

---

**Status:** ✅ Production Ready  
**Last Updated:** November 13, 2025  
**Tested Browsers:** Chrome, Firefox, Safari, Edge
