import { Request, Response, NextFunction } from "express"

export function authorizeRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = req.user
    if (!user) return res.status(401).json({ error: "Não autenticado" })
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Acesso negado" })
    }
    next()
  }
}
