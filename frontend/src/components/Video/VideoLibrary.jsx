import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideos, deleteVideo, setFilters } from '@/store/slices/videoSlice'
import { fetchClasses } from '@/store/slices/dashboardSlice'
import { showToast } from '@/store/slices/notificationSlice'
import { PageSkeleton } from '@/components/Common/LoadingSpinner'
import {
  Trash2,
  Edit3,
  Search,
  Eye,
  PlayCircle,
  Clock,
  Filter,
  MoreVertical,
  Plus,
  Video,
  Layers,
  Calendar
} from 'lucide-react'

const VideoLibrary = () => {
  const dispatch = useDispatch()
  const { videos = [], loading, filters } = useSelector((state) => state.video)
  const { classes = [] } = useSelector((state) => state.dashboard)
  const [searchInput, setSearchInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid or table

  useEffect(() => {
    dispatch(fetchVideos(filters))
  }, [dispatch, filters])

  useEffect(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchInput(value)
    dispatch(setFilters({ searchTerm: value }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    dispatch(setFilters({ [name]: value }))
  }

  const handleDelete = async (videoId) => {
    try {
      await dispatch(deleteVideo(videoId))
      dispatch(showToast({ message: 'Video resource decommissioned', type: 'success' }))
      setDeleteConfirm(null)
    } catch (_err) {
      dispatch(showToast({ message: 'Failed to delete video', type: 'error' }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading && videos.length === 0) return <PageSkeleton />

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-text-primary font-heading">Content Repository</h1>
           <p className="text-sm text-text-muted mt-1 italic flex items-center gap-1">
             <Video className="w-3.5 h-3.5" />
             Managing {videos.length} academic video assets across multiple subjects
           </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-surface-2 p-1 rounded-btn border border-border-app items-center">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-glow-primary/20' : 'text-text-muted hover:text-text-secondary'}`}
              >
                 <PlayCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary text-white shadow-glow-primary/20' : 'text-text-muted hover:text-text-secondary'}`}
              >
                 <Layers className="w-4 h-4" />
              </button>
           </div>
           <button className="btn-primary flex items-center gap-2 px-6">
              <Plus className="w-4 h-4" />
              New Resource
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="card !p-4 bg-surface-1/50 backdrop-blur-sm border-primary/10 shadow-glow-primary/5 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
           <input
             type="text"
             placeholder="Search by title, teacher, or keywords..."
             value={searchInput}
             onChange={handleSearch}
             className="input pl-10 w-full !bg-surface-2/60 border-none focus:ring-1 focus:ring-primary/40"
           />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
           <div className="relative flex-1 lg:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <select
                name="subject"
                value={filters.subject || ''}
                onChange={handleFilterChange}
                className="select pl-8 py-2 w-full !bg-surface-2/60 border-none text-xs font-bold"
              >
                <option value="">Filter Subjects</option>
                {['Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Biology'].map(sub => (
                  <option key={sub} value={sub.toLowerCase()}>{sub}</option>
                ))}
              </select>
           </div>

           <div className="relative flex-1 lg:w-48">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <select
                name="classId"
                value={filters.classId || ''}
                onChange={handleFilterChange}
                className="select pl-8 py-2 w-full !bg-surface-2/60 border-none text-xs font-bold"
              >
                <option value="">Target Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
           </div>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="empty-state py-24 bg-surface-1 rounded-2xl border border-dashed border-border-app">
          <div className="w-20 h-20 bg-surface-2 rounded-full flex items-center justify-center mb-6">
             <Video className="w-10 h-10 text-text-muted/30" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No videos discovered</h3>
          <p className="text-sm text-text-muted mb-8 max-w-sm">
             Begin building your academic library by uploading your first instructional resource.
          </p>
          <button className="btn-secondary flex items-center gap-2">
             <Plus className="w-4 h-4" />
             Upload First Video
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="group card !p-0 overflow-hidden hover:shadow-glow-primary/10 transition-all border-border-app transform hover:-translate-y-1">
               <div className="relative aspect-video overflow-hidden bg-surface-3">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                       <PlayCircle className="w-12 h-12 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                     <span className="badge badge-primary bg-primary/20 backdrop-blur-md border-primary/30 text-[10px] py-0.5 shadow-lg">
                        {video.duration || '12:45'}
                     </span>
                     <div className="flex gap-1.5 translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                        <button className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 transition-all">
                           <Edit3 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(video._id)}
                          className="p-2 rounded-full bg-danger/10 backdrop-blur-md hover:bg-danger/80 text-white border border-danger/20 transition-all"
                        >
                           <Trash2 className="w-3 h-3" />
                        </button>
                     </div>
                  </div>
                  
                  {deleteConfirm === video._id && (
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-fade-in z-10">
                       <p className="text-xs font-bold text-white mb-4">Decommission this resource permanentely?</p>
                       <div className="flex gap-2">
                          <button onClick={() => handleDelete(video._id)} className="bg-danger text-white px-4 py-1.5 rounded-btn text-[10px] font-black tracking-widest hover:bg-danger-hover transition-colors">CONFIRM</button>
                          <button onClick={() => setDeleteConfirm(null)} className="bg-white/10 text-white px-4 py-1.5 rounded-btn text-[10px] font-bold hover:bg-white/20 transition-colors">CANCEL</button>
                       </div>
                    </div>
                  )}
               </div>

               <div className="p-4 bg-surface-1/50 backdrop-blur-md relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                     <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors truncate" title={video.title}>
                           {video.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted font-bold tracking-tight">
                           <span className="flex items-center gap-1 uppercase">
                              <Layers className="w-3 h-3 opacity-60" />
                              {video.subject || 'UNASSIGNED'}
                           </span>
                           <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3 opacity-60" />
                              {video.viewCount || 0}
                           </span>
                        </div>
                     </div>
                     <button className="text-text-muted hover:text-text-primary p-1">
                        <MoreVertical className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-border-app/50 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-surface-3 flex items-center justify-center text-[8px] font-bold text-text-muted ring-1 ring-border-app">
                           {(video.teacherName || 'T')[0]}
                        </div>
                        <span className="text-[10px] font-semibold text-text-muted truncate max-w-[80px]">{(video.teacherName || 'System Admin')}</span>
                     </div>
                     <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3 opacity-40" />
                        {new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden shadow-glow-primary/5">
           <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Asset Profile</th>
                    <th>Classification</th>
                    <th>Target Cohort</th>
                    <th>Visibility</th>
                    <th>Engagement</th>
                    <th className="text-right">Administration</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video._id} className="group hover:bg-surface-2/50 transition-all cursor-pointer">
                      <td>
                        <div className="flex items-center gap-3">
                           <div className="w-14 aspect-video rounded-lg bg-surface-3 overflow-hidden border border-border-app flex-shrink-0">
                              {video.thumbnail ? (
                                <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                   <Video className="w-4 h-4 text-text-muted/30" />
                                </div>
                              )}
                           </div>
                           <div className="min-w-0">
                              <p className="font-bold text-text-primary truncate max-w-[200px]">{video.title}</p>
                              <p className="text-[10px] text-text-muted flex items-center gap-2 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDate(video.createdAt)}
                              </p>
                           </div>
                        </div>
                      </td>
                      <td>
                         <span className="text-[10px] font-black text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded-full">{video.subject || '-'}</span>
                      </td>
                      <td>
                         <span className="text-[10px] font-bold text-text-secondary">{video.class || 'All Scholars'}</span>
                      </td>
                      <td>
                         <span className={`badge ${video.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                           {(video.status || 'draft').toUpperCase()}
                         </span>
                      </td>
                      <td>
                         <div className="flex items-center gap-1.5 text-text-muted">
                            <Eye className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{video.viewCount || 0}</span>
                         </div>
                      </td>
                      <td className="text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 rounded-btn bg-surface-3 text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                               <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm(video._id)}
                              className="p-2 rounded-btn bg-surface-3 text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  )
}

export default VideoLibrary
