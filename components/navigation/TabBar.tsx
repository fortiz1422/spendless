'use client'

import { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Home, BarChart2, Settings } from 'lucide-react'

function TabBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const month = searchParams.get('month')
  const monthSuffix = month ? `?month=${month}` : ''

  const tabs = [
    {
      href: `/${monthSuffix}`,
      icon: Home,
      label: 'Home',
      isActive: pathname === '/' || pathname.startsWith('/expenses'),
    },
    {
      href: `/analytics${monthSuffix}`,
      icon: BarChart2,
      label: 'Análisis',
      isActive: pathname.startsWith('/analytics'),
    },
    {
      href: '/settings',
      icon: Settings,
      label: 'Config',
      isActive: pathname.startsWith('/settings'),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-bg-secondary">
      <div className="mx-auto flex max-w-md items-center justify-around pb-safe pt-2">
        {tabs.map(({ href, icon: Icon, label, isActive }) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center gap-1 px-6 py-1 transition-colors ${
              isActive ? 'text-primary' : 'text-text-tertiary'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export function TabBar() {
  return (
    <Suspense
      fallback={
        <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-border-subtle bg-bg-secondary" />
      }
    >
      <TabBarInner />
    </Suspense>
  )
}
