import { FinderNavModel } from "../shared/types";

interface FinderHeaderControlsProps {
  nav: FinderNavModel;
}

const LEFT_ICON = "/macos-demo/chevron-left-V36SDOWO.webp";
const RIGHT_ICON = "/macos-demo/chevron-right-54HL462P.webp";

export function FinderHeaderControls({ nav }: FinderHeaderControlsProps) {
  const title = nav.value.path[nav.value.path.length - 1] ?? "Macintosh HD";

  return (
    <div className="header-controls header-controls-98c">
      <div className="nav" onMouseDown={(event) => event.stopPropagation()}>
        <button disabled={!nav.hasPrevHistory} onClick={nav.goBack}>
          <img src={LEFT_ICON} draggable={false} alt="Back" />
        </button>
        <button disabled={!nav.hasNextHistory} onClick={nav.goNext}>
          <img src={RIGHT_ICON} draggable={false} alt="Forward" />
        </button>
      </div>
      <div className="dir-name">{title}</div>
    </div>
  );
}
