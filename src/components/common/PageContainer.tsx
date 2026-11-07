import React, { type ReactNode } from "react";

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "5xl" | "6xl" | "7xl" | "full";
}

const MAX_WIDTH_STYLES = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export function PageContainer({
  children,
  className = "",
  maxWidth = "7xl",
}: PageContainerProps) {
  return (
    <main className="min-h-screen bg-[#F5F7F5]">
      <div
        className={[
          "mx-auto flex w-full flex-col gap-4 p-4 sm:p-6 md:p-8",
          MAX_WIDTH_STYLES[maxWidth],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </main>
  );
}

export default PageContainer;

