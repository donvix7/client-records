"use client";

import Navigation from '@/components/Navigation';
import { deleteClient, updateClient } from '@/utils/actions';
import { getClients } from '@/utils/service';
import { 
  User, 
  Search, 
  X, 
  UserPlus, 
  Users, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Briefcase,
  CheckCircle,
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

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isModalOpen])

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
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedClient(null)
    setIsEditing(false)
    setIsDeleting(false)
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

  const inputClass = `w-full rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none border-primary-200`

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white text-primary antialiased flex flex-col">
        <Navigation/>
        <div className='flex items-center justify-center h-64'>
          <div className='spinner'></div>
          <p className='mt-4 text-neutrals-900 font-mono'>Loading directory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white text-primary antialiased flex flex-col">
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
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutrals-900 hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>
            <h1 className='text-3xl sm:text-4xl font-bold text-primary font-sans'>
              Directory
            </h1>
            <p className='text-lg text-neutrals-900 font-mono'>
              View and manage registered contacts for future invitations
            </p>
          </div>
          <Link href='/add-client' className='inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-md font-semibold font-mono hover:shadow-md hover:bg-primary-900 transition-all duration-200'>
            <UserPlus className='w-5 h-5' />
            Add Contact
          </Link>
        </div>
      </div>

      <main className='w-full max-w-6xl mx-auto px-4 sm:px-6 pb-12'>
        {/* Stats Banner */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
          <div className='bg-primary-100 border border-primary-200 rounded-xl p-4'>
            <p className='text-sm text-primary font-mono'>Total Contacts</p>
            <p className='text-2xl font-semibold text-primary font-sans'>{clients.length}</p>
          </div>
          <div className='bg-green-50 border border-green-100 rounded-xl p-4'>
            <p className='text-sm text-green-700 font-mono'>Active</p>
            <p className='text-2xl font-semibold text-green-900 font-sans'>
              {clients.filter(c => c.status?.toLowerCase() === 'active').length}
            </p>
          </div>
          <div className='bg-secondary-100 border border-secondary rounded-xl p-4'>
            <p className='text-sm text-secondary-500 font-mono'>Pending</p>
            <p className='text-2xl font-semibold text-secondary-500 font-sans'>
              {clients.filter(c => c.status?.toLowerCase() === 'pending').length}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className='bg-primary-100 border border-primary-200 rounded-xl p-4 mb-6'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutrals-900' />
            <input 
              type='search' 
              className={`${inputClass} pl-10 pr-10`}
              placeholder='Search by name, email, or company...' 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className='absolute right-3 top-1/2 -translate-y-1/2'
              >
                <X className='w-4 h-4 text-neutrals-900 hover:text-primary' />
              </button>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-2 mt-4'>
            <span className='text-xs font-medium text-neutrals-900 uppercase tracking-wider mr-2 font-sans'>Status:</span>
            {['All', 'active', 'pending', 'inactive'].map(item => (
              <button 
                key={item} 
                onClick={() => setFilterStatus(item)}
                className={`px-4 py-1.5 rounded-lg capitalize text-sm transition-all duration-200 font-mono ${
                  filterStatus === item 
                    ? 'bg-primary text-white' 
                    : 'bg-white border border-primary-200 text-neutrals-900 hover:bg-primary-100'
                }`}
              >
                {item}
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                  filterStatus === item 
                    ? 'bg-white/20 text-white' 
                    : 'bg-primary-100 text-neutrals-900'
                }`}>
                  {statusCounts[item] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className='flex flex-wrap gap-2 mt-4 items-center'>
            <span className='text-xs font-medium text-neutrals-900 uppercase tracking-wider mr-2 font-sans'>Sort:</span>
            <button 
              onClick={() => handleSort('name')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors font-mono ${
                sortBy === 'name' ? 'bg-primary-200 text-primary font-medium' : 'hover:bg-primary-100 text-neutrals-900'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              onClick={() => handleSort('company')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors font-mono ${
                sortBy === 'company' ? 'bg-primary-200 text-primary font-medium' : 'hover:bg-primary-100 text-neutrals-900'
              }`}
            >
              Company {sortBy === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button 
              onClick={() => handleSort('status')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors font-mono ${
                sortBy === 'status' ? 'bg-primary-200 text-primary font-medium' : 'hover:bg-primary-100 text-neutrals-900'
              }`}
            >
              Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className='bg-white border border-primary-200 rounded-xl overflow-hidden shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-primary-100 border-b border-primary-200'>
                  <th className='p-4 text-xs font-semibold text-primary uppercase tracking-wider text-left font-sans'>Contact</th>
                  <th className='p-4 text-xs font-semibold text-primary uppercase tracking-wider text-left hidden sm:table-cell font-sans'>Company</th>
                  <th className='p-4 text-xs font-semibold text-primary uppercase tracking-wider text-left hidden md:table-cell font-sans'>Joined</th>
                  <th className='p-4 text-xs font-semibold text-primary uppercase tracking-wider text-right font-sans'>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr 
                      className='border-b border-primary-100 hover:bg-primary-100/50 transition-colors cursor-pointer' 
                      key={client._id || client.id}
                      onClick={() => openModal(client)}
                    > 
                      <td className='p-4'>
                        <div className='flex items-center gap-3'>
                          <div className='rounded-full w-10 h-10 bg-primary-100 flex items-center justify-center flex-shrink-0 border border-primary-200'>
                            <User className='w-4 h-4 text-primary' />
                          </div>
                          <div className='flex flex-col min-w-0'>
                            <h1 className='font-medium text-primary truncate font-sans'>{client.firstName + ' ' + client.lastName || 'Unknown'}</h1>
                            <p className='text-xs text-neutrals-900 truncate font-mono'>{client.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className='p-4 hidden sm:table-cell text-sm text-neutrals-900 font-mono'>{client.company || '—'}</td>
                      <td className='p-4 hidden md:table-cell text-sm text-neutrals-900 font-mono'>
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
                          <Users className='w-12 h-12 text-primary-200' />
                          <div>
                            <p className='text-neutrals-900 font-medium font-sans'>No contacts yet</p>
                            <p className='text-sm text-neutrals-900 font-mono mt-1'>Add your first contact to start building your directory</p>
                          </div>
                          <Link href='/add-client' className='inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-md font-semibold font-mono hover:shadow-md hover:bg-primary-900 transition-all'>
                            <UserPlus className='w-4 h-4' />
                            Add Contact
                          </Link>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center gap-2'>
                          <p className='text-neutrals-900 font-mono'>No contacts matching your criteria</p>
                          <button 
                            onClick={clearSearch}
                            className='text-primary hover:text-primary-700 text-sm font-medium'
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

        <div className='text-sm text-neutrals-900 mt-4 font-mono'>
          Showing {filteredClients.length} of {clients.length} contacts
        </div>

        {/* Info Note */}
        <div className='mt-8 flex items-start gap-3 bg-primary-100 rounded-xl p-4 border border-primary-200'>
          <Info className='w-4 h-4 text-primary flex-shrink-0 mt-0.5' />
          <p className='text-xs text-primary-700 font-mono leading-relaxed'>
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
            <div className='flex items-center justify-between p-6 border-b border-primary-200'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full w-12 h-12 bg-primary-100 flex items-center justify-center border border-primary-200'>
                  <User className='w-6 h-6 text-primary' />
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-primary font-sans'>
                    {isEditing ? 'Edit Contact' : `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim() || 'Unknown'}
                  </h2>
                  {!isEditing && (
                    <p className='text-sm text-neutrals-900 font-mono'>{selectedClient.email || 'No email'}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className='p-2 hover:bg-primary-100 rounded-lg transition-colors'
              >
                <X className='w-5 h-5 text-neutrals-900' />
              </button>
            </div>

            {/* Modal Body */}
            <div className='p-6'>
              {isEditing ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='w-full flex flex-col space-y-2 font-mono'>
                      <label htmlFor='firstName' className='text-sm text-black'>First Name</label>
                      <input
                        type='text'
                        name='firstName'
                        id='firstName'
                        value={editFormData.firstName || ''}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <div className='w-full flex flex-col space-y-2 font-mono'>
                      <label htmlFor='lastName' className='text-sm text-black'>Last Name</label>
                      <input
                        type='text'
                        name='lastName'
                        id='lastName'
                        value={editFormData.lastName || ''}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className='w-full flex flex-col space-y-2 font-mono'>
                    <label htmlFor='email' className='text-sm text-black'>Email</label>
                    <input
                      type='email'
                      name='email'
                      id='email'
                      value={editFormData.email || ''}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                  <div className='w-full flex flex-col space-y-2 font-mono'>
                    <label htmlFor='phone' className='text-sm text-black'>Phone</label>
                    <input
                      type='text'
                      name='phone'
                      id='phone'
                      value={editFormData.phone || ''}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div className='w-full flex flex-col space-y-2 font-mono'>
                      <label htmlFor='company' className='text-sm text-black'>Company</label>
                      <input
                        type='text'
                        name='company'
                        id='company'
                        value={editFormData.company || ''}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <div className='w-full flex flex-col space-y-2 font-mono'>
                      <label htmlFor='status' className='text-sm text-black'>Status</label>
                      <select
                        name='status'
                        id='status'
                        value={editFormData.status || 'pending'}
                        onChange={handleInputChange}
                        className={`${inputClass} bg-[#FCFEFF]`}
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
                    <div className='flex items-start gap-3 p-3 bg-primary-100 rounded-lg'>
                      <Mail className='w-5 h-5 text-primary mt-0.5' />
                      <div>
                        <p className='text-xs text-primary font-medium uppercase tracking-wider font-sans'>Email</p>
                        <p className='font-medium text-black font-mono'>{selectedClient.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 p-3 bg-primary-100 rounded-lg'>
                      <Phone className='w-5 h-5 text-primary mt-0.5' />
                      <div>
                        <p className='text-xs text-primary font-medium uppercase tracking-wider font-sans'>Phone</p>
                        <p className='font-medium text-black font-mono'>{selectedClient.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 p-3 bg-primary-100 rounded-lg'>
                      <Building className='w-5 h-5 text-primary mt-0.5' />
                      <div>
                        <p className='text-xs text-primary font-medium uppercase tracking-wider font-sans'>Company</p>
                        <p className='font-medium text-black font-mono'>{selectedClient.company || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 p-3 bg-primary-100 rounded-lg'>
                      <Briefcase className='w-5 h-5 text-primary mt-0.5' />
                      <div>
                        <p className='text-xs text-primary font-medium uppercase tracking-wider font-sans'>Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                          {selectedClient.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='border-t border-primary-200 pt-4'>
                    <div className='flex items-start gap-3 p-3 bg-primary-100 rounded-lg'>
                      <Calendar className='w-5 h-5 text-primary mt-0.5' />
                      <div>
                        <p className='text-xs text-primary font-medium uppercase tracking-wider font-sans'>Registered</p>
                        <p className='font-medium text-black font-mono'>{formatFullDate(selectedClient.joined || selectedClient.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='flex items-center justify-between p-6 border-t border-primary-200'>
              {isEditing ? (
                <div className='flex gap-3 w-full'>
                  <button
                    onClick={handleCancelEdit}
                    className='px-6 py-3 text-neutrals-900 hover:bg-primary-100 rounded-md transition-colors font-semibold font-mono border border-primary-200'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className='px-6 py-3 bg-primary text-white rounded-md hover:shadow-md hover:bg-primary-900 transition-colors font-semibold font-mono flex-1'
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className='flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-md hover:shadow-md hover:bg-primary-900 transition-all font-semibold font-mono'
                  >
                    <Edit className='w-4 h-4' />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors font-semibold font-mono ${
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