/**
 * Auth Layout
 * Premium branded layout for authentication pages
 * No navigation or sidebar — clean branded entry
 */

import { Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-app flex">
      {/* Left — Branding Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-premium relative overflow-hidden items-center justify-center">
        {/* Decorative circles */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-8">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white font-heading mb-4">
            CampusFlow
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            A modern administration platform for colleges. Manage students, attendance, payments, and more — all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6 text-white/50 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">500+</p>
              <p>Students</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">50+</p>
              <p>Teachers</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p>Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-gradient-premium rounded-btn flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-text-primary font-heading">CampusFlow</h1>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
