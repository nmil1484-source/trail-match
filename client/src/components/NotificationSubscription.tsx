import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, BellOff, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

// VAPID public key - safe to include in client code
const VAPID_PUBLIC_KEY = 'BMcHEDjKuuAf9Wp1HKZSoqpSv6swW0QJUHz9PVksaLPo4wU5K8AiecBl7YiLA2ojmGMJVmK6lDgmFNx5VQMPlsk';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationSubscription() {
  const { user, isAuthenticated } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const subscribeMutation = trpc.notifications.subscribe.useMutation();
  const unsubscribeMutation = trpc.notifications.unsubscribe.useMutation();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check if already subscribed
    checkSubscription();

    // Show prompt after user has been on site for 30 seconds
    const timer = setTimeout(() => {
      const hasSeenPrompt = localStorage.getItem('notification-prompt-dismissed');
      if (!hasSeenPrompt && !isSubscribed) {
        setShowPrompt(true);
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribeToNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported in your browser');
      return;
    }

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        alert('Please allow notifications to receive trip updates');
        setIsLoading(false);
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Send subscription to server
      await subscribeMutation.mutateAsync({
        subscription: JSON.parse(JSON.stringify(subscription))
      });

      setIsSubscribed(true);
      setShowPrompt(false);
      
      // Show success notification
      registration.showNotification('TrailMatch Notifications Enabled!', {
        body: 'You\'ll now receive updates about trips, messages, and more.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
      });
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!('serviceWorker' in navigator)) return;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribeMutation.mutateAsync();
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (!isAuthenticated) return null;

  // Show prompt if not subscribed
  if (showPrompt && !isSubscribed) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
        <Card className="shadow-2xl border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Stay Updated on Trips
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get notified when new trips are posted in your area, receive trip updates, and stay connected with your trail crew!
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={subscribeToNotifications}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Enabling...' : 'Enable Notifications'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDismiss}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show toggle button in profile/settings
  return null;
}
