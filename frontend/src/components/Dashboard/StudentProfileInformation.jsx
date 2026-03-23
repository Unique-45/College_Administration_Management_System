import React from 'react'
import { useSelector } from 'react-redux'
import { UserCircleIcon, EnvelopeIcon, IdentificationIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return 'ST'
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

const StudentProfileInformation = () => {
  const { user } = useSelector((state) => state.auth)

  const fullName = user?.name || 'Student User'
  const email = user?.email || 'student@example.com'
  const rollNumber = user?.rollNumber || user?.id || 'N/A'
  const avatar = user?.avatar

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        <UserCircleIcon className="h-6 w-6 text-sky-600" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        {avatar ? (
          <img src={avatar} alt={fullName} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold text-lg">
            {getInitials(fullName)}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{fullName}</h3>
          <p className="text-sm text-gray-600 capitalize">{user?.role || 'student'}</p>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <EnvelopeIcon className="h-4 w-4 text-gray-500" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <IdentificationIcon className="h-4 w-4 text-gray-500" />
          <span>Roll Number: {rollNumber}</span>
        </div>
      </div>

      <div className="mt-6">
        <button className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors">
          <Cog6ToothIcon className="h-4 w-4" />
          Account Settings
        </button>
      </div>
    </section>
  )
}

export default StudentProfileInformation
