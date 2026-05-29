import { Router } from 'express'
import { prisma } from '../../shared/db'

export const router = Router()

router.get('/', async (req, res) => {
  try {
    const where: any = {}
    if (req.query.pcaId) where.pcaId = req.query.pcaId
    if (req.query.dfdId) where.dfdId = req.query.dfdId
    if (req.query.categoria) where.categoria = req.query.categoria
    if (req.query.status) where.status = req.query.status
    if (req.query.natureza) where.natureza = req.query.natureza

    const itens = await prisma.itemPCA.findMany({
      where,
      include: {
        dfd: { select: { id: true, descricao: true, numero: true, ano: true } },
        pca: { select: { id: true, versao: true, status: true } }
      },
      orderBy: [{ prioridade: 'asc' }, { mesPrevisto: 'asc' }]
    })
    res.json(itens)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar itens' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.itemPCA.findUnique({
      where: { id: req.params.id },
      include: { dfd: true, pca: true }
    })
    if (!item) return res.status(404).json({ error: 'Item não encontrado' })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar item' })
  }
})

router.post('/', async (req, res) => {
  try {
    const item = await prisma.itemPCA.create({
      data: {
        ...req.body,
        valorTotalEstimado: req.body.quantidade * req.body.valorUnitarioEstimado
      }
    })
    res.status(201).json(item)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar item' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body }
    if (data.quantidade && data.valorUnitarioEstimado) {
      data.valorTotalEstimado = data.quantidade * data.valorUnitarioEstimado
    }
    const item = await prisma.itemPCA.update({
      where: { id: req.params.id },
      data
    })
    res.json(item)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar item' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await prisma.itemPCA.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ error: 'Erro ao excluir item' })
  }
})
