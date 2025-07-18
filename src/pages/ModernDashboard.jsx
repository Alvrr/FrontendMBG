import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getAllProduk } from '../services/produkAPI';
import { getAllPelanggan } from '../services/pelangganAPI';
import { getAllPembayaran } from '../services/pembayaranAPI';
import Card from '../components/Card'
import RecentActivity from '../components/RecentActivity'
import { 
  CubeIcon, 
  UserGroupIcon, 
  CreditCardIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  UsersIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import { logoutService } from '../services/authAPI';
import Swal from "sweetalert2";

const ModernDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProduk: 0,
    totalPelanggan: 0,
    totalPembayaran: 0,
    totalPendapatan: 0,
    pembayaranHariIni: 0,
    produkTerlaris: []
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      let [produk, pelanggan, pembayaran] = await Promise.all([
        getAllProduk(),
        getAllPelanggan(),
        getAllPembayaran()
      ])
      // Defensive: if null, set to []
      produk = Array.isArray(produk) ? produk : [];
      pelanggan = Array.isArray(pelanggan) ? pelanggan : [];
      pembayaran = Array.isArray(pembayaran) ? pembayaran : [];

      const totalPendapatan = pembayaran.reduce((sum, item) => sum + (item?.total_bayar || 0), 0)
      
      const today = new Date().toISOString().split('T')[0]
      const pembayaranHariIni = pembayaran.filter(item => 
        item?.tanggal && item.tanggal.startsWith(today)
      ).length

      // Hitung produk terlaris
      const produkCount = {}
      pembayaran.forEach(payment => {
        if (payment?.produk) {
          payment.produk.forEach(item => {
            const key = item?.nama_produk || item?.id_produk
            if (!key) return;
            produkCount[key] = (produkCount[key] || 0) + (item?.jumlah || 1)
          })
        }
      })

      const produkTerlaris = Object.entries(produkCount)
        .map(([nama, jumlah]) => ({ nama, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah)
        .slice(0, 5)

      setStats({
        totalProduk: produk.length,
        totalPelanggan: pelanggan.length,
        totalPembayaran: pembayaran.length,
        totalPendapatan,
        pembayaranHariIni,
        produkTerlaris
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: 'Yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Batal',
      customClass: {
        confirmButton: 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700',
        cancelButton: 'bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500',
      },
      buttonsStyling: false,
    });
    if (!confirm.isConfirmed) return;
    logoutService();
    await Swal.fire({
      icon: "success",
      title: "Logout berhasil",
      confirmButtonText: "OK",
      customClass: {
        confirmButton: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      },
      buttonsStyling: false
    });
    navigate('/login');
  }

  const menuCards = [
    { 
      label: 'Produk', 
      path: '/produk', 
      icon: CubeIcon,
      description: 'Kelola data produk',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      label: 'Pelanggan', 
      path: '/pelanggan', 
      icon: UserGroupIcon,
      description: 'Kelola data pelanggan',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      label: 'Pembayaran', 
      path: '/pembayaran', 
      icon: CreditCardIcon,
      description: 'Kelola transaksi pembayaran',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      label: 'Riwayat', 
      path: '/riwayat', 
      icon: ClockIcon,
      description: 'Lihat riwayat transaksi',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
  ]

  const statsCards = [
    {
      title: 'Total Produk',
      value: stats.totalProduk,
      icon: ShoppingBagIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Pelanggan',
      value: stats.totalPelanggan,
      icon: UsersIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Pembayaran Bulan Ini',
      value: `Rp ${stats.totalPendapatan.toLocaleString('id-ID')}`,
      icon: BanknotesIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%',
      changeType: 'increase'
    },
    {
      title: 'Transaksi Hari Ini',
      value: stats.pembayaranHariIni,
      icon: ArrowTrendingUpIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+3%',
      changeType: 'increase'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Selamat datang di sistem manajemen bisnis mikro</p>
        </div>
        <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">Logout</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-center mt-1">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Menu Utama</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuCards.map((item) => {
            const Icon = item.icon
            return (
              <Card 
                key={item.label}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${item.bgColor} ${item.borderColor} border-2`}
                onClick={() => navigate(item.path)}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-white rounded-full shadow-sm">
                      <Icon className={`w-8 h-8 ${item.color}`} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.label}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produk Terlaris */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Produk Terlaris</h2>
            <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          {stats.produkTerlaris.length > 0 ? (
            <div className="space-y-3">
              {stats.produkTerlaris.map((produk, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{produk.nama}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((produk.jumlah / stats.produkTerlaris[0]?.jumlah) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{produk.jumlah}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada data penjualan produk</p>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <RecentActivity 
          maxItems={5} 
          showStats={false}
          className=""
        />
        </div>
    </div>
  )
}

export default ModernDashboard
