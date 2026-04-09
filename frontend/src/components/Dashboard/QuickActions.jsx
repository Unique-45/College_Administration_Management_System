/**
 * Quick Actions Component
 * Contextual actions for different user roles
 */

import { Plus, UserPlus, FileText, Calendar, Video, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const QuickActions = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const getActions = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { label: 'Add Student', icon: UserPlus, href: '/admin/users?tab=students', color: 'text-primary' },
          { label: 'Manage Classes', icon: FileText, href: '/admin/classes', color: 'text-accent' },
          { label: 'System Settings', icon: Calendar, href: '/admin/settings', color: 'text-info' },
        ]
      case 'teacher':
        return [
          { label: 'Take Attendance', icon: Plus, href: '/teacher/attendance', color: 'text-primary' },
          { label: 'Upload Video', icon: Video, href: '/teacher/videos/upload', color: 'text-accent' },
          { label: 'Schedule Event', icon: Calendar, href: '/teacher/dashboard', color: 'text-info' },
        ]
      case 'student':
        return [
          { label: 'View Attendance', icon: FileText, href: '/student/attendance', color: 'text-primary' },
          { label: 'Make Payment', icon: CreditCard, href: '/student/payments', color: 'text-accent' },
          { label: 'My Videos', icon: Video, href: '/student/videos', color: 'text-info' },
        ]
      default:
        return []
    }
  }

  const actions = getActions()

  if (actions.length === 0) return null

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.href)}
            className="flex items-center gap-3 p-3 rounded-input bg-surface-2 border border-transparent hover:border-primary/30 hover:bg-surface-3 transition-all duration-200 group text-left"
          >
            <div className={`p-2 rounded-lg bg-surface-3 ${action.color} group-hover:scale-110 transition-transform`}>
              <action.icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions