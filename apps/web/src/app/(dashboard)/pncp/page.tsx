'use client'

import { useEffect, useState } from 'react'

interface PCA {
  id: string
  ano: number
  versao: number
  status: string
  totalEstimado: number
  quantidadeItens: number
  dataPublicacao: string | null
}

export default function PNCPPage() {
  const [planos, setPlanos] = useState<PCA[]>([])
  const [loading, setLoading] = useState(true)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  async function loadPlanos() {
    try {
      const res = await fetch('/api/pca?status=APROVADO')
      const data = await res.json()
      setPlanos(data)
    } catch (e) {
      console.error('Erro ao carregar PCA aprovados', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPlanos() }, [])

  async function handlePublicar(pcaId: string) {
    setPublishingId(pcaId)
    setMessage('')
    try {
      const res = await fetch(`/api/pncp/publicar/${pcaId}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(`✅ PCA publicado no PNCP! Sequencial: ${data.sequencial}`)
        loadPlanos()
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (e: any) {
      setMessage(`❌ ${e.message}`)
    } finally {
      setPublishingId(null)
    }
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integração PNCP</h1>
        <p className="text-sm text-gray-500">
          Publique e consulte Planos de Contratação no Portal Nacional de Contratações Públicas
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Status da Conexão</h2>
        <p className="text-sm text-gray-500">
          Ambiente: <strong>Homologação</strong> (treina.pncp.gov.br)
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Configure as credenciais <code>PNCP_LOGIN</code> e <code>PNCP_SENHA</code> no <code>.env</code>
        </p>
      </div>

      {message && (
        <div className={`bg-white rounded-xl p-4 shadow-sm border mb-6 ${
          message.startsWith('✅') ? 'border-green-200' : 'border-red-200'
        }`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

      <h2 className="font-semibold text-gray-900 mb-4">PCAs Aprovados para Publicação</h2>

      {planos.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center text-gray-400">
          Nenhum PCA aprovado encontrado. Aprove um PCA primeiro.
        </div>
      ) : (
        <div className="grid gap-4">
          {planos.map(pca => (
            <div key={pca.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    PCA {pca.ano} - v{pca.versao}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {pca.quantidadeItens} itens • {formatCurrency(pca.totalEstimado)}
                  </p>
                </div>
                <button
                  onClick={() => handlePublicar(pca.id)}
                  disabled={publishingId === pca.id}
                  className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
                >
                  {publishingId === pca.id ? 'Publicando...' : 'Publicar no PNCP'}
                </button>
              </div>
              {pca.dataPublicacao && (
                <p className="text-xs text-green-600 mt-2">
                  Publicado em: {new Date(pca.dataPublicacao).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
