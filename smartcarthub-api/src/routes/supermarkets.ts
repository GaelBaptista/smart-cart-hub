import express from "express"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../generated/prisma/client"

const router = express.Router()
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

router.post("/", async (req, res) => {
  try {
    const { name, address } = req.body
    const supermarket = await prisma.supermarket.create({
      data: { name, address },
    })
    res.json(supermarket)
  } catch {
    res.status(500).json({ error: "Erro ao criar supermercado" })
  }
})

router.get("/", async (_req, res) => {
  try {
    const supermarkets = await prisma.supermarket.findMany({
      include: { sections: true },
    })
    res.json(supermarkets)
  } catch {
    res.status(500).json({ error: "Erro ao listar supermercados" })
  }
})

export default router
