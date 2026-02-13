"use client";

import { useState } from "react";
import { cn } from "../shared/utils";

export interface DockItem {
  key: string;
  name: string;
  icon: string;
  active?: boolean;
  isBin?: boolean;
  action?: () => void;
}

interface DockProps {
  items?: DockItem[];
  onOpenFinder?: () => void;
  onSelectItem?: (item: DockItem) => void;
  className?: string;
  zIndex?: number;
}

export const DEFAULT_DOCK_ITEMS: DockItem[] = [
  {
    key: "finder",
    name: "Finder",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853981255cc36b3a37af_finder.png",
    active: true,
  },
  {
    key: "siri",
    name: "Siri",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853ff3bafbac60495771_siri.png",
  },
  {
    key: "launchpad",
    name: "LaunchPad",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853943597517f128b9b4_launchpad.png",
  },
  {
    key: "contacts",
    name: "Contacts",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853743597518c528b9b3_contacts.png",
  },
  {
    key: "notes",
    name: "Notes",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853c849ec3735b52cef9_notes.png",
  },
  {
    key: "reminders",
    name: "Reminders",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853d44d99641ce69afeb_reminders.png",
  },
  {
    key: "photos",
    name: "Photos",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853c55558a2e1192ee09_photos.png",
  },
  {
    key: "messages",
    name: "Messages",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853a55558a68e192ee08_messages.png",
  },
  {
    key: "facetime",
    name: "FaceTime",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f708537f18e2cb27247c904_facetime.png",
  },
  {
    key: "music",
    name: "Music",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853ba0782d6ff2aca6b3_music.png",
  },
  {
    key: "podcasts",
    name: "Podcasts",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853cc718ba9ede6888f9_podcasts.png",
  },
  {
    key: "tv",
    name: "TV",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f708540dd82638d7b8eda70_tv.png",
  },
  {
    key: "app-store",
    name: "App Store",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853270b5e2ccfd795b49_appstore.png",
  },
  {
    key: "safari",
    name: "Safari",
    icon: "https://uploads-ssl.webflow.com/5f7081c044fb7b3321ac260e/5f70853ddd826358438eda6d_safari.png",
  },
  {
    key: "bin",
    name: "Bin",
    icon: "https://findicons.com/files/icons/569/longhorn_objects/128/trash.png",
    isBin: true,
  },
];

function getTransformClass(hoveredIndex: number | null, index: number): string {
  if (hoveredIndex === null) {
    return "scale-100 translate-y-0";
  }

  const distance = Math.abs(index - hoveredIndex);

  if (distance === 0) {
    return "scale-150 -translate-y-[10px]";
  }
  if (distance === 1) {
    return "scale-[1.2] -translate-y-[6px]";
  }
  if (distance === 2) {
    return "scale-110 translate-y-0";
  }

  return "scale-100 translate-y-0";
}

export default function Dock({
  items = DEFAULT_DOCK_ITEMS,
  onOpenFinder,
  onSelectItem,
  className,
  zIndex = 200,
}: DockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [launchingItems, setLaunchingItems] = useState<Record<string, 1 | 2>>({});

  const triggerLaunchAnimation = (key: string) => {
    const iterations: 1 | 2 = Math.random() < 0.5 ? 1 : 2;
    setLaunchingItems((prev) => ({ ...prev, [key]: iterations }));
  };

  const clearLaunchAnimation = (key: string) => {
    setLaunchingItems((prev) => {
      if (!(key in prev)) {
        return prev;
      }

      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleItemClick = (item: DockItem) => {
    const action = item.action ?? (item.key === "finder" ? onOpenFinder : undefined);

    if (!item.active && action) {
      triggerLaunchAnimation(item.key);
    }

    action?.();
    onSelectItem?.(item);
  };

  return (
    <div
      className={cn(
        "absolute bottom-5 left-1/2 flex h-[60px] -translate-x-1/2 justify-center rounded-2xl",
        className,
      )}
      style={{ zIndex }}
    >
      <ul
        className="flex h-full items-center justify-center rounded-2xl border border-white/20 bg-[rgba(83,83,83,0.25)] p-[3px] backdrop-blur-[13px]"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {items.map((item, index) => {
          const launchBounceCount = launchingItems[item.key];
          const isLaunching = launchBounceCount != null;

          return (
            <li
              key={item.key}
              data-dock-item-key={item.key}
              className={cn(
                "group relative flex h-[50px] w-[50px] list-none items-center justify-center align-bottom transition-all duration-350 ease-[cubic-bezier(0.22,0.85,0.22,1)] hover:mx-[13px]",
                item.isBin && "ml-5 border-l-[1.5px] border-white/40 pl-2.5",
                isLaunching && "dock-launch-bounce",
              )}
              style={isLaunching ? { animationIterationCount: launchBounceCount } : undefined}
              onAnimationEnd={() => clearLaunchAnimation(item.key)}
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <div className="invisible absolute -top-[50px] flex h-[24px] items-center justify-center rounded-md bg-black/30 px-[6px] text-[14px] text-white/90 opacity-0 transition-all duration-300 ease-out group-hover:visible group-hover:opacity-100">
                {item.name}
                <span className="absolute -bottom-[10px] h-0 w-0 border-x-[10px] border-x-transparent border-t-[10px] border-t-black/50" />
              </div>

              <button
                type="button"
                aria-label={item.name}
                className="h-full w-full border-none bg-transparent p-0"
                onClick={() => handleItemClick(item)}
              >
                <img
                  className={cn(
                    "inline-block object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
                    item.isBin ? "h-[94%] w-[94%] hover:ml-2.5" : "h-full w-full",
                    getTransformClass(hoveredIndex, index),
                  )}
                  src={item.icon}
                  alt={item.name}
                  draggable={false}
                />
              </button>

              {item.active ? (
                <span className="absolute -bottom-[5px] h-[4px] w-[4px] rounded-full bg-white/50" />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
