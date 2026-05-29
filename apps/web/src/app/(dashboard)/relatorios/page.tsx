'use client'

export default function RelatoriosPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-sm text-gray-500">Exportação e visualização de dados do PCA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-900">Resumo do PCA</h3>
          <p className="text-sm text-gray-500 mt-1">Visão consolidada por categoria e natureza</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="font-semibold text-gray-900">Calendário de Contratações</h3>
          <p className="text-sm text-gray-500 mt-1">Cronograma mensal por prioridade</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-3xl mb-2">📈</div>
          <h3 className="font-semibold text-gray-900">Estatísticas</h3>
          <p className="text-sm text-gray-500 mt-1">Métricas e indicadores do planejamento</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Exportar Dados</h2>
        <div className="flex gap-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
            Exportar CSV
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  )
}
