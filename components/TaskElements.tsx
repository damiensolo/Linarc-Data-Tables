import React, { useRef, useEffect } from 'react';
// FIX: Import Priority and Impact types.
import { Assignee, Status, Priority, Impact } from '../types';
import { ChevronDownIcon } from './Icons';

interface PillProps {
    children: React.ReactNode;
    colorClasses: string;
    title?: string;
}

export const Pill: React.FC<PillProps> = ({ children, colorClasses, title }) => (
  <span title={title} className={`px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5 ${colorClasses} overflow-hidden w-full`}>
    {children}
  </span>
);

const statusDotStyles: Record<Status, string> = {
  [Status.InProgress]: 'bg-cyan-500',
  [Status.Completed]: 'bg-green-500',
  [Status.InReview]: 'bg-yellow-500',
  [Status.Planned]: 'bg-blue-500',
  [Status.New]: 'bg-sky-500',
};

export const StatusDisplay: React.FC<{ status: Status }> = ({ status }) => {
  return (
    <div className="flex items-center gap-2" title={status}>
      <span className={`w-2.5 h-2.5 rounded-full ${statusDotStyles[status]}`}></span>
      <span className="text-gray-600 font-medium">{status}</span>
    </div>
  );
};

export const StatusSelector: React.FC<{
  currentStatus: Status;
  onChange: (newStatus: Status) => void;
  onBlur: () => void;
}> = ({ currentStatus, onChange, onBlur }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onBlur();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onBlur]);

  const handleSelect = (status: Status) => {
    onChange(status);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
      <div className="w-full h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${statusDotStyles[currentStatus]}`}></span>
            <span className="text-gray-800 font-medium">{currentStatus}</span>
        </div>
        <ChevronDownIcon className="w-4 h-4 text-gray-500" />
      </div>
      <ul
        className="absolute top-full left-0 mt-1 w-full min-w-max bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden"
      >
        {Object.values(Status).map((s) => (
          <li
            key={s}
            onMouseDown={() => handleSelect(s)}
            className={`px-3 py-1.5 text-sm cursor-pointer flex items-center gap-2 ${
              s === currentStatus 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-800 hover:bg-indigo-500 hover:text-white'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${statusDotStyles[s]}`}></span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AssigneeAvatar: React.FC<{ assignee: Assignee }> = ({ assignee }) => (
    <div title={assignee.name} className={`w-6 h-6 rounded-full ${assignee.avatarColor} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white`}>
        {assignee.initials}
    </div>
);

// FIX: Add and export ImpactPill component.
export const ImpactPill: React.FC<{ impact: Impact }> = ({ impact }) => {
    const impactStyles: Record<Impact, { text: string, bg: string }> = {
        [Impact.High]: { text: 'text-red-800', bg: 'bg-red-100' },
        [Impact.Medium]: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
        [Impact.Low]: { text: 'text-green-800', bg: 'bg-green-100' },
    };
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${impactStyles[impact].bg} ${impactStyles[impact].text}`}>
            {impact} Impact
        </span>
    );
};

// FIX: Add and export PrioritySelector component.
export const PrioritySelector: React.FC<{
  taskId: number;
  currentPriority?: Priority;
  onPriorityChange: (taskId: number, priority: Priority) => void;
}> = ({ taskId, currentPriority, onPriorityChange }) => {
  const priorities = Object.values(Priority);

  const priorityColors: Record<Priority, string> = {
    [Priority.Urgent]: 'text-red-600',
    [Priority.High]: 'text-orange-600',
    [Priority.Medium]: 'text-yellow-600',
    [Priority.Low]: 'text-blue-600',
    [Priority.None]: 'text-gray-500',
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPriorityChange(taskId, e.target.value as Priority);
  };
  
  if(!currentPriority) {
    return <div className="h-6" />;
  }

  return (
    <div className="relative">
      <select
        value={currentPriority}
        onChange={handleSelectChange}
        className={`appearance-none bg-transparent border-none text-sm font-medium focus:ring-0 p-1 rounded-md hover:bg-gray-100 w-full text-left ${priorityColors[currentPriority]}`}
      >
        {priorities.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
};