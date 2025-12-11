import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000", // ajusta se for diferente
})

// 🔐 Adiciona o token automaticamente se existir
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
