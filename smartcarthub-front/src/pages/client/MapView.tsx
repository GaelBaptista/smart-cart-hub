import { useEffect, useState } from "react"
import api from "../../services/api"

export default function MapView() {
  const [sections, setSections] = useState<any[]>([])

  useEffect(() => {
    api.get("/sections").then(res => setSections(res.data))
  }, [])

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    width: "300px",
    margin: "40px auto",
  }

  return (
    <div style={{ color: "white", textAlign: "center" }}>
      <h3>🗺️ Mapa da Loja</h3>
      <div style={gridStyle}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const section = sections.find(s => s.position === num)
          return (
            <div
              key={num}
              style={{
                background: section ? "#4caf50" : "#333",
                border: "1px solid #555",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {section ? section.name : `Vazio ${num}`}
            </div>
          )
        })}
      </div>
    </div>
  )
}
