import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Async thunks for API calls
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/stats')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch dashboard stats')
    }
  }
)

export const fetchUsers = createAsyncThunk(
  'dashboard/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/users')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch users')
    }
  }
)

export const fetchClasses = createAsyncThunk(
  'dashboard/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/classes')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch classes')
    }
  }
)

export const fetchReports = createAsyncThunk(
  'dashboard/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/reports')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch reports')
    }
  }
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: {
      totalUsers: 0,
      totalClasses: 0,
      totalRevenue: 0,
      systemHealth: 'Good'
    },
    users: [],
    classes: [],
    reports: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Classes
      .addCase(fetchClasses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false
        state.classes = action.payload
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch Reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false
        state.reports = action.payload
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, updateStats } = dashboardSlice.actions
export default dashboardSlice.reducer