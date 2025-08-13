'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: '首页', href: '/' },
    { name: '团队成员', href: '/team' },
    { name: '发表成果', href: '/publications' },
    { name: '程序开发', href: '/tools' },
    { name: '新闻动态', href: '/news' },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 relative">
          {/* Logo - positioned absolutely to the left */}
          <div className="absolute left-0 flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600">
                智能化药物研发加速器
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation - centered */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button - positioned absolutely to the right */}
          <div className="absolute right-0 md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation