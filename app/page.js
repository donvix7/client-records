"use client";

import React from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import { PlusCircle, User, Shield, CheckCircle, Clock, Mail } from 'lucide-react';
import Link from 'next/link';

const HomePage = () => {
  const router = useRouter();

  const handleAddDetails = () => {
    router.push('/add-client');
  };

  const handleRequestAccess = () => {
    console.log('Request access credentials');
    alert('Access request submitted! We\'ll review your request within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navigation />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6 border border-blue-100">
            <User className="w-10 h-10 text-blue-700" strokeWidth={1.5} />
          </div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield size={16} />
            <span>Secure Corporate Access</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-900 leading-tight tracking-tight mb-4">
            Corporate Directory
            <span className="font-semibold text-blue-700 block sm:inline"> Access</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto mb-10 font-light leading-relaxed">
            Register your details to gain access to our corporate administrative directory. 
            Your information will be securely stored for future invitations and updates.
          </p>

          {/* Primary CTA */}
          <Link 
            href={'/add-client'}
            className="inline-flex items-center gap-3 bg-blue-700 text-white px-8 py-4 rounded-xl font-medium text-base hover:bg-blue-800 transition-all duration-200 shadow-lg shadow-blue-700/30 hover:shadow-blue-700/40 active:scale-[0.98]"
          >
            <PlusCircle size={22} />
            <span>Add Your Details</span>
          </Link>

          {/* Secondary Action */}
          <div className="mt-6">
            <button 
              onClick={handleRequestAccess}
              className="text-sm text-gray-500 hover:text-blue-700 transition-colors border-b-2 border-transparent hover:border-blue-700 pb-0.5"
            >
              Need help? Request access credentials
            </button>
          </div>
        </div>

        {/* Benefits Section - NEW */}
        <div className="w-full max-w-3xl mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            Why Register?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-blue-700" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">Secure Storage</h3>
              <p className="text-sm text-gray-500 font-light">
                Your data is encrypted and stored securely
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-700" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">Future Invites</h3>
              <p className="text-sm text-gray-500 font-light">
                Get invited to exclusive company events
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-700" strokeWidth={1.5} />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">Stay Updated</h3>
              <p className="text-sm text-gray-500 font-light">
                Receive important announcements and updates
              </p>
            </div>
          </div>
        </div>

        {/* Simple FAQ - NEW */}
        <div className="w-full max-w-2xl mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                What happens after I register?
              </h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                Your information is reviewed and added to our secure directory. 
                You'll receive a confirmation email and start getting invites.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                How is my data used?
              </h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                Your data is used exclusively for company communications, 
                event invitations, and directory access. Never shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2 font-light">
          <Shield size={14} />
          <span>Secure Corporate Environment • Your data is protected</span>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;