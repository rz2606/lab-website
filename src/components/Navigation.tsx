'use client'

import Link from 'next/link'
<<<<<<< HEAD
import { useState, useEffect } from 'react'
import { Menu, X, User } from 'lucide-react'
import { isAuthenticated } from '@/lib/auth'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 检查用户登录状态
  useEffect(() => {
    setIsLoggedIn(isAuthenticated())
  }, [])
=======
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
>>>>>>> upstream/main

  const navItems = [
    { name: '首页', href: '/' },
    { name: '团队成员', href: '/team' },
    { name: '发表成果', href: '/publications' },
    { name: '程序开发', href: '/tools' },
    { name: '获奖名单', href: '/awards' },
    { name: '新闻动态', href: '/news' },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<<<<<<< HEAD
        <div className="flex justify-between h-16">
          <div className="flex items-center">
=======
        <div className="flex justify-center items-center h-16 relative">
          {/* Logo - positioned absolutely to the left */}
          <div className="absolute left-0 flex items-center">
>>>>>>> upstream/main
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600">
                智能化药物研发加速器
              </h1>
            </Link>
          </div>

<<<<<<< HEAD
          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8 mx-auto">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              {!isLoggedIn && (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    href="/admin"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium rounded-md transition-colors"
                  >
                    管理后台
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* User Center - Right aligned */}
          <div className="hidden md:flex items-center">
            {isLoggedIn && (
              <Link
                href="/admin"
                className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                <User size={16} className="mr-1" />
                个人中心
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
=======
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
>>>>>>> upstream/main
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
<<<<<<< HEAD
              
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    登录
                  </Link>
                  
                  <Link
                    href="/admin"
                    className="bg-blue-600 text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium transition-colors mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    管理后台
                  </Link>
                </>
              ) : (
                <Link
                  href="/admin"
                  className="flex items-center text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} className="mr-1" />
                  个人中心
                </Link>
              )}
=======
>>>>>>> upstream/main
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation