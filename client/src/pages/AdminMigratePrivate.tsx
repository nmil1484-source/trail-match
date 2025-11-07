import { useState } from "react";
import { trpc } from "../lib/trpc";

export default function AdminMigratePrivate() {
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    message: string;
    steps: string[];
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const migrateMutation = trpc.admin.migratePrivateTripsAndDenials.useMutation();

  const runMigration = async () => {
    setIsRunning(true);
    setMigrationResult(null);

    try {
      const result = await migrateMutation.mutateAsync();
      setMigrationResult(result);
    } catch (error: any) {
      setMigrationResult({
        success: false,
        message: error.message || "Migration failed",
        steps: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔧 Private Trips & Denial Reasons Migration
          </h1>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> This will modify the database schema. Only run this once!
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              What this migration does:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Adds <code className="bg-gray-100 px-2 py-1 rounded">denialReason</code> field to tripParticipants table</li>
              <li>Adds <code className="bg-gray-100 px-2 py-1 rounded">isPrivate</code> field to trips table</li>
              <li>Adds <code className="bg-gray-100 px-2 py-1 rounded">shareToken</code> field to trips table</li>
              <li>Enables trip organizers to provide reasons when declining join requests</li>
              <li>Enables creation of private trips with shareable links</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">New Features</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-2"><strong>Denial Reasons:</strong> When declining a join request, organizers can provide a reason that the requester will see.</p>
                  <p><strong>Private Trips:</strong> Create trips that don't appear in public listings. Share via unique link with selected people.</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={runMigration}
            disabled={isRunning || migrationResult?.success}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              isRunning
                ? "bg-gray-400 cursor-not-allowed"
                : migrationResult?.success
                ? "bg-green-500 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isRunning
              ? "⏳ Running Migration..."
              : migrationResult?.success
              ? "✅ Migration Complete!"
              : "🚀 Run Migration"}
          </button>

          {migrationResult && (
            <div className={`mt-6 p-6 rounded-lg ${
              migrationResult.success
                ? "bg-green-50 border-2 border-green-200"
                : "bg-red-50 border-2 border-red-200"
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                migrationResult.success ? "text-green-800" : "text-red-800"
              }`}>
                {migrationResult.success ? "✅ Success!" : "❌ Error"}
              </h3>
              
              <p className={`mb-4 ${
                migrationResult.success ? "text-green-700" : "text-red-700"
              }`}>
                {migrationResult.message}
              </p>

              {migrationResult.steps.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Migration Steps:</h4>
                  <div className="bg-white rounded p-4 space-y-1 font-mono text-sm">
                    {migrationResult.steps.map((step, index) => (
                      <div key={index} className="text-gray-700">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {migrationResult.success && (
                <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                  <p className="text-blue-800 font-semibold">
                    🎉 Next Steps:
                  </p>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-700">
                    <li>Denial reasons will now be available when declining join requests</li>
                    <li>Private trip option will appear when creating new trips</li>
                    <li>Shareable links will be generated for private trips</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
