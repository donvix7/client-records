"use client";

import React, { useRef } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Save, 
  X,
  Shield,
  CheckCircle,
  Info,
  ArrowLeft
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { addClient } from "@/utils/actions";
import { useState } from "react";
import Link from "next/link";

const AddContact = () => {
  const [notification, setNotification] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  
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
        showNotification('Your details have been saved! You\'ll receive invitations for future company events.', 'success')
        
        if (formRef.current) {
          formRef.current.reset()
        }
      } else {
        console.log("Failed to add client", res)
        showNotification(res.message || 'Failed to save your details. Please try again.', 'error')
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
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-light text-slate-900">
            Add Your Details
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Register to receive invitations for future company events and updates
          </p>
        </div>
      </div>
      
      <main className='w-full max-w-2xl mx-auto px-4 sm:px-6 pb-12'>
        {/* Trust Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium">Your data is secure</p>
            <p className="text-sm text-blue-700/80 font-light">
              Your information will be stored securely and used exclusively for company communications and event invitations.
            </p>
          </div>
        </div>

        <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-6 sm:p-8">
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Personal Info */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-3">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="text-xs font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${formErrors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`} 
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

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="text-xs font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${formErrors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`} 
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
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-3">
                Contact Information
              </h2>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${formErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`} 
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

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-xs font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${formErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`} 
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
            </div>

            {/* Company Info */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-200 pb-3">
                Professional Information <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="company" className="text-xs font-medium text-gray-700">
                    Company Name
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" 
                      type="text" 
                      name="company" 
                      id="company"
                      placeholder="Enter company name"
                    />
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="jobTitle" className="text-xs font-medium text-gray-700">
                    Job Title
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" 
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

            {/* Info Note */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                By submitting this form, you agree to have your information stored securely. 
                We'll use this to send you invitations for future company events, product launches, 
                and exclusive opportunities. You can update your preferences at any time.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button 
                className={`flex-1 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 hover:shadow-blue-700/30 ${
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
                    <Save className="w-5 h-5" />
                    Save Your Details
                  </>
                )}
              </button>
              <button 
                className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors" 
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-gray-400 mt-6 font-light">
          Need help? Contact our team at <a href="mailto:support@company.com" className="text-blue-700 hover:underline">support@company.com</a>
        </p>
      </main>
    </div>
  );
};

export default AddContact;