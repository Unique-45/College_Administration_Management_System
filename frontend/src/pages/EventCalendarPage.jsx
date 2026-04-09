import React from 'react'
import EventCalendarView from '@/components/Event/EventCalendarView'

/**
 * EventCalendarPage - Page-level wrapper for event calendar view
 * Route: /events/calendar
 */
const EventCalendarPage = () => {
  return (
    <div className="page-container">
      <EventCalendarView />
    </div>
  )
}

export default EventCalendarPage
