import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

export default function AdminSubscriptionMigration() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("");
  const runMigration = trpc.admin.addSubscriptionFields.useMutation({
    onSuccess: () => {
      setStatus("✅ Migration completed successfully!");
    },
    onError: (error) => {
      setStatus(`❌ Error: ${error.message}`);
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin">
          <Button variant="outline" className="mb-4">← Back to Admin</Button>
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle>Add Subscription Fields Migration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will add the following fields to the shops table:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>stripeCustomerId (VARCHAR 255)</li>
              <li>stripeSubscriptionId (VARCHAR 255)</li>
              <li>subscriptionStatus (VARCHAR 50, default: 'none')</li>
            </ul>
            
            <Button
              onClick={() => runMigration.mutate()}
              disabled={runMigration.isPending}
              className="w-full"
            >
              {runMigration.isPending ? "Running..." : "Run Migration"}
            </Button>

            {status && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">{status}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
