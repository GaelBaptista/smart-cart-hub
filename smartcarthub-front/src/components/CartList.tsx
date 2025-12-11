import { useCart } from "../context/CartContext"

export default function CartList() {
  const { cart } = useCart()

  if (!cart) return <p>Carregando carrinho...</p>

  return (
    <div>
      <h3>Itens no Carrinho</h3>
      <ul>
        {cart.items.map(item => (
          <li key={item.id}>
            {item.product.name} — {item.quantity}x R$
            {item.observedPrice.toFixed(2)} ={" "}
            <b>R${item.subtotal.toFixed(2)}</b>
          </li>
        ))}
      </ul>

      <h3>💰 Total: R${cart.total.toFixed(2)}</h3>
    </div>
  )
}
