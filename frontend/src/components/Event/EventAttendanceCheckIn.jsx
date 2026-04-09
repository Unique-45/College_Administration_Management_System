import React, { useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { checkInAttendee } from '@/store/slices/eventAnalyticsSlice'
import { showToast } from '@/store/slices/notificationSlice'
import { UserCheck, X, Search, QrCode, Users, CheckCircle2, Loader2, Info } from 'lucide-react'

/**
 * EventAttendanceCheckIn - QR/Manual check-in component for event attendees
 * REDESIGNED: Premium Dark Academy Design
 */
const EventAttendanceCheckIn = ({ eventId, attendees = [], onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [checkedInUsers, setCheckedInUsers] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [qrInput, setQrInput] = useState('')
  const [loadingStates, setLoadingStates] = useState({})

  // Filter attendees by search term
  const filteredAttendees = useMemo(() => {
    return attendees.filter((attendee) =>
      `${attendee.name} ${attendee.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  }, [attendees, searchTerm])

  // Calculate check-in statistics
  const checkedInCount = checkedInUsers.size
  const totalCount = attendees.length
  const checkInPercentage = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0

  // Handle QR code input (simulate QR scanning)
  const handleQRInput = (e) => {
    const value = e.target.value.trim()
    if (value) {
      const attendee = attendees.find((a) => a._id === value || a.id === value)
      if (attendee) {
        handleCheckIn(attendee)
        setQrInput('')
      } else {
        dispatch(showToast({ message: 'Invalid QR code', type: 'error' }))
        setQrInput('')
      }
    }
  }

  // Handle check-in for an attendee
  const handleCheckIn = async (attendee) => {
    const attendeeId = attendee._id || attendee.id
    if (checkedInUsers.has(attendeeId)) {
      dispatch(showToast({ message: 'Already checked in', type: 'info' }))
      return
    }

    setLoadingStates((prev) => ({ ...prev, [attendeeId]: true }))

    try {
      await dispatch(
        checkInAttendee({
          eventId,
          userId: attendeeId,
        })
      ).unwrap()

      setCheckedInUsers((prev) => new Set([...prev, attendeeId]))
      dispatch(showToast({ message: `${attendee.name} checked in successfully`, type: 'success' }))

      if (onSuccess) onSuccess()
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Check-in failed', type: 'error' }))
    } finally {
      setLoadingStates((prev) => ({ ...prev, [attendeeId]: false }))
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-surface-1 border border-border-app/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-app/50 bg-surface-2/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
              <UserCheck className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Event Check-In</h2>
              <p className="text-xs text-text-secondary">Scan or verify attendee status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Stats Bar */}
          <div className="bg-surface-2/50 border border-border-app/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-text-secondary flex items-center gap-2">
                <Users className="w-4 h-4" />
                {checkedInCount} of {totalCount} verified
              </span>
              <span className="font-bold text-accent-primary">{checkInPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-primary transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${checkInPercentage}%` }}
              />
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">QR Scan / ID</label>
              <div className="relative">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Focus here & scan..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyUp={handleQRInput}
                  className="w-full bg-surface-2 border border-border-app/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 outline-none transition-all placeholder:text-text-tertiary"
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Quick Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-surface-2 border border-border-app/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 outline-none transition-all placeholder:text-text-tertiary"
                />
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider ml-1">Attendees</h3>
            <div className="space-y-2">
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((attendee) => {
                  const attendeeId = attendee._id || attendee.id
                  const isCheckedIn = checkedInUsers.has(attendeeId)
                  const isLoading = loadingStates[attendeeId]

                  return (
                    <div
                      key={attendeeId}
                      className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                        isCheckedIn
                          ? 'bg-green-500/5 border-green-500/20'
                          : 'bg-surface-2/30 border-border-app/30 hover:bg-surface-2/50 hover:border-border-app/50'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-xs shrink-0 ${
                          isCheckedIn ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-surface-3 border-border-app/50 text-text-secondary'
                        }`}>
                          {attendee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold text-sm truncate ${isCheckedIn ? 'text-green-400' : 'text-text-primary'}`}>
                            {attendee.name}
                          </p>
                          <p className="text-xs text-text-tertiary truncate">{attendee.email}</p>
                          {attendee.rsvpStatus && (
                            <span className="mt-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              RSVP: {attendee.rsvpStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      {isCheckedIn ? (
                        <div className="flex items-center gap-2 text-green-500 shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Verified</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(attendee)}
                          disabled={isLoading}
                          className="px-4 py-1.5 rounded-lg bg-accent-primary text-white text-xs font-bold hover:bg-accent-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-accent-primary/10 active:scale-95"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check In'}
                        </button>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-border-app/20 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center">
                    <Info className="w-6 h-6 text-text-tertiary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-text-secondary font-medium">No attendees found</p>
                    <p className="text-text-tertiary text-xs">Try adjusting your search terms</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-app/50 bg-surface-2/30 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-3 border border-border-app/50 transition-all"
          >
            Cancel Session
          </button>
          <button
            onClick={() => {
              dispatch(showToast({ message: 'Session finalized', type: 'success' }))
              onClose()
            }}
            className="flex-1 py-2 rounded-xl bg-surface-3 text-text-primary text-sm font-semibold hover:bg-surface-4 border border-border-app/50 shadow-sm transition-all"
          >
            End Verification
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventAttendanceCheckIn

