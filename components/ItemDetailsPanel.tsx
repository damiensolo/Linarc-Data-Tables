
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { XIcon } from './Icons';

interface ItemDetailsPanelProps {
  task: Task | null;
  onClose: () => void;
}

const ItemDetailsPanel: React.FC<ItemDetailsPanelProps> = ({ task, onClose }) => {
  const [displayedTask, setDisplayedTask] = useState<Task | null>(task);
  const [isVisible, setIsVisible] = useState(!!task);

  useEffect(() => {
    if (task) {
      setDisplayedTask(task);
      setIsVisible(true);
    } else {
      setIsVisible(false);
      // Wait for animation to finish before clearing content
      const timer = setTimeout(() => {
        setDisplayedTask(null);
      }, 300); // This duration must match the CSS transition duration

      return () => clearTimeout(timer);
    }
  }, [task]);

  return (
    <aside
      className={`absolute top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg transition-transform duration-300 ease-in-out z-40 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-hidden={!isVisible}
      role="dialog"
      aria-labelledby="item-details-heading"
    >
      {displayedTask && (
        <div className="flex flex-col h-full">
          <header className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
            <h2 id="item-details-heading" className="text-lg font-semibold text-gray-800">Item Details</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close details panel"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </header>
          <div className="p-6 overflow-y-auto flex-grow">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Task Name</h3>
                <p className="mt-1 text-gray-800">{displayedTask.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-gray-800">{displayedTask.status}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assignees</h3>
                <p className="mt-1 text-gray-800">{displayedTask.assignees.map(a => a.name).join(', ')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dates</h3>
                <p className="mt-1 text-gray-800">{displayedTask.startDate} - {displayedTask.dueDate}</p>
              </div>
              {displayedTask.priority && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                  <p className="mt-1 text-gray-800">{displayedTask.priority}</p>
                </div>
              )}
              {displayedTask.impact && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Impact</h3>
                  <p className="mt-1 text-gray-800">{displayedTask.impact}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ItemDetailsPanel;
