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
}

export default analyticsService
