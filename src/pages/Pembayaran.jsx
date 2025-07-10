// pages/Pembayaran.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';



  
const handleSearchById = () => {
  const filtered = pembayaran.filter((item) =>
    item.id_pembayaran.toLowerCase().includes(searchId.toLowerCase())
  );
  setFilteredPembayaran(filtered);
  setCurrentPage(1);
};

const Pembayaran = () => {
  const navigate = useNavigate([]);
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
    list[index].jumlah = parseInt(jumlah);
    list[index].subtotal = list[index].harga * parseInt(jumlah);
    setProdukDipilih(list);
    updateTotalBayar(list);
  };

  const updateTotalBayar = (list) => {
    const total = list.reduce((sum, item) => sum + item.subtotal, 0);
    setForm({ ...form, total_bayar: total });
  };

  const handleSubmit = async () => {
    if (!form.id_pelanggan || produkDipilih.length === 0 || produkDipilih.some(p => !p.id_produk)) {
      await Swal.fire({
        icon: "warning",
        title: "Data tidak lengkap",
        text: "Semua field wajib diisi dan minimal 1 produk harus dipilih",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600",
        },
        buttonsStyling: false,
      });
      return;
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
      await axios.post("http://localhost:5000/pembayaran", data);

      await Swal.fire({
        icon: "success",
        title: "Pembayaran berhasil disimpan",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
        },
        buttonsStyling: false,
      });

      getPembayaran();
      setShowPopup(false);
      setForm({
        id_pelanggan: "",
        tanggal: new Date(),
        produk: [],
        total_bayar: 0,
      });
      setProdukDipilih([]);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: "Terjadi kesalahan saat menyimpan data",
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

  const totalPages = Math.ceil(filteredPembayaran.length / itemsPerPage);
  const paginatedData = filteredPembayaran.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
  {/* Header dengan tombol Kembali */}
  <div className="relative flex justify-center items-center mb-6">
    <h1 className="text-2xl font-bold text-center">Data Pembayaran</h1>
    <button
      onClick={() => navigate("/")}
      className="absolute right-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
    >
      Kembali
    </button>
  </div>

  {/* Tombol Tambah + Pencarian */}
  <div className="flex flex-wrap gap-3 mb-4 items-center">
    <button
      onClick={() => setShowPopup(true)}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
    >
      Tambah Pembayaran
    </button>

    <input
      type="text"
      placeholder="Cari ID Pembayaran..."
      className="border px-3 py-2 rounded w-64"
      value={searchId}
      onChange={(e) => {
        setSearchId(e.target.value);
        setCurrentPage(1);
      }}
    />
  </div>


      <table className="min-w-full table-auto border">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Pelanggan</th>
            <th className="border px-4 py-2">Tanggal</th>
            <th className="border px-4 py-2">Total Bayar</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item) => (
            <tr key={item.id} className="text-center">
              <td className="border px-4 py-2">{item.id}</td>
              <td className="border px-4 py-2">{item.id_pelanggan}</td>
              <td className="border px-4 py-2">
                {format(new Date(item.tanggal), "dd MMMM yyyy HH:mm:ss", { locale: id })}
              </td>
              <td className="border px-4 py-2">{formatRupiah(item.total_bayar)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 border rounded ${page === currentPage ? "bg-blue-500 text-white" : "bg-white"}`}
          >
            {page}
          </button>
        ))}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Tambah Pembayaran</h2>

            <div className="mb-2">
              <label className="block">Pelanggan</label>
              <select
                className="border p-2 w-full"
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

            <div className="mb-2">
              <label className="block mb-1">Daftar Produk</label>
              {produkDipilih.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <select
                    className="border p-2 w-1/3 text-black bg-white"
                    value={item.id_produk}
                    onChange={(e) => handleProdukChange(index, e.target.value)}
                  >
                    <option value="">Pilih Produk</option>
                    {produk.map((p) => (
                      <option key={p.id} value={p.id} className="text-black bg-white">
                        {p.nama_produk}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="border p-2 w-1/4"
                    min={1}
                    value={item.jumlah}
                    onChange={(e) => handleJumlahChange(index, e.target.value)}
                  />
                  <span className="w-1/3">{formatRupiah(item.subtotal)}</span>
                  <button
                    onClick={() => handleRemoveProduk(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                    title="Hapus Produk"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddProduk}
                className="text-sm bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
              >
                + Tambah Produk
              </button>
            </div>

            <div className="mb-2">
              <label className="block font-bold">Total Bayar:</label>
              <div>{formatRupiah(form.total_bayar)}</div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pembayaran;
