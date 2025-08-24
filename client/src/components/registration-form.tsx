import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { ArrowRight, ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from './file-upload';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { DISTRICTS, DIRECTORATES, MEMBERSHIP_TYPES, GENDER_OPTIONS, DESIGNATIONS, QUALIFICATIONS } from '@/lib/constants';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[A-Za-z\s]+$/, 'Name should contain only letters and spaces'),
  email: z.string().email('Invalid email format'),
  qualification: z.string().min(1, 'Qualification is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female'], { required_error: 'Please select gender' }),
  spouseName: z.string().optional(),
  panNumber: z.string().min(1, 'PAN Number is required').regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN should be in format: ABCDE1234F'),
  aadhaar: z.string().regex(/^\d{4}\s\d{4}\s\d{4}$/, 'Aadhaar should be in format: 1234 5678 9012'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  address: z.string().min(1, 'Address is required'),
  designation: z.string().min(1, 'Designation is required'),
  directorate: z.string().min(1, 'Directorate is required'),
  workingStation: z.string().min(1, 'Working station is required'),
  district: z.string().min(1, 'District is required'),
  membershipType: z.enum(['New Membership', 'Annual Subscription fee'], { required_error: 'Please select membership type' })
});

type FormData = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  onSuccess: (trackingNumber: string, memberData: any) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<{
    photo: File | null;
    idCard: File | null;
    signature: File | null;
  }>({
    photo: null,
    idCard: null,
    signature: null
  });
  
  const [uploadStates, setUploadStates] = useState<{
    photo: { isUploading: boolean; progress: number };
    idCard: { isUploading: boolean; progress: number };
    signature: { isUploading: boolean; progress: number };
  }>({
    photo: { isUploading: false, progress: 0 },
    idCard: { isUploading: false, progress: 0 },
    signature: { isUploading: false, progress: 0 }
  });

  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      qualification: '',
      dob: '',
      gender: undefined,
      aadhaar: '',
      joiningDate: '',
      address: '',
      designation: '',
      directorate: '',
      workingStation: '',
      district: '',
      membershipType: undefined
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      // Add files
      if (files.photo) formData.append('photo', files.photo);
      if (files.idCard) formData.append('idCard', files.idCard);
      if (files.signature) formData.append('signature', files.signature);

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // After successful registration, proceed to payment
      initiatePayment(data.trackingNumber, data.member);
    },
    onError: (error: any) => {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ trackingNumber }: { trackingNumber: string }) => {
      const response = await apiRequest('POST', '/api/payment/create-order', {
        trackingNumber,
        amount: 2000
      });
      return response.json();
    }
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest('POST', '/api/payment/verify', paymentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Payment Successful',
        description: 'Registration completed successfully!',
        variant: 'default'
      });
    }
  });

  const initiatePayment = async (trackingNumber: string, memberData: any) => {
    try {
      const orderData = await paymentMutation.mutateAsync({ trackingNumber });
      
      const options = {
        key: orderData.key,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        name: 'HCMS Registration',
        description: 'Membership Registration Fee',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            await verifyPaymentMutation.mutateAsync({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              trackingNumber
            });
            onSuccess(trackingNumber, memberData);
          } catch (error) {
            toast({
              title: 'Payment Verification Failed',
              description: 'Please contact support',
              variant: 'destructive'
            });
          }
        },
        prefill: {
          name: memberData.name,
          email: memberData.email,
        },
        notes: {
          trackingNumber
        },
        theme: {
          color: '#2563eb'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast({
        title: 'Payment Setup Failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const validateStep1 = () => {
    const requiredFields = [
      'name', 'email', 'qualification', 'dob', 'gender', 'panNumber', 'aadhaar',
      'joiningDate', 'address', 'designation', 'directorate', 'workingStation', 'district', 'membershipType'
    ];
    
    const values = form.getValues();
    let hasErrors = false;
    
    // Clear previous errors
    form.clearErrors();
    
    requiredFields.forEach(field => {
      const value = values[field as keyof FormData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        form.setError(field as any, { 
          type: 'required', 
          message: 'This field is required' 
        });
        hasErrors = true;
      }
    });

    if (hasErrors) {
      toast({
        title: 'Please fill in all required fields',
        description: 'All fields marked with * are mandatory',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!files.photo || !files.idCard || !files.signature) {
      toast({
        title: 'Please upload all required documents',
        description: 'Photo, ID Card, and Signature are mandatory',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = () => {
    if (validateStep2()) {
      const formData = form.getValues();
      registerMutation.mutate(formData);
    }
  };

  const formatAadhaar = (value: string) => {
    const cleanedValue = value.replace(/\s/g, '').replace(/\D/g, '');
    const formattedValue = cleanedValue.substring(0, 12);
    return formattedValue.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-300 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step <= currentStep ? 'text-primary' : 'text-gray-500'
                  }`}>
                    {step === 1 ? 'Personal Info' : step === 2 ? 'Documents' : 'Payment'}
                  </span>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      step < currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="font-bold">Full Name *</Label>
                      <Input
                        id="name"
                        {...form.register('name')}
                        placeholder="Enter your full name"
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Enter your full name'}
                        className={form.formState.errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="font-bold">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        placeholder="Enter your email address"
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Enter your email address'}
                        className={form.formState.errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="qualification" className="font-bold">Medical Qualification *</Label>
                      <Input
                        id="qualification"
                        {...form.register('qualification')}
                        placeholder="Enter your medical qualification (e.g., MBBS, MBBS MD)"
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Enter your medical qualification (e.g., MBBS, MBBS MD)'}
                        className={form.formState.errors.qualification ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {form.formState.errors.qualification && (
                        <p className="text-sm text-red-600">{form.formState.errors.qualification.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="dob" className="font-bold">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        {...form.register('dob')}
                        className={form.formState.errors.dob ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {form.formState.errors.dob && (
                        <p className="text-sm text-red-600">{form.formState.errors.dob.message}</p>
                      )}
                    </div>

                    <div>
                      <Label className="font-bold">Gender *</Label>
                      <RadioGroup
                        value={form.watch('gender')}
                        onValueChange={(value) => form.setValue('gender', value as 'Male' | 'Female')}
                        className="flex space-x-6 mt-2"
                      >
                        {GENDER_OPTIONS.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value}>{option.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                      {form.formState.errors.gender && (
                        <p className="text-sm text-red-600">{form.formState.errors.gender.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="spouseName" className="font-bold">Name of Spouse (If Married)</Label>
                      <Input
                        id="spouseName"
                        {...form.register('spouseName')}
                        placeholder="Enter spouse name if married"
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Enter spouse name if married'}
                      />
                      {form.formState.errors.spouseName && (
                        <p className="text-sm text-red-600">{form.formState.errors.spouseName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="panNumber" className="font-bold">PAN Number *</Label>
                      <Input
                        id="panNumber"
                        {...form.register('panNumber')}
                        placeholder="Enter 10-character PAN number"
                        maxLength={10}
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Enter 10-character PAN number'}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          form.setValue('panNumber', value);
                        }}
                        className={form.formState.errors.panNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: ABCDE1234F</p>
                      {form.formState.errors.panNumber && (
                        <p className="text-sm text-red-600">{form.formState.errors.panNumber.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="aadhaar" className="font-bold">Aadhaar Number *</Label>
                      <Input
                        id="aadhaar"
                        {...form.register('aadhaar')}
                        placeholder="Enter 12-digit Aadhaar number"
                        maxLength={14}
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Enter 12-digit Aadhaar number'}
                        onChange={(e) => {
                          const formatted = formatAadhaar(e.target.value);
                          form.setValue('aadhaar', formatted);
                        }}
                        className={form.formState.errors.aadhaar ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {form.formState.errors.aadhaar && (
                        <p className="text-sm text-red-600">{form.formState.errors.aadhaar.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="joiningDate" className="font-bold">Date of Joining into Service *</Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        {...form.register('joiningDate')}
                        className={form.formState.errors.joiningDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {form.formState.errors.joiningDate && (
                        <p className="text-sm text-red-600">{form.formState.errors.joiningDate.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="designation" className="font-bold">Current Designation *</Label>
                      <Input
                        id="designation"
                        {...form.register('designation')}
                        placeholder="Enter your current designation (e.g., Medical Officer)"
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Enter your current designation (e.g., Medical Officer)'}
                        className={form.formState.errors.designation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {form.formState.errors.designation && (
                        <p className="text-sm text-red-600">{form.formState.errors.designation.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="font-bold">Permanent Residential Address *</Label>
                    <Textarea
                      id="address"
                      {...form.register('address')}
                      placeholder="Enter your complete permanent address"
                      rows={3}
                      onFocus={(e) => e.target.placeholder = ''}
                      onBlur={(e) => e.target.placeholder = 'Enter your complete permanent address'}
                      className={form.formState.errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {form.formState.errors.address && (
                      <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="directorate" className="font-bold">Working Directorate *</Label>
                      <Input
                        id="directorate"
                        {...form.register('directorate')}
                        placeholder="Enter your working directorate (e.g., DMRHS, ESI)"
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Enter your working directorate (e.g., DMRHS, ESI)'}
                        className={form.formState.errors.directorate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {form.formState.errors.directorate && (
                        <p className="text-sm text-red-600">{form.formState.errors.directorate.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="workingStation" className="font-bold">Current Working Station *</Label>
                      <Input
                        id="workingStation"
                        {...form.register('workingStation')}
                        placeholder="Enter hospital/clinic name"
                        onFocus={(e) => e.target.placeholder = ''}
                        onBlur={(e) => e.target.placeholder = 'Enter hospital/clinic name'}
                        className={form.formState.errors.workingStation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                      />
                      {form.formState.errors.workingStation && (
                        <p className="text-sm text-red-600">{form.formState.errors.workingStation.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="district" className="font-bold">Current Working District *</Label>
                      <Select
                        value={form.watch('district')}
                        onValueChange={(value) => form.setValue('district', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {DISTRICTS.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.district && (
                        <p className="text-sm text-red-600">{form.formState.errors.district.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="font-bold">Membership Type *</Label>
                    <RadioGroup
                      value={form.watch('membershipType')}
                      onValueChange={(value) => form.setValue('membershipType', value as any)}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3"
                    >
                      {MEMBERSHIP_TYPES.map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={option.value}
                          className="flex items-center p-4 border border-gray-300 rounded-lg hover:border-primary cursor-pointer"
                        >
                          <RadioGroupItem value={option.value} id={option.value} className="mr-3" />
                          <div>
                            <span className="text-sm font-medium text-gray-700">{option.label}</span>
                            <p className="text-xs text-gray-500">{option.description}</p>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                    {form.formState.errors.membershipType && (
                      <p className="text-sm text-red-600">{form.formState.errors.membershipType.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                      Next: Upload Documents
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Document Upload</h2>
                
                <div className="space-y-8">
                  <FileUpload
                    type="photo"
                    file={files.photo}
                    onFileChange={(file) => {
                      if (file) {
                        // Start upload simulation
                        setUploadStates(prev => ({ 
                          ...prev, 
                          photo: { isUploading: true, progress: 0 } 
                        }));
                        
                        // Simulate upload progress
                        const interval = setInterval(() => {
                          setUploadStates(prev => {
                            const currentProgress = prev.photo.progress;
                            if (currentProgress >= 100) {
                              clearInterval(interval);
                              return {
                                ...prev,
                                photo: { isUploading: false, progress: 100 }
                              };
                            }
                            return {
                              ...prev,
                              photo: { isUploading: true, progress: currentProgress + 10 }
                            };
                          });
                        }, 200);
                      }
                      setFiles(prev => ({ ...prev, photo: file }));
                    }}
                    accept=".jpg,.jpeg,.png"
                    maxSize={2}
                    required
                    isUploading={uploadStates.photo.isUploading}
                    uploadProgress={uploadStates.photo.progress}
                  />

                  <FileUpload
                    type="idCard"
                    file={files.idCard}
                    onFileChange={(file) => {
                      if (file) {
                        // Start upload simulation
                        setUploadStates(prev => ({ 
                          ...prev, 
                          idCard: { isUploading: true, progress: 0 } 
                        }));
                        
                        // Simulate upload progress
                        const interval = setInterval(() => {
                          setUploadStates(prev => {
                            const currentProgress = prev.idCard.progress;
                            if (currentProgress >= 100) {
                              clearInterval(interval);
                              return {
                                ...prev,
                                idCard: { isUploading: false, progress: 100 }
                              };
                            }
                            return {
                              ...prev,
                              idCard: { isUploading: true, progress: currentProgress + 10 }
                            };
                          });
                        }, 200);
                      }
                      setFiles(prev => ({ ...prev, idCard: file }));
                    }}
                    accept=".jpg,.jpeg,.png,.pdf"
                    maxSize={5}
                    required
                    isUploading={uploadStates.idCard.isUploading}
                    uploadProgress={uploadStates.idCard.progress}
                  />

                  <FileUpload
                    type="signature"
                    file={files.signature}
                    onFileChange={(file) => {
                      if (file) {
                        // Start upload simulation
                        setUploadStates(prev => ({ 
                          ...prev, 
                          signature: { isUploading: true, progress: 0 } 
                        }));
                        
                        // Simulate upload progress
                        const interval = setInterval(() => {
                          setUploadStates(prev => {
                            const currentProgress = prev.signature.progress;
                            if (currentProgress >= 100) {
                              clearInterval(interval);
                              return {
                                ...prev,
                                signature: { isUploading: false, progress: 100 }
                              };
                            }
                            return {
                              ...prev,
                              signature: { isUploading: true, progress: currentProgress + 10 }
                            };
                          });
                        }, 200);
                      }
                      setFiles(prev => ({ ...prev, signature: file }));
                    }}
                    accept=".jpg,.jpeg,.png"
                    maxSize={1}
                    required
                    isUploading={uploadStates.signature.isUploading}
                    uploadProgress={uploadStates.signature.progress}
                  />
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                    Next: Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment</h2>
                
                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Membership Type:</span>
                      <span className="font-medium">{form.watch('membershipType')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration Fee:</span>
                      <span className="font-medium">₹2,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee:</span>
                      <span className="font-medium">₹0</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-primary">₹2,000</span>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-primary cursor-pointer">
                      <div className="text-3xl mb-2">📱</div>
                      <p className="font-medium">UPI</p>
                      <p className="text-sm text-gray-500">Google Pay, PhonePe, Paytm</p>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-primary cursor-pointer">
                      <div className="text-3xl mb-2">💳</div>
                      <p className="font-medium">Debit/Credit Card</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, RuPay</p>
                    </div>
                    <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-primary cursor-pointer">
                      <div className="text-3xl mb-2">🏦</div>
                      <p className="font-medium">Net Banking</p>
                      <p className="text-sm text-gray-500">All major banks</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={registerMutation.isPending || paymentMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {registerMutation.isPending || paymentMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    Pay ₹2,000
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
