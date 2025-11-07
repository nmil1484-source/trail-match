import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Users, Mountain, Shield, Heart } from "lucide-react";
import Footer from "@/components/Footer";

export default function About() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/trailmatch-logo.png" alt="TrailMatch" className="h-10 w-10" />
              <span className="text-2xl font-bold text-foreground">TrailMatch</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-foreground hover:text-primary font-medium">
                Find Trips
              </Link>
              <Link href="/shops" className="text-foreground hover:text-primary font-medium">
                Shops
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/post-trip" className="text-foreground hover:text-primary font-medium">
                    Post Trip
                  </Link>
                  <Link href="/messages" className="text-foreground hover:text-primary font-medium">
                    Messages
                  </Link>
                  <Link href="/profile" className="text-foreground hover:text-primary font-medium">
                    My Profile
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <h1 className="text-4xl font-bold mb-6">About TrailMatch</h1>

          <div className="prose prose-lg max-w-none space-y-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-lg text-muted-foreground">
                  TrailMatch is a community-driven platform designed to connect off-road enthusiasts 
                  and help them discover new trails, find riding partners, and share their passion 
                  for adventure.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Build Your Crew</h3>
                      <p className="text-muted-foreground">
                        Connect with like-minded off-roaders in your area. Find riding partners 
                        who match your skill level and vehicle capabilities.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mountain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Discover Trails</h3>
                      <p className="text-muted-foreground">
                        Explore new trails and off-road destinations. Learn from experienced 
                        organizers and discover hidden gems in your region.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Safe Adventures</h3>
                      <p className="text-muted-foreground">
                        Organize and join trips with clear requirements and expectations. 
                        Know what you're getting into before you hit the trails.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Community First</h3>
                      <p className="text-muted-foreground">
                        Built by off-roaders, for off-roaders. We're passionate about 
                        creating a welcoming community for all skill levels.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  We believe that off-roading is better together. Our mission is to make it easy 
                  for enthusiasts to connect, share experiences, and explore the great outdoors 
                  safely and responsibly.
                </p>
                <p className="text-muted-foreground">
                  Whether you're a seasoned veteran with a fully built rig or a beginner with 
                  a stock 4x4, TrailMatch helps you find the right group and the right trails 
                  for your adventure level.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Get Started</h2>
                <p className="text-muted-foreground mb-6">
                  Ready to hit the trails? Create an account, set up your profile, and start 
                  exploring trips in your area. Have a favorite trail? Post your own trip and 
                  invite others to join you!
                </p>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/">Browse Trips</Link>
                  </Button>
                  {isAuthenticated ? (
                    <Button variant="outline" asChild>
                      <Link href="/post-trip">Post a Trip</Link>
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <Link href="/">Sign Up</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
