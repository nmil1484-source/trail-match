import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Crown, Star, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShopUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShopUpgradeModal({ open, onOpenChange }: ShopUpgradeModalProps) {
  const [selectedShop, setSelectedShop] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: myShops, isLoading: shopsLoading } = trpc.shops.myShops.useQuery(undefined, {
    enabled: open,
  });

  const createSubscription = trpc.shops.createSubscription.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      setIsProcessing(false);
      toast.error(error.message || "Failed to create subscription");
    },
  });

  const handleUpgrade = async (tier: "featured" | "premium") => {
    if (!selectedShop) {
      toast.error("Please select which shop you want to upgrade");
      return;
    }

    setIsProcessing(true);
    createSubscription.mutate({
      shopId: selectedShop,
      tier,
    });
  };

  const freeShops = myShops?.filter(shop => shop.premiumTier === "none" || !shop.premiumTier) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade Your Shop</DialogTitle>
        </DialogHeader>

        {shopsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : freeShops.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600 mb-4">
              You don't have any shops that can be upgraded.
            </p>
            <p className="text-sm text-gray-500">
              All your shops are already on premium plans, or you haven't added any shops yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Shop Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Select Shop to Upgrade</label>
              <div className="grid gap-3">
                {freeShops.map((shop) => (
                  <Card
                    key={shop.id}
                    className={`cursor-pointer transition-all ${
                      selectedShop === shop.id
                        ? "border-primary border-2 bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedShop(shop.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedShop === shop.id
                              ? "border-primary bg-primary"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedShop === shop.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{shop.name}</h3>
                          <p className="text-sm text-gray-600">
                            {shop.city}, {shop.state}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pricing Tiers */}
            <div>
              <label className="text-sm font-medium mb-3 block">Choose Your Plan</label>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Featured Tier */}
                <Card className="border-2 border-orange-200 hover:border-orange-300 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-6 w-6 text-orange-500" />
                      <h3 className="text-xl font-bold">Featured</h3>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">$5</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Orange border highlight</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Priority placement in listings</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Featured badge</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Increased visibility</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleUpgrade("featured")}
                      disabled={!selectedShop || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Subscribe to Featured"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Tier */}
                <Card className="border-2 border-yellow-300 hover:border-yellow-400 transition-all bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Crown className="h-6 w-6 text-yellow-600" />
                      <h3 className="text-xl font-bold">Premium</h3>
                      <span className="ml-auto text-xs bg-yellow-600 text-white px-2 py-1 rounded-full font-semibold">
                        BEST VALUE
                      </span>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">$15</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Gold crown badge</strong></span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span><strong>Top placement</strong> - Always first</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Gold border highlight</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Maximum visibility</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>All Featured benefits included</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => handleUpgrade("premium")}
                      disabled={!selectedShop || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Subscribe to Premium"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 pt-4 border-t">
              <p>✓ Cancel anytime • ✓ Secure payment via Stripe • ✓ Instant activation</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
