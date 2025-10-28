import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Upload, X, Loader2 } from "lucide-react";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const uploadMutation = trpc.upload.photo.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploading(true);
    const newPhotos: string[] = [];

    try {
      for (const file of files) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum 5MB per photo.`);
          continue;
        }

        // Check file type
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file.`);
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data:image/xxx;base64, prefix
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload to server
        const result = await uploadMutation.mutateAsync({
          file: base64,
          fileName: file.name,
          contentType: file.type,
        });

        newPhotos.push(result.url);
      }

      onPhotosChange([...photos, ...newPhotos]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload photos. Please try again.");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onPhotosChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || photos.length >= maxPhotos}
          className="hidden"
          id="photo-upload"
        />
        <label htmlFor="photo-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploading || photos.length >= maxPhotos}
            asChild
          >
            <span className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photos ({photos.length}/{maxPhotos})
                </>
              )}
            </span>
          </Button>
        </label>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

