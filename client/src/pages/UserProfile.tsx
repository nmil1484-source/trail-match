import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, MessageCircle, User, Car } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const userId = parseInt(id || "0");

  const { data: profile, isLoading } = trpc.users.getProfile.useQuery({ userId });
  const { data: userVehicles } = trpc.vehicles.listByUser.useQuery({ userId });

  const createConversationMutation = trpc.messages.getOrCreateConversation.useMutation({
    onSuccess: (convo) => {
      setLocation(`/messages?conversation=${convo.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to start conversation: ${error.message}`);
    },
  });

  const handleMessage = () => {
    if (!currentUser) {
      toast.error("Please sign in to send messages");
      return;
    }
    createConversationMutation.mutate({ otherUserId: userId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card">
          <div className="container py-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </header>
        <div className="container py-12 flex-1">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">User not found</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

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
              {currentUser && (
                <>
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
      <div className="container py-8 flex-1">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{profile.name || "Anonymous User"}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Member since {new Date(profile.createdAt || "").toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {!isOwnProfile && currentUser && (
                  <Button
                    onClick={handleMessage}
                    disabled={createConversationMutation.isPending}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {createConversationMutation.isPending ? "Starting..." : "Message"}
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Vehicles Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!userVehicles || userVehicles.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No vehicles added yet
                </p>
              ) : (
                <div className="space-y-4">
                  {userVehicles.map((vehicle) => (
                    <Card key={vehicle.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">
                                Build Level: {vehicle.buildLevel || "Not specified"}
                              </Badge>
                              {vehicle.tireSize && (
                                <Badge variant="outline">
                                  Tires: {vehicle.tireSize}"
                                </Badge>
                              )}
                              {vehicle.lift && (
                                <Badge variant="outline">
                                  Lift: {vehicle.lift}"
                                </Badge>
                              )}
                            </div>
                            {vehicle.modifications && vehicle.modifications.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium mb-2">Modifications:</p>
                                <div className="flex flex-wrap gap-2">
                                  {(vehicle.modifications as string[]).map((mod, idx) => (
                                    <Badge key={idx} variant="outline">
                                      {mod}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
