
import React, { Fragment } from 'react';
import { Task } from '../types';
import { ChevronRightIcon, ChevronDownIcon, DocumentIcon } from './Icons';
import { StatusDisplay, AssigneeAvatar } from './TaskElements';

interface TableRowProps {
  task: Task;
  level: number;
  onToggle: (taskId: number) => void;
  rowNumberMap: Map<number, number>;
  selectedTaskIds: Set<number>;
  onToggleRow: (taskId: number) => void;
}

const TableRow: React.FC<TableRowProps> = ({ task, level, onToggle, rowNumberMap, selectedTaskIds, onToggleRow }) => {
  const hasChildren = task.children && task.children.length > 0;
  const rowNum = rowNumberMap.get(task.id);
  const isSelected = selectedTaskIds.has(task.id);
  const taskNameId = `task-name-${task.id}`;

  return (
    <Fragment>
      <tr className={`bg-white group ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
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
        <td className="py-3 px-6 text-gray-800 font-medium border-b border-gray-200" style={{ width: '400px' }}>
            <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }} title={task.name}>
                <div className="w-6 h-6 flex items-center justify-center mr-1 flex-shrink-0">
                    {hasChildren ? (
                        <button
                            onClick={() => onToggle(task.id)}
                            className="text-gray-400 hover:text-gray-800"
                            aria-expanded={task.isExpanded}
                        >
                            {task.isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                        </button>
                    ) : (
                        <DocumentIcon className="w-4 h-4 text-gray-400"/>
                    )}
                </div>
                <span id={taskNameId} className={`truncate`}>{task.name}</span>
            </div>
        </td>
        <td className="py-3 px-6 border-b border-gray-200" style={{ width: '150px' }}>
            <StatusDisplay status={task.status} />
        </td>
        <td className="py-3 px-6 border-b border-gray-200" style={{ width: '120px' }}>
            <div className="flex items-center -space-x-2 overflow-hidden" title={task.assignees.map(a => a.name).join(', ')}>
                {task.assignees.map(a => <AssigneeAvatar key={a.id} assignee={a} />)}
            </div>
        </td>
        <td className="py-3 px-6 font-medium text-gray-600 border-b border-gray-200" style={{ width: '220px' }}>
            <div className="truncate" title={`${task.startDate} - ${task.dueDate}`}>
                {`${task.startDate}${task.dueDate}`}
            </div>
        </td>
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
        />
      ))}
    </Fragment>
  );
};

export default TableRow;