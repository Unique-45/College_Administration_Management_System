import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeToast } from '@/store/slices/notificationSlice'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const NotificationToast = () => {
  const dispatch = useDispatch()
  const { toasts } = useSelector((state) => state.notification)

  const getToastIcon = (type) => {
    const iconProps = 'h-6 w-6'
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconProps} text-green-600`} />
      case 'error':
        return <XCircleIcon className={`${iconProps} text-red-600`} />
      case 'warning':
        return <ExclamationCircleIcon className={`${iconProps} text-yellow-600`} />
      case 'info':
        return <InformationCircleIcon className={`${iconProps} text-blue-600`} />
      default:
        return null
    }
  }

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="fixed bottom-0 right-0 p-6 space-y-3 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          icon={getToastIcon(toast.type)}
          style={getToastStyle(toast.type)}
          onClose={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>
  )
}

const Toast = ({ toast, icon, style, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast, onClose])

  return (
    <div
      className={`border rounded-lg shadow-lg p-4 flex items-start space-x-3 min-w-[300px] max-w-[400px] pointer-events-auto animate-slide-in-up ${style}`}
    >
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}

      <div className="flex-1">
        <p className="font-semibold text-sm">{toast.message}</p>
        {toast.description && (
          <p className="text-xs mt-1 opacity-90">{toast.description}</p>
        )}
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition"
        aria-label="Close"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  )
}

export default NotificationToast
