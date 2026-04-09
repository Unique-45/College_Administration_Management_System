import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateWatchProgress } from '@/store/slices/videoSlice'
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
  FastForward,
  Rewind,
  ChevronDown
} from 'lucide-react'

const VideoPlayer = ({ video, onClose }) => {
  const dispatch = useDispatch()
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)

  const controlsTimeoutRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const handleTimeUpdate = () => {
      setCurrentTime(v.currentTime)
      if (Math.floor(v.currentTime) % 10 === 0) {
        dispatch(updateWatchProgress(video._id, Math.floor(v.currentTime)))
      }
    }

    const handleLoadedMetadata = () => setDuration(v.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleWaiting = () => setIsBuffering(true)
    const handlePlaying = () => setIsBuffering(false)

    v.addEventListener('timeupdate', handleTimeUpdate)
    v.addEventListener('loadedmetadata', handleLoadedMetadata)
    v.addEventListener('play', handlePlay)
    v.addEventListener('pause', handlePause)
    v.addEventListener('waiting', handleWaiting)
    v.addEventListener('playing', handlePlaying)

    return () => {
      v.removeEventListener('timeupdate', handleTimeUpdate)
      v.removeEventListener('loadedmetadata', handleLoadedMetadata)
      v.removeEventListener('play', handlePlay)
      v.removeEventListener('pause', handlePause)
      v.removeEventListener('waiting', handleWaiting)
      v.removeEventListener('playing', handlePlaying)
    }
  }, [dispatch, video._id])

  const handlePlayPause = () => {
    if (videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play()
    }
  }

  const handleSeek = (amount) => {
    if (videoRef.current) videoRef.current.currentTime += amount
  }

  const handleMute = () => {
    if (videoRef.current) {
      const newMute = !isMuted
      videoRef.current.muted = newMute
      setIsMuted(newMute)
    }
  }

  const handleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-0 md:p-8 animate-fade-in">
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl aspect-video rounded-none md:rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 group"
        onMouseMove={showControlsTemporarily}
        onClick={handlePlayPause}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 right-6 text-white/40 hover:text-white z-50 p-2 rounded-full hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <X className="h-8 w-8" />
        </button>

        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
             <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        <video
          ref={videoRef}
          src={video.videoUrl || video.url}
          className="w-full h-full object-contain cursor-pointer"
          playsInline
          autoPlay
        />

        {/* Big Central Play Button (Only when paused) */}
        {!isPlaying && !isBuffering && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center animate-pulse">
                 <Play className="w-10 h-10 text-white fill-current ml-1" />
              </div>
           </div>
        )}

        {/* Controls Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-20 transition-all duration-500 ease-in-out ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar Container */}
          <div className="relative group/progress h-10 flex items-center mb-4">
             <input
               type="range"
               min="0"
               max={duration || 0}
               value={currentTime}
               onChange={(e) => {
                 const time = parseFloat(e.target.value)
                 setCurrentTime(time)
                 if (videoRef.current) videoRef.current.currentTime = time
               }}
               className="seek-slider w-full h-1 bg-white/20 rounded-full cursor-pointer appearance-none group-hover/progress:h-2 transition-all"
               style={{
                 background: `linear-gradient(to right, #2563EB 0%, #2563EB ${(currentTime / (duration || 1)) * 100}%, transparent ${(currentTime / (duration || 1)) * 100}%)`,
               }}
             />
             <div 
               className="absolute -top-8 bg-surface-1 border border-border-app px-2 py-1 rounded text-[10px] font-bold text-text-primary hidden group-hover/progress:block"
               style={{ left: `${(currentTime / (duration || 1)) * 100}%`, transform: 'translateX(-50%)' }}
             >
               {formatTime(currentTime)}
             </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={handlePlayPause} className="text-white hover:text-primary transition-colors">
                {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current" />}
              </button>

              <div className="flex items-center gap-4">
                 <button onClick={() => handleSeek(-10)} className="text-white/60 hover:text-white transition-colors">
                    <Rewind className="h-5 w-5 fill-current" />
                 </button>
                 <button onClick={() => handleSeek(10)} className="text-white/60 hover:text-white transition-colors">
                    <FastForward className="h-5 w-5 fill-current" />
                 </button>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleMute} className="text-white/60 hover:text-white transition-colors">
                  {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </button>
                <div className="w-20 group/vol relative h-1 bg-white/20 rounded-full hidden md:block">
                   <div className="absolute h-full bg-white rounded-full" style={{ width: `${volume * 100}%` }} />
                   <input
                     type="range"
                     min="0" max="1" step="0.1"
                     value={volume}
                     onChange={(e) => {
                       const v = parseFloat(e.target.value)
                       setVolume(v)
                       if (videoRef.current) videoRef.current.volume = v
                     }}
                     className="absolute inset-0 opacity-0 cursor-pointer"
                   />
                </div>
              </div>

              <span className="text-[12px] font-black text-white/40 tracking-widest hidden sm:block">
                {formatTime(currentTime)} <span className="mx-2 text-white/10">/</span> {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden lg:flex flex-col items-start">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Learning Speed</p>
                 <div className="flex gap-3">
                    {[1, 1.25, 1.5, 2].map(speed => (
                       <button 
                         key={speed}
                         onClick={() => { setPlaybackSpeed(speed); if (videoRef.current) videoRef.current.playbackRate = speed; }}
                         className={`text-[10px] font-black transition-colors ${playbackSpeed === speed ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                       >
                          {speed}x
                       </button>
                    ))}
                 </div>
              </div>
              
              <button onClick={handleFullscreen} className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4 flex items-end justify-between">
             <div className="max-w-2xl px-2">
                <h2 className="text-white text-xl font-bold font-heading group-hover:text-glow-primary transition-all line-clamp-1">{video.title}</h2>
                <div className="flex items-center gap-4 mt-2">
                   <span className="bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">PRO ACADEMY</span>
                   <span className="text-white/40 text-[10px] font-bold italic">{video.description?.slice(0, 100)}...</span>
                </div>
             </div>
             <div className="hidden md:flex gap-2">
                <button className="p-3 rounded-full bg-white/5 border border-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
                   <Settings className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
