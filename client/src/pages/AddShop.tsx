import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { PhotoUpload } from "@/components/PhotoUpload";
import { GooglePlacesAutocomplete } from "@/components/GooglePlacesAutocomplete";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { GOOGLE_PLACES_API_KEY } from "@/const";

const SHOP_CATEGORIES = [
  { value: "mechanic", label: "Mechanic" },
  { value: "fabrication", label: "Fabrication" },
  { value: "parts", label: "Parts" },
  { value: "tires", label: "Tires" },
  { value: "suspension", label: "Suspension" },
  { value: "general", label: "General" },
  { value: "other", label: "Other" },
];

export default function AddShop() {
  const [, setLocation] = useLocation();
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
  const [useGoogleSearch, setUseGoogleSearch] = useState(true);

  const handlePlaceSelected = (details: any) => {
    setName(details.name);
    setAddress(details.address);
    setCity(details.city);
    setState(details.state);
    setZipCode(details.zipCode);
    setPhone(details.phone);
    setWebsite(details.website);
    if (details.photos.length > 0) {
      setPhotos(details.photos);
    }
    setUseGoogleSearch(false);
  };

  const createShop = trpc.shops.create.useMutation({
    onSuccess: () => {
      alert("Shop added successfully!");
      setLocation("/shops");
    },
    onError: (error) => {
      alert(`Error adding shop: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || categories.length === 0) {
      alert("Please fill in required fields (name and at least one category)");
      return;
    }

    createShop.mutate({
      name,
      description: description || undefined,
      categories: categories as ("mechanic" | "fabrication" | "parts" | "tires" | "suspension" | "general" | "other")[],
      otherDescription: otherDescription || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      zipCode: zipCode || undefined,
      phone: phone || undefined,
      email: email || undefined,
      website: website || undefined,
      photos: photos.length > 0 ? photos : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/shops">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shops
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Add New Shop</h1>
          <p className="text-gray-600 mt-1">Share a trusted off-road shop with the community</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Shop Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Google Places Search */}
              {useGoogleSearch && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold mb-2 text-blue-900">🔍 Search Google Places</h3>
                  <p className="text-xs text-blue-700 mb-3">Find a shop on Google to auto-fill details</p>
                  <GooglePlacesAutocomplete
                    apiKey={GOOGLE_PLACES_API_KEY}
                    onPlaceSelected={handlePlaceSelected}
                  />
                  <button
                    type="button"
                    onClick={() => setUseGoogleSearch(false)}
                    className="text-xs text-blue-600 hover:underline mt-2"
                  >
                    Or add manually
                  </button>
                </div>
              )}

              {!useGoogleSearch && (
                <button
                  type="button"
                  onClick={() => setUseGoogleSearch(true)}
                  className="text-sm text-blue-600 hover:underline mb-4"
                >
                  ← Search Google Places instead
                </button>
              )}

              {/* Basic Info */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Rocky Mountain 4x4"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Categories <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SHOP_CATEGORIES.map((cat) => (
                    <div key={cat.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.value}`}
                        checked={categories.includes(cat.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCategories([...categories, cat.value]);
                          } else {
                            setCategories(categories.filter(c => c !== cat.value));
                          }
                        }}
                      />
                      <Label htmlFor={`cat-${cat.value}`} className="cursor-pointer">
                        {cat.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {categories.includes("other") && (
                  <div className="mt-3">
                    <Input
                      value={otherDescription}
                      onChange={(e) => setOtherDescription(e.target.value)}
                      placeholder="Please specify the type of shop..."
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about this shop..."
                  rows={4}
                />
              </div>

              {/* Location */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Street Address</label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">City</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Denver"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">State</label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CO"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">ZIP Code</label>
                    <Input
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="80202"
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@shop.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-2 block">Website</label>
                    <Input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://shop.com"
                    />
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Photos</h3>
                <PhotoUpload
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={5}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={createShop.isPending}
                  className="flex-1"
                >
                  {createShop.isPending ? "Adding Shop..." : "Add Shop"}
                </Button>
                <Link href="/shops">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

