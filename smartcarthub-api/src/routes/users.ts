import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../../generated/prisma/client"

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || "smartcarthub_secret_key"

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" })
const prisma = new PrismaClient({ adapter })

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, supermarketId } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, supermarketId },
    })
    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao registrar usuário" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: "Senha incorreta" })
    const token = jwt.sign(
      { id: user.id, role: user.role, supermarketId: user.supermarketId },
      JWT_SECRET,
      { expiresIn: "8h" }
    )
    res.json({ message: "Login bem-sucedido", token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao fazer login" })
  }
})

export default router
