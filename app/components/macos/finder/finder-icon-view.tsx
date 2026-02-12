"use client";

import { MouseEvent, useMemo } from "react";
import type { FinderFileItem } from "../shared/types";
import { cn } from "../shared/utils";

interface FinderIconViewProps {
  files: FinderFileItem[];
  selected: string[];
  focused?: boolean;
  onSelectionChange: (selection: string[]) => void;
  onOpen: (file: FinderFileItem) => void;
}

const CELL_WIDTH = 96;
const CELL_HEIGHT = 96;
const COLUMNS = 6;

export function FinderIconView({
  files,
  selected,
  focused = false,
  onSelectionChange,
  onOpen,
}: FinderIconViewProps) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const handleClick = (event: MouseEvent<HTMLDivElement>, name: string) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      if (selectedSet.has(name)) {
        onSelectionChange(selected.filter((entry) => entry !== name));
      } else {
        onSelectionChange([...selected, name]);
      }
      return;
    }

    onSelectionChange([name]);
  };

  return (
    <div className={cn("icon-view", "icon-view-5dm", focused && "focused")}>
      {files.map((file, index) => {
        const row = Math.floor(index / COLUMNS);
        const col = index % COLUMNS;
        const centerX = col * CELL_WIDTH + 52;
        const centerY = row * CELL_HEIGHT + 38;
        const isSelected = selectedSet.has(file.name);

        return (
          <div
            key={file.id ?? file.name}
            className={cn("file", isSelected && "selected")}
            style={{ left: centerX, top: centerY }}
            onClick={(event) => handleClick(event, file.name)}
            onDoubleClick={() => onOpen(file)}
          >
            <div className="thumbnail-selected" />
            {file.thumbnailSrc ? <img src={file.thumbnailSrc} draggable={false} alt="" /> : null}
            <div className="name">{file.name}</div>
          </div>
        );
      })}
    </div>
  );
}
