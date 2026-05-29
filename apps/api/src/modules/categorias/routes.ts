import { Router } from 'express'
import { prisma } from '../../shared/db'

export const router = Router()

router.get('/', async (_req, res) => {
  try {
    const categorias = await prisma.categoriaItem.findMany({ orderBy: { nome: 'asc' } })
    res.json(categorias)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar categorias' })
  }
})

router.post('/', async (req, res) => {
  try {
    const categoria = await prisma.categoriaItem.create({ data: req.body })
    res.status(201).json(categoria)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar categoria' })
  }
})

router.get('/naturezas', async (_req, res) => {
  try {
    const naturezas = await prisma.naturezaItemConfig.findMany({ orderBy: { nome: 'asc' } })
    res.json(naturezas)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar naturezas' })
  }
})

router.post('/naturezas', async (req, res) => {
  try {
    const natureza = await prisma.naturezaItemConfig.create({ data: req.body })
    res.status(201).json(natureza)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar natureza' })
  }
})
