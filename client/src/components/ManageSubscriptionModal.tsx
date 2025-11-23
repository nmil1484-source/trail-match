import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Crown, Star, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ManageSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageSubscriptionModal({ open, onOpenChange }: ManageSubscriptionModalProps) {
  const [cancellingShopId, setCancellingShopId] = useState<number | null>(null);

  const { data: myShops, isLoading: shopsLoading, refetch } = trpc.shops.myShops.useQuery(undefined, {
    enabled: open,
  });

  const cancelSubscription = trpc.shops.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription cancelled successfully");
      setCancellingShopId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel subscription");
      setCancellingShopId(null);
    },
  });

  const handleCancelSubscription = async (shopId: number) => {
    if (!confirm("Are you sure you want to cancel this subscription? Your shop will be downgraded to free at the end of the current billing period.")) {
      return;
    }

    setCancellingShopId(shopId);
    cancelSubscription.mutate({ shopId });
  };

  const premiumShops = myShops?.filter(shop => shop.premiumTier && shop.premiumTier !== "none") || [];

  const getTierBadge = (tier: string) => {
    if (tier === "premium") {
      return <Badge className="bg-yellow-500"><Crown className="h-3 w-3 mr-1" />Premium</Badge>;
    }
    if (tier === "featured") {
      return <Badge className="bg-orange-500"><Star className="h-3 w-3 mr-1" />Featured</Badge>;
    }
    return null;
  };

  const getTierPrice = (tier: string) => {
    if (tier === "premium") return "$15/month";
    if (tier === "featured") return "$5/month";
    return "Free";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Subscriptions</DialogTitle>
          <DialogDescription>
            View and manage your shop subscriptions
          </DialogDescription>
        </DialogHeader>

        {shopsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : premiumShops.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You don't have any active subscriptions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {premiumShops.map((shop) => (
              <Card key={shop.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{shop.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {shop.city}, {shop.state}
                      </p>
                    </div>
                    {getTierBadge(shop.premiumTier)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Current Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {getTierPrice(shop.premiumTier)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Status</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {shop.subscriptionStatus || "Active"}
                        </p>
                      </div>
                    </div>

                    {shop.subscriptionStatus === "active" && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCancelSubscription(shop.id)}
                        disabled={cancellingShopId === shop.id}
                      >
                        {cancellingShopId === shop.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Cancel Subscription"
                        )}
                      </Button>
                    )}

                    {shop.subscriptionStatus === "canceled" && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          Your subscription has been cancelled. You'll retain premium features until the end of your current billing period.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="bg-muted p-4 rounded-md mt-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> When you cancel a subscription, your shop will continue to have premium features until the end of the current billing period. After that, it will automatically downgrade to a free listing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
