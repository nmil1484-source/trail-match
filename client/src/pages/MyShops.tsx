import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { trpc } from "@/lib/trpc";
import { Crown, Star, Plus, Edit, Loader2, Store, TrendingUp, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import ManageSubscriptionModal from "@/components/ManageSubscriptionModal";
import ShopUpgradeModal from "@/components/ShopUpgradeModal";

export default function MyShops() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [manageSubModalOpen, setManageSubModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const { data: myShops, isLoading } = trpc.shops.myShops.useQuery();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const getTierBadge = (tier: string | null) => {
    if (tier === "premium") {
      return <Badge className="bg-yellow-500"><Crown className="h-3 w-3 mr-1" />Premium</Badge>;
    }
    if (tier === "featured") {
      return <Badge className="bg-orange-500"><Star className="h-3 w-3 mr-1" />Featured</Badge>;
    }
    return <Badge variant="outline">Free</Badge>;
  };

  const getTierPrice = (tier: string | null) => {
    if (tier === "premium") return "$15/month";
    if (tier === "featured") return "$5/month";
    return "Free";
  };

  const freeShops = myShops?.filter(shop => !shop.premiumTier || shop.premiumTier === "none") || [];
  const premiumShops = myShops?.filter(shop => shop.premiumTier && shop.premiumTier !== "none") || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Shops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{myShops?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Premium Shops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{premiumShops.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${premiumShops.reduce((sum, shop) => {
                  if (shop.premiumTier === "premium") return sum + 15;
                  if (shop.premiumTier === "featured") return sum + 5;
                  return sum;
                }, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link href="/add-shop">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-5 w-5" />
              Add New Shop
            </Button>
          </Link>
          <Button size="lg" variant="outline" onClick={() => setManageSubModalOpen(true)}>
            <Crown className="mr-2 h-5 w-5" />
            Manage Subscriptions
          </Button>
        </div>

        {/* Shop Listings */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : myShops && myShops.length > 0 ? (
          <div className="space-y-8">
            {/* Premium Shops */}
            {premiumShops.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  Premium Shops
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {premiumShops.map((shop) => (
                    <Card key={shop.id} className="border-2 border-orange-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{shop.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {shop.city}, {shop.state}
                            </CardDescription>
                          </div>
                          {getTierBadge(shop.premiumTier)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Plan</span>
                            <span className="font-medium">{getTierPrice(shop.premiumTier)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <span className="font-medium capitalize text-green-600">
                              {shop.subscriptionStatus || "Active"}
                            </span>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Link href={`/edit-shop/${shop.id}`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Link href={`/shops`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Free Shops */}
            {freeShops.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Free Shops</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {freeShops.map((shop) => (
                    <Card key={shop.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl">{shop.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {shop.city}, {shop.state}
                            </CardDescription>
                          </div>
                          {getTierBadge(shop.premiumTier)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm text-muted-foreground">
                              <TrendingUp className="h-4 w-4 inline mr-1" />
                              Upgrade to get more visibility and features
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/edit-shop/${shop.id}`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            <Link href={`/shops`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </Link>
                          </div>
                          <Button 
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            onClick={() => setUpgradeModalOpen(true)}
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade Shop
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No shops yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first shop listing
              </p>
              <Link href="/add-shop">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First Shop
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Manage Subscription Modal */}
      <ManageSubscriptionModal 
        open={manageSubModalOpen} 
        onOpenChange={setManageSubModalOpen}
      />

      {/* Shop Upgrade Modal */}
      <ShopUpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen}
      />
    </div>
  );
}
