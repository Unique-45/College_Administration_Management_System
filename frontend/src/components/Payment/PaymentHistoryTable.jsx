import React, { useMemo, useState } from 'react'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

const statusClasses = {
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
}

const PaymentHistoryTable = ({ payments = [], onDownloadReceipt, downloading }) => {
  const [statusFilter, setStatusFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt)

      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
      const matchesFrom = !fromDate || paymentDate >= new Date(fromDate)
      const matchesTo = !toDate || paymentDate <= new Date(`${toDate}T23:59:59`)

      return matchesStatus && matchesFrom && matchesTo
    })
  }, [payments, statusFilter, fromDate, toDate])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No payments found for selected filters.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Refund</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id || payment.transactionId}>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(payment.createdAt)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    Rs. {(payment.amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 uppercase">{payment.method || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[payment.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {payment.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                    {payment.refundStatus || 'none'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onDownloadReceipt(payment)}
                      disabled={downloading}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 disabled:opacity-60"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PaymentHistoryTable
