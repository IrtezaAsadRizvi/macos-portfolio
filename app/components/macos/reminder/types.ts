export interface ReminderTask {
  id: string;
  text: string;
  checked: boolean;
  section?: "Morning" | "Afternoon" | "Tonight" | "Anytime";
  notes?: string;
  duePrefix?: string;
  dueTime?: string;
  dueLabel?: string;
  flagged?: boolean;
  scheduled?: boolean;
}

export interface ReminderList {
  id: string;
  name: string;
  color: string;
  tasks: ReminderTask[];
}
