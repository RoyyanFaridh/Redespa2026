import React, { type ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}

export function Card({
  children,
  className = "",
  bordered = true,
}: CardProps) {
  return (
    <div
      className={[
        "overflow-hidden rounded-2xl bg-white shadow-xs",
        bordered ? "border border-[#E5EAE6]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-between border-b border-[#E5EAE6] px-4 py-3 sm:px-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["p-4 sm:p-5", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-between border-t border-[#E5EAE6] bg-[#F5F7F5] px-4 py-3 sm:px-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export default Card;

