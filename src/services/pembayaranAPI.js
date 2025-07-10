import axios from "axios"
const API_URL = "http://127.0.0.1:5000"

export async function getAllPembayaran() {
  try {
    const res = await axios.get(`${API_URL}/pembayaran`)
    return res.data
  } catch (err) {
    console.error("Gagal ambil data pembayaran:", err)
    return []
  }
}

export async function createPembayaran(data) {
  return axios.post(`${API_URL}/pembayaran`, data)
}

export async function updatePembayaran(id, data) {
  return axios.put(`${API_URL}/pembayaran/${id}`, data)
}

export async function deletePembayaran(id) {
  return axios.delete(`${API_URL}/pembayaran/${id}`)
}
