import { Router } from 'express'
import { prisma } from '../../shared/db'
import {
  getToken,
  inserirPlanoContratacao,
  consultarItensPlano,
  excluirPlanoContratacao,
  consultarCategoriasItem,
  mapItemToPncp,
} from './service'

export const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { login, senha } = req.body
    const token = await getToken(login, senha)
    res.json({ token })
  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Erro na autenticação PNCP' })
  }
})

router.get('/categorias', async (req, res) => {
  try {
    const token = await getToken()
    const categorias = await consultarCategoriasItem(token)
    res.json(categorias)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao consultar categorias PNCP' })
  }
})

router.post('/publicar/:pcaId', async (req, res) => {
  try {
    const pca = await prisma.pCA.findUnique({
      where: { id: req.params.pcaId },
      include: {
        orgao: true,
        itens: true,
      },
    })

    if (!pca) {
      return res.status(404).json({ error: 'PCA não encontrado' })
    }

    if (pca.status !== 'APROVADO') {
      return res.status(400).json({ error: 'PCA precisa estar APROVADO antes de publicar' })
    }

    const token = await getToken()

    const itensPlano = pca.itens.map((item, index) =>
      mapItemToPncp(
        {
          descricao: item.descricao,
          quantidade: item.quantidade,
          unidadeMedida: item.unidadeMedida,
          valorUnitarioEstimado: Number(item.valorUnitarioEstimado),
          valorTotalEstimado: Number(item.valorTotalEstimado),
          mesPrevisto: item.mesPrevisto,
          categoria: item.categoria,
        },
        index + 1
      )
    )

    const cnpj = pca.orgao.cnpj
    const unidadeGestora = await prisma.unidadeGestora.findFirst({
      where: { orgaoId: pca.orgaoId },
    })

    const resultado = await inserirPlanoContratacao(cnpj, {
      codigoUnidade: unidadeGestora?.codigoUasg || '999999',
      anoPca: pca.ano,
      itensPlano,
    }, token)

    await prisma.pCA.update({
      where: { id: pca.id },
      data: {
        status: 'PUBLICADO',
        dataPublicacao: new Date(),
      },
    })

    res.json({
      message: 'PCA publicado no PNCP com sucesso',
      sequencial: resultado.sequencial,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao publicar PCA no PNCP' })
  }
})

router.get('/consultar/:cnpj/:ano/:sequencial', async (req, res) => {
  try {
    const token = await getToken()
    const { cnpj, ano, sequencial } = req.params
    const itens = await consultarItensPlano(cnpj, Number(ano), Number(sequencial), token)
    res.json(itens)
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao consultar PCA no PNCP' })
  }
})

router.delete('/excluir/:cnpj/:ano/:sequencial', async (req, res) => {
  try {
    const token = await getToken()
    const { cnpj, ano, sequencial } = req.params
    await excluirPlanoContratacao(cnpj, Number(ano), Number(sequencial), token)
    res.json({ message: 'PCA excluído do PNCP' })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro ao excluir PCA do PNCP' })
  }
})
