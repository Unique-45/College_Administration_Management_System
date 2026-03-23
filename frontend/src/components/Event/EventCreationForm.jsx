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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Event</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter event name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <select
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter event location"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Participants (Optional)
            </label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              placeholder="Leave blank for unlimited"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Event Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageSelect}
                className="hidden"
                id="eventImage"
              />
              <label htmlFor="eventImage" className="cursor-pointer">
                <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">
                  {imageName || 'Click to upload event image'}
                </p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WebP</p>
              </label>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Draft</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-gray-700">Published</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
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
