import React, { useRef, useEffect, useCallback } from 'react';
import { Task, Column, ColumnId } from '../types';
import TableRow from './TableRow';

interface ProjectTableProps {
  tasks: Task[];
  onToggle: (taskId: number) => void;
  selectedTaskIds: Set<number>;
  visibleTaskIds: number[];
  onToggleRow: (taskId: number) => void;
  onToggleAll: () => void;
  rowNumberMap: Map<number, number>;
  editingCell: { taskId: number; column: string } | null;
  onEditCell: (cell: { taskId: number; column: string } | null) => void;
  onUpdateTask: (taskId: number, updatedValues: Partial<Omit<Task, 'id' | 'children'>>) => void;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
}

const Resizer: React.FC<{ onMouseDown: (e: React.MouseEvent) => void }> = ({ onMouseDown }) => (
  <div
    onMouseDown={onMouseDown}
    className="absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-blue-400 group-hover:bg-blue-400"
    style={{ zIndex: 10 }}
  />
);


const ProjectTable: React.FC<ProjectTableProps> = ({ 
  tasks, 
  onToggle, 
  selectedTaskIds, 
  visibleTaskIds, 
  onToggleRow, 
  onToggleAll, 
  rowNumberMap,
  editingCell,
  onEditCell,
  onUpdateTask,
  columns,
  setColumns,
}) => {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLTableRowElement>(null);
  const activeResizerId = useRef<ColumnId | null>(null);

  const numVisible = visibleTaskIds.length;
  const numSelected = visibleTaskIds.filter(id => selectedTaskIds.has(id)).length;

  const isAllSelected = numVisible > 0 && numSelected === numVisible;
  const isSomeSelected = numSelected > 0 && numSelected < numVisible;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const handleResize = useCallback((columnId: ColumnId, newWidth: number) => {
    setColumns(prev => prev.map(c => c.id === columnId ? { ...c, width: `${newWidth}px` } : c));
  }, [setColumns]);

  const onMouseDown = (columnId: ColumnId) => (e: React.MouseEvent) => {
    e.preventDefault();
    activeResizerId.current = columnId;
    
    const thElement = (e.target as HTMLElement).parentElement;
    if (!thElement) return;

    const startPos = e.clientX;
    const startWidth = thElement.offsetWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (activeResizerId.current !== columnId) return;
      const newWidth = startWidth + (moveEvent.clientX - startPos);
      if (newWidth > 60) { // Minimum width
        handleResize(columnId, newWidth);
      }
    };

    const onMouseUp = () => {
      activeResizerId.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('grabbing');
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    document.body.classList.add('grabbing');
  };

  const visibleColumns = columns.filter(c => c.visible);

  return (
    <table className="text-sm text-left text-gray-500 whitespace-nowrap border-separate border-spacing-0">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-20">
        <tr ref={headerRef}>
          <th scope="col" className="sticky left-0 bg-gray-50 z-30 py-2 px-2 w-10 border-b border-gray-200 shadow-[1px_0_0_#e5e7eb]">
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
          {visibleColumns.map((col) => (
            <th 
              key={col.id} 
              scope="col" 
              className="py-2 px-6 font-medium border-b border-gray-200 relative group"
              style={{ width: col.width, zIndex: 5 }}
            >
              {col.label}
              <Resizer onMouseDown={onMouseDown(col.id)} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <TableRow 
            key={task.id} 
            task={task} 
            level={0} 
            columns={visibleColumns}
            onToggle={onToggle} 
            rowNumberMap={rowNumberMap}
            selectedTaskIds={selectedTaskIds}
            onToggleRow={onToggleRow}
            editingCell={editingCell}
            onEditCell={onEditCell}
            onUpdateTask={onUpdateTask}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ProjectTable;