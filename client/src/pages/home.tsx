import { useState } from 'react';
import { useLocation } from 'wouter';
import { RegistrationForm } from '@/components/registration-form';
import { Search, Shield, Users, Award, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrackingModal } from '@/components/tracking-modal';

export default function Home() {
  const [, setLocation] = useLocation();
  const [showTracking, setShowTracking] = useState(false);

  const handleRegistrationSuccess = (trackingNumber: string, memberData: any) => {
    // Store data for confirmation page
    sessionStorage.setItem('registration_success', JSON.stringify({
      trackingNumber,
      memberData
    }));
    setLocation('/confirmation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">HCMS</h1>
              <p className="text-xs text-muted-foreground -mt-1">Healthcare Management</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
            >
              About
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground"
            >
              Contact
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTracking(true)}
              className="ripple hover-lift"
            >
              <Search className="w-4 h-4 mr-2" />
              Track Application
            </Button>
            <Button 
              size="sm"
              onClick={() => setLocation('/admin')}
              className="ripple bg-primary hover:bg-primary/90"
            >
              Admin Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-12 pb-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Professional Membership Registration</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 fade-in">
            Healthcare
            <span className="block text-primary">Management System</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed fade-in">
            Streamlined registration and management platform for healthcare professionals. 
            Join our community with secure, efficient membership processing.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="premium-card p-6 text-center hover-lift fade-in">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Registration</h3>
              <p className="text-muted-foreground text-sm">
                Bank-grade security with encrypted data storage and secure payment processing
              </p>
            </div>
            
            <div className="premium-card p-6 text-center hover-lift fade-in">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Review</h3>
              <p className="text-muted-foreground text-sm">
                Two-tier approval process by District and State General Secretaries
              </p>
            </div>
            
            <div className="premium-card p-6 text-center hover-lift fade-in">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Digital Membership</h3>
              <p className="text-muted-foreground text-sm">
                Instant digital ID cards with download capability upon approval
              </p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="ripple scale-in bg-primary hover:bg-primary/90 px-8 py-6 text-lg h-auto"
            onClick={() => document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Registration
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Registration Form */}
      <div id="registration" className="relative z-10">
        <RegistrationForm onSuccess={handleRegistrationSuccess} />
      </div>

      {/* Tracking Modal */}
      <TrackingModal 
        open={showTracking} 
        onOpenChange={setShowTracking} 
      />
    </div>
  );
}