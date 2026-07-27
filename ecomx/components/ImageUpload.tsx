'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { useUpload } from '@/hooks/useUpload';
import { UploadedImage } from '@/lib/api/upload.api';
import { sameImageUrl } from '@/lib/admin/product-form';

interface ImageUploadProps {
  type: 'product' | 'category' | 'avatar' | 'banner' | 'review';
  onUpload: (images: UploadedImage[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
  /** Remove a newly uploaded image — must sync back to the form */
  onRemoveUploaded?: (url: string) => void;
  maxFiles?: number;
  label?: string;
}

const TYPE_CONFIG = {
  product:  { max: 5,  label: 'Product Images',   hint: 'Up to 5 images • JPG, PNG, WebP • Max 5MB each' },
  category: { max: 1,  label: 'Category Image',   hint: '1 image • JPG, PNG, WebP • Max 2MB' },
  avatar:   { max: 1,  label: 'Profile Photo',    hint: '1 image • JPG, PNG, WebP • Max 2MB' },
  banner:   { max: 1,  label: 'Banner Image',     hint: '1 image • JPG, PNG, WebP • Max 10MB • Recommended: 1920×600px' },
  review:   { max: 3,  label: 'Review Photos',    hint: 'Up to 3 images • JPG, PNG, WebP • Max 5MB each' },
};

export default function ImageUpload({
  type,
  onUpload,
  existingImages = [],
  onRemoveExisting,
  onRemoveUploaded,
  maxFiles,
  label,
}: ImageUploadProps) {
  const config = TYPE_CONFIG[type];
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingImages, setPendingImages] = useState<UploadedImage[]>([]);

  // Drop pending previews once the parent form owns those URLs.
  useEffect(() => {
    setPendingImages((prev) =>
      prev.filter((img) => !existingImages.some((url) => sameImageUrl(url, img.url)))
    );
  }, [existingImages]);

  const { isUploading, progress, uploadProductImages, uploadSingleImage, uploadReviewImages } =
    useUpload({
      onSuccess: (uploaded) => {
        setPendingImages((prev) => [...prev, ...uploaded]);
        onUpload(uploaded);
      },
      maxFiles: maxFiles || config.max,
    });

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
          setPendingImages([result]);
          onUpload([result]);
        }
      }
    },
    [type, uploadProductImages, uploadSingleImage, uploadReviewImages, onUpload]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    e.target.value = '';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const removePending = (img: UploadedImage) => {
    setPendingImages((prev) => prev.filter((item) => item.publicId !== img.publicId));
    onRemoveUploaded?.(img.url);
  };

  const maxAllowed = maxFiles || config.max;
  const totalImages = existingImages.length + pendingImages.length;
  const canUploadMore = totalImages < maxAllowed;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">{label || config.label}</p>

      {existingImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingImages.map((url, i) => (
            <div key={`${url}-${i}`} className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200 group">
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" sizes="96px" unoptimized />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(url)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pendingImages.map((img) => (
            <div key={img.publicId} className="relative h-24 w-24 overflow-hidden rounded-lg border border-green-200 group">
              <Image src={img.url} alt="Uploaded" fill className="object-cover" sizes="96px" unoptimized />
              <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-green-500" />
              <button
                type="button"
                onClick={() => removePending(img)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {canUploadMore && (
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'}
            ${isUploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium text-gray-600">Uploading...</p>
              <div className="h-1.5 w-full max-w-xs rounded-full bg-gray-200">
                <div className="h-1.5 rounded-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                {isDragging ? <ImageIcon className="h-6 w-6 text-blue-500" /> : <Upload className="h-6 w-6 text-gray-400" />}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? 'Drop to upload' : 'Click to upload or drag & drop'}
                </p>
                <p className="mt-1 text-xs text-gray-400">{config.hint}</p>
              </div>
            </>
          )}

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

      {!canUploadMore && (
        <p className="py-2 text-center text-xs text-gray-400">
          Maximum {maxAllowed} image{maxAllowed > 1 ? 's' : ''} reached
        </p>
      )}
    </div>
  );
}
