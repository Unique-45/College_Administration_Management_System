import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'

const ReportsAnalyticsView = ({ onGenerateReport, userRole }) => {
  const [reportType, setReportType] = useState('video')
  const [reportPeriod, setReportPeriod] = useState('last30days')

  const { reports = [] } = useSelector((state) => state.dashboard)
  const {
    summary,
    trendData,
    videos,
    engagementBreakdown,
    peakTimeHeatmap,
    peakWatchSummary,
    hourlyWatchBreakdown,
    attendanceSummary,
    attendanceByClass,
    chronicAbsentees,
    revenueSummary,
    availableReports,
    generatedReport,
    usingFallbackData,
  } = useSelector((state) => state.analytics)

  const reportItems = [
    {
      title: 'Total Views',
      value: (summary.totalViews || 0).toLocaleString(),
      icon: ArrowTrendingUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Watch Time',
      value: `${(summary.totalWatchTime || 0).toLocaleString()} min`,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Students',
      value: (summary.activeStudents || 0).toLocaleString(),
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Engagement Rate',
      value: `${summary.engagementRate || 0}%`,
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  const topVideos = videos.slice(0, 5)
  const classAttendance = attendanceByClass.slice(0, 6)
  const pieColors = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444', '#7c3aed']
  const reportsCatalog = useMemo(() => {
    if (Array.isArray(availableReports) && availableReports.length > 0) {
      return availableReports
    }

    return [
      { id: 'video', name: 'Video Performance Report' },
      { id: 'engagement', name: 'Student Engagement Report' },
      { id: 'attendance', name: 'Attendance Report' },
      { id: 'comprehensive', name: 'Comprehensive Report' },
    ]
  }, [availableReports])

  const getHeatColor = (value) => {
    if (value >= 40) return 'bg-blue-700 text-white'
    if (value >= 30) return 'bg-blue-500 text-white'
    if (value >= 20) return 'bg-blue-300 text-blue-900'
    if (value >= 10) return 'bg-blue-100 text-blue-900'
    return 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Reports & Analytics</h2>
      {usingFallbackData && (
        <p className="text-sm text-amber-600 mb-4">
          Analytics API is unavailable, showing fallback data for now.
        </p>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportItems.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${item.bgColor} mr-4`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Viewership Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="activeStudents" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Watched Videos</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVideos} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="title" width={140} />
                <Tooltip />
                <Bar dataKey="views" fill="#2563eb" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagementBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {engagementBreakdown.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Peak Viewing Time Heatmap</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-500">
              <span>Day</span>
              <span>08-12</span>
              <span>12-16</span>
              <span>16-20</span>
              <span>20-24</span>
            </div>
            {peakTimeHeatmap.map((row) => (
              <div key={row.day} className="grid grid-cols-5 gap-2">
                <span className="text-sm font-medium text-gray-700">{row.day}</span>
                {row.slots.map((value, idx) => (
                  <span
                    key={`${row.day}-${idx}`}
                    className={`rounded-md px-2 py-1 text-center text-xs font-semibold ${getHeatColor(value)}`}
                  >
                    {value}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Peak Watch-Time Insights</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-xs text-gray-500">Peak Hour</p>
              <p className="text-xl font-semibold text-gray-900">{peakWatchSummary.hour}</p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-xs text-gray-500">Views In Peak Hour</p>
              <p className="text-xl font-semibold text-gray-900">{peakWatchSummary.viewCount}</p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-xs text-gray-500">Unique Viewers</p>
              <p className="text-xl font-semibold text-gray-900">{peakWatchSummary.viewerCount}</p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-xs text-gray-500">Avg Views / Viewer</p>
              <p className="text-xl font-semibold text-gray-900">{peakWatchSummary.averageViewsPerViewer}</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyWatchBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hourLabel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="viewCount" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Analytics</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-xs text-gray-500">Overall Attendance</p>
              <p className="text-lg font-semibold text-gray-900">
                {attendanceSummary.overallAttendancePercentage || 0}%
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-xs text-gray-500">Total Present</p>
              <p className="text-lg font-semibold text-gray-900">{attendanceSummary.totalPresent || 0}</p>
            </div>
            <div className="rounded-lg bg-white p-3 border border-gray-200">
              <p className="text-xs text-gray-500">Total Absent</p>
              <p className="text-lg font-semibold text-gray-900">{attendanceSummary.totalAbsent || 0}</p>
            </div>
          </div>

          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="className" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendancePercentage" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Chronic Absentees</p>
            <div className="space-y-2 max-h-28 overflow-y-auto">
              {chronicAbsentees.length > 0 ? (
                chronicAbsentees.slice(0, 5).map((student) => (
                  <div
                    key={student.studentId || student.studentName}
                    className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
                  >
                    <p className="text-sm text-gray-700">{student.studentName || 'Unknown Student'}</p>
                    <span className="text-xs font-semibold text-red-600">
                      {student.attendancePercentage || 0}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No chronic absentee records available.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Analytics</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-white p-3 border border-gray-200">
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(revenueSummary.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 border border-gray-200">
                <p className="text-xs text-gray-500">Pending Fees</p>
                <p className="text-lg font-semibold text-gray-900">
                  {(revenueSummary.pendingFees || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueSummary.paymentTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods Distribution</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueSummary.paymentsByMethod || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    dataKey="amount"
                    nameKey="method"
                    label
                  >
                    {(revenueSummary.paymentsByMethod || []).map((entry, index) => (
                      <Cell key={`method-${entry.method || index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Analytics Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={reportType}
            onChange={(event) => setReportType(event.target.value)}
          >
            {reportsCatalog.map((report) => (
              <option key={report.id} value={report.id}>
                {report.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={reportPeriod}
            onChange={(event) => setReportPeriod(event.target.value)}
          >
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="custom">Custom Window</option>
          </select>

          <button
            type="button"
            onClick={() => onGenerateReport?.(reportType, reportPeriod)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Generate Report
          </button>
        </div>

        {generatedReport && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            <p className="font-semibold">{generatedReport.title || 'Report generated successfully'}</p>
            <p>Type: {generatedReport.type || reportType}</p>
            <p>Generated At: {generatedReport.generatedAt || 'Just now'}</p>
          </div>
        )}
      </div>

      {/* Recent Reports */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {reports.length > 0 ? (
            reports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{report.title}</p>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
                <span className="text-sm text-gray-500">{report.date}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No reports available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsAnalyticsView