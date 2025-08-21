import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Search, X, CheckCircle, Clock, AlertCircle, IdCard, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TrackingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ApplicationStatus {
  trackingNumber: string;
  applicantName: string;
  membershipType: string;
  submittedDate: string;
  status: 'submitted' | 'verified' | 'approved' | 'rejected';
  membershipId?: string;
  rejectionReason?: string;
}

const STATUS_CONFIG = {
  submitted: {
    icon: Clock,
    label: 'Under Review',
    color: 'bg-orange-100 text-orange-800',
    description: 'Your application is being reviewed by District GS'
  },
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    color: 'bg-blue-100 text-blue-800',
    description: 'Application verified, awaiting State GS approval'
  },
  approved: {
    icon: CheckCircle,
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    description: 'Membership approved and ID card sent'
  },
  rejected: {
    icon: AlertCircle,
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    description: 'Application rejected'
  }
};

export function TrackingModal({ open, onOpenChange }: TrackingModalProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const { toast } = useToast();

  const trackMutation = useMutation({
    mutationFn: async (trackingNum: string) => {
      const response = await apiRequest('GET', `/api/track/${trackingNum}`);
      return response.json();
    },
    onSuccess: (data) => {
      setApplicationStatus(data);
    },
    onError: (error: any) => {
      console.error('Tracking error:', error);
      setApplicationStatus(null);
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      trackMutation.mutate(trackingNumber.trim());
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTrackingNumber('');
    setApplicationStatus(null);
  };

  const handleDownloadIdCard = async () => {
    if (!applicationStatus?.membershipId) return;
    
    try {
      const response = await fetch(`/api/download-id-card/${applicationStatus.trackingNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to download ID card');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HCMS-ID-Card-${applicationStatus.membershipId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: 'Your membership ID card is being downloaded.',
      });
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message || 'Failed to download ID card',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Track Application
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex space-x-4">
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number (e.g., HCMS-2024-001234)"
              className="flex-1"
              required
            />
            <Button 
              type="submit" 
              disabled={trackMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {trackMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Track
            </Button>
          </form>

          {/* Error State */}
          {trackMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-red-800">Application Not Found</p>
                  <p className="text-sm text-red-700">
                    Please check your tracking number and try again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Application Status */}
          {applicationStatus && (
            <div className="space-y-6">
              {/* Application Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Applicant Name</p>
                    <p className="font-medium">{applicationStatus.applicantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Application Type</p>
                    <p className="font-medium">{applicationStatus.membershipType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted Date</p>
                    <p className="font-medium">
                      {new Date(applicationStatus.submittedDate).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <Badge className={STATUS_CONFIG[applicationStatus.status].color}>
                      {STATUS_CONFIG[applicationStatus.status].label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Progress</h3>
                <div className="space-y-4">
                  {/* Application Submitted */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-green-800">Application Submitted</p>
                      <p className="text-sm text-green-600">
                        {new Date(applicationStatus.submittedDate).toLocaleDateString('en-GB')}
                      </p>
                      <p className="text-sm text-gray-500">Payment of ₹2,000 received successfully</p>
                    </div>
                  </div>

                  {/* District GS Review */}
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      ['verified', 'approved'].includes(applicationStatus.status) 
                        ? 'bg-green-500' 
                        : applicationStatus.status === 'rejected'
                        ? 'bg-red-500'
                        : 'bg-orange-500'
                    }`}>
                      {['verified', 'approved'].includes(applicationStatus.status) ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : applicationStatus.status === 'rejected' ? (
                        <X className="h-4 w-4 text-white" />
                      ) : (
                        <Clock className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`font-medium ${
                        ['verified', 'approved'].includes(applicationStatus.status) 
                          ? 'text-green-800'
                          : applicationStatus.status === 'rejected'
                          ? 'text-red-800' 
                          : 'text-orange-800'
                      }`}>
                        District GS Review
                      </p>
                      <p className={`text-sm ${
                        ['verified', 'approved'].includes(applicationStatus.status) 
                          ? 'text-green-600'
                          : applicationStatus.status === 'rejected'
                          ? 'text-red-600' 
                          : 'text-orange-600'
                      }`}>
                        {applicationStatus.status === 'rejected' ? 'Rejected' : 
                         ['verified', 'approved'].includes(applicationStatus.status) ? 'Verified' : 'In Progress'}
                      </p>
                      {applicationStatus.status === 'rejected' && applicationStatus.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Reason: {applicationStatus.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* State GS Approval */}
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      applicationStatus.status === 'approved' 
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}>
                      {applicationStatus.status === 'approved' ? (
                        <CheckCircle className="h-4 w-4 text-white" />
                      ) : (
                        <Clock className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`font-medium ${
                        applicationStatus.status === 'approved' ? 'text-green-800' : 'text-gray-600'
                      }`}>
                        State GS Approval
                      </p>
                      <p className={`text-sm ${
                        applicationStatus.status === 'approved' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {applicationStatus.status === 'approved' 
                          ? 'Approved' 
                          : applicationStatus.status === 'verified'
                          ? 'Pending approval'
                          : 'Will be processed after verification'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Membership ID Generation */}
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      applicationStatus.status === 'approved' && applicationStatus.membershipId
                        ? 'bg-green-500' 
                        : 'bg-gray-300'
                    }`}>
                      <IdCard className="h-4 w-4 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`font-medium ${
                        applicationStatus.status === 'approved' && applicationStatus.membershipId 
                          ? 'text-green-800' 
                          : 'text-gray-600'
                      }`}>
                        Membership ID Generation
                      </p>
                      {applicationStatus.membershipId ? (
                        <div>
                          <p className="text-sm text-green-600">ID Card Generated</p>
                          <p className="text-sm font-mono text-green-700 mt-1">
                            ID: {applicationStatus.membershipId}
                          </p>
                          <Button
                            onClick={handleDownloadIdCard}
                            className="mt-2 bg-primary hover:bg-primary/90 text-sm h-8"
                            size="sm"
                          >
                            <Download className="h-3 w-3 mr-2" />
                            Download ID Card
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Will be generated after approval
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Estimated Timeline */}
              {applicationStatus.status !== 'approved' && applicationStatus.status !== 'rejected' && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Estimated Timeline
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>District Review:</strong> 5-7 working days</p>
                    <p><strong>State Approval:</strong> 3-5 working days after verification</p>
                    <p><strong>ID Card Generation:</strong> 1-2 working days after approval</p>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Need Help?</p>
                    <p className="text-sm text-yellow-700">
                      Contact support at support@hcms.gov.in or call +91-471-xxx-xxxx
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
