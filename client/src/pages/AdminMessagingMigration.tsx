import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Database } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminMessagingMigration() {
  const [result, setResult] = useState<string>("");

  const migrationMutation = trpc.admin.runMessagingMigration.useMutation({
    onSuccess: (data) => {
      setResult(`✅ Migration successful!\n\n${data.message}`);
      toast.success("Messaging tables created successfully!");
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

      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Messaging Tables Migration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This will create the conversations and messages tables in the database.
              Run this once to enable the messaging feature.
            </p>

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
                  <pre className="text-sm whitespace-pre-wrap">{result}</pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
