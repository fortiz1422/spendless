'use client'

import { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { House, ChartBar, Gear } from '@phosphor-icons/react'

function TabBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const month = searchParams.get('month')
  const monthSuffix = month ? `?month=${month}` : ''

  const tabs = [
    {
      href: `/${monthSuffix}`,
      icon: House,
      label: 'Home',
      isActive: pathname === '/' || pathname.startsWith('/expenses'),
    },
    {
      href: `/analytics${monthSuffix}`,
      icon: ChartBar,
      label: 'Análisis',
      isActive: pathname.startsWith('/analytics'),
    },
    {
      href: '/settings',
      icon: Gear,
      label: 'Config',
      isActive: pathname.startsWith('/settings'),
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pt-2"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
    >
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-full w-fit shadow-tab-bar"
        style={{
          background: 'rgba(255,255,255,0.38)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.70)',
        }}
      >
        {tabs.map(({ href, icon: Icon, label, isActive }) => (
          <Link
            key={label}
            href={href}
            className={`flex items-center rounded-full overflow-hidden transition-all duration-200 ${
              isActive
                ? 'gap-1.5 px-5 py-2'
                : 'gap-0 px-[14px] py-2 bg-transparent'
            }`}
            style={isActive ? { background: '#0D1829' } : undefined}
          >
            <Icon
              size={18}
              weight="regular"
              className={`shrink-0 ${isActive ? 'text-white' : 'text-[#90A4B0]'}`}
            />
            {isActive && (
              <span className="text-[13px] font-semibold text-white whitespace-nowrap tracking-[-0.01em]">
                {label}
              </span>
            )}
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
        <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-5">
          <div
            className="w-40 h-12 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.38)',
              border: '1px solid rgba(255,255,255,0.70)',
            }}
          />
        </div>
      }
    >
      <TabBarInner />
    </Suspense>
  )
}
