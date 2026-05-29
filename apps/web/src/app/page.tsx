'use client'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex flex-col">
      <header className="p-6">
        <h1 className="text-2xl font-bold text-white">PlanejaX</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <div className="text-6xl mb-6">📋</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Planejamento e Contratações Públicas
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Sistema para elaboração, gestão e publicação do
            <strong className="text-white"> Plano de Contratações Anual (PCA) </strong>
            conforme a Lei 14.133/2021 e Decreto 10.947/2022, com integração ao
            <strong className="text-white"> PNCP</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="font-semibold mb-2">Documento de Formalização de Demanda</h3>
              <p className="text-sm text-blue-200">
                Unidades requisitantes criam DFDs com itens necessários para o exercício seguinte.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Plano de Contratações Anual</h3>
              <p className="text-sm text-blue-200">
                Consolidação das demandas em um PCA com calendário, prioridades e aprovação.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="font-semibold mb-2">Integração PNCP</h3>
              <p className="text-sm text-blue-200">
                Publicação automática no Portal Nacional de Contratações Públicas via API.
              </p>
            </div>
          </div>

          <a
            href="/login"
            className="inline-block bg-white text-blue-900 font-semibold px-8 py-3.5 rounded-xl text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Acessar o Sistema
          </a>

          <p className="text-blue-300 text-sm mt-4">
            Ambiente de homologação • Lei 14.133/2021
          </p>
        </div>
      </main>

      <footer className="p-6 text-center text-blue-400 text-sm">
        PlanejaX — Sistema de Planejamento de Contratações Públicas
      </footer>
    </div>
  )
}
