import React, { useState, useEffect } from 'react';
import { Task, Progress } from '../types';
import { XIcon, ArrowUpIcon, ArrowDownIcon, MoreHorizontalIcon } from './Icons';
import { InteractiveProgressChart } from './TaskElements';

interface ItemDetailsPanelProps {
  task: Task | null;
  onClose: () => void;
}

const ProgressStats: React.FC<{ progress: Progress }> = ({ progress }) => {
  const { percentage, history = [] } = progress;

  let trend: 'up' | 'down' | 'flat' = 'flat';
  if (history.length > 1) {
    const start = history[0];
    const end = history[history.length - 1];
    if (end > start) trend = 'up';
    else if (end < start) trend = 'down';
  }
  
  const trendInfo = {
    up: { text: "Trending Up", icon: ArrowUpIcon, color: "text-green-600" },
    down: { text: "Trending Down", icon: ArrowDownIcon, color: "text-red-600" },
    flat: { text: "Flat", icon: MoreHorizontalIcon, color: "text-gray-600" },
  };
  const TrendIcon = trendInfo[trend].icon;

  return (
    <div className="flex items-center gap-6">
      <div>
        <div className="text-xs text-gray-500">Current Progress</div>
        <div className="text-2xl font-bold text-gray-800">{percentage}%</div>
      </div>
      <div>
        <div className="text-xs text-gray-500">Trend</div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${trendInfo[trend].color}`}>
          <TrendIcon className="w-4 h-4" />
          <span>{trendInfo[trend].text}</span>
        </div>
      </div>
    </div>
  );
};

const ItemDetailsPanel: React.FC<ItemDetailsPanelProps> = ({ task, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (task) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [task]);
  
  const handleClose = () => {
    setIsOpen(false);
    // Delay onClose to allow for transition
    setTimeout(onClose, 300);
  };

  return (
    <aside
      className={`absolute top-0 right-0 h-full bg-white border-l border-gray-200 z-30 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: '400px' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-panel-title"
    >
      {task && (
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
            <h2 id="details-panel-title" className="text-lg font-semibold text-gray-800 truncate">{task.name}</h2>
            <button onClick={handleClose} className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800" aria-label="Close details">
              <XIcon className="w-5 h-5" />
            </button>
          </header>
          <div className="flex-grow p-6 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Details</h3>
            
            {task.progress && (
                <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Progress Overview</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="mb-4">
                            <ProgressStats progress={task.progress} />
                        </div>
                        <InteractiveProgressChart progress={task.progress} />
                    </div>
                </div>
            )}
            
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-gray-500">Status</dt>
                <dd className="text-sm font-medium text-gray-800">{task.status}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Assignees</dt>
                <dd className="text-sm font-medium text-gray-800">{task.assignees.map(a => a.name).join(', ')}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Dates</dt>
                <dd className="text-sm font-medium text-gray-800">{task.startDate} - {task.dueDate}</dd>
              </div>
               {task.priority && (
                 <div>
                    <dt className="text-xs text-gray-500">Priority</dt>
                    <dd className="text-sm font-medium text-gray-800">{task.priority}</dd>
                </div>
              )}
               {task.impact && (
                 <div>
                    <dt className="text-xs text-gray-500">Impact</dt>
                    <dd className="text-sm font-medium text-gray-800">{task.impact}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </aside>
  );
};

export default ItemDetailsPanel;