import { useState } from "react"
import api from "../services/api"

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login") // alterna entre login/cadastro
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [supermarketName, setSupermarketName] = useState("")
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔐 LOGIN
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.post("/users/login", { email, password })
      const { token, role, user } = response.data

      if (token && role) {
        localStorage.setItem("token", token)
        localStorage.setItem("role", role)
        localStorage.setItem("userName", user?.name || "")
        localStorage.setItem("userEmail", user?.email || "")

        // Redireciona conforme o papel
        if (role === "GERENTE") {
          window.location.href = "/dashboard"
        } else if (role === "CLIENTE") {
          window.location.href = "/cart"
        } else {
          setError("Tipo de usuário inválido.")
        }
      } else {
        setError("Falha no login. Dados inválidos.")
      }
    } catch (err: any) {
      console.error("LOGIN ERROR:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Erro ao fazer login.")
    } finally {
      setLoading(false)
    }
  }

  // 🧾 CADASTRO DE GERENTE
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.post("/users/register", {
        name,
        email,
        password,
        role: "GERENTE",
        supermarketName,
        address,
      })

      console.log("REGISTER RESPONSE:", response.data)
      alert("Gerente cadastrado com sucesso! Agora faça login.")
      setMode("login")
    } catch (err: any) {
      console.error("REGISTER ERROR:", err.response?.data || err.message)
      setError(err.response?.data?.error || "Erro ao cadastrar gerente.")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #555",
    backgroundColor: "#2a2a2a",
    color: "white",
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#121212",
        color: "white",
      }}
    >
      <div
        style={{
          backgroundColor: "#1e1e1e",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
          width: "340px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          {mode === "login" ? "Login no SmartCartHub" : "Cadastro de Gerente"}
        </h2>

        <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
          {mode === "register" && (
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {mode === "register" && (
            <>
              <input
                type="text"
                placeholder="Nome do supermercado (opcional)"
                value={supermarketName}
                onChange={e => setSupermarketName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Endereço do supermercado (opcional)"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={inputStyle}
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            {loading
              ? mode === "login"
                ? "Entrando..."
                : "Cadastrando..."
              : mode === "login"
              ? "Entrar"
              : "Cadastrar"}
          </button>
        </form>

        {error && (
          <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>
            {error}
          </p>
        )}

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            cursor: "pointer",
            color: "#4caf50",
            textDecoration: "underline",
          }}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Novo gerente? Cadastre-se aqui"
            : "Já tem conta? Faça login"}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          // Simula login de cliente
          localStorage.setItem("token", "fake-client-token")
          localStorage.setItem("role", "CLIENTE")
          window.location.href = "/cart"
        }}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "#2196f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Entrar como Cliente (Simulação)
      </button>
    </div>
  )
}
