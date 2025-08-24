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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
                <h1 className="text-base sm:text-xl font-semibold text-gray-900">
                  <span className="hidden sm:inline">HCMS Association</span>
                  <span className="sm:hidden">HCMS</span>
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              <Button
                variant="ghost"
                onClick={() => setShowTracking(true)}
                className="text-primary hover:text-primary/80 text-xs sm:text-sm px-2 sm:px-4"
              >
                <Search className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Track Application</span>
                <span className="sm:hidden ml-1">Track</span>
              </Button>
              
              {isAuthenticated ? (
                <Button onClick={logout} variant="destructive" className="text-xs sm:text-sm px-2 sm:px-4">
                  Logout
                </Button>
              ) : (
                <Link href="/admin/login">
                  <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm px-2 sm:px-4">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Admin Login</span>
                    <span className="sm:hidden ml-1">Admin</span>
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
