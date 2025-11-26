import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";

export default function UploadGpx() {
  const [, setLocation] = useLocation();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    state: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const createGpxMutation = trpc.gpx.create.useMutation({
    onSuccess: () => {
      alert("GPX file uploaded successfully!");
      setLocation("/gpx-library");
    },
    onError: (error) => {
      alert(`Upload failed: ${error.message}`);
      setUploading(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.gpx')) {
        alert("Please select a GPX file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert("Please select a GPX file");
      return;
    }

    if (!formData.title || !formData.location) {
      alert("Please fill in all required fields");
      return;
    }

    setUploading(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        // For now, we'll store the file content directly
        // In production, you'd upload to S3 or similar
        const fileUrl = base64;

        await createGpxMutation.mutateAsync({
          title: formData.title,
          description: formData.description || undefined,
          location: formData.location,
          state: formData.state || undefined,
          fileUrl: fileUrl,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload GPX File</h1>
          <p className="text-gray-600 mb-6">
            Share your trail with the community! Upload a GPX file with details so others can discover and download it.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPX File *
              </label>
              <input
                type="file"
                accept=".gpx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-orange-50 file:text-orange-700
                  hover:file:bg-orange-100
                  cursor-pointer"
                required
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Moab Hell's Revenge Trail"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Moab, Utah"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., Utah"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the trail, difficulty, highlights, etc."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-orange-600 text-white py-3 rounded-md font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {uploading ? "Uploading..." : "Upload GPX"}
              </button>
              <button
                type="button"
                onClick={() => setLocation("/gpx-library")}
                className="px-6 py-3 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
