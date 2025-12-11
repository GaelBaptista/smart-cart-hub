import { useState } from "react"
import api from "../services/api"

interface RuptureModalProps {
  cartId: number
  onClose: () => void
}

export default function RuptureModal({ cartId, onClose }: RuptureModalProps) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔍 Busca produtos conforme digita
  async function handleSearchProducts(q: string) {
    setQuery(q)
    if (!q) {
      setProducts([])
      return
    }

    try {
      const res = await api.get(`/products/search?q=${q}`)
      setProducts(res.data)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
    }
  }

  // 💾 Envia ruptura
  async function handleSave() {
    if (!cartId) return alert("Carrinho não encontrado.")
    if (!query.trim()) return alert("Digite o nome do produto.")

    setLoading(true)
    try {
      await api.post("/ruptures", {
        cartId,
        productId: selectedProduct?.id || null,
        productName: query.trim(),
        note,
      })
      alert("Ruptura registrada com sucesso!")
      onClose()
    } catch (error) {
      console.error("Erro ao registrar ruptura:", error)
      alert("Erro ao registrar ruptura.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#1e1e1e",
          padding: "30px",
          borderRadius: "8px",
          width: "400px",
          boxShadow: "0px 0px 10px rgba(0,0,0,0.4)",
          color: "white",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>🚫 Produto não encontrado</h3>

        {/* 🔍 Campo de busca com autocomplete */}
        <input
          type="text"
          placeholder="Digite o nome do produto..."
          value={query}
          onChange={e => handleSearchProducts(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #555",
            backgroundColor: "#2a2a2a",
            color: "white",
          }}
        />

        {/* Lista de sugestões */}
        {products.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              backgroundColor: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "4px",
              marginTop: "5px",
              maxHeight: "150px",
              overflowY: "auto",
              padding: 0,
            }}
          >
            {products.map(p => (
              <li
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p)
                  setQuery(p.name)
                  setProducts([])
                }}
                style={{
                  padding: "8px 10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #333",
                }}
              >
                {p.name} — <small>{p.brand}</small>
              </li>
            ))}
          </ul>
        )}

        <textarea
          placeholder="Observação (opcional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            marginTop: "15px",
            borderRadius: "4px",
            border: "1px solid #555",
            padding: "10px",
            backgroundColor: "#2a2a2a",
            color: "white",
          }}
        />

        <div
          style={{ display: "flex", justifyContent: "end", marginTop: "20px" }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#777",
              border: "none",
              color: "white",
              padding: "10px 20px",
              borderRadius: "4px",
              marginRight: "10px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              backgroundColor: "#f44336",
              border: "none",
              color: "white",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}
