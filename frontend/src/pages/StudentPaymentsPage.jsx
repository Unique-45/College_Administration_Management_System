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
      dispatch(
        showToast({
          type: 'error',
          message: 'Razorpay checkout could not be loaded. Please try again.',
        })
      )
      return
    }

    if (!config.payment.razorpayKeyId) {
      dispatch(
        showToast({
          type: 'error',
          message: 'Razorpay key is not configured. Contact administrator.',
        })
      )
      return
    }

    const options = {
      key: config.payment.razorpayKeyId,
      amount: (orderPayload.amount || numericAmount * 100),
      currency: orderPayload.currency || 'INR',
      name: config.app.name,
      description: 'Campus Fee Payment',
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
          dispatch(showToast({ type: 'success', message: 'Payment successful' }))
          dispatch(fetchPendingFees())
          dispatch(fetchPaymentHistory())
          dispatch(clearCurrentOrder())
          setAmount('')
        } else {
          dispatch(showToast({ type: 'error', message: 'Payment verification failed' }))
        }
      },
      modal: {
        ondismiss: () => {
          dispatch(showToast({ type: 'warning', message: 'Payment cancelled by user' }))
        },
      },
      theme: {
        color: '#2563eb',
      },
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

    const result = await dispatch(
      initiatePayment({
        amount: numericAmount,
        method,
      })
    )

    if (!result.type.endsWith('/fulfilled')) {
      dispatch(showToast({ type: 'error', message: 'Unable to initiate payment' }))
      return
    }

    const orderPayload = result.payload || {}

    if (method === 'razorpay') {
      await openRazorpayCheckout(orderPayload, numericAmount)
      return
    }

    const upiVerification = await dispatch(
      verifyPayment({
        orderId: orderPayload.orderId || orderPayload.order_id,
        paymentId: orderPayload.paymentId || `upi-${Date.now()}`,
        method: 'upi',
        amount: numericAmount,
      })
    )

    if (upiVerification.type.endsWith('/fulfilled')) {
      dispatch(showToast({ type: 'success', message: 'UPI payment recorded successfully' }))
      dispatch(fetchPendingFees())
      dispatch(fetchPaymentHistory())
      setAmount('')
    } else {
      dispatch(showToast({ type: 'error', message: 'UPI payment verification failed' }))
    }
  }

  const handleDownloadReceipt = async (payment) => {
    if (!payment?._id) {
      dispatch(showToast({ type: 'error', message: 'Receipt unavailable for this transaction' }))
      return
    }

    try {
      setDownloading(true)
      const response = await paymentService.downloadReceipt(payment._id)
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' })
      const blobUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = blobUrl
      anchor.download = `receipt-${payment._id}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      dispatch(showToast({ type: 'error', message: 'Failed to download receipt' }))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Payments</h1>
          <p className="text-gray-600 mt-1">Pay pending dues and track all transactions in one place.</p>
          {usingFallbackData && (
            <p className="text-sm text-amber-600 mt-2">
              Showing fallback payment data because the API is currently unavailable.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Fees</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Fees</span>
                <span className="font-medium text-gray-900">Rs. {(pendingFees.totalFees || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount</span>
                <span className="font-medium text-green-700">Rs. {(pendingFees.paidAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="text-gray-700 font-medium">Pending Amount</span>
                <span className="font-semibold text-red-600">Rs. {(pendingFees.pendingAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="text-gray-500 pt-1">Due Date: {pendingFees.dueDate || '-'}</div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pay Fees</h2>
            <form onSubmit={handleInitiatePayment} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  min="1"
                  max={maxPayable}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="razorpay">Razorpay</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={initiating || verifying || (pendingFees.pendingAmount || 0) <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {initiating || verifying ? 'Processing...' : 'Pay Now'}
              </button>
            </form>

            {currentOrder?.orderId && (
              <p className="text-xs text-gray-500 mt-3">Current Order: {currentOrder.orderId}</p>
            )}
          </div>
        </div>

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
