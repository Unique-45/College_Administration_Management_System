import api from './api'

const paymentService = {
  fetchPendingFees: async () => {
    try {
      const response = await api.get('/payments/pending-fees')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch pending fees' }
    }
  },

  fetchPaymentHistory: async (params = {}) => {
    try {
      const response = await api.get('/payments/history', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payment history' }
    }
  },

  initiatePayment: async (payload) => {
    try {
      const response = await api.post('/payments/initiate', payload)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to initiate payment' }
    }
  },

  verifyPayment: async (payload) => {
    try {
      const response = await api.post('/payments/verify', payload)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to verify payment' }
    }
  },

  downloadReceipt: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}/receipt`, {
        responseType: 'blob',
      })
      return response
    } catch (error) {
      throw error.response?.data || { message: 'Failed to download receipt' }
    }
  },
}

export default paymentService
