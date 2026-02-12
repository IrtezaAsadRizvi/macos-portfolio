"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FinderFileItem,
  FinderWindow,
  MacOSWindowsLayer,
  ProcessLauncher,
  WindowControls,
} from "..";
import Dock from "../dock/Dock";
import type { MacOSWindowProps } from "../window/window-shell";

const ASSETS = {
  wallpaper: "/macos-demo/40-6NYMWZ35.jpg",
  folder: "/macos-demo/folder-icon-1-P3AYSFP5.webp",
  finder: "/macos-demo/folder-icon-1-P3AYSFP5.webp",
  calculator: "/macos-demo/256-J24FBRVH.webp",
  quicktime: "/macos-demo/quicktime-FPM2YF42.webp",
  nes: "/macos-demo/nes-IO4X64P2.ico",
} as const;

type AppKey = "finder" | "calculator";

interface RuntimeWindow {
  id: string;
  app: AppKey;
  minimized: boolean;
  fullScreen: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

const MOCK_FS: Record<string, FinderFileItem[]> = {
  Applications: [
    {
      name: "Calculator.app",
      isDirectory: false,
      kind: "Application",
      modifiedAt: "2026-02-01",
      thumbnailSrc: ASSETS.calculator,
    },
    {
      name: "QuickTime.app",
      isDirectory: false,
      kind: "Application",
      modifiedAt: "2026-01-27",
      thumbnailSrc: ASSETS.quicktime,
    },
  ],
  "User/Desktop": [
    {
      name: "Projects",
      isDirectory: true,
      kind: "Folder",
      modifiedAt: "2026-02-10",
      thumbnailSrc: ASSETS.folder,
    },
    {
      name: "Sintel.mp4",
      isDirectory: false,
      kind: "MPEG-4 movie",
      modifiedAt: "2026-02-09",
      sizeBytes: 25_687_102,
      thumbnailSrc: ASSETS.quicktime,
    },
    {
      name: "mario.nes",
      isDirectory: false,
      kind: "NES ROM",
      modifiedAt: "2026-02-09",
      sizeBytes: 24_591,
      thumbnailSrc: ASSETS.nes,
    },
    {
      name: "tetris.nes",
      isDirectory: false,
      kind: "NES ROM",
      modifiedAt: "2026-02-09",
      sizeBytes: 32_112,
      thumbnailSrc: ASSETS.nes,
    },
  ],
  "User/Desktop/Projects": [
    {
      name: "portfolio-roadmap.md",
      isDirectory: false,
      kind: "Markdown Document",
      modifiedAt: "2026-02-11",
      sizeBytes: 12_840,
      thumbnailSrc: ASSETS.folder,
    },
    {
      name: "demo-assets",
      isDirectory: true,
      kind: "Folder",
      modifiedAt: "2026-02-12",
      thumbnailSrc: ASSETS.folder,
    },
  ],
  "User/Documents": [
    {
      name: "resume.pdf",
      isDirectory: false,
      kind: "PDF document",
      modifiedAt: "2026-02-05",
      sizeBytes: 426_021,
      thumbnailSrc: ASSETS.folder,
    },
    {
      name: "design-notes.txt",
      isDirectory: false,
      kind: "Text document",
      modifiedAt: "2026-02-11",
      sizeBytes: 18_432,
      thumbnailSrc: ASSETS.folder,
    },
  ],
  "User/Downloads": [
    {
      name: "release.zip",
      isDirectory: false,
      kind: "ZIP archive",
      modifiedAt: "2026-02-03",
      sizeBytes: 8_914_203,
      thumbnailSrc: ASSETS.folder,
    },
  ],
};

function getFilesAtPath(path: string[]): FinderFileItem[] {
  return MOCK_FS[path.join("/")] ?? [];
}

function createFinderWindow(id: string): RuntimeWindow {
  return {
    id,
    app: "finder",
    minimized: false,
    fullScreen: false,
    x: 120,
    y: 86,
    width: 900,
    height: 560,
  };
}

function createCalculatorWindow(id: string): RuntimeWindow {
  return {
    id,
    app: "calculator",
    minimized: false,
    fullScreen: false,
    x: 300,
    y: 180,
    width: 340,
    height: 460,
  };
}

export default function MacOSRuntime() {
  const idRef = useRef(2);
  const [windows, setWindows] = useState<RuntimeWindow[]>([
    createFinderWindow("finder-1"),
  ]);
  const [finderHistory, setFinderHistory] = useState<string[][]>([["User", "Desktop"]]);
  const [finderHistoryIndex, setFinderHistoryIndex] = useState(0);
  const [finderSelection, setFinderSelection] = useState<string[]>([]);
  const [dragState, setDragState] = useState<{
    windowId: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const finderPath = finderHistory[finderHistoryIndex] ?? ["User", "Desktop"];
  const finderFiles = useMemo(() => getFilesAtPath(finderPath), [finderPath]);

  useEffect(() => {
    setFinderSelection([]);
  }, [finderPath.join("/")]);

  const bringToFront = useCallback((windowId: string) => {
    setWindows((prev) => {
      const target = prev.find((windowItem) => windowItem.id === windowId);
      if (!target) {
        return prev;
      }
      return [...prev.filter((windowItem) => windowItem.id !== windowId), target];
    });
  }, []);

  const updateWindow = useCallback((windowId: string, patch: Partial<RuntimeWindow>) => {
    setWindows((prev) =>
      prev.map((windowItem) =>
        windowItem.id === windowId ? { ...windowItem, ...patch } : windowItem,
      ),
    );
  }, []);

  const closeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((windowItem) => windowItem.id !== windowId));
  }, []);

  const startDrag = useCallback(
    (windowId: string, event: React.MouseEvent<HTMLElement>) => {
      const windowItem = windows.find((entry) => entry.id === windowId);
      if (!windowItem || windowItem.fullScreen) {
        return;
      }

      bringToFront(windowId);
      setDragState({
        windowId,
        startX: event.clientX,
        startY: event.clientY,
        originX: windowItem.x,
        originY: windowItem.y,
      });
    },
    [windows, bringToFront],
  );

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const onMove = (event: MouseEvent) => {
      const dx = event.clientX - dragState.startX;
      const dy = event.clientY - dragState.startY;
      updateWindow(dragState.windowId, {
        x: dragState.originX + dx,
        y: Math.max(28, dragState.originY + dy),
      });
    };

    const onUp = () => setDragState(null);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragState, updateWindow]);

  const openWindowForLauncher = useCallback(
    (launcher: ProcessLauncher) => {
      const existing = windows.find((windowItem) => windowItem.app === launcher.key);
      if (existing) {
        updateWindow(existing.id, { minimized: false });
        bringToFront(existing.id);
        return;
      }

      const nextId = `${launcher.key}-${idRef.current++}`;
      setWindows((prev) => [
        ...prev,
        launcher.key === "finder"
          ? createFinderWindow(nextId)
          : createCalculatorWindow(nextId),
      ]);
    },
    [windows, updateWindow, bringToFront],
  );

  const finderNav = useMemo(
    () => ({
      value: { path: finderPath },
      hasPrevHistory: finderHistoryIndex > 0,
      hasNextHistory: finderHistoryIndex < finderHistory.length - 1,
      goBack: () => setFinderHistoryIndex((prev) => Math.max(0, prev - 1)),
      goNext: () =>
        setFinderHistoryIndex((prev) => Math.min(finderHistory.length - 1, prev + 1)),
      push: ({ path }: { path: string[] }) => {
        setFinderHistory((prev) => [...prev.slice(0, finderHistoryIndex + 1), path]);
        setFinderHistoryIndex((prev) => prev + 1);
      },
    }),
    [finderPath, finderHistory, finderHistoryIndex],
  );

  const windowsLayer = useMemo<MacOSWindowProps[]>(
    () =>
      windows
        .filter((windowItem) => !windowItem.minimized)
        .map((windowItem, index) => {
          const zIndex = index + 1;
          const isFocused = index === windows.length - 1;

          const controlModel = {
            focused: isFocused,
            fullScreen: windowItem.fullScreen,
            onMinimize: () => updateWindow(windowItem.id, { minimized: true }),
            onMaximize: () => updateWindow(windowItem.id, { fullScreen: true, x: 0, y: 0 }),
            onUnmaximize: () =>
              updateWindow(windowItem.id, {
                fullScreen: false,
                x: windowItem.app === "finder" ? 120 : 300,
                y: windowItem.app === "finder" ? 86 : 180,
              }),
            draggingProps: {
              onMouseDown: (event: React.MouseEvent<HTMLElement>) =>
                startDrag(windowItem.id, event),
            },
          };

          const finderContent =
            windowItem.app === "finder" ? (
              <FinderWindow
                nav={finderNav}
                files={finderFiles}
                selected={finderSelection}
                onSelectionChange={setFinderSelection}
                onOpen={(file) => {
                  if (file.isDirectory) {
                    finderNav.push?.({ path: [...finderPath, file.name] });
                  }
                }}
                onClose={() => closeWindow(windowItem.id)}
                focused={isFocused}
                fullScreen={windowItem.fullScreen}
                windowControl={controlModel}
              />
            ) : null;

          const calculatorContent =
            windowItem.app === "calculator" ? (
              <div
                className={windowItem.fullScreen ? "calculator-window calculator-window-7y0 fullScreen" : "calculator-window calculator-window-7y0"}
              >
                <div className="top" {...controlModel.draggingProps}>
                  <div className="wrapper">
                    <div className="label">42</div>
                  </div>
                </div>
                <div className="controls">
                  <table className="table controls-4z0" cellSpacing={1} cellPadding={0} style={{ ["--cell-count" as never]: 4 }}>
                    <tbody>
                      {[
                        ["AC", "+/-", "%", "÷"],
                        ["7", "8", "9", "×"],
                        ["4", "5", "6", "-"],
                        ["1", "2", "3", "+"],
                        ["0", ".", "=", "="],
                      ].map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={`${rowIndex}-${cellIndex}`}
                              className={cellIndex === 3 || (rowIndex === 4 && cellIndex >= 2) ? "orange" : rowIndex === 0 ? "dark" : "light"}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <WindowControls windowControl={controlModel} onClose={() => closeWindow(windowItem.id)} />
              </div>
            ) : null;

          return {
            id: windowItem.id,
            x: windowItem.fullScreen ? 0 : windowItem.x,
            y: windowItem.fullScreen ? 0 : windowItem.y,
            width: windowItem.fullScreen ? window.innerWidth : windowItem.width,
            height: windowItem.fullScreen ? window.innerHeight : windowItem.height,
            zIndex,
            fullScreen: windowItem.fullScreen,
            shadow: windowItem.fullScreen ? "none" : isFocused ? "big" : "normal",
            onMouseDown: () => bringToFront(windowItem.id),
            children: finderContent ?? calculatorContent,
          } satisfies MacOSWindowProps;
        }),
    [
      windows,
      finderNav,
      finderFiles,
      finderSelection,
      finderPath,
      updateWindow,
      startDrag,
      closeWindow,
      bringToFront,
    ],
  );

  return (
    <main className="relative m-0 h-screen w-screen overflow-hidden select-none">
      <noscript>You need to enable JavaScript to run this app.</noscript>

      <div className="screen screen-2cn">
        <div className="layer-48f">
          <div
            className="background background-047"
            style={{ backgroundImage: `url(${ASSETS.wallpaper})` }}
          />
          <div
            className="table-surface table-surface-0g8"
            style={{ top: 28, height: "calc(100% - 28px)" }}
            onClick={() => setFinderSelection([])}
          />
        </div>

        <div className="layer-48f" style={{ zIndex: 20 }}>
          <div className="header header-6ij" style={{ height: 28 }}>
            <div className="left-menu left-menu-3na">
              <div className="app-btn">
                <button className="toggle">Finder</button>
              </div>
            </div>
            <div className="spacer" />
            <div className="right" />
          </div>
        </div>

        <MacOSWindowsLayer windows={windowsLayer} />
        <Dock
          onOpenFinder={() =>
            openWindowForLauncher({
              key: "finder",
              icon: ASSETS.finder,
            })
          }
          zIndex={200}
        />
      </div>
    </main>
  );
}
