import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

// Async thunks for event management
export const fetchEvents = createAsyncThunk(
  'event/fetchEvents',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/events', { params: filters })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch events')
    }
  }
)

export const fetchEventById = createAsyncThunk(
  'event/fetchEventById',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/events/${eventId}`)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch event')
    }
  }
)

export const createEvent = createAsyncThunk(
  'event/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      Object.keys(eventData).forEach((key) => {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key])
        }
      })
      const response = await api.post('/api/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create event')
    }
  }
)

export const updateEvent = createAsyncThunk(
  'event/updateEvent',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      Object.keys(eventData).forEach((key) => {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key])
        }
      })
      const response = await api.put(`/api/events/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update event')
    }
  }
)

export const deleteEvent = createAsyncThunk(
  'event/deleteEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/events/${eventId}`)
      return eventId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete event')
    }
  }
)

export const rsvpEvent = createAsyncThunk(
  'event/rsvpEvent',
  async ({ eventId, status }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/events/${eventId}/rsvp`, { status })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to RSVP')
    }
  }
)

export const fetchEventAttendees = createAsyncThunk(
  'event/fetchEventAttendees',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/events/${eventId}/attendees`)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendees')
    }
  }
)

const initialState = {
  events: [],
  currentEvent: null,
  currentEventAttendees: [],
  loading: false,
  error: null,
  filters: {
    dateRange: null,
    eventType: '',
    searchTerm: '',
  },
}

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { dateRange: null, eventType: '', searchTerm: '' }
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null
      state.currentEventAttendees = []
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        state.events = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch Event by ID
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false
        state.currentEvent = action.payload
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Create Event
    builder
      .addCase(createEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false
        state.events.unshift(action.payload)
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update Event
    builder
      .addCase(updateEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false
        const index = state.events.findIndex((e) => e._id === action.payload._id)
        if (index !== -1) {
          state.events[index] = action.payload
        }
        if (state.currentEvent?._id === action.payload._id) {
          state.currentEvent = action.payload
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Delete Event
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false
        state.events = state.events.filter((e) => e._id !== action.payload)
        if (state.currentEvent?._id === action.payload) {
          state.currentEvent = null
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // RSVP Event
    builder
      .addCase(rsvpEvent.pending, (state) => {
        state.error = null
      })
      .addCase(rsvpEvent.fulfilled, (state, action) => {
        if (state.currentEvent?._id === action.payload._id) {
          state.currentEvent = action.payload
        }
      })
      .addCase(rsvpEvent.rejected, (state, action) => {
        state.error = action.payload
      })

    // Fetch Attendees
    builder
      .addCase(fetchEventAttendees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventAttendees.fulfilled, (state, action) => {
        state.loading = false
        state.currentEventAttendees = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchEventAttendees.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setFilters, clearFilters, clearCurrentEvent, clearError } = eventSlice.actions

export default eventSlice.reducer
