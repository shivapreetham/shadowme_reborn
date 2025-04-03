"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/app/hooks/use-toast";
import { X, Upload, Loader2 } from "lucide-react";

// Use the service key to avoid anon-key issues.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onRemove: (url: string) => void;
  disabled?: boolean;
  multiple?: boolean;
  bucket?: string;
  maxSize?: number; // in MB
}

const BaseImageUpload: React.FC<UploadProps> = ({
  value,
  onChange,
  onRemove,
  disabled = false,
  multiple = false,
  bucket = "product-images",
  maxSize = 5,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setUploadProgress(10);
      try {
        if (!file.type.startsWith("image/")) {
          throw new Error("Please select a valid image file");
        }
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File size must be less than ${maxSize}MB`);
        }
        setUploadProgress(30);
        const fileExtension = file.name.split(".").pop() || "jpg";
        const fileName = `upload-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExtension}`;
        setUploadProgress(50);
        const { error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error("Upload error:", error);
          throw error;
        }
        setUploadProgress(80);
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        const publicUrl = data.publicUrl;
        setUploadProgress(100);
        if (multiple) {
          if (Array.isArray(value)) {
            onChange([...value, publicUrl]);
          }
        } else {
          onChange(publicUrl);
        }
        toast({
          title: "Upload successful",
          description: "Image uploaded successfully.",
        });
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: err.message || "Something went wrong",
        });
      } finally {
        setIsLoading(false);
        setUploadProgress(0);
      }
    },
    [bucket, maxSize, onChange, multiple, value]
  );

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      if (multiple) {
        for (let i = 0; i < files.length; i++) {
          await handleUpload(files[i]);
        }
      } else {
        await handleUpload(files[0]);
      }
      event.target.value = "";
    },
    [handleUpload, multiple]
  );

  const handleButtonClick = useCallback(() => {
    const fileInput = document.getElementById(`fileUpload-${bucket}`) as HTMLInputElement;
    if (fileInput) fileInput.click();
  }, [bucket]);

  return (
    <div className="space-y-4">
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
      {((multiple && Array.isArray(value) && value.length > 0) ||
        (!multiple && typeof value === "string" && value)) && (
        <div className={multiple ? "grid gap-4 grid-cols-2 md:grid-cols-3" : ""}>
          {multiple ? (
            (value as string[]).map((url, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
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
                  alt={`Upload ${index}`}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ))
          ) : (
            typeof value === "string" &&
            value && (
              <div className="relative aspect-square rounded-md overflow-hidden border border-gray-200">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => onRemove(value as string)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Image
                  fill
                  src={value as string}
                  alt="Upload"
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

// Component for Main Image (single image)
export const MainImageUpload: React.FC<{
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}> = ({ value, onChange, onRemove, disabled = false }) => {
  return (
    <BaseImageUpload
      value={value || ""}
      onChange={onChange}
      onRemove={(url) => onRemove()}
      multiple={false}
      bucket="main-images"
      disabled={disabled}
    />
  );
};

// Component for Additional Images (multiple images)
export const AdditionalImagesUpload: React.FC<{
  value: string[];
  onChange: (urls: string[]) => void;
  onRemove: (url: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, onRemove, disabled = false }) => {
  return (
    <BaseImageUpload
      value={value}
      onChange={onChange}
      onRemove={onRemove}
      multiple={true}
      bucket="product-images"
      disabled={disabled}
    />
  );
};
// Component for Payment QR (single image)
export const PaymentQRUpload: React.FC<{
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}> = ({ value, onChange, onRemove, disabled = false }) => {
  return (
    <BaseImageUpload
      value={value || ""}
      onChange={onChange}
      onRemove={(url) => onRemove()}
      multiple={false}
      bucket="payment-qr"
      disabled={disabled}
    />
  );
};

export default BaseImageUpload;
