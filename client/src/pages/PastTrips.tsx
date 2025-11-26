import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function PastTrips() {
  const { isAuthenticated } = useAuth();
  const { data: trips, isLoading } = trpc.trips.list.useQuery();

  // Filter for past trips only
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const pastTrips = trips?.filter(trip => {
    const endDate = new Date(trip.endDate);
    endDate.setHours(23, 59, 59, 999);
    return endDate < now;
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Past Trips</h1>
          <p className="text-muted-foreground">Browse completed off-road adventures</p>
        </div>

        {pastTrips.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No past trips found</p>
            <Button asChild>
              <Link href="/">Browse Upcoming Trips</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pastTrips.map((trip) => (
              <Card 
                key={trip.id} 
                className="overflow-hidden opacity-75 hover:opacity-100 transition-opacity"
              >
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
                  <Badge className={getDifficultyColor(trip.difficulty)}>
                    {trip.difficulty}
                  </Badge>
                </CardContent>
                <CardFooter className="pt-3 pb-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/trip/${trip.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
