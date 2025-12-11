import { useEffect, useState } from "react"
import api from "../services/api"

interface ProductSelectorProps {
  value: string
  onChange: (value: string) => void
  onSelect: (productId: number, productName: string) => void
  placeholder?: string
}

interface Product {
  id: number
  name: string
  brand: string | null
}

export default function ProductSelector({
  value,
  onChange,
  onSelect,
  placeholder = "Digite ou escolha um produto...",
}: ProductSelectorProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showList, setShowList] = useState(false)

  // busca automática conforme o usuário digita
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (value.trim().length > 1) {
        try {
          const res = await api.get(`/products/search?q=${value}`)
          setSuggestions(res.data)
          setShowList(true)
        } catch (err) {
          console.error("Erro ao buscar produtos:", err)
        }
      } else {
        setSuggestions([])
        setShowList(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [value])

  function handleSelect(product: Product) {
    onSelect(
      product.id,
      `${product.name}${product.brand ? ` (${product.brand})` : ""}`
    )
    onChange(`${product.name}${product.brand ? ` (${product.brand})` : ""}`)
    setShowList(false)
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "8px" }}
      />

      {showList && suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "38px",
            left: 0,
            width: "100%",
            background: "#222",
            border: "1px solid #444",
            borderRadius: "4px",
            zIndex: 5,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {suggestions.map(p => (
            <li
              key={p.id}
              onClick={() => handleSelect(p)}
              style={{
                padding: "6px 10px",
                cursor: "pointer",
                borderBottom: "1px solid #333",
              }}
            >
              {p.name} {p.brand && <small>({p.brand})</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
