import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
} from '@/store/slices/notificationSlice'
import { showToast } from '@/store/slices/notificationSlice'
import notificationService from '@/services/notificationService'
import {
  CheckIcon,
  TrashIcon,
  BellAlertIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

const NotificationCenter = () => {
  const dispatch = useDispatch()
  const { notifications, unreadCount } = useSelector((state) => state.notification)
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    const initialize = async () => {
      await fetchNotifications()
    }
    initialize()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationService.fetchNotifications()
      dispatch(setNotifications(response.data || response))
    } catch (_err) {
      dispatch(
        showToast({
          message: 'Failed to fetch notifications',
          type: 'error',
        })
      )
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      dispatch(markAsRead(notificationId))
    } catch (_err) {
      dispatch(
        showToast({
          message: 'Failed to mark notification as read',
          type: 'error',
        })
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      dispatch(markAllAsRead())
      dispatch(
        showToast({
          message: 'All notifications marked as read',
          type: 'success',
        })
      )
    } catch (_err) {
      dispatch(
        showToast({
          message: 'Failed to mark all as read',
          type: 'error',
        })
      )
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId)
      dispatch(deleteNotification(notificationId))
      dispatch(
        showToast({
          message: 'Notification deleted',
          type: 'success',
        })
      )
      setDeleteConfirm(null)
    } catch (error) {
      dispatch(
        showToast({
          message: 'Failed to delete notification',
          type: 'error',
        })
      )
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        dispatch(clearNotifications())
        dispatch(
          showToast({
            message: 'All notifications cleared',
            type: 'success',
          })
        )
      } catch (_err) {
        dispatch(
          showToast({
            message: 'Failed to clear notifications',
            type: 'error',
          })
        )
      }
    }
  }

  const getNotificationIcon = (_type) => {
    switch (_type) {
      case 'payment':
        return '💳'
      case 'attendance':
        return '📋'
      case 'event':
        return '📅'
      case 'system':
        return '⚙️'
      case 'video':
        return '🎥'
      default:
        return '📬'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment':
        return 'bg-green-50 border-green-200'
      case 'attendance':
        return 'bg-blue-50 border-blue-200'
      case 'event':
        return 'bg-purple-50 border-purple-200'
      case 'system':
        return 'bg-orange-50 border-orange-200'
      case 'video':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  let filteredNotifications = notifications

  if (filterType !== 'all') {
    filteredNotifications = notifications.filter((n) => n.type === filterType)
  }

  if (searchInput) {
    filteredNotifications = filteredNotifications.filter((n) =>
      n.message.toLowerCase().includes(searchInput.toLowerCase()) ||
      n.title?.toLowerCase().includes(searchInput.toLowerCase())
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Mark All as Read
              </button>
            )}
          </div>
          <p className="text-gray-600">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 items-center flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="payment">Payment</option>
            <option value="attendance">Attendance</option>
            <option value="event">Event</option>
            <option value="video">Video</option>
            <option value="system">System</option>
          </select>

          {/* Clear All */}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-lg transition text-sm font-semibold"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BellAlertIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 rounded-lg p-4 transition ${
                  notification.read
                    ? 'bg-white border-gray-300'
                    : `${getNotificationColor(notification.type)} border-blue-400`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl mt-1">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title || notification.message}
                      </h3>
                      {notification.title && (
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      )}
                      <span className="inline-block text-xs text-gray-500 mt-2">
                        {formatTime(notification.createdAt)}
                      </span>
                      {notification.type && (
                        <span className="ml-2 inline-block text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                          {notification.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Mark as read"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                    )}
                    {deleteConfirm === notification.id ? (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(notification.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete notification"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationCenter
