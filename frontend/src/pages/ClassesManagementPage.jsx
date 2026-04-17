import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchClasses } from '@/store/slices/dashboardSlice'
import ClassesManagementInterface from '@/components/Dashboard/ClassesManagementInterface'
import LoadingSpinner from '@/components/Common/LoadingSpinner'
import PageHeader from '@/components/Common/PageHeader'
import { BookOpen } from 'lucide-react'

const ClassesManagementPage = () => {
  const dispatch = useDispatch()
  const { classesLoading, classesError } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  if (classesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (classesError) {
    return (
      <div className="status-banner-danger">
        <div>
          <h2 className="text-base font-semibold">Error Loading Classes</h2>
          <p className="text-sm">{classesError}</p>
        </div>
        <button 
          onClick={() => dispatch(fetchClasses())}
          className="btn-danger ml-auto"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Classes Management"
        description="Configure departments, subjects, semester capacity, and class metadata."
        icon={BookOpen}
      />
      <ClassesManagementInterface />
    </div>
  )
}

export default ClassesManagementPage
