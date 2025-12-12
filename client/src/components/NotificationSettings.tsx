import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState({
    tripNotifications: true,
    messageNotifications: true,
    tripUpdateNotifications: true,
    reminderNotifications: true,
  });
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { data, isLoading } = trpc.notifications.getPreferences.useQuery();
  const updateMutation = trpc.notifications.updatePreferences.useMutation();
  const testMutation = trpc.notifications.sendTest.useMutation();

  useEffect(() => {
    if (data) {
      setPreferences({
        tripNotifications: data.tripNotifications,
        messageNotifications: data.messageNotifications,
        tripUpdateNotifications: data.tripUpdateNotifications,
        reminderNotifications: data.reminderNotifications,
      });
      setIsSubscribed(data.isSubscribed);
    }
  }, [data]);

  const handleToggle = async (key: keyof typeof preferences) => {
    const newValue = !preferences[key];
    setPreferences(prev => ({ ...prev, [key]: newValue }));

    try {
      await updateMutation.mutateAsync({ [key]: newValue });
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
      // Revert on error
      setPreferences(prev => ({ ...prev, [key]: !newValue }));
    }
  };

  const handleSendTest = async () => {
    try {
      await testMutation.mutateAsync();
      toast.success('Test notification sent! Check your device.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test notification');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isSubscribed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications Disabled
          </CardTitle>
          <CardDescription>
            Enable push notifications to receive updates about trips, messages, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You haven't enabled push notifications yet. Install the TrailMatch app and enable notifications to manage your preferences here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose which notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="trip-notifications" className="text-base font-medium">
                New Trips
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new trips are posted in your area
              </p>
            </div>
            <Switch
              id="trip-notifications"
              checked={preferences.tripNotifications}
              onCheckedChange={() => handleToggle('tripNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="message-notifications" className="text-base font-medium">
                Messages
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you receive new messages
              </p>
            </div>
            <Switch
              id="message-notifications"
              checked={preferences.messageNotifications}
              onCheckedChange={() => handleToggle('messageNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="trip-update-notifications" className="text-base font-medium">
                Trip Updates
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified about changes to trips you've joined
              </p>
            </div>
            <Switch
              id="trip-update-notifications"
              checked={preferences.tripUpdateNotifications}
              onCheckedChange={() => handleToggle('tripUpdateNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminder-notifications" className="text-base font-medium">
                Trip Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming trips 24 hours before
              </p>
            </div>
            <Switch
              id="reminder-notifications"
              checked={preferences.reminderNotifications}
              onCheckedChange={() => handleToggle('reminderNotifications')}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleSendTest}
            disabled={testMutation.isPending}
            variant="outline"
            className="w-full"
          >
            {testMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Send Test Notification
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
