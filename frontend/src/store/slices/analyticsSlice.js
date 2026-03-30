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

export const fetchPeakWatchTimes = createAsyncThunk(
  'analytics/fetchPeakWatchTimes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.fetchPeakWatchTimes()
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch peak watch times')
    }
  }
)

export const fetchAttendanceAnalytics = createAsyncThunk(
  'analytics/fetchAttendanceAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await analyticsService.fetchAttendanceAnalytics(params)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch attendance analytics')
    }
  }
)

export const fetchRevenueAnalytics = createAsyncThunk(
  'analytics/fetchRevenueAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.fetchRevenueAnalytics()
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch revenue analytics')
    }
  }
)

export const fetchReportTypes = createAsyncThunk(
  'analytics/fetchReportTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsService.fetchReportTypes()
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch analytics report types')
    }
  }
)

export const generateAnalyticsReport = createAsyncThunk(
  'analytics/generateAnalyticsReport',
  async ({ type, params = {} }, { rejectWithValue }) => {
    try {
      const response = await analyticsService.generateReport(type, params)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate analytics report')
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

const formatHourLabel = (hour) => {
  if (typeof hour !== 'number') return '--'
  const normalizedHour = ((hour % 24) + 24) % 24
  const suffix = normalizedHour >= 12 ? 'PM' : 'AM'
  const baseHour = normalizedHour % 12 || 12
  return `${baseHour}${suffix}`
}

const normalizeTrendData = (payload) => {
  const source = Array.isArray(payload?.trends)
    ? payload.trends
    : Array.isArray(payload)
      ? payload
      : []

  if (source.length === 0) {
    return defaultTrendData
  }

  return source.map((item) => {
    const views = item.views ?? item.totalViews ?? 0
    const activeStudents = item.activeStudents ?? item.newViewers ?? 0
    const watchTime = item.watchTime ?? item.completedViews ?? 0
    return {
      period: item.period ?? item.date ?? 'N/A',
      views,
      activeStudents,
      watchTime,
      completionPercentage: item.completionPercentage ?? 0,
    }
  })
}

const normalizeVideos = (payload) => {
  const source = Array.isArray(payload?.videos)
    ? payload.videos
    : Array.isArray(payload)
      ? payload
      : []

  if (source.length === 0) {
    return defaultVideos
  }

  return source.map((item) => ({
    ...item,
    title: item.title || 'Untitled Video',
    views: item.views ?? item.totalViews ?? 0,
    watchTime: item.watchTime ?? item.totalWatchTime ?? 0,
    completionRate: item.completionRate ?? item.averageWatchPercentage ?? 0,
  }))
}

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
  peakWatchSummary: {
    hour: '--',
    viewCount: 0,
    viewerCount: 0,
    averageViewsPerViewer: 0,
  },
  hourlyWatchBreakdown: [],
  attendanceSummary: {
    overallAttendancePercentage: 0,
    totalPresent: 0,
    totalAbsent: 0,
  },
  attendanceByClass: [],
  chronicAbsentees: [],
  revenueSummary: {
    totalRevenue: 0,
    pendingFees: 0,
    paymentsByMethod: [],
    paymentTrends: [],
  },
  availableReports: [],
  generatedReport: null,
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
        state.videos = normalizeVideos(action.payload)

        const totalViews = state.videos.reduce((sum, item) => sum + (item.views || 0), 0)
        const totalWatchTime = state.videos.reduce((sum, item) => sum + (item.watchTime || 0), 0)

        state.summary.totalViews = totalViews
        state.summary.totalWatchTime = totalWatchTime
        state.usingFallbackData = state.videos === defaultVideos
      })
      .addCase(fetchVideoAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to fetch video analytics'
        state.usingFallbackData = true
      })
      .addCase(fetchEngagementAnalytics.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.summary.activeStudents =
          payload.activeStudents || payload.totalActiveStudents || state.summary.activeStudents || 52
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
        state.trendData = normalizeTrendData(payload)
        state.peakTimeHeatmap = Array.isArray(payload.peakTimes)
          ? payload.peakTimes
          : state.peakTimeHeatmap
      })
      .addCase(fetchViewershipTrends.rejected, (state) => {
        state.usingFallbackData = true
      })
      .addCase(fetchPeakWatchTimes.fulfilled, (state, action) => {
        const payload = action.payload || {}
        const peakHour = payload.peakHour || {}
        const hourlyBreakdown = Array.isArray(payload.hourlyBreakdown) ? payload.hourlyBreakdown : []

        state.peakWatchSummary = {
          hour: formatHourLabel(peakHour.hour),
          viewCount: peakHour.viewCount || 0,
          viewerCount: peakHour.viewerCount || 0,
          averageViewsPerViewer: peakHour.averageViewsPerViewer || 0,
        }

        state.hourlyWatchBreakdown = hourlyBreakdown.map((item) => ({
          hour: item.hour,
          hourLabel: formatHourLabel(item.hour),
          viewCount: item.viewCount || 0,
          viewerCount: item.viewerCount || 0,
        }))
      })
      .addCase(fetchPeakWatchTimes.rejected, (state) => {
        state.usingFallbackData = true
      })
      .addCase(fetchAttendanceAnalytics.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.attendanceSummary = payload.overallStats || state.attendanceSummary
        state.attendanceByClass = Array.isArray(payload.byClass) ? payload.byClass : []
        state.chronicAbsentees = Array.isArray(payload.chronicAbsentees) ? payload.chronicAbsentees : []
      })
      .addCase(fetchAttendanceAnalytics.rejected, (state) => {
        state.usingFallbackData = true
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.revenueSummary = {
          totalRevenue: payload.totalRevenue || 0,
          pendingFees: payload.pendingFees || 0,
          paymentsByMethod: Array.isArray(payload.paymentsByMethod) ? payload.paymentsByMethod : [],
          paymentTrends: Array.isArray(payload.paymentTrends) ? payload.paymentTrends : [],
        }
      })
      .addCase(fetchRevenueAnalytics.rejected, (state) => {
        state.usingFallbackData = true
      })
      .addCase(fetchReportTypes.fulfilled, (state, action) => {
        const payload = action.payload || {}
        state.availableReports = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : []
      })
      .addCase(fetchReportTypes.rejected, (state) => {
        state.usingFallbackData = true
      })
      .addCase(generateAnalyticsReport.fulfilled, (state, action) => {
        state.generatedReport = action.payload || null
      })
      .addCase(generateAnalyticsReport.rejected, (state, action) => {
        state.error = action.payload || 'Failed to generate analytics report'
      })
  },
})

export const { clearAnalyticsError } = analyticsSlice.actions
export default analyticsSlice.reducer
