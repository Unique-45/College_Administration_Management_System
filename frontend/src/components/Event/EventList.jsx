import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEvents, setFilters, deleteEvent, fetchEventById } from '@/store/slices/eventSlice'
import { showToast } from '@/store/slices/notificationSlice'
import {
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import EventCreationForm from './EventCreationForm'
import EventDetails from './EventDetails'

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
      dispatch(
        showToast({
          message: 'Event deleted successfully',
          type: 'success',
        })
      )
      setDeleteConfirm(null)
    } catch (error) {
      dispatch(
        showToast({
          message: 'Failed to delete event',
          type: 'error',
        })
      )
    }
  }

  const handleEventClick = async (eventId) => {
    await dispatch(fetchEventById(eventId))
    setSelectedEvent(eventId)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isAdmin = userRole === 'admin' || userRole === 'teacher'

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
            <p className="text-gray-600">Discover upcoming events and campus activities</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Create Event
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchInput}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Event Type Filter */}
            <select
              name="eventType"
              value={filters.eventType}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="academic">Academic</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
            </select>

            {/* Date Range Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="date"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="From date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="To date"
              />
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-xl text-gray-500">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => handleEventClick(event._id)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
              >
                {/* Event Image */}
                <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 h-48 overflow-hidden">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <CalendarIcon className="h-12 w-12" />
                    </div>
                  )}
                  {/* Event Type Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white bg-opacity-90 text-blue-600 rounded-full text-xs font-semibold">
                      {event.eventType}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 mb-2">
                    {event.name}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  {/* Date and Location */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(event.eventDateTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  {event.rsvpCount && (
                    <div className="text-xs text-gray-500 mb-4">
                      {event.rsvpCount} people going
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <>
                        <button className="flex-1 text-blue-600 hover:text-blue-800 transition flex items-center justify-center space-x-1">
                          <PencilIcon className="h-4 w-4" />
                          <span className="text-sm">Edit</span>
                        </button>
                        {deleteConfirm === event._id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(event._id)
                              }}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(null)
                              }}
                              className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteConfirm(event._id)
                            }}
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </>
                    )}
                    <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-semibold transition">
                      {isAdmin ? 'View' : 'RSVP'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Event Modal */}
        {showCreateForm && (
          <EventCreationForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => dispatch(fetchEvents(filters))}
          />
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <EventDetails
            eventId={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </div>
  )
}

export default EventList
