import { useEffect, useState } from "react"
import {
  getAllPelanggan,
  createPelanggan,
  updatePelanggan,
  deletePelanggan,
} from "../services/pelangganAPI"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"

// Komponen Modal Form Pelanggan
function PelangganModal({ open, onClose, onSubmit, form, setForm, isEdit }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        onSubmit={onSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Edit Pelanggan" : "Tambah Pelanggan"}
        </h2>
        <input
          type="text"
          placeholder="Nama"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          className="w-full border px-3 py-2 rounded mb-3"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border px-3 py-2 rounded mb-3"
          required
        />
        <input
          type="text"
          placeholder="No HP"
          value={form.no_hp}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, "")
            setForm({ ...form, no_hp: value })
          }}
          className="w-full border px-3 py-2 rounded mb-3"
          required
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <textarea
          placeholder="Alamat"
          value={form.alamat}
          onChange={(e) => setForm({ ...form, alamat: e.target.value })}
          className="w-full border px-3 py-2 rounded mb-4"
          required
        ></textarea>
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
          >
            {isEdit ? "Simpan" : "Tambah"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 px-4 py-2 rounded hover:bg-gray-300"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}

// Komponen Pagination
function Pagination({ totalPages, currentPage, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => onChange(currentPage - 1)}
        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === i + 1
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onChange(currentPage + 1)}
        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  )
}

const initialForm = { nama: "", email: "", no_hp: "", alamat: "" }

const Pelanggan = () => {
  // State utama
  const [pelanggan, setPelanggan] = useState([])
  const [searchId, setSearchId] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const navigate = useNavigate()

  // Ambil data pelanggan
  const fetchData = async () => {
    const data = await getAllPelanggan()
    setPelanggan(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Buka modal tambah/edit
  const openModal = (item = null) => {
    if (item) {
      setForm(item)
      setSelectedId(item.id)
      setIsEdit(true)
    } else {
      setForm(initialForm)
      setIsEdit(false)
      setSelectedId("")
    }
    setModalOpen(true)
  }

  // Submit form tambah/edit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email.endsWith("@gmail.com")) {
      Swal.fire("Gagal", "Email harus menggunakan domain @gmail.com", "error")
      return
    }
    if (!form.no_hp || !/^[0-9]+$/.test(form.no_hp)) {
      Swal.fire("Gagal", "No HP hanya boleh berisi angka", "error")
      return
    }
    const confirm = await Swal.fire({
      title: isEdit ? "Yakin akan mengedit data?" : "Yakin akan menambahkan data?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
      customClass: {
        confirmButton: isEdit
          ? "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          : "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
        cancelButton: "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500",
      },
      buttonsStyling: false,
    })
    if (!confirm.isConfirmed) return
    try {
      if (isEdit) {
        await updatePelanggan(selectedId, form)
        await Swal.fire({
          icon: "success",
          title: "Data berhasil diperbarui",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
          },
          buttonsStyling: false,
        })
      } else {
        await createPelanggan(form)
        await Swal.fire({
          icon: "success",
          title: "Data berhasil ditambahkan",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
          },
          buttonsStyling: false,
        })
      }
      setModalOpen(false)
      fetchData()
    } catch {
      Swal.fire("Gagal", "Terjadi kesalahan", "error")
    }
  }

  // Hapus pelanggan
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus pelanggan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
      customClass: {
        confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
        cancelButton: "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500",
      },
      buttonsStyling: false,
    })
    if (!confirm.isConfirmed) return
    try {
      await deletePelanggan(id)
      await Swal.fire({
        icon: "success",
        title: "Pelanggan berhasil dihapus",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
        },
        buttonsStyling: false,
      })
      fetchData()
    } catch {
      Swal.fire("Gagal", "Tidak bisa menghapus", "error")
    }
  }

  // Filter dan pagination
  const filteredData = pelanggan.filter((item) =>
    item.id.toLowerCase().includes(searchId.toLowerCase())
  )
  const dataToDisplay = searchId ? filteredData : pelanggan
  const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage)
  const paginatedData = dataToDisplay.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Render utama
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-center w-full">Daftar Pelanggan</h1>
        <button
          onClick={() => navigate("/")}
          className="absolute right-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Kembali
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <button
          onClick={() => openModal()}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400"
        >
          Tambah Pelanggan
        </button>
        <input
          type="text"
          placeholder="Cari berdasarkan ID"
          value={searchId}
          onChange={(e) => {
            setSearchId(e.target.value)
            setCurrentPage(1)
          }}
          className="border px-3 py-2 rounded w-64"
        />
      </div>

      {/* Tabel Pelanggan */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">No HP</th>
              <th className="px-4 py-2">Alamat</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{item.id}</td>
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.email}</td>
                <td className="px-4 py-2">{item.no_hp}</td>
                <td className="px-4 py-2">{item.alamat}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => openModal(item)}
                    className="bg-yellow-400 hover:bg-yellow-300 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 hover:bg-red-400 px-2 py-1 text-white rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onChange={setCurrentPage}
      />

      {/* Modal */}
      <PelangganModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        isEdit={isEdit}
      />
    </div>
  )
}

export default Pelanggan
