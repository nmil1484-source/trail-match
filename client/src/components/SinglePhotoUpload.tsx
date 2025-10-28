import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Upload, X, Loader2, User, Car } from "lucide-react";

interface SinglePhotoUploadProps {
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
  type?: "profile" | "vehicle";
}

export function SinglePhotoUpload({ photo, onPhotoChange, type = "profile" }: SinglePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const uploadMutation = trpc.upload.photo.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum 5MB.");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setUploading(true);

    try {
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

      onPhotoChange(result.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removePhoto = () => {
    onPhotoChange(null);
  };

  const Icon = type === "profile" ? User : Car;

  return (
    <div className="space-y-4">
      {photo ? (
        <div className="relative group w-32 h-32">
          <img
            src={photo}
            alt={type === "profile" ? "Profile photo" : "Vehicle photo"}
            className="w-full h-full object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={removePhoto}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id={`single-photo-upload-${type}`}
        />
        <label htmlFor={`single-photo-upload-${type}`}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
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
                  {photo ? "Change Photo" : "Upload Photo"}
                </>
              )}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}

