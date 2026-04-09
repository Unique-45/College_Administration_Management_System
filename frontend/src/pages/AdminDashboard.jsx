import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAdminDashboard, fetchUsers, fetchClasses, fetchReports } from '../store/slices/dashboardSlice'
import OverviewCards from '../components/Dashboard/OverviewCards'
import UsersManagementTable from '../components/Dashboard/UsersManagementTable'
import ClassesManagementInterface from '../components/Dashboard/ClassesManagementInterface'
import ReportsAnalyticsView from '../components/Dashboard/ReportsAnalyticsView'
import SystemHealthMonitor from '../components/Dashboard/SystemHealthMonitor'
import PageHeader from '../components/Common/PageHeader'
import PageSkeleton from '../components/Common/PageSkeleton'
import { LayoutDashboard, Settings } from 'lucide-react'

/**
 * AdminDashboard - Premium Intelligence & Command Center
 * Features:
 * - Real-time system telemetry
 * - Global user/class management vectors
 * - Advanced reporting clusters
 * - Integrated health monitoring
 */
const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { stats = {}, loading, error } = useSelector((state) => state.dashboard)

  useEffect(() => {
    // Initial data hydration
    dispatch(fetchAdminDashboard())
    dispatch(fetchUsers())
    dispatch(fetchClasses())
    dispatch(fetchReports())
  }, [dispatch])

  if (loading) return <PageSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 opacity-50" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Command Center Interrupted</h2>
        <p className="text-text-muted max-w-md mx-auto">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 btn-outline"
        >
          Attempt Re-establishment
        </button>
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-in">
      <PageHeader 
        title="Admin Intelligence Hub"
        subtitle="Global campus telemetry and organizational oversight"
        icon={LayoutDashboard}
        actions={
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-success/10 text-success text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Systems Nominal
            </span>
          </div>
        }
      />

      {/* Primary KPI Grid */}
      <section className="mb-8">
        <OverviewCards stats={stats} />
      </section>

      {/* Operational Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Intelligence Matrix */}
        <div className="section-container !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border-app/50 flex justify-between items-center bg-surface-2/30">
            <h3 className="text-sm font-semibold text-text-primary">User Identity Management</h3>
          </div>
          <UsersManagementTable />
        </div>

        {/* Academic Infrastructure Control */}
        <div className="section-container !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border-app/50 flex justify-between items-center bg-surface-2/30">
            <h3 className="text-sm font-semibold text-text-primary">Academic Node Optimization</h3>
          </div>
          <ClassesManagementInterface />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Data Visualization Cluster */}
        <div className="xl:col-span-2">
          <ReportsAnalyticsView />
        </div>

        {/* Technical Health Monitor */}
        <div>
          <SystemHealthMonitor />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard