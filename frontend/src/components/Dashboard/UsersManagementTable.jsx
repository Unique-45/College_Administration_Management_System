/**
 * Users Management Table — Premium Dark Theme
 * Features:
 * - Searchable table
 * - Role-based badges
 * - Status pills
 * - Action buttons
 * - Responsive layout
 */

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Pencil, Trash2, UserPlus, Search, ShieldCheck, GraduationCap, User } from 'lucide-react'

const UsersManagementTable = () => {
  const {
    users = [],
    loading,
    error,
    totalUsers,
    totalPages,
    currentPage,
  } = useSelector((state) => state.dashboard || {})
  const [searchTerm, setSearchTerm] = useState('')

  // Safety check: ensure users is an array before filtering
  const safeUsers = Array.isArray(users) ? users : []

  const filteredUsers = safeUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (id) => {
    // TODO: Implement edit user functionality
  }

  const handleDelete = (id) => {
    // TODO: Implement delete user functionality
  }

  const handleAddUser = () => {
    // TODO: Implement add user functionality
  }

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="badge-primary"><ShieldCheck className="w-3 h-3" /> Admin</span>
      case 'teacher':
        return <span className="badge-warning"><User className="w-3 h-3" /> Teacher</span>
      case 'student':
        return <span className="badge-info"><GraduationCap className="w-3 h-3" /> Student</span>
      default:
        return <span className="badge-muted">{role}</span>
    }
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-text-primary font-heading">Users Management</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage all registered users and roles</p>
        </div>
        <button
          onClick={handleAddUser}
          className="btn-primary btn-sm flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Users Table */}
      <div className="table-container flex-1">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-app/30">
            <thead className="table-header">
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Role</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-app/30">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="table-row group">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="avatar-sm bg-surface-3 text-text-secondary">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">{user.name}</div>
                        <div className="text-xs text-text-muted truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="table-td">
                    <span className={`badge ${user.status === 'Active' || !user.status ? 'badge-success' : 'badge-danger'}`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="table-td text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(user._id)}
                        className="btn-icon text-text-muted hover:text-primary hover:bg-primary/10"
                        title="Edit User"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="btn-icon text-text-muted hover:text-danger hover:bg-danger/10"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state py-12">
            <div className="text-center text-text-muted">
              <User className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No users found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersManagementTable