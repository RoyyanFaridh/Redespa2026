import Image from "next/image";

type Props = {
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
  className?: string;
  showSubtitle?: boolean;
};

export function BrandLogo({
  size = "md",
  variant = "light",
  className = "",
  showSubtitle = true,
}: Props) {
  const iconSizes = {
    sm: "h-7 w-7 rounded-lg",
    md: "h-9 w-9 rounded-xl",
    lg: "h-11 w-11 rounded-2xl",
  };

  const titleSizes = {
    sm: "text-xs font-bold tracking-tight",
    md: "text-sm font-bold tracking-tight",
    lg: "text-base font-bold tracking-tight",
  };

  const subtitleSizes = {
    sm: "text-[8px] leading-3",
    md: "text-[9px] leading-3.5",
    lg: "text-[10px] leading-4",
  };

  const isDark = variant === "dark";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Badge */}
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-[#287A50] shadow-xs ring-1 ring-white/10 ${iconSizes[size]}`}
      >
        <Image
          src="/icon.webp"
          alt="REDESPA Logo"
          width={44}
          height={44}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {/* Brand Text */}
      <div className="min-w-0">
        <span
          className={`block truncate ${titleSizes[size]} ${
            isDark ? "text-white" : "text-[#202824]"
          }`}
        >
          REDESPA
        </span>

        {showSubtitle && (
          <span
            className={`block truncate font-medium ${subtitleSizes[size]} ${
              isDark ? "text-[#8E9892]" : "text-[#78827C]"
            }`}
          >
            Rekap Data Jamaah Desa Pandak
          </span>
        )}
      </div>
    </div>
  );
}

export default BrandLogo;

