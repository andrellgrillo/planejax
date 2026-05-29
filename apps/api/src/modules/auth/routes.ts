import { Router } from 'express'
import { prisma } from '../../shared/db'

export const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario || usuario.senhaHash !== senha) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }
    if (!usuario.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' })
    }
    const { senhaHash, ...userData } = usuario
    res.json({ user: userData })
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.get('/usuarios', async (_req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({ omit: { senhaHash: true } })
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

router.post('/usuarios', async (req, res) => {
  try {
    const usuario = await prisma.usuario.create({ data: req.body })
    const { senhaHash, ...userData } = usuario
    res.status(201).json(userData)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar usuário' })
  }
})
