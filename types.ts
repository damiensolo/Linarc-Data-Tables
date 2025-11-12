

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

export interface Progress {
  percentage: number;
  history?: number[];
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
  progress?: Progress;
  health?: {
    name: string;
    status: 'complete' | 'at_risk' | 'blocked';
    details?: string;
  }[];
}

export type ColumnId = 'name' | 'status' | 'assignee' | 'dates' | 'progress' | 'details' | 'priority' | 'impact';

export interface Column {
  id: ColumnId;
  label: string;
  width: string;
  visible: boolean;
  minWidth?: number;
}

export type DisplayDensity = 'compact' | 'standard' | 'comfortable';

export type SortConfig = {
  columnId: ColumnId;
  direction: 'asc' | 'desc';
} | null;

export type TextOperator = 'contains' | 'not_contains' | 'is' | 'is_not' | 'is_empty' | 'is_not_empty';
export type EnumOperator = 'is' | 'is_not' | 'is_empty' | 'is_not_empty';
export type FilterOperator = TextOperator | EnumOperator;

export interface FilterRule {
  id: string;
  columnId: ColumnId;
  operator: FilterOperator;
  value?: string | string[]; // string for text, string[] for enums
}

export interface View {
  id: string;
  name: string;
  columns: Column[];
  displayDensity?: DisplayDensity;
  showGridLines?: boolean;
  sortConfig?: SortConfig;
  searchQuery?: string;
  filters?: FilterRule[];
}