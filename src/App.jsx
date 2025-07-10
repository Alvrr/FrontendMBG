// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainWrapper from './components/MainWrapper'
import Dashboard from './pages/Dashboard'
import Produk from './pages/Produk'
import Pelanggan from './pages/Pelanggan'
import Pembayaran from './pages/Pembayaran'
import Laporan from './pages/Laporan'

function App() {
  return (
    <Router>
      <Routes>
        {/* Dashboard tanpa navbar */}
        <Route path="/" element={<Dashboard />} />

        {/* Halaman lain pakai navbar (MainWrapper) */}
        <Route element={<MainWrapper />}>
          <Route path="/produk" element={<Produk />} />
          <Route path="/pelanggan" element={<Pelanggan />} />
          <Route path="/pembayaran" element={<Pembayaran />} />
          <Route path="/laporan" element={<Laporan />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
