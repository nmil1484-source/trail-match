import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { ArrowLeft, Loader2, Mountain } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { PhotoUpload } from "@/components/PhotoUpload";
import { PremiumTierDialog } from "@/components/PremiumTierDialog";

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
  const [gpxFile, setGpxFile] = useState<string>("");
  const [gpxFileName, setGpxFileName] = useState<string>("");
  const [uploadingGpx, setUploadingGpx] = useState(false);

  const uploadGpxMutation = trpc.upload.uploadGpx.useMutation();
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [createdTripId, setCreatedTripId] = useState<number | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  
  // Communication preferences
  const [communicationMethods, setCommunicationMethods] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [facebookHandle, setFacebookHandle] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");

  const createTripMutation = trpc.trips.create.useMutation({
    onSuccess: (data) => {
      setCreatedTripId(data.tripId);
      
      if (data.shareToken) {
        const shareLink = `${window.location.origin}/trip/${data.tripId}?token=${data.shareToken}`;
        toast.success(
          <div>
            <p>Private trip created! Share this link:</p>
            <p className="text-xs mt-1 break-all">{shareLink}</p>
          </div>,
          { duration: 10000 }
        );
      } else {
        toast.success("Trip posted successfully!");
      }
      
      // Show premium upgrade dialog
      setShowPremiumDialog(true);
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
      vehicleRequirement: vehicleRequirement || undefined,
      itinerary: itinerary || undefined,
      campingInfo: campingInfo || undefined,
      photos: photos.length > 0 ? photos : undefined,
      gpxFile: gpxFile || undefined,
      communicationMethods: communicationMethods.length > 0 ? communicationMethods : undefined,
      phoneNumber: phoneNumber || undefined,
      whatsappNumber: whatsappNumber || undefined,
      facebookHandle: facebookHandle || undefined,
      instagramHandle: instagramHandle || undefined,
      isPrivate,
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
      <Navigation />

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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrivate"
                  checked={isPrivate}
                  onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                />
                <Label htmlFor="isPrivate" className="cursor-pointer">
                  Make this trip private (only people with the link can see it)
                </Label>
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
                <Label>Vehicle Requirement (select one)</Label>
                <p className="text-sm text-muted-foreground mb-2">Choose the minimum vehicle requirement for this trip</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {VEHICLE_REQUIREMENTS.map((req) => {
                    const isSelected = vehicleRequirement === req.value;
                    const isDisabled = vehicleRequirement && !isSelected;
                    
                    return (
                      <div key={req.value} className={`flex items-center space-x-2 ${isDisabled ? 'opacity-40' : ''}`}>
                        <Checkbox
                          id={`vehicle-${req.value}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setVehicleRequirement(req.value);
                            } else {
                              setVehicleRequirement("");
                            }
                          }}
                        />
                        <label
                          htmlFor={`vehicle-${req.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {req.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
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
                <Label htmlFor="gpxFile">GPX File (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">Upload a GPX file for participants to use in onX, Gaia GPS, or other navigation apps</p>
                <Input
                  id="gpxFile"
                  type="file"
                  accept=".gpx"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setGpxFileName(file.name);
                      setUploadingGpx(true);
                      
                      try {
                        // Read file as base64
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          const base64 = event.target?.result as string;
                          const base64Data = base64.split(',')[1]; // Remove data:application/gpx+xml;base64, prefix
                          
                          try {
                            const result = await uploadGpxMutation.mutateAsync({
                              file: base64Data,
                              fileName: file.name,
                            });
                            
                            setGpxFile(result.url);
                            toast.success("GPX file uploaded successfully!");
                          } catch (error) {
                            toast.error("Failed to upload GPX file");
                            console.error(error);
                          } finally {
                            setUploadingGpx(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      } catch (error) {
                        toast.error("Failed to read GPX file");
                        setUploadingGpx(false);
                      }
                    }
                  }}
                  className="cursor-pointer"
                  disabled={uploadingGpx}
                />
                {uploadingGpx && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading {gpxFileName}...
                  </p>
                )}
                {gpxFile && !uploadingGpx && (
                  <p className="text-sm text-green-600 mt-2">✓ {gpxFileName} uploaded</p>
                )}
              </div>
              
              {/* Trip Photos - Temporarily hidden
              <div>
                <Label>Trip Photos</Label>
                <p className="text-sm text-muted-foreground mb-2">Add photos of the trail, terrain, or previous trips</p>
                <PhotoUpload photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />
              </div>
              */}
            </CardContent>
          </Card>

          {/* Communication Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">How should participants contact you?</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label>Preferred Methods (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="comm-text"
                      checked={communicationMethods.includes("text")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCommunicationMethods([...communicationMethods, "text"]);
                        } else {
                          setCommunicationMethods(communicationMethods.filter(m => m !== "text"));
                        }
                      }}
                    />
                    <label htmlFor="comm-text" className="text-sm font-medium cursor-pointer">
                      Text/SMS
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="comm-email"
                      checked={communicationMethods.includes("email")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCommunicationMethods([...communicationMethods, "email"]);
                        } else {
                          setCommunicationMethods(communicationMethods.filter(m => m !== "email"));
                        }
                      }}
                    />
                    <label htmlFor="comm-email" className="text-sm font-medium cursor-pointer">
                      Email
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="comm-whatsapp"
                      checked={communicationMethods.includes("whatsapp")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCommunicationMethods([...communicationMethods, "whatsapp"]);
                        } else {
                          setCommunicationMethods(communicationMethods.filter(m => m !== "whatsapp"));
                        }
                      }}
                    />
                    <label htmlFor="comm-whatsapp" className="text-sm font-medium cursor-pointer">
                      WhatsApp
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="comm-instagram"
                      checked={communicationMethods.includes("instagram")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCommunicationMethods([...communicationMethods, "instagram"]);
                        } else {
                          setCommunicationMethods(communicationMethods.filter(m => m !== "instagram"));
                        }
                      }}
                    />
                    <label htmlFor="comm-instagram" className="text-sm font-medium cursor-pointer">
                      Instagram DM
                    </label>
                  </div>
                </div>
              </div>
              
              {communicationMethods.includes("text") && (
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              )}
              
              {communicationMethods.includes("whatsapp") && (
                <div>
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              )}
              
              {communicationMethods.includes("facebook") && (
                <div>
                  <Label htmlFor="facebookHandle">Facebook Profile URL or Username</Label>
                  <Input
                    id="facebookHandle"
                    value={facebookHandle}
                    onChange={(e) => setFacebookHandle(e.target.value)}
                    placeholder="facebook.com/yourname or @yourname"
                  />
                </div>
              )}
              
              {communicationMethods.includes("instagram") && (
                <div>
                  <Label htmlFor="instagramHandle">Instagram Handle</Label>
                  <Input
                    id="instagramHandle"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@yourhandle"
                  />
                </div>
              )}
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

      {/* Premium Upgrade Dialog */}
      {createdTripId && (
        <PremiumTierDialog
          open={showPremiumDialog}
          onOpenChange={setShowPremiumDialog}
          tripId={createdTripId}
          onSuccess={() => {
            // Navigate to trip detail page after upgrade
            setLocation(`/trip/${createdTripId}`);
          }}
        />
      )}
    </div>
  );
}

