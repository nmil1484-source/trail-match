import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2, Sparkles, Star, Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PremiumTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: number;
  onSuccess: () => void;
}

const TIER_OPTIONS = [
  {
    id: "free" as const,
    name: "Free Trip",
    price: "$0.00",
    icon: Check,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    features: [
      "✓ Visible to all users",
      "✓ Standard listing",
      "✓ Join requests enabled",
      "✓ Unlimited duration",
    ],
  },
  {
    id: "featured" as const,
    name: "Featured Trip",
    price: "$0.99",
    icon: Star,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    features: [
      "⭐ Featured badge on listing",
      "📍 Priority placement in search",
      "🏠 Highlighted on homepage",
      "⏰ 30 days of visibility",
    ],
  },
  {
    id: "premium" as const,
    name: "Premium Trip",
    price: "$1.99",
    icon: Trophy,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    features: [
      "✅ Everything in Featured",
      "🏆 Verified premium badge",
      "🔝 Top of all search results",
      "📱 Social media promotion",
      "⏰ 30 days of visibility",
    ],
    recommended: true,
  },
];

function PaymentForm({ 
  clientSecret, 
  tripId, 
  tier, 
  onSuccess 
}: { 
  clientSecret: string; 
  tripId: number; 
  tier: "featured" | "premium"; 
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmUpgradeMutation = trpc.trips.confirmPremiumUpgrade.useMutation({
    onSuccess: () => {
      toast.success("Trip upgraded successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Upgrade failed: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + `/trip/${tripId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm upgrade on backend
        await confirmUpgradeMutation.mutateAsync({
          tripId,
          paymentIntentId: paymentIntent.id,
          tier,
        });
      }
    } catch (err) {
      toast.error("Payment processing error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${tier === "featured" ? "$0.99" : "$1.99"}`
        )}
      </Button>
    </form>
  );
}

export function PremiumTierDialog({ open, onOpenChange, tripId, onSuccess }: PremiumTierDialogProps) {
  const [selectedTier, setSelectedTier] = useState<"free" | "featured" | "premium" | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createPaymentMutation = trpc.trips.createPaymentIntent.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      toast.error(`Failed to create payment: ${error.message}`);
      // Reset to tier selection so user can try again or choose free
      setSelectedTier(null);
      setClientSecret(null);
    },
  });

  const handleSelectTier = (tier: "free" | "featured" | "premium") => {
    if (tier === "free") {
      // Free tier - just close and proceed
      onSuccess();
      onOpenChange(false);
      setSelectedTier(null);
      setClientSecret(null);
    } else {
      // Paid tier - initiate payment
      setSelectedTier(tier);
      createPaymentMutation.mutate({ tripId, tier });
    }
  };

  const handleBack = () => {
    setSelectedTier(null);
    setClientSecret(null);
  };

  const handleSuccessAndClose = () => {
    onSuccess();
    onOpenChange(false);
    setSelectedTier(null);
    setClientSecret(null);
  };

  const handleDialogClose = (open: boolean) => {
    // Only allow closing, don't trigger onSuccess
    if (!open) {
      onOpenChange(false);
      setSelectedTier(null);
      setClientSecret(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Choose Your Listing Type
          </DialogTitle>
          <DialogDescription>
            Select how you want to post your trip
          </DialogDescription>
        </DialogHeader>

        {!selectedTier ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2 max-h-[70vh] overflow-y-auto">
            {TIER_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.id}
                  className={`relative p-4 md:p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${
                    option.recommended ? option.borderColor : "border-border"
                  }`}
                  onClick={() => handleSelectTier(option.id)}
                >
                  {option.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                      RECOMMENDED
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`h-6 w-6 md:h-8 md:w-8 ${option.color}`} />
                    <div className="text-right">
                      <div className="text-2xl md:text-3xl font-bold">{option.price}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.id === "free" ? "forever" : "one-time"}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold mb-2">{option.name}</h3>
                  <ul className="space-y-1 md:space-y-2 mb-3">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="text-xs md:text-sm flex items-start gap-2">
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-auto ${option.id === "featured" ? "bg-orange-600 text-white hover:bg-orange-700" : ""}`}
                    variant={option.id === "free" ? "default" : option.recommended ? "default" : "outline"}
                  >
                    {option.id === "free" ? "Post Free" : `Select ${option.name}`}
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-4">
            {createPaymentMutation.isError ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-destructive">Payment system is currently unavailable.</p>
                <p className="text-sm text-muted-foreground">Please try again later or post a free trip.</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={handleBack}>
                    Back to options
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => handleSelectTier("free")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Post Free Trip Instead
                  </Button>
                </div>
              </div>
            ) : clientSecret ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-semibold">
                      {selectedTier === "featured" ? "Featured Trip" : "Premium Trip"}
                    </h4>
                    <p className="text-sm text-muted-foreground">30 days of enhanced visibility</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {selectedTier === "featured" ? "$0.99" : "$1.99"}
                  </div>
                </div>

                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm 
                    clientSecret={clientSecret} 
                    tripId={tripId} 
                    tier={selectedTier as "featured" | "premium"} 
                    onSuccess={handleSuccessAndClose}
                  />
                </Elements>

                <Button variant="ghost" onClick={handleBack} className="w-full">
                  Back to options
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          💡 Premium listings expire after 30 days. You can upgrade or renew anytime from your profile.
        </div>
      </DialogContent>
    </Dialog>
  );
}

