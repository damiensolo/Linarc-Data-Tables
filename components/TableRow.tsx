
import React, { Fragment, useEffect, useRef } from 'react';
import { Task, Status, Priority, Impact, Column, ColumnId } from '../types';
import { ChevronRightIcon, ChevronDownIcon, DocumentIcon } from './Icons';
import { StatusDisplay, AssigneeAvatar, StatusSelector, PrioritySelector, ImpactPill } from './TaskElements';

interface TableRowProps {
  task: Task;
  level: number;
  onToggle: (taskId: number) => void;
  rowNumberMap: Map<number, number>;
  selectedTaskIds: Set<number>;
  onToggleRow: (taskId: number) => void;
  editingCell: { taskId: number; column: string } | null;
  onEditCell: (cell: { taskId: number; column: string } | null) => void;
  onUpdateTask: (taskId: number, updatedValues: Partial<Omit<Task, 'id' | 'children'>>) => void;
  columns: Column[];
}

const toInputFormat = (date: string): string => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return '';
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

const fromInputFormat = (date: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

// --- Cell Content Components ---

const SelectionCell: React.FC<{ task: Task, isSelected: boolean, onToggleRow: (id: number) => void, rowNum?: number }> = ({ task, isSelected, onToggleRow, rowNum }) => {
  const taskNameId = `task-name-${task.id}`;
  return (
    <td className={`sticky left-0 z-10 py-3 px-2 w-10 text-center text-gray-500 border-b border-gray-200 shadow-[1px_0_0_#e5e7eb] ${isSelected ? 'bg-indigo-50 group-hover:bg-indigo-100' : 'bg-white group-hover:bg-gray-50'}`}>
        <div className="flex items-center justify-center h-full">
            <span className={isSelected ? 'hidden' : 'group-hover:hidden'}>{rowNum}</span>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleRow(task.id)}
              aria-labelledby={taskNameId}
              className={`h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mx-auto ${isSelected ? 'block' : 'hidden group-hover:block'}`}
            />
        </div>
    </td>
  );
};

const NameCellContent: React.FC<{ task: Task, level: number, isEditing: boolean, onEdit: (cell: { taskId: number; column: string } | null) => void, onUpdateTask: TableRowProps['onUpdateTask'], onToggle: (id: number) => void }> = ({ task, level, isEditing, onEdit, onUpdateTask, onToggle }) => {
    const hasChildren = task.children && task.children.length > 0;
    const nameInputRef = useRef<HTMLInputElement>(null);
    const taskNameId = `task-name-${task.id}`;

    useEffect(() => {
        if (isEditing) {
            nameInputRef.current?.focus();
            nameInputRef.current?.select();
        }
    }, [isEditing]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => onUpdateTask(task.id, { name: e.target.value });
    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape') onEdit(null);
    };

    return (
        <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
            <div className="w-6 h-6 flex items-center justify-center mr-1 flex-shrink-0">
                {hasChildren ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
                        className="text-gray-400 hover:text-gray-800"
                        aria-expanded={task.isExpanded}
                    >
                        {task.isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                    </button>
                ) : (
                    <DocumentIcon className="w-4 h-4 text-gray-400"/>
                )}
            </div>
            {isEditing ? (
                <input
                    ref={nameInputRef}
                    type="text"
                    value={task.name}
                    onChange={handleNameChange}
                    onBlur={() => onEdit(null)}
                    onKeyDown={handleNameKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent border-0 p-0 focus:ring-0 focus:outline-none text-gray-800 font-medium"
                />
            ) : (
                <span id={taskNameId} className="truncate text-gray-800 font-medium" title={task.name}>{task.name}</span>
            )}
        </div>
    );
};

const StatusCellContent: React.FC<{ task: Task, isEditing: boolean, onEdit: (cell: { taskId: number; column: string } | null) => void, onUpdateTask: TableRowProps['onUpdateTask'] }> = ({ task, isEditing, onEdit, onUpdateTask }) => {
    const handleStatusChange = (newStatus: Status) => {
        onUpdateTask(task.id, { status: newStatus });
        onEdit(null);
    };

    return isEditing ? (
        <StatusSelector 
            currentStatus={task.status} 
            onChange={handleStatusChange} 
            onBlur={() => onEdit(null)}
        />
    ) : (
        <StatusDisplay status={task.status} />
    );
};

const AssigneeCellContent: React.FC<{ task: Task }> = ({ task }) => (
    <div className="flex items-center -space-x-2 overflow-hidden" title={task.assignees.map(a => a.name).join(', ')}>
        {task.assignees.map(a => <AssigneeAvatar key={a.id} assignee={a} />)}
    </div>
);

const DateCellContent: React.FC<{ task: Task, isEditing: boolean, onEdit: (cell: { taskId: number; column: string } | null) => void, onUpdateTask: TableRowProps['onUpdateTask'] }> = ({ task, isEditing, onEdit, onUpdateTask }) => {
    const handleDateChange = (field: 'startDate' | 'dueDate', value: string) => {
        if (value) {
            onUpdateTask(task.id, { [field]: fromInputFormat(value) });
        }
    };

    return isEditing ? (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
           <input 
               type="date"
               value={toInputFormat(task.startDate)}
               onChange={(e) => handleDateChange('startDate', e.target.value)}
               onBlur={() => onEdit(null)}
               className="w-full bg-transparent border-0 p-0 focus:ring-0 focus:outline-none text-sm font-medium text-gray-600"
           />
            <input 
               type="date"
               value={toInputFormat(task.dueDate)}
               onChange={(e) => handleDateChange('dueDate', e.target.value)}
               onBlur={() => onEdit(null)}
               className="w-full bg-transparent border-0 p-0 focus:ring-0 focus:outline-none text-sm font-medium text-gray-600"
           />
        </div>
    ) : (
       <div className="truncate font-medium text-gray-600" title={`${task.startDate} - ${task.dueDate}`}>
           {`${task.startDate} - ${task.dueDate}`}
       </div>
   );
};

const PriorityCellContent: React.FC<{ task: Task, onUpdateTask: TableRowProps['onUpdateTask'] }> = ({ task, onUpdateTask }) => {
  const handlePriorityChange = (priority: Priority) => {
    onUpdateTask(task.id, { priority });
  };
  return (
    <PrioritySelector taskId={task.id} currentPriority={task.priority} onPriorityChange={(_, p) => handlePriorityChange(p)} />
  );
};

const ImpactCellContent: React.FC<{ task: Task }> = ({ task }) => (
    task.impact ? <ImpactPill impact={task.impact} /> : null
);

const editableCellClass = (isEditing: boolean) => {
  const base = "py-3 px-6 border-b border-gray-200 cursor-pointer h-full";
  if (isEditing) {
    return `${base} border-b-transparent outline-blue-600 outline outline-2 -outline-offset-2`;
  }
  return `${base} hover:outline-blue-400 hover:outline hover:outline-1 hover:-outline-offset-1`;
};

const TableRow: React.FC<TableRowProps> = ({ task, level, onToggle, rowNumberMap, selectedTaskIds, onToggleRow, editingCell, onEditCell, onUpdateTask, columns }) => {
  const hasChildren = task.children && task.children.length > 0;
  const isSelected = selectedTaskIds.has(task.id);
  const rowNum = rowNumberMap.get(task.id);

  const getCellContent = (columnId: ColumnId) => {
      const isEditing = editingCell?.taskId === task.id && editingCell?.column === columnId;
      switch (columnId) {
          case 'name':
              return <NameCellContent task={task} level={level} isEditing={isEditing} onEdit={onEditCell} onUpdateTask={onUpdateTask} onToggle={onToggle} />;
          case 'status':
              return <StatusCellContent task={task} isEditing={isEditing} onEdit={onEditCell} onUpdateTask={onUpdateTask} />;
          case 'assignee':
              return <AssigneeCellContent task={task} />;
          case 'dates':
              return <DateCellContent task={task} isEditing={isEditing} onEdit={onEditCell} onUpdateTask={onUpdateTask} />;
          case 'priority':
              return <PriorityCellContent task={task} onUpdateTask={onUpdateTask} />;
          case 'impact':
              return <ImpactCellContent task={task} />;
          default:
              return null;
      }
  };
  
  const isColumnEditable = (columnId: ColumnId) => ['name', 'status', 'dates', 'priority'].includes(columnId);

  return (
    <Fragment>
      <tr className={`bg-white group ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
        <SelectionCell 
            task={task} 
            isSelected={isSelected} 
            onToggleRow={onToggleRow}
            rowNum={rowNum}
        />
        {columns.map(col => {
            const isEditing = editingCell?.taskId === task.id && editingCell?.column === col.id;
            const isEditable = isColumnEditable(col.id);
            return (
                 <td 
                    key={col.id}
                    className={isEditable ? editableCellClass(isEditing) : "py-3 px-6 border-b border-gray-200"}
                    onClick={isEditable && !isEditing ? () => onEditCell({ taskId: task.id, column: col.id }) : undefined}
                >
                    {getCellContent(col.id)}
                </td>
            )
        })}
      </tr>
      {hasChildren && task.isExpanded && task.children?.map(child => (
        <TableRow 
            key={child.id} 
            task={child} 
            level={level + 1} 
            onToggle={onToggle} 
            rowNumberMap={rowNumberMap}
            selectedTaskIds={selectedTaskIds}
            onToggleRow={onToggleRow}
            editingCell={editingCell}
            onEditCell={onEditCell}
            onUpdateTask={onUpdateTask}
            columns={columns}
        />
      ))}
    </Fragment>
  );
};

export default TableRow;