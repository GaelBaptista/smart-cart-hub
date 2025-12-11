import { useEffect, useState } from "react"
import api from "../services/api"

export default function Sections() {
  const [sections, setSections] = useState<any[]>([])
  const [name, setName] = useState("")
  const [position, setPosition] = useState("")

  async function loadSections() {
    const res = await api.get("/sections")
    setSections(res.data)
  }

  async function handleAdd() {
    if (!name || !position) return alert("Preencha todos os campos")
    await api.post("/sections", { name, position: Number(position) })
    setName("")
    setPosition("")
    loadSections()
  }

  useEffect(() => {
    loadSections()
  }, [])

  return (
    <div style={{ color: "white", padding: "40px" }}>
      <h2>Gerenciar Seções</h2>

      <div>
        <input
          placeholder="Nome da seção"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          placeholder="Número da seção"
          type="number"
          value={position}
          onChange={e => setPosition(e.target.value)}
          style={{ width: "100px", marginLeft: "10px" }}
        />
        <button onClick={handleAdd} style={{ marginLeft: "10px" }}>
          Cadastrar
        </button>
      </div>

      <ul style={{ marginTop: "20px" }}>
        {sections.map(sec => (
          <li key={sec.id}>
            Seção {sec.position}: {sec.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
