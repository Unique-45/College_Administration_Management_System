import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { rsvpEvent, fetchEventAttendees, clearCurrentEvent } from '@/store/slices/eventSlice'
import { cancelEvent } from '@/store/slices/eventAnalyticsSlice'
import { showToast } from '@/store/slices/notificationSlice'
import EventAttendanceCheckIn from './EventAttendanceCheckIn'
import EventRescheduleForm from './EventRescheduleForm'
import {
  X,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Edit2,
  Trash2,
  Clock,
  Info,
  ShieldAlert,
  ChevronDown,
  UserCheck
} from 'lucide-react'

const EventDetails = ({ eventId, onClose, userRole = 'student' }) => {
  const dispatch = useDispatch()
  const { currentEvent, currentEventAttendees, loading } = useSelector((state) => state.event)
  const [rsvpStatus, setRsvpStatus] = useState(null)
  const [isRsvpLoading, setIsRsvpLoading] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    if (eventId && currentEvent?._id === eventId) {
      dispatch(fetchEventAttendees(eventId))
      setRsvpStatus(currentEvent.userRsvpStatus || null)
    }
  }, [dispatch, eventId, currentEvent])

  const handleRSVP = async (status) => {
    setIsRsvpLoading(true)
    try {
      const result = await dispatch(rsvpEvent({ eventId, status }))
      if (result.payload) {
        setRsvpStatus(status)
        dispatch(showToast({ message: `Protocol Update: marked as ${status}`, type: 'success' }))
        dispatch(fetchEventAttendees(eventId))
      }
    } catch (error) {
      dispatch(showToast({ message: 'RSVP Signal Failure', type: 'error' }))
    } finally {
      setIsRsvpLoading(false)
    }
  }

  const handleCancelEvent = async () => {
    setIsCanceling(true)
    try {
      await dispatch(cancelEvent({ eventId: currentEvent._id, reason: cancelReason })).unwrap()
      dispatch(showToast({ message: 'Event permanently terminated. Node notification sent.', type: 'success' }))
      setShowCancelConfirm(false)
      onClose()
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Termination Sequence Failed', type: 'error' }))
    } finally {
      setIsCanceling(false)
    }
  }

  const formatDateTime = (dateString) => {
    const d = new Date(dateString)
    return {
      full: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const isAdmin = userRole === 'admin' || userRole === 'teacher'

  if (!currentEvent) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const yesCount = currentEventAttendees.filter((a) => a.rsvpStatus === 'yes').length
  const noCount = currentEventAttendees.filter((a) => a.rsvpStatus === 'no').length
  const maybeCount = currentEventAttendees.filter((a) => a.rsvpStatus === 'maybe').length
  const dt = formatDateTime(currentEvent.eventDateTime)

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-0 md:p-8 animate-fade-in">
        <div className="relative bg-surface-1 w-full max-w-4xl h-full md:h-auto max-h-[90vh] rounded-none md:rounded-3xl overflow-hidden shadow-2xl border border-border-app flex flex-col">
          
          {/* Hero Section */}
          <div className="relative h-72 flex-shrink-0">
             <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-black/40 z-10" />
             <img 
               src={currentEvent.image || `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80`} 
               alt="" 
               className="w-full h-full object-cover"
             />
             <button
               onClick={onClose}
               className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-primary transition-all"
             >
               <X className="w-5 h-5" />
             </button>
             
             <div className="absolute bottom-6 left-8 z-20">
                <span className="badge badge-primary px-4 py-1.5 font-black tracking-widest text-[10px] shadow-glow-primary/20">
                   {(currentEvent.eventType || 'CAMPUS').toUpperCase()}
                </span>
                <h2 className="text-4xl font-black text-white mt-4 tracking-tighter drop-shadow-2xl">
                   {currentEvent.name}
                </h2>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Information Segment */}
                <div className="lg:col-span-2 space-y-8">
                   <section>
                      <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                         <Info className="w-4 h-4 text-primary" />
                         Event Abstract
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed font-medium bg-surface-2/30 p-4 rounded-2xl border border-border-app/50">
                         {currentEvent.description || "No detailed abstract provided for this node."}
                      </p>
                   </section>

                   {/* Telemetry Grid */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-surface-2 border border-border-app group hover:border-primary/30 transition-all">
                         <div className="flex items-center gap-3 text-primary mb-2">
                            <Calendar className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Temporal Data</span>
                         </div>
                         <p className="text-sm font-bold text-text-primary">{dt.full}</p>
                         <p className="text-xs text-primary font-black mt-1">{dt.time} ISST</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-surface-2 border border-border-app group hover:border-accent/30 transition-all">
                         <div className="flex items-center gap-3 text-accent mb-2">
                            <MapPin className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Localization</span>
                         </div>
                         <p className="text-sm font-bold text-text-primary">{currentEvent.location || 'Virtual Node'}</p>
                         <p className="text-xs text-text-muted font-medium mt-1 uppercase tracking-tight">Access Restricted</p>
                      </div>
                   </div>

                   {/* RSVPs & Attendees */}
                   <section className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-4 h-4 text-secondary" />
                            Registered Nodes
                         </h3>
                         <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{currentEventAttendees.length} REGISTERED</span>
                      </div>
                      
                      <div className="flex -space-x-3 overflow-hidden p-2">
                         {currentEventAttendees.slice(0, 8).map((a, i) => (
                           <div key={i} className="w-10 h-10 rounded-full border-2 border-surface-1 bg-surface-3 flex items-center justify-center text-[10px] font-black text-text-primary shadow-xl">
                              {(a.name || 'U')[0]}
                           </div>
                         ))}
                         {currentEventAttendees.length > 8 && (
                           <div className="w-10 h-10 rounded-full border-2 border-surface-1 bg-primary flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                              +{currentEventAttendees.length - 8}
                           </div>
                         )}
                      </div>

                      <div className="bg-surface-2/50 border border-border-app rounded-2xl p-4 divide-y divide-border-app/30">
                         {currentEventAttendees.slice(0, 3).map((a, i) => (
                           <div key={i} className="flex items-center justify-between py-3 px-2 first:pt-0 last:pb-0">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-xs font-bold font-heading">{(a.name || 'U')[0]}</div>
                                 <div>
                                    <p className="text-xs font-bold text-text-primary">{a.name}</p>
                                    <p className="text-[10px] text-text-muted">{a.email}</p>
                                 </div>
                              </div>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                a.rsvpStatus === 'yes' ? 'bg-success/10 text-success' : 
                                a.rsvpStatus === 'maybe' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                              }`}>{(a.rsvpStatus || 'PENDING').toUpperCase()}</span>
                           </div>
                         ))}
                      </div>
                   </section>
                </div>

                {/* Right Panel: Decision Matrix */}
                <div className="space-y-6">
                   <div className="card !p-6 bg-surface-2 border-border-app border-dashed flex flex-col gap-6">
                      <div className="text-center">
                         <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Capacity Utilization</h4>
                         <div className="flex items-center justify-center gap-3">
                            <div className="flex flex-col">
                               <span className="text-2xl font-black text-text-primary leading-none">{yesCount}</span>
                               <span className="text-[9px] font-bold text-success uppercase mt-1">Confirmed</span>
                            </div>
                            <div className="h-8 w-[1px] bg-border-app" />
                            <div className="flex flex-col">
                               <span className="text-2xl font-black text-text-muted leading-none">{currentEvent.maxParticipants || '∞'}</span>
                               <span className="text-[9px] font-bold text-text-muted uppercase mt-1">CAPACITY</span>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-2 border-t border-border-app/50 pt-6">
                         <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Update Your Status</label>
                         <div className="flex flex-col gap-2">
                            <button 
                              onClick={() => handleRSVP('yes')}
                              disabled={isRsvpLoading}
                              className={`py-3 px-4 rounded-xl text-xs font-black tracking-widest transition-all border ${
                                rsvpStatus === 'yes' ? 'bg-primary border-primary text-white shadow-glow-primary/20' : 'bg-surface-3 border-transparent text-text-muted hover:text-text-primary'
                              }`}
                            >CONFIRM ATTENDANCE</button>
                            <button 
                              onClick={() => handleRSVP('maybe')}
                              disabled={isRsvpLoading}
                              className={`py-3 px-4 rounded-xl text-xs font-black tracking-widest transition-all border ${
                                rsvpStatus === 'maybe' ? 'bg-warning/10 border-warning/20 text-warning' : 'bg-surface-3 border-transparent text-text-muted hover:text-text-primary'
                              }`}
                            >MARK AS UNCERTAIN</button>
                            <button 
                              onClick={() => handleRSVP('no')}
                              disabled={isRsvpLoading}
                              className={`py-3 px-4 rounded-xl text-xs font-black tracking-widest transition-all border ${
                                rsvpStatus === 'no' ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-surface-3 border-transparent text-text-muted hover:text-text-primary'
                              }`}
                            >DECLINE INVITATION</button>
                         </div>
                      </div>
                   </div>

                   {/* Admin Control Segment */}
                   {isAdmin && (
                      <div className="space-y-3">
                         <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                            <ShieldAlert className="w-3 h-3 text-danger" />
                            Administrative Matrix
                         </h4>
                         <div className="grid grid-cols-1 gap-2">
                            <button 
                               onClick={() => setShowCheckIn(true)}
                               className="flex items-center justify-between px-4 py-3 bg-success/10 border border-success/20 text-success rounded-xl hover:bg-success/20 transition-all font-black text-[10px] tracking-widest"
                            >
                               RUN CHECK-IN SCANNER
                               <UserCheck className="w-4 h-4" />
                            </button>
                            <button 
                               onClick={() => setShowReschedule(true)}
                               className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 text-primary rounded-xl hover:bg-primary/20 transition-all font-black text-[10px] tracking-widest"
                            >
                               RESCHEDULE TIMELINE
                               <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                               onClick={() => setShowCancelConfirm(true)}
                               className="flex items-center justify-between px-4 py-3 bg-danger/10 border border-danger/20 text-danger rounded-xl hover:bg-danger/20 transition-all font-black text-[10px] tracking-widest"
                            >
                               TERMINATE EVENT
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Check-In Modal Interaction */}
      {showCheckIn && (
        <EventAttendanceCheckIn
          eventId={eventId}
          attendees={currentEventAttendees}
          onClose={() => setShowCheckIn(false)}
          onSuccess={() => dispatch(fetchEventAttendees(eventId))}
        />
      )}

      {/* Reschedule Interaction */}
      {showReschedule && (
        <EventRescheduleForm
          event={currentEvent}
          onClose={() => setShowReschedule(false)}
          onSuccess={() => {
            dispatch(fetchEventAttendees(eventId))
            onClose()
          }}
        />
      )}

      {/* Cancel Confirmation Portal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-surface-1 border border-danger/20 p-8 shadow-2xl space-y-6">
            <div className="flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-8 h-8 text-danger" />
               </div>
               <h3 className="text-xl font-black text-text-primary uppercase tracking-widest">Terminate Node?</h3>
               <p className="text-xs text-text-muted mt-2 font-medium">This sequence will permanently purge this event from the campus timeline and notify all registered nodes.</p>
            </div>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Provide termination rationale..."
              className="w-full bg-surface-2 border border-border-app rounded-2xl px-4 py-3 text-xs font-medium focus:ring-1 focus:ring-danger/40 transition-all outline-none"
              rows="3"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 btn-secondary text-[10px] font-black"
              >ABORT</button>
              <button
                onClick={handleCancelEvent}
                disabled={isCanceling}
                className="flex-1 bg-danger hover:bg-danger-dark text-white rounded-xl text-[10px] font-black tracking-widest transition-all py-3 shadow-glow-danger/20"
              >
                {isCanceling ? 'TERMINATING...' : 'EXECUTE PURGE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EventDetails
