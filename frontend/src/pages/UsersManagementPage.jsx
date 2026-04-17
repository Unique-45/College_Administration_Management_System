import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers } from '@/store/slices/dashboardSlice'
import UsersManagementTable from '@/components/Dashboard/UsersManagementTable'
import LoadingSpinner from '@/components/Common/LoadingSpinner'

const UsersManagementPage = () => {
  const dispatch = useDispatch()
  const { usersLoading, usersError } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  if (usersLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (usersError) {
    return (
      <div className="status-banner-danger">
        <div>
          <h2 className="text-base font-semibold">Error Loading Users</h2>
          <p className="text-sm">{usersError}</p>
        </div>
        <button 
          onClick={() => dispatch(fetchUsers())}
          className="btn-danger ml-auto"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="page-container">
      <UsersManagementTable />
    </div>
  )
}

export default UsersManagementPage
