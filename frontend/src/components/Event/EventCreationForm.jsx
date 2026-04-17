import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createEvent } from '@/store/slices/eventSlice'
import { showToast } from '@/store/slices/notificationSlice'
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'

const EventCreationForm = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventType: '',
    date: '',
    time: '',
    location: '',
    image: null,
    maxParticipants: '',
    status: 'draft',
  })
  const [imageName, setImageName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!['jpg', 'jpeg', 'png', 'webp'].includes(file.name.split('.').pop().toLowerCase())) {
      dispatch(
        showToast({
          message: 'Image must be JPG, PNG, or WebP',
          type: 'error',
        })
      )
      return
    }

    setFormData((prev) => ({
      ...prev,
      image: file,
    }))
    setImageName(file.name)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      dispatch(showToast({ message: 'Please enter event name', type: 'error' }))
      return false
    }

    if (!formData.description.trim()) {
      dispatch(showToast({ message: 'Please enter event description', type: 'error' }))
      return false
    }

    if (!formData.eventType) {
      dispatch(showToast({ message: 'Please select event type', type: 'error' }))
      return false
    }

    if (!formData.date) {
      dispatch(showToast({ message: 'Please select event date', type: 'error' }))
      return false
    }

    if (!formData.time) {
      dispatch(showToast({ message: 'Please select event time', type: 'error' }))
      return false
    }

    if (!formData.location.trim()) {
      dispatch(showToast({ message: 'Please enter event location', type: 'error' }))
      return false
    }

    // Validate date is not in the past
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`)
    if (selectedDateTime < new Date()) {
      dispatch(showToast({ message: 'Event date must be in the future', type: 'error' }))
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const createFormData = new FormData()
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          createFormData.append(key, formData[key])
        }
      })

      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString()
      createFormData.append('eventDateTime', dateTime)

      const result = await dispatch(createEvent(createFormData))
      if (result.payload) {
        dispatch(
          showToast({
            message: 'Event created successfully!',
            type: 'success',
          })
        )
        onSuccess?.()
        onClose()
      }
    } catch (error) {
      dispatch(
        showToast({
          message: 'Failed to create event',
          type: 'error',
        })
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="overlay" onClick={onClose} />
      <div className="card relative z-50 max-h-[92vh] w-full max-w-2xl overflow-y-auto !p-0">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-app bg-surface-1 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Create Event</h2>
            <p className="mt-1 text-sm text-text-muted">Schedule and publish a new campus event.</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-icon text-text-muted hover:bg-surface-2 hover:text-text-primary disabled:opacity-50"
            aria-label="Close event creation dialog"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="input-label">Event Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter event name"
              className="input"
            />
          </div>

          <div>
            <label className="input-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
              rows="4"
              className="input"
            />
          </div>

          <div>
            <label className="input-label">Event Type *</label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              className="select"
            >
              <option value="">Select Event Type</option>
              <option value="academic">Academic</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="meetup">Meet & Greet</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">Event Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="input"
              />
            </div>

            <div>
              <label className="input-label">Event Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="input-label">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter event location"
              className="input"
            />
          </div>

          <div>
            <label className="input-label">Max Participants (Optional)</label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              placeholder="Leave blank for unlimited"
              className="input"
            />
          </div>

          <div>
            <label className="input-label">Event Image (Optional)</label>
            <div className="cursor-pointer rounded-input border-2 border-dashed border-border-app bg-surface-2 p-6 text-center transition hover:border-primary/60">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageSelect}
                className="hidden"
                id="eventImage"
              />
              <label htmlFor="eventImage" className="cursor-pointer">
                <CloudArrowUpIcon className="mx-auto mb-2 h-12 w-12 text-text-muted" />
                <p className="text-sm text-text-secondary">
                  {imageName || 'Click to upload event image'}
                </p>
                <p className="mt-1 text-xs text-text-muted">JPG, PNG, or WebP</p>
              </label>
            </div>
          </div>

          <div>
            <label className="input-label">Status</label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center text-sm text-text-secondary">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 border-border-app text-primary focus:ring-primary/30"
                />
                <span>Draft</span>
              </label>
              <label className="flex items-center text-sm text-text-secondary">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 border-border-app text-primary focus:ring-primary/30"
                />
                <span>Published</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 border-t border-border-app pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventCreationForm
