import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Calendar, MapPin, Users, Mountain, ArrowLeft, Shield, Wrench } from "lucide-react";
import { Link, useParams } from "wouter";

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const tripId = parseInt(id || "0");
  
  const { data: trip, isLoading } = trpc.trips.getById.useQuery({ id: tripId });
  const { data: participants } = trpc.participants.listForTrip.useQuery({ tripId });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Mountain className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Mountain className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Trip not found</h2>
        <Button asChild>
          <Link href="/">
            <a>Back to Home</a>
          </Link>
        </Button>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", { 
      weekday: "short",
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "expert": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const acceptedParticipants = participants?.filter(p => p.participant.status === "accepted") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Trips
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Image */}
      <div className="w-full h-96 bg-muted relative overflow-hidden">
        {trip.photos && (trip.photos as string[]).length > 0 ? (
          <img
            src={(trip.photos as string[])[0]}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mountain className="h-24 w-24 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{trip.title}</h1>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">{trip.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(trip.styles as string[] || []).map((style) => (
                  <Badge key={style} variant="secondary">
                    {style.replace("_", " ").toUpperCase()}
                  </Badge>
                ))}
                <Badge className={getDifficultyColor(trip.difficulty)}>
                  {trip.difficulty.toUpperCase()}
                </Badge>
              </div>
            </div>

            {trip.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Trip</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{trip.description}</p>
                </CardContent>
              </Card>
            )}

            {trip.itinerary && (
              <Card>
                <CardHeader>
                  <CardTitle>Itinerary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{trip.itinerary}</p>
                </CardContent>
              </Card>
            )}

            {trip.campingInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Camping & Lodging</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{trip.campingInfo}</p>
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Participants ({acceptedParticipants.length}/{trip.maxParticipants})</CardTitle>
              </CardHeader>
              <CardContent>
                {acceptedParticipants.length > 0 ? (
                  <div className="space-y-3">
                    {acceptedParticipants.map((p) => (
                      <div key={p.participant.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {p.user?.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{p.user?.name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">
                            {p.vehicle?.year} {p.vehicle?.make} {p.vehicle?.model}
                          </p>
                        </div>
                        <Badge variant="outline">{p.vehicle?.buildLevel}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No participants yet. Be the first to join!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements Card */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Difficulty</p>
                    <p className="text-sm text-muted-foreground capitalize">{trip.difficulty}</p>
                  </div>
                </div>

                {trip.minTireSize && (
                  <div className="flex items-start gap-3">
                    <Wrench className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Minimum Tire Size</p>
                      <p className="text-sm text-muted-foreground">{trip.minTireSize}</p>
                    </div>
                  </div>
                )}

                {trip.vehicleRequirement && (
                  <div className="flex items-start gap-3">
                    <Wrench className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                    <p className="font-medium text-foreground">Vehicle Requirement</p>
                    <p className="text-sm text-muted-foreground capitalize">{trip.vehicleRequirement?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                )}

                {(trip.requiresWinch || trip.requiresLockers) && (
                  <div className="flex items-start gap-3">
                    <Wrench className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Required Equipment</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {trip.requiresWinch && <li>Winch</li>}
                        {trip.requiresLockers && <li>Lockers</li>}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Group Size</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.currentParticipants} / {trip.maxParticipants} vehicles
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card>
              <CardContent className="pt-6">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      Request to Join
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      The trip organizer will review your request
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" asChild>
                      <a href={getLoginUrl()}>Sign In to Join</a>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Create an account to join trips
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

