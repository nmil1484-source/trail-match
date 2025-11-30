import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "../lib/trpc";

export default function GpxLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { data: allGpxFiles, isLoading: loadingAll } = trpc.gpx.getAll.useQuery(undefined, {
    enabled: !isSearching,
  });

  const { data: searchResults, isLoading: loadingSearch } = trpc.gpx.search.useQuery(
    { query: searchQuery },
    { enabled: isSearching && searchQuery.length > 0 }
  );

  const displayFiles = isSearching ? searchResults : allGpxFiles;
  const isLoading = isSearching ? loadingSearch : loadingAll;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const handleDownload = async (gpxFile: any) => {
    try {
      // Track download using TRPC mutation
      await trpc.gpx.download.mutate({ id: gpxFile.gpxFile.id });

      // Download file from stored data
      const blob = new Blob([gpxFile.gpxFile.fileData], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = gpxFile.gpxFile.fileName;
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
        {/* Back Button */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GPX Library</h1>
          <p className="text-gray-600">
            Browse and download GPS tracks shared by the community
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, or description..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 text-white rounded-md font-semibold hover:bg-orange-700 transition"
            >
              Search
            </button>
            {isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-6 py-3 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Upload Button */}
        <div className="mb-6">
          <Link
            to="/upload-gpx"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
          >
            + Upload GPX File
          </Link>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Loading GPX files...</p>
          </div>
        ) : displayFiles && displayFiles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayFiles.map((item: any) => (
              <div key={item.gpxFile.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.gpxFile.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {item.gpxFile.location}
                    {item.gpxFile.state && `, ${item.gpxFile.state}`}
                  </div>
                  {item.uploader && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {item.uploader.name}
                    </div>
                  )}
                </div>

                {/* Description */}
                {item.gpxFile.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.gpxFile.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {item.gpxFile.viewCount} views
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {item.gpxFile.downloadCount} downloads
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/gpx/${item.gpxFile.id}`}
                    className="flex-1 text-center px-4 py-2 border border-orange-600 text-orange-600 rounded-md font-semibold hover:bg-orange-50 transition"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDownload(item)}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md font-semibold hover:bg-orange-700 transition"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No GPX files found</h3>
            <p className="mt-1 text-gray-500">
              {isSearching ? "Try a different search term" : "Be the first to upload a GPX file!"}
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
