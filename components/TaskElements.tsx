

import React, { useRef, useEffect, useState } from 'react';
// FIX: Add useState to React import, and import Priority, Impact types and additional icons to support new components.
import { Assignee, Status, Priority, Impact } from '../types';
import { ChevronDownIcon, ArrowUpIcon, ArrowDownIcon, MoreHorizontalIcon } from './Icons';

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

// FIX: Implement and export ImpactPill component to display a task's impact level.
export const ImpactPill: React.FC<{ impact: Impact }> = ({ impact }) => {
    const impactStyles: Record<Impact, { bg: string; text: string; dot: string }> = {
        [Impact.High]: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
        [Impact.Medium]: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
        [Impact.Low]: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
    };
    const style = impactStyles[impact];
    if (!style) return null;

    return (
        <Pill colorClasses={`${style.bg} ${style.text}`} title={`Impact: ${impact}`}>
            <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
            <span>{impact}</span>
        </Pill>
    );
};

const statusDotStyles: Record<Status, string> = {
  [Status.InProgress]: 'bg-cyan-500',
  [Status.Completed]: 'bg-green-500',
  [Status.InReview]: 'bg-yellow-500',
  [Status.Planned]: 'bg-blue-500',
  [Status.New]: 'bg-sky-500',
};

export const StatusDisplay: React.FC<{ status: Status }> = ({ status }) => {
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 w-full" title={status}>
      <span className={`w-2.5 h-2.5 rounded-full ${statusDotStyles[status]} flex-shrink-0`}></span>
      <div className="min-w-0">
        <p className="text-gray-600 font-medium truncate">{status}</p>
      </div>
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

// FIX: Implement and export PrioritySelector component to display and edit a task's priority.
const priorityStyles: Record<Priority, { icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string; name: string }> = {
    [Priority.Urgent]: { icon: ArrowUpIcon, color: 'text-red-600', name: 'Urgent' },
    [Priority.High]: { icon: ArrowUpIcon, color: 'text-orange-600', name: 'High' },
    [Priority.Medium]: { icon: MoreHorizontalIcon, color: 'text-yellow-600', name: 'Medium' },
    [Priority.Low]: { icon: ArrowDownIcon, color: 'text-green-600', name: 'Low' },
    [Priority.None]: { icon: MoreHorizontalIcon, color: 'text-gray-500', name: 'None' },
};

export const PrioritySelector: React.FC<{
  taskId: number;
  currentPriority?: Priority;
  onPriorityChange: (taskId: number, newPriority: Priority) => void;
}> = ({ taskId, currentPriority = Priority.None, onPriorityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (priority: Priority) => {
    onPriorityChange(taskId, priority);
    setIsOpen(false);
  };

  const { icon: CurrentPriorityIcon, color: currentPriorityColor, name: currentPriorityName } = priorityStyles[currentPriority] || priorityStyles[Priority.None];

  return (
    <div ref={containerRef} className="relative w-full h-full" onClick={(e) => { e.stopPropagation(); setIsOpen(p => !p); }}>
      <div className="w-full h-full flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-100">
        <CurrentPriorityIcon className={`w-4 h-4 ${currentPriorityColor}`} />
        <span className="text-gray-800 font-medium">{currentPriorityName}</span>
      </div>
      {isOpen && (
      <ul
        className="absolute top-full left-0 mt-1 w-full min-w-max bg-white rounded-md shadow-lg border border-gray-200 z-50 overflow-hidden"
      >
        {Object.values(Priority).map((p) => {
          const { icon: Icon, color, name } = priorityStyles[p];
          return (
            <li
              key={p}
              onMouseDown={() => handleSelect(p)}
              className={`px-3 py-1.5 text-sm cursor-pointer flex items-center gap-2 ${
                p === currentPriority
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-800 hover:bg-indigo-500 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${p === currentPriority ? 'text-white' : color}`} />
              <span>{name}</span>
            </li>
          );
        })}
      </ul>
      )}
    </div>
  );
};


export const AssigneeAvatar: React.FC<{ assignee: Assignee }> = ({ assignee }) => (
    <div title={assignee.name} className={`w-5 h-5 rounded-full ${assignee.avatarColor} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white`}>
        {assignee.initials}
    </div>
);