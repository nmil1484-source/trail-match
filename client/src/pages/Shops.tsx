import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ImageLightbox from "@/components/ImageLightbox";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { MapPin, Phone, Mail, Globe, Star, Plus, CheckCircle, Crown } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const SHOP_CATEGORIES = [
  { value: "mechanic", label: "Mechanic" },
  { value: "fabrication", label: "Fabrication" },
  { value: "parts", label: "Parts" },
  { value: "tires", label: "Tires" },
  { value: "suspension", label: "Suspension" },
  { value: "general", label: "General" },
  { value: "other", label: "Other" },
];

export default function Shops() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchState, setSearchState] = useState("");
  const { data: notificationCount } = trpc.auth.notificationCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  
  const { data: unreadMessageCount } = trpc.messages.getUnreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: shops, isLoading } = trpc.shops.list.useQuery({
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    state: searchState || undefined,
  });

  return (
    <div className="min-h-screen bg-background">
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
              {isAuthenticated && (
                <>
                  <Link href="/post-trip" className="text-foreground hover:text-primary font-medium">
                    Post Trip
                  </Link>
                  <Link href="/messages" className="text-foreground hover:text-primary font-medium relative">
                    Messages
                    {unreadMessageCount && unreadMessageCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadMessageCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/profile" className="text-foreground hover:text-primary font-medium relative">
                    My Profile
                    {notificationCount && notificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {notificationCount}
                      </span>
                    )}
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin" className="text-foreground hover:text-primary font-medium">
                      Admin
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Off-Road Shops</h1>
              <p className="text-gray-600 mt-1">Find trusted shops for your off-road vehicle</p>
            </div>
            {isAuthenticated && (
              <Link href="/shops/add">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shop
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Premium Shop Promotion Banner */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-6 w-6 text-yellow-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Promote Your Shop</h2>
                </div>
                <p className="text-gray-700 mb-3">
                  Get more visibility with Premium or Featured listings! Stand out with special badges, priority placement, and enhanced visibility.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span><strong>Verified Badge</strong> - Build trust</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span><strong>Premium Badge</strong> - Stand out</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-orange-500" />
                    <span><strong>Top Placement</strong> - Get noticed first</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <a href="mailto:contact@trail-match.com?subject=Premium Shop Listing Inquiry" className="inline-block">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Us for Pricing
                  </Button>
                </a>
                <p className="text-xs text-gray-600 text-center">Starting at $XX/month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-3 block">Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SHOP_CATEGORIES.map((cat) => (
                    <div key={cat.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-${cat.value}`}
                        checked={selectedCategories.includes(cat.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, cat.value]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== cat.value));
                          }
                        }}
                      />
                      <Label htmlFor={`filter-${cat.value}`} className="cursor-pointer">
                        {cat.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">State</label>
                <Input
                  placeholder="e.g., CA, UT, AZ"
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shop Listings */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading shops...</p>
          </div>
        ) : shops && shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.id}`}>
                <div>
                  <Card className={`hover:shadow-lg transition-shadow cursor-pointer h-full ${
                    shop.premiumTier === 'premium' ? 'border-2 border-yellow-400 shadow-xl' :
                    shop.premiumTier === 'featured' ? 'border-2 border-orange-300' :
                    ''
                  }`}>
                  {shop.photos && Array.isArray(shop.photos) && shop.photos.length > 0 ? (
                    <ImageLightbox
                      src={(shop.photos as string[])[0]}
                      alt={shop.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : null}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{shop.name}</CardTitle>
                        {shop.isVerified && (
                          <CheckCircle className="h-5 w-5 text-blue-500 fill-blue-500" title="Verified Shop" />
                        )}
                        {shop.premiumTier === 'premium' && (
                          <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" title="Premium Shop" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(shop.categories as string[]).map((cat) => (
                          <span key={cat} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full capitalize">
                            {cat === "other" && shop.otherDescription ? shop.otherDescription : cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    {shop.averageRating && shop.averageRating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{((shop.averageRating || 0) / 10).toFixed(1)}</span>
                        <span className="text-gray-500">({shop.totalReviews} reviews)</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {shop.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{shop.description}</p>
                    )}
                    <div className="space-y-2 text-sm text-gray-600">
                      {shop.city && shop.state && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{shop.city}, {shop.state}</span>
                        </div>
                      )}
                      {shop.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{shop.phone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No shops found. Be the first to add one!</p>
              {isAuthenticated && (
                <Link href="/shops/add">
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Shop
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

