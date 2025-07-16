import React, { useEffect, useState } from "react"
import axios from "axios"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import PageWrapper from "../components/PageWrapper"
import Card from "../components/Card"
import { 
  ChartBarIcon, 
  UsersIcon, 
  ShoppingBagIcon, 
  BanknotesIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from "@heroicons/react/24/outline"

function Laporan() {
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
      const [produkRes, pelangganRes, pembayaranRes] = await Promise.all([
        axios.get("http://localhost:5000/produk"),
        axios.get("http://localhost:5000/pelanggan"),
        axios.get("http://localhost:5000/pembayaran")
      ])

      const produk = produkRes.data
      const pelanggan = pelangganRes.data
      const pembayaran = pembayaranRes.data

      const totalPendapatan = pembayaran.reduce((sum, item) => sum + (item.total_bayar || 0), 0)
      
      const today = new Date().toISOString().split('T')[0]
      const pembayaranHariIni = pembayaran.filter(item => 
        item.tanggal && item.tanggal.startsWith(today)
      ).length

      // Hitung produk terlaris
      const produkCount = {}
      pembayaran.forEach(payment => {
        if (payment.produk) {
          payment.produk.forEach(item => {
            const key = item.nama_produk || item.id_produk
            produkCount[key] = (produkCount[key] || 0) + (item.jumlah || 1)
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

  const statsCards = [
    {
      title: "Total Produk",
      value: stats.totalProduk,
      icon: ShoppingBagIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Produk terdaftar"
    },
    {
      title: "Total Pelanggan",
      value: stats.totalPelanggan,
      icon: UsersIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Pelanggan aktif"
    },
    {
      title: "Total Transaksi",
      value: stats.totalPembayaran,
      icon: ChartBarIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Semua transaksi"
    },
    {
      title: "Total Pendapatan",
      value: `Rp ${stats.totalPendapatan.toLocaleString('id-ID')}`,
      icon: BanknotesIcon,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      description: "Pendapatan keseluruhan"
    },
    {
      title: "Transaksi Hari Ini",
      value: stats.pembayaranHariIni,
      icon: ArrowTrendingUpIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Transaksi hari ini"
    },
    {
      title: "Periode Laporan",
      value: format(new Date(), "MMMM yyyy", { locale: id }),
      icon: CalendarIcon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Periode saat ini"
    }
  ]

  return (
    <PageWrapper 
      title="Laporan Bisnis" 
      description="Dashboard analitik dan statistik bisnis Anda"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produk Terlaris */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Produk Terlaris</h3>
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

        {/* Ringkasan Keuangan */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ringkasan Keuangan</h3>
            <BanknotesIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Total Pendapatan</span>
              <span className="text-lg font-semibold text-green-600">
                Rp {stats.totalPendapatan.toLocaleString('id-ID')}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Rata-rata per Transaksi</span>
              <span className="text-lg font-semibold text-blue-600">
                Rp {stats.totalPembayaran > 0 
                  ? Math.round(stats.totalPendapatan / stats.totalPembayaran).toLocaleString('id-ID')
                  : '0'
                }
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Transaksi Hari Ini</span>
              <span className="text-lg font-semibold text-purple-600">
                {stats.pembayaranHariIni} transaksi
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Info */}
      <Card className="mt-6">
        <div className="text-center py-8">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Laporan Komprehensif</h3>
          <p className="text-gray-600 mb-4">
            Data di atas memberikan gambaran umum tentang performa bisnis Anda. 
            Untuk analisis yang lebih mendalam, silakan periksa setiap modul secara terpisah.
          </p>
          <div className="flex justify-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Data Real-time
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Auto Update
            </span>
          </div>
        </div>
      </Card>
    </PageWrapper>
  )
}

export default Laporan
