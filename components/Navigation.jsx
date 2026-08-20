"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  UserPlus, 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Menu
} from 'lucide-react'
import { useState } from 'react'

const Navigation = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
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
    <nav className="w-full h-20 flex justify-center items-center   bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <span className="ml-2 text-3xl font-bold text-slate-800 hidden sm:block">
                ClientHub
              </span>
            </div>
          </div>

         
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 py-2 px-4 shadow-lg">
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
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500'}`} />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Mobile Divider */}
            <div className="border-t border-slate-200 my-2"></div>
            
            {/* Mobile Profile */}
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">John Doe</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
            
            {/* Mobile Logout */}
            <button className="w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation