'use client'

import { useEffect, useState } from 'react'

interface PCA {
  id: string
  orgaoId: string
  ano: number
  versao: number
  status: string
  dataAprovacao: string | null
  dataPublicacao: string | null
  totalEstimado: number
  quantidadeItens: number
}

export default function PCAPage() {
  const [planos, setPlanos] = useState<PCA[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pca')
      .then(res => res.json())
      .then(setPlanos)
      .finally(() => setLoading(false))
  }, [])

  const statusColor: Record<string, string> = {
    RASCUNHO: 'bg-gray-100 text-gray-700',
    CONSOLIDADO: 'bg-blue-100 text-blue-800',
    EM_APROVACAO: 'bg-yellow-100 text-yellow-800',
    APROVADO: 'bg-green-100 text-green-800',
    PUBLICADO: 'bg-purple-100 text-purple-800',
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plano de Contratações Anual</h1>
          <p className="text-sm text-gray-500">Planos consolidados por órgão e ano</p>
        </div>
        <button className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          + Novo PCA
        </button>
      </div>

      <div className="grid gap-4">
        {planos.map(pca => (
          <div key={pca.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">
                  PCA {pca.ano} - v{pca.versao}
                </h3>
                <p className="text-sm text-gray-500">{pca.quantidadeItens} itens</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[pca.status] || ''}`}>
                {pca.status}
              </span>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>Total: <strong className="text-gray-900">{formatCurrency(pca.totalEstimado)}</strong></span>
              {pca.dataAprovacao && <span>Aprovado: {new Date(pca.dataAprovacao).toLocaleDateString()}</span>}
              {pca.dataPublicacao && <span>Publicado: {new Date(pca.dataPublicacao).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
