import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import PageHeader from '@/components/Common/PageHeader'
import { 
  User, 
  Shield, 
  Bell, 
  Settings as SettingsIcon, 
  Mail, 
  Key, 
  Smartphone, 
  Globe,
  Camera,
  CheckCircle2,
  ChevronRight,
  LogOut
} from 'lucide-react'

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeSection, setActiveSection] = useState('profile')

  const sections = [
    { id: 'profile', label: 'Identity & Profile', icon: User },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'notifications', label: 'Alert Preferences', icon: Bell },
    { id: 'system', label: 'System Configuration', icon: SettingsIcon },
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings & Workspace" 
        subtitle="Manage your personal identity, security parameters, and regional preferences"
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-72 space-y-2">
           {sections.map(section => (
             <button
               key={section.id}
               onClick={() => setActiveSection(section.id)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                 activeSection === section.id 
                   ? 'bg-primary/10 border-primary/20 text-primary shadow-glow-primary/5' 
                   : 'bg-surface-2/30 border-transparent text-text-muted hover:bg-surface-2 hover:text-text-secondary'
               }`}
             >
               <section.icon className="w-4 h-4" />
               <span className="text-sm font-bold tracking-tight">{section.label}</span>
               {activeSection === section.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
             </button>
           ))}

           <div className="pt-8 px-2">
              <button className="flex items-center gap-3 text-danger/60 hover:text-danger text-xs font-bold uppercase tracking-widest transition-colors">
                 <LogOut className="w-4 h-4" />
                 Terminate Session
              </button>
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full space-y-6 animate-slide-right">
           {activeSection === 'profile' && (
             <div className="space-y-6">
                {/* User Card */}
                <div className="card !p-8 bg-gradient-to-br from-surface-1 to-surface-2 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <User className="w-32 h-32" />
                   </div>
                   <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                      <div className="relative group">
                         <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-surface-1 shadow-2xl relative overflow-hidden">
                            {user?.avatar ? (
                               <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                               <span className="text-3xl font-black text-primary">{(user?.name || 'U')[0]}</span>
                            )}
                         </div>
                         <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white border-2 border-surface-1 shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                            <Camera className="w-4 h-4" />
                         </button>
                      </div>
                      
                      <div className="text-center md:text-left">
                         <h3 className="text-2xl font-black text-text-primary tracking-tight">{user?.name}</h3>
                         <p className="text-sm text-text-muted mt-1 font-medium italic">{user?.email}</p>
                         <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                            <span className="badge badge-primary px-3 py-1 font-black tracking-widest text-[9px]">{(user?.role || 'STUDENT').toUpperCase()}</span>
                            <span className="badge bg-success/10 text-success border-success/20 px-3 py-1 font-bold text-[9px] flex items-center gap-1">
                               <CheckCircle2 className="w-2.5 h-2.5" />
                               VERIFIED ACCOUNT
                            </span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="card">
                   <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-6 border-b border-border-app pb-4">General Information</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Legal Full Name</label>
                         <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input type="text" defaultValue={user?.name} className="input pl-10 w-full" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Electronic ID (Email)</label>
                         <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input type="email" defaultValue={user?.email} className="input pl-10 w-full bg-surface-2/50" readOnly />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Contact Sequence</label>
                         <div className="relative">
                            <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input type="tel" placeholder="+91 00000 00000" className="input pl-10 w-full" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Regional Locale</label>
                         <div className="relative">
                            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <select className="select pl-10 w-full">
                               <option>English (IN)</option>
                               <option>English (US)</option>
                               <option>Hindi (IN)</option>
                            </select>
                         </div>
                      </div>
                   </div>
                   
                   <div className="mt-10 pt-6 border-t border-border-app flex justify-end gap-3">
                      <button className="btn-secondary">Revert Changes</button>
                      <button className="btn-primary px-8">Update Core Profile</button>
                   </div>
                </div>
             </div>
           )}

           {activeSection === 'security' && (
             <div className="card space-y-8">
                <div>
                   <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-2">Access Control</h3>
                   <p className="text-xs text-text-muted font-medium">Manage your biometric and password authentication protocols</p>
                </div>

                <div className="space-y-4">
                   <div className="p-4 bg-surface-2 rounded-xl border border-border-app/50 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                            <Key className="w-5 h-5" />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-text-primary">Master Password</h4>
                            <p className="text-[10px] text-text-muted mt-0.5 font-medium">Last rotated: 42 days ago</p>
                         </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-all" />
                   </div>

                   <div className="p-4 bg-surface-2 rounded-xl border border-border-app/50 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
                            <Smartphone className="w-5 h-5" />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-text-primary">Two-Factor Authentication</h4>
                            <p className="text-[10px] text-accent mt-0.5 font-black uppercase tracking-widest">ENABLED & ACTIVE</p>
                         </div>
                      </div>
                      <button className="text-[10px] font-black tracking-widest text-text-muted hover:text-danger px-3 py-1 rounded bg-surface-3">DISABLE</button>
                   </div>
                </div>

                <div className="p-4 bg-warning/5 border border-warning/10 rounded-xl">
                   <p className="text-[10px] text-warning font-bold leading-relaxed px-1">
                     <Shield className="w-3 h-3 inline mr-2 align-middle" />
                     SECURITY NOTICE: Any changes to critical access parameters will invalidate existing session tokens across all registered devices.
                   </p>
                </div>
             </div>
           )}

           {activeSection === 'notifications' && (
             <div className="card">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-6 pb-4 border-b border-border-app">Real-time Data Streams</h3>
                <div className="space-y-6">
                   {[
                     { label: 'Academic Alerts', desc: 'New lectures, research papers, and class schedule shifts.', default: true },
                     { label: 'Security Breaches', desc: 'Get notified of unrecognized login attempts instantly.', default: true },
                     { label: 'Event Broadcasts', desc: 'Campus festivals, seminars, and networking opportunity alerts.', default: false },
                     { label: 'Direct Messages', desc: 'Receive instant alerts from faculty and peer collaborations.', default: true },
                   ].map((item, idx) => (
                     <div key={idx} className="flex items-center justify-between py-2">
                        <div className="max-w-md">
                           <p className="text-sm font-bold text-text-primary">{item.label}</p>
                           <p className="text-[10px] text-text-muted font-medium mt-0.5">{item.desc}</p>
                        </div>
                        <div className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${item.default ? 'bg-primary shadow-glow-primary/20' : 'bg-surface-3'}`}>
                           <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${item.default ? 'right-1' : 'left-1'}`} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}
        </main>
      </div>
    </div>
  )
}

export default SettingsPage
