import { Task, Status, Assignee, Column } from './types';

const JANE_SMITH: Assignee = { id: 'js', name: 'Jane Smith', initials: 'JS', avatarColor: 'bg-purple-600' };
const SAM_LEE: Assignee = { id: 'sl', name: 'Sam Lee', initials: 'SL', avatarColor: 'bg-pink-600' };

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'name', label: 'Name', width: '400px', visible: true, minWidth: 200 },
  { id: 'status', label: 'Status', width: '150px', visible: true, minWidth: 120 },
  { id: 'assignee', label: 'Assignee', width: '120px', visible: true, minWidth: 80 },
  { id: 'dates', label: 'Start Date - Due Date', width: '220px', visible: true, minWidth: 180 },
  { id: 'priority', label: 'Priority', width: '120px', visible: false, minWidth: 100 },
  { id: 'impact', label: 'Impact', width: '120px', visible: false, minWidth: 120 },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 1,
    name: 'New Product Launch',
    assignees: [JANE_SMITH],
    status: Status.InProgress,
    startDate: '15/05/2024',
    dueDate: '30/06/2024',
    isExpanded: true,
    children: [
      {
        id: 2,
        name: 'Research',
        assignees: [JANE_SMITH],
        status: Status.Completed,
        startDate: '15/05/2024',
        dueDate: '28/05/2024',
        isExpanded: true,
        children: [
          {
            id: 3,
            name: 'Stakeholder Research',
            assignees: [JANE_SMITH],
            status: Status.Completed,
            startDate: '15/05/2024',
            dueDate: '20/05/2024',
          },
          {
            id: 4,
            name: 'User Research',
            assignees: [JANE_SMITH],
            status: Status.Completed,
            startDate: '21/05/2024',
            dueDate: '28/05/2024',
          },
        ],
      },
      {
        id: 5,
        name: 'Requirement gathering',
        assignees: [JANE_SMITH],
        status: Status.InReview,
        startDate: '29/05/2024',
        dueDate: '04/06/2024',
      },
      {
        id: 6,
        name: 'Initial Design',
        assignees: [JANE_SMITH, SAM_LEE],
        status: Status.Planned,
        startDate: '05/06/2024',
        dueDate: '15/06/2024',
      },
      {
        id: 7,
        name: 'Design review',
        assignees: [JANE_SMITH, SAM_LEE],
        status: Status.New,
        startDate: '16/06/2024',
        dueDate: '20/06/2024',
      },
      {
        id: 8,
        name: '1369667897: Marketing request',
        assignees: [SAM_LEE],
        status: Status.New,
        startDate: '05/06/2024',
        dueDate: '10/06/2024',
      },
    ],
  },
];