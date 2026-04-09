import React from 'react'
import EventList from '@/components/Event/EventList'

/**
 * EventsListPage - Page-level wrapper for event list view
 * Route: /events/list
 */
const EventsListPage = () => {
  return (
    <div className="page-container">
      <EventList />
    </div>
  )
}

export default EventsListPage
