import { useEffect, useState } from "react"
import api from "../services/api"

interface Rupture {
  id: number
  productName: string
  section: string
  note: string
  supermarket: string
  createdAt: string
}

export default function Ruptures() {
  const [ruptures, setRuptures] = useState<Rupture[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadRuptures()
  }, [])

  async function loadRuptures() {
    try {
      const res = await api.get("/ruptures")
      setRuptures(res.data)
    } catch (err) {
      console.error("Erro ao buscar rupturas:", err)
    }
  }

  const filtered = ruptures.filter(r =>
    r.productName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ color: "white", padding: "40px" }}>
      <h2>🚫 Rupturas Detalhadas</h2>

      <input
        placeholder="Filtrar por produto..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          marginTop: "20px",
          padding: "8px",
          width: "300px",
          borderRadius: "5px",
        }}
      />

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "25px",
          color: "#ddd",
        }}
      >
        <thead>
          <tr style={{ background: "#222" }}>
            <th style={{ padding: "8px", textAlign: "left" }}>Produto</th>
            <th style={{ padding: "8px" }}>Seção</th>
            <th style={{ padding: "8px" }}>Observação</th>
            <th style={{ padding: "8px" }}>Supermercado</th>
            <th style={{ padding: "8px" }}>Data</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id} style={{ borderBottom: "1px solid #333" }}>
              <td style={{ padding: "8px" }}>{r.productName}</td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {r.section}
              </td>
              <td style={{ padding: "8px" }}>{r.note || "—"}</td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {r.supermarket}
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                {r.createdAt}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p style={{ color: "#999", marginTop: "20px" }}>
          Nenhuma ruptura encontrada.
        </p>
      )}
    </div>
  )
}
