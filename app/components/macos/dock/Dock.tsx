"use client";

import { useState } from "react";
import { cn } from "../shared/utils";

export interface DockItem {
  key: string;
  name: string;
  icon: string;
  active?: boolean;
  isBin?: boolean;
}

interface DockProps {
  items?: DockItem[];
  onOpenFinder?: () => void;
  onSelectItem?: (item: DockItem) => void;
  className?: string;
  zIndex?: number;
}

const DEFAULT_DOCK_ITEMS: DockItem[] = [
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

  const handleItemClick = (item: DockItem) => {
    if (item.key === "finder") {
      onOpenFinder?.();
    }
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
        {items.map((item, index) => (
          <li
            key={item.key}
            className={cn(
              "group relative flex h-[50px] w-[50px] list-none items-center justify-center align-bottom transition-all duration-200 hover:mx-[13px]",
              item.isBin && "ml-5 border-l-[1.5px] border-white/40 pl-2.5",
            )}
            onMouseEnter={() => setHoveredIndex(index)}
          >
            <div className="invisible absolute -top-[70px] flex h-[30px] items-center justify-center rounded bg-black/50 px-[15px] text-[14px] text-white/90 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
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
                  "inline-block object-cover transition-transform duration-300 ease-out",
                  item.isBin ? "h-[94%] w-[94%] hover:ml-2.5" : "h-full w-full",
                  getTransformClass(hoveredIndex, index),
                )}
                src={item.icon}
                alt={item.name}
                draggable={false}
              />
            </button>

            {item.active ? (
              <span className="absolute bottom-[2px] h-[5px] w-[5px] rounded-full bg-white/50" />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
