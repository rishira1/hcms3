import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { CheckCircle, Mail, Search, Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RegistrationData {
  trackingNumber: string;
  memberData: {
    id: string;
    name: string;
    email: string;
    membershipType: string;
  };
}

export default function Confirmation() {
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedData = sessionStorage.getItem('registration_success');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setRegistrationData(data);
        // Clear the stored data
        sessionStorage.removeItem('registration_success');
      } catch (error) {
        console.error('Error parsing registration data:', error);
        setLocation('/');
      }
    } else {
      setLocation('/');
    }
  }, [setLocation]);

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="overflow-hidden shadow-lg">
          {/* Success Header */}
          <div className="bg-green-50 px-6 py-8 text-center border-b border-green-200">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">Registration Successful!</h1>
            <p className="text-green-700">Your membership application has been submitted successfully.</p>
          </div>

          <CardContent className="px-6 py-8">
            {/* Tracking Number */}
            <div className="text-center mb-8">
              <div className="bg-primary/5 rounded-lg p-6 inline-block">
                <p className="text-sm text-gray-600 mb-1">Your Application Tracking Number</p>
                <p className="text-2xl font-mono font-bold text-primary">
                  {registrationData.trackingNumber}
                </p>
              </div>
            </div>

            {/* Application Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Applicant Name</p>
                  <p className="font-medium">{registrationData.memberData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium">{registrationData.memberData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Application Type</p>
                  <p className="font-medium">{registrationData.memberData.membershipType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Paid
                  </Badge>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">
                  <Info className="h-5 w-5 inline mr-2" />
                  What Happens Next?
                </h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Step 1:</strong> District GS will verify your application within 5-7 working days</p>
                  <p><strong>Step 2:</strong> State GS will approve verified applications within 3-5 working days</p>
                  <p><strong>Step 3:</strong> You will receive your membership ID card via email upon approval</p>
                </div>
              </div>

              {/* Email Notification */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Confirmation Email Sent</p>
                    <p className="text-sm text-yellow-700">Check your email for detailed confirmation and tracking instructions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
                <Link href="/">
                  <Search className="h-4 w-4 mr-2" />
                  Track Application Status
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
