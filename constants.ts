

import { Task, Status, Assignee, Column, Priority, Impact, Progress } from './types';

const JANE_SMITH: Assignee = { id: 'js', name: 'Jane Smith', initials: 'JS', avatarColor: 'bg-purple-600' };
const SAM_LEE: Assignee = { id: 'sl', name: 'Sam Lee', initials: 'SL', avatarColor: 'bg-pink-600' };

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'name', label: 'Name', width: '400px', visible: true, minWidth: 200 },
  { id: 'status', label: 'Status', width: '150px', visible: true, minWidth: 120 },
  { id: 'assignee', label: 'Assignee', width: '120px', visible: true, minWidth: 80 },
  { id: 'dates', label: 'Start Date - Due Date', width: '220px', visible: true, minWidth: 180 },
  { id: 'progress', label: 'Progress', width: '180px', visible: true, minWidth: 150 },
  { id: 'details', label: 'Details', width: '100px', visible: true, minWidth: 80 },
];

// FIX: Added priority and impact data to mock tasks to support new features.
export const MOCK_TASKS: Task[] = [
  {
    id: 1,
    name: 'New Product Launch',
    assignees: [JANE_SMITH],
    status: Status.InProgress,
    startDate: '15/05/2024',
    dueDate: '30/06/2024',
    isExpanded: true,
    priority: Priority.High,
    impact: Impact.High,
    progress: { percentage: 45, history: [10, 15, 25, 30, 45] },
    children: [
      {
        id: 2,
        name: 'Research',
        assignees: [JANE_SMITH],
        status: Status.Completed,
        startDate: '15/05/2024',
        dueDate: '28/05/2024',
        isExpanded: true,
        priority: Priority.High,
        impact: Impact.Medium,
        progress: { percentage: 100, history: [20, 50, 80, 100] },
        children: [
          {
            id: 3,
            name: 'Stakeholder Research',
            assignees: [JANE_SMITH],
            status: Status.Completed,
            startDate: '15/05/2024',
            dueDate: '20/05/2024',
            priority: Priority.Medium,
            progress: { percentage: 100 },
          },
          {
            id: 4,
            name: 'User Research',
            assignees: [JANE_SMITH],
            status: Status.Completed,
            startDate: '21/05/2024',
            dueDate: '28/05/2024',
            priority: Priority.Medium,
            progress: { percentage: 100 },
          },
        ],
      },
      {
        id: 5,
        name: 'Requirement gathering',
        assignees: [JANE_SMITH],
        status: Status.InProgress,
        startDate: '29/05/2024',
        dueDate: '04/06/2024',
        priority: Priority.High,
        progress: { percentage: 80, history: [10, 30, 90, 85, 80] },
      },
      {
        id: 6,
        name: 'Initial Design',
        assignees: [JANE_SMITH, SAM_LEE],
        status: Status.Planned,
        startDate: '05/06/2024',
        dueDate: '15/06/2024',
        priority: Priority.Low,
        impact: Impact.Low,
        progress: { percentage: 15, history: [0, 5, 10, 15] },
      },
      {
        id: 7,
        name: 'Design review',
        assignees: [JANE_SMITH, SAM_LEE],
        status: Status.New,
        startDate: '16/06/2024',
        dueDate: '20/06/2024',
        priority: Priority.None,
      },
      {
        id: 8,
        name: '1369667897: Marketing request',
        assignees: [SAM_LEE],
        status: Status.New,
        startDate: '05/06/2024',
        dueDate: '10/06/2024',
        priority: Priority.Medium,
        progress: { percentage: 5, history: [20, 15, 10, 8, 5] },
      },
      {
        id: 9,
        name: 'Final Quality Assurance',
        assignees: [SAM_LEE],
        status: Status.InReview,
        startDate: '21/06/2024',
        dueDate: '25/06/2024',
        priority: Priority.Urgent,
        impact: Impact.High,
        progress: { percentage: 40, history: [80, 85, 90, 50, 40] },
      },
    ],
  },
];