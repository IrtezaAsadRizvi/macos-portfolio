import type { ReactNode } from "react";
import { cn } from "../shared/utils";
import type { ReminderList, ReminderTask } from "./types";

interface ReminderSidebarProps {
  lists: ReminderList[];
  activeListId: string;
  focused?: boolean;
  onSelectList: (listId: string) => void;
}

function CalendarGridIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path
        d="M3 2h1v1h8V2h1v1h1.5A1.5 1.5 0 0 1 16 4.5v8A1.5 1.5 0 0 1 14.5 14h-13A1.5 1.5 0 0 1 0 12.5v-8A1.5 1.5 0 0 1 1.5 3H3V2Zm11.7 4H1.3v6.5c0 .1.1.2.2.2h13c.1 0 .2-.1.2-.2V6Zm-11 1.3h2v2h-2v-2Zm3.6 0h2v2h-2v-2Zm3.6 0h2v2h-2v-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path
        d="M2 2h12l1.5 5v6A1 1 0 0 1 14.5 14h-13A1 1 0 0 1 .5 13V7L2 2Zm1 1.3L1.8 7h2.7l1 1.3h5l1-1.3h2.7L13 3.3H3ZM1.8 8.3V13h12.4V8.3h-2l-1 1.2H4.8l-1-1.2h-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path
        d="M3 1h1v14H3V1Zm2 1h8l-1.7 3L13 8H5V2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path d="m6.8 11.6-3-3 .9-.9 2.1 2.1 4.5-4.5.9.9-5.4 5.4Z" fill="currentColor" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M5.6 7.3a2 2 0 1 1 0-3.9 2 2 0 0 1 0 4Zm4.8-.8a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6ZM2.4 12c.1-1.7 1.6-3 3.4-3 1.8 0 3.2 1.3 3.4 3H2.4Zm7.4 0c.1-1.3 1.3-2.3 2.7-2.3 1.4 0 2.5 1 2.7 2.3H9.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface SummaryTileProps {
  label: string;
  count: number;
  active?: boolean;
  onClick?: () => void;
  icon: ReactNode;
  iconBg: string;
}

function SummaryTile({ label, count, active = false, onClick, icon, iconBg }: SummaryTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[10px] border px-2.5 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition",
        active
          ? "border-[#2b77dc] bg-[#1a5dc6] text-white"
          : "border-white/10 bg-white/[0.06] text-white/85 hover:bg-white/[0.09]",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={cn(
            "grid h-6 w-6 place-items-center rounded-full",
            active ? "bg-white text-[#0a84ff]" : iconBg,
          )}
        >
          {icon}
        </span>
        <span className={cn("text-[22px] font-semibold leading-none", active && "text-white")}>
          {count}
        </span>
      </div>
      <div className={cn("text-[13px] font-medium leading-none", active ? "text-white" : "text-white/80")}>
        {label}
      </div>
    </button>
  );
}

function flattenTasks(lists: ReminderList[]): ReminderTask[] {
  return lists.flatMap((list) => list.tasks);
}

function countOpenTasks(lists: ReminderList[]): number {
  return flattenTasks(lists).filter((task) => !task.checked).length;
}

function countTodayTasks(lists: ReminderList[]): number {
  const todayList = lists.find((list) => list.id === "today");
  if (!todayList) {
    return 0;
  }
  return todayList.tasks.filter((task) => !task.checked).length;
}

function countCompletedTasks(lists: ReminderList[]): number {
  return flattenTasks(lists).filter((task) => task.checked).length;
}

function countScheduledTasks(lists: ReminderList[]): number {
  return flattenTasks(lists).filter(
    (task) => task.scheduled || Boolean(task.dueTime || task.dueLabel || task.duePrefix),
  ).length;
}

function countFlaggedTasks(lists: ReminderList[]): number {
  return flattenTasks(lists).filter((task) => task.flagged).length;
}

export function ReminderSidebar({
  lists,
  activeListId,
  focused = false,
  onSelectList,
}: ReminderSidebarProps) {
  const todayTasks = countTodayTasks(lists);
  const openTasks = countOpenTasks(lists);
  const completedTasks = countCompletedTasks(lists);
  const scheduledTasks = countScheduledTasks(lists);
  const flaggedTasks = countFlaggedTasks(lists);
  const totalTasks = openTasks + completedTasks;

  return (
    <div className={cn("flex h-full flex-col px-3 pb-3 text-white/75", focused && "text-white/90")}>
      <div className="px-2 pb-3">
        <div className="grid grid-cols-2 gap-2">
          <SummaryTile
            label="Today"
            count={todayTasks}
            active={activeListId === "today"}
            onClick={() => onSelectList("today")}
            icon={<CalendarGridIcon />}
            iconBg="bg-white text-[#0a84ff]"
          />
          <SummaryTile
            label="Scheduled"
            count={scheduledTasks}
            icon={<CalendarGridIcon />}
            iconBg="bg-[#ad342d] text-white"
          />
          <SummaryTile
            label="All"
            count={totalTasks}
            icon={<InboxIcon />}
            iconBg="bg-[#404146] text-white"
          />
          <SummaryTile
            label="Flagged"
            count={flaggedTasks}
            icon={<FlagIcon />}
            iconBg="bg-[#bf7317] text-white"
          />
          <SummaryTile
            label="Completed"
            count={completedTasks}
            icon={<CheckIcon />}
            iconBg="bg-[#5d788f] text-white"
          />
        </div>
      </div>

      <div className="px-3 mt-3 text-[11px] font-semibold text-white/25">
        My Lists
      </div>

      <div className="mt-2 flex-1 overflow-auto px-1">
        <div className="space-y-1">
          {lists
            .filter((list) => list.id !== "today")
            .map((list) => {
              const remaining = list.tasks.filter((task) => !task.checked).length;
              const active = list.id === activeListId;

              return (
                <button
                  key={list.id}
                  type="button"
                  className={cn(
                    `group flex w-full items-center gap-2 px-2 py-1 text-left transition 
                    bg-transparent border-none font-semibold capitalize`,
                    active ? "text-white" : "text-white/85",
                  )}
                  onClick={() => onSelectList(list.id)}
                >
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full text-white"
                    style={{ backgroundColor: list.color }}
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                      <path d="M4 4.2h8v1.3H4V4.2Zm0 3.2h8v1.3H4V7.4Zm0 3.2h8v1.3H4v-1.3Z" fill="currentColor" />
                    </svg>
                  </span>
                  <span className="flex-1 text-[13px] leading-none text-white/90">{list.name}</span>
                  {list.id === "family" ? (
                    <span className="grid h-5 w-5 place-items-center text-white/45">
                      <PeopleIcon />
                    </span>
                  ) : null}
                  <span className="text-[13px] leading-none text-white/45">{remaining}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
