'use client'

import { useEffect, useState } from 'react'

interface Orgao {
  id: string
  cnpj: string
  nome: string
  sigla: string
  esfera: string
  poder: string
  status: string
  _count: { unidades: number; pcas: number }
}

interface OrgaoForm {
  cnpj: string
  nome: string
  sigla: string
  esfera: string
  poder: string
}

const initialForm: OrgaoForm = { cnpj: '', nome: '', sigla: '', esfera: 'FEDERAL', poder: 'EXECUTIVO' }

export default function OrgaosPage() {
  const [orgaos, setOrgaos] = useState<Orgao[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<OrgaoForm>(initialForm)

  async function loadOrgaos() {
    try {
      const res = await fetch('/api/orgaos')
      const data = await res.json()
      setOrgaos(data)
    } catch (e) {
      console.error('Erro ao carregar órgãos', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrgaos() }, [])

  function resetForm() {
    setForm(initialForm)
    setShowForm(false)
    setEditingId(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      await fetch(`/api/orgaos/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/orgaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    resetForm()
    loadOrgaos()
  }

  function startEdit(orgao: Orgao) {
    setForm({ cnpj: orgao.cnpj, nome: orgao.nome, sigla: orgao.sigla, esfera: orgao.esfera, poder: orgao.poder })
    setEditingId(orgao.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este órgão?')) return
    await fetch(`/api/orgaos/${id}`, { method: 'DELETE' })
    loadOrgaos()
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Órgãos</h1>
          <p className="text-sm text-gray-500">Gerencie os órgãos da administração pública</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
        >
          {showForm ? 'Cancelar' : '+ Novo Órgão'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-900">{editingId ? 'Editar Órgão' : 'Novo Órgão'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sigla</label>
              <input value={form.sigla} onChange={e => setForm({ ...form, sigla: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Esfera</label>
              <select value={form.esfera} onChange={e => setForm({ ...form, esfera: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="FEDERAL">Federal</option>
                <option value="ESTADUAL">Estadual</option>
                <option value="MUNICIPAL">Municipal</option>
                <option value="DISTRITAL">Distrital</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poder</label>
              <select value={form.poder} onChange={e => setForm({ ...form, poder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="EXECUTIVO">Executivo</option>
                <option value="LEGISLATIVO">Legislativo</option>
                <option value="JUDICIARIO">Judiciário</option>
              </select>
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

      <div className="grid gap-4">
        {orgaos.map(orgao => (
          <div key={orgao.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{orgao.nome}</h3>
                <p className="text-sm text-gray-500">{orgao.sigla} • {orgao.cnpj}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                orgao.status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {orgao.status}
              </span>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              <span>{orgao.esfera}</span>
              <span>{orgao.poder}</span>
              <span>{orgao._count.unidades} unidade(s)</span>
              <span>{orgao._count.pcas} PCA(s)</span>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => startEdit(orgao)}
                className="text-blue-700 text-sm hover:text-blue-900 font-medium">
                Editar
              </button>
              <button onClick={() => handleDelete(orgao.id)}
                className="text-red-600 text-sm hover:text-red-800 font-medium">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
