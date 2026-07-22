"use client";
import { getAvatarBgClass, getInitials } from "@/lib/avatars";

interface AvatarProps {
  name: string;
  size?: number;
  imageUrl?: string;
  className?: string;
}

const SIZE_CLASS: Record<number, string> = {
  36: "h-9 w-9 text-[13px]",
  40: "h-10 w-10 text-sm",
  64: "h-16 w-16 text-[23px]",
  72: "h-[72px] w-[72px] text-[26px]",
  80: "h-20 w-20 text-[29px]",
};

export default function Avatar({ name, size = 36, imageUrl, className = "" }: AvatarProps) {
  const bgClass = getAvatarBgClass(name);
  const fontSize = Math.max(10, Math.round(size * 0.36));
  const sizeClass = SIZE_CLASS[size] ?? `h-[${size}px] w-[${size}px] text-[${fontSize}px]`;
  const baseClass = `shrink-0 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] ${className}`;

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className={`object-cover ${baseClass} ${sizeClass}`}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`flex items-center justify-center font-label font-bold tracking-wide text-white ${baseClass} ${sizeClass} ${bgClass}`}
    >
      {getInitials(name)}
    </div>
  );
}
