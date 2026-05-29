import { Router } from 'express'
import { prisma } from '../../shared/db'

export const router = Router()

router.get('/', async (req, res) => {
  try {
    const where: any = {}
    if (req.query.unidadeRequisitanteId) where.unidadeRequisitanteId = req.query.unidadeRequisitanteId
    if (req.query.status) where.status = req.query.status
    if (req.query.ano) where.ano = Number(req.query.ano)

    const dfds = await prisma.documentoFormalizacaoDemanda.findMany({
      where,
      include: {
        unidadeRequisitante: { include: { unidadeGestora: true } },
        itens: true,
        _count: { select: { itens: true } }
      },
      orderBy: [{ ano: 'desc' }, { numero: 'desc' }]
    })
    res.json(dfds)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar DFDs' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const dfd = await prisma.documentoFormalizacaoDemanda.findUnique({
      where: { id: req.params.id },
      include: {
        unidadeRequisitante: { include: { unidadeGestora: { include: { orgao: true } } } },
        itens: true
      }
    })
    if (!dfd) return res.status(404).json({ error: 'DFD não encontrado' })
    res.json(dfd)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar DFD' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { itens, ...data } = req.body

    const ultimoNumero = await prisma.documentoFormalizacaoDemanda.findFirst({
      where: { ano: data.ano || new Date().getFullYear() },
      orderBy: { numero: 'desc' },
      select: { numero: true }
    })
    const numero = (ultimoNumero?.numero || 0) + 1

    const dfd = await prisma.documentoFormalizacaoDemanda.create({
      data: {
        ...data,
        numero,
        ano: data.ano || new Date().getFullYear(),
        itens: {
          create: itens || []
        }
      },
      include: { itens: true }
    })
    res.status(201).json(dfd)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar DFD' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { itens, ...data } = req.body
    await prisma.itemPCA.deleteMany({ where: { dfdId: req.params.id } })
    const dfd = await prisma.documentoFormalizacaoDemanda.update({
      where: { id: req.params.id },
      data: {
        ...data,
        itens: { create: itens || [] }
      },
      include: { itens: true }
    })
    res.json(dfd)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar DFD' })
  }
})

router.post('/:id/aprovar', async (req, res) => {
  try {
    const dfd = await prisma.documentoFormalizacaoDemanda.update({
      where: { id: req.params.id },
      data: { status: 'APROVADO' },
      include: { itens: true }
    })
    res.json(dfd)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao aprovar DFD' })
  }
})

router.post('/:id/rejeitar', async (req, res) => {
  try {
    const dfd = await prisma.documentoFormalizacaoDemanda.update({
      where: { id: req.params.id },
      data: {
        status: 'REJEITADO',
        observacoes: req.body.motivo
      }
    })
    res.json(dfd)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao rejeitar DFD' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.itemPCA.deleteMany({ where: { dfdId: req.params.id } })
    await prisma.documentoFormalizacaoDemanda.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir DFD' })
  }
})
