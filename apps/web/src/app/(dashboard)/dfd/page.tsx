'use client'

import { useEffect, useState } from 'react'

interface UR {
  id: string
  nome: string
  sigla: string | null
  unidadeGestora: { nome: string; sigla: string | null }
}

interface DFD {
  id: string
  numero: number
  ano: number
  descricao: string
  justificativa: string | null
  status: string
  unidadeRequisitanteId: string
  unidadeRequisitante: UR
  itens: Item[]
  _count: { itens: number }
}

interface Item {
  id?: string
  descricao: string
  quantidade: number
  unidadeMedida: string
  valorUnitarioEstimado: number
  valorTotalEstimado: number
  categoria: string
  natureza: string
  mesPrevisto: number | null
  prioridade: string
}

const emptyItem: Item = {
  descricao: '', quantidade: 1, unidadeMedida: 'UN',
  valorUnitarioEstimado: 0, valorTotalEstimado: 0,
  categoria: 'MATERIAL_CONSUMO', natureza: 'NAO_CONTINUADO',
  mesPrevisto: null, prioridade: 'MEDIA',
}

const statusColor: Record<string, string> = {
  RASCUNHO: 'bg-gray-100 text-gray-700',
  EM_ANALISE: 'bg-yellow-100 text-yellow-800',
  APROVADO: 'bg-green-100 text-green-800',
  REJEITADO: 'bg-red-100 text-red-800',
}

export default function DFDPage() {
  const [dfds, setDfds] = useState<DFD[]>([])
  const [urs, setUrs] = useState<UR[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    descricao: '', justificativa: '', unidadeRequisitanteId: '',
  })
  const [itens, setItens] = useState<Item[]>([])

  async function loadAll() {
    try {
      const [dfdRes, urRes] = await Promise.all([
        fetch('/api/dfd'),
        fetch('/api/requisitantes'),
      ])
      if (!dfdRes.ok) throw new Error('Erro ao carregar DFDs')
      if (!urRes.ok) throw new Error('Erro ao carregar URs')
      setDfds(await dfdRes.json())
      setUrs(await urRes.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  function resetForm() {
    setForm({ descricao: '', justificativa: '', unidadeRequisitanteId: '' })
    setItens([])
    setShowForm(false)
    setEditingId(null)
    setError('')
  }

  function startEdit(dfd: DFD) {
    setForm({ descricao: dfd.descricao, justificativa: dfd.justificativa || '', unidadeRequisitanteId: dfd.unidadeRequisitanteId })
    setItens(dfd.itens.map(i => ({ ...i, quantidade: Number(i.quantidade), valorUnitarioEstimado: Number(i.valorUnitarioEstimado), valorTotalEstimado: Number(i.valorTotalEstimado) })))
    setEditingId(dfd.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const body = { ...form, itens }
    const url = editingId ? `/api/dfd/${editingId}` : '/api/dfd'
    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) { const err = await res.json(); setError(err.error || 'Erro ao salvar'); return }
    resetForm()
    loadAll()
  }

  async function handleDelete(dfd: DFD) {
    if (!confirm(`Excluir DFD ${dfd.numero}/${dfd.ano}?`)) return
    const res = await fetch(`/api/dfd/${dfd.id}`, { method: 'DELETE' })
    if (!res.ok) { const err = await res.json(); alert(err.error || 'Erro ao excluir'); return }
    loadAll()
  }

  async function handleStatus(dfdId: string, action: 'aprovar' | 'rejeitar') {
    if (action === 'rejeitar') {
      const motivo = prompt('Motivo da rejeição:')
      if (!motivo) return
      const res = await fetch(`/api/dfd/${dfdId}/rejeitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo }),
      })
      if (!res.ok) { const err = await res.json(); alert(err.error || 'Erro'); return }
    } else {
      const res = await fetch(`/api/dfd/${dfdId}/aprovar`, { method: 'POST' })
      if (!res.ok) { const err = await res.json(); alert(err.error || 'Erro'); return }
    }
    loadAll()
  }

  function addItem() {
    setItens([...itens, { ...emptyItem }])
  }

  function updateItem(i: number, field: string, value: any) {
    const updated = [...itens]
    updated[i] = { ...updated[i], [field]: value }
    if (field === 'quantidade' || field === 'valorUnitarioEstimado') {
      updated[i].valorTotalEstimado = (field === 'quantidade' ? value : updated[i].quantidade) * (field === 'valorUnitarioEstimado' ? value : updated[i].valorUnitarioEstimado)
    }
    setItens(updated)
  }

  function removeItem(i: number) {
    setItens(itens.filter((_, idx) => idx !== i))
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos de Formalização de Demanda</h1>
          <p className="text-sm text-gray-500">Demandas de contratação das unidades requisitantes</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          {showForm ? 'Cancelar' : '+ Novo DFD'}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 text-sm">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-900 text-lg">{editingId ? 'Editar DFD' : 'Novo DFD'}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade Requisitante</label>
              <select value={form.unidadeRequisitanteId} onChange={e => setForm({ ...form, unidadeRequisitanteId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">Selecione...</option>
                {urs.map(ur => (
                  <option key={ur.id} value={ur.id}>{ur.nome}{ur.sigla ? ` (${ur.sigla})` : ''} — {ur.unidadeGestora.nome}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa</label>
              <textarea value={form.justificativa} onChange={e => setForm({ ...form, justificativa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Itens</h3>
              <button type="button" onClick={addItem}
                className="text-blue-700 text-sm font-medium hover:text-blue-900">+ Adicionar Item</button>
            </div>
            {itens.length === 0 && <p className="text-sm text-gray-400">Nenhum item adicionado.</p>}
            {itens.map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 mb-3 border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Item {i + 1}</span>
                  <button type="button" onClick={() => removeItem(i)} className="text-red-500 text-xs hover:text-red-700">Remover</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-600 mb-1">Descrição</label>
                    <input value={item.descricao} onChange={e => updateItem(i, 'descricao', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Qtd</label>
                    <input type="number" step="0.01" value={item.quantidade} onChange={e => updateItem(i, 'quantidade', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Unid.</label>
                    <select value={item.unidadeMedida} onChange={e => updateItem(i, 'unidadeMedida', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="UN">Unidade</option>
                      <option value="KG">Quilograma</option>
                      <option value="L">Litro</option>
                      <option value="M">Metro</option>
                      <option value="M2">Metro²</option>
                      <option value="M3">Metro³</option>
                      <option value="CX">Caixa</option>
                      <option value="PC">Peça</option>
                      <option value="SERV">Serviço</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Valor Unit. (R$)</label>
                    <input type="number" step="0.01" value={item.valorUnitarioEstimado} onChange={e => updateItem(i, 'valorUnitarioEstimado', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Valor Total (R$)</label>
                    <input type="number" step="0.01" value={item.valorTotalEstimado} readOnly
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Mês Prev.</label>
                    <select value={item.mesPrevisto || ''} onChange={e => updateItem(i, 'mesPrevisto', e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">---</option>
                      {Array.from({ length: 12 }, (_, m) => (
                        <option key={m + 1} value={m + 1}>{String(m + 1).padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Prioridade</label>
                    <select value={item.prioridade} onChange={e => updateItem(i, 'prioridade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="BAIXA">Baixa</option>
                      <option value="MEDIA">Média</option>
                      <option value="ALTA">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Categoria</label>
                    <select value={item.categoria} onChange={e => updateItem(i, 'categoria', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="MATERIAL_CONSUMO">Material Consumo</option>
                      <option value="MATERIAL_PERMANENTE">Material Permanente</option>
                      <option value="SERVICO">Serviço</option>
                      <option value="SERVICO_ENGENHARIA">Serviço Engenharia</option>
                      <option value="OBRA">Obra</option>
                      <option value="SOLUCAO_TI">Solução TI</option>
                      <option value="LOCACAO_IMOVEL">Locação Imóvel</option>
                      <option value="CAPACITACAO">Capacitação</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Natureza</label>
                    <select value={item.natureza} onChange={e => updateItem(i, 'natureza', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="CONTINUADO">Continuado</option>
                      <option value="NAO_CONTINUADO">Não Continuado</option>
                      <option value="CONTINUADO_POR_DEMANDA">Continuado por Demanda</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-700">
              {editingId ? 'Atualizar DFD' : 'Criar DFD'}
            </button>
            <button type="button" onClick={resetForm} className="text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {dfds.map(dfd => (
          <div key={dfd.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{dfd.descricao}</h3>
                <p className="text-sm text-gray-500">
                  DFD {dfd.numero}/{dfd.ano} • {dfd.unidadeRequisitante.nome}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${statusColor[dfd.status] || ''}`}>
                {dfd.status}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{dfd.unidadeRequisitante.unidadeGestora.nome}</span>
              <span>{dfd._count.itens} item(ns)</span>
            </div>

            <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
              <button onClick={() => startEdit(dfd)}
                className="text-blue-700 text-sm hover:text-blue-900 font-medium">Editar</button>
              <button onClick={() => handleDelete(dfd)}
                className="text-red-600 text-sm hover:text-red-800 font-medium">Excluir</button>
              {dfd.status === 'RASCUNHO' && (
                <>
                  <button onClick={() => handleStatus(dfd.id, 'aprovar')}
                    className="text-green-700 text-sm hover:text-green-900 font-medium">Aprovar</button>
                  <button onClick={() => handleStatus(dfd.id, 'rejeitar')}
                    className="text-yellow-700 text-sm hover:text-yellow-900 font-medium">Rejeitar</button>
                </>
              )}
            </div>
          </div>
        ))}
        {dfds.length === 0 && <p className="text-gray-400 text-center py-8">Nenhum DFD cadastrado.</p>}
      </div>
    </div>
  )
}
