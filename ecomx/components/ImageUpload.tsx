'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { useUpload } from '@/hooks/useUpload';
import { UploadedImage } from '@/lib/api/upload.api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ImageUploadProps {
  // What kind of upload is this?
  type: 'product' | 'category' | 'avatar' | 'banner' | 'review';

  // Called when upload finishes — gives you the URLs to save
  onUpload: (images: UploadedImage[]) => void;

  // Already-uploaded images to show (editing existing product)
  existingImages?: string[];

  // Remove an existing image
  onRemoveExisting?: (url: string) => void;

  // Max files (overrides per-type default)
  maxFiles?: number;

  // Label shown above uploader
  label?: string;
}

// ─── Per-type config ─────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  product:  { max: 5,  label: 'Product Images',   hint: 'Up to 5 images • JPG, PNG, WebP • Max 5MB each' },
  category: { max: 1,  label: 'Category Image',   hint: '1 image • JPG, PNG, WebP • Max 2MB' },
  avatar:   { max: 1,  label: 'Profile Photo',    hint: '1 image • JPG, PNG, WebP • Max 2MB' },
  banner:   { max: 1,  label: 'Banner Image',     hint: '1 image • JPG, PNG, WebP • Max 10MB • Recommended: 1920×600px' },
  review:   { max: 3,  label: 'Review Photos',    hint: 'Up to 3 images • JPG, PNG, WebP • Max 5MB each' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ImageUpload({
  type,
  onUpload,
  existingImages = [],
  onRemoveExisting,
  maxFiles,
  label,
}: ImageUploadProps) {
  const config = TYPE_CONFIG[type];
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newImages,  setNewImages]  = useState<UploadedImage[]>([]);

  // ─── Upload hook ──────────────────────────────────────────────────────────
  const { isUploading, progress, uploadProductImages, uploadSingleImage, uploadReviewImages } =
    useUpload({
      onSuccess: (uploaded) => {
        setNewImages((prev) => [...prev, ...uploaded]);
        onUpload(uploaded);
      },
      maxFiles: maxFiles || config.max,
    });

  // ─── Handle files selected ────────────────────────────────────────────────
  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      if (type === 'product') {
        await uploadProductImages(files);
      } else if (type === 'review') {
        await uploadReviewImages(files);
      } else {
        const result = await uploadSingleImage(files[0], type as 'category' | 'avatar' | 'banner');
        if (result) {
          setNewImages([result]);
          onUpload([result]);
        }
      }
    },
    [type, uploadProductImages, uploadSingleImage, uploadReviewImages, onUpload]
  );

  // ─── Input change ─────────────────────────────────────────────────────────
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  // ─── Drag and drop ────────────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // ─── Remove newly uploaded image ──────────────────────────────────────────
  const removeNew = (publicId: string) => {
    setNewImages((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  const totalImages = existingImages.length + newImages.length;
  const maxAllowed = maxFiles || config.max;
  const canUploadMore = totalImages < maxAllowed;

  return (
    <div className="space-y-3">
      {/* Label */}
      <p className="text-sm font-medium text-gray-700">
        {label || config.label}
      </p>

      {/* Existing images */}
      {existingImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingImages.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
              <Image
                src={url}
                alt={`Image ${i + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Newly uploaded images */}
      {newImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {newImages.map((img) => (
            <div key={img.publicId} className="relative w-24 h-24 rounded-lg overflow-hidden border border-green-200 group">
              <Image
                src={img.url}
                alt="Uploaded"
                fill
                className="object-cover"
                sizes="96px"
              />
              <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full" />
              <button
                type="button"
                onClick={() => removeNew(img.publicId)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone — only show if can upload more */}
      {canUploadMore && (
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8
            flex flex-col items-center justify-center gap-3
            transition-all cursor-pointer
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
            }
            ${isUploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600 font-medium">Uploading...</p>
              {/* Progress bar */}
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                {isDragging
                  ? <ImageIcon className="w-6 h-6 text-blue-500" />
                  : <Upload className="w-6 h-6 text-gray-400" />
                }
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? 'Drop to upload' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">{config.hint}</p>
              </div>
            </>
          )}

          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple={maxAllowed > 1}
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      )}

      {/* Max reached message */}
      {!canUploadMore && (
        <p className="text-xs text-gray-400 text-center py-2">
          Maximum {maxAllowed} image{maxAllowed > 1 ? 's' : ''} reached
        </p>
      )}
    </div>
  );
}
