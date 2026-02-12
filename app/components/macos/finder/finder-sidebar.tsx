import type { FinderNavModel } from "../shared/types";
import { areSamePath, cn } from "../shared/utils";

interface FinderFavorite {
  icon: string;
  label: string;
  path: string[];
}

interface FinderSidebarProps {
  nav: FinderNavModel;
  focused?: boolean;
  favorites?: FinderFavorite[];
}

const DEFAULT_FAVORITES: FinderFavorite[] = [
  {
    icon: "/macos-demo/applications-GLOW2Z6D.webp",
    label: "Applications",
    path: ["Applications"],
  },
  {
    icon: "/macos-demo/desktop-SU2GX57W.webp",
    label: "Desktop",
    path: ["User", "Desktop"],
  },
  {
    icon: "/macos-demo/documents-UFEVYE24.webp",
    label: "Documents",
    path: ["User", "Documents"],
  },
  {
    icon: "/macos-demo/download-QGAOICMR.webp",
    label: "Downloads",
    path: ["User", "Downloads"],
  },
];

export function FinderSidebar({
  nav,
  focused = false,
  favorites = DEFAULT_FAVORITES,
}: FinderSidebarProps) {
  return (
    <div className={cn("left-menu", "left-menu-1b4", focused && "focused")}>
      <div className="section">
        <div className="title">Favorites</div>
        <div className="items">
          {favorites.map((favorite) => {
            const active = areSamePath(favorite.path, nav.value.path);

            return (
              <div
                key={favorite.label}
                className={cn("item", active && "active")}
                onClick={() => nav.push?.({ path: favorite.path })}
              >
                <img src={favorite.icon} alt="" />
                <div className="label">{favorite.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
