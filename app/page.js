"use client";

import React from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import { PlusCircle, User } from 'lucide-react';
import Link from 'next/link';

const HomePage = () => {
  const router = useRouter();

  const handleAddDetails = () => {
    router.push('/add-client');
  };

  const handleRequestAccess = () => {
    // Handle request access logic
    console.log('Request access credentials');
    // You could open a modal, send an email, etc.
    alert('Access request submitted!');
  };

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface flex flex-col font-body-md">
      <Navigation />
      
      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-sm mx-auto px-margin-mobile flex flex-col gap-3 items-center justify-center text-center">
        {/* Header Group */}
        <div className="mb-lg flex flex-col gap-4 items-center space-y-sm">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant mb-sm shadow-sm">
            <User className='w-8 h-8'/>
          </div>
          
          {/* Heading */}
          <h1 className="text-2xl font-bold text-primary">
            Directory Access
          </h1>
          <p className="text-lg font-medium text-on-surface-variant max-w-[280px]">
            Authentication required to access the corporate administrative directory. 
            Please establish your identity.
          </p>
        </div>

        {/* Action Button */}
      <Link 
  href={'/add-client'}
  className="relative w-fit p-2 px-8 h-[48px] bg-blue-600 rounded-lg text-label-md font-label-md flex gap-2 items-center justify-center space-x-sm hover:bg-blue-700 transition-colors duration-200 active:scale-[0.98] overflow-hidden group"
>
  {/* Glow pulse - stops on hover */}
  <div className="absolute inset-0 group-hover:opacity-0 transition-opacity duration-300">
    <div className="absolute inset-[-2px] rounded-lg bg-gradient-to-r from-blue-400 via-blue-200 to-blue-400 animate-pulse"></div>
    <div className="absolute inset-[2px] rounded-lg bg-blue-600"></div>
  </div>
  
  <PlusCircle className='w-8 h-8 relative z-10'/>
  <span className="relative z-10">Add Your Details</span>
</Link>

        {/* Secondary Action (Subtle) */}
        <div className="mt-md">
          <button 
            onClick={handleRequestAccess}
            className="text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Request Access Credentials
          </button>
        </div>
      </main>

      {/* Footer / Meta Data */}
      <footer className="w-full py-md text-center border-t border-outline-variant bg-surface-container-low">
        <p className="text-body-sm font-body-sm text-on-surface-variant flex items-center justify-center gap-xs">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Secure Corporate Environment
        </p>
      </footer>
    </div>
  );
};

export default HomePage;