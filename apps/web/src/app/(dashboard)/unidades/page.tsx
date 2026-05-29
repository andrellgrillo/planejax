'use client'

import { useEffect, useState } from 'react'

interface Orgao {
  id: string
  nome: string
  sigla: string
  cnpj: string
}

interface UG {
  id: string
  codigoUasg: string | null
  nome: string
  sigla: string | null
  orgaoId: string
  _count: { unidadesRequisitantes: number }
}

interface UR {
  id: string
  nome: string
  sigla: string | null
  unidadeGestoraId: string
  _count?: { dfds: number }
}

export default function UnidadesPage() {
  const [orgaos, setOrgaos] = useState<Orgao[]>([])
  const [ugs, setUgs] = useState<UG[]>([])
  const [ursByUg, setUrsByUg] = useState<Record<string, UR[]>>({})
  const [loading, setLoading] = useState(true)

  const [showFormUg, setShowFormUg] = useState(false)
  const [editingUg, setEditingUg] = useState<string | null>(null)
  const [formUg, setFormUg] = useState({ nome: '', sigla: '', codigoUasg: '', orgaoId: '' })

  const [expandedUg, setExpandedUg] = useState<string | null>(null)
  const [showFormUr, setShowFormUr] = useState(false)
  const [editingUr, setEditingUr] = useState<string | null>(null)
  const [formUr, setFormUr] = useState({ nome: '', sigla: '' })

  async function loadAll() {
    try {
      const [orgRes, ugRes] = await Promise.all([
        fetch('/api/orgaos'),
        fetch('/api/unidades'),
      ])
      setOrgaos(await orgRes.json())
      setUgs(await ugRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  async function loadUrs(ugId: string) {
    const res = await fetch(`/api/unidades/${ugId}/requisitantes`)
    const data = await res.json()
    setUrsByUg(prev => ({ ...prev, [ugId]: data }))
  }

  function toggleUg(ugId: string) {
    if (expandedUg === ugId) {
      setExpandedUg(null)
    } else {
      setExpandedUg(ugId)
      if (!ursByUg[ugId]) loadUrs(ugId)
    }
  }

  function resetFormUg() {
    setFormUg({ nome: '', sigla: '', codigoUasg: '', orgaoId: '' })
    setShowFormUg(false)
    setEditingUg(null)
  }

  async function handleSubmitUg(e: React.FormEvent) {
    e.preventDefault()
    if (editingUg) {
      await fetch(`/api/unidades/${editingUg}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formUg),
      })
    } else {
      await fetch('/api/unidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formUg),
      })
    }
    resetFormUg()
    loadAll()
  }

  function startEditUg(ug: UG) {
    setFormUg({ nome: ug.nome, sigla: ug.sigla || '', codigoUasg: ug.codigoUasg || '', orgaoId: ug.orgaoId })
    setEditingUg(ug.id)
    setShowFormUg(true)
  }

  async function handleDeleteUg(id: string) {
    if (!confirm('Tem certeza?')) return
    await fetch(`/api/unidades/${id}`, { method: 'DELETE' })
    loadAll()
  }

  function resetFormUr() {
    setFormUr({ nome: '', sigla: '' })
    setShowFormUr(false)
    setEditingUr(null)
  }

  async function handleSubmitUr(e: React.FormEvent) {
    e.preventDefault()
    if (!expandedUg) return
    if (editingUr) {
      await fetch(`/api/unidades/${expandedUg}/requisitantes/${editingUr}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formUr),
      })
    } else {
      await fetch(`/api/unidades/${expandedUg}/requisitantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formUr),
      })
    }
    resetFormUr()
    loadUrs(expandedUg)
  }

  function startEditUr(ur: UR) {
    setFormUr({ nome: ur.nome, sigla: ur.sigla || '' })
    setEditingUr(ur.id)
    setShowFormUr(true)
  }

  async function handleDeleteUr(urId: string) {
    if (!confirm('Tem certeza?')) return
    if (!expandedUg) return
    await fetch(`/api/unidades/${expandedUg}/requisitantes/${urId}`, { method: 'DELETE' })
    loadUrs(expandedUg)
  }

  function orgaoNome(orgaoId: string) {
    return orgaos.find(o => o.id === orgaoId)?.nome || orgaoId
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unidades</h1>
          <p className="text-sm text-gray-500">Unidades Gestoras, Secretarias e Unidades Requisitantes</p>
        </div>
        <button
          onClick={() => { resetFormUg(); setShowFormUg(!showFormUg) }}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
        >
          {showFormUg ? 'Cancelar' : '+ Nova Secretaria'}
        </button>
      </div>

      {showFormUg && (
        <form onSubmit={handleSubmitUg} className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-900">{editingUg ? 'Editar Secretaria' : 'Nova Secretaria'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Gestora (Órgão)</label>
              <select value={formUg.orgaoId} onChange={e => setFormUg({ ...formUg, orgaoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Selecione...</option>
                {orgaos.map(o => (
                  <option key={o.id} value={o.id}>{o.nome} ({o.sigla})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Secretaria</label>
              <input value={formUg.nome} onChange={e => setFormUg({ ...formUg, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sigla</label>
              <input value={formUg.sigla} onChange={e => setFormUg({ ...formUg, sigla: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código UASG</label>
              <input value={formUg.codigoUasg} onChange={e => setFormUg({ ...formUg, codigoUasg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700">
              {editingUg ? 'Atualizar' : 'Salvar'}
            </button>
            <button type="button" onClick={resetFormUg} className="text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {ugs.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhuma secretaria cadastrada.</p>
        )}
        {ugs.map(ug => (
          <div key={ug.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button onClick={() => toggleUg(ug.id)} className="w-full text-left p-6 hover:bg-gray-50 transition-colors rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{ug.nome}</h3>
                  <p className="text-sm text-gray-500">
                    {ug.sigla && `${ug.sigla} • `}
                    UG: {orgaoNome(ug.orgaoId)}
                    {ug.codigoUasg && ` • UASG: ${ug.codigoUasg}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">{ug._count.unidadesRequisitantes} UR(s)</span>
                  <span className={`transform transition-transform ${expandedUg === ug.id ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={(e) => { e.stopPropagation(); startEditUg(ug) }}
                  className="text-blue-700 text-sm hover:text-blue-900 font-medium">Editar</button>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteUg(ug.id) }}
                  className="text-red-600 text-sm hover:text-red-800 font-medium">Excluir</button>
              </div>
            </button>

            {expandedUg === ug.id && (
              <div className="border-t border-gray-100 p-6 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">Unidades Requisitantes</h4>
                  <button onClick={() => { resetFormUr(); setShowFormUr(true) }}
                    className="text-blue-700 text-sm font-medium hover:text-blue-900">
                    + Adicionar
                  </button>
                </div>

                {showFormUr && (
                  <form onSubmit={handleSubmitUr} className="bg-gray-50 rounded-lg p-4 space-y-3 border">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                        <input value={formUr.nome} onChange={e => setFormUr({ ...formUr, nome: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sigla</label>
                        <input value={formUr.sigla} onChange={e => setFormUr({ ...formUr, sigla: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-green-700">
                        {editingUr ? 'Atualizar' : 'Adicionar'}
                      </button>
                      <button type="button" onClick={resetFormUr} className="text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-200">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {(!ursByUg[ug.id] || ursByUg[ug.id].length === 0) && (
                  <p className="text-sm text-gray-400">Nenhuma unidade requisitante.</p>
                )}
                {ursByUg[ug.id]?.map(ur => (
                  <div key={ur.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{ur.nome}</span>
                      {ur.sigla && <span className="text-sm text-gray-500 ml-2">({ur.sigla})</span>}
                      {ur._count && <span className="text-xs text-gray-400 ml-2">{ur._count.dfds} DFD(s)</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditUr(ur)}
                        className="text-blue-700 text-xs hover:text-blue-900">Editar</button>
                      <button onClick={() => handleDeleteUr(ur.id)}
                        className="text-red-600 text-xs hover:text-red-800">Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
