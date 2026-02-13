import type { CSSProperties, ReactNode } from "react";
import { cn } from "../shared/utils";

type WindowShadow = "big" | "normal" | "none" | "short";

export interface MacOSWindowProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  shadow?: WindowShadow;
  fullScreen?: boolean;
  inert?: boolean;
  hidden?: boolean;
  className?: string;
  windowStyle?: CSSProperties;
  children: ReactNode;
  onMouseDown?: () => void;
}

export function MacOSWindow({
  id,
  x,
  y,
  width,
  height,
  zIndex = 1,
  shadow = "normal",
  fullScreen = false,
  inert = false,
  hidden = false,
  className,
  windowStyle,
  children,
  onMouseDown,
}: MacOSWindowProps) {
  return (
    <div className="window-boundary" data-key={id} style={{ zIndex }}>
      <div
        className={cn(
          "window",
          `shadow-${shadow}`,
          fullScreen && "fullScreen",
          inert && "inert",
          className,
        )}
        style={{
          top: y,
          left: x,
          width,
          height,
          display: hidden ? "none" : undefined,
          ...windowStyle,
        }}
        onMouseDown={onMouseDown}
      >
        {children}
      </div>
    </div>
  );
}

export interface MacOSWindowsLayerProps {
  windows: MacOSWindowProps[];
}

export function MacOSWindowsLayer({ windows }: MacOSWindowsLayerProps) {
  return (
    <div className="windows windows-display-9zq">
      {windows.map((windowItem) => (
        <MacOSWindow key={windowItem.id} {...windowItem} />
      ))}
    </div>
  );
}
