"use client";

import Navigation from '@/components/Navigation';
import { deleteClient, updateClient } from '@/utils/actions';
import { getClients } from '@/utils/service';
import { User, Search, X, Filter, ChevronDown, UserPlus, Users, FilterIcon, Edit, Trash2, Mail, Phone, Building, Calendar, Clock, MapPin, Briefcase } from 'lucide-react'
import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react'

const Page = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [selectedClient, setSelectedClient] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [isDeleting, setIsDeleting] = useState(false)
  const [notification, setNotification] = useState(null)

  // Format date helper
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

  // Full date format for modal
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

  // Filter and search logic
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
    if (!status) return 'text-gray-500 bg-gray-500/10'
    switch(status.toLowerCase()) {
      case 'active':
        return 'text-green-500 bg-green-500/10'
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'inactive':
        return 'text-red-500 bg-red-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  // Modal handlers
  const openModal = (client) => {
    setSelectedClient(client)
    setEditFormData(client)
    setIsEditing(false)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden' // Prevent scrolling
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
        // Update client in the list
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
        // Remove client from list
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
      <div className="min-h-screen w-full bg-background text-on-background antialiased flex flex-col font-body-md">
        <Navigation/>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-4 text-gray-600'>Loading clients...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background text-on-background antialiased flex flex-col font-body-md">
      <Navigation/>
      
      {/* Notification */}
      {notification && (
              <div className={`relative w-full px-6 py-4 text-sm text-center font-medium transition-all duration-300 ${
                notification.type === 'success' 
                  ? 'bg-green-300 border-b border-green-200 text-green-900' 
                  : 'bg-red-50 border-b border-red-200 text-red-800'
              }`}>
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  {notification.message}
                  <button 
                    onClick={dismissNotification}
                    className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

      <div className='flex w-full max-w-4xl mx-auto p-4 justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>
            View Clients
          </h1>
          <p className='text-lg text-gray-600'>
            Manage and view all your clients
          </p>
        </div>
        <div className='text-sm flex  items-center justify-center text-gray-500'>
         
          Total: {filteredClients.length} clients
           <Link href='/add-client' className='text-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer p-2 px-8 rounded-lg ml-4'>
            + Add Client
          </Link>
        </div>
      </div>
      <main className='w-full max-w-4xl mx-auto mt-4 p-4'>

      <div className='relative w-full'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
        <input 
          type='search' 
          className='border border-slate-500/30 rounded-lg p-2 w-full pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50' 
          placeholder='Search clients by name, email, or company...' 
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

      <div className='flex flex-wrap gap-2 mt-4 justify-center w-full sm:justify-start'>
        {['All', 'active', 'pending', 'inactive'].map(item => (
          <button 
            key={item} 
            onClick={() => setFilterStatus(item)}
            className={`px-4 py-2 rounded-lg capitalize cursor-pointer flex items-center gap-2 transition-all duration-200 ${
              filterStatus === item 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-slate-500/10 hover:bg-slate-500/20'
            }`}
          >
            {item}
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              filterStatus === item 
                ? 'bg-white/20 text-white' 
                : 'bg-slate-500/20'
            }`}>
              {statusCounts[item] || 0}
            </span>
          </button>
        ))}
      </div>

      <div className='flex gap-2 mt-4 justify-end items-center text-sm text-gray-600'>
        <span className='font-medium'><FilterIcon className='w-4 h-4 text-primary'/></span>
        <button 
          onClick={() => handleSort('name')}
          className={`px-3 py-1 rounded-md hover:bg-slate-500/10 transition-colors ${
            sortBy === 'name' ? 'bg-slate-500/20 font-semibold' : ''
          }`}
        >
          Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          onClick={() => handleSort('company')}
          className={`px-3 py-1 rounded-md hover:bg-slate-500/10 transition-colors ${
            sortBy === 'company' ? 'bg-slate-500/20 font-semibold' : ''
          }`}
        >
          Company {sortBy === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          onClick={() => handleSort('status')}
          className={`px-3 py-1 rounded-md hover:bg-slate-500/10 transition-colors ${
            sortBy === 'status' ? 'bg-slate-500/20 font-semibold' : ''
          }`}
        >
          Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      <div className='overflow-x-auto mt-4 border border-slate-500/30 rounded-lg'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-slate-500/20'>
              <th className='p-4 text-[12px] tracking-wider uppercase text-left'>Client</th>
              <th className='p-4 text-[12px] tracking-wider uppercase text-left hidden sm:table-cell'>Company</th>
              <th className='p-4 text-[12px] tracking-wider uppercase text-left hidden md:table-cell'>Joined</th>
              <th className='p-4 text-[12px] tracking-wider uppercase text-right'>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <tr 
                  className='border-b border-slate-500/30 hover:bg-slate-500/5 transition-colors cursor-pointer' 
                  key={client._id || client.id}
                  onClick={() => openModal(client)}
                > 
                  <td className='p-4'>
                    <div className='flex items-center gap-3'>
                      <div className='rounded-full w-10 h-10 bg-slate-500/20 flex items-center justify-center flex-shrink-0'>
                        <User className='w-4 h-4 text-slate-500' />
                      </div>
                      <div className='flex flex-col min-w-0'>
                        <h1 className='font-medium truncate'>{client.firstName +' '+ client.lastName || 'Unknown'}</h1>
                        <p className='text-xs text-gray-500 font-light truncate'>{client.email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className='p-4 hidden sm:table-cell'>{client.company || 'N/A'}</td>
                  <td className='p-4 hidden md:table-cell text-sm'>
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
                <td colSpan="4" className='p-8 text-center text-gray-500'>
                  {clients.length === 0 ?(
                    <div className='flex flex-col items-center gap-2 justify-center'>
                       <p>No clients found</p>
                        <Link href='/add-client' className='text-sm bg-blue-600 hover:bg-blue-700 cursor-pointer text-white p-2 px-8 rounded-lg'>
                          + Add Client
                        </Link>
                    </div>
                  ) : (<>
                  <div className='flex items-center gap-2 justify-center'>
                  <p>No clients matching your criteria</p>
                  <Link href='/add-client' className='text-sm text-blue-600'>
            + Add Client
          </Link>
                  </div>
                  </>)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className='text-sm text-gray-500 mt-2'>
        Showing {filteredClients.length} of {clients.length} clients
      </div>

      </main>

      {/* Modal */}
      {isModalOpen && selectedClient && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn'>
          <div className='bg-slate-500/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-6 border-b border-gray-800'>
              <div className='flex items-center gap-3'>
                <div className='rounded-full w-12 h-12 bg-blue-500/10 flex items-center justify-center'>
                  <User className='w-6 h-6 text-slate-500' />
                </div>
                <div>
                  <h2 className='text-xl font-bold'>
                    {isEditing ? 'Edit Client' : `${selectedClient.firstName || ''} ${selectedClient.lastName || ''}`.trim() || 'Unknown'}
                  </h2>
                  {!isEditing && (
                    <p className='text-sm text-gray-500'>{selectedClient.email || 'No email'}</p>
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
                // Edit Form
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>First Name</label>
                    <input
                      type='text'
                      name='firstName'
                      value={editFormData.firstName || ''}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name</label>
                    <input
                      type='text'
                      name='lastName'
                      value={editFormData.lastName || ''}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                    <input
                      type='email'
                      name='email'
                      value={editFormData.email || ''}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Company</label>
                    <input
                      type='text'
                      name='company'
                      value={editFormData.company || ''}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Phone</label>
                    <input
                      type='text'
                      name='phone'
                      value={editFormData.phone || ''}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                    <select
                      name='status'
                      value={editFormData.status || 'pending'}
                      onChange={handleInputChange}
                      className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value='active'>Active</option>
                      <option value='pending'>Pending</option>
                      <option value='inactive'>Inactive</option>
                    </select>
                  </div>
                </div>
              ) : (
                // View Details
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='flex items-start gap-3 p-3 bg-slate-500/20 rounded-lg'>
                      <Mail className='w-5 h-5 text-slate-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-slate-500'>Email</p>
                        <p className='font-medium'>{selectedClient.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 p-3 bg-slate-500/20 rounded-lg'>
                      <Phone className='w-5 h-5 text-slate-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-slate-500'>Phone</p>
                        <p className='font-medium'>{selectedClient.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 p-3 bg-slate-500/20 rounded-lg'>
                      <Building className='w-5 h-5 text-slate-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-slate-500'>Company</p>
                        <p className='font-medium'>{selectedClient.company || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='flex items-start gap-3 p-3 bg-slate-500/20 rounded-lg'>
                      <Briefcase className='w-5 h-5 text-slate-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-slate-500'>Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedClient.status)}`}>
                          {selectedClient.status || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='border-t border-gray-800 pt-4'>
                    <div className='flex items-start gap-3 p-3 bg-slate-500/20 rounded-lg'>
                      <Calendar className='w-5 h-5 text-slate-400 mt-0.5' />
                      <div>
                        <p className='text-sm text-slate-500'>Joined</p>
                        <p className='font-medium'>{formatFullDate(selectedClient.joined || selectedClient.createdAt)}</p>
                      </div>
                    </div>
                    {selectedClient.lastActive && (
                      <div className='flex items-start gap-3 p-3 bg-slate-500/20 rounded-lg mt-3'>
                        <Clock className='w-5 h-5 text-slate-400 mt-0.5' />
                        <div>
                          <p className='text-sm text-slate-500'>Last Active</p>
                          <p className='font-medium'>{formatFullDate(selectedClient.lastActive)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='flex items-center justify-between p-6 border-t border-gray-800'>
              {isEditing ? (
                <div className='flex gap-2 w-full'>
                  <button
                    onClick={handleCancelEdit}
                    className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1'
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    <Edit className='w-4 h-4' />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
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

      {/* Modal CSS Animations */}
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