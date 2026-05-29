'use client'

export default function ConfigPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500">Categorias, naturezas e parâmetros do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Categorias de Itens</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex justify-between px-3 py-2 bg-gray-50 rounded">
              <span>Material de Consumo</span>
              <span className="text-gray-400">MATERIAL_CONSUMO</span>
            </li>
            <li className="flex justify-between px-3 py-2 bg-gray-50 rounded">
              <span>Material Permanente</span>
              <span className="text-gray-400">MATERIAL_PERMANENTE</span>
            </li>
            <li className="flex justify-between px-3 py-2 bg-gray-50 rounded">
              <span>Serviço</span>
              <span className="text-gray-400">SERVICO</span>
            </li>
            <li className="flex justify-between px-3 py-2 bg-gray-50 rounded">
              <span>Serviço de Engenharia</span>
              <span className="text-gray-400">SERVICO_ENGENHARIA</span>
            </li>
            <li className="flex justify-between px-3 py-2 bg-gray-50 rounded">
              <span>Obra</span>
              <span className="text-gray-400">OBRA</span>
            </li>
            <li className="flex justify-between px-3 py-2 bg-gray-50 rounded">
              <span>Solução de TI</span>
              <span className="text-gray-400">SOLUCAO_TI</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Naturezas dos Itens</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex justify-between px-3 py-2 bg-gray-50 rounded">
              <span>Continuado</span>
              <span className="text-gray-400">CONTINUADO</span>
            </li>
            <li className="flex justify-between px-3 py-2 bg-gray-50 rounded">
              <span>Não Continuado</span>
              <span className="text-gray-400">NAO_CONTINUADO</span>
            </li>
            <li className="flex justify-between px-3 py-2 bg-gray-50 rounded">
              <span>Continuado por Demanda</span>
              <span className="text-gray-400">CONTINUADO_POR_DEMANDA</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
