import { useMemo } from "react";
import { cn } from "../shared/utils";
import type { ReminderTask } from "./types";

interface ReminderTaskListProps {
  title: string;
  listColor: string;
  tasks: ReminderTask[];
  draftTitle: string;
  onDraftChange: (value: string) => void;
  onAddTask: () => void;
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
}

type ReminderSection = "Morning" | "Afternoon" | "Tonight" | "Anytime";

const SECTION_ORDER: ReminderSection[] = ["Morning", "Afternoon", "Tonight", "Anytime"];

function DottedCircle() {
  return (
    <span className="mt-1 inline-block h-4 w-4 rounded-full border border-white/15 bg-gradient-to-b from-[#595c63] to-[#45484f] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
  );
}

function TaskRow({
  task,
  onToggle,
  onRemove,
}: {
  task: ReminderTask;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group flex items-start gap-3 border-b border-white/10 py-3">
      <button
        type="button"
        className={cn(
          "mt-0.5 grid h-4 w-4 place-items-center rounded-full border transition-colors duration-150",
          task.checked
            ? "border-[#2d5fc8] bg-gradient-to-b from-[#4580f6] to-[#2454bf] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
            : "border-white/15 bg-gradient-to-b from-[#595c63] to-[#45484f] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-white/25",
        )}
        onClick={onToggle}
        aria-label={task.checked ? "Mark as incomplete" : "Mark as complete"}
      >
        {task.checked ? <span className="h-[5px] w-[5px] rounded-full bg-white" /> : null}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-[16px] font-medium leading-tight text-white/90",
            task.checked && "text-white/35 line-through",
          )}
        >
          {task.text}
        </div>

        {task.notes ? (
          <div className="whitespace-pre-line text-[13px] leading-[1.3] text-white/45">
            {task.notes}
          </div>
        ) : null}

        {task.duePrefix || task.dueTime ? (
          <div className="text-[13px] leading-tight">
            {task.duePrefix ? <span className="text-white/45">{task.duePrefix} </span> : null}
            {task.dueTime ? <span className="text-[#f28f86]">{task.dueTime}</span> : null}
          </div>
        ) : null}

        {task.dueLabel ? (
          <div className="text-[13px] leading-tight text-white/45">{task.dueLabel}</div>
        ) : null}
      </div>

      <button
        type="button"
        className="mt-1 grid h-7 w-7 place-items-center rounded-full border-none bg-transparent text-[18px] leading-none text-white/60 opacity-0 transition hover:text-white/80 group-hover:opacity-100"
        onClick={onRemove}
        aria-label="Remove reminder"
      >
        ×
      </button>
    </div>
  );
}

export function ReminderTaskList({
  title,
  listColor,
  tasks,
  draftTitle,
  onDraftChange,
  onAddTask,
  onToggleTask,
  onRemoveTask,
}: ReminderTaskListProps) {
  const sectionedTasks = useMemo(() => {
    const grouped = new Map<ReminderSection, ReminderTask[]>();
    SECTION_ORDER.forEach((section) => grouped.set(section, []));

    tasks.forEach((task) => {
      const section = task.section ?? "Anytime";
      grouped.get(section)?.push(task);
    });

    return SECTION_ORDER.filter((section) => (grouped.get(section)?.length ?? 0) > 0).map(
      (section) => ({
        section,
        tasks: grouped.get(section) ?? [],
      }),
    );
  }, [tasks]);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-6 pb-2 pt-4">
        <h2 className="text-[48px] font-bold leading-none" style={{ color: listColor }}>
          {title}
        </h2>
      </div>

      <div className="flex-1 overflow-auto px-6">
        {sectionedTasks.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-5 text-[13px] text-white/45">
            No reminders yet. Add one below.
          </div>
        ) : null}

        <div className="space-y-3 pb-2">
          {sectionedTasks.map(({ section, tasks: sectionTasks }) => (
            <section key={section}>
              <h3 className="mb-1 text-[13px] font-semibold text-white/50">{section}</h3>

              {sectionTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => onToggleTask(task.id)}
                  onRemove={() => onRemoveTask(task.id)}
                />
              ))}
            </section>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 px-6 py-3">
        <div className="flex items-center gap-3">
          <DottedCircle />
          <input
            id="reminder-draft-input"
            value={draftTitle}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onAddTask();
              }
            }}
            placeholder="Notes"
            className="h-9 flex-1 rounded-md border border-transparent bg-transparent px-1 text-[14px] text-white/90 outline-none placeholder:text-white/30 focus:border-white/25"
          />
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 border-none bg-transparent p-0 text-[12px] font-semibold transition",
              draftTitle.trim()
                ? "text-[#4f9cff] hover:text-[#86bdff]"
                : "pointer-events-none text-white/30",
            )}
            onClick={onAddTask}
          >
            <span className="text-[15px] leading-none" aria-hidden>
              +
            </span>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
