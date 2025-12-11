import { useCart } from "../context/CartContext"

export default function CartHeader() {
  const { refreshCart } = useCart()

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <h2>🛒 Meu Carrinho</h2>
      <button onClick={refreshCart}>🔄 Atualizar</button>
    </div>
  )
}
