import React, { useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/app/hooks/use-toast";
import { X, Upload, Loader2 } from "lucide-react";

// Initialize Supabase client from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface ImageUploadProps {
  value: string[];
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
  disabled?: boolean;
  multiple?: boolean;
  bucket?: string;
  maxSize?: number; // in MB
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  onRemove,
  disabled = false,
  multiple = false,
  bucket = "product-images",
  maxSize = 5, // Default max size 5MB
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setUploadProgress(10);

      try {
        // Validate file type and size
        if (!file.type.startsWith("image/")) {
          throw new Error("Please select a valid image file");
        }
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File size must be less than ${maxSize}MB`);
        }

        setUploadProgress(30);

        // Create a unique file path
        const fileExtension = file.name.split(".").pop() || "jpg";
        const fileName = `upload-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExtension}`;

        setUploadProgress(50);

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        setUploadProgress(80);

        // Retrieve the public URL for the uploaded image
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        const publicUrl = data.publicUrl;

        setUploadProgress(100);

        // Pass the URL back to the parent component
        onChange(publicUrl);

        toast({
          title: "Success",
          description: "Image uploaded successfully.",
        });
      } catch (error: any) {
        console.error("Upload failed:", error);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error.message || "Something went wrong",
        });
      } finally {
        setIsLoading(false);
        setUploadProgress(0);
      }
    },
    [bucket, maxSize, onChange]
  );

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      if (multiple) {
        // Process each file sequentially
        for (const file of Array.from(files)) {
          await handleUpload(file);
        }
      } else {
        await handleUpload(files[0]);
      }
      // Reset the input value to allow re-uploading the same file if needed
      event.target.value = "";
    },
    [handleUpload, multiple]
  );

  const handleButtonClick = useCallback(() => {
    const fileInput = document.getElementById(`fileUpload-${bucket}`) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }, [bucket]);

  return (
    <div className="space-y-4">
      {/* Upload button and progress */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg">
        {isLoading ? (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-gray-600">Uploading...</span>
            </div>
            <Progress value={uploadProgress} className="h-2 w-full" />
          </div>
        ) : (
          <div className="w-full">
            <Button
              type="button"
              variant="outline"
              disabled={disabled || isLoading}
              onClick={handleButtonClick}
              className="w-full h-24 flex flex-col gap-2"
            >
              <Upload className="h-6 w-6" />
              <span>{multiple ? "Upload Images" : "Upload Image"}</span>
              <p className="text-xs text-gray-500">
                Max {maxSize}MB. JPG, PNG, GIF accepted.
              </p>
            </Button>
            <input
              id={`fileUpload-${bucket}`}
              type="file"
              accept="image/*"
              multiple={multiple}
              disabled={disabled || isLoading}
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}
      </div>

      {/* Preview area */}
      {value.length > 0 && (
        <div
          className={cn(
            "grid gap-4",
            multiple ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
          )}
        >
          {value.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-md overflow-hidden border border-gray-200"
            >
              <div className="absolute top-2 right-2 z-10">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemove(url)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Image
                fill
                src={url}
                alt="Upload"
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
