import React from 'react'
import { useSelector } from 'react-redux'
import { Server, Cpu, Wifi, Database, Activity, CheckCircle2 } from 'lucide-react'

const SystemHealthMonitor = () => {
  const { stats = {} } = useSelector((state) => state.dashboard)

  const systemMetrics = [
    {
      name: 'Server Cluster',
      status: 'Operational',
      value: 98,
      icon: Server,
      color: 'text-success',
      bg: 'bg-success/10',
      details: 'Node-01, Node-02 active'
    },
    {
      name: 'CPU Resources',
      status: 'Balanced',
      value: 42,
      icon: Cpu,
      color: 'text-primary',
      bg: 'bg-primary/10',
      details: 'Average across 8 cores'
    },
    {
      name: 'Network Latency',
      status: 'Excellent',
      value: 12,
      icon: Wifi,
      color: 'text-accent',
      bg: 'bg-accent/10',
      details: '14ms avg response time'
    },
    {
      name: 'Database Health',
      status: 'Syncing',
      value: 100,
      icon: Database,
      color: 'text-info',
      bg: 'bg-info/10',
      details: 'All shards synchronized'
    }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-text-primary font-heading">System Infrastructure</h2>
          <p className="text-sm text-text-muted mt-1">Real-time health telemetry from cloud cluster</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-success/10 text-success text-xs font-bold uppercase tracking-wider animate-pulse">
          <Activity className="w-3.5 h-3.5" />
          Live Monitoring
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <div key={index} className="p-4 rounded-xl bg-surface-2 border border-border-app/50 hover:border-primary/30 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${metric.bg} ${metric.color}`}>
                <metric.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col items-end">
                 <span className={`text-[10px] font-bold uppercase tracking-widest ${metric.color}`}>{metric.status}</span>
                 <span className="text-lg font-bold text-text-primary mt-0.5">
                   {metric.name === 'Network Latency' ? `${metric.value}ms` : `${metric.value}%`}
                 </span>
              </div>
            </div>
            
            {/* Simple sparkline-like progress bar */}
            <div className="h-1.5 w-full bg-surface-3 rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full opacity-80 group-hover:opacity-100 transition-all duration-1000 ease-out`}
                style={{ 
                  width: `${metric.value}%`,
                  backgroundColor: metric.color.includes('primary') ? '#2563EB' : metric.color.includes('success') ? '#22C55E' : metric.color.includes('accent') ? '#14B8A6' : '#38BDF8'
                }}
              />
            </div>
            
            <p className="text-[10px] text-text-muted leading-relaxed italic">{metric.details}</p>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 p-5 bg-gradient-to-r from-success/10 via-surface-2 to-surface-2 border border-success/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center border border-success/30 shadow-glow-success">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">All Systems Green</h4>
            <p className="text-xs text-text-muted mt-0.5">Automated snapshots confirm operational excellence across all regions.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-center sm:text-right">
           <div className="hidden lg:block">
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Uptime</p>
              <p className="text-sm font-bold text-text-primary">99.98%</p>
           </div>
           <div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Last Check</p>
              <p className="text-sm font-bold text-text-primary">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
           </div>
           <button className="btn-secondary btn-sm px-6">Diagnostics</button>
        </div>
      </div>
    </div>
  )
}

export default SystemHealthMonitor