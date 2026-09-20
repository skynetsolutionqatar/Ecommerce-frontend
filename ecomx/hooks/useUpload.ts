'use client';

import { uploadApi, UploadedImage } from '@/lib/api/upload.api';
import { getApiErrorMessage } from '@/lib/api/errors';
import { showError, showSuccess } from '@/lib/toast';
import { useState, useCallback } from 'react';

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
  const [progress, setProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const validateFiles = (files: File[]): string | null => {
    if (files.length === 0) {
      return 'No files selected';
    }

    if (files.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    for (const file of files) {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        return `"${file.name}" is too large. Maximum ${maxSizeMB}MB per file.`;
      }

      if (file.size === 0) {
        return `"${file.name}" is empty.`;
      }

      // Both MIME type and extension must match — either alone is trivially spoofed.
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const allowedExtensions = /\.(jpe?g|png|webp)$/i;
      if (!allowed.includes(file.type) || !allowedExtensions.test(file.name)) {
        return `"${file.name}" is not a valid image. Only JPG, PNG, WebP allowed.`;
      }
    }

    return null;
  };

  const uploadProductImages = useCallback(async (files: File[]) => {
    const error = validateFiles(files);
    if (error) {
      showError(error);
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
      showSuccess(`${images.length} image(s) uploaded`);
      return images;
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Upload failed');
      showError(msg);
      onError?.(msg);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [maxFiles, maxSizeMB, onSuccess, onError]);

  const uploadSingleImage = useCallback(async (
    file: File,
    type: 'category' | 'avatar' | 'banner'
  ) => {
    const error = validateFiles([file]);
    if (error) {
      showError(error);
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
      showSuccess('Image uploaded successfully');
      return result;
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Upload failed');
      showError(msg);
      onError?.(msg);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [onSuccess, onError]);

  const uploadReviewImages = useCallback(async (files: File[]) => {
    const error = validateFiles(files);
    if (error) {
      showError(error);
      return null;
    }

    setIsUploading(true);
    setProgress(30);

    try {
      const images = await uploadApi.reviewImages(files);
      setProgress(100);
      onSuccess?.(images);
      return images;
    } catch (err) {
      showError(err, 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [onSuccess]);

  const deleteImage = useCallback(async (publicId: string) => {
    try {
      await uploadApi.delete(publicId);
      setUploadedImages((prev) => prev.filter((img) => img.publicId !== publicId));
      showSuccess('Image deleted');
      return true;
    } catch (err) {
      showError(err, 'Failed to delete image');
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
