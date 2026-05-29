import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categorias = [
    { nome: 'Material de Consumo', tipo: 'MATERIAL_CONSUMO' as const },
    { nome: 'Material Permanente', tipo: 'MATERIAL_PERMANENTE' as const },
    { nome: 'Serviço', tipo: 'SERVICO' as const },
    { nome: 'Serviço de Engenharia', tipo: 'SERVICO_ENGENHARIA' as const },
    { nome: 'Obra', tipo: 'OBRA' as const },
    { nome: 'Solução de TI', tipo: 'SOLUCAO_TI' as const },
    { nome: 'Locação de Imóvel', tipo: 'LOCACAO_IMOVEL' as const },
    { nome: 'Capacitação', tipo: 'CAPACITACAO' as const },
    { nome: 'Outros', tipo: 'OUTROS' as const },
  ]

  const naturezas = [
    { nome: 'Continuado', tipo: 'CONTINUADO' as const },
    { nome: 'Não Continuado', tipo: 'NAO_CONTINUADO' as const },
    { nome: 'Continuado por Demanda', tipo: 'CONTINUADO_POR_DEMANDA' as const },
  ]

  for (const c of categorias) {
    await prisma.categoriaItem.upsert({
      where: { nome: c.nome },
      update: {},
      create: c,
    })
  }

  for (const n of naturezas) {
    await prisma.naturezaItemConfig.upsert({
      where: { nome: n.nome },
      update: {},
      create: n,
    })
  }

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@planejax.gov.br' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@planejax.gov.br',
      senhaHash: 'admin123',
      papel: 'ADMIN',
    },
  })

  const orgao = await prisma.orgao.upsert({
    where: { cnpj: '00000000000000' },
    update: {},
    create: {
      cnpj: '00000000000000',
      nome: 'Órgão Exemplo',
      sigla: 'ORGEX',
      esfera: 'FEDERAL',
      poder: 'EXECUTIVO',
    },
  })

  await prisma.unidadeOrcamentaria.create({
    data: {
      codigo: '001',
      nome: 'Unidade Orçamentária Exemplo',
      orgaoId: orgao.id,
    },
  })

  const ug = await prisma.unidadeGestora.create({
    data: {
      codigoUasg: '999999',
      nome: 'Unidade Gestora Exemplo',
      sigla: 'UGEX',
      orgaoId: orgao.id,
    },
  })

  const ur = await prisma.unidadeRequisitante.create({
    data: {
      nome: 'Setor de Compras',
      sigla: 'SECOM',
      unidadeGestoraId: ug.id,
    },
  })

  const dfd = await prisma.documentoFormalizacaoDemanda.create({
    data: {
      numero: 1,
      ano: 2026,
      unidadeRequisitanteId: ur.id,
      descricao: 'Aquisição de materiais de escritório',
      justificativa: 'Necessidade de suprimento para o exercício',
      status: 'RASCUNHO',
      itens: {
        create: [
          {
            descricao: 'Papel A4 (resma 500 folhas)',
            quantidade: 200,
            unidadeMedida: 'UN',
            valorUnitarioEstimado: 25.00,
            valorTotalEstimado: 5000.00,
            categoria: 'MATERIAL_CONSUMO',
            natureza: 'NAO_CONTINUADO',
            mesPrevisto: 2,
            prioridade: 'ALTA',
          },
          {
            descricao: 'Tonner para impressora HP',
            quantidade: 30,
            unidadeMedida: 'UN',
            valorUnitarioEstimado: 350.00,
            valorTotalEstimado: 10500.00,
            categoria: 'MATERIAL_CONSUMO',
            natureza: 'NAO_CONTINUADO',
            mesPrevisto: 3,
            prioridade: 'MEDIA',
          },
        ],
      },
    },
  })

  console.log('Seed concluído com sucesso!')
  console.log(`  Admin: admin@planejax.gov.br / admin123`)
  console.log(`  Órgão: ${orgao.nome}`)
  console.log(`  DFD: ${dfd.numero}/${dfd.ano}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
