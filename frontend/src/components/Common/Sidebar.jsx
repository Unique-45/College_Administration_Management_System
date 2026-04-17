/**
 * Premium Sidebar Component
 * Dark, grouped navigation with Lucide icons
 * Features:
 * - Role-based navigation sections
 * - Active route highlighting with accent bar
 * - Collapsible submenu items
 * - Mobile responsive with overlay
 * - Icon + label layout with section grouping
 * - Collapse mode support
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar, toggleSidebarCollapsed } from '@/store/slices/uiSlice'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  CheckSquare,
  Video,
  Upload,
  Library,
  CreditCard,
  GraduationCap,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Calendar,
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { sidebarOpen, sidebarCollapsed } = useSelector((state) => state.ui)
  const [expandedMenu, setExpandedMenu] = useState(null)

  const getMenuSections = () => {
    const sections = {
      admin: [
        {
          title: 'Overview',
          items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
            { 
              icon: Calendar, 
              label: 'Events', 
              href: '/admin/events',
              submenu: [
                { label: 'Event List', href: '/admin/events/list' },
                { label: 'Calendar', href: '/admin/events/calendar' },
                { label: 'Analytics', href: '/admin/events/analytics' },
              ]
            },
          ],
        },
        {
          title: 'Management',
          items: [
            { icon: Users, label: 'Users', href: '/admin/users' },
            { icon: BookOpen, label: 'Classes', href: '/admin/classes' },
            { 
              icon: Library, 
              label: 'Video Library', 
              href: '/admin/videos',
              submenu: [
                { label: 'Browse All', href: '/admin/videos/library' },
                { label: 'Upload New', href: '/admin/videos/upload' },
              ]
            },
          ],
        },
        {
          title: 'System',
          items: [
            { icon: Settings, label: 'Settings', href: '/admin/settings' },
          ],
        },
      ],
      teacher: [
        {
          title: 'Overview',
          items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher/dashboard' },
            { 
              icon: BarChart3, 
              label: 'Analytics', 
              href: '/teacher/analytics',
              submenu: [
                { label: 'Reports', href: '/teacher/analytics/reports' },
              ]
            },
          ],
        },
        {
          title: 'Teaching',
          items: [
            { icon: BookOpen, label: 'Classes', href: '/teacher/classes' },
            { icon: CheckSquare, label: 'Attendance', href: '/teacher/attendance' },
            { icon: Video, label: 'Videos', href: '/teacher/videos',
              submenu: [
                { label: 'Upload Video', href: '/teacher/videos/upload' },
                { label: 'My Videos', href: '/teacher/videos/library' },
              ],
            },
            { icon: Calendar, label: 'Events Hub', href: '/teacher/events' },
          ],
        },
        {
          title: 'System',
          items: [
            { icon: Settings, label: 'Settings', href: '/teacher/settings' },
          ],
        },
      ],
      student: [
        {
          title: 'Overview',
          items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard' },
          ],
        },
        {
          title: 'Academic',
          items: [
            { icon: BookOpen, label: 'Classes', href: '/student/classes' },
            { icon: CheckSquare, label: 'Attendance', href: '/student/attendance' },
            { icon: Video, label: 'Lessons', href: '/student/videos' },
            { icon: Calendar, label: 'Calendar', href: '/student/events' },
          ],
        },
        {
          title: 'Finance',
          items: [
            { icon: CreditCard, label: 'Payments', href: '/student/payments' },
          ],
        },
        {
          title: 'System',
          items: [
            { icon: Settings, label: 'Settings', href: '/student/settings' },
          ],
        },
      ],
    }

    return sections[user?.role] || []
  }

  const isLinkActive = (href) => {
    if (href === `/${user?.role}/dashboard`) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  const menuSections = getMenuSections()

  return (
    <>
      {sidebarOpen && (
        <div
          className="overlay lg:hidden animate-fade-in"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col overflow-y-auto overflow-x-hidden border-r border-white/10 sidebar-surface text-[rgb(var(--sidebar-text))] shadow-2xl transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-[68px]' : 'w-64'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className={`flex h-16 flex-shrink-0 items-center border-b border-white/10 px-4 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 bg-gradient-premium rounded-btn flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-heading text-base font-semibold tracking-tight text-white">CampusFlow</h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-300">Admin Suite</p>
            </div>
          )}
        </div>

        <nav className={`flex-1 py-4 space-y-1 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className={sIdx > 0 ? 'mt-6' : ''}>
              {!sidebarCollapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-300/70">
                  {section.title}
                </p>
              )}
              {sidebarCollapsed && sIdx > 0 && <div className="divider !my-3" />}

              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <div key={item.href}>
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() =>
                            setExpandedMenu(expandedMenu === item.href ? null : item.href)
                          }
                          className={`group w-full rounded-btn px-3 py-2.5 text-sm font-medium transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : 'justify-between'} flex items-center ${
                            isLinkActive(item.href)
                              ? 'bg-primary/20 text-white'
                              : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <span className="flex items-center gap-3">
                            <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${isLinkActive(item.href) ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                            {!sidebarCollapsed && item.label}
                          </span>
                          {!sidebarCollapsed && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                expandedMenu === item.href ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </button>

                        {!sidebarCollapsed && expandedMenu === item.href && (
                          <div className="mt-1 ml-5 space-y-0.5 border-l border-white/10 pl-3 animate-slide-up">
                            {item.submenu.map((subitem) => (
                              <Link
                                key={subitem.href}
                                to={subitem.href}
                                onClick={() => dispatch(toggleSidebar())}
                                className={`block px-3 py-2 rounded-btn text-sm transition-all duration-200 ${
                                  isLinkActive(subitem.href)
                                    ? 'bg-primary/20 font-semibold text-white'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {subitem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={() => dispatch(toggleSidebar())}
                        className={`group relative flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isLinkActive(item.href)
                            ? 'bg-primary/20 text-white'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        {isLinkActive(item.href) && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                        )}
                        <item.icon className={`h-[18px] w-[18px] flex-shrink-0 ${isLinkActive(item.href) ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                        {!sidebarCollapsed && item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className={`flex-shrink-0 border-t border-white/10 p-3 ${sidebarCollapsed ? 'text-center' : ''}`}>
          {!sidebarCollapsed && (
            <div className="sidebar-elevated mb-3 flex items-center gap-3 rounded-btn px-3 py-2">
              <Sparkles className="h-4 w-4 flex-shrink-0 text-accent" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">CampusFlow v2.0</p>
                <p className="text-[10px] text-slate-300">© 2026</p>
              </div>
            </div>
          )}
          <button
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className="hidden w-full items-center justify-center rounded-btn p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white lg:flex"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
