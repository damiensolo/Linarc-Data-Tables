
import React, { useState, useCallback, useMemo } from 'react';
import { MOCK_TASKS } from './constants';
import { Task } from './types';
import ProjectTable from './components/ProjectTable';
import { TableIcon, PlusIcon, SearchIcon } from './components/Icons';


const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set<number>());

  const onSelectionChange = (selectedRowIds: string[]) => {
    console.log('onSelectionChange emitted:', selectedRowIds);
  };

  const toggleTaskExpansion = useCallback((taskId: number) => {
    const updateExpansion = (currentTasks: Task[]): Task[] => {
      return currentTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, isExpanded: !task.isExpanded };
        }
        if (task.children) {
          return { ...task, children: updateExpansion(task.children) };
        }
        return task;
      });
    };
    setTasks(prevTasks => updateExpansion(prevTasks));
  }, []);

  const filteredTasks = useMemo(() => {
    if (!searchQuery) {
        return tasks;
    }
    const lowercasedQuery = searchQuery.toLowerCase();

    const filterRecursively = (taskArray: Task[]): Task[] => {
        const result: Task[] = [];
        for (const task of taskArray) {
            let childrenMatch = false;
            let filteredChildren: Task[] | undefined = undefined;

            if (task.children) {
                filteredChildren = filterRecursively(task.children);
                if (filteredChildren.length > 0) {
                    childrenMatch = true;
                }
            }

            const selfMatch = task.name.toLowerCase().includes(lowercasedQuery) ||
                              task.assignees.some(a => a.name.toLowerCase().includes(lowercasedQuery));

            if (selfMatch || childrenMatch) {
                result.push({
                    ...task,
                    isExpanded: childrenMatch || task.isExpanded, // Auto-expand parent if a child matches
                    children: filteredChildren,
                });
            }
        }
        return result;
    };
    return filterRecursively(tasks);
  }, [tasks, searchQuery]);

  const visibleTaskIds = useMemo(() => {
    const getVisibleIds = (currentTasks: Task[]): number[] => {
      let ids: number[] = [];
      for (const task of currentTasks) {
        ids.push(task.id);
        if (task.isExpanded && task.children) {
          ids = [...ids, ...getVisibleIds(task.children)];
        }
      }
      return ids;
    };
    return getVisibleIds(filteredTasks);
  }, [filteredTasks]);
  
  const rowNumberMap = useMemo(() => {
    const map = new Map<number, number>();
    let counter = 1;
    const generateMap = (currentTasks: Task[]) => {
      for (const task of currentTasks) {
        map.set(task.id, counter++);
        if (task.children) {
          generateMap(task.children);
        }
      }
    };
    generateMap(filteredTasks);
    return map;
  }, [filteredTasks]);

  const handleToggleRow = useCallback((taskId: number) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      onSelectionChange(Array.from(newSet).map(String));
      return newSet;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedTaskIds(prev => {
      const allVisibleSelected = visibleTaskIds.every(id => prev.has(id));
      if (allVisibleSelected) {
        const newSet = new Set(prev);
        visibleTaskIds.forEach(id => newSet.delete(id));
        onSelectionChange(Array.from(newSet).map(String));
        return newSet;
      } else {
        const newSet = new Set(prev);
        visibleTaskIds.forEach(id => newSet.add(id));
        onSelectionChange(Array.from(newSet).map(String));
        return newSet;
      }
    });
  }, [visibleTaskIds]);


  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{height: 'calc(100vh - 4rem)'}}>
        <header className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <div 
                className={`px-3 py-1.5 text-sm font-medium flex items-center gap-2 bg-white rounded-md shadow-sm border border-gray-200 text-gray-800`}
              >
                <TableIcon className="w-4 h-4" />
                Table
              </div>
            </div>
             <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 w-64"
                />
            </div>
          </div>
        </header>
        <main className="overflow-auto flex-grow">
          <ProjectTable 
              tasks={filteredTasks} 
              onToggle={toggleTaskExpansion} 
              selectedTaskIds={selectedTaskIds}
              visibleTaskIds={visibleTaskIds}
              onToggleRow={handleToggleRow}
              onToggleAll={handleToggleAll}
              rowNumberMap={rowNumberMap}
          />
        </main>
        <footer className="p-2 border-t border-gray-200 flex-shrink-0">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1.5 rounded-md hover:bg-gray-100">
            <PlusIcon className="w-4 h-4" />
            Item
            <span className="text-xs text-gray-400 font-mono">^⇧N</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;