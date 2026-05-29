import { Router } from 'express'
import { prisma } from '../../shared/db'

export const router = Router()

router.get('/', async (req, res) => {
  try {
    const where = req.query.unidadeGestoraId ? { unidadeGestoraId: req.query.unidadeGestoraId as string } : {}
    const requisitantes = await prisma.unidadeRequisitante.findMany({
      where,
      include: {
        unidadeGestora: { select: { id: true, nome: true, sigla: true } },
        _count: { select: { dfds: true } }
      },
      orderBy: { nome: 'asc' }
    })
    res.json(requisitantes)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar unidades requisitantes' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const requisitante = await prisma.unidadeRequisitante.findUnique({
      where: { id: req.params.id },
      include: {
        unidadeGestora: { select: { id: true, nome: true, sigla: true } },
        _count: { select: { dfds: true } }
      }
    })
    if (!requisitante) return res.status(404).json({ error: 'Unidade requisitante não encontrada' })
    res.json(requisitante)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar unidade requisitante' })
  }
})

router.post('/', async (req, res) => {
  try {
    const requisitante = await prisma.unidadeRequisitante.create({ data: req.body })
    res.status(201).json(requisitante)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar unidade requisitante' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const requisitante = await prisma.unidadeRequisitante.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(requisitante)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar unidade requisitante' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.unidadeRequisitante.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir unidade requisitante' })
  }
})
