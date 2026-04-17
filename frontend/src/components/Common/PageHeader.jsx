/**
 * Page Header Component
 * Consistent page-level header with title, description, breadcrumb, and actions
 */

import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

const PageHeader = ({ title, description, subtitle, breadcrumbs = [], actions, icon: Icon, children }) => {
  const resolvedDescription = description || subtitle

  return (
    <div className="page-header animate-fade-in">
      {breadcrumbs.length > 0 && (
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors">
            <Home className="w-3.5 h-3.5" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 separator text-text-muted/40" />
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-primary transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text-secondary">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-input border border-border-app bg-surface-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <h1 className="page-title">{title}</h1>
          </div>
          {resolvedDescription && <p className="page-description">{resolvedDescription}</p>}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export default PageHeader
