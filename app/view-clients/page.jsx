"use client";

import Navigation from '@/components/Navigation';
import { deleteClient, updateClient } from '@/utils/actions';
import { getClients } from '@/utils/service';
import { 
  User, 
  Search, 
  X, 
  ChevronDown, 
  UserPlus, 
  Users, 
  FilterIcon, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Clock, 
  Briefcase,
  CheckCircle,
  Shield,
  Info,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react'

const Page = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [selectedClient, setSelectedClient] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [notification, setNotification] = useState(null)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
      return `${Math.floor(diffDays / 365)} years ago`
    } catch (error) {
      return 'Invalid date'
    }
  }

  const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid date'
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  useEffect(() => {
    async function fetchClients() {
      try {
        setLoading(true)
        const res = await getClients()
        console.log(res)
        if(res.success){
          setClients(res.data.docs || [])
        }
      } catch (error) {
        console.error('Failed to fetch clients:', error)
        showNotification('Failed to load clients', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const filteredClients = useMemo(() => {
    let result = [...clients]

    if (filterStatus !== 'All') {
      result = result.filter(client => 
        client.status && client.status.toLowerCase() === filterStatus.toLowerCase()
      )
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(client => {
        const fullName = `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase()
        return (
          fullName.includes(term) ||
          (client.email && client.email.toLowerCase().includes(term)) ||
          (client.company && client.company.toLowerCase().includes(term))
        )
      })
    }

    result.sort((a, b) => {
      let comparison = 0
      const aVal = a[sortBy] || ''
      const bVal = b[sortBy] || ''
      if (aVal < bVal) comparison = -1
      if (aVal > bVal) comparison = 1
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [clients, searchTerm, filterStatus, sortBy, sortOrder])

  const statusCounts = useMemo(() => {
    const counts = { All: clients.length }
    clients.forEach(client => {
      const status = client.status || 'Unknown'
      counts[status] = (counts[status] || 0) + 1
    })
    return counts
  }, [clients])

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-600'
    switch(status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'inactive':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const openModal = (client) => {
    setSelectedClient(client)
    setEditFormData(client)
    setIsEditing(false)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedClient(null)
    setIsEditing(false)
    setIsDeleting(false)
    document.body.style.overflow = 'auto'
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditFormData(selectedClient)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData(selectedClient)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveEdit = async () => {
    try {
      const response = await updateClient(selectedClient._id, editFormData)
      if (response.success) {
        setClients(prev => prev.map(client => 
          client._id === selectedClient._id ? response.data : client
        ))
        setSelectedClient(response.data)
        setIsEditing(false)
        showNotification('Client updated successfully!', 'success')
      } else {
        showNotification('Failed to update client', 'error')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      showNotification('Error updating client', 'error')
    }
  }

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true)
      return
    }
    
    try {
      const response = await deleteClient(selectedClient._id)
      console.log('response',response)

      if (response.success) {
        setClients(prev => prev.filter(client => client._id !== selectedClient._id))
        showNotification('Client deleted successfully!', 'success')
        closeModal()
      } else {
        showNotification('Failed to delete client', 'error')
        setIsDeleting(false)
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      showNotification('Error deleting client', 'error')
      setIsDeleting(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    if (window.notificationTimeout) {
      clearTimeout(window.notificationTimeout)
    }
    window.notificationTimeout = setTimeout(() => setNotification(null), 4000)
  }

  const dismissNotification = () => {
    setNotification(null)
    if (window.notificationTimeout) {
      clearTimeout(window.notificationTimeout)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white text-slate-900 antialiased flex flex-col">
        <Navigation/>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-500 font-light'>Loading directory...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 antialiased flex flex-col">
      <Navigation/>
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-4 px-6 py-4 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <X className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
            <button 
              onClick={dismissNotification}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4'>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
            <h1 className='text-3xl sm:text-4xl font-light text-slate-900'>
              Directory
            </h1>
            <p className='text-lg text-gray-600 font-light'>
              View and manage registered contacts for future invitations
            </p>
          </div>
          <Link href='/add-client' className='inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-800 transition-all duration-200 shadow-lg shadow-blue-700/20 hover:shadow-blue-700/30 active:scale-[0.98]'>
            <UserPlus className='w-5 h-5' />
            Add Contact
          </Link>
        </div>
      </div>

      <main className='w-full max-w-6xl mx-auto px-4 sm:px-6 pb-12'>
        {/* Stats Banner */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
          <div className='bg-blue-50 border border-blue-100 rounded-xl p-4'>
            <p className='text-sm text-blue-700 font-light'>Total Contacts</p>
            <p className='text-2xl font-semibold text-blue-900'>{clients.length}</p>
          </div>
          <div className='bg-green-50 border border-green-100 rounded-xl p-4'>
            <p className='text-sm text-green-700 font-light'>Active</p>
            <p className='text-2xl font-semibold text-green-900'>
              {clients.filter(c => c.status?.toLowerCase() === 'active').length}
            </p>
          </div>
          <div className='bg-yellow-50 border border-yellow-100 rounded-xl p-4'>
            <p className='text-sm text-yellow-700 font-light'>Pending</p>
            <p className='text-2xl font-semibold text-yellow-900'>
              {clients.filter(c => c.status?.toLowerCase() === 'pending').length}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='bg-gray-50/50 border border-gray-200 rounded-xl p-4 mb-6'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input 
              type='search' 
              className='w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm bg-white' 
              placeholder='Search by name, email, or company...' 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className='absolute right-3 top-1/2 -translate-y-1/2'
              >
                <X className='w-4 h-4 text-gray-400 hover:text-gray-600' />
              </button>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-2 mt-4'>
            <span className='text-xs font-medium text-gray-400 uppercase tracking-wider mr-2'>Status:</span>
            {['All', 'active', 'pending', 'inactive'].map(item => (
              <button 
                key={item} 
                onClick={() => setFilterStatus(item)}
                className={`px-4 py-1.5 rounded-lg capitalize text-sm transition-all duration-200 ${
                  filterStatus === item 
                    ? 'bg-blue-700 text-white' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item}
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  filterStatus === item 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {statusCounts[item] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className='flex flex-wrap gap-2 mt-4 items-center'>
            <span className='text-xs font-medium text-gray-400 uppercase tracking-wider mr-2'>Sort:</span>
            <button 
              onClick={() => handleSort('name')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortBy === 'name' ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              onClick={() => handleSort('company')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortBy === 'company' ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              Company {sortBy === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              onClick={() => handleSort('status')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortBy === 'status' ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-200'>
                  <th className='p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left'>Contact</th>
                  <th className='p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left hidden sm:table-cell'>Company</th>
                  <th className='p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left hidden md:table-cell'>Joined</th>
                  <th className='p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right'>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr 
                      className='border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer' 
                      key={client._id || client.id}
                      onClick={() => openModal(client)}
                    > 
                      <td className='p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='rounded-full w-10 h-10 bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100'>
                            <User className='w-4 h-4 text-blue-700' />
                          </div>
                          <div className='flex flex-col min-w-0'>
                            <h1 className='font-medium text-slate-900 truncate'>{client.firstName + ' ' + client.lastName || 'Unknown'}</h1>
                            <p className='text-xs text-gray-500 truncate'>{client.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className='p-4 hidden sm:table-cell text-sm text-gray-600'>{client.company || '—'}</td>
                      <td className='p-4 hidden md:table-cell text-sm text-gray-500'>
                        {formatDate(client.joined || client.createdAt)}
                      </td>
                      <td className='p-4'>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium float-right ${getStatusColor(client.status)}`}>
                          {client.status || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className='p-12 text-center'>
                      {clients.length === 0 ? (
                        <div className='flex flex-col items-center gap-4'>
                          <Users className='w-12 h-12 text-gray-300' />
                          <div>
                            <p className='text-gray-500 font-medium'>No contacts yet</p>
                            <p className='text-sm text-gray-400 font-light mt-1'>Add your first contact to start building your directory</p>
                          </div>
                          <Link href='/add-client' className='inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-800 transition-all'>
                            <UserPlus className='w-4 h-4' />
                            Add Contact
                          </Link>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center gap-2'>
                          <p className='text-gray-500'>No contacts matching your criteria</p>
                          <button 
                            onClick={clearSearch}
                            className='text-blue-700 hover:text-blue-800 text-sm font-medium'
                          >
                            Clear search
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className='text-sm text-gray-500 mt-4 font-light'>
          Showing {filteredClients.length} of {clients.length} contacts
        </div>

        {/* Info Note */}
        <div className='mt-8 flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200'>
          <Info className='w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5' />
          <p className='text-xs text-gray-600 font-light leading-relaxed'>
            This directory stores contact information for company event invitations. All data is securely stored and 
            only used for official company communications.
          </p>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && selectedClient && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn'>
          <div className='bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full w-12 h-12 bg-blue-50 flex items-center justify-center border border-blue-100'>
                  <User className='w-6 h-6 text-blue-700' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-slate-900'>
                    {isEditing ? 'Edit Contact' : `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim() || 'Unknown'}
                  </h2>
                  {!isEditing && (
                    <p className='text-sm text-gray-500 font-light'>{selectedClient.email || 'No email'}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='w-5 h-5 text-gray-500' />
              </button>
            </div>

            {/* Modal Body */}
            <div className='p-6'>
              {isEditing ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>First Name</label>
                      <input
                        type='text'
                        name='firstName'
                        value={editFormData.firstName || ''}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name</label>
                      <input
                        type='text'
                        name='lastName'
                        value={editFormData.lastName || ''}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                    <input
                      type='email'
                      name='email'
                      value={editFormData.email || ''}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Phone</label>
                    <input
                      type='text'
                      name='phone'
                      value={editFormData.phone || ''}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                    />
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Company</label>
                      <input
                        type='text'
                        name='company'
                        value={editFormData.company || ''}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                      <select
                        name='status'
                        value={editFormData.status || 'pending'}
                        onChange={handleInputChange}
                        className='w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white'
                      >
                        <option value='active'>Active</option>
                        <option value='pending'>Pending</option>
                        <option value='inactive'>Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
                      <Mail className='w-5 h-5 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wider'>Email</p>
                        <p className='font-medium text-slate-900'>{selectedClient.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
                      <Phone className='w-5 h-5 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wider'>Phone</p>
                        <p className='font-medium text-slate-900'>{selectedClient.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
                      <Building className='w-5 h-5 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wider'>Company</p>
                        <p className='font-medium text-slate-900'>{selectedClient.company || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
                      <Briefcase className='w-5 h-5 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wider'>Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                          {selectedClient.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='border-t border-gray-200 pt-4'>
                    <div className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg'>
                      <Calendar className='w-5 h-5 text-gray-400 mt-0.5' />
                      <div>
                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wider'>Registered</p>
                        <p className='font-medium text-slate-900'>{formatFullDate(selectedClient.joined || selectedClient.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='flex items-center justify-between p-6 border-t border-gray-200'>
              {isEditing ? (
                <div className='flex gap-3 w-full'>
                  <button
                    onClick={handleCancelEdit}
                    className='px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className='px-6 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors font-medium flex-1'
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className='flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors font-medium'
                  >
                    <Edit className='w-4 h-4' />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-colors font-medium ${
                      isDeleting 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className='w-4 h-4' />
                    {isDeleting ? 'Confirm Delete' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Page