import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const API_URL = "http://localhost:3000"

interface Product {
  id: number
  name: string
  brand?: string
}

interface CartItem {
  id: number
  product: Product
  quantity: number
  observedPrice: number
  subtotal: number
}

interface Cart {
  id: number
  items: CartItem[]
  total: number
}

interface CartContextType {
  cart: Cart | null
  addItem: (productId: number, quantity: number, price: number) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({
  cart: null,
  addItem: async () => {},
  refreshCart: async () => {},
})

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null)
  const CART_ID = 1 // exemplo fixo

  async function refreshCart() {
    try {
      const res = await axios.get(`${API_URL}/cart/${CART_ID}`)
      setCart(res.data)
    } catch (err) {
      console.error("Erro ao carregar carrinho:", err)
    }
  }

  async function addItem(productId: number, quantity: number, price: number) {
    try {
      await axios.post(`${API_URL}/cart/${CART_ID}/items`, {
        productId,
        quantity,
        observedPrice: price,
      })
      await refreshCart()
    } catch (err) {
      console.error("Erro ao adicionar item:", err)
    }
  }

  useEffect(() => {
    refreshCart()
  }, [])

  return (
    <CartContext.Provider value={{ cart, addItem, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}
