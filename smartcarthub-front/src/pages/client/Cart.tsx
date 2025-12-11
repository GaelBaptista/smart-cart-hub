import { useEffect, useState } from "react"
import api from "../../services/api"
import RuptureModal from "../../components/RuptureModal"
import StoreMap from "../../components/StoreMap"

interface Section {
  id: number
  name: string
  position?: number | null
}

interface Product {
  id: number
  name: string
  brand?: string
  section?: Section
}

interface CartItem {
  id: number
  product: Product
  quantity: number
  observedPrice: number
  subtotal: number
}

interface CartData {
  id: number
  items: CartItem[]
  total: number
  route: Section[]
}

export default function Cart() {
  const [cart, setCart] = useState<CartData | null>(null)
  const [productResults, setProductResults] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [showRuptureModal, setShowRuptureModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [optimizedRoute, setOptimizedRoute] = useState<Section[]>([])
  const [allSections, setAllSections] = useState<Section[]>([])

  const cartId = 1 // ⚠️ Carrinho fixo de teste (iremos dinamizar depois)

  // 🧭 Carrega carrinho atual
  async function loadCart() {
    try {
      const response = await api.get(`/cart/${cartId}`)
      setCart(response.data)
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error)
    }
  }

  // 🧠 Carrega rota otimizada baseada nas seções dos itens
  async function loadOptimizedRoute() {
    try {
      const response = await api.get(`/cart/${cartId}`)
      const items = response.data.items as CartItem[]

      // Garante que cada seção apareça apenas uma vez
      const uniqueSections = [
        ...new Map(
          items
            .filter(item => item.product?.section)
            .map(item => [item.product.section!.id, item.product.section!])
        ).values(),
      ]

      // Ordena as seções pela posição (position)
      const orderedSections = uniqueSections.sort(
        (sectionA, sectionB) =>
          (sectionA.position || 0) - (sectionB.position || 0)
      )

      setOptimizedRoute(orderedSections)
    } catch (error) {
      console.error("Erro ao carregar rota otimizada:", error)
    }
  }

  // 🏬 Carrega TODAS as seções cadastradas no supermercado
  async function loadAllSections() {
    try {
      const response = await api.get("/sections")
      setAllSections(response.data)
    } catch (error) {
      console.error("Erro ao carregar todas as seções:", error)
    }
  }

  // 🔍 Busca produtos com autocomplete
  async function handleSearchProducts(query: string) {
    setSearchQuery(query)
    if (!query) {
      setProductResults([])
      return
    }

    try {
      const response = await api.get(`/products/search?q=${query}`)
      setProductResults(response.data)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
    }
  }

  // ➕ Adiciona item ao carrinho
  async function handleAddItem() {
    if (!selectedProduct) return alert("Selecione um produto!")
    if (!price || Number(price) <= 0) return alert("Informe um preço válido!")
    if (quantity <= 0) return alert("Informe a quantidade!")

    setLoading(true)
    try {
      await api.post(`/cart/${cartId}/items`, {
        productId: selectedProduct.id,
        quantity,
        observedPrice: Number(price),
      })

      await loadCart()
      await loadOptimizedRoute()

      // Limpa campos após adicionar
      setSearchQuery("")
      setProductResults([])
      setSelectedProduct(null)
      setPrice("")
      setQuantity(1)
    } catch (error) {
      console.error("Erro ao adicionar item:", error)
    } finally {
      setLoading(false)
    }
  }

  // 🚀 Carregamento inicial
  useEffect(() => {
    loadCart()
    loadOptimizedRoute()
    loadAllSections()
  }, [])

  return (
    <div
      style={{
        color: "white",
        backgroundColor: "#121212",
        minHeight: "100vh",
        padding: "40px",
      }}
    >
      <h2 style={{ fontSize: "1.8rem", display: "flex", alignItems: "center" }}>
        🛒 Lista de Compras
      </h2>

      {/* 🔍 Campo de busca */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Digite ou escolha um produto..."
          value={searchQuery}
          onChange={e => handleSearchProducts(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "4px",
            border: "1px solid #555",
            backgroundColor: "#1e1e1e",
            color: "white",
          }}
        />

        <input
          type="number"
          placeholder="Preço"
          value={price}
          onChange={e => setPrice(e.target.value)}
          style={{
            padding: "10px",
            marginLeft: "10px",
            width: "100px",
            borderRadius: "4px",
            border: "1px solid #555",
            backgroundColor: "#1e1e1e",
            color: "white",
          }}
        />

        <input
          type="number"
          placeholder="Qtd"
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          min={1}
          style={{
            padding: "10px",
            marginLeft: "10px",
            width: "70px",
            borderRadius: "4px",
            border: "1px solid #555",
            backgroundColor: "#1e1e1e",
            color: "white",
          }}
        />

        <button
          onClick={handleAddItem}
          disabled={loading}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Adicionando..." : "Adicionar"}
        </button>

        <button
          onClick={() => setShowRuptureModal(true)}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Não encontrei
        </button>
      </div>

      {/* 📋 Sugestões de produtos */}
      {productResults.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            marginTop: "10px",
            background: "#1e1e1e",
            borderRadius: "4px",
            padding: "10px",
            width: "420px",
          }}
        >
          {productResults.map(product => (
            <li
              key={product.id}
              onClick={() => {
                setSelectedProduct(product)
                setSearchQuery(product.name)
                setProductResults([])
              }}
              style={{
                padding: "5px",
                cursor: "pointer",
                borderBottom: "1px solid #333",
              }}
            >
              {product.name} — <small>{product.brand}</small>
            </li>
          ))}
        </ul>
      )}

      {/* 🧾 Carrinho */}
      <h3 style={{ marginTop: "40px", fontSize: "1.3rem" }}>🧾 Carrinho</h3>

      {cart && cart.items.length > 0 ? (
        <>
          <ul style={{ marginTop: "10px" }}>
            {cart.items.map(item => (
              <li key={item.id}>
                {item.product.name} — {item.quantity}x R$
                {item.observedPrice.toFixed(2)} ={" "}
                <strong>R${item.subtotal.toFixed(2)}</strong> (
                {item.product.section?.name})
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: "20px" }}>
            💰 Total: <strong>R${cart.total.toFixed(2)}</strong>
          </h3>

          <h4 style={{ marginTop: "20px" }}>🗺️ Rota sugerida:</h4>
          <ul>
            {optimizedRoute.map(section => (
              <li key={section.id}>
                Seção {section.position ?? section.id} — {section.name}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p style={{ marginTop: "10px", color: "#aaa" }}>
          Nenhum item adicionado.
        </p>
      )}

      {/* Modal de ruptura */}
      {showRuptureModal && (
        <RuptureModal
          onClose={() => setShowRuptureModal(false)}
          cartId={cartId}
        />
      )}

      {/* 🗺️ Mapa da loja */}
      <StoreMap sections={allSections} routeSections={optimizedRoute} />
    </div>
  )
}
