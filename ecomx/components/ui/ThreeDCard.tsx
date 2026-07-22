"use client";

import { motion } from "framer-motion";
import { useState, type MouseEvent, type ReactNode } from "react";

interface ThreeDCardProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  onClick?: () => void;
}

export default function ThreeDCard({
  children,
  className = "",
  innerClassName = "",
  onClick,
}: ThreeDCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    setRotateX(((y - centerY) / centerY) * 14);
    setRotateY(((centerX - x) / centerX) * 14);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className={`group relative w-full ${className}`}>
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0 opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100" />
      <div className="absolute -inset-1 rotate-180 rounded-2xl bg-gradient-to-r from-primary-light/0 via-primary-light/35 to-primary-light/0 opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100" />

      <div className="absolute -inset-1 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="h-full w-full rounded-2xl bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.85)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] bg-[0%_0%] transition-all duration-500 group-hover:bg-[100%_100%]" />
      </div>

      <motion.div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={`relative w-full rounded-2xl border border-border/80 bg-white shadow-[0_8px_32px_rgba(17,24,39,0.08)] ${onClick ? "cursor-pointer" : ""} ${innerClassName}`}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.2s ease-out",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </motion.div>
    </div>
  );
}
