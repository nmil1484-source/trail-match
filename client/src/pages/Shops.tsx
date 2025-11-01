import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { MapPin, Phone, Mail, Globe, Star, Plus } from "lucide-react";
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
  const { isAuthenticated } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchState, setSearchState] = useState("");

  const { data: shops, isLoading } = trpc.shops.list.useQuery({
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    state: searchState || undefined,
  });

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {shop.photos && Array.isArray(shop.photos) && shop.photos.length > 0 ? (
                    <img
                      src={(shop.photos as string[])[0]}
                      alt={shop.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : null}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{shop.name}</CardTitle>
                      <div className="flex flex-wrap gap-1">
                        {(shop.categories as string[]).map((cat) => (
                          <span key={cat} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full capitalize">
                            {cat}
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

