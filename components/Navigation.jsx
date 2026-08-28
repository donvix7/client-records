"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  UserPlus, 
  Users, 
  LayoutDashboard, 
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const Navigation = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      name: 'Add Client',
      href: '/add-client',
      icon: UserPlus
    },
    {
      name: 'View Clients',
      href: '/view-clients',
      icon: Users
    }
  ]

  const isActive = (path) => pathname === path

  return (
    <nav className="w-full bg-white border-b border-primary-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="ml-2 text-2xl font-bold text-primary font-sans hidden sm:block">
              ClientHub
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    flex items-center gap-2
                    ${active
                      ? 'bg-primary-100 text-primary'
                      : 'text-neutrals-900 hover:bg-primary-100/50'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-neutrals-900'}`} />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-primary-100/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-primary-200 py-2 px-4 shadow-lg">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    flex items-center gap-3
                    ${active
                      ? 'bg-primary text-white'
                      : 'text-neutrals-900 hover:bg-primary-100/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-neutrals-900'}`} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation