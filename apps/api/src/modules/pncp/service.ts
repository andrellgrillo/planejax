const PNCP_BASE = process.env.PNCP_API_URL || 'https://treina.pncp.gov.br/api/pncp'

interface PncpAuthResponse {
  accessToken?: string
  token?: string
  [key: string]: unknown
}

interface PncpItemInput {
  numeroItem: number
  categoriaItemPca: number
  descricao: string
  unidadeFornecimento: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  valorOrcamentoExercicio: number
  unidadeRequisitante?: string
  dataDesejada: string
  catalogo: number
  classificacaoCatalogo: '1' | '2'
  classificacaoSuperiorCodigo: string
  classificacaoSuperiorNome: string
}

interface PncpPlanoInput {
  codigoUnidade: string
  anoPca: number
  itensPlano: PncpItemInput[]
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${PNCP_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PNCP API error ${res.status}: ${text}`)
  }

  if (res.status === 204) return {} as T
  return res.json()
}

async function requestWithAuth<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return request<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  })
}

async function autenticar(
  login: string,
  senha: string
): Promise<string> {
  const data = await request<PncpAuthResponse>('/v1/usuarios/login', {
    method: 'POST',
    body: JSON.stringify({ login, senha }),
  })
  const token = data.accessToken || data.token || ''
  if (!token) {
    throw new Error('Falha na autenticação PNCP: token não retornado')
  }
  return token
}

export async function getToken(
  login?: string,
  senha?: string
): Promise<string> {
  const user = login || process.env.PNCP_LOGIN
  const pass = senha || process.env.PNCP_SENHA
  if (!user || !pass) {
    throw new Error('Credenciais PNCP não configuradas. Defina PNCP_LOGIN e PNCP_SENHA no .env')
  }
  return autenticar(user, pass)
}

export async function inserirPlanoContratacao(
  cnpj: string,
  plano: PncpPlanoInput,
  token: string
): Promise<{ sequencial: number }> {
  return requestWithAuth(`/v1/orgaos/${cnpj}/pca`, token, {
    method: 'POST',
    body: JSON.stringify(plano),
  })
}

export async function consultarItensPlano(
  cnpj: string,
  ano: number,
  sequencial: number,
  token: string
): Promise<unknown[]> {
  return requestWithAuth(
    `/v1/orgaos/${cnpj}/pca/${ano}/${sequencial}/itens/plano`,
    token
  )
}

export async function excluirPlanoContratacao(
  cnpj: string,
  ano: number,
  sequencial: number,
  token: string
): Promise<void> {
  await requestWithAuth(
    `/v1/orgaos/${cnpj}/pca/${ano}/${sequencial}`,
    token,
    { method: 'DELETE' }
  )
}

export async function consultarCategoriasItem(
  token: string,
  statusAtivo?: boolean
): Promise<unknown[]> {
  const query = statusAtivo !== undefined ? `?statusAtivo=${statusAtivo}` : ''
  return requestWithAuth(`/v1/categoriaItemPcas${query}`, token)
}

export function mapItemToPncp(
  item: {
    descricao: string
    quantidade: number
    unidadeMedida: string
    valorUnitarioEstimado: number
    valorTotalEstimado: number
    mesPrevisto: number | null
    categoria: string
  },
  numeroItem: number,
  unidadeRequisitante?: string
): PncpItemInput {
  const categoriaMap: Record<string, number> = {
    MATERIAL_CONSUMO: 1,
    MATERIAL_PERMANENTE: 2,
    SERVICO: 3,
    SERVICO_ENGENHARIA: 4,
    OBRA: 5,
    SOLUCAO_TI: 6,
    LOCACAO_IMOVEL: 7,
    CAPACITACAO: 8,
    OUTROS: 9,
  }

  const dataDesejada = item.mesPrevisto
    ? `2026-${String(item.mesPrevisto).padStart(2, '0')}-01`
    : '2026-12-01'

  return {
    numeroItem,
    categoriaItemPca: categoriaMap[item.categoria] || 9,
    descricao: item.descricao,
    unidadeFornecimento: item.unidadeMedida,
    quantidade: item.quantidade,
    valorUnitario: Number(item.valorUnitarioEstimado),
    valorTotal: Number(item.valorTotalEstimado),
    valorOrcamentoExercicio: Number(item.valorTotalEstimado),
    unidadeRequisitante,
    dataDesejada,
    catalogo: 0,
    classificacaoCatalogo: '1',
    classificacaoSuperiorCodigo: '0',
    classificacaoSuperiorNome: 'Geral',
  }
}
