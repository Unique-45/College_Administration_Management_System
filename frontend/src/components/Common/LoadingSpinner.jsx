/**
 * Loading Spinner Component
 * Premium loading indicator with skeleton support
 */

import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ size = 'medium', message = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col justify-center items-center py-12 gap-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.medium} text-primary animate-spin`} />
      {message && <p className="text-sm text-text-muted">{message}</p>}
    </div>
  )
}

/**
 * Full-page loading state with skeleton cards
 */
export const PageSkeleton = () => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="skeleton-text w-48" />
        <div className="skeleton-text-sm w-72" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton rounded-card h-64" />
        <div className="skeleton rounded-card h-64" />
      </div>
    </div>
  )
}

/**
 * Error state with retry action
 */
export const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <div className="empty-state animate-fade-in">
      <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-description">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try again
        </button>
      )}
    </div>
  )
}

export default LoadingSpinner
