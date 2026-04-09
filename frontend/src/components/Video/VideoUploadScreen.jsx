import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uploadVideo } from '@/store/slices/videoSlice'
import { showToast } from '@/store/slices/notificationSlice'
import { fetchClasses } from '@/store/slices/dashboardSlice'
import { 
  CloudUpload, 
  FileVideo, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  X
} from 'lucide-react'

const VideoUploadScreen = ({ onClose }) => {
  const dispatch = useDispatch()
  const { loading, uploadProgress, error } = useSelector((state) => state.video)
  const { classes = [], classesLoading } = useSelector((state) => state.dashboard)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    classId: '',
    file: null,
    thumbnail: null,
    status: 'published',
  })
  
  const [fileName, setFileName] = useState('')
  const [thumbnailName, setThumbnailName] = useState('')
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  const supportedFormats = ['mp4', 'webm', 'mov', 'avi', 'mkv']
  const maxFileSize = 500 * 1024 * 1024 // 500 MB

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    processFile(file, type)
  }

  const processFile = (file, type) => {
    if (type === 'video') {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      if (!supportedFormats.includes(fileExtension)) {
        dispatch(showToast({
          message: `Unsupported format. Supported: ${supportedFormats.join(', ')}`,
          type: 'error',
        }))
        return
      }

      if (file.size > maxFileSize) {
        dispatch(showToast({
          message: 'File size exceeds 500 MB limit',
          type: 'error',
        }))
        return
      }

      setFormData(prev => ({ ...prev, file }))
      setFileName(file.name)
    } else if (type === 'thumbnail') {
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(file.name.split('.').pop().toLowerCase())) {
        dispatch(showToast({
          message: 'Thumbnail must be JPG, PNG, or WebP',
          type: 'error',
        }))
        return
      }

      setFormData(prev => ({ ...prev, thumbnail: file }))
      setThumbnailName(file.name)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], 'video')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      dispatch(showToast({ message: 'Title is required', type: 'error' }))
      return
    }
    if (!formData.file) {
      dispatch(showToast({ message: 'Video file is required', type: 'error' }))
      return
    }
    if (!formData.classId) {
      dispatch(showToast({ message: 'Please select a class', type: 'error' }))
      return
    }

    const videoData = new FormData()
    videoData.append('title', formData.title)
    videoData.append('description', formData.description)
    videoData.append('subject', formData.subject)
    videoData.append('classId', formData.classId)
    videoData.append('video', formData.file)
    videoData.append('status', formData.status)
    if (formData.thumbnail) {
      videoData.append('thumbnail', formData.thumbnail)
    }

    try {
      const resultAction = await dispatch(uploadVideo(videoData))
      if (uploadVideo.fulfilled.match(resultAction)) {
        dispatch(showToast({ message: 'Video uploaded successfully!', type: 'success' }))
        if (onClose) onClose()
        setFormData({
            title: '',
            description: '',
            subject: '',
            classId: '',
            file: null,
            thumbnail: null,
            status: 'published',
        })
        setFileName('')
        setThumbnailName('')
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Upload failed', type: 'error' }))
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1220] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CloudUpload className="text-blue-400" />
                Upload Course Video
              </h2>
              <p className="text-slate-400 text-sm mt-1">Share knowledge with your students</p>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form Data */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Video Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Introduction to Quantum Physics"
                    className="premium-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what students will learn..."
                    rows="4"
                    className="premium-input w-full resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                    <input 
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g. Physics"
                      className="premium-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Target Class</label>
                    <div className="relative">
                      <select
                        name="classId"
                        value={formData.classId}
                        onChange={handleInputChange}
                        className="premium-input w-full appearance-none"
                        required
                      >
                        <option value="" className="bg-[#0B1220]">Select Class</option>
                        {classes && Array.isArray(classes) && classes.map((cls) => (
                          <option key={cls._id} value={cls._id} className="bg-[#0B1220]">
                            {cls.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <Loader2 className={`w-4 h-4 animate-spin ${classesLoading ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Upload Areas */}
              <div className="space-y-6">
                {/* Video Dropzone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Video File</label>
                  <div 
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center group cursor-pointer
                      ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'}
                      ${fileName ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('video-input').click()}
                  >
                    <input 
                      id="video-input"
                      type="file" 
                      className="hidden" 
                      accept={supportedFormats.map(f => `.${f}`).join(',')}
                      onChange={(e) => handleFileSelect(e, 'video')}
                    />
                    
                    {fileName ? (
                      <>
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-white font-medium truncate max-w-full">{fileName}</p>
                        <p className="text-emerald-400/80 text-xs mt-1">Ready for upload</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FileVideo className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-white font-medium">Click or drag video to upload</p>
                        <p className="text-slate-500 text-xs mt-1">MP4, WebM, MOV up to 500MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Thumbnail Dropzone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail (Optional)</label>
                  <div 
                    className={`relative border-2 border-dashed rounded-xl p-6 transition-all flex items-center gap-4 group cursor-pointer
                      ${thumbnailName ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'}`}
                    onClick={() => document.getElementById('thumb-input').click()}
                  >
                    <input 
                      id="thumb-input"
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, 'thumbnail')}
                    />
                    
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${thumbnailName ? 'bg-emerald-500/20' : 'bg-white/5 group-hover:bg-blue-500/10'}`}>
                      <ImageIcon className={`w-6 h-6 ${thumbnailName ? 'text-emerald-400' : 'text-slate-400 group-hover:text-blue-400'}`} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white font-medium truncate">
                        {thumbnailName || 'Select Preview Image'}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">JPG, PNG or WebP</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{typeof error === 'string' ? error : 'An error occurred during upload'}</p>
              </div>
            )}

            {/* Progress Bar */}
            {loading && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-400 font-medium flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading video...
                  </span>
                  <span className="text-white">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 flex items-center justify-end gap-4">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading || classesLoading}
                className={`premium-button flex items-center gap-2 px-10
                  ${(loading || classesLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-5 h-5" />
                    Publish Video
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VideoUploadScreen
