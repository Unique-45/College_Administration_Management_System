import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchVideoAnalytics,
  fetchEngagementAnalytics,
  fetchViewershipTrends,
  fetchPeakWatchTimes,
  fetchAttendanceAnalytics,
  fetchRevenueAnalytics,
  fetchReportTypes,
  generateAnalyticsReport,
} from '@/store/slices/analyticsSlice'
import ReportsAnalyticsView from '@/components/Dashboard/ReportsAnalyticsView'

const AnalyticsDashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { loading, error } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchVideoAnalytics())
    dispatch(fetchEngagementAnalytics())
    dispatch(fetchViewershipTrends())
    dispatch(fetchPeakWatchTimes())
    dispatch(fetchAttendanceAnalytics())
    dispatch(fetchReportTypes())

    if (user?.role === 'admin') {
      dispatch(fetchRevenueAnalytics())
    }
  }, [dispatch, user?.role])

  const handleGenerateReport = (type, period) => {
    dispatch(generateAnalyticsReport({ type, params: { period, format: 'json' } }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
            {error}
          </div>
        )}
        <ReportsAnalyticsView onGenerateReport={handleGenerateReport} userRole={user?.role} />
      </div>
    </div>
  )
}

export default AnalyticsDashboardPage
