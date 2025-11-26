import { Link } from "wouter";
import { trpc } from "../lib/trpc";

export default function MyGpx() {
  const { data: myGpxFiles, isLoading, refetch } = trpc.gpx.getMyFiles.useQuery();
  const deleteMutation = trpc.gpx.delete.useMutation({
    onSuccess: () => {
      alert("GPX file deleted successfully");
      refetch();
    },
    onError: (error) => {
      alert(`Delete failed: ${error.message}`);
    },
  });

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleDownload = async (gpxFile: any) => {
    try {
      // Track download using TRPC mutation
      await trpc.gpx.download.mutate({ id: gpxFile.id });

      // Download file from stored data
      const blob = new Blob([gpxFile.fileData], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = gpxFile.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My GPX Files</h1>
          <p className="text-gray-600">
            Manage your uploaded GPS tracks
          </p>
        </div>

        {/* Upload Button */}
        <div className="mb-6">
          <Link
            to="/upload-gpx"
            className="inline-block px-6 py-3 bg-orange-600 text-white rounded-md font-semibold hover:bg-orange-700 transition"
          >
            + Upload New GPX
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Loading your GPX files...</p>
          </div>
        ) : myGpxFiles && myGpxFiles.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myGpxFiles.map((gpxFile: any) => (
                    <tr key={gpxFile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{gpxFile.title}</div>
                        {gpxFile.description && (
                          <div className="text-sm text-gray-500 line-clamp-1">{gpxFile.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{gpxFile.location}</div>
                        {gpxFile.state && (
                          <div className="text-sm text-gray-500">{gpxFile.state}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {gpxFile.viewCount} views
                        </div>
                        <div className="text-sm text-gray-500">
                          {gpxFile.downloadCount} downloads
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(gpxFile.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/gpx/${gpxFile.id}`}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDownload(gpxFile)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDelete(gpxFile.id, gpxFile.title)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteMutation.isLoading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {myGpxFiles.map((gpxFile: any) => (
                <div key={gpxFile.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{gpxFile.title}</h3>
                    {gpxFile.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{gpxFile.description}</p>
                    )}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-900 font-medium">{gpxFile.location}, {gpxFile.state}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Stats:</span>
                      <span className="text-gray-900">{gpxFile.viewCount} views, {gpxFile.downloadCount} downloads</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Uploaded:</span>
                      <span className="text-gray-900">{new Date(gpxFile.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/gpx/${gpxFile.id}`}
                      className="flex-1 text-center px-4 py-2 border border-orange-600 text-orange-600 rounded-md font-semibold hover:bg-orange-50 transition"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDownload(gpxFile)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(gpxFile.id, gpxFile.title)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition"
                      disabled={deleteMutation.isLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No GPX files yet</h3>
            <p className="mt-1 text-gray-500">
              Upload your first GPX file to share with the community
            </p>
            <div className="mt-6">
              <Link
                to="/upload-gpx"
                className="inline-block px-6 py-3 bg-orange-600 text-white rounded-md font-semibold hover:bg-orange-700 transition"
              >
                Upload GPX File
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
