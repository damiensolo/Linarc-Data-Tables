import React from 'react';
import { Task, Priority } from '../types';
import GanttRow from './GanttRow';

// Date helpers
export const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

export const getDaysDiff = (date1: Date, date2: Date): number => {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};


const GanttChartView: React.FC<{ tasks: Task[]; onToggle: (taskId: number) => void; onPriorityChange: (taskId: number, priority: Priority) => void; }> = ({ tasks, onToggle, onPriorityChange }) => {
    const flatten = (tasks: Task[]): Task[] => tasks.reduce((acc, task) => {
        acc.push(task);
        if (task.children) acc.push(...flatten(task.children));
        return acc;
    }, [] as Task[]);
    
    const allTasks = flatten(tasks);

    if (allTasks.length === 0) return <div className="p-4">No tasks to display.</div>;

    const projectStartDate = allTasks.reduce((min, task) => {
        const d = parseDate(task.startDate);
        return d < min ? d : min;
    }, parseDate(allTasks[0].startDate));

    const projectEndDate = allTasks.reduce((max, task) => {
        const d = parseDate(task.dueDate);
        return d > max ? d : max;
    }, parseDate(allTasks[0].dueDate));

    const totalDays = getDaysDiff(projectStartDate, projectEndDate) + 1;
    const dayWidth = 40;
    const taskListWidth = 350;

    const timelineHeaders: { month: string; year: number; days: number }[] = [];
    let currentDate = new Date(projectStartDate);
    while (currentDate <= projectEndDate) {
        const month = currentDate.toLocaleString('default', { month: 'short' });
        const year = currentDate.getFullYear();
        
        let header = timelineHeaders.find(h => h.month === month && h.year === year);
        if (!header) {
            header = { month, year, days: 0 };
            timelineHeaders.push(header);
        }
        header.days += 1;
        currentDate = addDays(currentDate, 1);
    }

    return (
        <div className="w-full overflow-x-auto h-full">
            <div className="relative" style={{ minWidth: `${totalDays * dayWidth + taskListWidth}px` }}>
                <div className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                    <div className="flex h-12">
                        <div className="font-medium text-gray-600 text-sm flex items-center p-4 border-r border-gray-200" style={{ width: `${taskListWidth}px`}}>Task Name</div>
                        <div className="flex-1">
                            <div className="relative h-6 flex border-b border-gray-200">
                                {timelineHeaders.map(({ month, year, days }) => (
                                    <div key={`${month}-${year}`} className="text-center text-sm font-medium text-gray-700 border-r border-gray-200 flex items-center justify-center" style={{ width: `${days * dayWidth}px` }}>
                                        {month} '{String(year).slice(-2)}
                                    </div>
                                ))}
                            </div>
                             <div className="relative h-6 flex">
                                {Array.from({ length: totalDays }).map((_, i) => {
                                    const date = addDays(projectStartDate, i);
                                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                    const dayOfWeek = date.toLocaleDateString('default', { weekday: 'short' })[0];
                                    return (
                                        <div key={i} className={`flex flex-col items-center justify-center text-xs border-r border-gray-200 ${isWeekend ? 'bg-gray-100' : ''}`} style={{ width: `${dayWidth}px` }}>
                                            <span className="text-gray-400 text-[10px]">{dayOfWeek}</span>
                                            <span>{date.getDate()}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute top-0 h-full grid" style={{ left: `${taskListWidth}px`, gridTemplateColumns: `repeat(${totalDays}, ${dayWidth}px)`, width: `${totalDays * dayWidth}px`}}>
                         {Array.from({ length: totalDays }).map((_, i) => {
                            const date = addDays(projectStartDate, i);
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                             return <div key={i} className={`h-full border-r border-gray-200 ${isWeekend ? 'bg-gray-100/50' : ''}`}></div>
                         })}
                    </div>

                    <div>
                        {tasks.map(task => (
                            <GanttRow
                                key={task.id}
                                task={task}
                                level={0}
                                onToggle={onToggle}
                                projectStartDate={projectStartDate}
                                dayWidth={dayWidth}
                                taskListWidth={taskListWidth}
                                onPriorityChange={onPriorityChange}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttChartView;