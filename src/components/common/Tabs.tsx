"use client";
import React, { useState, type ReactNode } from "react";

export interface TabItem {
  key: string;
  label: string;
  panel: ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  selectedKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export function Tabs({ items, selectedKey, onChange, className = "" }: TabsProps) {
  const [internal, setInternal] = useState(items[0]?.key ?? "");
  const isControlled = selectedKey !== undefined;
  const active = isControlled ? selectedKey! : internal;

  function select(key: string) {
    if (!isControlled) setInternal(key);
    onChange?.(key);
  }

  const activePanel = items.find((i) => i.key === active)?.panel ?? items[0]?.panel;

  return (
    <div className="flex flex-col">
      <div
        role="tablist"
        className={`flex overflow-x-auto border-b border-[#E5EAE6] ${className}`}
      >
        {items.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={tab.key === active}
            onClick={() => select(tab.key)}
            className={[
              "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-[11px] font-medium transition-colors duration-150 focus:outline-none",
              tab.key === active
                ? "border-[#287A50] text-[#287A50]"
                : "border-transparent text-[#78827C] hover:text-[#202824]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] font-bold ${
                  tab.key === active
                    ? "bg-[#287A50] text-white"
                    : "bg-[#E5EAE6] text-[#78827C]"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-4">
        {activePanel}
      </div>
    </div>
  );
}

export default Tabs;
