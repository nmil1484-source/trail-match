import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface JoinTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: number;
  onSuccess: () => void;
}

export function JoinTripDialog({ open, onOpenChange, tripId, onSuccess }: JoinTripDialogProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [message, setMessage] = useState("");

  const { data: vehicles } = trpc.vehicles.list.useQuery();
  
  const joinMutation = trpc.participants.requestJoin.useMutation({
    onSuccess: () => {
      toast.success("Join request sent! The organizer will review your request.");
      onSuccess();
      onOpenChange(false);
      setSelectedVehicle("");
      setMessage("");
    },
    onError: (error) => {
      toast.error(`Failed to join trip: ${error.message}`);
    },
  });

  const handleJoin = () => {
    if (!selectedVehicle) {
      toast.error("Please select a vehicle");
      return;
    }

    joinMutation.mutate({
      tripId,
      vehicleId: parseInt(selectedVehicle),
      message: message || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request to Join Trip</DialogTitle>
          <DialogDescription>
            Select your vehicle and send a message to the trip organizer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle">Select Vehicle</Label>
            {vehicles && vehicles.length > 0 ? (
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Choose your vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>You need to add a vehicle to your profile first.</p>
                <Button 
                  variant="link" 
                  className="px-0 h-auto" 
                  onClick={() => window.location.href = "/my-profile"}
                >
                  Add a vehicle in your profile
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message to Organizer (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell the organizer about your experience, vehicle setup, etc."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleJoin} 
              disabled={!selectedVehicle || !vehicles || vehicles.length === 0 || joinMutation.isPending}
            >
              {joinMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </div>
          {(!vehicles || vehicles.length === 0) && (
            <p className="text-sm text-destructive text-center">
              You must add a vehicle to your profile before joining a trip
            </p>
          )}
          {vehicles && vehicles.length > 0 && !selectedVehicle && (
            <p className="text-sm text-muted-foreground text-center">
              Please select a vehicle to continue
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

