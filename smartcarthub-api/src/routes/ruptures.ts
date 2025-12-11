import express from "express"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../generated/prisma/client"

const router = express.Router()
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

router.post("/", async (req, res) => {
  try {
    const { cartId, productName, note } = req.body
    const rupture = await prisma.rupture.create({
      data: { cartId, productName, note },
    })
    res.json(rupture)
  } catch {
    res.status(500).json({ error: "Erro ao registrar ruptura" })
  }
})

router.get("/", async (_req, res) => {
  try {
    const ruptures = await prisma.rupture.findMany({
      include: { cart: true },
    })
    res.json(ruptures)
  } catch {
    res.status(500).json({ error: "Erro ao listar rupturas" })
  }
})

export default router
