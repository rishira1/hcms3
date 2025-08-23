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
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Haryana Civil Medical Services Association</h1>
          <p className="text-xl text-primary-foreground/80 mb-8">Professional Membership Registration</p>
          <div className="bg-white/10 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl mb-2">👨‍⚕️</div>
                <p className="font-medium">Professional</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <p className="font-medium">Verified</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <p className="font-medium">Certified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <RegistrationForm onSuccess={handleRegistrationSuccess} />
      
      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p>Created by <span className="font-semibold">Rishi Software Services</span></p>
            <p className="mt-1">In cooperation with <span className="font-semibold">Dr. Kuldeep, Joint Secretary HCMSA Karnal</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
