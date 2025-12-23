import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, Loader2, Users } from "lucide-react";
import { Link } from "wouter";

export default function Trips() {
  const { isAuthenticated } = useAuth();
  const { data: trips, isLoading } = trpc.trips.list.useQuery();

  // Separate upcoming and past trips
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const upcomingTrips = trips?.filter(trip => {
    const endDate = new Date(trip.endDate);
    endDate.setHours(23, 59, 59, 999);
    return endDate >= now && trip.status !== 'cancelled';
  }) || [];

  const pastTrips = trips?.filter(trip => {
    const endDate = new Date(trip.endDate);
    endDate.setHours(23, 59, 59, 999);
    return endDate < now || trip.status === 'cancelled';
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500 hover:bg-green-600";
      case "intermediate": return "bg-yellow-500 hover:bg-yellow-600";
      case "advanced": return "bg-orange-500 hover:bg-orange-600";
      case "expert": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const TripCard = ({ trip, isPast = false }: { trip: any; isPast?: boolean }) => (
    <Card 
      key={trip.id} 
      className={`overflow-hidden ${isPast ? 'opacity-75' : ''} hover:opacity-100 transition-opacity`}
    >
      {trip.photos && trip.photos.length > 0 && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img 
            src={trip.photos[0]} 
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{trip.title}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{trip.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getDifficultyColor(trip.difficulty)}>
            {trip.difficulty}
          </Badge>
          {trip.currentParticipants !== undefined && trip.maxParticipants && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {trip.currentParticipants}/{trip.maxParticipants}
            </Badge>
          )}
          {trip.status === 'cancelled' && (
            <Badge variant="destructive">Cancelled</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-3 pb-4">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/trip/${trip.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">All Trips</h1>
            <p className="text-muted-foreground">Browse upcoming and past off-road adventures</p>
          </div>
          {isAuthenticated && (
            <Button asChild>
              <Link href="/post-trip">Post a Trip</Link>
            </Button>
          )}
        </div>

        {/* Upcoming Trips */}
        {upcomingTrips.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming Trips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {upcomingTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        )}

        {/* Past Trips */}
        {pastTrips.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Past Trips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pastTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} isPast />
              ))}
            </div>
          </div>
        )}

        {trips && trips.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No trips found</p>
            {isAuthenticated ? (
              <Button asChild>
                <Link href="/post-trip">Post the First Trip</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
