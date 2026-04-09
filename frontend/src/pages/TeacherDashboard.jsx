import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTeacherDashboard } from '../store/slices/dashboardSlice'
import ClassInformationCards from '../components/Dashboard/ClassInformationCards'
import AttendanceSummary from '../components/Dashboard/AttendanceSummary'
import QuickActions from '../components/Dashboard/QuickActions'
import AvailableVideoContentWidget from '../components/Dashboard/AvailableVideoContentWidget'
import StudentListWithStatus from '../components/Dashboard/StudentListWithStatus'
import PageHeader from '../components/Common/PageHeader'
import PageSkeleton from '../components/Common/PageSkeleton'
import { GraduationCap, Users } from 'lucide-react'

/**
 * TeacherDashboard - Premium Instructional Control Center
 * Features:
 * - Real-time class telemetry
 * - Attendance vector analysis
 * - Content management shortcuts
 * - Student engagement monitoring
 */
const TeacherDashboard = () => {
  const dispatch = useDispatch()
  const { stats = {}, loading, error } = useSelector((state) => state.dashboard)

  useEffect(() => {
    // Synchronize instructional data
    dispatch(fetchTeacherDashboard())
  }, [dispatch])

  if (loading) return <PageSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="w-8 h-8 opacity-50" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Instructional Logic Interrupted</h2>
        <p className="text-text-muted max-w-md mx-auto">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 btn-outline"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-in">
      <PageHeader 
        title="Faculty Overview"
        subtitle="Manage your instructional nodes and student engagement vectors"
        icon={GraduationCap}
        actions={
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-primary/10 text-primary text-xs font-medium">
              <Users className="w-3.5 h-3.5" />
              Active Seminars
            </span>
          </div>
        }
      />

      {/* KPI Grid for Instructional Stats */}
      <section className="mb-8">
        <ClassInformationCards stats={stats} />
      </section>

      {/* Primary Instructional Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Attendance Vectors */}
        <div className="section-container !p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border-app/50 bg-surface-2/30">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Attendance Delta</h3>
          </div>
          <div className="p-6">
            <AttendanceSummary />
          </div>
        </div>

        {/* Command Shortcuts */}
        <div className="section-container">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-6">Instructional Protocols</h3>
          <QuickActions />
        </div>
      </div>

      <div className="space-y-8">
        {/* Content Repository Widget */}
        <div className="section-container">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-6">Digital Content Assets</h3>
          <AvailableVideoContentWidget />
        </div>

        {/* Active Student Roster */}
        <div className="section-container">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-6">Student Engagement Matrix</h3>
          <StudentListWithStatus />
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard