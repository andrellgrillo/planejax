import { Router } from 'express'
import { prisma } from '../../shared/db'

export const router = Router()

router.get('/', async (req, res) => {
  try {
    const where = req.query.orgaoId ? { orgaoId: req.query.orgaoId as string } : {}
    const unidades = await prisma.unidadeGestora.findMany({
      where,
      include: { _count: { select: { unidadesRequisitantes: true } } },
      orderBy: { nome: 'asc' }
    })
    res.json(unidades)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar unidades' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const unidade = await prisma.unidadeGestora.findUnique({
      where: { id: req.params.id },
      include: { unidadesRequisitantes: true }
    })
    if (!unidade) return res.status(404).json({ error: 'Unidade não encontrada' })
    res.json(unidade)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar unidade' })
  }
})

router.post('/', async (req, res) => {
  try {
    const unidade = await prisma.unidadeGestora.create({ data: req.body })
    res.status(201).json(unidade)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar unidade gestora' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const unidade = await prisma.unidadeGestora.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(unidade)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar unidade' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.unidadeGestora.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir unidade' })
  }
})

router.post('/:id/requisitantes', async (req, res) => {
  try {
    const requisitante = await prisma.unidadeRequisitante.create({
      data: { ...req.body, unidadeGestoraId: req.params.id }
    })
    res.status(201).json(requisitante)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar unidade requisitante' })
  }
})

router.get('/:id/requisitantes', async (req, res) => {
  try {
    const requisitantes = await prisma.unidadeRequisitante.findMany({
      where: { unidadeGestoraId: req.params.id },
      include: { _count: { select: { dfds: true } } }
    })
    res.json(requisitantes)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar unidades requisitantes' })
  }
})

router.put('/:ugId/requisitantes/:id', async (req, res) => {
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

router.delete('/:ugId/requisitantes/:id', async (req, res) => {
  try {
    await prisma.unidadeRequisitante.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir unidade requisitante' })
  }
})
