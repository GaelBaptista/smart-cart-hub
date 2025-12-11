import express from "express"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../generated/prisma/client"

const router = express.Router()
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

router.post("/", async (req, res) => {
  try {
    const { name, brand, sectionId } = req.body
    const product = await prisma.product.create({
      data: { name, brand, sectionId },
    })
    res.json(product)
  } catch {
    res.status(500).json({ error: "Erro ao criar produto" })
  }
})

router.get("/", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { section: true },
    })
    res.json(products)
  } catch {
    res.status(500).json({ error: "Erro ao listar produtos" })
  }
})

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query
    if (!q || typeof q !== "string")
      return res.status(400).json({ error: "Parâmetro 'q' é obrigatório" })

    const queryLower = q.toLowerCase()
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { name: { contains: queryLower } },
          { brand: { contains: q } },
          { brand: { contains: queryLower } },
        ],
      },
      take: 10,
    })
    res.json(products)
  } catch {
    res.status(500).json({ error: "Erro ao buscar produtos" })
  }
})

export default router
