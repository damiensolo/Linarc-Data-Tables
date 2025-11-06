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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);
  
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
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const isAfter = e.clientY > rect.top + rect.height / 2;
    
    setDropIndicatorIndex(isAfter ? index + 1 : index);
  };
  
  const handleDrop = () => {
    if (draggedIndex === null || dropIndicatorIndex === null || draggedIndex === dropIndicatorIndex) {
      // no change or invalid drop
    } else {
        setColumns(prev => {
            const newColumns = [...prev];
            const [removed] = newColumns.splice(draggedIndex, 1);
            const adjustedDropIndex = draggedIndex < dropIndicatorIndex ? dropIndicatorIndex - 1 : dropIndicatorIndex;
            newColumns.splice(adjustedDropIndex, 0, removed);
            return newColumns;
        });
    }
    setDraggedIndex(null);
    setDropIndicatorIndex(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDropIndicatorIndex(null);
      }
  };

  return (
    <div ref={menuRef} className="absolute top-full right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-30">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">Customize fields</h3>
        <p className="text-xs text-gray-500">Toggle visibility and reorder.</p>
      </div>
      <ul className="py-2" onDragLeave={handleDragLeave}>
        {columns.map((column, index) => (
          <React.Fragment key={column.id}>
             {dropIndicatorIndex === index && (
                <li className="h-0.5 bg-blue-500 mx-3 my-1"></li>
              )}
            <li
              className={`flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 ${draggedIndex === index ? 'opacity-50' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={handleDrop}
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
          </React.Fragment>
        ))}
        {dropIndicatorIndex === columns.length && (
            <li className="h-0.5 bg-blue-500 mx-3 my-1"></li>
        )}
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