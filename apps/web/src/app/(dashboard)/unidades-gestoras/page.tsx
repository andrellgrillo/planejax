'use client'

import { useEffect, useState } from 'react'

interface UG {
  id: string
  cnpj: string
  nome: string
  sigla: string
  esfera: string
  poder: string
  status: string
  _count: { unidades: number; pcas: number }
}

interface Secretaria {
  id: string
  codigoUasg: string | null
  nome: string
  sigla: string | null
  _count: { unidadesRequisitantes: number }
}

interface UGForm {
  cnpj: string
  nome: string
  sigla: string
  esfera: string
  poder: string
}

const initialForm: UGForm = { cnpj: '', nome: '', sigla: '', esfera: 'FEDERAL', poder: 'EXECUTIVO' }

export default function UnidadesGestorasPage() {
  const [ugs, setUgs] = useState<UG[]>([])
  const [secretarias, setSecretarias] = useState<Secretaria[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<UGForm>(initialForm)
  const [expandedUg, setExpandedUg] = useState<string | null>(null)
  const [showSecForm, setShowSecForm] = useState(false)
  const [editingSec, setEditingSec] = useState<string | null>(null)
  const [secForm, setSecForm] = useState({ nome: '', sigla: '', codigoUasg: '' })

  async function loadAll() {
    try {
      const res = await fetch('/api/orgaos')
      setUgs(await res.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  async function loadSecretarias(ugId: string) {
    const res = await fetch(`/api/unidades?orgaoId=${ugId}`)
    const data = await res.json()
    setSecretarias(data)
  }

  function toggleUg(ugId: string) {
    if (expandedUg === ugId) {
      setExpandedUg(null)
    } else {
      setExpandedUg(ugId)
      loadSecretarias(ugId)
    }
  }

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
    loadAll()
  }

  function startEdit(ug: UG) {
    setForm({ cnpj: ug.cnpj, nome: ug.nome, sigla: ug.sigla, esfera: ug.esfera, poder: ug.poder })
    setEditingId(ug.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta unidade gestora?')) return
    await fetch(`/api/orgaos/${id}`, { method: 'DELETE' })
    loadAll()
  }

  function resetSecForm() {
    setSecForm({ nome: '', sigla: '', codigoUasg: '' })
    setShowSecForm(false)
    setEditingSec(null)
  }

  async function handleSubmitSec(e: React.FormEvent) {
    e.preventDefault()
    if (!expandedUg) return
    if (editingSec) {
      await fetch(`/api/unidades/${editingSec}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(secForm),
      })
    } else {
      await fetch('/api/unidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...secForm, orgaoId: expandedUg }),
      })
    }
    resetSecForm()
    loadSecretarias(expandedUg)
  }

  function startEditSec(sec: Secretaria) {
    setSecForm({ nome: sec.nome, sigla: sec.sigla || '', codigoUasg: sec.codigoUasg || '' })
    setEditingSec(sec.id)
    setShowSecForm(true)
  }

  async function handleDeleteSec(id: string) {
    if (!confirm('Tem certeza?')) return
    await fetch(`/api/unidades/${id}`, { method: 'DELETE' })
    if (expandedUg) loadSecretarias(expandedUg)
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unidades Gestoras</h1>
          <p className="text-sm text-gray-500">Órgãos da administração pública com suas secretarias</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Unidade Gestora</label>
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
        {ugs.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhuma unidade gestora cadastrada.</p>
        )}
        {ugs.map(ug => (
          <div key={ug.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button onClick={() => toggleUg(ug.id)} className="w-full text-left p-6 hover:bg-gray-50 transition-colors rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{ug.nome}</h3>
                  <p className="text-sm text-gray-500">{ug.sigla} • {ug.cnpj} • {ug.esfera} / {ug.poder}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ug.status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>{ug.status}</span>
                  <span className="text-sm text-gray-400">{ug._count.unidades} secretaria(s)</span>
                  <span className={`transform transition-transform ${expandedUg === ug.id ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={(e) => { e.stopPropagation(); startEdit(ug) }}
                  className="text-blue-700 text-sm hover:text-blue-900 font-medium">Editar</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(ug.id) }}
                  className="text-red-600 text-sm hover:text-red-800 font-medium">Excluir</button>
              </div>
            </button>

            {expandedUg === ug.id && (
              <div className="border-t border-gray-100 p-6 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">Secretarias</h4>
                  <button onClick={() => { resetSecForm(); setShowSecForm(true) }}
                    className="text-blue-700 text-sm font-medium hover:text-blue-900">
                    + Adicionar Secretaria
                  </button>
                </div>

                {showSecForm && (
                  <form onSubmit={handleSubmitSec} className="bg-gray-50 rounded-lg p-4 space-y-3 border">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                        <input value={secForm.nome} onChange={e => setSecForm({ ...secForm, nome: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sigla</label>
                        <input value={secForm.sigla} onChange={e => setSecForm({ ...secForm, sigla: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Código UASG</label>
                        <input value={secForm.codigoUasg} onChange={e => setSecForm({ ...secForm, codigoUasg: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-green-700">
                        {editingSec ? 'Atualizar' : 'Adicionar'}
                      </button>
                      <button type="button" onClick={resetSecForm} className="text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-200">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {secretarias.length === 0 && (
                  <p className="text-sm text-gray-400">Nenhuma secretaria vinculada.</p>
                )}
                {secretarias.map(sec => (
                  <div key={sec.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-800">{sec.nome}</span>
                      {sec.sigla && <span className="text-sm text-gray-500 ml-2">({sec.sigla})</span>}
                      {sec.codigoUasg && <span className="text-xs text-gray-400 ml-2">UASG: {sec.codigoUasg}</span>}
                      <span className="text-xs text-gray-400 ml-2">{sec._count.unidadesRequisitantes} UR(s)</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditSec(sec)}
                        className="text-blue-700 text-xs hover:text-blue-900">Editar</button>
                      <button onClick={() => handleDeleteSec(sec.id)}
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
