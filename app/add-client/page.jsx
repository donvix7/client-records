"use client";

import React, { useRef } from "react";
import { 
  Save, 
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

  const inputClass = (hasError) => `w-full rounded-lg border bg-[#FCFEFF] px-4.5 py-3 focus:outline-none ${
    hasError ? 'border-error' : 'border-primary-200'
  }`

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
              <span className="text-red-600 flex-shrink-0 font-bold">✕</span>
            )}
            <span className="flex-1">{notification.message}</span>
            <button 
              onClick={dismissNotification}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors flex-shrink-0"
            >
              <span className="text-gray-500">✕</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutrals-900 hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary font-sans">
            Add Your Details
          </h1>
          <p className="text-lg text-neutrals-900 font-mono">
            Register to receive invitations for future company events and updates
          </p>
        </div>
      </div>
      
      <main className='w-full max-w-2xl mx-auto px-4 sm:px-6 pb-12'>
        {/* Trust Banner */}
        <div className="bg-primary-100 border border-primary-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-primary font-medium font-sans">Your data is secure</p>
            <p className="text-sm text-primary-700 font-mono">
              Your information will be stored securely and used exclusively for company communications and event invitations.
            </p>
          </div>
        </div>

        <div className="bg-white border border-primary-200 rounded-xl p-6 sm:p-8">
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Personal Info */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-neutrals-900 uppercase tracking-wider border-b border-primary-200 pb-3 font-sans">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full flex flex-col space-y-2 font-mono">
                  <label htmlFor="firstName" className="text-sm text-black">
                    First Name <span className="text-error">*</span>
                  </label>
                  <input
                    className={inputClass(formErrors.firstName)}
                    type="text"
                    name="firstName"
                    id="firstName"
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && (
                    <span className="-mt-2 text-xs text-error">{formErrors.firstName}</span>
                  )}
                </div>

                <div className="w-full flex flex-col space-y-2 font-mono">
                  <label htmlFor="lastName" className="text-sm text-black">
                    Last Name <span className="text-error">*</span>
                  </label>
                  <input
                    className={inputClass(formErrors.lastName)}
                    type="text"
                    name="lastName"
                    id="lastName"
                    placeholder="Enter last name"
                  />
                  {formErrors.lastName && (
                    <span className="-mt-2 text-xs text-error">{formErrors.lastName}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-neutrals-900 uppercase tracking-wider border-b border-primary-200 pb-3 font-sans">
                Contact Information
              </h2>
              
              <div className="flex flex-col gap-4">
                <div className="w-full flex flex-col space-y-2 font-mono">
                  <label htmlFor="email" className="text-sm text-black">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <input
                    className={inputClass(formErrors.email)}
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <span className="-mt-2 text-xs text-error">{formErrors.email}</span>
                  )}
                </div>

                <div className="w-full flex flex-col space-y-2 font-mono">
                  <label htmlFor="phone" className="text-sm text-black">
                    Phone Number <span className="text-error">*</span>
                  </label>
                  <input
                    className={inputClass(formErrors.phone)}
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="Enter phone number"
                  />
                  {formErrors.phone && (
                    <span className="-mt-2 text-xs text-error">{formErrors.phone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-neutrals-900 uppercase tracking-wider border-b border-primary-200 pb-3 font-sans">
                Professional Information <span className="text-neutrals-900 font-normal lowercase">(optional)</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="w-full flex flex-col space-y-2 font-mono">
                  <label htmlFor="company" className="text-sm text-black">
                    Company Name
                  </label>
                  <input
                    className={inputClass(false)}
                    type="text"
                    name="company"
                    id="company"
                    placeholder="Enter company name"
                  />
                </div>

                <div className="w-full flex flex-col space-y-2 font-mono">
                  <label htmlFor="jobTitle" className="text-sm text-black">
                    Job Title
                  </label>
                  <input
                    className={inputClass(false)}
                    type="text"
                    name="jobTitle"
                    id="jobTitle"
                    placeholder="Enter job title"
                  />
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-3 bg-primary-100 rounded-lg p-4 border border-primary-200">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-primary-700 font-mono leading-relaxed">
                By submitting this form, you agree to have your information stored securely. 
                We&apos;ll use this to send you invitations for future company events, product launches, 
                and exclusive opportunities. You can update your preferences at any time.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-primary-200">
              <button 
                className={`flex-1 bg-primary text-white px-6 py-3 rounded-md font-semibold font-mono transition-all duration-200 hover:shadow-md hover:bg-primary-900 flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed disabled:bg-gray-300' : ''
                }`}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner-mini"></div>
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
                className="px-6 py-3 rounded-md font-semibold font-mono text-neutrals-900 hover:bg-primary-100/50 transition-colors border border-primary-200" 
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-neutrals-900 mt-6 font-mono">
          Need help? Contact our team at <a href="mailto:support@company.com" className="text-primary hover:underline">support@company.com</a>
        </p>
      </main>
    </div>
  );
};

export default AddContact;