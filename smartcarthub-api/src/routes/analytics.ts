import express from "express"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../generated/prisma/client"

const router = express.Router()
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

router.get("/", async (_req, res) => {
  try {
    const topProducts = await prisma.product.findMany({
      include: { cartItems: true },
    })
    const topSelling = topProducts
      .map(p => ({ name: p.name, count: p.cartItems.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const ruptures = await prisma.rupture.findMany({
      include: { product: true },
    })
    const ruptureCount = ruptures.reduce<Record<string, number>>((acc, r) => {
      const name = r.product?.name ?? "Desconhecido"
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})

    res.json({ topSelling, ruptures: ruptureCount })
  } catch {
    res.status(500).json({ error: "Erro ao carregar análises" })
  }
})

export default router
