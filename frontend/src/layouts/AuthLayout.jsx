/**
 * Auth Layout
 * Premium branded layout for authentication pages
 * No navigation or sidebar — clean branded entry
 */

import { Outlet } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-app flex">
      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-premium lg:flex lg:w-[48%]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.28),transparent_42%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.18),transparent_36%)]" />

        <div className="relative z-10 max-w-lg px-12 text-center text-white">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="mb-4 font-heading text-4xl font-semibold tracking-tight">
            CampusFlow
          </h1>
          <p className="text-lg leading-relaxed text-white/80">
            Enterprise administration platform for colleges. Manage academics, attendance, payments,
            events, and video operations in one secure workspace.
          </p>

          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-white/60">
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

      <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-gradient-premium">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-heading text-xl font-semibold text-text-primary">CampusFlow</h1>
          </div>

          <div className="card p-6 sm:p-7">
            {children || <Outlet />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
