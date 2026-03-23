import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateWatchProgress } from '@/store/slices/videoSlice'
import {
  XMarkIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline'

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
  const [quality, setQuality] = useState('auto')
  const [showControls, setShowControls] = useState(true)

  const controlsTimeoutRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)

      // Save progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0) {
        dispatch(updateWatchProgress(video._id, Math.floor(video.currentTime)))
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [dispatch, video._id])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const handleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handlePlaybackSpeed = (speed) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
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

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="w-full max-w-4xl rounded-lg overflow-hidden bg-black"
        onMouseMove={showControlsTemporarily}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>

        {/* Video Player */}
        <video
          ref={videoRef}
          src={video.videoUrl || video.url}
          className="w-full bg-black"
        />

        {/* Controls */}
        <div
          className={`bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1 bg-gray-600 rounded cursor-pointer appearance-none"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                (currentTime / duration) * 100
              }%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`,
            }}
          />

          {/* Control Buttons */}
          <div className="flex items-center justify-between mt-4 text-white">
            <div className="flex items-center space-x-2">
              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                className="hover:bg-gray-700 p-2 rounded transition"
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-1">
                <button onClick={handleMute} className="hover:bg-gray-700 p-2 rounded transition">
                  {isMuted ? (
                    <SpeakerXMarkIcon className="h-6 w-6" />
                  ) : (
                    <SpeakerWaveIcon className="h-6 w-6" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-600 rounded cursor-pointer appearance-none"
                />
              </div>

              {/* Time Display */}
              <span className="ml-2 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* Quality */}
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-gray-700 text-white text-sm px-2 py-1 rounded hover:bg-gray-600 cursor-pointer"
              >
                <option value="auto">Auto</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
              </select>

              {/* Playback Speed */}
              <select
                value={playbackSpeed}
                onChange={(e) => handlePlaybackSpeed(parseFloat(e.target.value))}
                className="bg-gray-700 text-white text-sm px-2 py-1 rounded hover:bg-gray-600 cursor-pointer"
              >
                <option value="0.75">0.75x</option>
                <option value="1">1x (Normal)</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>

              {/* Fullscreen */}
              <button
                onClick={handleFullscreen}
                className="hover:bg-gray-700 p-2 rounded transition"
              >
                {isFullscreen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4H5m0 0v4m0-4l4 4m11-4h4v4m0-4l-4 4M9 20h-4v-4m0 4l4-4m11 4l4-4m0 4v-4" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h4v4m0-4l-5 5M4 20v-4m0 4h4m-4-4l5-5m11 5l-5-5m5 5v4m0-4h-4" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Video Title */}
          <div className="mt-4">
            <h2 className="text-white text-lg font-semibold">{video.title}</h2>
            <p className="text-gray-300 text-sm mt-1">{video.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
