# Admin Login Frontend Guide

## Overview
Form login admin yang minimalis dan elegan dengan dark gradient theme yang sesuai dengan tema aplikasi.

## Components

### AdminLoginPage
File: `src/pages/AdminLoginPage.jsx`

**Features:**
- Minimalist elegant design
- Gradient background
- Form validation
- Error/success messages
- Loading state dengan spinner
- Responsive design

**Props:**
- `setCurrentPage` (function): Navigation handler
- `setAdminToken` (function): Token callback

### CSS Styling
File: `src/styles/admin-login.css`

**Color Scheme:**
- Primary: `#667eea` (gradient to `#764ba2`)
- Background: Gradient blue-gray
- Text: Dark grays
- Accent: Purple gradient

## Usage Flow

### 1. User Access Admin Login
User dapat mengakses login admin melalui:
- Tombol "ADMIN LOGIN" di Navbar
- Direct URL: `http://localhost:5173/admin`

### 2. Login Process
```
User Input → Validate → Send to Backend → Get Token → Store Token → Redirect
```

### 3. Token Storage
Setelah login berhasil:
```javascript
localStorage.setItem('admin_token', token);
localStorage.setItem('admin_id', admin_id);
localStorage.setItem('admin_name', admin_name);
```

### 4. Access Control
- Jika admin sudah login (ada token di localStorage), tombol admin akan mengarah ke dashboard
- Jika belum login, akan mengarah ke login page terlebih dahulu

## Styling Details

### Color Palette
```css
Primary Gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)
Hover Effect: translateY(-2px) + shadow
Active Effect: translateY(0)
```

### Animations
- `slideInUp`: 0.5s (container entrance)
- `slideInDown`: 0.3s (error message)
- `spin`: 0.8s infinite (loading spinner)

### Responsive Breakpoints
- Desktop: Full width up to 420px
- Mobile (< 480px): Adjusted padding and font sizes

## Error Handling

### Common Errors

**1. "Invalid username or password"**
```
Status: 401 Unauthorized
Action: Show error message, allow retry
```

**2. "Terjadi kesalahan"**
```
Status: Network error
Action: Show error message, check backend
```

## API Integration

### Endpoint
- **URL**: `http://localhost:8000/admin/login`
- **Method**: POST
- **Content-Type**: application/json

### Request Body
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Response
```json
{
  "success": true,
  "token": "eyJ...",
  "admin": {
    "id_admin": 1,
    "nama_admin": "Administrator",
    "username": "admin"
  },
  "message": "Login successful"
}
```

## Customization

### Change Colors
Edit di `admin-login.css`:
```css
--primary-color: #667eea;
--secondary-color: #764ba2;
--error-color: #c33;
--success-color: #3c3;
```

### Change Animations
```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px); /* Adjust distance */
  }
}
```

### Change Form Layout
Edit di `AdminLoginPage.jsx`:
- Tambah/hapus input fields
- Ubah label text
- Ubah placeholder text

## Security Considerations

### Frontend
1. **Token Storage**: Token disimpan di localStorage (vulnerable untuk XSS)
   - Untuk production, gunakan HttpOnly cookies
   
2. **HTTPS Only**: Selalu gunakan HTTPS di production
   
3. **Clear Token**:
   ```javascript
   function logout() {
     localStorage.removeItem('admin_token');
     localStorage.removeItem('admin_id');
     localStorage.removeItem('admin_name');
   }
   ```

4. **Validate Token**: Check token validity sebelum akses protected pages

### Backend (sudah implemented)
- Password hashing dengan bcrypt
- JWT token dengan expiry
- CORS configuration

## Development Notes

### Test Credentials
```
Username: admin
Password: admin123

Username: manager  
Password: admin123
```

### Debugging
1. Check browser console untuk error messages
2. Check network tab untuk request/response
3. Verify backend is running at `http://localhost:8000`
4. Check localStorage untuk token

### Common Issues

**Issue**: Form tidak bisa submit
- **Solution**: Check apakah backend running dan CORS enabled

**Issue**: Token tidak tersimpan
- **Solution**: Check localStorage permissions, disable extensions

**Issue**: Redirect tidak bekerja
- **Solution**: Check `setCurrentPage` prop passed correctly

## Future Enhancements

1. Implement "Remember Me" functionality
2. Add forgot password feature
3. Implement 2FA (Two-Factor Authentication)
4. Add audit logging untuk login attempts
5. Implement rate limiting untuk brute force protection
6. Use HttpOnly cookies instead of localStorage
