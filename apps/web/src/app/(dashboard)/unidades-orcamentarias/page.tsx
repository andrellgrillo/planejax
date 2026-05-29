'use client'

import { useEffect, useState } from 'react'

interface UG {
  id: string
  nome: string
  sigla: string
}

interface UO {
  id: string
  codigo: string | null
  nome: string
  orgaoId: string
  orgao: UG
}

export default function UnidadesOrcamentariasPage() {
  const [uos, setUos] = useState<UO[]>([])
  const [ugs, setUgs] = useState<UG[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ codigo: '', nome: '', orgaoId: '' })

  async function loadAll() {
    setError('')
    try {
      const [uosRes, ugsRes] = await Promise.all([
        fetch('/api/unidades-orcamentarias'),
        fetch('/api/orgaos'),
      ])
      if (!uosRes.ok) { const e = await uosRes.json(); throw new Error(e.error || 'Erro UOs') }
      if (!ugsRes.ok) { const e = await ugsRes.json(); throw new Error(e.error || 'Erro UGs') }
      setUos(await uosRes.json())
      setUgs(await ugsRes.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  function resetForm() {
    setForm({ codigo: '', nome: '', orgaoId: '' })
    setShowForm(false)
    setEditingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editingId ? `/api/unidades-orcamentarias/${editingId}` : '/api/unidades-orcamentarias'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { const err = await res.json(); alert(err.error || 'Erro'); return }
    resetForm()
    loadAll()
  }

  function startEdit(uo: UO) {
    setForm({ codigo: uo.codigo || '', nome: uo.nome, orgaoId: uo.orgaoId })
    setEditingId(uo.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza?')) return
    const res = await fetch(`/api/unidades-orcamentarias/${id}`, { method: 'DELETE' })
    if (!res.ok) { const err = await res.json(); alert(err.error || 'Erro'); return }
    loadAll()
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unidades Orçamentárias</h1>
          <p className="text-sm text-gray-500">Unidades com dotação orçamentária vinculadas à Unidade Gestora</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          {showForm ? 'Cancelar' : '+ Nova UO'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-900">{editingId ? 'Editar UO' : 'Nova Unidade Orçamentária'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Gestora</label>
              <select value={form.orgaoId} onChange={e => setForm({ ...form, orgaoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Selecione...</option>
                {ugs.map(ug => (
                  <option key={ug.id} value={ug.id}>{ug.nome} ({ug.sigla})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código (opcional)</label>
              <input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700">
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
            <button type="button" onClick={resetForm} className="text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">Cancelar</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Código</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Unidade Gestora</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(!Array.isArray(uos) || uos.length === 0) && (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhuma unidade orçamentária cadastrada.</td></tr>
            )}
            {Array.isArray(uos) && uos.map(uo => (
              <tr key={uo.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{uo.nome}</td>
                <td className="py-3 px-4 text-gray-500 font-mono">{uo.codigo || '-'}</td>
                <td className="py-3 px-4 text-gray-500">
                  {uo.orgao?.nome || '-'}
                  {uo.orgao?.sigla && <span className="text-gray-400"> ({uo.orgao.sigla})</span>}
                </td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => startEdit(uo)} className="text-blue-700 hover:text-blue-900 font-medium mr-3">Editar</button>
                  <button onClick={() => handleDelete(uo.id)} className="text-red-600 hover:text-red-800 font-medium">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
