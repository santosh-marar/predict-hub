import { Button } from "@repo/ui/components/button";
import { ImageIcon, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImageSelectorProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  existingImageUrl?: string;
  disabled?: boolean;
}

export function ImageSelector({
  selectedFile,
  onFileSelect,
  existingImageUrl,
  disabled = false,
}: ImageSelectorProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingImageUrl || null,
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      // Validate file
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onFileSelect(file);
    }
  };

  const removeImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onFileSelect(null);

    // Reset file input
    const input = document.getElementById("image-upload") as HTMLInputElement;
    if (input) input.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => document.getElementById("image-upload")?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {selectedFile ? "Change Image" : "Select Image"}
        </Button>

        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        {(previewUrl || selectedFile) && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={removeImage}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {previewUrl ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {selectedFile ? "Selected:" : "Current:"}{" "}
            {selectedFile?.name || "Existing image"}
          </p>
          <div className="relative w-32 h-32 rounded-md overflow-hidden border">
            <img
              src={previewUrl}
              alt="Category preview"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      ) : (
        <div className="w-32 h-32 rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
      </p>
    </div>
  );
}
