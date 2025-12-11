import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "smartcarthub_secret_key"

export function authenticate(req: Request, res: Response, next: NextFunction) {
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

export function authorize(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (req.user?.role !== role)
      return res.status(403).json({ error: "Acesso negado" })
    next()
  }
}
