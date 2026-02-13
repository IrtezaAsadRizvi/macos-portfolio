import { FinderNavModel } from "../shared/types";
import chevronLeftIcon from "../../../assets/images/chevron-left.webp";
import chevronRightIcon from "../../../assets/images/chevron-right.webp";

interface FinderHeaderControlsProps {
  nav: FinderNavModel;
}

const LEFT_ICON = chevronLeftIcon.src;
const RIGHT_ICON = chevronRightIcon.src;

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
