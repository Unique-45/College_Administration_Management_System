import api from './api'

const analyticsService = {
  fetchVideoAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/analytics/videos', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch video analytics' }
    }
  },

  fetchVideoAnalyticsById: async (videoId) => {
    try {
      const response = await api.get(`/analytics/videos/${videoId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch video analytics details' }
    }
  },

  fetchEngagementAnalytics: async () => {
    try {
      const response = await api.get('/analytics/engagement')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch engagement analytics' }
    }
  },

  fetchViewershipTrends: async (params = {}) => {
    try {
      const response = await api.get('/analytics/viewership-trends', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch viewership trends' }
    }
  },

  fetchPeakWatchTimes: async () => {
    try {
      const response = await api.get('/analytics/peak-watch-times')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch peak watch times' }
    }
  },

  fetchAttendanceAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/analytics/attendance', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance analytics' }
    }
  },

  fetchRevenueAnalytics: async () => {
    try {
      const response = await api.get('/analytics/revenue')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch revenue analytics' }
    }
  },

  fetchReportTypes: async () => {
    try {
      const response = await api.get('/analytics/reports')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch analytics report types' }
    }
  },

  generateReport: async (type, params = {}) => {
    try {
      const response = await api.get(`/analytics/reports/${type}`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate analytics report' }
    }
  },
}

export default analyticsService
