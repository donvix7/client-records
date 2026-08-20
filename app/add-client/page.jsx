"use client";

import React, { useRef } from "react";
import { 
  Menu, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Save, 
  Users, 
  UserPlus,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { addClient } from "@/utils/actions";
import { useState } from "react";

const AddContact = () => {
  const [notification, setNotification] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  
  // ✅ Create a ref to access the form directly
  const formRef = useRef(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    if (window.notificationTimeout) {
      clearTimeout(window.notificationTimeout)
    }
    window.notificationTimeout = setTimeout(() => setNotification(null), 4000)
  }

  const validateForm = (formData) => {
    const errors = {}
    const firstName = formData.get("firstName")?.trim()
    const lastName = formData.get("lastName")?.trim()
    const email = formData.get("email")?.trim()
    const phone = formData.get("phone")?.trim()

    if (!firstName) errors.firstName = "First name is required"
    if (!lastName) errors.lastName = "Last name is required"
    if (!email) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Please enter a valid email"
    if (!phone) errors.phone = "Phone number is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setFormErrors({})
    
    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) {
      showNotification('Please fix the form errors', 'error')
      return
    }

    setIsSubmitting(true)

    const contact = {
      firstName: formData.get("firstName").trim(),
      lastName: formData.get("lastName").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      company: formData.get("company")?.trim() || "",
      jobTitle: formData.get("jobTitle")?.trim() || "",
    };

    try {
      const res = await addClient(contact)

      if (res.success) {
        console.log("Client added successfully", res)
        showNotification('Client added successfully!', 'success')
        
        // ✅ Reset form using ref instead of e.currentTarget
        if (formRef.current) {
          formRef.current.reset()
        }
      } else {
        console.log("Failed to add client", res)
        showNotification(res.message || 'Failed to add client', 'error')
      }
    } catch (error) {
      console.error("Error adding client:", error)
      showNotification('An error occurred. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  };

  const dismissNotification = () => {
    setNotification(null)
    if (window.notificationTimeout) {
      clearTimeout(window.notificationTimeout)
    }
  }

  const handleCancel = () => {
    setFormErrors({})
    if (formRef.current) {
      formRef.current.reset()
    }
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

      {/* Top App Bar */}
      <div className="flex w-full max-w-4xl mx-auto mt-4 p-4 justify-center flex-col">
        <h1 className="text-3xl font-bold">
          Add New Contact
        </h1>
        <p className="text-lg text-gray-600">
          Enter the details for the new contact
        </p>
      </div>
      
      <main className='w-full max-w-4xl mx-auto'>
        <div className="bg-slate-500/10 p-6 rounded-lg ">
          {/* ✅ Add ref to form */}
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Personal Info */}
            <div className="flex flex-col gap-2">
              <h1 className="text-xl border-b border-slate-500/30 pb-2 mb-4 font-bold">Personal Info</h1>
              <div className="sm:flex sm:gap-4 w-full">
                <div className="flex flex-col gap-2 sm:w-1/2 w-full">
                  <label htmlFor="firstName" className="text-[10px] tracking-wider uppercase">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className={`border ${formErrors.firstName ? 'border-red-500' : 'border-slate-500/30'} rounded-lg p-2 w-full pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50`} 
                      type="text" 
                      name="firstName" 
                      id="firstName"
                      placeholder="Enter first name"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {formErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:w-1/2 w-full">
                  <label htmlFor="lastName" className="text-[10px] tracking-wider uppercase">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className={`border ${formErrors.lastName ? 'border-red-500' : 'border-slate-500/30'} rounded-lg p-2 w-full pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50`} 
                      type="text" 
                      name="lastName" 
                      id="lastName"
                      placeholder="Enter last name"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  {formErrors.lastName && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-2">
              <h1 className="text-xl border-b border-slate-500/30 pb-2 mb-4 font-bold">Contact Info</h1>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="uppercase text-[10px] tracking-wider">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    className={`border ${formErrors.email ? 'border-red-500' : 'border-slate-500/30'} rounded-lg p-2 w-full pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50`} 
                    type="email" 
                    name="email" 
                    id="email"
                    placeholder="Enter email address"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="uppercase text-[10px] tracking-wider">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    className={`border ${formErrors.phone ? 'border-red-500' : 'border-slate-500/30'} rounded-lg p-2 w-full pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50`} 
                    type="text" 
                    name="phone" 
                    id="phone"
                    placeholder="Enter phone number"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                {formErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="flex flex-col gap-2">
              <h1 className="text-xl border-b border-slate-500/30 pb-2 mb-4 font-bold">Company Info</h1>
              <div className="sm:flex sm:gap-4 w-full">
                <div className="flex flex-col gap-2 sm:w-1/2 w-full">
                  <label htmlFor="company" className="uppercase text-[10px]">Company</label>
                  <div className="relative">
                    <input 
                      className="border border-slate-500/30 rounded-lg p-2 w-full pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                      type="text" 
                      name="company" 
                      id="company"
                      placeholder="Enter company name"
                    />
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:w-1/2 w-full">
                  <label htmlFor="jobTitle" className="uppercase text-[10px]">Job Title</label>
                  <div className="relative">
                    <input 
                      className="border border-slate-500/30 rounded-lg p-2 w-full pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                      type="text" 
                      name="jobTitle" 
                      id="jobTitle"
                      placeholder="Enter job title"
                    />
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-8 justify-center w-full sm:justify-end">
              <button 
                className={`bg-slate-600 hover:bg-slate-700 text-white px-8 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`} 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Contact
                  </>
                )}
              </button>
              <button 
                className="bg-slate-500/10 hover:bg-slate-500/20 px-8 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors" 
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddContact;