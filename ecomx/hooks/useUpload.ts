'use client';

import { uploadApi, UploadedImage } from '@/lib/api/upload.api';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';


interface UseUploadOptions {
  onSuccess?: (images: UploadedImage[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function useUpload(options: UseUploadOptions = {}) {
  const {
    onSuccess,
    onError,
    maxFiles = 5,
    maxSizeMB = 5,
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  // ─── Validate files before uploading ─────────────────────────────────────
  const validateFiles = (files: File[]): string | null => {
    if (files.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    for (const file of files) {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        return `"${file.name}" is too large. Maximum ${maxSizeMB}MB per file.`;
      }

      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        return `"${file.name}" is not a valid image. Only JPG, PNG, WebP allowed.`;
      }
    }

    return null;
  };

  // ─── Upload product images ────────────────────────────────────────────────
  const uploadProductImages = useCallback(async (files: File[]) => {
    const error = validateFiles(files);
    if (error) {
      toast.error(error);
      onError?.(error);
      return null;
    }

    setIsUploading(true);
    setProgress(10);

    try {
      setProgress(40);
      const images = await uploadApi.productImages(files);
      setProgress(100);
      setUploadedImages((prev) => [...prev, ...images]);
      onSuccess?.(images);
      toast.success(`${images.length} image(s) uploaded`);
      return images;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Upload failed';
      toast.error(msg);
      onError?.(msg);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [maxFiles, maxSizeMB, onSuccess, onError]);

  // ─── Upload single image (category, avatar, banner) ────────────────────────
  const uploadSingleImage = useCallback(async (
    file: File,
    type: 'category' | 'avatar' | 'banner'
  ) => {
    const error = validateFiles([file]);
    if (error) {
      toast.error(error);
      onError?.(error);
      return null;
    }

    setIsUploading(true);
    setProgress(10);

    try {
      setProgress(40);

      let result: UploadedImage;
      if (type === 'category') result = await uploadApi.categoryImage(file);
      else if (type === 'avatar') result = await uploadApi.avatar(file);
      else result = await uploadApi.banner(file);

      setProgress(100);
      onSuccess?.([result]);
      toast.success('Image uploaded successfully');
      return result;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Upload failed';
      toast.error(msg);
      onError?.(msg);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [onSuccess, onError]);

  // ─── Upload review images ─────────────────────────────────────────────────
  const uploadReviewImages = useCallback(async (files: File[]) => {
    const error = validateFiles(files);
    if (error) {
      toast.error(error);
      return null;
    }

    setIsUploading(true);
    setProgress(30);

    try {
      const images = await uploadApi.reviewImages(files);
      setProgress(100);
      onSuccess?.(images);
      return images;
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Upload failed';
      toast.error(msg);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [onSuccess]);

  // ─── Delete image ─────────────────────────────────────────────────────────
  const deleteImage = useCallback(async (publicId: string) => {
    try {
      await uploadApi.delete(publicId);
      setUploadedImages((prev) => prev.filter((img) => img.publicId !== publicId));
      toast.success('Image deleted');
      return true;
    } catch {
      toast.error('Failed to delete image');
      return false;
    }
  }, []);

  return {
    isUploading,
    progress,
    uploadedImages,
    uploadProductImages,
    uploadSingleImage,
    uploadReviewImages,
    deleteImage,
  };
}