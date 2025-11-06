
import React, { useState, useRef, useEffect } from 'react';
import { Column, ColumnId } from '../types';
import { GripVerticalIcon } from './Icons';

interface FieldsMenuProps {
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  onClose: () => void;
  onReset: () => void;
}

const FieldsMenu: React.FC<FieldsMenuProps> = ({ columns, setColumns, onClose, onReset }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<Column | null>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleVisibilityChange = (id: ColumnId) => {
    setColumns(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const handleDragStart = (item: Column) => {
    setDraggedItem(item);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (targetItem: Column) => {
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const newColumns = [...columns];
    const draggedIndex = newColumns.findIndex(c => c.id === draggedItem.id);
    const targetIndex = newColumns.findIndex(c => c.id === targetItem.id);

    const [removed] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, removed);
    
    setColumns(newColumns);
    setDraggedItem(null);
  };

  return (
    <div ref={menuRef} className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-30">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">Customize fields</h3>
        <p className="text-xs text-gray-500">Toggle visibility and reorder.</p>
      </div>
      <ul className="py-2">
        {columns.map((column) => (
          <li
            key={column.id}
            className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50"
            draggable
            onDragStart={() => handleDragStart(column)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column)}
          >
            <div className="flex items-center">
              <GripVerticalIcon className="w-5 h-5 text-gray-300 cursor-grab mr-1" />
              <label htmlFor={`field-${column.id}`} className="text-sm text-gray-700 cursor-pointer">{column.label}</label>
            </div>
            <input
              type="checkbox"
              id={`field-${column.id}`}
              checked={column.visible}
              onChange={() => handleVisibilityChange(column.id)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </li>
        ))}
      </ul>
      <div className="p-2 border-t border-gray-200">
        <button 
          onClick={onReset}
          className="w-full text-center text-sm font-medium text-gray-700 hover:text-indigo-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
};

export default FieldsMenu;