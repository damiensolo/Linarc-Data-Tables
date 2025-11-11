
export enum Status {
  InProgress = 'In Progress',
  Completed = 'Completed',
  InReview = 'In review',
  Planned = 'Planned',
  New = 'New',
}

// FIX: Add Priority enum to define available priority levels for tasks.
export enum Priority {
  Urgent = 'Urgent',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  None = 'None',
}

// FIX: Add Impact enum to define available impact levels for tasks.
export enum Impact {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export interface Assignee {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

export interface Task {
  id: number;
  name:string;
  assignees: Assignee[];
  status: Status;
  startDate: string;
  dueDate: string;
  budget?: number;
  subItemsCount?: number;
  children?: Task[];
  isExpanded?: boolean;
  // FIX: Add optional priority and impact properties to the Task interface.
  priority?: Priority;
  impact?: Impact;
}

export type ColumnId = 'name' | 'status' | 'assignee' | 'dates';

export interface Column {
  id: ColumnId;
  label: string;
  width: string;
  visible: boolean;
  minWidth?: number;
}

export type DisplayDensity = 'compact' | 'standard' | 'comfortable';

export interface View {
  id: string;
  name: string;
  columns: Column[];
  displayDensity?: DisplayDensity;
  showGridLines?: boolean;
}
