'use client'

import { useEffect, useState } from 'react'

interface Orgao {
  id: string
  nome: string
  sigla: string
}

interface UG {
  id: string
  codigoUasg: string | null
  nome: string
  sigla: string | null
  orgaoId: string
  orgao: Orgao
  _count: { unidadesRequisitantes: number }
}

export default function UnidadesGestorasPage() {
  const [ugs, setUgs] = useState<UG[]>([])
  const [orgaos, setOrgaos] = useState<Orgao[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', sigla: '', codigoUasg: '', orgaoId: '' })

  async function loadAll() {
    try {
      const [ugsRes, orgaosRes] = await Promise.all([
        fetch('/api/unidades'),
        fetch('/api/orgaos'),
      ])
      setUgs(await ugsRes.json())
      setOrgaos(await orgaosRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  function resetForm() {
    setForm({ nome: '', sigla: '', codigoUasg: '', orgaoId: '' })
    setShowForm(false)
    setEditingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      await fetch(`/api/unidades/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/unidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    resetForm()
    loadAll()
  }

  function startEdit(ug: UG) {
    setForm({ nome: ug.nome, sigla: ug.sigla || '', codigoUasg: ug.codigoUasg || '', orgaoId: ug.orgaoId })
    setEditingId(ug.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta unidade gestora?')) return
    await fetch(`/api/unidades/${id}`, { method: 'DELETE' })
    loadAll()
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unidades Gestoras</h1>
          <p className="text-sm text-gray-500">Secretarias com código UASG vinculadas a um órgão</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
        >
          {showForm ? 'Cancelar' : '+ Nova UG'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-900">{editingId ? 'Editar UG' : 'Nova Unidade Gestora'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Órgão (Unidade Gestora)</label>
              <select value={form.orgaoId} onChange={e => setForm({ ...form, orgaoId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Selecione...</option>
                {orgaos.map(o => (
                  <option key={o.id} value={o.id}>{o.nome} ({o.sigla})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Secretaria</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sigla</label>
              <input value={form.sigla} onChange={e => setForm({ ...form, sigla: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código UASG</label>
              <input value={form.codigoUasg} onChange={e => setForm({ ...form, codigoUasg: e.target.value })}
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
              <th className="text-left py-3 px-4 font-medium text-gray-600">Órgão</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">UASG</th>
              <th className="text-center py-3 px-4 font-medium text-gray-600">URs</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ugs.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Nenhuma unidade gestora cadastrada.</td></tr>
            )}
            {ugs.map(ug => (
              <tr key={ug.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{ug.nome}</td>
                <td className="py-3 px-4 text-gray-500">{ug.sigla || '-'}</td>
                <td className="py-3 px-4 text-gray-500">
                  {ug.orgao?.nome || '-'}
                  {ug.orgao?.sigla && <span className="text-gray-400"> ({ug.orgao.sigla})</span>}
                </td>
                <td className="py-3 px-4 text-gray-500 font-mono">{ug.codigoUasg || '-'}</td>
                <td className="py-3 px-4 text-center text-gray-500">{ug._count?.unidadesRequisitantes || 0}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => startEdit(ug)}
                    className="text-blue-700 hover:text-blue-900 font-medium mr-3">Editar</button>
                  <button onClick={() => handleDelete(ug.id)}
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
