'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/unidades-gestoras', label: 'U. Gestoras', icon: '🏛' },
  { href: '/unidades-requisitantes', label: 'U. Requisitantes', icon: '🏢' },
  { href: '/dfd', label: 'DFDs', icon: '📋' },
  { href: '/pca', label: 'PCA', icon: '📊' },
  { href: '/relatorios', label: 'Relatórios', icon: '📈' },
  { href: '/pncp', label: 'PNCP', icon: '🔗' },
  { href: '/config', label: 'Configurações', icon: '⚙' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <Link href="/unidades" className="text-2xl font-bold">PlanejaX</Link>
          <p className="text-blue-300 text-xs mt-1">PCA - PNCP</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-blue-800 text-white'
                    : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <Link href="/login" className="text-blue-300 text-sm hover:text-white transition-colors">
            Sair
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
