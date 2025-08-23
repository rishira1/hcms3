import { useState } from 'react';
import { Link } from 'wouter';
import { Heart, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrackingModal } from './tracking-modal';
import { useAuth } from '@/hooks/use-auth';

export function Navbar() {
  const [showTracking, setShowTracking] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Heart className="h-8 w-8 text-primary mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">HCMS Association</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowTracking(true)}
                className="text-primary hover:text-primary/80"
              >
                <Search className="h-4 w-4 mr-2" />
                Track Application
              </Button>
              
              {isAuthenticated ? (
                <Button onClick={logout} variant="destructive">
                  Logout
                </Button>
              ) : (
                <Link href="/admin/login">
                  <Button className="bg-primary hover:bg-primary/90">
                    <User className="h-4 w-4 mr-2" />
                    Admin Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <TrackingModal 
        open={showTracking} 
        onOpenChange={setShowTracking} 
      />
    </>
  );
}
