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
import { useNavigate, useLocation, Link } from 'react-router-dom'
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
  ChevronRight,
} from 'lucide-react'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
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
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const formatSegment = (segment) =>
    segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())

  return (
    <header className="sticky top-0 z-40 border-b border-border-app bg-surface-1/90 backdrop-blur-xl">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="btn-icon text-text-muted hover:bg-surface-2 hover:text-text-primary lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav className="hidden items-center gap-1 text-xs text-text-muted md:flex">
              {pathSegments.length === 0 ? (
                <span>Dashboard</span>
              ) : (
                pathSegments.map((segment, index) => {
                  const segmentPath = `/${pathSegments.slice(0, index + 1).join('/')}`
                  const isLast = index === pathSegments.length - 1

                  return (
                    <span key={segmentPath} className="flex items-center gap-1">
                      {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-text-muted/60" />}
                      {isLast ? (
                        <span className="font-semibold text-text-secondary">{formatSegment(segment)}</span>
                      ) : (
                        <Link to={segmentPath} className="transition-colors hover:text-primary">
                          {formatSegment(segment)}
                        </Link>
                      )}
                    </span>
                  )
                })
              )}
            </nav>

            <button
              className="hidden w-72 items-center gap-2 rounded-btn border border-border-app bg-surface-2 px-3.5 py-2 text-left text-sm text-text-muted transition-colors hover:border-primary/30 sm:flex"
              type="button"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span>Search anything...</span>
              <kbd className="ml-auto rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-medium text-text-muted">⌘K</kbd>
            </button>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <div className={`hidden items-center gap-1.5 rounded-pill px-3 py-1.5 text-xs font-semibold md:flex ${roleMeta.color}`}>
                <roleMeta.icon className="w-3.5 h-3.5" />
                {roleMeta.label}
              </div>

              <button
                onClick={() => navigate(`/${user?.role}/events`)}
                className="relative btn-icon text-text-muted hover:bg-surface-2 hover:text-text-primary"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-danger rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 rounded-btn p-1.5 pr-3 transition-all duration-200 hover:bg-surface-2"
                  aria-expanded={showUserMenu}
                  aria-haspopup="menu"
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

                {showUserMenu && (
                  <div className="absolute right-0 z-50 mt-2 w-56 animate-scale-in rounded-card border border-border-app bg-surface-1 py-1.5 shadow-dropdown" role="menu">
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
