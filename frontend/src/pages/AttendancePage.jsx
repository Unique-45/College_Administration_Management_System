import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchClasses, fetchClassById } from '@/store/slices/dashboardSlice'
import { markAttendance, fetchClassAttendance, fetchStudentAttendance } from '@/store/slices/attendanceSlice'
import { PageSkeleton } from '@/components/Common/LoadingSpinner'
import { showToast } from '@/store/slices/notificationSlice'
import PageHeader from '@/components/Common/PageHeader'
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  ChevronRight,
  UserCheck,
  ClipboardList,
  Search,
  ArrowRight
} from 'lucide-react'

const AttendancePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { classes = [], selectedClassDetails } = useSelector((state) => state.dashboard)
  const { classAttendance, studentAttendance, loading, error } = useSelector((state) => state.attendance)
  
  const [selectedClassId, setSelectedClassId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [markingMode, setMarkingMode] = useState(false)
  const [attendanceData, setAttendanceData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.role === 'teacher' || user.role === 'admin') {
      dispatch(fetchClasses())
    } else if (user.role === 'student') {
      dispatch(fetchStudentAttendance({ studentId: user.id || user._id }))
    }
  }, [dispatch, user])

  const handleFetchAttendance = () => {
    if (!selectedClassId) {
      dispatch(showToast({ type: 'error', message: 'Please select a class' }))
      return
    }
    dispatch(fetchClassAttendance({ classId: selectedClassId, params: { date } }))
  }

  const handleMarkMode = async () => {
    if (!selectedClassId) {
      dispatch(showToast({ type: 'error', message: 'Please select a class first' }))
      return
    }

    const { payload } = await dispatch(fetchClassById(selectedClassId))
    const classInfo = payload?.data || payload
    
    if (classInfo?.students?.length > 0) {
      setAttendanceData(classInfo.students.map(s => ({ 
        studentId: s._id || s.id, 
        studentName: s.name || 'Student',
        status: 'present',
        avatar: s.avatar || `https://ui-avatars.com/api/?name=${s.name}&background=random`
      })))
      setMarkingMode(true)
    } else {
      dispatch(showToast({ type: 'warning', message: 'No students enrolled in this class' }))
    }
  }

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, status } : item
    ))
  }

  const handleSubmitAttendance = async () => {
    const result = await dispatch(markAttendance({
      classId: selectedClassId,
      date,
      attendance: attendanceData.map(r => ({ studentId: r.studentId, status: r.status }))
    }))

    if (result.type.endsWith('/fulfilled')) {
      dispatch(showToast({ type: 'success', message: 'Attendance marked successfully' }))
      setMarkingMode(false)
      handleFetchAttendance()
    }
  }

  const filteredMarkingData = attendanceData.filter(s => 
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && !markingMode) return <PageSkeleton />
  if (!isAuthenticated) return <div className="p-8 text-center text-danger">Please login to view attendance</div>

  const isManagement = user?.role === 'teacher' || user?.role === 'admin'

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Attendance Management" 
        subtitle="Track and manage student presence across all active classes"
        actions={
          isManagement && !markingMode && (
             <button onClick={handleMarkMode} className="btn-primary flex items-center gap-2">
               <UserCheck className="w-4 h-4" />
               Take Attendance
             </button>
          )
        }
      />

      {isManagement && !markingMode && (
        <div className="card !p-0 overflow-hidden">
          <div className="p-5 border-b border-border-app flex items-center gap-3">
             <Filter className="w-4 h-4 text-primary" />
             <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Filter Controls</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Academic Class</label>
              <select 
                value={selectedClassId} 
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="select w-full"
              >
                <option value="">Select a class...</option>
                {classes?.map(c => (
                  <option key={c._id} value={c._id}>{c.name} — {c.subject}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Target Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={handleFetchAttendance}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <ClipboardList className="w-4 h-4" />
                Query Records
              </button>
            </div>
          </div>
        </div>
      )}

      {markingMode ? (
        <div className="animate-scale-in">
          <div className="card !p-0 overflow-hidden shadow-glow-primary/10">
            <div className="p-6 bg-gradient-to-r from-surface-1 to-surface-2 border-b border-border-app flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Attendance Sheet</h3>
                <p className="text-sm text-text-muted">Recording for: {classes.find(c => c._id === selectedClassId)?.name || 'Selected Class'} • {new Date(date).toLocaleDateString()}</p>
              </div>
              <div className="relative w-full md:w-72">
                 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                 <input 
                   type="text" 
                   placeholder="Search student name..."
                   className="input pl-10 w-full"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Info</th>
                    <th className="text-center">Status Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarkingData.length > 0 ? filteredMarkingData.map(record => (
                    <tr key={record.studentId} className="hover:bg-surface-2/50 transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                           <img src={record.avatar} alt="" className="w-10 h-10 rounded-full border border-border-app shadow-sm" />
                           <div>
                              <p className="font-bold text-text-primary">{record.studentName}</p>
                              <p className="text-xs text-text-muted">ID: {record.studentId.slice(-8).toUpperCase()}</p>
                           </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-2">
                          {[
                            { id: 'present', label: 'Present', icon: CheckCircle2, color: 'success' },
                            { id: 'absent', label: 'Absent', icon: XCircle, color: 'danger' },
                            { id: 'late', label: 'Late', icon: Clock, color: 'warning' }
                          ].map(status => (
                            <button
                              key={status.id}
                              onClick={() => handleStatusChange(record.studentId, status.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-btn text-xs font-bold transition-all border ${
                                record.status === status.id 
                                  ? `bg-${status.color}/20 text-${status.color} border-${status.color}/50 shadow-sm`
                                  : 'bg-surface-3 text-text-muted border-border-app hover:border-text-muted'
                              }`}
                            >
                              <status.icon className={`w-3.5 h-3.5 ${record.status === status.id ? `text-${status.color}` : 'opacity-40'}`} />
                              {status.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="2" className="empty-state py-12">
                        <ClipboardList className="w-12 h-12 text-text-muted/30 mb-3" />
                        <p className="text-text-muted">No students found matching your search.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-surface-2/50 flex justify-between items-center">
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-success" />
                    <span className="text-xs font-bold text-text-secondary">{attendanceData.filter(r => r.status === 'present').length} Present</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-danger" />
                    <span className="text-xs font-bold text-text-secondary">{attendanceData.filter(r => r.status === 'absent').length} Absent</span>
                 </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setMarkingMode(false)} className="btn-secondary">Discard Session</button>
                <button onClick={handleSubmitAttendance} className="btn-primary px-8">Confirm & Finalize</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="card p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Sessions</p>
                   <p className="text-lg font-bold text-text-primary">24</p>
                </div>
             </div>
             <div className="card p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-success/10 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Present</p>
                   <p className="text-lg font-bold text-text-primary">88%</p>
                </div>
             </div>
             <div className="card p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-danger/10 text-danger">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Absent</p>
                   <p className="text-lg font-bold text-text-primary">8%</p>
                </div>
             </div>
             <div className="card p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-lg bg-warning/10 text-warning">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Late Arrivals</p>
                   <p className="text-lg font-bold text-text-primary">4%</p>
                </div>
             </div>
          </div>

          <div className="card !p-0 overflow-hidden">
            <div className="p-5 border-b border-border-app flex justify-between items-center">
              <h3 className="text-base font-bold text-text-primary font-heading">
                {user?.role === 'student' ? 'Personal History Log' : 'Class Archive Records'}
              </h3>
              <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                Export Log
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
               <table className="table">
                  <thead>
                    <tr>
                      <th>Session Date</th>
                      {isManagement && <th>Student Identity</th>}
                      <th>Status Badge</th>
                      <th>Administrative Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const data = user?.role === 'student' 
                        ? (studentAttendance?.attendance || []) 
                        : (classAttendance?.recentAttendance || []).flatMap(day => 
                            (day.attendance || []).map(r => ({ ...r, date: day.date }))
                          );
                      
                      if (data.length === 0) {
                        return (
                          <tr>
                            <td colSpan={isManagement ? 4 : 3} className="empty-state py-16">
                              <ClipboardList className="w-16 h-16 text-text-muted/20 mb-4" />
                              <p className="text-text-muted">No attendance activity found for your selection.</p>
                              {isManagement && <p className="text-xs text-text-muted mt-2 italic">Try adjusting the filters or select a different date.</p>}
                            </td>
                          </tr>
                        );
                      }

                      return data.map((record, idx) => (
                        <tr key={record._id || record.id || `rec-${idx}`} className="hover:bg-surface-2/50 transition-colors cursor-pointer">
                          <td className="font-medium text-text-secondary whitespace-nowrap">
                            <div className="flex items-center gap-2">
                               <Calendar className="w-3.5 h-3.5 text-primary opacity-60" />
                               {record.date ? new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </div>
                          </td>
                          {isManagement && (
                            <td>
                              <div className="flex items-center gap-2">
                                 <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-bold text-text-muted border border-border-app">
                                   {(record.studentId?.name || record.studentName || '?')[0]}
                                 </div>
                                 <span className="font-bold text-text-primary">{record.studentId?.name || record.studentName || 'N/A'}</span>
                              </div>
                            </td>
                          )}
                          <td>
                            <span className={`badge ${
                              record.status === 'present' ? 'badge-success shadow-glow-success/10' : 
                              record.status === 'absent' ? 'badge-danger shadow-glow-danger/10' : 
                              'badge-warning shadow-glow-warning/10'
                            }`}>
                              {(record.status || 'unknown').toUpperCase()}
                            </span>
                          </td>
                          <td className="text-sm text-text-muted max-w-xs truncate">{record.notes || <span className="opacity-30">—</span>}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendancePage
