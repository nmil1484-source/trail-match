import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface NavigationProps {
  onAuthClick?: () => void;
}

export default function Navigation({ onAuthClick }: NavigationProps) {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: notificationCount } = trpc.auth.notificationCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  
  const { data: unreadMessageCount } = trpc.messages.getUnreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
            <img src="/trailmatch-logo.png" alt="TrailMatch" className="h-8 w-8 md:h-10 md:w-10" />
            <span className="text-lg md:text-2xl font-bold text-foreground">TrailMatch</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-base">
            <Link href="/" className="text-foreground hover:text-primary font-medium">
              Trips
            </Link>
            <Link href="/shops" className="text-foreground hover:text-primary font-medium">
              Shops
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/my-shops" className="text-foreground hover:text-primary font-medium">
                  My Shops
                </Link>
                <Link href="/post-trip" className="text-foreground hover:text-primary font-medium">
                  Post Trip
                </Link>
                <Link href="/messages" className="text-foreground hover:text-primary font-medium relative">
                  Messages
                  {unreadMessageCount && unreadMessageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadMessageCount}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="text-foreground hover:text-primary font-medium relative">
                  Profile
                  {notificationCount && notificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {notificationCount}
                    </span>
                  )}
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin" className="text-foreground hover:text-primary font-medium">
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <Button onClick={onAuthClick}>
                Sign In
              </Button>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4 space-y-3">
            <Link 
              href="/" 
              className="block text-foreground hover:text-primary font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trips
            </Link>
            <Link 
              href="/shops" 
              className="block text-foreground hover:text-primary font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shops
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  href="/my-shops" 
                  className="block text-foreground hover:text-primary font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Shops
                </Link>
                <Link 
                  href="/post-trip" 
                  className="block text-foreground hover:text-primary font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Post Trip
                </Link>
                <Link 
                  href="/messages" 
                  className="block text-foreground hover:text-primary font-medium py-2 relative"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                  {unreadMessageCount && unreadMessageCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                      {unreadMessageCount}
                    </span>
                  )}
                </Link>
                <Link 
                  href="/profile" 
                  className="block text-foreground hover:text-primary font-medium py-2 relative"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                  {notificationCount && notificationCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                      {notificationCount}
                    </span>
                  )}
                </Link>
                {user?.role === "admin" && (
                  <Link 
                    href="/admin" 
                    className="block text-foreground hover:text-primary font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <Button 
                onClick={() => {
                  onAuthClick?.();
                  setMobileMenuOpen(false);
                }}
                className="w-full"
              >
                Sign In
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
