import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Logout() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function logout() {
      try {
        // Call server logout
        await fetch('/api/auth/logout', { 
          method: 'POST', 
          credentials: 'include' 
        });
      } catch (e) {
        console.log('Server logout failed, clearing client anyway');
      }
      
      // Clear service worker cache
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      }
      
      // Clear all caches
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        } catch (e) {
          console.log('Cache clear failed:', e);
        }
      }
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to home
      window.location.href = '/';
    }
    
    logout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-muted-foreground">Please wait while we log you out.</p>
      </div>
    </div>
  );
}
