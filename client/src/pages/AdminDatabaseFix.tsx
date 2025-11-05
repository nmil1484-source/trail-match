import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, Database } from "lucide-react";

export default function AdminDatabaseFix() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const fixSchemaMutation = trpc.admin.fixShopsSchema.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setMessage(data.message);
    },
    onError: (error) => {
      setStatus("error");
      setMessage(error.message);
    },
  });

  const handleFixSchema = () => {
    if (confirm("This will modify the database schema. Are you sure?")) {
      setStatus("loading");
      setMessage("");
      fixSchemaMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              Database Schema Fix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Warning</h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    This will modify the shops table schema to allow NULL values for optional fields.
                    This is needed to fix the shop creation error.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">What this does:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li>Makes description, address, city, state, zipCode, phone, email, website, and photos fields nullable</li>
                <li>Allows shop creation without filling in all optional fields</li>
                <li>Fixes the "Failed query: insert into shops" error</li>
              </ul>
            </div>

            <Button
              onClick={handleFixSchema}
              disabled={status === "loading" || status === "success"}
              className="w-full"
              size="lg"
            >
              {status === "loading" ? "Fixing Schema..." : "Fix Database Schema"}
            </Button>

            {status === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900">Success!</h3>
                    <p className="text-sm text-green-800 mt-1">{message}</p>
                    <p className="text-sm text-green-800 mt-2">
                      You can now add shops without errors. Try adding a shop at{" "}
                      <a href="/shops/add" className="underline">
                        /shops/add
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-900">Error</h3>
                    <p className="text-sm text-red-800 mt-1">{message}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
