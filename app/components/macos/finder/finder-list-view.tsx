"use client";

import { MouseEvent, useMemo } from "react";
import type { FinderFileItem } from "../shared/types";
import { cn, formatDate, formatFileSize } from "../shared/utils";

interface FinderListViewProps {
  files: FinderFileItem[];
  selected: string[];
  focused?: boolean;
  paddingTop?: number;
  onSelectionChange: (selection: string[]) => void;
  onOpen: (file: FinderFileItem) => void;
}

interface FinderColumn {
  key: string;
  label: string;
  className?: string;
  width: number;
}

const COLUMNS: FinderColumn[] = [
  { key: "name", label: "Name", className: "name", width: 240 },
  { key: "modified", label: "Date Modified", width: 180 },
  { key: "size", label: "Size", width: 110 },
  { key: "kind", label: "Kind", width: 130 },
];

export function FinderListView({
  files,
  selected,
  focused = false,
  paddingTop = 52,
  onSelectionChange,
  onOpen,
}: FinderListViewProps) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const selectSingle = (name: string) => {
    onSelectionChange([name]);
  };

  const toggleSelected = (name: string) => {
    if (selectedSet.has(name)) {
      onSelectionChange(selected.filter((entry) => entry !== name));
      return;
    }

    onSelectionChange([...selected, name]);
  };

  const selectRange = (name: string) => {
    const anchor = selected[selected.length - 1];
    const anchorIndex = Math.max(
      0,
      files.findIndex((file) => file.name === anchor),
    );
    const targetIndex = files.findIndex((file) => file.name === name);
    if (targetIndex === -1) {
      selectSingle(name);
      return;
    }

    const [from, to] = anchorIndex <= targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];
    const rangeNames = files.slice(from, to + 1).map((file) => file.name);
    const union = new Set([...selected, ...rangeNames]);
    onSelectionChange([...union]);
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>, file: FinderFileItem) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      toggleSelected(file.name);
      return;
    }

    if (event.shiftKey) {
      selectRange(file.name);
      return;
    }

    selectSingle(file.name);
  };

  return (
    <div
      className={cn("list-view", "list-view-6nk", focused && "focused")}
      style={{ paddingTop: `${paddingTop + 29}px` }}
    >
      <div className="blur" />
      <div className="header" style={{ top: paddingTop }}>
        {COLUMNS.map((column) => (
          <div
            key={column.key}
            className={cn("col", column.className)}
            style={{ width: column.width }}
          >
            {column.label}
          </div>
        ))}
      </div>

      <div className="files">
        {files.map((file) => {
          const isSelected = selectedSet.has(file.name);
          const kind = file.kind ?? (file.isDirectory ? "Folder" : "Document");

          return (
            <div
              key={file.id ?? file.name}
              className={cn("file", isSelected && "selected")}
              onClick={(event) => handleClick(event, file)}
              onDoubleClick={() => onOpen(file)}
            >
              <div className="col col1" style={{ width: COLUMNS[0].width }}>
                <div className="thumbnail">
                  {file.thumbnailSrc ? (
                    <div
                      className="img"
                      style={{ backgroundImage: `url(${file.thumbnailSrc})` }}
                    />
                  ) : null}
                </div>
                <div className="name">{file.name}</div>
              </div>
              <div className="col" style={{ width: COLUMNS[1].width }}>
                {formatDate(file.modifiedAt)}
              </div>
              <div className="col" style={{ width: COLUMNS[2].width }}>
                {formatFileSize(file.sizeBytes)}
              </div>
              <div className="col" style={{ width: COLUMNS[3].width }}>
                {kind}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
