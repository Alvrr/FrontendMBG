import axios from "axios"

const API_URL = "http://127.0.0.1:5000" // ganti sesuai port backend kamu

export async function getAllProduk() {
  try {
    const res = await axios.get(`${API_URL}/produk`)
    return res.data
  } catch (err) {
    console.error("Gagal ambil data produk:", err)
    return []
  }
}

export const getProdukById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/produk/${id}`)
    return response.data
  } catch (err) {
    console.error("Gagal ambil data produk berdasarkan ID:", err)
    return null
  }
}


export async function createProduk(data) {
  return axios.post(`${API_URL}/produk`, data)
}

export async function updateProduk(id, data) {
  return axios.put(`${API_URL}/produk/${id}`, data)
}

export async function deleteProduk(id) {
  return axios.delete(`${API_URL}/produk/${id}`)
}
