import axios from "axios"
const API_URL = "http://127.0.0.1:5000"

export async function getAllPelanggan() {
  try {
    const res = await axios.get(`${API_URL}/pelanggan`)
    return res.data
  } catch (err) {
    console.error("Gagal ambil data pelanggan:", err)
    return []
  }
}

export async function createPelanggan(data) {
  return axios.post(`${API_URL}/pelanggan`, data)
}

export async function updatePelanggan(id, data) {
  return axios.put(`${API_URL}/pelanggan/${id}`, data)
}

export async function deletePelanggan(id) {
  return axios.delete(`${API_URL}/pelanggan/${id}`)
}
