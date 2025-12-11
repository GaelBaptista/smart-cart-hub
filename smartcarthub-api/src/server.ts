// ============================
// SMARTCARTHUB - API SERVER
// ============================

import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import { randomUUID } from "crypto"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../generated/prisma/client"

// ============================
// CONFIGURAÇÕES GERAIS
// ============================

const JWT_SECRET = "smartcarthub_secret_key" // ⚠️ use variável de ambiente em produção

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
})
const prisma = new PrismaClient({ adapter })
const app = express()

// ============================
// CORS
// ============================

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.0.100:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
      ]
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.warn("🚫 CORS bloqueado para:", origin)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(express.json())

// ============================
// AUTENTICAÇÃO
// ============================

function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: "Token não fornecido" })

  const token = authHeader.split(" ")[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    // @ts-ignore
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" })
  }
}

// ============================
// ROTAS PRINCIPAIS
// ============================

// Criar supermercado
app.post("/supermarkets", async (req, res) => {
  try {
    const { name, address } = req.body
    if (!name)
      return res.status(400).json({ error: "O campo 'name' é obrigatório" })

    const supermarket = await prisma.supermarket.create({
      data: { name, address },
    })
    res.json(supermarket)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao criar supermercado" })
  }
})

// Listar supermercados
app.get("/supermarkets", async (req, res) => {
  try {
    const supermarkets = await prisma.supermarket.findMany({
      include: { sections: true },
    })
    res.json(supermarkets)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao listar supermercados" })
  }
})

// Registrar usuário
// Registrar gerente (cria supermercado se necessário)
app.post("/users/register", async (req, res) => {
  try {
    const { name, email, password, role, supermarketName, address } = req.body

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Preencha todos os campos obrigatórios" })
    }

    // Verifica se já existe o usuário
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" })
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Procura supermercado existente (para não duplicar)
    let supermarket = await prisma.supermarket.findFirst()

    // Se não existe, cria um novo automaticamente
    if (!supermarket) {
      supermarket = await prisma.supermarket.create({
        data: {
          name: supermarketName || `${name.split(" ")[0]}'s Market`,
          address: address || "Endereço não informado",
        },
      })
    }

    // Cria o usuário (vinculado ao supermercado)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "GERENTE",
        supermarketId: supermarket.id,
      },
    })

    res.json({
      message: "Gerente cadastrado com sucesso!",
      user,
      supermarket,
    })
  } catch (error) {
    console.error("Erro ao registrar gerente:", error)
    res.status(500).json({ error: "Erro ao registrar gerente" })
  }
})

// Login de usuário
// ✅ Login de usuário
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Busca usuário pelo e-mail
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    // Verifica senha
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: "Senha incorreta" })
    }

    // Gera o token JWT com papel (role)
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role, // 👈 agora envia GERENTE ou CLIENTE
        supermarketId: user.supermarketId,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    )

    // Retorna token + papel + info básica do usuário
    res.json({
      message: "Login bem-sucedido",
      token,
      role: user.role, // 👈 importante para redirecionamento no front
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    res.status(500).json({ error: "Erro ao fazer login" })
  }
})

// Criar seção (associa automaticamente ao primeiro supermercado)

// Criar produto
app.post("/products", authenticate, async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body })
    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao criar produto" })
  }
})

// Criar carrinho
// Criar ou obter carrinho ativo do cliente
app.post("/cart", async (req, res) => {
  try {
    const { supermarketId } = req.body

    // Busca se já existe um carrinho ativo
    const existing = await prisma.cart.findFirst({
      where: {
        isActive: true,
        supermarketId,
      },
    })

    if (existing) {
      return res.json(existing)
    }

    // Caso contrário, cria um novo carrinho
    const cart = await prisma.cart.create({
      data: {
        uuid: crypto.randomUUID(),
        isActive: true,
        supermarketId,
      },
    })

    res.json(cart)
  } catch (error) {
    console.error("Erro ao criar carrinho:", error)
    res.status(500).json({ error: "Erro ao criar carrinho" })
  }
})

// Adicionar item ao carrinho
app.post("/cart/:id/items", async (req, res) => {
  try {
    const { productId, quantity, observedPrice } = req.body
    const cartId = Number(req.params.id)

    const price = Number(observedPrice) || 0
    const subtotal = price * Number(quantity)

    const item = await prisma.cartItem.create({
      data: {
        productId,
        cartId,
        quantity,
        observedPrice: price,
        subtotal,
      },
    })

    res.json(item)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao adicionar item ao carrinho" })
  }
})

app.post("/cart/create-test", async (req, res) => {
  try {
    const supermarket = await prisma.supermarket.findFirst()
    if (!supermarket)
      return res.status(400).json({ error: "Crie um supermercado primeiro" })

    const cart = await prisma.cart.create({
      data: {
        uuid: crypto.randomUUID(),
        isActive: true,
        supermarketId: supermarket.id,
      },
    })

    res.json(cart)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao criar carrinho de teste" })
  }
})

// ✅ Listar rupturas detalhadas

// Listar seções
app.get("/sections", async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      include: { products: true },
    })
    res.json(sections)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao listar seções" })
  }
})

// Listar produtos
app.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { section: true },
    })
    res.json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao listar produtos" })
  }
})

// Listar rupturas
app.get("/ruptures", async (req, res) => {
  try {
    const ruptures = await prisma.rupture.findMany({
      include: { cart: true, product: true },
    })
    res.json(ruptures)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao listar rupturas" })
  }
})

// ✅ Registrar ruptura (quando cliente não encontra um produto)
app.post("/ruptures", async (req, res) => {
  try {
    const { cartId, productId, productName, note } = req.body

    if (!cartId || (!productId && !productName)) {
      return res
        .status(400)
        .json({ error: "Informe o carrinho e o produto (id ou nome)." })
    }

    const rupture = await prisma.rupture.create({
      data: {
        cartId,
        productId: productId || null,
        productName: productName || null,
        note: note || null,
      },
    })

    res.json(rupture)
  } catch (error) {
    console.error("Erro ao registrar ruptura:", error)
    res.status(500).json({ error: "Erro ao registrar ruptura" })
  }
})

// CARRINHO COM TOTAL
app.get("/cart/:id", async (req, res) => {
  try {
    const cartId = Number(req.params.id)
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: { product: { include: { section: true } } },
        },
      },
    })

    if (!cart) return res.status(404).json({ error: "Carrinho não encontrado" })

    const total = cart.items.reduce(
      (sum, item) => sum + (item.observedPrice ?? 0) * item.quantity,
      0
    )

    const route = [
      ...new Set(
        cart.items.map(i => i.product.section?.name || "Desconhecida")
      ),
    ]

    res.json({ ...cart, total, route })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao carregar carrinho" })
  }
})

// DASHBOARD ANALÍTICO
app.get("/analytics", async (req, res) => {
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
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao carregar análises" })
  }
})

// Buscar produtos (autocomplete)
app.get("/products/search", async (req, res) => {
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
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    res.status(500).json({ error: "Erro ao buscar produtos" })
  }
})

// Criar seção (com coordenadas opcionais)
// Criar seção (com coordenadas ou posição)
app.post("/sections", authenticate, async (req, res) => {
  try {
    const { name, position } = req.body
    if (!name || !position)
      return res.status(400).json({ error: "Informe nome e posição" })

    const supermarket = await prisma.supermarket.findFirst()
    if (!supermarket)
      return res.status(404).json({ error: "Nenhum supermercado encontrado" })

    const section = await prisma.section.create({
      data: {
        name,
        position: Number(position), // garante número
        supermarketId: supermarket.id,
      },
    })

    res.json(section)
  } catch (error) {
    console.error("Erro ao criar seção:", error)
    res.status(500).json({ error: "Erro ao criar seção" })
  }
})

app.get("/sections", async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      include: { products: true },
      orderBy: { id: "asc" },
    })
    res.json(sections)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao listar seções" })
  }
})

// 🧭 Rota otimizada (ordena seções pela posição)
app.get("/route-optimize/:cartId", async (req, res) => {
  try {
    const cartId = Number(req.params.cartId)

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: { product: { include: { section: true } } },
        },
      },
    })

    if (!cart) return res.status(404).json({ error: "Carrinho não encontrado" })

    // Extrai seções únicas
    const sections = [
      ...new Map(
        cart.items
          .map(i => i.product.section)
          .filter(Boolean)
          .map(sec => [sec.id, sec])
      ).values(),
    ]

    // Ordena pela posição (ou id, se posição for nula)
    const sorted = sections.sort((a, b) => {
      const posA = a.position ?? a.id
      const posB = b.position ?? b.id
      return posA - posB
    })

    res.json(sorted)
  } catch (error) {
    console.error("Erro ao otimizar rota:", error)
    res.status(500).json({ error: "Erro ao otimizar rota" })
  }
})

// ============================
// INICIAR SERVIDOR
// ============================

const PORT = 3000
app.listen(PORT, () => {
  console.log(`🚀 SmartCartHub API rodando em http://localhost:${PORT}`)
})
