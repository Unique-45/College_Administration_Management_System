/**
 * Main Layout Component
 * Premium dark app shell with sidebar + header + content
 * Features:
 * - Fixed sidebar with collapse support
 * - Sticky header with blur backdrop
 * - Main content area with proper spacing
 * - Smooth responsive behavior
 */

import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import Header from '@/components/Common/Header'
import Sidebar from '@/components/Common/Sidebar'

const MainLayout = () => {
  const { sidebarCollapsed } = useSelector((state) => state.ui)

  return (
    <div className="min-h-screen bg-app">
      <Sidebar />

      <div className={`flex min-h-screen flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
      }`}>
        <Header />

        <main className="flex-1 w-full overflow-auto">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>

          <footer className="mt-8 border-t border-border-app/70 py-6">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-4 px-4 text-xs text-text-muted sm:flex-row sm:px-6 lg:px-8">
              <p>© 2026 CampusFlow · College Administration Management System</p>
              <div className="flex items-center gap-6">
                <a href="#" className="transition-colors hover:text-text-secondary">Privacy</a>
                <a href="#" className="transition-colors hover:text-text-secondary">Terms</a>
                <a href="#" className="transition-colors hover:text-text-secondary">Support</a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
