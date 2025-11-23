import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import ImageLightbox from "@/components/ImageLightbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Calendar, MapPin, Users, Mountain, Loader2, Star, Trophy } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { AuthDialog } from "@/components/AuthDialog";
import Footer from "@/components/Footer";
import { matchesLocation } from "@/lib/locationUtils";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [locationFilter, setLocationFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [styleFilter, setStyleFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { data: trips, isLoading } = trpc.trips.list.useQuery();
  const { data: notificationCount } = trpc.auth.notificationCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  const { data: unreadMessageCount } = trpc.messages.getUnreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Filter and sort trips: premium > featured > free, then by date
  const filteredTrips = trips
    ?.filter(trip => {
      // Location filter
      if (locationFilter && !matchesLocation(trip.location, locationFilter)) {
        return false;
      }
      // Difficulty filter
      if (difficultyFilter && trip.difficulty !== difficultyFilter) {
        return false;
      }
      // Style filter
      if (styleFilter) {
        const tripStyles = trip.styles as string[] || [];
        if (!tripStyles.includes(styleFilter)) {
          return false;
        }
      }
      // Date filter
      if (dateFilter) {
        const tripDate = new Date(trip.startDate);
        const now = new Date();
        if (dateFilter === "this_week") {
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (tripDate > weekFromNow) return false;
        } else if (dateFilter === "this_month") {
          const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          if (tripDate > monthFromNow) return false;
        } else if (dateFilter === "next_3_months") {
          const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
          if (tripDate > threeMonthsFromNow) return false;
        }
      }
      return true;
    })
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
        <div className="container py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
              <img src="/trailmatch-logo.png" alt="TrailMatch" className="h-8 w-8 md:h-10 md:w-10" />
              <span className="text-lg md:text-2xl font-bold text-foreground">TrailMatch</span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-3 md:gap-6 text-xs sm:text-sm md:text-base flex-wrap">
              <Link href="/" className="text-foreground hover:text-primary font-medium whitespace-nowrap">
                <span className="hidden sm:inline">Find </span>Trips
              </Link>
              <Link href="/shops" className="text-foreground hover:text-primary font-medium whitespace-nowrap">
                Shops
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/my-shops" className="text-foreground hover:text-primary font-medium whitespace-nowrap">
                    <span className="hidden sm:inline">My </span>Shops
                  </Link>
                  <Link href="/post-trip" className="text-foreground hover:text-primary font-medium whitespace-nowrap">
                    <span className="hidden sm:inline">Post </span>Trip
                  </Link>
                  <Link href="/messages" className="text-foreground hover:text-primary font-medium relative whitespace-nowrap">
                    <span className="hidden sm:inline">Messages</span><span className="sm:hidden">Msgs</span>
                    {unreadMessageCount && unreadMessageCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadMessageCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/profile" className="text-foreground hover:text-primary font-medium relative whitespace-nowrap">
                    <span className="hidden sm:inline">My </span>Profile
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
            <div className="space-y-4">
              <div className="flex gap-3 max-w-xl">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="City or area (e.g., Mojave, Moab, Drummond)"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="max-w-md"
              />
                </div>
                <Button size="lg" className="px-8" onClick={() => setShowFilters(!showFilters)}>
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>
              
              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card rounded-lg border">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty</label>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Style</label>
                    <select
                      value={styleFilter}
                      onChange={(e) => setStyleFilter(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">All Styles</option>
                      <option value="rock_crawling">Rock Crawling</option>
                      <option value="overland">Overland</option>
                      <option value="desert">Desert</option>
                      <option value="jeeping">Jeeping</option>
                      <option value="pre_running">Pre-Running</option>
                      <option value="long_travel_only">Long Travel</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Timeframe</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">All Dates</option>
                      <option value="this_week">This Week</option>
                      <option value="this_month">This Month</option>
                      <option value="next_3_months">Next 3 Months</option>
                    </select>
                  </div>
                </div>
              )}
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
                  {trip.photos && (trip.photos as string[]).length > 0 && (
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <ImageLightbox
                        src={(trip.photos as string[])[0]}
                        alt={trip.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
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

                  <CardFooter className="pt-3 pb-4 gap-2 flex-col sm:flex-row">
                    <Button variant="outline" size="sm" className="w-full sm:flex-1" asChild>
                      <Link href={`/trip/${trip.id}`}>View Details</Link>
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full sm:flex-1"
                      onClick={() => {
                        if (!isAuthenticated) {
                          setAuthModalOpen(true);
                        } else {
                          window.location.href = `/trip/${trip.id}`;
                        }
                      }}
                    >
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
                {locationFilter 
                  ? `No trips found for "${locationFilter}". Try searching by city or area name (e.g., Mojave, Moab).` 
                  : "Be the first to post a trip!"}
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

      <Footer />
      
      <AuthDialog open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}

