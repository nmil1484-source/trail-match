import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Calendar, MapPin, Users, Mountain, Loader2, Star, Trophy } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [locationFilter, setLocationFilter] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { data: trips, isLoading } = trpc.trips.list.useQuery();

  // Filter and sort trips: premium > featured > free, then by date
  const filteredTrips = trips
    ?.filter(trip => 
      !locationFilter || trip.location.toLowerCase().includes(locationFilter.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by premium tier first
      const tierOrder = { premium: 3, featured: 2, free: 1 };
      const aTier = tierOrder[a.premiumTier as keyof typeof tierOrder] || 1;
      const bTier = tierOrder[b.premiumTier as keyof typeof tierOrder] || 1;
      
      if (aTier !== bTier) {
        return bTier - aTier; // Higher tier first
      }
      
      // If same tier, sort by start date
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "expert": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
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
              {isAuthenticated ? (
                <>
                  <Link href="/post-trip" className="text-foreground hover:text-primary font-medium">
                    Post Trip
                  </Link>
                  <Link href="/profile" className="text-foreground hover:text-primary font-medium">
                    My Profile
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin" className="text-foreground hover:text-primary font-medium">
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <Button onClick={() => setAuthModalOpen(true)}>
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-muted/50 to-muted py-20">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Find Your Trail Crew
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find compatible off-roaders with similar vehicles and builds. 
              Join trips that match your skill level and adventure style.
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-3 max-w-xl">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="lg" className="px-8">
                SEARCH
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trips Grid */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Upcoming Trips</h2>
            {isAuthenticated && (
              <Button asChild>
                <Link href="/post-trip">Post a Trip</Link>
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredTrips?.map((trip) => (
                <Card 
                  key={trip.id} 
                  className={`overflow-hidden hover:shadow-lg transition-shadow ${
                    trip.premiumTier === "premium" 
                      ? "border-2 border-purple-300 shadow-lg shadow-purple-100" 
                      : trip.premiumTier === "featured"
                      ? "border-2 border-amber-300 shadow-md shadow-amber-100"
                      : ""
                  }`}
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {trip.photos && (trip.photos as string[]).length > 0 ? (
                      <img
                        src={(trip.photos as string[])[0]}
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mountain className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg line-clamp-2 text-card-foreground flex-1">{trip.title}</h3>
                      {trip.premiumTier === "featured" && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 shrink-0">
                          <Star className="h-3 w-3" />
                          Featured
                        </Badge>
                      )}
                      {trip.premiumTier === "premium" && (
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 shrink-0">
                          <Trophy className="h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{trip.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(trip.styles as string[] || []).map((style) => (
                        <Badge key={style} variant="secondary" className="text-xs">
                          {style.replace("_", " ")}
                        </Badge>
                      ))}
                      <Badge className={getDifficultyColor(trip.difficulty)}>
                        {trip.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{trip.currentParticipants}/{trip.maxParticipants}</span>
                      </div>
                      {trip.minTireSize && (
                        <span className="text-xs">{trip.minTireSize}+ tires</span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/trip/${trip.id}`}>View Details</Link>
                    </Button>
                    <Button size="sm" className="flex-1">
                      Express Interest
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredTrips?.length === 0 && (
            <div className="text-center py-20">
              <Mountain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No trips found</h3>
              <p className="text-muted-foreground mb-6">
                {locationFilter ? "Try adjusting your search filters" : "Be the first to post a trip!"}
              </p>
              {isAuthenticated && (
                <Button asChild>
                  <Link href="/post-trip">
                    <a>Post a Trip</a>
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-auto bg-card">
        <div className="container py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 TrailMatch. Find your trail crew.
          </p>
        </div>
      </footer>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}

