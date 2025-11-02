import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Loader2, Mountain, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function JoinRequests() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: requests, isLoading } = trpc.participants.myPendingRequests.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateStatusMutation = trpc.participants.updateStatus.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.status === "accepted" ? "Request approved!" : "Request declined");
      utils.participants.myPendingRequests.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });

  const handleApprove = (participantId: number, tripId: number) => {
    updateStatusMutation.mutate({
      participantId,
      tripId,
      status: "accepted",
    });
  };

  const handleDecline = (participantId: number, tripId: number) => {
    updateStatusMutation.mutate({
      participantId,
      tripId,
      status: "declined",
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Mountain className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Sign in to view join requests</h2>
        <p className="text-muted-foreground mb-6">You need to be signed in to manage trip requests</p>
        <Button asChild>
          <a href={getLoginUrl()}>Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <Link href="/profile">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Join Requests</h1>
          <p className="text-muted-foreground">
            Manage requests from users who want to join your trips
          </p>
        </div>

        {!requests || requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mountain className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No pending requests</h3>
              <p className="text-muted-foreground text-center">
                When users request to join your trips, they'll appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              if (!request.participant || !request.user || !request.vehicle || !request.trip) {
                return null;
              }

              return (
                <Card key={request.participant.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {request.user.name || "Anonymous User"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          wants to join <strong>{request.trip.title}</strong>
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Vehicle Info */}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Vehicle</h4>
                      <p className="text-sm">
                        {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{request.vehicle.buildLevel}</Badge>
                        {request.vehicle.tireSize && (
                          <Badge variant="outline">{request.vehicle.tireSize} tires</Badge>
                        )}
                        {request.vehicle.hasWinch && <Badge variant="outline">Winch</Badge>}
                        {request.vehicle.hasLockers && <Badge variant="outline">Lockers</Badge>}
                      </div>
                    </div>

                    {/* Message */}
                    {request.participant.message && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Message</h4>
                        <p className="text-sm text-muted-foreground">{request.participant.message}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleApprove(request.participant!.id, request.trip!.id)}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDecline(request.participant!.id, request.trip!.id)}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

