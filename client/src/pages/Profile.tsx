import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const RIDING_STYLES = [
  { value: "rock_crawling", label: "Rock Crawling" },
  { value: "overland", label: "Overland" },
  { value: "desert", label: "Desert" },
  { value: "wanna_be_long_travel", label: "Wanna Be Long Travel" },
  { value: "long_travel_only", label: "Long Travel Only" },
  { value: "raptor", label: "Raptor" },
  { value: "jeeping", label: "Jeeping" },
  { value: "pre_running", label: "Pre-Running" },
];

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Vehicle form state
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [buildLevel, setBuildLevel] = useState<"stock" | "mild" | "moderate" | "heavy">("stock");
  const [liftHeight, setLiftHeight] = useState("");
  const [tireSize, setTireSize] = useState("");
  const [hasWinch, setHasWinch] = useState(false);
  const [hasLockers, setHasLockers] = useState(false);
  const [hasArmor, setHasArmor] = useState(false);
  const [hasSuspensionUpgrade, setHasSuspensionUpgrade] = useState(false);
  const [modsList, setModsList] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // User profile state
  const [location, setUserLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"beginner" | "intermediate" | "advanced" | "expert">("beginner");
  const [bio, setBio] = useState("");

  // Edit profile dialog state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editLocation, setEditLocation] = useState("");
  const [editExperienceLevel, setEditExperienceLevel] = useState<"beginner" | "intermediate" | "advanced" | "expert">("beginner");
  const [editBio, setEditBio] = useState("");

  // Edit vehicle dialog state
  const [editVehicleOpen, setEditVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  const { data: vehicles, isLoading: vehiclesLoading, refetch: refetchVehicles } = trpc.vehicles.list.useQuery();

  const createVehicleMutation = trpc.vehicles.create.useMutation({
    onSuccess: () => {
      toast.success("Vehicle added successfully!");
      refetchVehicles();
      // Reset form
      setMake("");
      setModel("");
      setYear("");
      setBuildLevel("stock");
      setLiftHeight("");
      setTireSize("");
      setHasWinch(false);
      setHasLockers(false);
      setHasArmor(false);
      setHasSuspensionUpgrade(false);
      setModsList("");
      setSelectedStyles([]);
    },
    onError: (error) => {
      toast.error("Failed to add vehicle: " + error.message);
    },
  });

  const deleteVehicleMutation = trpc.vehicles.delete.useMutation({
    onSuccess: () => {
      toast.success("Vehicle deleted");
      refetchVehicles();
    },
    onError: (error) => {
      toast.error("Failed to delete vehicle: " + error.message);
    },
  });

  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setEditProfileOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  const updateVehicleMutation = trpc.vehicles.update.useMutation({
    onSuccess: () => {
      toast.success("Vehicle updated successfully!");
      setEditVehicleOpen(false);
      refetchVehicles();
    },
    onError: (error) => {
      toast.error("Failed to update vehicle: " + error.message);
    },
  });

  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!make || !model || !year) {
      toast.error("Please fill in vehicle make, model, and year");
      return;
    }

    createVehicleMutation.mutate({
      make,
      model,
      year: parseInt(year),
      buildLevel,
      liftHeight: liftHeight || undefined,
      tireSize: tireSize || undefined,
      hasWinch,
      hasLockers,
      hasArmor,
      hasSuspensionUpgrade,
      modifications: modsList ? [modsList] : undefined,
    });
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleEditProfile = () => {
    setEditLocation(user?.location || "");
    setEditExperienceLevel(user?.experienceLevel || "beginner");
    setEditBio(user?.bio || "");
    setEditProfileOpen(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      location: editLocation || undefined,
      experienceLevel: editExperienceLevel,
      bio: editBio || undefined,
    });
  };

  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setEditVehicleOpen(true);
  };

  const handleSaveVehicle = () => {
    if (!editingVehicle) return;
    
    updateVehicleMutation.mutate({
      id: editingVehicle.id,
      make: editingVehicle.make,
      model: editingVehicle.model,
      year: editingVehicle.year,
      buildLevel: editingVehicle.buildLevel,
      liftHeight: editingVehicle.liftHeight || undefined,
      tireSize: editingVehicle.tireSize || undefined,
      hasWinch: editingVehicle.hasWinch,
      hasLockers: editingVehicle.hasLockers,
      hasArmor: editingVehicle.hasArmor,
      hasSuspensionUpgrade: editingVehicle.hasSuspensionUpgrade,
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>You need to sign in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
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

      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your vehicles and riding preferences
          </p>
        </div>

        {/* User Info */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Information</CardTitle>
            <Button variant="outline" size="sm" onClick={handleEditProfile}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <p className="text-lg font-medium">{user?.name}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* My Vehicles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Vehicles</CardTitle>
            <CardDescription>Vehicles you've added to your profile</CardDescription>
          </CardHeader>
          <CardContent>
            {vehiclesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : vehicles && vehicles.length > 0 ? (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border rounded-lg p-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <div className="text-sm text-muted-foreground space-y-1 mt-2">
                        <p>Build Level: <span className="capitalize">{vehicle.buildLevel}</span></p>
                        {vehicle.tireSize && <p>Tires: {vehicle.tireSize}</p>}
                        {vehicle.liftHeight && <p>Lift: {vehicle.liftHeight}</p>}
                        <div className="flex gap-2 flex-wrap mt-2">
                          {vehicle.hasWinch && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Winch</span>}
                          {vehicle.hasLockers && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Lockers</span>}
                          {vehicle.hasArmor && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Armor</span>}
                          {vehicle.hasSuspensionUpgrade && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">Suspension</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteVehicleMutation.mutate({ id: vehicle.id })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No vehicles added yet. Add your first vehicle below!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Add Vehicle Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Vehicle
            </CardTitle>
            <CardDescription>Add a vehicle to your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitVehicle} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="Toyota, Jeep, Ford..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="4Runner, Wrangler..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2020"
                    required
                  />
                </div>
              </div>

              {/* Build Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="buildLevel">Build Level</Label>
                  <Select value={buildLevel} onValueChange={(value: any) => setBuildLevel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="heavy">Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tireSize">Tire Size</Label>
                  <Input
                    id="tireSize"
                    value={tireSize}
                    onChange={(e) => setTireSize(e.target.value)}
                    placeholder="35x12.5R17"
                  />
                </div>
                <div>
                  <Label htmlFor="liftHeight">Lift Height</Label>
                  <Input
                    id="liftHeight"
                    value={liftHeight}
                    onChange={(e) => setLiftHeight(e.target.value)}
                    placeholder="3 inches"
                  />
                </div>
              </div>

              {/* Equipment Checkboxes */}
              <div>
                <Label className="mb-3 block">Equipment</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasWinch"
                      checked={hasWinch}
                      onCheckedChange={(checked) => setHasWinch(checked as boolean)}
                    />
                    <label htmlFor="hasWinch" className="text-sm cursor-pointer">
                      Winch
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasLockers"
                      checked={hasLockers}
                      onCheckedChange={(checked) => setHasLockers(checked as boolean)}
                    />
                    <label htmlFor="hasLockers" className="text-sm cursor-pointer">
                      Lockers
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasArmor"
                      checked={hasArmor}
                      onCheckedChange={(checked) => setHasArmor(checked as boolean)}
                    />
                    <label htmlFor="hasArmor" className="text-sm cursor-pointer">
                      Armor/Skids
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasSuspension"
                      checked={hasSuspensionUpgrade}
                      onCheckedChange={(checked) => setHasSuspensionUpgrade(checked as boolean)}
                    />
                    <label htmlFor="hasSuspension" className="text-sm cursor-pointer">
                      Suspension
                    </label>
                  </div>
                </div>
              </div>

              {/* Mods List */}
              <div>
                <Label htmlFor="modsList">Modifications List</Label>
                <Textarea
                  id="modsList"
                  value={modsList}
                  onChange={(e) => setModsList(e.target.value)}
                  placeholder="List your mods: King 2.5 coilovers, ARB bumper, etc..."
                  rows={4}
                />
              </div>

              {/* Riding Styles */}
              <div>
                <Label className="mb-3 block">Preferred Type of Off-Roading</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {RIDING_STYLES.map((style) => (
                    <div
                      key={style.value}
                      onClick={() => toggleStyle(style.value)}
                      className={`
                        p-3 border rounded-lg cursor-pointer transition-colors text-center text-sm
                        ${selectedStyles.includes(style.value)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card hover:bg-accent'
                        }
                      `}
                    >
                      {style.label}
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createVehicleMutation.isPending}>
                {createVehicleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Vehicle...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vehicle
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Edit Profile Dialog */}
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your profile information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="editLocation">Location</Label>
                <Input
                  id="editLocation"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="City, State"
                />
              </div>
              <div>
                <Label htmlFor="editExperienceLevel">Experience Level</Label>
                <Select value={editExperienceLevel} onValueChange={(value: any) => setEditExperienceLevel(value)}>
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
                <Label htmlFor="editBio">Bio</Label>
                <Textarea
                  id="editBio"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Vehicle Dialog */}
        <Dialog open={editVehicleOpen} onOpenChange={setEditVehicleOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
              <DialogDescription>Update your vehicle information</DialogDescription>
            </DialogHeader>
            {editingVehicle && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Make</Label>
                    <Input
                      value={editingVehicle.make}
                      onChange={(e) => setEditingVehicle({...editingVehicle, make: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input
                      value={editingVehicle.model}
                      onChange={(e) => setEditingVehicle({...editingVehicle, model: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={editingVehicle.year}
                      onChange={(e) => setEditingVehicle({...editingVehicle, year: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Build Level</Label>
                    <Select value={editingVehicle.buildLevel} onValueChange={(value) => setEditingVehicle({...editingVehicle, buildLevel: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tire Size</Label>
                    <Input
                      value={editingVehicle.tireSize || ""}
                      onChange={(e) => setEditingVehicle({...editingVehicle, tireSize: e.target.value})}
                      placeholder="35 inches"
                    />
                  </div>
                  <div>
                    <Label>Lift Height</Label>
                    <Input
                      value={editingVehicle.liftHeight || ""}
                      onChange={(e) => setEditingVehicle({...editingVehicle, liftHeight: e.target.value})}
                      placeholder="3 inches"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Modifications</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editWinch"
                        checked={editingVehicle.hasWinch}
                        onCheckedChange={(checked) => setEditingVehicle({...editingVehicle, hasWinch: checked})}
                      />
                      <label htmlFor="editWinch" className="text-sm cursor-pointer">Winch</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editLockers"
                        checked={editingVehicle.hasLockers}
                        onCheckedChange={(checked) => setEditingVehicle({...editingVehicle, hasLockers: checked})}
                      />
                      <label htmlFor="editLockers" className="text-sm cursor-pointer">Lockers</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editArmor"
                        checked={editingVehicle.hasArmor}
                        onCheckedChange={(checked) => setEditingVehicle({...editingVehicle, hasArmor: checked})}
                      />
                      <label htmlFor="editArmor" className="text-sm cursor-pointer">Armor/Skids</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="editSuspension"
                        checked={editingVehicle.hasSuspensionUpgrade}
                        onCheckedChange={(checked) => setEditingVehicle({...editingVehicle, hasSuspensionUpgrade: checked})}
                      />
                      <label htmlFor="editSuspension" className="text-sm cursor-pointer">Suspension Upgrade</label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditVehicleOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveVehicle} disabled={updateVehicleMutation.isPending}>
                {updateVehicleMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

