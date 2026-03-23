import React from 'react'
import { useSelector } from 'react-redux'
import { CurrencyRupeeIcon, CheckBadgeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const StudentFeePaymentStatus = () => {
  const { user } = useSelector((state) => state.auth)
  const { classes } = useSelector((state) => state.dashboard)

  const defaultTotalFees = Math.max(classes.length, 1) * 12000
  const totalFees = user?.totalFees || defaultTotalFees
  const paidAmount = user?.paidAmount || Math.round(totalFees * 0.7)
  const pendingAmount = Math.max(totalFees - paidAmount, 0)
  const dueDate = user?.feesDueDate || '2026-04-05'
  const isPaid = pendingAmount === 0

  return (
    <section className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Fee Payment Status</h2>
        <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Total Fees</p>
            <p className="text-lg font-semibold text-gray-900">Rs. {totalFees.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">Paid</p>
            <p className="text-lg font-semibold text-green-800">Rs. {paidAmount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Pending</p>
            <p className="text-lg font-semibold text-amber-800">Rs. {pendingAmount.toLocaleString()}</p>
          </div>
        </div>

        <div
          className={`flex items-start gap-3 rounded-lg p-4 ${
            isPaid ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
          }`}
        >
          {isPaid ? <CheckBadgeIcon className="h-5 w-5 mt-0.5" /> : <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />}
          <div>
            <p className="font-medium">{isPaid ? 'All dues are cleared' : 'Payment pending'}</p>
            <p className="text-sm">Due date: {new Date(dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Continue to Payment
        </button>
      </div>
    </section>
  )
}

export default StudentFeePaymentStatus
