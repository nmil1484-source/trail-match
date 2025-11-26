import { useParams, Link } from "wouter";
import { trpc } from "../lib/trpc";

export default function GpxDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");

  const { data: gpxFile, isLoading } = trpc.gpx.getById.useQuery({ id });

  const handleDownload = async () => {
    if (!gpxFile) return;
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading GPX file...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!gpxFile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">GPX file not found</h3>
            <p className="mt-1 text-gray-500">The GPX file you're looking for doesn't exist.</p>
            <Link href="/gpx-library">
              <a className="mt-4 inline-block px-4 py-2 bg-orange-600 text-white rounded-md font-semibold hover:bg-orange-700 transition">
                Back to GPX Library
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/gpx-library">
            <a className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to GPX Library
            </a>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{gpxFile.title}</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Info Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Location</h3>
                <p className="text-lg text-gray-900">{gpxFile.location}, {gpxFile.state}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Uploaded By</h3>
                <p className="text-lg text-gray-900">{gpxFile.uploadedByName}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{gpxFile.description}</p>
          </div>

          {/* Stats */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{gpxFile.viewCount}</div>
                <div className="text-sm text-gray-600">Views</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{gpxFile.downloadCount}</div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              {gpxFile.distance && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{gpxFile.distance.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">km</div>
                </div>
              )}
              {gpxFile.elevationGain && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{gpxFile.elevationGain.toFixed(0)}</div>
                  <div className="text-sm text-gray-600">m elevation</div>
                </div>
              )}
            </div>
          </div>

          {/* File Info */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">File Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Filename:</span>
                <span className="text-gray-900 font-medium">{gpxFile.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uploaded:</span>
                <span className="text-gray-900 font-medium">
                  {new Date(gpxFile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleDownload}
            className="px-8 py-3 bg-orange-600 text-white rounded-md font-semibold hover:bg-orange-700 transition text-lg"
          >
            Download GPX File
          </button>
        </div>
      </div>
    </div>
  );
}
