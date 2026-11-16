import React from "react";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZE_STYLES = {
  xs: "h-6 w-6 text-[8px]",
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-[11px]",
  lg: "h-12 w-12 text-sm",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getColor(name: string) {
  const colors = [
    "bg-teal-100 text-teal-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const sizeClass = SIZE_STYLES[size];
  const colorClass = getColor(name);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-label={name}
      className={[
        sizeClass,
        colorClass,
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {getInitials(name)}
    </span>
  );
}

export default Avatar;
