import React from 'react'

/**
 * PageSkeleton Component
 * Premium loading placeholder for page transitions
 * Features:
 * - Shimmering animation effect
 * - Layout matching the standardized PageHeader + Content structure
 * - Unified with the "Deep Dark" design system
 */
const PageSkeleton = () => {
  return (
    <div className="page-container animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-border-app/50">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface-2 rounded-xl" />
            <div className="h-8 w-48 bg-surface-2 rounded-lg" />
          </div>
          <div className="h-4 w-72 bg-surface-2/50 rounded-lg ml-16" />
        </div>
        <div className="h-10 w-32 bg-surface-2 rounded-pill" />
      </div>

      {/* Content Skeleton Grid */}
      <div className="space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface-1 rounded-card border border-border-app/50 p-6 space-y-3">
              <div className="h-4 w-24 bg-surface-2 rounded" />
              <div className="h-8 w-16 bg-surface-2 rounded" />
            </div>
          ))}
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-surface-1 rounded-card border border-border-app/50" />
          <div className="h-96 bg-surface-1 rounded-card border border-border-app/50" />
        </div>

        {/* Wide Section */}
        <div className="h-64 bg-surface-1 rounded-card border border-border-app/50" />
      </div>

      {/* Custom Shimmer Pattern */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .7; }
        }
      `}} />
    </div>
  )
}

export default PageSkeleton
