
import React, { useRef, useEffect } from 'react';
import { Task } from '../types';
import TableRow from './TableRow';

interface ProjectTableProps {
  tasks: Task[];
  onToggle: (taskId: number) => void;
  selectedTaskIds: Set<number>;
  visibleTaskIds: number[];
  onToggleRow: (taskId: number) => void;
  onToggleAll: () => void;
  rowNumberMap: Map<number, number>;
}

const ProjectTable: React.FC<ProjectTableProps> = ({ tasks, onToggle, selectedTaskIds, visibleTaskIds, onToggleRow, onToggleAll, rowNumberMap }) => {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const numVisible = visibleTaskIds.length;
  const numSelected = visibleTaskIds.filter(id => selectedTaskIds.has(id)).length;

  const isAllSelected = numVisible > 0 && numSelected === numVisible;
  const isSomeSelected = numSelected > 0 && numSelected < numVisible;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  return (
    <table className="w-full text-sm text-left text-gray-500 whitespace-nowrap table-fixed border-separate border-spacing-0">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-20">
        <tr>
          <th scope="col" className="sticky left-0 bg-gray-50 z-30 py-3 px-2 w-10 border-b border-gray-200 shadow-[1px_0_0_#e5e7eb]">
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                ref={headerCheckboxRef}
                checked={isAllSelected}
                onChange={onToggleAll}
                aria-label="Select all visible rows"
                aria-checked={isSomeSelected ? 'mixed' : (isAllSelected ? 'true' : 'false')}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </th>
          <th scope="col" className="py-3 px-6 font-medium border-b border-gray-200 w-[400px]">NAME</th>
          <th scope="col" className="py-3 px-6 font-medium border-b border-gray-200 w-[150px]">STATUS</th>
          <th scope="col" className="py-3 px-6 font-medium border-b border-gray-200 w-[120px]">ASSIGNEE</th>
          <th scope="col" className="py-3 px-6 font-medium border-b border-gray-200 w-[220px]">START DATE DUE DATE</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <TableRow 
            key={task.id} 
            task={task} 
            level={0} 
            onToggle={onToggle} 
            rowNumberMap={rowNumberMap}
            selectedTaskIds={selectedTaskIds}
            onToggleRow={onToggleRow}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ProjectTable;