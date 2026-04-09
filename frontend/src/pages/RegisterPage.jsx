/**
 * Register Page — Premium Dark Theme
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useRedux'
import { authService } from '@/services'
import { setAuth } from '@/store/slices/authSlice'
import { validate } from '@/utils/validation'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, Eye, EyeOff, User, GraduationCap } from 'lucide-react'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, strength: '' })
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (name === 'password' && value) {
      const passwordValidation = validate.password(value)
      setPasswordStrength({
        isValid: passwordValidation.isValid,
        strength: passwordValidation.strength,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const nameValidation = validate.fullName(formData.name)
    if (!nameValidation.isValid) newErrors.name = nameValidation.feedback
    const emailValidation = validate.email(formData.email)
    if (!emailValidation.isValid) newErrors.email = emailValidation.feedback
    const passwordValidation = validate.password(formData.password)
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.feedback
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
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      })
      toast.success('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      setErrors({ submit: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const strengthConfig = {
    weak: { color: 'bg-danger', width: '33%', label: 'Weak', textColor: 'text-danger' },
    medium: { color: 'bg-warning', width: '66%', label: 'Medium', textColor: 'text-warning' },
    strong: { color: 'bg-success', width: '100%', label: 'Strong', textColor: 'text-success' },
  }
  const strength = strengthConfig[passwordStrength.strength] || strengthConfig.weak

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary font-heading">Create your account</h2>
        <p className="mt-2 text-sm text-text-muted">
          Get started with CampusFlow today
        </p>
      </div>

      {errors.submit && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-input">
          <p className="text-sm font-medium text-danger">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="input-label">Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input id="name" name="name" type="text" autoComplete="name" required
              className={`${errors.name ? 'input-error' : 'input'} pl-10`}
              placeholder="John Doe" value={formData.name} onChange={handleInputChange} />
          </div>
          {errors.name && <p className="input-error-text">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="input-label">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input id="email" name="email" type="email" autoComplete="email" required
              className={`${errors.email ? 'input-error' : 'input'} pl-10`}
              placeholder="you@example.com" value={formData.email} onChange={handleInputChange} />
          </div>
          {errors.email && <p className="input-error-text">{errors.email}</p>}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="input-label">Role</label>
          <div className="relative">
            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select id="role" name="role" className="select pl-10"
              value={formData.role} onChange={handleInputChange}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="input-label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input id="password" name="password" type={showPassword ? 'text' : 'password'}
              autoComplete="new-password" required
              className={`${errors.password ? 'input-error' : 'input'} pl-10 pr-10`}
              placeholder="Create a password" value={formData.password} onChange={handleInputChange} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-muted">Password strength</span>
                <span className={`text-xs font-semibold ${strength.textColor}`}>{strength.label}</span>
              </div>
              <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                  style={{ width: strength.width }} />
              </div>
            </div>
          )}
          {errors.password && <p className="input-error-text">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input id="confirmPassword" name="confirmPassword" type="password"
              autoComplete="new-password" required
              className={`${errors.confirmPassword ? 'input-error' : 'input'} pl-10`}
              placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} />
          </div>
          {errors.confirmPassword && <p className="input-error-text">{errors.confirmPassword}</p>}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-2">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
          ) : (
            'Create account'
          )}
        </button>

        <p className="text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
