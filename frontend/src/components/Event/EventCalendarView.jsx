import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEventCalendarData } from '@/store/slices/eventAnalyticsSlice'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Info,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react'

const EventCalendarView = () => {
  const dispatch = useDispatch()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { calendarData, analyticsLoading } = useSelector((state) => state.eventAnalytics)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    dispatch(fetchEventCalendarData({ month: currentMonth + 1, year: currentYear }))
  }, [currentMonth, currentYear, dispatch])

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  const days = []
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i) })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true, date: new Date(currentYear, currentMonth, i) })
  }
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, isCurrentMonth: false, date: new Date(currentYear, currentMonth + 1, i) })
  }

  const getEventsForDate = (date) => {
    if (!Array.isArray(calendarData)) return []
    return calendarData.filter(event => {
      const eventDate = new Date(event.date || event.eventDateTime)
      return eventDate.getDate() === date.getDate() && eventDate.getMonth() === date.getMonth() && eventDate.getFullYear() === date.getFullYear()
    })
  }

  const monthYearString = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Calendar Primary View */}
      <div className="lg:col-span-8 card !bg-transparent !border-0 !p-0 space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Calendar className="w-6 h-6" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">{monthYearString}</h2>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Campus Event Schedule</p>
               </div>
            </div>
            
            <div className="flex items-center gap-2 bg-surface-1 p-1.5 rounded-xl border border-border-app">
               <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 hover:bg-surface-2 rounded-lg text-text-muted transition-colors"><ChevronLeft className="w-4 h-4" /></button>
               <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-[10px] font-black tracking-widest text-primary hover:bg-primary/10 rounded-lg transition-all">TODAY</button>
               <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 hover:bg-surface-2 rounded-lg text-text-muted transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
         </div>

         <div className="card overflow-hidden !p-0 border-border-app/40 shadow-2xl">
            {/* Week Headers */}
            <div className="grid grid-cols-7 border-b border-border-app bg-surface-2/30">
               {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                 <div key={day} className="py-4 text-center text-[10px] font-black text-text-muted tracking-widest">{day}</div>
               ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 bg-surface-1">
               {days.map((dayObj, idx) => {
                 const dayEvents = dayObj.isCurrentMonth ? getEventsForDate(dayObj.date) : []
                 const isSelected = selectedDate && selectedDate.toDateString() === dayObj.date.toDateString()
                 const isToday = new Date().toDateString() === dayObj.date.toDateString()

                 return (
                   <button
                     key={idx}
                     onClick={() => setSelectedDate(dayObj.date)}
                     className={`min-h-[120px] p-3 text-left border-r border-b border-border-app/30 relative transition-all group ${
                       !dayObj.isCurrentMonth ? 'opacity-20 bg-surface-2/10' : 'bg-surface-1/40 hover:bg-surface-2'
                     } ${isSelected ? 'ring-2 ring-inset ring-primary' : ''}`}
                   >
                     <div className="flex justify-between items-start">
                        <span className={`text-sm font-black ${isToday ? 'bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-text-secondary'}`}>
                           {dayObj.day}
                        </span>
                        {dayEvents.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                     </div>
                     
                     <div className="mt-3 space-y-1">
                        {dayEvents.slice(0, 2).map((e, i) => (
                           <div key={i} className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary truncate">
                              {e.name || e.title}
                           </div>
                        ))}
                        {dayEvents.length > 2 && (
                           <div className="text-[9px] font-black text-text-muted pl-1">+{dayEvents.length - 2} MORE</div>
                        )}
                     </div>
                   </button>
                 )
               })}
            </div>
         </div>
      </div>

      {/* Selected Day Agenda */}
      <div className="lg:col-span-4 space-y-6 lg:mt-24">
         <div className="card !p-6 bg-surface-2/50 border-border-app items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary shadow-glow-primary/20 flex flex-col items-center justify-center mx-auto mb-4">
               <span className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">
                 {selectedDate.toLocaleDateString('en-US', { month: 'short' })}
               </span>
               <span className="text-3xl font-black text-white leading-none">
                 {selectedDate.getDate()}
               </span>
            </div>
            <h3 className="text-lg font-black text-text-primary tracking-tight">
               {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </h3>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Daily Agenda Review</p>
         </div>

         <div className="space-y-4">
            {selectedEvents.length > 0 ? (
               selectedEvents.map((event, idx) => (
                 <div key={idx} className="card !p-5 group hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="relative z-10">
                       <div className="flex justify-between items-start mb-4">
                          <span className="badge badge-primary text-[8px] font-black py-0.5">{event.type || 'CAMPUS'}</span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted">
                             <Clock className="w-3 h-3 text-primary" />
                             {event.time || new Date(event.eventDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                       <h4 className="text-sm font-black text-text-primary group-hover:text-primary transition-colors leading-relaxed">{event.name || event.title}</h4>
                       {event.location && (
                         <div className="flex items-center gap-2 mt-3 text-[10px] font-medium text-text-muted">
                            <MapPin className="w-3 h-3 text-accent" />
                            {event.location}
                         </div>
                       )}
                       <div className="mt-5 flex items-center justify-between border-t border-border-app/30 pt-4">
                          <div className="flex -space-x-2">
                             {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-surface-1 bg-surface-3 flex items-center justify-center text-[8px] font-bold">A{i}</div>)}
                          </div>
                          <button className="flex items-center gap-2 text-[10px] font-black text-primary hover:gap-3 transition-all">VIEW DETAILS <ArrowRight className="w-3 h-3" /></button>
                       </div>
                    </div>
                 </div>
               ))
            ) : (
               <div className="card !p-12 text-center border-dashed border-border-app items-center">
                  <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-6 text-text-muted/20">
                     <Sparkles className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-text-muted uppercase tracking-widest">Clear Schedule</h4>
                  <p className="text-[10px] text-text-muted/60 mt-2 max-w-[180px] leading-relaxed mx-auto">No events synchronized for this timeline segment.</p>
               </div>
            )}
         </div>
      </div>

       {/* Global Overlay for Loading */}
       {analyticsLoading && (
        <div className="fixed bottom-12 right-12 z-50">
           <div className="bg-surface-1 border border-primary/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-slide-up">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="text-[10px] font-black text-text-primary tracking-widest uppercase">Syncing Temporal Data...</div>
           </div>
        </div>
      )}
    </div>
  )
}

export default EventCalendarView
