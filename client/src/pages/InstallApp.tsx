import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Monitor, Chrome, Apple } from "lucide-react";

export default function InstallApp() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Install TrailMatch App</h1>
          <p className="text-lg text-muted-foreground">
            Get the best TrailMatch experience by installing our app on your device. It's fast, works offline, and sends you notifications about new trips!
          </p>
        </div>

        {/* iPhone Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="h-6 w-6" />
              Install on iPhone (iOS)
            </CardTitle>
            <CardDescription>
              Works on iOS 16.4 and later
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Open Safari</p>
                  <p className="text-sm text-muted-foreground">
                    Visit <span className="font-mono bg-muted px-2 py-0.5 rounded">trail-match.com</span> in Safari browser (not Chrome or other browsers)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the square icon with an arrow pointing up at the bottom of the screen
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Select "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">
                    Scroll down in the share menu and tap "Add to Home Screen"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Tap "Add"</p>
                  <p className="text-sm text-muted-foreground">
                    Confirm by tapping "Add" in the top right corner
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <p className="font-medium">Open from Home Screen</p>
                  <p className="text-sm text-muted-foreground">
                    Find the TrailMatch icon on your home screen and tap it to open the app
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  6
                </div>
                <div>
                  <p className="font-medium">Enable Notifications (Optional)</p>
                  <p className="text-sm text-muted-foreground">
                    After opening the app, you'll see a prompt to enable push notifications for trip updates
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 Important for iPhone Users
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Push notifications only work when you install the app to your home screen. They won't work in Safari browser.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Android Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Chrome className="h-6 w-6" />
              Install on Android
            </CardTitle>
            <CardDescription>
              Works on Chrome, Edge, and other Chromium browsers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Open Chrome</p>
                  <p className="text-sm text-muted-foreground">
                    Visit <span className="font-mono bg-muted px-2 py-0.5 rounded">trail-match.com</span> in Chrome browser
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Wait for the Install Prompt</p>
                  <p className="text-sm text-muted-foreground">
                    After a few seconds, you'll see a popup asking "Install TrailMatch?"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Tap "Install"</p>
                  <p className="text-sm text-muted-foreground">
                    Or tap the menu (three dots) → "Add to Home screen" or "Install app"
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Open the App</p>
                  <p className="text-sm text-muted-foreground">
                    Find the TrailMatch icon on your home screen or app drawer and tap it
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <p className="font-medium">Enable Notifications (Optional)</p>
                  <p className="text-sm text-muted-foreground">
                    You'll see a prompt to enable push notifications for trip updates and messages
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                ✅ Android Advantage
              </p>
              <p className="text-sm text-green-800 dark:text-green-200">
                Push notifications work both in the browser and in the installed app!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-6 w-6" />
              Install on Desktop
            </CardTitle>
            <CardDescription>
              Works on Chrome, Edge, and other Chromium browsers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Visit TrailMatch</p>
                  <p className="text-sm text-muted-foreground">
                    Go to <span className="font-mono bg-muted px-2 py-0.5 rounded">trail-match.com</span> in Chrome or Edge
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Look for the Install Icon</p>
                  <p className="text-sm text-muted-foreground">
                    You'll see a computer icon with a down arrow in the address bar (right side)
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Click "Install"</p>
                  <p className="text-sm text-muted-foreground">
                    Click the icon and select "Install" in the popup
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Open as Desktop App</p>
                  <p className="text-sm text-muted-foreground">
                    TrailMatch will open in its own window, just like a native desktop app
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Install the App?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="text-2xl">🔔</div>
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new trips in your area and messages
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <p className="font-medium">Faster Loading</p>
                  <p className="text-sm text-muted-foreground">
                    Pages load instantly after your first visit
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-2xl">📱</div>
                <div>
                  <p className="font-medium">Home Screen Icon</p>
                  <p className="text-sm text-muted-foreground">
                    Quick, one-tap access to your next adventure
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-2xl">🌐</div>
                <div>
                  <p className="font-medium">Works Offline</p>
                  <p className="text-sm text-muted-foreground">
                    View cached trips even without internet
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-2xl">🖥️</div>
                <div>
                  <p className="font-medium">Full-Screen Mode</p>
                  <p className="text-sm text-muted-foreground">
                    No browser bars, just pure off-road goodness
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="text-2xl">🔄</div>
                <div>
                  <p className="font-medium">Auto Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Always have the latest features automatically
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
