import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Riwayat = () => {
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    getRiwayat();
  }, []);

  const getRiwayat = async () => {
    try {
      // Mengambil data riwayat dari localStorage
      const riwayatData = JSON.parse(localStorage.getItem('riwayatPembayaran')) || [];
      setRiwayat(riwayatData);
    } catch (error) {
      console.error("Error loading riwayat:", error);
      setRiwayat([]);
    }
  };

  const handleDownloadLaporan = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda ingin mengunduh laporan?",
      text: "File akan diunduh dalam format Excel.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, unduh",
      cancelButtonText: "Batal",
      buttonsStyling: false, 
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();

        confirmBtn.classList.add(
          "bg-blue-600",
          "text-white",
          "px-4",
          "py-2",
          "rounded",
          "hover:bg-blue-700"
        );

        cancelBtn.classList.add(
          "bg-gray-400",
          "text-white",
          "px-4",
          "py-2",
          "rounded",
          "hover:bg-gray-500"
        );
      }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/laporan/export/excel");
      if (!response.ok) throw new Error("Gagal mengunduh laporan.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "laporan.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        title: "Berhasil!",
        text: "Laporan berhasil diunduh.",
        icon: "success",
        confirmButtonText: "OK",
        buttonsStyling: false,
        didOpen: () => {
          Swal.getConfirmButton().classList.add(
            "bg-green-600",
            "text-white",
            "px-4",
            "py-2",
            "rounded",
            "hover:bg-green-700"
          );
        }
      });
    } catch (error) {
      Swal.fire({
        title: "Gagal",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
        buttonsStyling: false,
        didOpen: () => {
          Swal.getConfirmButton().classList.add(
            "bg-red-600",
            "text-white",
            "px-4",
            "py-2",
            "rounded",
            "hover:bg-red-700"
          );
        }
      });
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka);
  };

  const filteredRiwayat = riwayat.filter((item) =>
    item.id.toLowerCase().includes(searchId.toLowerCase())
  );
  const dataToDisplay = searchId ? filteredRiwayat : riwayat;

  const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage);
  const paginatedData = dataToDisplay.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* Header dengan tombol Kembali */}
      <div className="relative flex justify-center items-center mb-6">
        <h1 className="text-2xl font-bold text-center">Riwayat Pembayaran</h1>
        <button
          onClick={() => navigate("/")}
          className="absolute right-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Kembali
        </button>
      </div>

      {/* Pencarian dan Export Laporan */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <button
          onClick={handleDownloadLaporan}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-semibold transition"
        >
          Export Laporan
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

      {/* Tabel Riwayat */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Pelanggan</th>
              <th className="border px-4 py-2">Nama Pelanggan</th>
              <th className="border px-4 py-2">Tanggal Pembayaran</th>
              <th className="border px-4 py-2">Total Bayar</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="text-center">
                  <td className="border px-4 py-2">{item.id}</td>
                  <td className="border px-4 py-2">{item.id_pelanggan}</td>
                  <td className="border px-4 py-2">{item.nama_pelanggan || 'N/A'}</td>
                  <td className="border px-4 py-2">
                    {format(new Date(item.tanggal), "dd MMMM yyyy HH:mm:ss", { locale: id })}
                  </td>
                  <td className="border px-4 py-2">{formatRupiah(item.total_bayar)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="border px-4 py-8 text-center text-gray-500">
                  Belum ada riwayat pembayaran yang selesai
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                page === currentPage ? "bg-green-500 text-white" : "bg-white"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Riwayat;
