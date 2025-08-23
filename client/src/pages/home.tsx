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
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight">HCMS</h1>
              <p className="text-xs text-muted-foreground -mt-0.5 hidden sm:block">Healthcare Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTracking(true)}
              className="hover-lift text-xs sm:text-sm"
            >
              <Search className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Track</span>
            </Button>
            <Button 
              size="sm"
              onClick={() => setLocation('/admin')}
              className="bg-primary hover:bg-primary/90 text-xs sm:text-sm"
            >
              Admin
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-4 sm:px-6 pt-8 sm:pt-16 pb-12 sm:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-muted border rounded-full px-3 py-1.5 mb-6 sm:mb-8">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Professional Registration Portal</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 fade-in">
            Healthcare
            <span className="block text-primary">Management System</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed fade-in px-4">
            Streamlined registration and management platform for healthcare professionals. 
            Secure, efficient membership processing.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-12 sm:mb-16 px-4">
            <div className="premium-card p-4 sm:p-6 text-center hover-lift fade-in">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Secure Process</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Bank-grade security with encrypted data and secure payments
              </p>
            </div>
            
            <div className="premium-card p-4 sm:p-6 text-center hover-lift fade-in">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Expert Review</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Two-tier approval by District and State secretaries
              </p>
            </div>
            
            <div className="premium-card p-4 sm:p-6 text-center hover-lift fade-in sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Digital Cards</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Instant digital membership cards upon approval
              </p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="ripple scale-in bg-primary hover:bg-primary/90 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg h-auto w-full sm:w-auto max-w-xs mx-auto"
            onClick={() => document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Registration
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
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