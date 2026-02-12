"use client";

import { useEffect, useState } from "react";
import type { WindowControlModel } from "../shared/types";
import { cn } from "../shared/utils";

type HoverControl = "close" | "minimize" | "stretch" | null;

interface WindowControlsProps {
  windowControl: WindowControlModel;
  onClose?: () => void;
  disableMinimize?: boolean;
  disableMaximize?: boolean;
}

export function WindowControls({
  windowControl,
  onClose,
  disableMinimize = false,
  disableMaximize = false,
}: WindowControlsProps) {
  const [almost, setAlmost] = useState<HoverControl>(null);

  useEffect(() => {
    if (!almost) {
      return;
    }

    const clear = () => setAlmost(null);
    window.addEventListener("mouseup", clear);
    return () => window.removeEventListener("mouseup", clear);
  }, [almost]);

  return (
    <div
      className={cn(
        "window-controls",
        "window-controls-3i0",
        windowControl.focused && "focused",
        almost && "almost",
      )}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        className={cn("close", almost === "close" && "almost")}
        onMouseDown={() => setAlmost("close")}
        onClick={onClose}
      >
        <svg width="7" height="7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1.182 5.99L5.99 1.182m0 4.95L1.182 1.323"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <button
        className={cn(
          "minimize",
          almost === "minimize" && "almost",
          disableMinimize && "disabled",
        )}
        onMouseDown={() => setAlmost("minimize")}
        onClick={() => windowControl.onMinimize?.()}
      >
        <svg width="6" height="1" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M.61.703h5.8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <button
        className={cn(
          "stretch",
          almost === "stretch" && "almost",
          disableMaximize && "disabled",
        )}
        onMouseDown={() => setAlmost("stretch")}
        onClick={() => {
          if (windowControl.fullScreen) {
            windowControl.onUnmaximize?.();
          } else {
            windowControl.onMaximize?.();
          }
        }}
      >
        <svg
          viewBox="0 0 13 13"
          xmlns="http://www.w3.org/2000/svg"
          fillRule="evenodd"
          clipRule="evenodd"
          strokeLinejoin="round"
          strokeMiterlimit="2"
        >
          <path d="M4.871 3.553L9.37 8.098V3.553H4.871zm3.134 5.769L3.506 4.777v4.545h4.499z" />
          <circle cx="6.438" cy="6.438" r="6.438" fill="none" />
        </svg>
      </button>
    </div>
  );
}
