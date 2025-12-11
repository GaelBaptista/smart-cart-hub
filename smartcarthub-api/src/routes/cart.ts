import express from "express"
import { randomUUID } from "crypto"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../generated/prisma/client"

const router = express.Router()
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

router.post("/", async (req, res) => {
  try {
    const { supermarketId } = req.body
    const cart = await prisma.cart.create({
      data: {
        uuid: randomUUID(),
        isActive: true,
        supermarket: { connect: { id: supermarketId } },
      },
    })
    res.json(cart)
  } catch {
    res.status(500).json({ error: "Erro ao criar carrinho" })
  }
})

router.post("/:id/items", async (req, res) => {
  try {
    const { productId, quantity, observedPrice } = req.body
    const cartId = Number(req.params.id)
    const subtotal = (Number(observedPrice) || 0) * Number(quantity)
    const item = await prisma.cartItem.create({
      data: { productId, cartId, quantity, observedPrice, subtotal },
    })
    res.json(item)
  } catch {
    res.status(500).json({ error: "Erro ao adicionar item" })
  }
})

router.put("/:id/finalize", async (req, res) => {
  try {
    const cartId = Number(req.params.id)
    const cart = await prisma.cart.update({
      where: { id: cartId },
      data: { isActive: false, finalizedAt: new Date() },
    })
    res.json({ message: "Compra finalizada!", cart })
  } catch {
    res.status(500).json({ error: "Erro ao finalizar compra" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const cartId = Number(req.params.id)
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: { include: { product: { include: { section: true } } } },
      },
    })
    if (!cart) return res.status(404).json({ error: "Carrinho não encontrado" })

    const total = cart.items.reduce(
      (sum, i) => sum + (i.observedPrice ?? 0) * i.quantity,
      0
    )
    const route = [
      ...new Set(
        cart.items.map(i => i.product.section?.name || "Desconhecida")
      ),
    ]
    res.json({ ...cart, total, route })
  } catch {
    res.status(500).json({ error: "Erro ao carregar carrinho" })
  }
})

export default router
