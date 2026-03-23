import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { VideoCameraIcon, MagnifyingGlassIcon, FunnelIcon, PlayCircleIcon } from '@heroicons/react/24/outline'

const durations = ['08:15', '14:30', '21:45', '11:20', '17:40']

const StudentAvailableVideosList = () => {
  const { classes } = useSelector((state) => state.dashboard)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')

  const videos = useMemo(() => {
    const items = classes.flatMap((cls, classIndex) => {
      if (Array.isArray(cls.videos) && cls.videos.length > 0) {
        return cls.videos.map((video, videoIndex) => ({
          id: video._id || video.id || `video-${classIndex}-${videoIndex}`,
          title: video.title || `Lecture ${videoIndex + 1}`,
          subject: cls.subject || video.subject || 'General Studies',
          classCode: cls.class_code || cls.classCode || 'N/A',
          uploadDate: video.uploadDate || video.createdAt || '2026-03-20',
          duration: video.duration || durations[(classIndex + videoIndex) % durations.length],
        }))
      }

      return [
        {
          id: `video-${classIndex}`,
          title: `${cls.subject || 'General Studies'} - Weekly Revision`,
          subject: cls.subject || 'General Studies',
          classCode: cls.class_code || cls.classCode || 'N/A',
          uploadDate: '2026-03-22',
          duration: durations[classIndex % durations.length],
        },
      ]
    })

    return items
  }, [classes])

  const subjects = ['all', ...new Set(videos.map((video) => video.subject))]

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || video.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Available Videos</h2>
        <VideoCameraIcon className="h-6 w-6 text-blue-600" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search videos..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative sm:w-52">
          <FunnelIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No videos available for the selected filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVideos.map((video) => (
            <article key={video.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">{video.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {video.subject} | {video.classCode}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded: {new Date(video.uploadDate).toLocaleDateString()} | Duration: {video.duration}
                  </p>
                </div>
                <button className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 text-sm font-medium">
                  <PlayCircleIcon className="h-5 w-5" />
                  Watch
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default StudentAvailableVideosList
