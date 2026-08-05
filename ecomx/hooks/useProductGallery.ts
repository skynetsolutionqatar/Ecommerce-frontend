"use client";

import { useEffect, useState } from "react";

const THUMB_VISIBLE = 4;

export function useProductGallery(productId: string, imageCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    setThumbOffset(0);
  }, [productId]);

  const canScrollThumbsUp = thumbOffset > 0;
  const canScrollThumbsDown = thumbOffset + THUMB_VISIBLE < imageCount;

  const selectImage = (index: number) => {
    setActiveIndex(index);

    if (index < thumbOffset) {
      setThumbOffset(index);
      return;
    }

    if (index >= thumbOffset + THUMB_VISIBLE) {
      setThumbOffset(Math.max(0, index - THUMB_VISIBLE + 1));
    }
  };

  return {
    activeIndex,
    thumbOffset,
    thumbVisible: THUMB_VISIBLE,
    canScrollThumbsUp,
    canScrollThumbsDown,
    selectImage,
    scrollThumbsUp: () => setThumbOffset((offset) => Math.max(0, offset - 1)),
    scrollThumbsDown: () =>
      setThumbOffset((offset) => Math.min(imageCount - THUMB_VISIBLE, offset + 1)),
    showPreviousImage: () => selectImage(Math.max(0, activeIndex - 1)),
    showNextImage: () => selectImage(Math.min(imageCount - 1, activeIndex + 1)),
  };
}
