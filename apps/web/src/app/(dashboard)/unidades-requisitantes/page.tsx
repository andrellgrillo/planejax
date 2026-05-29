'use client'

import { useEffect, useState } from 'react'

interface UG {
  id: string
  nome: string
  sigla: string | null
}

interface UR {
  id: string
  nome: string
  sigla: string | null
  unidadeGestoraId: string
  unidadeGestora: UG
  _count: { dfds: number }
}

export default function UnidadesRequisitantesPage() {
  const [urs, setUrs] = useState<UR[]>([])
  const [ugs, setUgs] = useState<UG[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', sigla: '', unidadeGestoraId: '' })

  async function loadAll() {
    setError('')
    try {
      const [ursRes, ugsRes] = await Promise.all([
        fetch('/api/requisitantes'),
        fetch('/api/unidades'),
      ])
      if (!ursRes.ok) {
        const err = await ursRes.json()
        throw new Error(err.error || 'Erro ao carregar requisitantes')
      }
      if (!ugsRes.ok) {
        const err = await ugsRes.json()
        throw new Error(err.error || 'Erro ao carregar unidades gestoras')
      }
      setUrs(await ursRes.json())
      setUgs(await ugsRes.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro de conexão')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  function resetForm() {
    setForm({ nome: '', sigla: '', unidadeGestoraId: '' })
    setShowForm(false)
    setEditingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editingId ? `/api/requisitantes/${editingId}` : '/api/requisitantes'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Erro ao salvar')
      return
    }
    resetForm()
    loadAll()
  }

  function startEdit(ur: UR) {
    setForm({ nome: ur.nome, sigla: ur.sigla || '', unidadeGestoraId: ur.unidadeGestoraId })
    setEditingId(ur.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta unidade requisitante?')) return
    const res = await fetch(`/api/requisitantes/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      alert(err.error || 'Erro ao excluir')
      return
    }
    loadAll()
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unidades Requisitantes</h1>
          <p className="text-sm text-gray-500">Secretarias e departamentos que solicitam contratações</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
        >
          {showForm ? 'Cancelar' : '+ Nova UR'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-900">{editingId ? 'Editar UR' : 'Nova Unidade Requisitante'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Secretaria (Unidade Gestora)</label>
              <select value={form.unidadeGestoraId} onChange={e => setForm({ ...form, unidadeGestoraId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Selecione...</option>
                {ugs.map(ug => (
                  <option key={ug.id} value={ug.id}>{ug.nome}{ug.sigla ? ` (${ug.sigla})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sigla</label>
              <input value={form.sigla} onChange={e => setForm({ ...form, sigla: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700">
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
            <button type="button" onClick={resetForm} className="text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Sigla</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Secretaria (UG)</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">DFDs</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(!Array.isArray(urs) || urs.length === 0) && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhuma unidade requisitante cadastrada.</td></tr>
            )}
            {Array.isArray(urs) && urs.map(ur => (
              <tr key={ur.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{ur.nome}</td>
                <td className="py-3 px-4 text-gray-500">{ur.sigla || '-'}</td>
                <td className="py-3 px-4 text-gray-500">
                  {ur.unidadeGestora?.nome || '-'}
                  {ur.unidadeGestora?.sigla && <span className="text-gray-400"> ({ur.unidadeGestora.sigla})</span>}
                </td>
                <td className="py-3 px-4 text-center text-gray-500">{ur._count?.dfds ?? 0}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => startEdit(ur)}
                    className="text-blue-700 hover:text-blue-900 font-medium mr-3">Editar</button>
                  <button onClick={() => handleDelete(ur.id)}
                    className="text-red-600 hover:text-red-800 font-medium">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
