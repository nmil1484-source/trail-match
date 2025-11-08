import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Database } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminGroupChatMigration() {
  const [result, setResult] = useState<string>("");

  const migrationMutation = trpc.admin.runGroupChatMigration.useMutation({
    onSuccess: (data) => {
      setResult(`✅ Migration successful!\n\n${data.message}`);
      toast.success("Group chat schema updated successfully!");
    },
    onError: (error) => {
      setResult(`❌ Migration failed:\n\n${error.message}`);
      toast.error("Migration failed");
    },
  });

  const runMigration = () => {
    setResult("");
    migrationMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <Link href="/admin">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
        </div>
      </header>

      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Group Chat Migration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              This will update the conversations table to support group chats for trips.
              Run this once to enable the trip group chat feature.
            </p>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold text-sm">What this migration does:</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Makes user1Id and user2Id nullable (for group chats)</li>
                <li>Adds tripId column to link conversations to trips</li>
                <li>Adds isGroup flag to distinguish group vs direct chats</li>
                <li>Adds title column for group chat names</li>
                <li>Adds index on tripId for performance</li>
                <li>Removes unique constraint (not needed for groups)</li>
              </ul>
            </div>

            <Button 
              onClick={runMigration} 
              disabled={migrationMutation.isPending}
              size="lg"
            >
              {migrationMutation.isPending ? "Running Migration..." : "Run Migration"}
            </Button>

            {result && (
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {result}
                  </pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
