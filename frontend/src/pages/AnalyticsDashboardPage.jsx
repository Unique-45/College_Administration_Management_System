import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchVideoAnalytics,
  fetchEngagementAnalytics,
  fetchViewershipTrends,
} from '@/store/slices/analyticsSlice'
import ReportsAnalyticsView from '@/components/Dashboard/ReportsAnalyticsView'

const AnalyticsDashboardPage = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.analytics)

  useEffect(() => {
    dispatch(fetchVideoAnalytics())
    dispatch(fetchEngagementAnalytics())
    dispatch(fetchViewershipTrends())
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700">Analytics API Error</h2>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <ReportsAnalyticsView />
      </div>
    </div>
  )
}

export default AnalyticsDashboardPage
