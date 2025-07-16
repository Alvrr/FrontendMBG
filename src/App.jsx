// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import ModernDashboard from './pages/ModernDashboard'
import Produk from './pages/Produk'
import Pelanggan from './pages/Pelanggan'
import Pembayaran from './pages/Pembayaran'
import Laporan from './pages/Laporan'
import Riwayat from './pages/Riwayat'

function App() {
  return (
    <Router>
      <Routes>
        {/* Semua halaman menggunakan AdminLayout */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<ModernDashboard />} />
          <Route path="/produk" element={<Produk />} />
          <Route path="/pelanggan" element={<Pelanggan />} />
          <Route path="/pembayaran" element={<Pembayaran />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/riwayat" element={<Riwayat />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
