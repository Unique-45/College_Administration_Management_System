/**
 * Header/Navbar Component
 * Premium dark top navigation bar
 * Features:
 * - Search trigger
 * - Notification bell with badge
 * - User profile dropdown with avatar
 * - Role badge
 * - Sticky with border
 * - Mobile hamburger menu toggle
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { toggleSidebar } from '@/store/slices/uiSlice'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
  GraduationCap,
  BookOpen,
} from 'lucide-react'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const dropdownRef = useRef(null)

  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notification)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const getRoleMeta = (role) => {
    const roleMap = {
      admin: { label: 'Administrator', icon: Shield, color: 'text-primary bg-primary/10' },
      teacher: { label: 'Teacher', icon: BookOpen, color: 'text-accent bg-accent/10' },
      student: { label: 'Student', icon: GraduationCap, color: 'text-info bg-info/10' },
    }
    return roleMap[role] || { label: role, icon: User, color: 'text-text-muted bg-surface-2' }
  }

  const getAvatarColor = (role) => {
    const colors = {
      admin: 'from-primary to-primary-600',
      teacher: 'from-accent to-accent-600',
      student: 'from-info to-sky-600',
    }
    return colors[role] || 'from-primary to-primary-600'
  }

  const roleMeta = getRoleMeta(user?.role)

  return (
    <header className="bg-surface-1/80 backdrop-blur-xl border-b border-border-app/50 sticky top-0 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left — Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="lg:hidden btn-icon text-text-muted hover:text-text-primary"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="hidden sm:flex items-center gap-2 bg-surface-2 border border-border-app/50 rounded-btn px-3.5 py-2 text-sm text-text-muted cursor-pointer hover:border-border-app transition-colors w-64">
              <Search className="w-4 h-4" />
              <span>Search anything...</span>
              <kbd className="ml-auto text-[10px] font-medium bg-surface-3 px-1.5 py-0.5 rounded text-text-muted">⌘K</kbd>
            </div>
          </div>

          {/* Right Side */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              {/* Role Badge */}
              <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-medium ${roleMeta.color}`}>
                <roleMeta.icon className="w-3.5 h-3.5" />
                {roleMeta.label}
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => navigate(`/${user?.role}/dashboard`)}
                className="relative btn-icon text-text-muted hover:text-text-primary hover:bg-surface-2"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-danger rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-btn hover:bg-surface-2 transition-all duration-200"
                >
                  <div className={`avatar-sm bg-gradient-to-br ${getAvatarColor(user?.role)}`}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-text-primary leading-tight">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-text-muted">{user?.email || ''}</p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 hidden sm:block ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface-2 rounded-card border border-border-app shadow-dropdown py-1.5 z-50 animate-scale-in">
                    <div className="px-4 py-3 border-b border-border-app/50">
                      <p className="text-sm font-medium text-text-primary">{user?.name}</p>
                      <p className="text-xs text-text-muted truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/profile')
                          setShowUserMenu(false)
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-3 hover:text-text-primary transition-colors"
                      >
                        <User className="w-4 h-4" />
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate(`/${user?.role}/settings`)
                          setShowUserMenu(false)
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-3 hover:text-text-primary transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                    </div>
                    <div className="border-t border-border-app/50 pt-1">
                      <button
                        onClick={() => {
                          handleLogout()
                          setShowUserMenu(false)
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
