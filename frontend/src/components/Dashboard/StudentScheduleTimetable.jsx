import React from 'react'
import { useSelector } from 'react-redux'
import { CalendarDaysIcon, ClockIcon, MapPinIcon, AcademicCapIcon } from '@heroicons/react/24/outline'

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const fallbackTimeSlots = ['09:00 - 10:00', '10:30 - 11:30', '12:00 - 13:00', '14:00 - 15:00', '15:30 - 16:30']

const StudentScheduleTimetable = () => {
  const { classes } = useSelector((state) => state.dashboard)

  const schedule = classes.map((cls, index) => {
    const scheduleEntry = Array.isArray(cls.schedule) && cls.schedule.length > 0 ? cls.schedule[0] : null

    return {
      id: cls._id || cls.id || `class-${index}`,
      day: scheduleEntry?.day || weekdays[index % weekdays.length],
      time: scheduleEntry?.time || fallbackTimeSlots[index % fallbackTimeSlots.length],
      subject: cls.subject || 'General Studies',
      classCode: cls.class_code || cls.classCode || 'N/A',
      teacher: cls.teacher_name || cls.teacherName || 'Assigned Faculty',
      room: cls.room || `Room ${101 + index}`,
    }
  })

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Schedule and Timetable</h2>
        <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
      </div>

      {schedule.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AcademicCapIcon className="h-10 w-10 mx-auto mb-3" />
          <p>No classes assigned yet.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 text-gray-600">
                  <th className="py-3 pr-4">Day</th>
                  <th className="py-3 pr-4">Time</th>
                  <th className="py-3 pr-4">Subject</th>
                  <th className="py-3 pr-4">Teacher</th>
                  <th className="py-3 pr-4">Room</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-medium text-gray-900">{item.day}</td>
                    <td className="py-3 pr-4 text-gray-700">{item.time}</td>
                    <td className="py-3 pr-4 text-gray-700">{item.subject}</td>
                    <td className="py-3 pr-4 text-gray-700">{item.teacher}</td>
                    <td className="py-3 pr-4 text-gray-700">{item.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {schedule.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{item.subject}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>{item.day}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>{item.time}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{item.room}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default StudentScheduleTimetable
