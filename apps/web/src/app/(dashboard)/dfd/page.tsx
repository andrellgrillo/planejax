'use client'

import { useEffect, useState } from 'react'

interface DFD {
  id: string
  numero: number
  ano: number
  descricao: string
  status: string
  unidadeRequisitante: {
    nome: string
    unidadeGestora: { nome: string }
  }
  _count: { itens: number }
}

export default function DFDPage() {
  const [dfds, setDfds] = useState<DFD[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dfd')
      .then(res => res.json())
      .then(setDfds)
      .finally(() => setLoading(false))
  }, [])

  const statusColor: Record<string, string> = {
    RASCUNHO: 'bg-gray-100 text-gray-700',
    EM_ANALISE: 'bg-yellow-100 text-yellow-800',
    APROVADO: 'bg-green-100 text-green-800',
    REJEITADO: 'bg-red-100 text-red-800',
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos de Formalização de Demanda</h1>
          <p className="text-sm text-gray-500">Demandas de contratação das unidades requisitantes</p>
        </div>
        <button className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          + Novo DFD
        </button>
      </div>

      <div className="grid gap-4">
        {dfds.map(dfd => (
          <div key={dfd.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{dfd.descricao}</h3>
                <p className="text-sm text-gray-500">
                  DFD {dfd.numero}/{dfd.ano} • {dfd.unidadeRequisitante.nome}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[dfd.status] || ''}`}>
                {dfd.status}
              </span>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>{dfd.unidadeRequisitante.unidadeGestora.nome}</span>
              <span>{dfd._count.itens} item(ns)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
