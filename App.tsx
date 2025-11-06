
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MOCK_TASKS, DEFAULT_COLUMNS } from './constants';
import { Task, Column } from './types';
import ProjectTable from './components/ProjectTable';
import { PlusIcon, SearchIcon } from './components/Icons';
import FieldsMenu from './components/FieldsMenu';

const COLUMNS_STORAGE_KEY = 'project-table-columns-config';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set<number>());
  const [editingCell, setEditingCell] = useState<{ taskId: number; column: string } | null>(null);
  const [isFieldsMenuOpen, setIsFieldsMenuOpen] = useState(false);

  const [columns, setColumns] = useState<Column[]>(() => {
    try {
      const savedColumns = localStorage.getItem(COLUMNS_STORAGE_KEY);
      return savedColumns ? JSON.parse(savedColumns) : DEFAULT_COLUMNS;
    } catch (error) {
      console.error("Failed to parse columns from localStorage", error);
      return DEFAULT_COLUMNS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columns));
    } catch (error) {
      console.error("Failed to save columns to localStorage", error);
    }
  }, [columns]);

  const onSelectionChange = (selectedRowIds: string[]) => {
    console.log('onSelectionChange emitted:', selectedRowIds);
  };
  
  const handleResetColumns = () => {
    setColumns(DEFAULT_COLUMNS);
    setIsFieldsMenuOpen(false);
  };

  const handleUpdateTask = useCallback((taskId: number, updatedValues: Partial<Omit<Task, 'id' | 'children'>>) => {
    const updateRecursively = (currentTasks: Task[]): Task[] => {
      return currentTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updatedValues };
        }
        if (task.children) {
          return { ...task, children: updateRecursively(task.children) };
        }
        return task;
      });
    };
    setTasks(prevTasks => updateRecursively(prevTasks));
  }, []);

  const toggleTaskExpansion = useCallback((taskId: number) => {
    setEditingCell(null);
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
                    isExpanded: childrenMatch || task.isExpanded,
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
                className={`px-3 py-1.5 text-sm font-medium flex items-center bg-white rounded-md shadow-sm border border-gray-200 text-gray-800`}
              >
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
           <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsFieldsMenuOpen(prev => !prev)}
                  className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100"
                >
                  Fields
                </button>
                {isFieldsMenuOpen && (
                  <FieldsMenu 
                    columns={columns}
                    setColumns={setColumns}
                    onClose={() => setIsFieldsMenuOpen(false)}
                    onReset={handleResetColumns}
                  />
                )}
              </div>
            </div>
        </header>
        <main className="overflow-auto flex-grow">
          <ProjectTable 
              tasks={filteredTasks} 
              columns={columns}
              setColumns={setColumns}
              onToggle={toggleTaskExpansion} 
              selectedTaskIds={selectedTaskIds}
              visibleTaskIds={visibleTaskIds}
              onToggleRow={handleToggleRow}
              onToggleAll={handleToggleAll}
              rowNumberMap={rowNumberMap}
              editingCell={editingCell}
              onEditCell={setEditingCell}
              onUpdateTask={handleUpdateTask}
          />
        </main>
        <footer className="p-2 border-t border-gray-200 flex-shrink-0">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1.5 rounded-md hover:bg-gray-100">
            <PlusIcon className="w-4 h-4" />
            Item
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;
