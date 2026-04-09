/**
 * Forgot Password Page — Premium Dark Theme
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '@/services'
import { validate } from '@/utils/validation'
import toast from 'react-hot-toast'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const emailValidation = validate.email(email)
    if (!emailValidation.isValid) {
      setError(emailValidation.feedback)
      toast.error(emailValidation.feedback)
      return
    }

    setIsLoading(true)
    try {
      await authService.forgotPassword(email)
      setSubmitted(true)
      toast.success('Reset link sent to your email!')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset link. Please try again.'
      setError(errorMessage)
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
        <h2 className="text-2xl font-bold text-text-primary font-heading">Check your email</h2>
        <p className="mt-2 text-sm text-text-muted max-w-sm mx-auto">
          We've sent a password reset link to <strong className="text-text-primary">{email}</strong>. 
          Please follow the instructions in the email to reset your password.
        </p>
        <div className="mt-8">
          <Link 
            to="/login" 
            className="btn-primary w-full py-3 inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
        <p className="mt-6 text-sm text-text-muted">
          Didn't receive the email?{' '}
          <button
            onClick={() => {
              setSubmitted(false)
              setEmail('')
            }}
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Try another email
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary font-heading">Reset password</h2>
        <p className="mt-2 text-sm text-text-muted">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-input">
          <p className="text-sm font-medium text-danger">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="input-label">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`${error ? 'input-error' : 'input'} pl-10`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </button>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ForgotPasswordPage
