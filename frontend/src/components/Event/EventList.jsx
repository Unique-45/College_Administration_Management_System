import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEvents, setFilters, deleteEvent, fetchEventById } from '@/store/slices/eventSlice'
import { showToast } from '@/store/slices/notificationSlice'
import {
  Trash2,
  Edit3,
  Search,
  Calendar,
  MapPin,
  Filter,
  Users,
  Plus,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-react'
import EventCreationForm from './EventCreationForm'
import EventDetails from './EventDetails'
import PageHeader from '@/components/Common/PageHeader'
import PageSkeleton from '@/components/Common/PageSkeleton'

const EventList = ({ userRole = 'student' }) => {
  const dispatch = useDispatch()
  const { events, loading, filters } = useSelector((state) => state.event)
  const [searchInput, setSearchInput] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    dispatch(fetchEvents(filters))
  }, [dispatch, filters])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchInput(value)
    dispatch(setFilters({ searchTerm: value }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    dispatch(setFilters({ [name]: value }))
  }

  const handleDelete = async (eventId) => {
    try {
      await dispatch(deleteEvent(eventId))
      dispatch(showToast({ message: 'Event permanently purged', type: 'success' }))
      setDeleteConfirm(null)
    } catch (error) {
      dispatch(showToast({ message: 'Failed to delete event entity', type: 'error' }))
    }
  }

  const isAdmin = userRole === 'admin' || userRole === 'teacher'

  const formatDateString = (dateString) => {
    const d = new Date(dateString)
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  if (loading && events.length === 0) return <PageSkeleton type="dashboard" />

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <PageHeader 
          title="Campus Life & Events" 
          subtitle="Sync your academic life with upcoming seminars, workshops, and global campus activities"
        />
        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary px-8 py-3 flex items-center gap-2 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            ORGANIZE EVENT
          </button>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-surface-1 p-2 rounded-2xl border border-border-app shadow-lg">
        <div className="relative flex-1 group w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
           <input
             type="text"
             placeholder="Search event matrix..."
             value={searchInput}
             onChange={handleSearch}
             className="input pl-12 w-full border-0 bg-transparent focus:ring-0"
           />
        </div>
        
        <div className="h-8 w-[1px] bg-border-app hidden lg:block" />

        <div className="flex flex-wrap gap-2 w-full lg:w-auto px-2">
           <select 
             name="eventType"
             value={filters.eventType}
             onChange={handleFilterChange}
             className="bg-surface-2 border-border-app text-text-secondary text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
           >
              <option value="">All Categories</option>
              {['academic', 'sports', 'cultural', 'workshop', 'seminar'].map(t => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
           </select>

           <div className="flex items-center gap-2 bg-surface-2 px-4 py-2 rounded-xl border border-border-app border-dashed">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <input type="date" className="bg-transparent text-[10px] font-bold text-text-muted focus:outline-none" />
           </div>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="card !p-20 text-center border-dashed border-border-app opacity-60">
           <div className="w-20 h-20 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-text-muted/20" />
           </div>
          <h3 className="text-lg font-bold text-text-primary uppercase tracking-widest mb-2">No Future Sight</h3>
          <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">The schedule is currently clear. Try adjusting your filters or search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.map((event) => {
            const dateParts = formatDateString(event.eventDateTime)
            return (
              <div
                key={event._id}
                className="card !p-0 group hover:-translate-y-2 transition-all duration-500 overflow-hidden border-border-app/40 hover:border-primary/30"
                onClick={() => setSelectedEvent(event._id)}
              >
                {/* Visual Header */}
                <div className="relative h-56 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                   <div className="absolute top-4 left-4 z-20 flex flex-col items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                      <span className="text-[10px] font-black text-white/60 uppercase leading-none">{dateParts.month}</span>
                      <span className="text-xl font-black text-white mt-1 leading-none">{dateParts.day}</span>
                   </div>
                   <div className="absolute top-4 right-4 z-20">
                      <span className="badge badge-primary text-[9px] font-black tracking-widest px-3 py-1 shadow-glow-primary/20">
                        {(event.eventType || 'CAMPUS').toUpperCase()}
                      </span>
                   </div>
                   <img
                     src={event.image || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60`}
                     alt=""
                     className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                   />
                </div>

                {/* Info Payload */}
                <div className="p-6 space-y-4">
                   <div className="min-h-[56px]">
                      <h3 className="text-lg font-black text-text-primary tracking-tight leading-7 group-hover:text-glow-primary transition-all line-clamp-2">
                        {event.name}
                      </h3>
                   </div>

                   <p className="text-xs text-text-muted font-medium line-clamp-2 leading-relaxed h-10">
                     {event.description}
                   </p>

                   <div className="flex flex-wrap gap-4 pt-4 border-t border-border-app/50 text-[11px] font-bold text-text-muted">
                      <div className="flex items-center gap-2">
                         <Clock className="w-3.5 h-3.5 text-primary" />
                         {dateParts.time}
                      </div>
                      <div className="flex items-center gap-2">
                         <MapPin className="w-3.5 h-3.5 text-accent" />
                         <span className="truncate max-w-[120px]">{event.location || 'Main Campus'}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-2 text-primary">
                         <Users className="w-3.5 h-3.5" />
                         {event.rsvpCount || 0}
                      </div>
                   </div>

                   {/* Terminal Actions */}
                   <div className="flex items-center gap-3 pt-4">
                      {isAdmin ? (
                        <>
                          <button 
                            className="p-2.5 rounded-xl bg-surface-2 border border-border-app text-text-muted hover:text-primary hover:border-primary/30 transition-all"
                            onClick={(e) => { e.stopPropagation(); /* handle edit */ }}
                          >
                             <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {deleteConfirm === event._id ? (
                            <div className="flex gap-1 animate-scale-in">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleDelete(event._id); }}
                                 className="px-3 py-2 bg-danger text-white text-[9px] font-black rounded-lg"
                               >PURGE</button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                                 className="px-3 py-2 bg-surface-3 text-white text-[9px] font-black rounded-lg"
                               >EXIT</button>
                            </div>
                          ) : (
                            <button 
                              className="p-2.5 rounded-xl bg-surface-2 border border-border-app text-text-muted hover:text-danger hover:border-danger/30 transition-all"
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(event._id); }}
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          <button className="flex-1 btn-secondary py-2.5 text-[11px] font-black tracking-widest flex items-center justify-center gap-2 border-border-app/40">
                             GO TO LIST
                             <ExternalLink className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black tracking-widest group/btn shadow-glow-primary/5">
                           RESERVE YOUR SPOT
                           <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      )}
                   </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {showCreateForm && (
        <EventCreationForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => dispatch(fetchEvents(filters))}
        />
      )}

      {selectedEvent && (
        <EventDetails
          eventId={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  )
}

export default EventList
