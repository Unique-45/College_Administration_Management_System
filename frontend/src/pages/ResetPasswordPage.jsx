/**
 * Reset Password Page — Premium Dark Theme
 */

import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { authService } from '@/services'
import { validate } from '@/utils/validation'
import toast from 'react-hot-toast'
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'

const ResetPasswordPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const passwordValidation = validate.password(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.feedback
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('Please fix the errors above')
      return
    }

    setIsLoading(true)
    try {
      await authService.resetPassword(token, formData.password)
      setSubmitted(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password. The link may have expired.'
      setErrors({ submit: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary font-heading">Password reset complete</h2>
        <p className="mt-2 text-sm text-text-muted">
          Your password has been successfully reset. You can now use your new password to sign in.
        </p>
        <div className="mt-8">
          <Link to="/login" className="btn-primary w-full py-3">
            Sign in to your account
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary font-heading">Set new password</h2>
        <p className="mt-2 text-sm text-text-muted">
          Your new password must be different from previous used passwords.
        </p>
      </div>

      {errors.submit && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-input flex gap-3">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
          <p className="text-sm font-medium text-danger">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Password */}
        <div>
          <label htmlFor="password" className="input-label">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              className={`${errors.password ? 'input-error' : 'input'} pl-10 pr-10`}
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="input-error-text">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="input-label">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className={`${errors.confirmPassword ? 'input-error' : 'input'} pl-10`}
              placeholder="Repeat new password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
          {errors.confirmPassword && <p className="input-error-text">{errors.confirmPassword}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            'Reset password'
          )}
        </button>

        <div className="text-center">
          <Link to="/login" className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ResetPasswordPage
