import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Shield, Trash2, CheckCircle, Loader2 } from "lucide-react";

export default function AdminSetup() {
  const [promoteStatus, setPromoteStatus] = useState<"idle" | "loading" | "success">("idle");
  const [clearStatus, setClearStatus] = useState<"idle" | "loading" | "success">("idle");

  const promoteAdminMutation = trpc.admin.setupPromoteAdmin.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setPromoteStatus("success");
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
      setPromoteStatus("idle");
    },
  });

  const clearTripsMutation = trpc.admin.clearAllTrips.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setClearStatus("success");
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
      setClearStatus("idle");
    },
  });

  const handlePromoteAdmin = () => {
    setPromoteStatus("loading");
    promoteAdminMutation.mutate({ email: "nicholasmilward@gmail.com" });
  };

  const handleClearTrips = () => {
    if (!confirm("Are you sure you want to delete ALL trips? This cannot be undone!")) {
      return;
    }
    setClearStatus("loading");
    clearTripsMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Setup</h1>
          <p className="text-muted-foreground">One-time setup for production launch</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Step 1: Promote Admin
            </CardTitle>
            <CardDescription>
              Promote nicholasmilward@gmail.com to admin role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handlePromoteAdmin}
              disabled={promoteStatus === "loading" || promoteStatus === "success"}
              className="w-full"
              size="lg"
            >
              {promoteStatus === "loading" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {promoteStatus === "success" && (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {promoteStatus === "idle" && "Promote to Admin"}
              {promoteStatus === "loading" && "Promoting..."}
              {promoteStatus === "success" && "Admin Promoted ✓"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Step 2: Clear All Trips
            </CardTitle>
            <CardDescription>
              Delete all test trips to prepare for production launch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleClearTrips}
              disabled={clearStatus === "loading" || clearStatus === "success"}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              {clearStatus === "loading" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {clearStatus === "success" && (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {clearStatus === "idle" && "Clear All Trips"}
              {clearStatus === "loading" && "Clearing..."}
              {clearStatus === "success" && "All Trips Cleared ✓"}
            </Button>
          </CardContent>
        </Card>

        {promoteStatus === "success" && clearStatus === "success" && (
          <Card className="border-green-500 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  Setup Complete! 🚀
                </h3>
                <p className="text-green-800 mb-4">
                  Your site is ready for production launch!
                </p>
                <Button asChild>
                  <a href="/">Go to Homepage</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
