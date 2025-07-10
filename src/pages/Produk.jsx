import { useEffect, useState } from "react"
import {
  getAllProduk,
  createProduk,
  updateProduk,
  deleteProduk,
} from "../services/produkAPI"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"

const Produk = () => {
  const [produk, setProduk] = useState([])
  const [searchId, setSearchId] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    nama_produk: "",
    kategori: "",
    harga: "",
    stok: "",
    deskripsi: "",
  })
  const [isEdit, setIsEdit] = useState(false)
  const [selectedId, setSelectedId] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const navigate = useNavigate()

  const fetchData = async () => {
    const data = await getAllProduk()
    setProduk(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openModal = (item = null) => {
    if (item) {
      setForm({
        id: item.id, // tambahkan id ke form hanya untuk tampil di form edit
        nama_produk: item.nama_produk || "",
        kategori: item.kategori || "",
        harga: item.harga !== undefined && item.harga !== null ? String(item.harga) : "",
        stok: item.stok !== undefined && item.stok !== null ? String(item.stok) : "",
        deskripsi: item.deskripsi || "",
      })
      setSelectedId(item.id)
      setIsEdit(true)
    } else {
      setForm({
        nama_produk: "",
        kategori: "",
        harga: "",
        stok: "",
        deskripsi: "",
      })
      setIsEdit(false)
      setSelectedId("")
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Ambil semua field, termasuk id (jika edit)
    let payload;
    if (isEdit) {
      payload = {
        id: selectedId,
        nama_produk: form.nama_produk,
        kategori: form.kategori,
        harga: Number(form.harga),
        stok: Number(form.stok),
        deskripsi: form.deskripsi,
      }
    } else {
      payload = {
        nama_produk: form.nama_produk,
        kategori: form.kategori,
        harga: Number(form.harga),
        stok: Number(form.stok),
        deskripsi: form.deskripsi,
      }
    }

    // Validasi
    if (
      !payload.nama_produk ||
      !payload.kategori ||
      payload.harga === "" ||
      payload.stok === "" ||
      !payload.deskripsi
    ) {
      Swal.fire("Gagal", "Semua field wajib diisi", "error")
      return
    }
    if (isNaN(payload.harga) || payload.harga < 0) {
      Swal.fire("Gagal", "Harga harus berupa angka positif", "error")
      return
    }
    if (isNaN(payload.stok) || payload.stok < 0) {
      Swal.fire("Gagal", "Stok harus berupa angka positif", "error")
      return
    }

    const confirm = await Swal.fire({
      title: isEdit ? "Yakin akan mengedit data?" : "Yakin akan menambahkan data?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, simpan",
      cancelButtonText: "Batal",
      customClass: {
        confirmButton: `${isEdit ? "bg-blue-600" : "bg-green-600"} text-white px-4 py-2 rounded hover:${isEdit ? "bg-blue-700" : "bg-green-700"}`,
        cancelButton: "bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500",
      },
      buttonsStyling: false,
    })

    if (!confirm.isConfirmed) return

    try {
      if (isEdit) {
        await updateProduk(selectedId, payload)
        await Swal.fire({
          icon: "success",
          title: "Produk berhasil diperbarui",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",
          },
          buttonsStyling: false,
        })
      } else {
        await createProduk(payload)
        await Swal.fire({
          icon: "success",
          title: "Produk berhasil ditambahkan",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700",
          },
          buttonsStyling: false,
        })
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan", "error")
    }
  }

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus produk ini?",
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
      await deleteProduk(id)

      await Swal.fire({
        icon: "success",
        title: "Produk berhasil dihapus",
        confirmButtonText: "OK",
        customClass: {
          confirmButton: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700",
        },
        buttonsStyling: false,
      })

      fetchData()
    } catch (err) {
      Swal.fire("Gagal", "Tidak bisa menghapus", "error")
    }
  }

  const filteredData = produk.filter((item) =>
    item.id.toLowerCase().includes(searchId.toLowerCase())
  )
  const dataToDisplay = searchId ? filteredData : produk
  const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage)
  const paginatedData = dataToDisplay.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-center w-full">Daftar Produk</h1>
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
          Tambah Produk
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Kategori</th>
              <th className="px-4 py-2">Harga</th>
              <th className="px-4 py-2">Stok</th>
              <th className="px-4 py-2">Deskripsi</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-2">{item.id}</td>
                <td className="px-4 py-2">{item.nama_produk}</td>
                <td className="px-4 py-2">{item.kategori}</td>
                <td className="px-4 py-2">{item.harga}</td>
                <td className="px-4 py-2">{item.stok}</td>
                <td className="px-4 py-2">{item.deskripsi}</td>
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => changePage(currentPage - 1)}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => changePage(i + 1)}
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
            onClick={() => changePage(currentPage + 1)}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4"
          >
            <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Produk" : "Tambah Produk"}</h2>

            {isEdit && (
              <div>
                <label className="block mb-1">ID Produk</label>
                <input
                  type="text"
                  value={form.id}
                  disabled
                  className="border w-full px-3 py-2 rounded bg-gray-100 text-gray-500"
                />
              </div>
            )}

            <div>
              <label className="block mb-1">Nama Produk</label>
              <input
                type="text"
                value={form.nama_produk}
                onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
                className="border w-full px-3 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Kategori</label>
              <input
                type="text"
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="border w-full px-3 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Harga</label>
              <input
                type="number"
                value={form.harga}
                onChange={(e) => setForm({ ...form, harga: e.target.value })}
                className="border w-full px-3 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Stok</label>
              <input
                type="number"
                value={form.stok}
                onChange={(e) => setForm({ ...form, stok: e.target.value })}
                className="border w-full px-3 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-1">Deskripsi</label>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                className="border w-full px-3 py-2 rounded"
                rows="3"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Batal
              </button>
              <button
                type="submit"
                className={`${isEdit ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded`}
              >
                {isEdit ? "Simpan Perubahan" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Produk
