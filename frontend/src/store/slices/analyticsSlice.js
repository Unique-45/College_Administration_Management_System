import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import analyticsService from '@/services/analyticsService'

export const fetchVideoAnalytics = createAsyncThunk(
  'analytics/fetchVideoAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.fetchVideoAnalytics(params)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch video analytics')
    }
  }
)

export const fetchEngagementAnalytics = createAsyncThunk(
  'analytics/fetchEngagementAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.fetchEngagementAnalytics()
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch engagement analytics')
    }
  }
)

export const fetchViewershipTrends = createAsyncThunk(
  'analytics/fetchViewershipTrends',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.fetchViewershipTrends(params)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch viewership trends')
    }
  }
)

const defaultTrendData = [
  { period: 'Mon', views: 120, watchTime: 75, activeStudents: 42 },
  { period: 'Tue', views: 150, watchTime: 88, activeStudents: 48 },
  { period: 'Wed', views: 170, watchTime: 96, activeStudents: 56 },
  { period: 'Thu', views: 162, watchTime: 91, activeStudents: 52 },
  { period: 'Fri', views: 184, watchTime: 103, activeStudents: 61 },
  { period: 'Sat', views: 143, watchTime: 82, activeStudents: 47 },
  { period: 'Sun', views: 98, watchTime: 58, activeStudents: 33 },
]

const defaultVideos = [
  { title: 'Mathematics: Linear Equations', views: 420, watchTime: 312, completionRate: 86 },
  { title: 'Physics: Kinematics Basics', views: 355, watchTime: 271, completionRate: 79 },
  { title: 'Chemistry: Organic Intro', views: 298, watchTime: 223, completionRate: 74 },
  { title: 'Biology: Cell Structure', views: 265, watchTime: 208, completionRate: 81 },
]

const defaultHeatmap = [
  { day: 'Mon', slots: [25, 34, 18, 12] },
  { day: 'Tue', slots: [22, 38, 21, 15] },
  { day: 'Wed', slots: [29, 41, 24, 17] },
  { day: 'Thu', slots: [27, 36, 22, 13] },
  { day: 'Fri', slots: [32, 45, 28, 18] },
  { day: 'Sat', slots: [19, 27, 17, 9] },
  { day: 'Sun', slots: [14, 21, 12, 7] },
]

const initialState = {
  summary: {
    totalViews: 0,
    totalWatchTime: 0,
    activeStudents: 0,
    engagementRate: 0,
  },
  trendData: defaultTrendData,
  videos: defaultVideos,
  engagementBreakdown: [
    { name: 'High Engagement', value: 42 },
    { name: 'Medium Engagement', value: 36 },
    { name: 'Low Engagement', value: 22 },
  ],
  peakTimeHeatmap: defaultHeatmap,
  loading: false,
  error: null,
  usingFallbackData: false,
}

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideoAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVideoAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.videos = Array.isArray(action.payload?.videos)
          ? action.payload.videos
          : Array.isArray(action.payload)
            ? action.payload
            : defaultVideos

        const totalViews = state.videos.reduce((sum, item) => sum + (item.views || 0), 0)
        const totalWatchTime = state.videos.reduce((sum, item) => sum + (item.watchTime || 0), 0)

        state.summary.totalViews = totalViews
        state.summary.totalWatchTime = totalWatchTime
        state.usingFallbackData = !Array.isArray(action.payload?.videos) && !Array.isArray(action.payload)
      })
      .addCase(fetchVideoAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch video analytics'
        state.usingFallbackData = true
      })
      .addCase(fetchEngagementAnalytics.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.summary.activeStudents = payload.activeStudents || state.summary.activeStudents || 52
        state.summary.engagementRate = payload.engagementRate || state.summary.engagementRate || 78
        state.engagementBreakdown = Array.isArray(payload.breakdown)
          ? payload.breakdown
          : state.engagementBreakdown
      })
      .addCase(fetchEngagementAnalytics.rejected, (state) => {
        state.usingFallbackData = true
      })
      .addCase(fetchViewershipTrends.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.trendData = Array.isArray(payload.trends)
          ? payload.trends
          : Array.isArray(payload)
            ? payload
            : defaultTrendData
        state.peakTimeHeatmap = Array.isArray(payload.peakTimes)
          ? payload.peakTimes
          : state.peakTimeHeatmap
      })
      .addCase(fetchViewershipTrends.rejected, (state) => {
        state.usingFallbackData = true
      })
  },
})

export const { clearAnalyticsError } = analyticsSlice.actions
export default analyticsSlice.reducer
