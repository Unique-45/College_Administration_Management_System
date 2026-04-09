import React, { useMemo, useState } from 'react'
import { Download, Search, Filter, Calendar, FileText, ChevronRight, IndianRupee } from 'lucide-react'

const statusThemes = {
  success: 'badge-success shadow-glow-success/10',
  failed: 'badge-danger shadow-glow-danger/10',
  pending: 'badge-warning shadow-glow-warning/10',
}

const PaymentHistoryTable = ({ payments = [], onDownloadReceipt, downloading }) => {
  const [statusFilter, setStatusFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt)
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
      const matchesFrom = !fromDate || paymentDate >= new Date(fromDate)
      const matchesTo = !toDate || paymentDate <= new Date(`${toDate}T23:59:59`)
      const matchesSearch = !searchQuery || 
                           (payment.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (payment.method || '').toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesFrom && matchesTo && matchesSearch
    })
  }, [payments, statusFilter, fromDate, toDate, searchQuery])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="card !p-0 overflow-hidden shadow-xl">
      <div className="p-6 border-b border-border-app flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 bg-gradient-to-r from-surface-1 to-surface-2">
        <div>
          <h2 className="text-xl font-bold text-text-primary font-heading">Transactional History</h2>
          <p className="text-sm text-text-muted mt-1">Audit log of all payments and settlements</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full xl:w-auto">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
             <input 
               type="text" 
               placeholder="TXN ID / Method" 
               className="select pl-8 py-2 w-full !bg-surface-2"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select pl-8 py-2 w-full !bg-surface-2"
            >
              <option value="all">Global Status</option>
              <option value="success">Success Only</option>
              <option value="pending">In-Progress</option>
              <option value="failed">Failed / Cancelled</option>
            </select>
          </div>

          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
             <input
               type="date"
               value={fromDate}
               onChange={(e) => setFromDate(e.target.value)}
               className="select pl-8 py-2 w-full !bg-surface-2"
               title="From Date"
             />
          </div>

          <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
             <input
               type="date"
               value={toDate}
               onChange={(e) => setToDate(e.target.value)}
               className="select pl-8 py-2 w-full !bg-surface-2"
               title="To Date"
             />
          </div>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="empty-state py-20 bg-surface-1/50">
           <div className="p-4 rounded-full bg-surface-2 mb-4 border border-border-app">
              <FileText className="w-8 h-8 text-text-muted/40" />
           </div>
           <p className="text-text-muted font-medium">No financial records detected in this period</p>
           <button onClick={() => { setStatusFilter('all'); setFromDate(''); setToDate(''); setSearchQuery(''); }} className="text-xs font-bold text-primary mt-4 hover:underline">Reset Data Filter</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Execution Date</th>
                <th>Transactional ID</th>
                <th>Currency Volume</th>
                <th>Payment Mode</th>
                <th>Fulfillment Status</th>
                <th className="text-right">Settlement File</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id || payment.transactionId} className="group hover:bg-surface-2/50 transition-all cursor-default">
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3.5 h-3.5 text-primary/50" />
                       <span className="text-text-secondary font-medium">{formatDate(payment.createdAt)}</span>
                    </div>
                  </td>
                  <td>
                    <code className="text-[10px] font-bold text-text-muted bg-surface-3 px-1.5 py-0.5 rounded border border-border-app/50 font-mono">
                       {payment.transactionId || payment._id?.slice(-12).toUpperCase() || 'MANUAL_TXN'}
                    </code>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 font-black text-text-primary">
                      <IndianRupee className="w-3 h-3 text-text-muted" />
                      {(payment.amount || 0).toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                       <div className="p-1 rounded bg-surface-3 border border-border-app">
                          {payment.method === 'upi' ? <Wallet className="w-3 h-3 text-accent" /> : <CreditCard className="w-3 h-3 text-primary" />}
                       </div>
                       <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{payment.method || 'Standard'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${statusThemes[payment.status] || 'bg-surface-3 text-text-muted'}`}>
                      {(payment.status || 'PROCESSED').toUpperCase()}
                    </span>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => onDownloadReceipt(payment)}
                      disabled={downloading || payment.status !== 'success'}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-btn text-[10px] font-black tracking-widest transition-all ${
                        payment.status === 'success' 
                          ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white shadow-sm' 
                          : 'opacity-20 cursor-not-allowed text-text-muted'
                      }`}
                    >
                      {downloading ? (
                        <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      RECEIPT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="p-4 bg-surface-2/30 border-t border-border-app/50 flex justify-between items-center">
         <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
           Showing {filteredPayments.length} of {payments.length} Settlements
         </p>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-success" />
               <span className="text-[10px] font-bold text-text-muted">SUCCESS</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-warning" />
               <span className="text-[10px] font-bold text-text-muted">PENDING</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-danger" />
               <span className="text-[10px] font-bold text-text-muted">FAILED</span>
            </div>
         </div>
      </div>
    </div>
  )
}

export default PaymentHistoryTable
