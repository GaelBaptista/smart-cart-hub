import { useEffect, useState } from "react"
import axios from "axios"

const API_URL = "http://localhost:3000"

interface Section {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  brand?: string
  section: Section
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [name, setName] = useState("")
  const [brand, setBrand] = useState("")
  const [sectionId, setSectionId] = useState("")

  useEffect(() => {
    fetchSections()
    fetchProducts()
  }, [])

  const fetchSections = async () => {
    const res = await axios.get(`${API_URL}/sections`)
    setSections(res.data)
  }

  const fetchProducts = async () => {
    const res = await axios.get(`${API_URL}/products`)
    setProducts(res.data)
  }

  const handleSubmit = async () => {
    if (!name || !sectionId) {
      alert("Preencha os campos obrigatórios!")
      return
    }

    await axios.post(
      `${API_URL}/products`,
      { name, brand, sectionId: Number(sectionId) },
      {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      }
    )

    setName("")
    setBrand("")
    setSectionId("")
    fetchProducts()
  }

  return (
    <div className="products-page" style={{ color: "white" }}>
      <h2>🧱 Gerenciar Produtos</h2>

      <input
        placeholder="Nome do produto"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="Marca"
        value={brand}
        onChange={e => setBrand(e.target.value)}
      />

      <select value={sectionId} onChange={e => setSectionId(e.target.value)}>
        <option value="">Selecione a seção</option>
        {sections.map(sec => (
          <option key={sec.id} value={sec.id}>
            {sec.name}
          </option>
        ))}
      </select>

      <button onClick={handleSubmit}>Cadastrar</button>

      <hr />

      <h3>Produtos cadastrados</h3>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.name} {p.brand && `(${p.brand})`} — {p.section?.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
