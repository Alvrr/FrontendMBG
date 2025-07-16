// pages/Pembayaran.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Swal from "sweetalert2";
import { deletePembayaran } from "../services/pembayaranAPI";
import PageWrapper from "../components/PageWrapper";
import Card from "../components/Card";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Pembayaran = () => {
  const [pembayaran, setPembayaran] = useState([]);
  const [pelanggan, setPelanggan] = useState([]);
  const [produk, setProduk] = useState([]);
  const [form, setForm] = useState({
    id_pelanggan: "",
    tanggal: new Date(),
    produk: [],
    total_bayar: 0,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [produkDipilih, setProdukDipilih] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    getPembayaran();
    getPelanggan();
    getProduk();
  }, []);

  const getPembayaran = async () => {
    const res = await axios.get("http://localhost:5000/pembayaran");
    setPembayaran(res.data);
  };

  const getPelanggan = async () => {
    const res = await axios.get("http://localhost:5000/pelanggan");
    setPelanggan(res.data);
  };

  const getProduk = async () => {
    const res = await axios.get("http://localhost:5000/produk");
    setProduk(res.data);
  };

  const handleAddProduk = () => {
    setProdukDipilih([
      ...produkDipilih,
      {
        id_produk: "",
        nama_produk: "",
        harga: 0,
        jumlah: 1,
        subtotal: 0,
      },
    ]);
  };

  const handleRemoveProduk = async (index) => {
    const confirm = await Swal.fire({
      title: "Hapus produk ini?",
      text: "Produk akan dihapus dari daftar pembayaran.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      customClass: {
        confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
        cancelButton: "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500",
      },
      buttonsStyling: false,
    });

    if (!confirm.isConfirmed) return;

    const updatedList = [...produkDipilih];
    updatedList.splice(index, 1);
    setProdukDipilih(updatedList);
    updateTotalBayar(updatedList);
  };

  const handleProdukChange = (index, id_produk) => {
    const produkTerpilih = produk.find((p) => p.id === id_produk);
    const list = [...produkDipilih];
    list[index] = {
      ...list[index],
      id_produk,
      nama_produk: produkTerpilih?.nama_produk || "",
      harga: parseInt(produkTerpilih?.harga || 0),
      subtotal: parseInt(produkTerpilih?.harga || 0) * list[index].jumlah,
    };
    setProdukDipilih(list);
    updateTotalBayar(list);
  };

  const handleJumlahChange = (index, jumlah) => {
    const list = [...produkDipilih];
    const produkDetail = produk.find(p => p.id === list[index].id_produk);
    
    // Pastikan jumlah minimal 1
    const jumlahInt = Math.max(1, parseInt(jumlah) || 1);
    
    // Validasi jika jumlah melebihi stok
    if (produkDetail && jumlahInt > produkDetail.stok) {
      Swal.fire({
        icon: "warning",
        title: "Jumlah melebihi stok",
        text: `Stok ${produkDetail.nama_produk} hanya tersedia ${produkDetail.stok}`,
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600",
        },
        buttonsStyling: false,
      });
      // Set jumlah ke stok maksimal yang tersedia
      list[index].jumlah = produkDetail.stok;
      list[index].subtotal = list[index].harga * produkDetail.stok;
      setProdukDipilih(list);
      updateTotalBayar(list);
      return;
    }
    
    list[index].jumlah = jumlahInt;
    list[index].subtotal = list[index].harga * jumlahInt;
    setProdukDipilih(list);
    updateTotalBayar(list);
  };

  const updateTotalBayar = (list) => {
    const total = list.reduce((sum, item) => sum + item.subtotal, 0);
    setForm({ ...form, total_bayar: total });
  };

  const handleSubmit = async () => {
    // Validasi data dasar
    if (!form.id_pelanggan || produkDipilih.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Pelanggan harus dipilih dan minimal 1 produk harus ditambahkan",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600",
        },
        buttonsStyling: false,
      });
      return;
    }

    // Validasi produk yang dipilih
    for (const item of produkDipilih) {
      if (!item.id_produk) {
        await Swal.fire({
          icon: "warning",
          title: "Produk belum dipilih",
          text: "Semua produk dalam daftar harus dipilih",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600",
          },
          buttonsStyling: false,
        });
        return;
      }
    }

    // Validasi stok produk
    for (const item of produkDipilih) {
      const produkDetail = produk.find(p => p.id === item.id_produk);
      if (produkDetail && item.jumlah > produkDetail.stok) {
        await Swal.fire({
          icon: "error",
          title: "Stok tidak mencukupi",
          text: `Stok ${produkDetail.nama_produk} hanya tersedia ${produkDetail.stok}, tidak dapat membeli ${item.jumlah}`,
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
          },
          buttonsStyling: false,
        });
        return;
      }
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin menyimpan pembayaran ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
      customClass: {
        confirmButton: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
        cancelButton: "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500",
      },
      buttonsStyling: false,
    });

    if (!confirm.isConfirmed) return;

    try {
      const data = {
        ...form,
        tanggal: new Date().toISOString(),
        produk: produkDipilih,
      };
      
      console.log('Data pembayaran yang akan disimpan:', data);
      
      const response = await axios.post("http://localhost:5000/pembayaran", data);
      console.log('Response pembayaran:', response.data);

      // Update stok produk setelah pembayaran berhasil
      for (const item of produkDipilih) {
        const produkDetail = produk.find(p => p.id === item.id_produk);
        if (produkDetail) {
          const stokBaru = Math.max(0, produkDetail.stok - item.jumlah); // Pastikan stok tidak negatif
          console.log(`Mengupdate stok ${produkDetail.nama_produk}: ${produkDetail.stok} -> ${stokBaru}`);
          
          const updateResponse = await axios.put(`http://localhost:5000/produk/${item.id_produk}`, {
            ...produkDetail,
            stok: stokBaru
          });
          console.log('Response update stok:', updateResponse.data);
        }
      }

      await Swal.fire({
        icon: "success",
        title: "Pembayaran berhasil disimpan",
        text: "Stok produk telah diperbarui",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
        },
        buttonsStyling: false,
      });

      getPembayaran();
      getProduk(); // Refresh data produk untuk update stok
      setShowPopup(false);
      setForm({
        id_pelanggan: "",
        tanggal: new Date(),
        produk: [],
        total_bayar: 0,
      });
      setProdukDipilih([]);
    } catch (error) {
      console.error('Error saat menyimpan pembayaran:', error);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: error.response?.data?.message || "Terjadi kesalahan saat menyimpan data",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
        },
        buttonsStyling: false,
      });
    }
  };

  const handleSelesai = async (item) => {
    const confirm = await Swal.fire({
      title: "Selesaikan Pembayaran",
      text: `Yakin ingin menyelesaikan pembayaran dengan ID ${item.id}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, selesaikan",
      cancelButtonText: "Batal",
      customClass: {
        confirmButton: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
        cancelButton: "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500",
      },
      buttonsStyling: false,
    });

    if (!confirm.isConfirmed) return;

    try {
      // Ambil data riwayat yang sudah ada dari localStorage
      const existingRiwayat = JSON.parse(localStorage.getItem('riwayatPembayaran')) || [];
      
      // Cari nama pelanggan
      const pelangganDetail = pelanggan.find(p => p.id === item.id_pelanggan);
      
      // Tambahkan data pembayaran yang selesai ke riwayat
      const newRiwayat = [...existingRiwayat, { 
        ...item, 
        nama_pelanggan: pelangganDetail?.nama || 'N/A',
        status: 'selesai', 
        tanggal_selesai: new Date().toISOString() 
      }];
      
      // Simpan ke localStorage
      localStorage.setItem('riwayatPembayaran', JSON.stringify(newRiwayat));
      
      // Hapus data dari database pembayaran
      await deletePembayaran(item.id);

      await Swal.fire({
        icon: "success",
        title: "Pembayaran Selesai",
        text: "Data pembayaran telah dipindahkan ke halaman riwayat",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
        },
        buttonsStyling: false,
      });

      // Refresh data pembayaran
      getPembayaran();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menyelesaikan pembayaran",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
        },
        buttonsStyling: false,
      });
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka);
  };

  const filteredPembayaran = pembayaran.filter((item) =>
    item.id.toLowerCase().includes(searchId.toLowerCase())
  );
  const dataToDisplay = searchId ? filteredPembayaran : pembayaran;

  const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage);
  const paginatedData = dataToDisplay.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <PageWrapper 
      title="Manajemen Pembayaran" 
      description="Kelola data pembayaran bisnis Anda"
      action={
        <button
          onClick={() => setShowPopup(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Transaksi Baru</span>
        </button>
      }
    >
      {/* Search Bar */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID Pembayaran..."
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>


        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">PELANGGAN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">NAMA PELANGGAN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">TANGGAL PEMBAYARAN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">TOTAL BAYAR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">AKSI</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item) => {
                const pelangganDetail = pelanggan.find(p => p.id === item.id_pelanggan);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id_pelanggan}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pelangganDetail?.nama || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(item.tanggal), "dd MMMM yyyy HH:mm:ss", { locale: id })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(item.total_bayar)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleSelesai(item)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                      >
                        Selesai
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded-lg ${
                page === currentPage 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </Card>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Transaksi Baru</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pelanggan</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.id_pelanggan}
                onChange={(e) => setForm({ ...form, id_pelanggan: e.target.value })}
              >
                <option value="">Pilih Pelanggan</option>
                {pelanggan.map((p) => (
                  <option key={p.id} value={p.id} className="text-black bg-white">
                    {p.nama} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Daftar Produk</label>
              {produkDipilih.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 w-1/3 text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={item.id_produk}
                    onChange={(e) => handleProdukChange(index, e.target.value)}
                  >
                    <option value="">Pilih Produk</option>
                    {produk.map((p) => (
                      <option key={p.id} value={p.id} className="text-black bg-white">
                        {p.nama_produk} (Stok: {p.stok})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    value={item.jumlah}
                    onChange={(e) => handleJumlahChange(index, e.target.value)}
                    placeholder="Qty"
                  />
                  <span className="w-1/3 text-sm font-medium">{formatRupiah(item.subtotal)}</span>
                  <button
                    onClick={() => handleRemoveProduk(index)}
                    className="ml-2 text-red-600 hover:text-red-800 font-bold"
                    title="Hapus Produk"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddProduk}
                className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium"
              >
                + Tambah Produk
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Bayar:</label>
              <div className="text-xl font-bold text-blue-600">{formatRupiah(form.total_bayar)}</div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setForm({
                    id_pelanggan: "",
                    tanggal: new Date(),
                    produk: [],
                    total_bayar: 0,
                  });
                  setProdukDipilih([]);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Proses Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Pembayaran;