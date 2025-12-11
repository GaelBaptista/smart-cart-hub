import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div style={{ color: "white", padding: "40px" }}>
      <h2>Painel do Gerente</h2>
      <p>Escolha o que deseja gerenciar:</p>

      <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
        <button onClick={() => navigate("/sections")}>🧩 Seções</button>
        <button onClick={() => navigate("/products")}>🛒 Produtos</button>
        <button onClick={() => navigate("/analytics")}>📊 Análises</button>
        <button onClick={() => navigate("/ruptures")}>🚫 Rupturas</button>
        <button
          onClick={() => {
            localStorage.removeItem("token")
            navigate("/")
          }}
          style={{ backgroundColor: "red", color: "white" }}
        >
          Sair
        </button>
      </div>
    </div>
  )
}
