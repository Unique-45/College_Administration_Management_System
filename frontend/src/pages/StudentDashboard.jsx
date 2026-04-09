import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudentDashboard } from '../store/slices/dashboardSlice'
import StudentScheduleTimetable from '../components/Dashboard/StudentScheduleTimetable'
import StudentFeePaymentStatus from '../components/Dashboard/StudentFeePaymentStatus'
import StudentAvailableVideosList from '../components/Dashboard/StudentAvailableVideosList'
import StudentAttendanceRecord from '../components/Dashboard/StudentAttendanceRecord'
import StudentProfileInformation from '../components/Dashboard/StudentProfileInformation'
import PageHeader from '../components/Common/PageHeader'
import PageSkeleton from '../components/Common/PageSkeleton'
import { GraduationCap, Sparkles } from 'lucide-react'

/**
 * StudentDashboard - Premium Learner Portal
 * Features:
 * - Academic progress telemetry
 * - Financial standing monitor
 * - Interactive schedule grid
 * - Direct content access
 */
const StudentDashboard = () => {
  const dispatch = useDispatch()
  const { statsLoading, classesLoading, statsError, classesError } = useSelector((state) => state.dashboard)
  const isLoading = statsLoading || classesLoading
  const error = statsError || classesError

  useEffect(() => {
    // Calibrate academic session
    dispatch(fetchStudentDashboard())
  }, [dispatch])

  if (isLoading) return <PageSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
          <GraduationCap className="w-8 h-8 opacity-50" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Portal Access Interrupted</h2>
        <p className="text-text-muted max-w-md mx-auto">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 btn-outline"
        >
          Re-authenticate Portal
        </button>
      </div>
    )
  }

  return (
    <div className="page-container animate-fade-in">
      <PageHeader 
        title="Student Portal"
        subtitle="Tracking your academic trajectory and institutional obligations"
        icon={GraduationCap}
        actions={
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-accent/10 text-accent text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Active Semester
            </span>
          </div>
        }
      />

      {/* Profile & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <StudentProfileInformation />
        </div>
        <div className="lg:col-span-2">
          <StudentFeePaymentStatus />
        </div>
      </div>

      {/* Academic Logistics */}
      <div className="section-container mb-8 overflow-hidden !p-0">
        <div className="px-6 py-4 border-b border-border-app/50 bg-surface-2/30">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Temporal Schedule Grid</h3>
        </div>
        <div className="p-6">
          <StudentScheduleTimetable />
        </div>
      </div>

      {/* Content & Attendance Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="section-container">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-6">Learning Assets</h3>
          <StudentAvailableVideosList />
        </div>
        <div className="section-container">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-6">Attendance Flux</h3>
          <StudentAttendanceRecord />
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
