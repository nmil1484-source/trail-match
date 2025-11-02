import { useState, useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { PhotoUpload } from "@/components/PhotoUpload";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const SHOP_CATEGORIES = [
  { value: "mechanic", label: "Mechanic" },
  { value: "fabrication", label: "Fabrication" },
  { value: "parts", label: "Parts" },
  { value: "tires", label: "Tires" },
  { value: "suspension", label: "Suspension" },
  { value: "general", label: "General" },
  { value: "other", label: "Other" },
];

export default function EditShop() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const shopId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  
  const { data: shop, isLoading: shopLoading } = trpc.shops.getById.useQuery({ shopId });
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [otherDescription, setOtherDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  // Pre-fill form when shop data loads
  useEffect(() => {
    if (shop) {
      setName(shop.name);
      setDescription(shop.description || "");
      const categoriesArray = shop.categories ? (typeof shop.categories === 'string' ? shop.categories.split(',') : Array.isArray(shop.categories) ? shop.categories : []) : [];
      setCategories(categoriesArray);
      setOtherDescription(shop.otherDescription || "");
      setAddress(shop.address || "");
      setCity(shop.city || "");
      setState(shop.state || "");
      setZipCode(shop.zipCode || "");
      setPhone(shop.phone || "");
      setEmail(shop.email || "");
      setWebsite(shop.website || "");
      const photosArray = shop.photos ? (typeof shop.photos === 'string' ? shop.photos.split(',') : Array.isArray(shop.photos) ? shop.photos : []) : [];
      setPhotos(photosArray);
    }
  }, [shop]);

  const updateShop = trpc.shops.update.useMutation({
    onSuccess: () => {
      toast.success("Shop updated successfully!");
      setLocation(`/shops/${shopId}`);
    },
    onError: (error) => {
      toast.error(`Failed to update shop: ${error.message}`);
    },
  });

  const handleCategoryToggle = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !address || !city || !state || categories.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateShop.mutate({
      id: shopId,
      name,
      description: description || undefined,
      categories: categories as ("mechanic" | "fabrication" | "parts" | "tires" | "suspension" | "general" | "other")[],
      otherDescription: categories.includes("other") ? otherDescription : undefined,
      address,
      city,
      state,
      zipCode: zipCode || undefined,
      phone: phone || undefined,
      email: email || undefined,
      website: website || undefined,
      photos: photos.length > 0 ? photos : undefined,
    });
  };

  if (authLoading || shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-bold mb-2">Shop not found</h2>
        <Button asChild>
          <Link href="/shops">Go to Shops</Link>
        </Button>
      </div>
    );
  }

  // Check if user is the owner
  if (shop.addedBy !== user?.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-bold mb-2">Unauthorized</h2>
        <p className="text-muted-foreground mb-6">You can only edit your own shops</p>
        <Button asChild>
          <Link href={`/shops/${shopId}`}>Back to Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <Link href={`/shops/${shopId}`}>
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Edit Shop</h1>
        <p className="text-muted-foreground mb-8">Update shop information</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Shop Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter shop name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your shop..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Categories * (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {SHOP_CATEGORIES.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.value}
                        checked={categories.includes(category.value)}
                        onCheckedChange={() => handleCategoryToggle(category.value)}
                      />
                      <label
                        htmlFor={category.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {categories.includes("other") && (
                <div>
                  <Label htmlFor="otherDescription">Other Description *</Label>
                  <Input
                    id="otherDescription"
                    value={otherDescription}
                    onChange={(e) => setOtherDescription(e.target.value)}
                    placeholder="Describe what makes your shop unique"
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="CA"
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="12345"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shop@example.com"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUpload photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation(`/shops/${shopId}`)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateShop.isPending} className="flex-1">
              {updateShop.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Shop"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

