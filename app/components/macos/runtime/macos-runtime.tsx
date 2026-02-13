"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  FinderFileItem,
  FinderWindow,
  MacOSWindowsLayer,
  ProcessLauncher,
  ReminderList,
  ReminderWindow,
  WindowControls,
} from "..";
import Dock, { DEFAULT_DOCK_ITEMS, type DockItem } from "../dock/Dock";
import { cn } from "../shared/utils";
import type { MacOSWindowProps } from "../window/window-shell";
import macosWallpaper from "../../../assets/images/macos-wallpaper.jpg";
import finderFolderIcon from "../../../assets/images/finder-folder-icon.webp";
import calculatorIcon from "../../../assets/images/calculator-icon.webp";
import quicktimeIcon from "../../../assets/images/quicktime-icon.webp";
import nesFileIcon from "../../../assets/images/nes-file-icon.ico";

const ASSETS = {
  wallpaper: macosWallpaper.src,
  folder: finderFolderIcon.src,
  finder: finderFolderIcon.src,
  calculator: calculatorIcon.src,
  quicktime: quicktimeIcon.src,
  nes: nesFileIcon.src,
} as const;

type AppKey = "finder" | "calculator" | "reminders";
type HeaderMenuKey = "file" | "view" | "go" | "window";

type WindowAnimation =
  | {
      type: "opening";
      phase: "from" | "to";
      origin: { x: number; y: number };
    }
  | {
      type: "minimizing";
      origin: { x: number; y: number };
    }
  | {
      type: "closing";
    };

const OPEN_ANIMATION_MS = 420;
const MINIMIZE_ANIMATION_MS = 520;
const CLOSE_ANIMATION_MS = 240;

const INITIAL_REMINDER_LISTS: ReminderList[] = [
  {
    id: "today",
    name: "Today",
    color: "#007aff",
    tasks: [
      {
        id: "r-1",
        text: "Call Mom",
        checked: false,
        section: "Morning",
        notes: "work",
        duePrefix: "work –",
        dueTime: "9:00 AM",
        scheduled: true,
      },
      {
        id: "r-2",
        text: "Clean the garage",
        checked: false,
        section: "Afternoon",
        notes: "Sweep the floor\nClear out garbage\nStack boxes",
        dueLabel: "Family – 3:00 PM   ↗ Arriving: Roman's Work",
        scheduled: true,
      },
      {
        id: "r-3",
        text: "Feed Doc",
        checked: false,
        section: "Tonight",
        duePrefix: "work –",
        dueTime: "6:00 PM",
        scheduled: true,
      },
    ],
  },
  {
    id: "work",
    name: "work",
    color: "#ff9f0a",
    tasks: [
      { id: "r-4", text: "Review PR queue", checked: false, section: "Anytime" },
      { id: "r-5", text: "Draft status report", checked: false, section: "Anytime" },
      { id: "r-6", text: "Prepare roadmap notes", checked: false, section: "Anytime" },
    ],
  },
  {
    id: "family",
    name: "Family",
    color: "#34c759",
    tasks: [{ id: "r-7", text: "Buy groceries", checked: false, section: "Anytime" }],
  },
];

interface RuntimeWindow {
  id: string;
  app: AppKey;
  minimized: boolean;
  fullScreen: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  animation?: WindowAnimation;
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

function createReminderWindow(id: string): RuntimeWindow {
  return {
    id,
    app: "reminders",
    minimized: false,
    fullScreen: false,
    x: 190,
    y: 104,
    width: 980,
    height: 640,
  };
}

function getAnimatedWindowStyle(windowItem: RuntimeWindow): CSSProperties | undefined {
  if (!windowItem.animation || windowItem.fullScreen) {
    return undefined;
  }

  const centerX = windowItem.x + windowItem.width / 2;
  const centerY = windowItem.y + windowItem.height / 2;

  if (windowItem.animation.type === "opening") {
    const dx = windowItem.animation.origin.x - centerX;
    const dy = windowItem.animation.origin.y - centerY;

    if (windowItem.animation.phase === "from") {
      return {
        transform: `perspective(960px) translate3d(${dx}px, ${dy}px, 0) scale(0.14, 0.22) skewX(-10deg) rotateX(-28deg)`,
        opacity: 0.15,
        transformOrigin: "center 72%",
        filter: "blur(0.6px)",
        transition: "none",
        pointerEvents: "none",
      };
    }

    return {
      transform: "perspective(960px) translate3d(0, 0, 0) scale(1) skewX(0deg) rotateX(0deg)",
      opacity: 1,
      transformOrigin: "center 72%",
      filter: "blur(0px)",
      transition: `transform ${OPEN_ANIMATION_MS}ms cubic-bezier(0.16, 0.92, 0.2, 1), opacity ${OPEN_ANIMATION_MS}ms ease-out, filter ${OPEN_ANIMATION_MS}ms ease-out`,
      pointerEvents: "auto",
    };
  }

  if (windowItem.animation.type === "minimizing") {
    const dx = windowItem.animation.origin.x - centerX;
    const dy = windowItem.animation.origin.y - centerY;

    return {
      transform: `perspective(960px) translate3d(${dx}px, ${dy}px, 0) scale(0.12, 0.2) skewX(10deg) rotateX(-24deg)`,
      opacity: 0,
      transformOrigin: "center 72%",
      filter: "blur(0.7px)",
      transition: `transform ${MINIMIZE_ANIMATION_MS}ms cubic-bezier(0.22, 0.72, 0.2, 1), opacity ${Math.round(MINIMIZE_ANIMATION_MS * 0.85)}ms ease-out, filter ${Math.round(MINIMIZE_ANIMATION_MS * 0.7)}ms ease-out`,
      pointerEvents: "none",
    };
  }

  return {
    transform: "perspective(960px) scale(0.78) skewX(3deg) rotateX(-14deg)",
    opacity: 0,
    transformOrigin: "center 72%",
    filter: "blur(0.5px)",
    transition: `transform ${CLOSE_ANIMATION_MS}ms cubic-bezier(0.3, 0.74, 0.2, 1), opacity ${CLOSE_ANIMATION_MS}ms ease-out, filter ${Math.round(CLOSE_ANIMATION_MS * 0.75)}ms ease-out`,
    pointerEvents: "none",
  };
}

export default function MacOSRuntime() {
  const idRef = useRef(2);
  const animationTimeoutsRef = useRef<Record<string, number>>({});
  const animationFramesRef = useRef<Record<string, number>>({});
  const [windows, setWindows] = useState<RuntimeWindow[]>([
    createFinderWindow("finder-1"),
  ]);
  const [finderHistory, setFinderHistory] = useState<string[][]>([["User", "Desktop"]]);
  const [finderHistoryIndex, setFinderHistoryIndex] = useState(0);
  const [finderSelection, setFinderSelection] = useState<string[]>([]);
  const [reminderLists, setReminderLists] = useState<ReminderList[]>(INITIAL_REMINDER_LISTS);
  const [activeReminderListId, setActiveReminderListId] = useState(INITIAL_REMINDER_LISTS[0].id);
  const [reminderDraftTitle, setReminderDraftTitle] = useState("");
  const [dragState, setDragState] = useState<{
    windowId: string;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [finderSidebarVisible, setFinderSidebarVisible] = useState(true);
  const [activeHeaderMenu, setActiveHeaderMenu] = useState<HeaderMenuKey | null>(null);
  const reminderTaskIdRef = useRef(100);

  const clearScheduledAnimationHandles = useCallback((windowId: string) => {
    const timeoutId = animationTimeoutsRef.current[windowId];
    if (timeoutId != null) {
      window.clearTimeout(timeoutId);
      delete animationTimeoutsRef.current[windowId];
    }

    const frameId = animationFramesRef.current[windowId];
    if (frameId != null) {
      window.cancelAnimationFrame(frameId);
      delete animationFramesRef.current[windowId];
    }
  }, []);

  const scheduleAnimationEnd = useCallback(
    (windowId: string, durationMs: number, onEnd: () => void) => {
      const timeoutId = window.setTimeout(() => {
        delete animationTimeoutsRef.current[windowId];
        onEnd();
      }, durationMs);
      animationTimeoutsRef.current[windowId] = timeoutId;
    },
    [],
  );

  useEffect(
    () => () => {
      Object.values(animationTimeoutsRef.current).forEach((id) => window.clearTimeout(id));
      Object.values(animationFramesRef.current).forEach((id) => window.cancelAnimationFrame(id));
      animationTimeoutsRef.current = {};
      animationFramesRef.current = {};
    },
    [],
  );

  const finderPath = finderHistory[finderHistoryIndex] ?? ["User", "Desktop"];
  const finderFiles = useMemo(() => getFilesAtPath(finderPath), [finderPath]);
  const getDockItemCenter = useCallback((app: AppKey) => {
    const item = document.querySelector<HTMLElement>(`[data-dock-item-key="${app}"]`);
    if (!item) {
      return null;
    }
    const rect = item.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

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
    clearScheduledAnimationHandles(windowId);
    setWindows((prev) => prev.filter((windowItem) => windowItem.id !== windowId));
  }, [clearScheduledAnimationHandles]);

  const openNewFinderWindow = useCallback(() => {
    const nextId = `finder-${idRef.current++}`;
    setWindows((prev) => [...prev, createFinderWindow(nextId)]);
  }, []);

  const scheduleOpenAnimationTo = useCallback(
    (windowId: string, origin: { x: number; y: number }) => {
      animationFramesRef.current[windowId] = window.requestAnimationFrame(() => {
        animationFramesRef.current[windowId] = window.requestAnimationFrame(() => {
          delete animationFramesRef.current[windowId];

          updateWindow(windowId, {
            animation: {
              type: "opening",
              phase: "to",
              origin,
            },
          });

          scheduleAnimationEnd(windowId, OPEN_ANIMATION_MS, () => {
            setWindows((prev) =>
              prev.map((windowItem) =>
                windowItem.id === windowId &&
                windowItem.animation?.type === "opening"
                  ? { ...windowItem, animation: undefined }
                  : windowItem,
              ),
            );
          });
        });
      });
    },
    [scheduleAnimationEnd, updateWindow],
  );

  const minimizeWindow = useCallback(
    (windowId: string) => {
      const windowItem = windows.find((entry) => entry.id === windowId);
      if (!windowItem) {
        return;
      }

      const origin = getDockItemCenter(windowItem.app);
      if (!origin) {
        updateWindow(windowId, { minimized: true, animation: undefined });
        return;
      }

      clearScheduledAnimationHandles(windowId);
      updateWindow(windowId, {
        animation: {
          type: "minimizing",
          origin,
        },
      });

      scheduleAnimationEnd(windowId, MINIMIZE_ANIMATION_MS, () => {
        setWindows((prev) =>
          prev.map((entry) =>
            entry.id === windowId
              ? { ...entry, minimized: true, animation: undefined }
              : entry,
          ),
        );
      });
    },
    [
      windows,
      clearScheduledAnimationHandles,
      getDockItemCenter,
      scheduleAnimationEnd,
      updateWindow,
    ],
  );

  const closeWindowAnimated = useCallback(
    (windowId: string) => {
      const windowItem = windows.find((entry) => entry.id === windowId);
      if (!windowItem) {
        return;
      }

      clearScheduledAnimationHandles(windowId);
      updateWindow(windowId, {
        animation: {
          type: "closing",
        },
      });

      scheduleAnimationEnd(windowId, CLOSE_ANIMATION_MS, () => {
        closeWindow(windowId);
      });
    },
    [windows, clearScheduledAnimationHandles, closeWindow, scheduleAnimationEnd, updateWindow],
  );

  const startDrag = useCallback(
    (windowId: string, event: React.MouseEvent<HTMLElement>) => {
      const windowItem = windows.find((entry) => entry.id === windowId);
      if (!windowItem || windowItem.fullScreen || windowItem.animation) {
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
      const app: AppKey =
        launcher.key === "finder"
          ? "finder"
          : launcher.key === "reminders"
            ? "reminders"
            : "calculator";
      const origin = getDockItemCenter(app);
      const existing = windows.find((windowItem) => windowItem.app === launcher.key);
      if (existing) {
        const shouldAnimate = Boolean(existing.minimized && origin);
        clearScheduledAnimationHandles(existing.id);

        setWindows((prev) => {
          const target = prev.find((windowItem) => windowItem.id === existing.id);
          if (!target) {
            return prev;
          }

          const updated: RuntimeWindow = {
            ...target,
            minimized: false,
            animation:
              shouldAnimate && origin
                ? {
                    type: "opening",
                    phase: "from",
                    origin,
                  }
                : undefined,
          };

          return [...prev.filter((windowItem) => windowItem.id !== existing.id), updated];
        });

        if (shouldAnimate && origin) {
          scheduleOpenAnimationTo(existing.id, origin);
        }

        return;
      }

      const nextId = `${launcher.key}-${idRef.current++}`;
      const baseWindow =
        app === "finder"
          ? createFinderWindow(nextId)
          : app === "reminders"
            ? createReminderWindow(nextId)
            : createCalculatorWindow(nextId);

      setWindows((prev) => [
        ...prev,
        origin
          ? {
              ...baseWindow,
              animation: {
                type: "opening",
                phase: "from",
                origin,
              },
            }
          : baseWindow,
      ]);

      if (origin) {
        clearScheduledAnimationHandles(nextId);
        scheduleOpenAnimationTo(nextId, origin);
      }
    },
    [windows, clearScheduledAnimationHandles, getDockItemCenter, scheduleOpenAnimationTo],
  );

  const dockItems = useMemo<DockItem[]>(
    () =>
      DEFAULT_DOCK_ITEMS.map((item) => {
        if (item.key !== "finder" && item.key !== "reminders") {
          return item;
        }

        const launcherKey = item.key === "finder" ? "finder" : "reminders";

        return {
          ...item,
          active: windows.some((windowItem) => windowItem.app === launcherKey),
          action: () =>
            openWindowForLauncher({
              key: launcherKey,
              icon: launcherKey === "finder" ? ASSETS.finder : item.icon,
            }),
        };
      }),
    [windows, openWindowForLauncher],
  );

  const topVisibleWindow = useMemo(
    () => [...windows].reverse().find((windowItem) => !windowItem.minimized) ?? null,
    [windows],
  );
  const activeMenuApp = topVisibleWindow?.app ?? null;
  const appMenuEnabled = activeMenuApp === "finder" || activeMenuApp === "reminders";
  const finderMenuEnabled = activeMenuApp === "finder";
  const remindersMenuEnabled = activeMenuApp === "reminders";
  const activeAppLabel =
    activeMenuApp === "reminders"
      ? "Reminders"
      : activeMenuApp === "calculator"
        ? "Calculator"
        : activeMenuApp === "finder"
          ? "Finder"
          : null;

  useEffect(() => {
    if (!appMenuEnabled) {
      setActiveHeaderMenu(null);
    }
  }, [appMenuEnabled]);

  useEffect(() => {
    if (!activeHeaderMenu) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      const menuRoot = document.querySelector(".left-menu-3na");
      if (menuRoot && target && menuRoot.contains(target)) {
        return;
      }
      setActiveHeaderMenu(null);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveHeaderMenu(null);
      }
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [activeHeaderMenu]);

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

  const closeHeaderMenu = useCallback(() => setActiveHeaderMenu(null), []);

  const toggleHeaderMenu = useCallback(
    (menuKey: HeaderMenuKey) => {
      if (!appMenuEnabled) {
        return;
      }
      setActiveHeaderMenu((prev) => (prev === menuKey ? null : menuKey));
    },
    [appMenuEnabled],
  );

  const hoverHeaderMenu = useCallback(
    (menuKey: HeaderMenuKey) => {
      if (!appMenuEnabled) {
        return;
      }
      setActiveHeaderMenu((prev) => (prev ? menuKey : prev));
    },
    [appMenuEnabled],
  );

  const handleNewFinderWindow = useCallback(() => {
    openNewFinderWindow();
    closeHeaderMenu();
  }, [openNewFinderWindow, closeHeaderMenu]);

  const handleNewFolder = useCallback(() => {
    closeHeaderMenu();
  }, [closeHeaderMenu]);

  const handleToggleFinderSidebar = useCallback(() => {
    setFinderSidebarVisible((prev) => !prev);
    closeHeaderMenu();
  }, [closeHeaderMenu]);

  const handleEnclosingFolder = useCallback(() => {
    if (finderPath.length <= 1) {
      return;
    }
    setFinderHistory((prev) => [...prev.slice(0, finderHistoryIndex + 1), finderPath.slice(0, -1)]);
    setFinderHistoryIndex((prev) => prev + 1);
    closeHeaderMenu();
  }, [finderHistoryIndex, finderPath, closeHeaderMenu]);

  const handleMinimizeFinderFromMenu = useCallback(() => {
    const target = [...windows].reverse().find(
      (windowItem) => windowItem.app === "finder" && !windowItem.minimized,
    );
    if (!target) {
      return;
    }
    minimizeWindow(target.id);
    closeHeaderMenu();
  }, [windows, minimizeWindow, closeHeaderMenu]);

  const activeReminderList = useMemo(
    () => reminderLists.find((list) => list.id === activeReminderListId) ?? reminderLists[0],
    [reminderLists, activeReminderListId],
  );

  const addReminderTask = useCallback(() => {
    const text = reminderDraftTitle.trim();
    if (!text) {
      return;
    }

    const nextId = `r-${reminderTaskIdRef.current++}`;
    setReminderLists((prev) =>
      prev.map((list) =>
        list.id === activeReminderListId
          ? {
              ...list,
              tasks: [
                ...list.tasks,
                {
                  id: nextId,
                  text,
                  checked: false,
                  section: "Anytime",
                },
              ],
            }
          : list,
      ),
    );
    setReminderDraftTitle("");
  }, [activeReminderListId, reminderDraftTitle]);

  const toggleReminderTask = useCallback(
    (taskId: string) => {
      setReminderLists((prev) =>
        prev.map((list) =>
          list.id === activeReminderListId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === taskId ? { ...task, checked: !task.checked } : task,
                ),
              }
            : list,
        ),
      );
    },
    [activeReminderListId],
  );

  const removeReminderTask = useCallback(
    (taskId: string) => {
      setReminderLists((prev) =>
        prev.map((list) =>
          list.id === activeReminderListId
            ? {
                ...list,
                tasks: list.tasks.filter((task) => task.id !== taskId),
              }
            : list,
        ),
      );
    },
    [activeReminderListId],
  );

  const handleNewReminderFromMenu = useCallback(() => {
    if (reminderLists.some((list) => list.id === "today")) {
      setActiveReminderListId("today");
    }
    setReminderDraftTitle("");
    window.requestAnimationFrame(() => {
      document.getElementById("reminder-draft-input")?.focus();
    });
    closeHeaderMenu();
  }, [reminderLists, closeHeaderMenu]);

  const handleCloseReminderFromMenu = useCallback(() => {
    const target = [...windows].reverse().find(
      (windowItem) => windowItem.app === "reminders" && !windowItem.minimized,
    );
    if (!target) {
      return;
    }
    closeWindowAnimated(target.id);
    closeHeaderMenu();
  }, [windows, closeWindowAnimated, closeHeaderMenu]);

  const handleMinimizeReminderFromMenu = useCallback(() => {
    const target = [...windows].reverse().find(
      (windowItem) => windowItem.app === "reminders" && !windowItem.minimized,
    );
    if (!target) {
      return;
    }
    minimizeWindow(target.id);
    closeHeaderMenu();
  }, [windows, minimizeWindow, closeHeaderMenu]);

  const windowsLayer = useMemo<MacOSWindowProps[]>(
    () =>
      windows
        .filter((windowItem) => !windowItem.minimized)
        .map((windowItem, index) => {
          const zIndex = index + 1;
          const isFocused = index === windows.length - 1;
          const animatedStyle = getAnimatedWindowStyle(windowItem);
          const isAnimating = windowItem.animation != null;

          const controlModel = {
            focused: isFocused,
            fullScreen: windowItem.fullScreen,
            onMinimize: () => minimizeWindow(windowItem.id),
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
                onClose={() => closeWindowAnimated(windowItem.id)}
                focused={isFocused}
                fullScreen={windowItem.fullScreen}
                showSidebar={finderSidebarVisible}
                windowControl={controlModel}
              />
            ) : null;

          const remindersContent =
            windowItem.app === "reminders" ? (
              <ReminderWindow
                lists={reminderLists}
                activeListId={activeReminderList.id}
                focused={isFocused}
                fullScreen={windowItem.fullScreen}
                draftTitle={reminderDraftTitle}
                onDraftChange={setReminderDraftTitle}
                onSelectList={setActiveReminderListId}
                onAddTask={addReminderTask}
                onToggleTask={toggleReminderTask}
                onRemoveTask={removeReminderTask}
                onClose={() => closeWindowAnimated(windowItem.id)}
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
                <WindowControls windowControl={controlModel} onClose={() => closeWindowAnimated(windowItem.id)} />
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
            inert: isAnimating,
            windowStyle: animatedStyle,
            onMouseDown: () => {
              if (!isAnimating) {
                bringToFront(windowItem.id);
              }
            },
            children: finderContent ?? remindersContent ?? calculatorContent,
          } satisfies MacOSWindowProps;
        }),
    [
      windows,
      finderNav,
      finderFiles,
      finderSelection,
      finderPath,
      finderSidebarVisible,
      reminderLists,
      activeReminderList,
      reminderDraftTitle,
      updateWindow,
      minimizeWindow,
      startDrag,
      closeWindowAnimated,
      bringToFront,
      addReminderTask,
      toggleReminderTask,
      removeReminderTask,
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
              <div className="system-btn">
                <button className="toggle" aria-label="Apple menu">
                  <svg
                    width="1.2em"
                    height="1.2em"
                    preserveAspectRatio="xMidYMid meet"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47c-1.34.03-1.77-.79-3.29-.79c-1.53 0-2 .77-3.27.82c-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51c1.28-.02 2.5.87 3.29.87c.78 0 2.26-1.07 3.81-.91c.65.03 2.47.26 3.64 1.98c-.09.06-2.17 1.28-2.15 3.81c.03 3.02 2.65 4.03 2.68 4.04c-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5c.13 1.17-.34 2.35-1.04 3.19c-.69.85-1.83 1.51-2.95 1.42c-.15-1.15.41-2.35 1.05-3.11z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
              {activeAppLabel ? (
                <div className="app-btn">
                  <button className={cn("toggle", !appMenuEnabled && "opacity-50")}>
                    {activeAppLabel}
                  </button>
                </div>
              ) : null}

              {finderMenuEnabled ? (
                <>
                  <div
                    className={cn("item-btn", activeHeaderMenu === "file" && "active")}
                    onMouseEnter={() => hoverHeaderMenu("file")}
                  >
                    <button
                      className={cn("toggle", !finderMenuEnabled && "opacity-50")}
                      disabled={!finderMenuEnabled}
                      onClick={() => toggleHeaderMenu("file")}
                    >
                      File
                    </button>
                    {activeHeaderMenu === "file" && finderMenuEnabled ? (
                      <div className="dropdown dropdown-1xg" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="item-group">
                          <div className="item" onClick={handleNewFinderWindow}>
                            <div className="text">New Finder Window</div>
                            <div className="shortcut">Opt+Cmd+N</div>
                          </div>
                          <div className="item" onClick={handleNewFolder}>
                            <div className="text">New Folder</div>
                            <div className="shortcut">Shift+Cmd+N</div>
                          </div>
                        </div>
                        <div className="separator" />
                        <div className="item-group">
                          <div className="item disabled">
                            <div className="text">Delete</div>
                            <div className="shortcut">Backspace</div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div
                    className={cn("item-btn", activeHeaderMenu === "view" && "active")}
                    onMouseEnter={() => hoverHeaderMenu("view")}
                  >
                    <button
                      className={cn("toggle", !finderMenuEnabled && "opacity-50")}
                      disabled={!finderMenuEnabled}
                      onClick={() => toggleHeaderMenu("view")}
                    >
                      View
                    </button>
                    {activeHeaderMenu === "view" && finderMenuEnabled ? (
                      <div className="dropdown dropdown-1xg" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="item-group">
                          <div className="item" onClick={handleToggleFinderSidebar}>
                            <div className="text">{finderSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}</div>
                            <div className="shortcut">Ctrl+Cmd+S</div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div
                    className={cn("item-btn", activeHeaderMenu === "go" && "active")}
                    onMouseEnter={() => hoverHeaderMenu("go")}
                  >
                    <button
                      className={cn("toggle", !finderMenuEnabled && "opacity-50")}
                      disabled={!finderMenuEnabled}
                      onClick={() => toggleHeaderMenu("go")}
                    >
                      Go
                    </button>
                    {activeHeaderMenu === "go" && finderMenuEnabled ? (
                      <div className="dropdown dropdown-1xg" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="item-group">
                          <div
                            className={cn("item", finderPath.length <= 1 && "disabled")}
                            onClick={finderPath.length > 1 ? handleEnclosingFolder : undefined}
                          >
                            <div className="text">Enclosing Folder</div>
                            <div className="shortcut">Opt+Up</div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div
                    className={cn("item-btn", activeHeaderMenu === "window" && "active")}
                    onMouseEnter={() => hoverHeaderMenu("window")}
                  >
                    <button
                      className={cn("toggle", !finderMenuEnabled && "opacity-50")}
                      disabled={!finderMenuEnabled}
                      onClick={() => toggleHeaderMenu("window")}
                    >
                      Window
                    </button>
                    {activeHeaderMenu === "window" && finderMenuEnabled ? (
                      <div className="dropdown dropdown-1xg" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="item-group">
                          <div className="item" onClick={handleMinimizeFinderFromMenu}>
                            <div className="text">Minimize</div>
                            <div className="shortcut">Cmd+M</div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}

              {remindersMenuEnabled ? (
                <>
                  <div
                    className={cn("item-btn", activeHeaderMenu === "file" && "active")}
                    onMouseEnter={() => hoverHeaderMenu("file")}
                  >
                    <button
                      className={cn("toggle", !remindersMenuEnabled && "opacity-50")}
                      disabled={!remindersMenuEnabled}
                      onClick={() => toggleHeaderMenu("file")}
                    >
                      File
                    </button>
                    {activeHeaderMenu === "file" && remindersMenuEnabled ? (
                      <div className="dropdown dropdown-1xg" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="item-group">
                          <div className="item" onClick={handleNewReminderFromMenu}>
                            <div className="text">New Reminder</div>
                            <div className="shortcut">Cmd+N</div>
                          </div>
                        </div>
                        <div className="separator" />
                        <div className="item-group">
                          <div className="item" onClick={handleCloseReminderFromMenu}>
                            <div className="text">Close</div>
                            <div className="shortcut">Cmd+W</div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div
                    className={cn("item-btn", activeHeaderMenu === "window" && "active")}
                    onMouseEnter={() => hoverHeaderMenu("window")}
                  >
                    <button
                      className={cn("toggle", !remindersMenuEnabled && "opacity-50")}
                      disabled={!remindersMenuEnabled}
                      onClick={() => toggleHeaderMenu("window")}
                    >
                      Window
                    </button>
                    {activeHeaderMenu === "window" && remindersMenuEnabled ? (
                      <div className="dropdown dropdown-1xg" onMouseDown={(event) => event.stopPropagation()}>
                        <div className="item-group">
                          <div className="item" onClick={handleMinimizeReminderFromMenu}>
                            <div className="text">Minimise</div>
                            <div className="shortcut">Cmd+M</div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
            <div className="spacer" />
            <div className="right" />
          </div>
        </div>

        <MacOSWindowsLayer windows={windowsLayer} />
        <Dock items={dockItems} zIndex={200} />
      </div>
    </main>
  );
}
