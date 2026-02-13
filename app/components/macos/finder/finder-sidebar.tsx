import type { FinderNavModel } from "../shared/types";
import { areSamePath, cn } from "../shared/utils";
import finderApplicationsIcon from "../../../assets/images/finder-applications-icon.webp";
import finderDesktopIcon from "../../../assets/images/finder-desktop-icon.webp";
import finderDocumentsIcon from "../../../assets/images/finder-documents-icon.webp";
import finderDownloadsIcon from "../../../assets/images/finder-downloads-icon.webp";

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
    icon: finderApplicationsIcon.src,
    label: "Applications",
    path: ["Applications"],
  },
  {
    icon: finderDesktopIcon.src,
    label: "Desktop",
    path: ["User", "Desktop"],
  },
  {
    icon: finderDocumentsIcon.src,
    label: "Documents",
    path: ["User", "Documents"],
  },
  {
    icon: finderDownloadsIcon.src,
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
