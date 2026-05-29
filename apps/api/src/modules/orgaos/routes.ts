import { Router } from 'express'
import { prisma } from '../../shared/db'

export const router = Router()

router.get('/', async (_req, res) => {
  try {
    const orgaos = await prisma.orgao.findMany({
      include: { _count: { select: { unidades: true, pcas: true } } },
      orderBy: { nome: 'asc' }
    })
    res.json(orgaos)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar órgãos' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const orgao = await prisma.orgao.findUnique({
      where: { id: req.params.id },
      include: { unidades: true }
    })
    if (!orgao) return res.status(404).json({ error: 'Órgão não encontrado' })
    res.json(orgao)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar órgão' })
  }
})

router.post('/', async (req, res) => {
  try {
    const orgao = await prisma.orgao.create({ data: req.body })
    res.status(201).json(orgao)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar órgão' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const orgao = await prisma.orgao.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(orgao)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar órgão' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.orgao.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir órgão' })
  }
})
