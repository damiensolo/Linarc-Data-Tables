
export enum Status {
  InProgress = 'In Progress',
  Completed = 'Completed',
  InReview = 'In review',
  Planned = 'Planned',
  New = 'New',
}

// FIX: Add Priority enum to resolve missing type errors.
export enum Priority {
  Urgent = 'Urgent',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  None = 'None',
}

// FIX: Add Impact enum to resolve missing type errors.
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
  // FIX: Add optional priority and impact properties to support board and gantt views.
  priority?: Priority;
  impact?: Impact;
}

// FIX: Add ColumnId and Column types for FieldsMenu component.
export type ColumnId = 'name' | 'status' | 'assignee' | 'dates' | 'priority' | 'impact';

export interface Column {
  id: ColumnId;
  label: string;
  width: string;
  visible: boolean;
}