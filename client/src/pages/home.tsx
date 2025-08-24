import { useState } from 'react';
import { RegistrationForm } from '@/components/registration-form';
import { useLocation } from 'wouter';

export default function Home() {
  const [, setLocation] = useLocation();

  const handleRegistrationSuccess = (trackingNumber: string, memberData: any) => {
    // Store data for confirmation page
    sessionStorage.setItem('registration_success', JSON.stringify({
      trackingNumber,
      memberData
    }));
    setLocation('/confirmation');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
            Haryana Civil Medical Services Association
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-6 sm:mb-8">
            Professional Membership Registration
          </p>
          <div className="bg-white/10 rounded-lg p-4 sm:p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 sm:space-x-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">👨‍⚕️</div>
                <p className="font-medium text-sm sm:text-base">Professional</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🛡️</div>
                <p className="font-medium text-sm sm:text-base">Verified</p>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🏆</div>
                <p className="font-medium text-sm sm:text-base">Certified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <RegistrationForm onSuccess={handleRegistrationSuccess} />
      
      {/* Footer */}
      <footer className="mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs sm:text-sm text-gray-600">
            <p>Developed by <span className="font-semibold">Rishi Software Services</span></p>
            <p className="mt-1">In cooperation with <span className="font-semibold">Dr. Kuldeep</span>, Joint Secretary HCMSA Karnal</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
