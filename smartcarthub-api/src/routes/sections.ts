import express from "express"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../generated/prisma/client"

const router = express.Router()
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

router.post("/", async (req, res) => {
  try {
    const { name } = req.body
    const supermarket = await prisma.supermarket.findFirst()
    const section = await prisma.section.create({
      data: { name, supermarketId: supermarket?.id ?? 1 },
    })
    res.json(section)
  } catch {
    res.status(500).json({ error: "Erro ao criar seção" })
  }
})

router.get("/", async (_req, res) => {
  try {
    const sections = await prisma.section.findMany({
      include: { products: true },
    })
    res.json(sections)
  } catch {
    res.status(500).json({ error: "Erro ao listar seções" })
  }
})

export default router
