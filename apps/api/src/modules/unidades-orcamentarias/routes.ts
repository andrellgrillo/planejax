import { Router } from 'express'
import { prisma } from '../../shared/db'

export const router = Router()

router.get('/', async (req, res) => {
  try {
    const where = req.query.orgaoId ? { orgaoId: req.query.orgaoId as string } : {}
    const uos = await prisma.unidadeOrcamentaria.findMany({
      where,
      include: {
        orgao: { select: { id: true, nome: true, sigla: true } },
      },
      orderBy: { nome: 'asc' }
    })
    res.json(uos)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar unidades orçamentárias' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const uo = await prisma.unidadeOrcamentaria.findUnique({
      where: { id: req.params.id },
      include: { orgao: { select: { id: true, nome: true, sigla: true } } }
    })
    if (!uo) return res.status(404).json({ error: 'Unidade orçamentária não encontrada' })
    res.json(uo)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar unidade orçamentária' })
  }
})

router.post('/', async (req, res) => {
  try {
    const uo = await prisma.unidadeOrcamentaria.create({ data: req.body })
    res.status(201).json(uo)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar unidade orçamentária' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const uo = await prisma.unidadeOrcamentaria.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(uo)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar unidade orçamentária' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.unidadeOrcamentaria.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir unidade orçamentária' })
  }
})
