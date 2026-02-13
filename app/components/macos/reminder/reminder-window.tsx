"use client";

import { useMemo } from "react";
import { WindowControls } from "../window/window-controls";
import type { WindowControlModel } from "../shared/types";
import { cn } from "../shared/utils";
import { ReminderSidebar } from "./reminder-sidebar";
import { ReminderTaskList } from "./reminder-task-list";
import type { ReminderList } from "./types";

interface ReminderWindowProps {
  lists: ReminderList[];
  activeListId: string;
  focused?: boolean;
  fullScreen?: boolean;
  draftTitle: string;
  onDraftChange: (value: string) => void;
  onSelectList: (listId: string) => void;
  onAddTask: () => void;
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onClose?: () => void;
  windowControl: WindowControlModel;
}

export function ReminderWindow({
  lists,
  activeListId,
  focused = false,
  fullScreen = false,
  draftTitle,
  onDraftChange,
  onSelectList,
  onAddTask,
  onToggleTask,
  onRemoveTask,
  onClose,
  windowControl,
}: ReminderWindowProps) {
  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId) ?? lists[0],
    [lists, activeListId],
  );

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-[14px]",
        fullScreen && "rounded-none",
      )}
    >
      <div className="flex h-full w-full">
        <div
          className={cn(
            "relative flex h-full w-[258px] flex-col border-r border-black",
            fullScreen ? "bg-[#222832]" : focused ? "bg-[#141414b3] backdrop-blur-[40px]" : "bg-[#26272b]",
          )}
        >
          <div className="relative h-[52px] shrink-0">
            <div className="absolute inset-0" {...windowControl.draggingProps} />
            <div className="absolute left-[16px] top-[16px] z-10">
              <WindowControls windowControl={windowControl} onClose={onClose} />
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <ReminderSidebar
              lists={lists}
              activeListId={activeList.id}
              focused={focused}
              onSelectList={onSelectList}
            />
          </div>
        </div>

        <div className="relative flex h-full flex-1 flex-col bg-[#212125]">
          <div
            className={cn(
              "relative h-[52px] shrink-0 border-b border-black/40",
              fullScreen ? "bg-[#26272b]" : focused ? "bg-[rgba(53,53,56,0.7)]" : "bg-[#26272b]",
            )}
          >
            <div className="absolute inset-0" {...windowControl.draggingProps} />
            <button
              type="button"
              className="absolute right-4 top-1/2 z-10 inline-flex -translate-y-1/2 items-center gap-1 border-none bg-transparent p-0 text-white/70 transition hover:text-white/95"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={() => {
                if (draftTitle.trim()) {
                  onAddTask();
                  return;
                }

                document.getElementById("reminder-draft-input")?.focus();
              }}
              aria-label="Add reminder"
            >
              <span className="text-[19px] leading-none" aria-hidden>
                +
              </span>
              <span className="text-[12px] font-semibold">Add</span>
            </button>
          </div>

          <div className="min-h-0 flex-1">
            <ReminderTaskList
              title={activeList.name}
              listColor={activeList.color}
              tasks={activeList.tasks}
              draftTitle={draftTitle}
              onDraftChange={onDraftChange}
              onAddTask={onAddTask}
              onToggleTask={onToggleTask}
              onRemoveTask={onRemoveTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
