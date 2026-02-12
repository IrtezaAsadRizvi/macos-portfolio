"use client";

import { HTMLAttributes, useMemo, useState } from "react";
import { FinderFileItem, FinderNavModel, WindowControlModel } from "../shared/types";
import { FinderHeaderControls } from "./finder-header-controls";
import { FinderIconView } from "./finder-icon-view";
import { FinderListView } from "./finder-list-view";
import { FinderSidebar } from "./finder-sidebar";
import { WindowControls } from "../window/window-controls";
import { cn } from "../shared/utils";

interface FinderWindowProps {
  nav: FinderNavModel;
  files: FinderFileItem[];
  selected: string[];
  onSelectionChange: (selection: string[]) => void;
  onOpen: (file: FinderFileItem) => void;
  onClose?: () => void;
  focused?: boolean;
  fullScreen?: boolean;
  showSidebar?: boolean;
  initialSidebarWidth?: number;
  mode?: "list" | "icon";
  windowControl?: WindowControlModel;
}

export function FinderWindow({
  nav,
  files,
  selected,
  onSelectionChange,
  onOpen,
  onClose,
  focused = false,
  fullScreen = false,
  showSidebar = true,
  initialSidebarWidth = 214,
  mode = "list",
  windowControl,
}: FinderWindowProps) {
  const [leftWidth, setLeftWidth] = useState(initialSidebarWidth);
  const [dragState, setDragState] = useState<{ startX: number; startWidth: number } | null>(null);

  const activeControl = useMemo<WindowControlModel>(
    () => ({
      focused,
      fullScreen,
      ...windowControl,
    }),
    [focused, fullScreen, windowControl],
  );

  const beginResize: HTMLAttributes<HTMLDivElement>["onMouseDown"] = (event) => {
    event.preventDefault();
    setDragState({ startX: event.clientX, startWidth: leftWidth });
  };

  const endResize = () => setDragState(null);

  const resize: HTMLAttributes<HTMLDivElement>["onMouseMove"] = (event) => {
    if (!dragState) {
      return;
    }

    const next = Math.min(360, Math.max(150, dragState.startWidth + (event.clientX - dragState.startX)));
    setLeftWidth(next);
  };

  return (
    <div
      className={cn(
        "finder-window",
        "finder-window-7y0",
        focused && "focused",
        fullScreen && "fullScreen",
      )}
      onMouseMove={resize}
      onMouseUp={endResize}
      onMouseLeave={endResize}
    >
      {showSidebar ? (
        <div className="left" style={{ width: leftWidth }}>
          <div className="header" {...activeControl.draggingProps}>
            <WindowControls onClose={onClose} windowControl={activeControl} />
          </div>
          <div className="body">
            <FinderSidebar nav={nav} focused={focused} />
          </div>
        </div>
      ) : null}

      <div className={cn("right", showSidebar && "hasLeftPanel")}>
        <div className="body">
          {mode === "icon" ? (
            <FinderIconView
              files={files}
              focused={focused}
              selected={selected}
              onSelectionChange={onSelectionChange}
              onOpen={onOpen}
            />
          ) : (
            <FinderListView
              files={files}
              focused={focused}
              selected={selected}
              onSelectionChange={onSelectionChange}
              onOpen={onOpen}
              paddingTop={52}
            />
          )}
        </div>
        <div className="header" {...activeControl.draggingProps}>
          {!showSidebar ? (
            <div className="window-controls-wrapper">
              <WindowControls onClose={onClose} windowControl={activeControl} />
            </div>
          ) : null}
          <FinderHeaderControls nav={nav} />
        </div>
      </div>

      {showSidebar ? (
        <div className="resizer" style={{ left: leftWidth - 3 }} onMouseDown={beginResize} />
      ) : null}
    </div>
  );
}
