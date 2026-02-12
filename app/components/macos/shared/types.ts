import type { HTMLAttributes } from "react";

export interface WindowControlModel {
  focused?: boolean;
  fullScreen?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onUnmaximize?: () => void;
  draggingProps?: HTMLAttributes<HTMLElement>;
}

export interface FinderLocation {
  path: string[];
}

export interface FinderNavModel {
  value: FinderLocation;
  hasPrevHistory?: boolean;
  hasNextHistory?: boolean;
  goBack?: () => void;
  goNext?: () => void;
  push?: (location: FinderLocation) => void;
}

export interface FinderFileItem {
  id?: string;
  name: string;
  isDirectory?: boolean;
  kind?: string;
  modifiedAt?: Date | string;
  sizeBytes?: number;
  thumbnailSrc?: string;
}

export interface DockLauncher {
  key: string;
  icon: string;
  onClick: () => void;
  active?: boolean;
}

export interface DockWindowKey {
  processId: string | number;
  windowId?: string | number;
  modalId?: string | number;
}

export interface DockMinimizedWindow {
  key: string;
  icon: string;
  wk: DockWindowKey;
  onClick: () => void;
}

export interface DockGroup {
  key: string;
  launchers?: DockLauncher[];
  minimizedWindows?: DockMinimizedWindow[];
}

export interface ProcessLauncher {
  key: string;
  icon: string;
}

export interface RunningProcess {
  id: string | number;
  launcher: ProcessLauncher;
}
