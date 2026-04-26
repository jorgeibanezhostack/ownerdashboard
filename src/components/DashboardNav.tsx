'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import HostackLogo from '@/components/Logo'

interface NavItem {
  href: string
  label: string
}

interface DashboardNavProps {
  navItems: NavItem[]
  propertyName: string
  fullName: string
}

export default function DashboardNav({ navItems, propertyName, fullName }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className="bg-[#004F59] border-b border-[#031e23] sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <HostackLogo />
          <span className="text-xs text-[#4af8d4] border-l border-[#052f36] pl-4 hidden sm:block">
            {propertyName}
          </span>
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {navItems.map(({ href, label }) => {
              const isActive =
                href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-white bg-[#052f36]'
                      : 'text-[#a0cac7] hover:text-white hover:bg-[#052f36]'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
        <span className="text-sm text-[#a0cac7] hidden md:block">{fullName}</span>
      </div>
    </nav>
  )
}
