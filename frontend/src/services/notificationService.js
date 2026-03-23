/**
 * Notification Service
 * Handles all notification-related API calls
 */

import api from './api'

const notificationService = {
  /**
   * Fetch all notifications
   * @param {Object} params - Query parameters (page, limit, type, etc.)
   */
  fetchNotifications: async (params = {}) => {
    try {
      const response = await api.get('/api/notifications', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch notifications' }
    }
  },

  /**
   * Fetch unread notifications count
   */
  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/api/notifications/unread')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch unread count' }
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.post(`/api/notifications/${notificationId}/read`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notification as read' }
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const response = await api.post('/api/notifications/read-all')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark all as read' }
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await api.delete(`/api/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete notification' }
    }
  },

  /**
   * Fetch notifications by type
   * @param {string} type - Notification type (payment, attendance, event, system)
   */
  fetchNotificationsByType: async (type) => {
    try {
      const response = await api.get('/api/notifications', { params: { type } })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch notifications by type' }
    }
  },

  /**
   * Set up WebSocket connection for real-time notifications
   * @param {string} userId - User ID
   * @param {Function} onMessageReceived - Callback for received messages
   */
  setupWebSocket: (userId, onMessageReceived) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/notifications/ws?userId=${userId}`

    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.warn('WebSocket notification connection established')
    }

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      if (onMessageReceived) {
        onMessageReceived(notification)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.warn('WebSocket notification connection closed')
    }

    return ws
  },
}

export default notificationService
