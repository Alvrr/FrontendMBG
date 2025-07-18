import React, { useEffect, useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import Swal from 'sweetalert2'
import { decodeJWT } from "../utils/jwtDecode"
import { getAllPembayaran } from "../services/pembayaranAPI"
import { getAllPelanggan } from "../services/pelangganAPI"
import axiosInstance from "../services/axiosInstance"
import PageWrapper from "../components/PageWrapper"
import Card from "../components/Card"
import { MagnifyingGlassIcon, DocumentArrowDownIcon, CalendarIcon, ShoppingCartIcon } from "@heroicons/react/24/outline"

const Riwayat = () => {
  const [riwayat, setRiwayat] = useState([])
  const [pelanggan, setPelanggan] = useState([])
  const [user, setUser] = useState({ role: '', id: '' })
  const [searchId, setSearchId] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    // Ambil role dan id user dari JWT
    const token = localStorage.getItem('token');
    const decoded = decodeJWT(token);
    setUser({ role: decoded?.role || '', id: decoded?.id || '' });
    
    getRiwayat()
    fetchPelanggan()
  }, [])

  const getRiwayat = async () => {
    try {
      // Gunakan endpoint /riwayat yang sudah ada filter untuk driver
      const response = await axiosInstance.get('/riwayat');
      setRiwayat(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading riwayat:", error);
      setRiwayat([]);
    }
  }

  const fetchPelanggan = async () => {
    try {
      const data = await getAllPelanggan()
      setPelanggan(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading pelanggan:", error)
      setPelanggan([])
    }
  }

  const handleDownloadLaporan = async () => {
    const result = await Swal.fire({
      title: "Unduh Laporan Riwayat",
      text: "File akan diunduh dalam format Excel.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, unduh",
      cancelButtonText: "Batal",
      customClass: {
        confirmButton: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
        cancelButton: "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500",
      },
      buttonsStyling: false,
    })

    if (result.isConfirmed) {
      try {
        const csvContent = generateCSVContent()
        downloadCSV(csvContent, 'riwayat-pembayaran.csv')
        
        Swal.fire({
          icon: "success",
          title: "Laporan berhasil diunduh!",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
          },
          buttonsStyling: false,
        })
      } catch {
        Swal.fire("Error", "Gagal mengunduh laporan", "error")
      }
    }
  }

  const generateCSVContent = () => {
    const headers = ['ID', 'Tanggal', 'Pelanggan', 'Kasir', 'Driver', 'Jenis Pengiriman', 'Produk', 'Ongkir', 'Total Bayar', 'Status']
    const csvRows = [headers.join(',')]

    riwayat.forEach(item => {
      const pelangganDetail = pelanggan.find(p => p.id === item.id_pelanggan)
      const produkList = item.produk?.map(p => `${p.nama_produk || p.id_produk}(${p.jumlah})`).join('; ') || 'N/A'
      const row = [
        item.id,
        format(new Date(item.tanggal), "dd/MM/yyyy HH:mm"),
        pelangganDetail?.nama || item.nama_pelanggan || 'N/A',
        item.nama_kasir || 'N/A',
        item.nama_driver || 'N/A',
        item.jenis_pengiriman || 'N/A',
        `"${produkList}"`,
        item.ongkir || 0,
        item.total_bayar || 0,
        item.status || 'N/A'
      ]
      csvRows.push(row.join(','))
    })

    return csvRows.join('\\n')
  }

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Filter data berdasarkan role user
  const filteredByRole = user.role === 'driver'
    ? riwayat.filter(item => item && item.id_driver === user.id)
    : riwayat

  const filteredData = filteredByRole.filter((item) =>
    searchId === "" || item.id.toString().toLowerCase().includes(searchId.toLowerCase())
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
  }

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka);
  }

  // Stats untuk dashboard
  const totalTransaksi = filteredByRole.length
  const totalPendapatan = filteredByRole.reduce((sum, item) => sum + (item.total_bayar || 0), 0)
  const rataRataTransaksi = totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0

  return (
    <PageWrapper 
      title="Riwayat Transaksi" 
      description="Lihat dan unduh riwayat semua transaksi pembayaran"
      action={
        <button
          onClick={handleDownloadLaporan}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          <span>Unduh Laporan</span>
        </button>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transaksi Selesai</p>
              <p className="text-2xl font-semibold text-gray-900">{totalTransaksi}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <DocumentArrowDownIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-semibold text-gray-900">{formatRupiah(totalPendapatan)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rata-rata per Transaksi</p>
              <p className="text-2xl font-semibold text-gray-900">{formatRupiah(Math.round(rataRataTransaksi))}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan ID transaksi..."
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {riwayat.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Riwayat Transaksi</h3>
            <p className="text-gray-500">Riwayat transaksi akan muncul di sini setelah ada pembayaran yang berhasil diselesaikan.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kasir</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Pengiriman</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ongkir</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Bayar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((item) => {
                    const pelangganDetail = pelanggan.find(p => p.id === item.id_pelanggan);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {pelangganDetail?.nama || item.nama_pelanggan || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama_kasir || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.nama_driver || '-'}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.jenis_pengiriman === 'motor' ? 'bg-blue-100 text-blue-800' :
                            item.jenis_pengiriman === 'mobil' ? 'bg-purple-100 text-purple-800' :
                            item.jenis_pengiriman === 'ambil_sendiri' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.jenis_pengiriman === 'motor' ? 'Motor' :
                             item.jenis_pengiriman === 'mobil' ? 'Mobil' :
                             item.jenis_pengiriman === 'ambil_sendiri' ? 'Ambil Sendiri' :
                             item.jenis_pengiriman || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {item.produk && item.produk.length > 0 ? (
                            <ul className="space-y-1">
                              {item.produk.map((produk, index) => (
                                <li key={index} className="text-xs">
                                  <div className="font-medium">{produk.nama_produk || produk.id_produk}</div>
                                  <div className="text-gray-500">{produk.jumlah}x @ {formatRupiah(produk.harga || 0)}</div>
                                  <div className="text-blue-600 font-semibold">= {formatRupiah(produk.subtotal || 0)}</div>
                                </li>
                              ))}
                            </ul>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(item.ongkir || 0)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {formatRupiah(item.total_bayar || 0)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>{item.tanggal ? format(new Date(item.tanggal), "dd MMM yyyy", { locale: id }) : '-'}</div>
                            <div className="text-xs text-gray-500">{item.tanggal ? format(new Date(item.tanggal), "HH:mm") : ''}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {item.status || 'Selesai'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => changePage(i + 1)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => changePage(currentPage + 1)}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </PageWrapper>
  )
}

export default Riwayat
