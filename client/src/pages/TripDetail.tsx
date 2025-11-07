import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Calendar, MapPin, Users, Mountain, ArrowLeft, Shield, Wrench, Edit, Trash2, MessageCircle } from "lucide-react";
import { Link, useParams } from "wouter";
import { JoinTripDialog } from "@/components/JoinTripDialog";
import { useState } from "react";

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const tripId = parseInt(id || "0");
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  
  const { data: trip, isLoading } = trpc.trips.getById.useQuery({ id: tripId });
  const { data: participants } = trpc.participants.listForTrip.useQuery({ tripId });
  
  const deleteMutation = trpc.trips.delete.useMutation({
    onSuccess: () => {
      toast.success("Trip deleted successfully");
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(`Failed to delete trip: ${error.message}`);
    },
  });
  
  const createConversationMutation = trpc.messages.getOrCreateConversation.useMutation({
    onSuccess: (convo) => {
      window.location.href = `/messages?conversation=${convo.id}`;
    },
    onError: (error) => {
      toast.error(`Failed to start conversation: ${error.message}`);
    },
  });
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      deleteMutation.mutate({ id: tripId });
    }
  };
  
  const isOrganizer = user && trip && trip.organizerId === user.id;

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

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold text-foreground">{trip.title}</h1>
                {isOrganizer && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/edit-trip/${tripId}`}>
                        <a className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </a>
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              
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

            {/* Communication Preferences */}
            {trip.communicationMethods && (trip.communicationMethods as string[]).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>How to Connect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    The trip organizer prefers to communicate via:
                  </p>
                  <div className="space-y-2">
                    {(trip.communicationMethods as string[]).includes("text") && trip.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Text/SMS</Badge>
                        <span className="text-sm">{trip.phoneNumber}</span>
                      </div>
                    )}
                    {(trip.communicationMethods as string[]).includes("email") && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Email</Badge>
                        <span className="text-sm">Via profile</span>
                      </div>
                    )}
                    {(trip.communicationMethods as string[]).includes("whatsapp") && trip.whatsappNumber && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">WhatsApp</Badge>
                        <span className="text-sm">{trip.whatsappNumber}</span>
                      </div>
                    )}
                    {(trip.communicationMethods as string[]).includes("facebook") && trip.facebookHandle && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Facebook</Badge>
                        <span className="text-sm">{trip.facebookHandle}</span>
                      </div>
                    )}
                    {(trip.communicationMethods as string[]).includes("instagram") && trip.instagramHandle && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Instagram</Badge>
                        <span className="text-sm">{trip.instagramHandle}</span>
                      </div>
                    )}
                    {(trip.communicationMethods as string[]).includes("built_in") && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Built-in Messenger</Badge>
                        <span className="text-sm">Coming soon</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}
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
                    {!isOrganizer && (
                      <>
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={() => setJoinDialogOpen(true)}
                        >
                          Request to Join
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full" 
                          size="lg"
                          onClick={() => {
                            if (!trip.organizerId) return;
                            createConversationMutation.mutate({ otherUserId: trip.organizerId });
                          }}
                          disabled={createConversationMutation.isPending}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {createConversationMutation.isPending ? "Starting conversation..." : "Message Organizer"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          The trip organizer will review your request
                        </p>
                      </>
                    )}
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
      
      <JoinTripDialog 
        open={joinDialogOpen} 
        onOpenChange={setJoinDialogOpen}
        tripId={tripId}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}

