import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import paymentService from '@/services/paymentService'

export const fetchPendingFees = createAsyncThunk(
  'payment/fetchPendingFees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentService.fetchPendingFees()
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pending fees')
    }
  }
)

export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchPaymentHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await paymentService.fetchPaymentHistory(params)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch payment history')
    }
  }
)

export const initiatePayment = createAsyncThunk(
  'payment/initiatePayment',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await paymentService.initiatePayment(payload)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to initiate payment')
    }
  }
)

export const verifyPayment = createAsyncThunk(
  'payment/verifyPayment',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await paymentService.verifyPayment(payload)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to verify payment')
    }
  }
)

const defaultPendingFees = {
  totalFees: 60000,
  paidAmount: 35000,
  pendingAmount: 25000,
  dueDate: '2026-04-10',
}

const defaultPaymentHistory = [
  {
    _id: 'txn-1001',
    amount: 15000,
    status: 'success',
    method: 'razorpay',
    transactionId: 'pay_QA11AA11',
    createdAt: '2026-02-10T10:30:00.000Z',
    receiptUrl: '#',
    refundStatus: 'none',
  },
  {
    _id: 'txn-1002',
    amount: 10000,
    status: 'success',
    method: 'upi',
    transactionId: 'upi_QB22BB22',
    createdAt: '2026-03-05T09:10:00.000Z',
    receiptUrl: '#',
    refundStatus: 'none',
  },
]

const initialState = {
  pendingFees: defaultPendingFees,
  paymentHistory: defaultPaymentHistory,
  currentOrder: null,
  loading: false,
  initiating: false,
  verifying: false,
  error: null,
  usingFallbackData: false,
}

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingFees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPendingFees.fulfilled, (state, action) => {
        state.loading = false
        const payload = action.payload || {}
        state.pendingFees = {
          totalFees: payload.totalFees ?? state.pendingFees.totalFees,
          paidAmount: payload.paidAmount ?? state.pendingFees.paidAmount,
          pendingAmount: payload.pendingAmount ?? state.pendingFees.pendingAmount,
          dueDate: payload.dueDate || state.pendingFees.dueDate,
        }
      })
      .addCase(fetchPendingFees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch pending fees'
        state.usingFallbackData = true
      })
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false
        state.paymentHistory = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.payments)
            ? action.payload.payments
            : state.paymentHistory
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch payment history'
        state.usingFallbackData = true
      })
      .addCase(initiatePayment.pending, (state) => {
        state.initiating = true
        state.error = null
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.initiating = false
        state.currentOrder = action.payload
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.initiating = false
        state.error = action.payload || 'Failed to initiate payment'
      })
      .addCase(verifyPayment.pending, (state) => {
        state.verifying = true
        state.error = null
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verifying = false
        const verifiedPayment = action.payload?.payment || action.payload
        if (verifiedPayment) {
          state.paymentHistory.unshift(verifiedPayment)
          state.pendingFees.pendingAmount = Math.max(
            0,
            state.pendingFees.pendingAmount - (verifiedPayment.amount || 0)
          )
          state.pendingFees.paidAmount += verifiedPayment.amount || 0
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verifying = false
        state.error = action.payload || 'Failed to verify payment'
      })
  },
})

export const { clearPaymentError, clearCurrentOrder } = paymentSlice.actions
export default paymentSlice.reducer
