import React from "react";
import { STEPS } from "./types";

export interface StepIndicatorProps {
  currentStep: number;
  loading: boolean;
  onGoToStep: (step: number) => void;
}

export function StepIndicator({
  currentStep,
  loading,
  onGoToStep,
}: StepIndicatorProps) {
  return (
    <div className="shrink-0 border-b border-[#E5EAE6] px-4 py-3 sm:px-5">
      <div className="grid grid-cols-3 gap-2">
        {STEPS.map((step) => {
          const active = currentStep === step.number;
          const completed = currentStep > step.number;
          const canVisit = step.number < currentStep;

          return (
            <button
              key={step.number}
              type="button"
              onClick={() => {
                if (canVisit) onGoToStep(step.number);
              }}
              disabled={loading || !canVisit}
              aria-current={active ? "step" : undefined}
              className="min-w-0 text-left disabled:cursor-default"
            >
              <div
                className={`mb-2 h-1 rounded-full transition ${
                  completed || active ? "bg-[#287A50]" : "bg-[#E5EAE6]"
                }`}
              />

              <div className="flex min-w-0 items-start gap-1.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold ${
                    active || completed
                      ? "bg-[#287A50] text-white"
                      : "bg-[#F5F7F5] text-[#78827C]"
                  }`}
                >
                  {completed ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="h-3 w-3"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5 12 4 4L19 6"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </span>

                <span className="min-w-0">
                  <span
                    className={`block wrap-break-word text-[9px] font-semibold leading-4 ${
                      active ? "text-[#287A50]" : "text-[#78827C]"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="mt-0.5 hidden text-[8px] leading-3.5 text-[#9AA39D] sm:block">
                    {step.description}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;

