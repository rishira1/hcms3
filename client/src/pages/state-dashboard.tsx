import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle, 
  Calendar, 
  IdCard, 
  Users, 
  Eye, 
  LogOut,
  Download,
  FileText,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  trackingNumber: string;
  name: string;
  email: string;
  district: string;
  membershipType: string;
  status: 'submitted' | 'verified' | 'approved' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
  photoUrl: string;
  qualification: string;
  designation: string;
  workingStation: string;
  membershipId?: string;
}

interface StateStats {
  verified: number;
  approved: number;
  idsGenerated: number;
  thisMonth: number;
  totalMembers: number;
}

export default function StateDashboard() {
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null);

  const { user, logout, getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch verified applications awaiting approval
  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['/api/admin/applications', 'verified'],
    queryFn: async () => {
      const authHeaders = getAuthHeaders();
      const response = await fetch('/api/admin/applications?status=verified', {
        headers: authHeaders,
      });
      
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      return data.applications;
    },
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const authHeaders = getAuthHeaders();
      const response = await fetch('/api/admin/stats', {
        headers: authHeaders,
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  // Approve and generate ID mutation
  const approveMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const authHeaders = getAuthHeaders();
      const response = await fetch(`/api/admin/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve application');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: 'Application Approved',
        description: `Membership ID ${data.membershipId} generated and sent to applicant.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Approval Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleApprove = (application: Application) => {
    approveMutation.mutate(application.id);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      verified: { label: 'Verified', className: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
    };
    
    const config = configs[status as keyof typeof configs] || configs.verified;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">State GS Dashboard</h1>
            <p className="text-gray-600">Approve verified applications and generate membership IDs</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <Button onClick={logout} variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified Applications</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.verified || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">IDs Generated</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.idsGenerated || 0}</p>
                </div>
                <IdCard className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.thisMonth || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-primary">{stats?.totalMembers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 text-yellow-500 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-blue-700 hover:bg-blue-50">
                <Download className="h-4 w-4 mr-2" />
                Export Member List
              </Button>
              <Button variant="outline" className="w-full justify-start text-green-700 hover:bg-green-50">
                <FileText className="h-4 w-4 mr-2" />
                Bulk ID Generation
              </Button>
              <Button variant="outline" className="w-full justify-start text-purple-700 hover:bg-purple-50">
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Reports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Approved 5 applications</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Generated 3 ID cards</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Sent 8 notifications</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 text-orange-500 mr-2" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Awaiting Approval</span>
                <span className="font-medium text-orange-600">{stats?.verified || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID Card Pending</span>
                <span className="font-medium text-blue-600">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email Notifications</span>
                <span className="font-medium text-purple-600">0</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verified Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Verified Applications for Approval</CardTitle>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No verified applications pending approval</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tracking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        District GS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verified Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Membership ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((application: Application) => (
                      <tr key={application.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={application.photoUrl}
                                alt={application.name}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(application.name)}&background=e5e7eb&color=6b7280`;
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {application.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {application.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {application.trackingNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {application.district} GS
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {application.verifiedAt ? 
                            new Date(application.verifiedAt).toLocaleDateString('en-GB') : 
                            'N/A'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {application.membershipId ? (
                            <Badge className="bg-green-100 text-green-800">
                              {application.membershipId}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400 italic">To be generated</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          {application.status === 'verified' && !application.membershipId && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove(application)}
                              disabled={approveMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {approveMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Approve & Generate ID
                            </Button>
                          )}
                          
                          {application.membershipId && (
                            <span className="text-green-600 text-sm flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Application Details Modal */}
      <Dialog 
        open={!!viewingApplication} 
        onOpenChange={() => setViewingApplication(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          
          {viewingApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p className="text-sm font-medium">{viewingApplication.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-sm">{viewingApplication.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Qualification</Label>
                  <p className="text-sm">{viewingApplication.qualification}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Designation</Label>
                  <p className="text-sm">{viewingApplication.designation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Working Station</Label>
                  <p className="text-sm">{viewingApplication.workingStation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">District</Label>
                  <p className="text-sm">{viewingApplication.district}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Membership Type</Label>
                  <p className="text-sm">{viewingApplication.membershipType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  {getStatusBadge(viewingApplication.status)}
                </div>
                {viewingApplication.membershipId && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Membership ID</Label>
                    <p className="text-sm font-mono">{viewingApplication.membershipId}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
