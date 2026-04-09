import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPendingFees,
  fetchPaymentHistory,
  initiatePayment,
  verifyPayment,
  clearCurrentOrder,
} from '@/store/slices/paymentSlice'
import paymentService from '@/services/paymentService'
import config from '@/config/environment'
import { showToast } from '@/store/slices/notificationSlice'
import PaymentHistoryTable from '@/components/Payment/PaymentHistoryTable'
import PageHeader from '@/components/Common/PageHeader'
import { 
  CreditCard, 
  Wallet, 
  Receipt, 
  TrendingDown, 
  AlertCircle, 
  ShieldCheck, 
  IndianRupee,
  Clock,
  ArrowUpRight
} from 'lucide-react'

const StudentPaymentsPage = () => {
  const dispatch = useDispatch()
  const { pendingFees, paymentHistory, initiating, verifying, currentOrder, usingFallbackData } = useSelector(
    (state) => state.payment
  )
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('razorpay')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    dispatch(fetchPendingFees())
    dispatch(fetchPaymentHistory())
  }, [dispatch])

  const maxPayable = pendingFees?.pendingAmount || 0

  const validationError = useMemo(() => {
    const numericAmount = Number(amount)
    if (!amount) return 'Please enter amount'
    if (Number.isNaN(numericAmount) || numericAmount <= 0) return 'Amount must be greater than 0'
    if (numericAmount > maxPayable) return 'Amount cannot exceed pending fees'
    return null
  }, [amount, maxPayable])

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const openRazorpayCheckout = async (orderPayload, numericAmount) => {
    const isLoaded = await loadRazorpayScript()
    if (!isLoaded) {
      dispatch(showToast({ type: 'error', message: 'Razorpay checkout could not be loaded.' }))
      return
    }

    if (!config.payment.razorpayKeyId) {
      dispatch(showToast({ type: 'error', message: 'Razorpay key error. Contact admin.' }))
      return
    }

    const options = {
      key: config.payment.razorpayKeyId,
      amount: (orderPayload.amount || numericAmount * 100),
      currency: orderPayload.currency || 'INR',
      name: 'AcademiX Pro',
      description: 'Campus Fee Payment Session',
      order_id: orderPayload.orderId || orderPayload.order_id,
      handler: async (response) => {
        const verifyResult = await dispatch(
          verifyPayment({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            amount: numericAmount,
            method: 'razorpay',
          })
        )

        if (verifyResult.type.endsWith('/fulfilled')) {
          dispatch(showToast({ type: 'success', message: 'Payment confirmed successfully' }))
          dispatch(fetchPendingFees())
          dispatch(fetchPaymentHistory())
          dispatch(clearCurrentOrder())
          setAmount('')
        } else {
          dispatch(showToast({ type: 'error', message: 'Payment verification failed' }))
        }
      },
      modal: { ondismiss: () => dispatch(showToast({ type: 'warning', message: 'Payment cancelled' })) },
      theme: { color: '#2563EB' },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  const handleInitiatePayment = async (e) => {
    e.preventDefault()
    if (validationError) {
      dispatch(showToast({ type: 'error', message: validationError }))
      return
    }

    const numericAmount = Number(amount)
    const result = await dispatch(initiatePayment({ amount: numericAmount, method }))

    if (!result.type.endsWith('/fulfilled')) {
      dispatch(showToast({ type: 'error', message: 'Unable to initiate payment transaction' }))
      return
    }

    const orderPayload = result.payload || {}
    if (method === 'razorpay') {
      await openRazorpayCheckout(orderPayload, numericAmount)
      return
    }

    // UPI Fallback path (simulated/recorded)
    const upiVerification = await dispatch(
      verifyPayment({
        orderId: orderPayload.orderId || orderPayload.order_id,
        paymentId: orderPayload.paymentId || `upi-${Date.now()}`,
        method: 'upi',
        amount: numericAmount,
      })
    )

    if (upiVerification.type.endsWith('/fulfilled')) {
      dispatch(showToast({ type: 'success', message: 'UPI transaction recorded' }))
      dispatch(fetchPendingFees())
      dispatch(fetchPaymentHistory())
      setAmount('')
    }
  }

  const handleDownloadReceipt = async (payment) => {
    if (!payment?._id) return
    try {
      setDownloading(true)
      const response = await paymentService.downloadReceipt(payment._id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const blobUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = `Receipt_${payment._id.slice(-6)}.pdf`
      anchor.click()
      window.URL.revokeObjectURL(blobUrl)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Financial Dashboard" 
        subtitle="Manage secure tuition payments and track transaction history"
      />

      {usingFallbackData && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-3 animate-pulse">
          <AlertCircle className="w-5 h-5 text-warning" />
          <p className="text-xs font-medium text-warning">Notice: API Gateway temporary disruption. Displaying localized cached financial data.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card relative overflow-hidden bg-gradient-to-br from-surface-1 to-surface-2 border-primary/20 shadow-glow-primary/5">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
             <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
             
             <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-primary" />
                Ledger Summary
             </h3>

             <div className="space-y-6">
                <div>
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Total Fee Liability</p>
                   <p className="text-2xl font-black text-text-primary">
                      ₹{(pendingFees.totalFees || 0).toLocaleString('en-IN')}
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-4 h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-success opacity-80" 
                     style={{ width: `${((pendingFees.paidAmount || 0) / (pendingFees.totalFees || 1)) * 100}%` }} 
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-[10px] font-bold text-success uppercase tracking-wider mb-0.5">Cleared</p>
                      <p className="text-sm font-bold text-text-primary">₹{(pendingFees.paidAmount || 0).toLocaleString('en-IN')}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-danger uppercase tracking-wider mb-0.5">Outstanding</p>
                      <p className="text-sm font-bold text-text-primary">₹{(pendingFees.pendingAmount || 0).toLocaleString('en-IN')}</p>
                   </div>
                </div>

                <div className="pt-4 border-t border-border-app/50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-warning" />
                      <span className="text-[10px] font-bold text-text-muted uppercase">Next Due Date</span>
                   </div>
                   <span className="text-xs font-bold text-text-secondary">{pendingFees.dueDate || '30 Sep 2024'}</span>
                </div>
             </div>
          </div>

          <div className="card bg-surface-2/30 border-dashed">
             <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-accent/10 text-accent">
                   <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="text-xs font-bold text-text-primary tracking-wide">Enterprise Security</h4>
                   <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                     Financial transactions are encrypted with 256-bit SSL and processed via PCI-DSS compliant gateways.
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-8">
           <div className="card h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-lg font-bold text-text-primary">Payment Portal</h3>
                    <p className="text-sm text-text-muted">Initiate a secure transaction to clear your dues</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-help" title="Official Payment Partner" />
                 </div>
              </div>

              <form onSubmit={handleInitiatePayment} className="flex-1 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Payment Amount (INR)</label>
                       <div className="relative group">
                          <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:text-glow-primary transition-colors" />
                          <input
                            type="number"
                            min="1"
                            max={maxPayable}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="input pl-12 w-full text-lg font-bold py-4 bg-surface-2"
                            placeholder="0.00"
                          />
                          <button 
                            type="button"
                            onClick={() => setAmount(maxPayable.toString())}
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-bold bg-primary/10 text-primary rounded hover:bg-primary/20 transition-all"
                          >
                            PAY FULL
                          </button>
                       </div>
                       <p className="text-[10px] text-text-muted italic ml-1 flex items-center gap-1">
                         <span className="w-1 h-1 rounded-full bg-primary" />
                         Maximum authorized amount: ₹{maxPayable.toLocaleString('en-IN')}
                       </p>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Channel selection</label>
                       <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setMethod('razorpay')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                              method === 'razorpay' 
                                ? 'bg-primary/10 border-primary shadow-glow-primary/5' 
                                : 'bg-surface-2 border-border-app hover:border-text-muted'
                            }`}
                          >
                             <CreditCard className={`w-5 h-5 mb-2 ${method === 'razorpay' ? 'text-primary' : 'text-text-muted'}`} />
                             <span className={`text-[10px] font-bold uppercase tracking-wider ${method === 'razorpay' ? 'text-text-primary' : 'text-text-muted'}`}>Cards / Net</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMethod('upi')}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                              method === 'upi' 
                                ? 'bg-accent/10 border-accent shadow-glow-accent/5' 
                                : 'bg-surface-2 border-border-app hover:border-text-muted'
                            }`}
                          >
                             <Wallet className={`w-5 h-5 mb-2 ${method === 'upi' ? 'text-accent' : 'text-text-muted'}`} />
                             <span className={`text-[10px] font-bold uppercase tracking-wider ${method === 'upi' ? 'text-text-primary' : 'text-text-muted'}`}>Instant UPI</span>
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="p-4 bg-surface-2 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-surface-3 transition-colors border border-border-app/50">
                    <div className="flex items-center gap-4">
                       <div className="p-2 rounded-lg bg-surface-1">
                          <Receipt className="w-4 h-4 text-text-muted" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-text-primary">E-Receipt Policy</p>
                          <p className="text-[10px] text-text-muted">Digital receipts are generated instantly upon confirmation</p>
                       </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                 </div>

                 <button
                   type="submit"
                   disabled={initiating || verifying || (pendingFees.pendingAmount || 0) <= 0}
                   className="btn-primary w-full py-4 text-base font-black shadow-glow-primary/20 flex items-center justify-center gap-3 group"
                 >
                   {initiating || verifying ? (
                     <>
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       SECURE PROCESSING...
                     </>
                   ) : (
                     <>
                       PROCEED TO SECURE CHECKOUT
                       <TrendingDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                     </>
                   )}
                 </button>
              </form>
           </div>
        </div>
      </div>

      <div className="pt-4">
        <PaymentHistoryTable
          payments={paymentHistory}
          onDownloadReceipt={handleDownloadReceipt}
          downloading={downloading}
        />
      </div>
    </div>
  )
}

export default StudentPaymentsPage
