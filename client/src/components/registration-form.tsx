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
import { DISTRICTS, DIRECTORATES, MEMBERSHIP_TYPES, GENDER_OPTIONS } from '@/lib/constants';

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
  aadhaar: z.string().regex(/^\d{4}\s\d{4}\s\d{4}$/, 'Aadhaar should be in format: 1234 5678 9012'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  address: z.string().min(1, 'Address is required'),
  designation: z.string().min(1, 'Designation is required'),
  directorate: z.enum(['DME', 'DMRHS', 'DPH&PM', 'ESI', 'Other'], { required_error: 'Please select directorate' }),
  otherDirectorate: z.string().optional(),
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
      directorate: undefined,
      otherDirectorate: '',
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
    const fields = [
      'name', 'email', 'qualification', 'dob', 'gender', 'aadhaar',
      'joiningDate', 'address', 'designation', 'directorate', 'workingStation', 'district', 'membershipType'
    ];
    
    const values = form.getValues();
    const errors: string[] = [];
    
    fields.forEach(field => {
      if (!values[field as keyof FormData]) {
        errors.push(field);
      }
    });

    if (values.directorate === 'Other' && !values.otherDirectorate) {
      errors.push('otherDirectorate');
    }

    if (errors.length > 0) {
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
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        {...form.register('name')}
                        placeholder="Name followed by Initial (no prefix Dr, no space/comma)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: John A (no prefix, no comma)</p>
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        placeholder="your.email@domain.com"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="qualification">Qualification *</Label>
                      <Input
                        id="qualification"
                        {...form.register('qualification')}
                        placeholder="MBBS DTD MD RESPIRATORY MEDICINE"
                      />
                      <p className="text-xs text-gray-500 mt-1">No full stops or commas</p>
                      {form.formState.errors.qualification && (
                        <p className="text-sm text-red-600">{form.formState.errors.qualification.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        {...form.register('dob')}
                      />
                      {form.formState.errors.dob && (
                        <p className="text-sm text-red-600">{form.formState.errors.dob.message}</p>
                      )}
                    </div>

                    <div>
                      <Label>Gender *</Label>
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
                      <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                      <Input
                        id="aadhaar"
                        {...form.register('aadhaar')}
                        placeholder="1234 5678 9012"
                        maxLength={14}
                        onChange={(e) => {
                          const formatted = formatAadhaar(e.target.value);
                          form.setValue('aadhaar', formatted);
                        }}
                      />
                      {form.formState.errors.aadhaar && (
                        <p className="text-sm text-red-600">{form.formState.errors.aadhaar.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="joiningDate">Date of Joining into Service *</Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        {...form.register('joiningDate')}
                      />
                      {form.formState.errors.joiningDate && (
                        <p className="text-sm text-red-600">{form.formState.errors.joiningDate.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="designation">Current Designation *</Label>
                      <Input
                        id="designation"
                        {...form.register('designation')}
                        placeholder="Senior Medical Officer"
                      />
                      {form.formState.errors.designation && (
                        <p className="text-sm text-red-600">{form.formState.errors.designation.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Permanent Residential Address *</Label>
                    <Textarea
                      id="address"
                      {...form.register('address')}
                      placeholder="Enter your complete permanent address"
                      rows={3}
                    />
                    {form.formState.errors.address && (
                      <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="directorate">Working Directorate *</Label>
                      <Select
                        value={form.watch('directorate')}
                        onValueChange={(value) => form.setValue('directorate', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Directorate" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIRECTORATES.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.directorate && (
                        <p className="text-sm text-red-600">{form.formState.errors.directorate.message}</p>
                      )}
                    </div>

                    {form.watch('directorate') === 'Other' && (
                      <div>
                        <Label htmlFor="otherDirectorate">Specify Other Directorate *</Label>
                        <Input
                          id="otherDirectorate"
                          {...form.register('otherDirectorate')}
                          placeholder="Please specify"
                        />
                        {form.formState.errors.otherDirectorate && (
                          <p className="text-sm text-red-600">{form.formState.errors.otherDirectorate.message}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="workingStation">Current Working Station *</Label>
                      <Input
                        id="workingStation"
                        {...form.register('workingStation')}
                        placeholder="Hospital/Clinic Name"
                      />
                      {form.formState.errors.workingStation && (
                        <p className="text-sm text-red-600">{form.formState.errors.workingStation.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="district">Current Working District *</Label>
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
                    <Label>Membership Type *</Label>
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
                    onFileChange={(file) => setFiles(prev => ({ ...prev, photo: file }))}
                    accept=".jpg,.jpeg,.png"
                    maxSize={2}
                    required
                  />

                  <FileUpload
                    type="idCard"
                    file={files.idCard}
                    onFileChange={(file) => setFiles(prev => ({ ...prev, idCard: file }))}
                    accept=".jpg,.jpeg,.png,.pdf"
                    maxSize={5}
                    required
                  />

                  <FileUpload
                    type="signature"
                    file={files.signature}
                    onFileChange={(file) => setFiles(prev => ({ ...prev, signature: file }))}
                    accept=".jpg,.jpeg,.png"
                    maxSize={1}
                    required
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
