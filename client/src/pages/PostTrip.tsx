import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { ArrowLeft, Loader2, Mountain } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { PhotoUpload } from "@/components/PhotoUpload";

const OFF_ROAD_STYLES = [
  { value: "rock_crawling", label: "Rock Crawling" },
  { value: "overland", label: "Overland" },
  { value: "desert", label: "Desert" },
  { value: "wanna_be_long_travel", label: "Wanna Be Long Travel" },
  { value: "long_travel_only", label: "Long Travel Only" },
  { value: "raptor", label: "Raptor" },
  { value: "jeeping", label: "Jeeping" },
  { value: "pre_running", label: "Pre-Running" },
];

const VEHICLE_REQUIREMENTS = [
  { value: "2wd", label: "2WD Needed" },
  { value: "4x4_stock", label: "4x4 Stock" },
  { value: "4x4_modded", label: "4x4 with Mods" },
  { value: "2wd_prerunner", label: "2WD Pre-Runner" },
  { value: "4wd_prerunner", label: "4WD Pre-Runner" },
  { value: "raptor", label: "Raptor" },
  { value: "long_travel_fast", label: "Long Travel (Fast)" },
  { value: "long_travel_slow", label: "Long Travel (Slow)" },
];

export default function PostTrip() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocationInput] = useState("");
  const [state, setState] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | "expert">("intermediate");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [maxParticipants, setMaxParticipants] = useState("6");
  const [minTireSize, setMinTireSize] = useState("");
  const [requiresWinch, setRequiresWinch] = useState(false);
  const [requiresLockers, setRequiresLockers] = useState(false);
  const [vehicleRequirement, setVehicleRequirement] = useState<string>("");
  const [itinerary, setItinerary] = useState("");
  const [campingInfo, setCampingInfo] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const createTripMutation = trpc.trips.create.useMutation({
    onSuccess: (data) => {
      toast.success("Trip posted successfully!");
      setLocation(`/trip/${data.tripId}`);
    },
    onError: (error) => {
      toast.error(`Failed to post trip: ${error.message}`);
    },
  });

  const handleStyleToggle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !location || !startDate || !endDate || selectedStyles.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    createTripMutation.mutate({
      title,
      description: description || undefined,
      location,
      state: state || undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      difficulty,
      styles: selectedStyles,
      maxParticipants: parseInt(maxParticipants),
      minTireSize: minTireSize || undefined,
      requiresWinch,
      requiresLockers,
      vehicleRequirement: vehicleRequirement as any || undefined,
      itinerary: itinerary || undefined,
      campingInfo: campingInfo || undefined,
      photos: photos.length > 0 ? photos : undefined,
    });
  };

  if (authLoading) {
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
        <h2 className="text-2xl font-bold mb-2">Sign in to post a trip</h2>
        <p className="text-muted-foreground mb-6">You need to be signed in to create trips</p>
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
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Post a Trip</h1>
          <p className="text-muted-foreground">
            Share your upcoming off-road adventure and find compatible trail partners
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
          <h3 className="font-semibold text-amber-900 mb-2">⚠️ Important Reminders</h3>
          <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
            <li><strong>TrailMatch does not coordinate or organize these trips.</strong> You are responsible for planning and leading your own events.</li>
            <li><strong>Tread Lightly!</strong> Practice responsible off-roading. Stay on designated trails, pack out all trash, and respect wildlife and other visitors.</li>
            <li><strong>Check with land management agencies</strong> (BLM, Forest Service, National Parks, etc.) for restrictions on group sizes and activities in your area.</li>
            <li><strong>Special event permits may be required</strong> for larger groups or organized events. Contact the governing agency before your trip.</li>
            <li><strong>Respect capacity limits</strong> to avoid overwhelming popular locations and preserve access for future generations.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Trip Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Moab Rock Crawling Weekend"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your trip, what trails you'll run, and what to expect..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="e.g., Moab, UT"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g., UT"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Characteristics */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Characteristics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="difficulty">Difficulty Level *</Label>
                <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Off-Road Styles * (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {OFF_ROAD_STYLES.map((style) => (
                    <div key={style.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={style.value}
                        checked={selectedStyles.includes(style.value)}
                        onCheckedChange={() => handleStyleToggle(style.value)}
                      />
                      <label
                        htmlFor={style.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {style.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  min="2"
                  max="50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vehicleRequirement">Vehicle Requirement</Label>
                <Select value={vehicleRequirement} onValueChange={(value: string) => setVehicleRequirement(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select requirement..." />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_REQUIREMENTS.map((req) => (
                      <SelectItem key={req.value} value={req.value}>
                        {req.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="minTireSize">Minimum Tire Size</Label>
                <Input
                  id="minTireSize"
                  value={minTireSize}
                  onChange={(e) => setMinTireSize(e.target.value)}
                  placeholder='e.g., 35"'
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresWinch"
                    checked={requiresWinch}
                    onCheckedChange={(checked) => setRequiresWinch(checked as boolean)}
                  />
                  <label
                    htmlFor="requiresWinch"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Winch Required
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresLockers"
                    checked={requiresLockers}
                    onCheckedChange={(checked) => setRequiresLockers(checked as boolean)}
                  />
                  <label
                    htmlFor="requiresLockers"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Lockers Required
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="itinerary">Itinerary</Label>
                <Textarea
                  id="itinerary"
                  value={itinerary}
                  onChange={(e) => setItinerary(e.target.value)}
                  placeholder="Day 1: Hell's Revenge&#10;Day 2: Poison Spider Mesa&#10;Day 3: Fins and Things"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="campingInfo">Camping & Lodging Info</Label>
                <Textarea
                  id="campingInfo"
                  value={campingInfo}
                  onChange={(e) => setCampingInfo(e.target.value)}
                  placeholder="Where will the group stay? Camping, hotels, etc."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Trip Photos</Label>
                <p className="text-sm text-muted-foreground mb-2">Add photos of the trail, terrain, or previous trips</p>
                <PhotoUpload photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTripMutation.isPending}
              className="flex-1"
            >
              {createTripMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Trip"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

