import { Router } from 'express'
import { prisma } from '../../shared/db'

export const router = Router()

router.get('/', async (req, res) => {
  try {
    const where: any = {}
    if (req.query.orgaoId) where.orgaoId = req.query.orgaoId
    if (req.query.ano) where.ano = Number(req.query.ano)
    if (req.query.status) where.status = req.query.status

    const planos = await prisma.pCA.findMany({
      where,
      include: {
        _count: { select: { itens: true } },
        itens: {
          select: {
            id: true,
            categoria: true,
            valorTotalEstimado: true,
            status: true
          }
        }
      },
      orderBy: [{ ano: 'desc' }, { versao: 'desc' }]
    })

    const result = planos.map((p: any) => ({
      ...p,
      totalEstimado: p.itens.reduce((sum: number, i: any) => sum + Number(i.valorTotalEstimado), 0),
      quantidadeItens: p._count.itens,
      itens: undefined,
      _count: undefined
    }))

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar PCAs' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const pca = await prisma.pCA.findUnique({
      where: { id: req.params.id },
      include: {
        orgao: true,
        itens: { orderBy: [{ prioridade: 'asc' }, { mesPrevisto: 'asc' }] }
      }
    })
    if (!pca) return res.status(404).json({ error: 'PCA não encontrado' })
    res.json(pca)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar PCA' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { orgaoId, ano, observacoes, dfdIds } = req.body

    const ultimaVersao = await prisma.pCA.findFirst({
      where: { orgaoId, ano },
      orderBy: { versao: 'desc' },
      select: { versao: true }
    })
    const versao = (ultimaVersao?.versao || 0) + 1

    const itens = dfdIds?.length
      ? await prisma.itemPCA.findMany({ where: { dfdId: { in: dfdIds }, pcaId: null } })
      : []

    const pca = await prisma.pCA.create({
      data: {
        orgaoId,
        ano: ano || new Date().getFullYear() + 1,
        versao,
        observacoes,
        itens: {
          connect: itens.map((i: any) => ({ id: i.id }))
        }
      },
      include: { itens: true }
    })

    if (dfdIds?.length) {
      await prisma.documentoFormalizacaoDemanda.updateMany({
        where: { id: { in: dfdIds } },
        data: { status: 'EM_ANALISE' }
      })
    }

    res.status(201).json(pca)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar PCA' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const pca = await prisma.pCA.update({
      where: { id: req.params.id },
      data: req.body
    })
    res.json(pca)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar PCA' })
  }
})

router.post('/:id/aprovar', async (req, res) => {
  try {
    const pca = await prisma.pCA.update({
      where: { id: req.params.id },
      data: { status: 'APROVADO', dataAprovacao: new Date() }
    })
    res.json(pca)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao aprovar PCA' })
  }
})

router.post('/:id/consolidar', async (req, res) => {
  try {
    const pca = await prisma.pCA.update({
      where: { id: req.params.id },
      data: { status: 'CONSOLIDADO' }
    })
    res.json(pca)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao consolidar PCA' })
  }
})

router.post('/:id/publicar', async (req, res) => {
  try {
    const pca = await prisma.pCA.update({
      where: { id: req.params.id },
      data: { status: 'PUBLICADO', dataPublicacao: new Date() }
    })
    res.json(pca)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao publicar PCA' })
  }
})

router.get('/:id/exportar', async (req, res) => {
  try {
    const pca = await prisma.pCA.findUnique({
      where: { id: req.params.id },
      include: {
        orgao: true,
        itens: { orderBy: [{ prioridade: 'asc' }, { mesPrevisto: 'asc' }] }
      }
    })
    if (!pca) return res.status(404).json({ error: 'PCA não encontrado' })

    const linhas = pca.itens.map((item: any) => ({
      descricao: item.descricao,
      quantidade: item.quantidade,
      unidade: item.unidadeMedida,
      valorUnitario: Number(item.valorUnitarioEstimado),
      valorTotal: Number(item.valorTotalEstimado),
      categoria: item.categoria,
      natureza: item.natureza,
      mesPrevisto: item.mesPrevisto,
      prioridade: item.prioridade,
      status: item.status
    }))

    res.json({
      orgao: pca.orgao.nome,
      ano: pca.ano,
      versao: pca.versao,
      status: pca.status,
      dataAprovacao: pca.dataAprovacao,
      dataPublicacao: pca.dataPublicacao,
      totalGeral: linhas.reduce((s: number, i: any) => s + i.valorTotal, 0),
      itens: linhas
    })
  } catch (error) {
    res.status(500).json({ error: 'Erro ao exportar PCA' })
  }
})
