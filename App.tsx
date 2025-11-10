import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { MOCK_TASKS, DEFAULT_COLUMNS } from './constants';
import { Task, Column, View, DisplayDensity } from './types';
import ProjectTable from './components/ProjectTable';
import { PlusIcon, SearchIcon, SettingsIcon } from './components/Icons';
import SettingsMenu from './components/FieldsMenu';
import ViewTabs from './components/ViewTabs';
import CreateViewModal from './components/CreateViewModal';

const VIEWS_STORAGE_KEY = 'project-table-views';
const ACTIVE_VIEW_STORAGE_KEY = 'project-table-active-view-id';
const DEFAULT_VIEW_ID = 'project-table-default-view-id';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set<number>());
  const [editingCell, setEditingCell] = useState<{ taskId: number; column: string } | null>(null);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isCreateViewModalOpen, setIsCreateViewModalOpen] = useState(false);
  const [renamingView, setRenamingView] = useState<View | null>(null);
  const mainContainerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Add a small threshold to prevent shadow on minimal scroll
      setIsScrolled(container.scrollLeft > 1);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    // Also check on window resize when scrollbar may appear/disappear
    const observer = new ResizeObserver(handleScroll);
    observer.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const [views, setViews] = useState<View[]>(() => {
    try {
      const savedViews = localStorage.getItem(VIEWS_STORAGE_KEY);
      if (savedViews) return JSON.parse(savedViews);
    } catch (error) {
      console.error("Failed to parse views from localStorage", error);
    }
    return [{ id: 'default', name: 'Table', columns: DEFAULT_COLUMNS, displayDensity: 'compact' }];
  });

  const [activeViewId, setActiveViewId] = useState<string>(() => {
    const savedActiveId = localStorage.getItem(ACTIVE_VIEW_STORAGE_KEY);
    const defaultViewId = localStorage.getItem(DEFAULT_VIEW_ID);
    return savedActiveId || defaultViewId || views[0]?.id || 'default';
  });

  useEffect(() => {
    try {
      localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(views));
    } catch (error) {
      console.error("Failed to save views to localStorage", error);
    }
  }, [views]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_VIEW_STORAGE_KEY, activeViewId);
  }, [activeViewId]);

  const onSelectionChange = (selectedRowIds: string[]) => {
    console.log('onSelectionChange emitted:', selectedRowIds);
  };
  
  const activeView = useMemo(() => views.find(v => v.id === activeViewId) || views[0], [views, activeViewId]);
  
  const handleSetColumns = (newColumnsFunc: React.SetStateAction<Column[]>) => {
    setViews(prevViews => prevViews.map(view => {
      if (view.id === activeViewId) {
        const newColumns = typeof newColumnsFunc === 'function' ? newColumnsFunc(view.columns) : newColumnsFunc;
        return { ...view, columns: newColumns };
      }
      return view;
    }));
  };

  const handleSetDisplayDensity = (density: DisplayDensity) => {
    setViews(prevViews => prevViews.map(view => {
      if (view.id === activeViewId) {
        return { ...view, displayDensity: density };
      }
      return view;
    }));
  };
  
  const handleResetColumns = () => {
    handleSetColumns(DEFAULT_COLUMNS);
    setIsSettingsMenuOpen(false);
  };

  const handleCreateView = (name: string) => {
    const newView: View = {
      id: `view_${Date.now()}`,
      name,
      columns: activeView.columns, // Clone columns from the current view
      displayDensity: activeView.displayDensity || 'compact',
    };
    setViews(prev => [...prev, newView]);
    setActiveViewId(newView.id);
    setIsCreateViewModalOpen(false);
  };

  const handleRenameView = (newName: string) => {
    if (!renamingView) return;
    setViews(prev => prev.map(v => v.id === renamingView.id ? { ...v, name: newName } : v));
    setRenamingView(null);
  };

  const handleDeleteView = (viewId: string) => {
    if (views.length <= 1) return; // Don't delete the last view
    setViews(prev => prev.filter(v => v.id !== viewId));
    if (activeViewId === viewId) {
      const defaultViewId = localStorage.getItem(DEFAULT_VIEW_ID);
      setActiveViewId(defaultViewId && defaultViewId !== viewId ? defaultViewId : views.find(v => v.id !== viewId)!.id);
    }
  };

  const handleSetDefaultView = (viewId: string) => {
    localStorage.setItem(DEFAULT_VIEW_ID, viewId);
    // This is just a marker, no state change needed, but you could add a visual indicator.
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
    if (!searchQuery) return tasks;
    const lowercasedQuery = searchQuery.toLowerCase();

    const filterRecursively = (taskArray: Task[]): Task[] => {
        const result: Task[] = [];
        for (const task of taskArray) {
            let childrenMatch = false;
            let filteredChildren: Task[] | undefined = undefined;

            if (task.children) {
                filteredChildren = filterRecursively(task.children);
                if (filteredChildren.length > 0) childrenMatch = true;
            }
            const selfMatch = task.name.toLowerCase().includes(lowercasedQuery) || task.assignees.some(a => a.name.toLowerCase().includes(lowercasedQuery));

            if (selfMatch || childrenMatch) {
                result.push({ ...task, isExpanded: childrenMatch || task.isExpanded, children: filteredChildren });
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
        if (task.children) generateMap(task.children);
      }
    };
    generateMap(filteredTasks);
    return map;
  }, [filteredTasks]);

  const handleToggleRow = useCallback((taskId: number) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) newSet.delete(taskId);
      else newSet.add(taskId);
      onSelectionChange(Array.from(newSet).map(String));
      return newSet;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedTaskIds(prev => {
      const allVisibleSelected = visibleTaskIds.every(id => prev.has(id));
      const newSet = new Set(prev);
      if (allVisibleSelected) visibleTaskIds.forEach(id => newSet.delete(id));
      else visibleTaskIds.forEach(id => newSet.add(id));
      onSelectionChange(Array.from(newSet).map(String));
      return newSet;
    });
  }, [visibleTaskIds]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col" style={{height: 'calc(100vh - 4rem)'}}>
        <header className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0 relative z-40">
          <div className="flex items-center gap-2 flex-wrap">
            <ViewTabs
              views={views}
              activeViewId={activeViewId}
              onSelectView={setActiveViewId}
              onCreateView={() => setIsCreateViewModalOpen(true)}
              onRenameView={setRenamingView}
              onDeleteView={handleDeleteView}
              onSetDefaultView={handleSetDefaultView}
              onReorderViews={setViews}
              defaultViewId={localStorage.getItem(DEFAULT_VIEW_ID)}
            />
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
                onClick={() => setIsSettingsMenuOpen(prev => !prev)}
                className="flex items-center text-gray-600 hover:text-gray-900 p-1.5 rounded-md border border-gray-300 hover:bg-gray-100"
                aria-label="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
              {isSettingsMenuOpen && activeView && (
                <SettingsMenu 
                  columns={activeView.columns}
                  setColumns={handleSetColumns}
                  displayDensity={activeView.displayDensity || 'compact'}
                  setDisplayDensity={handleSetDisplayDensity}
                  onClose={() => setIsSettingsMenuOpen(false)}
                  onResetColumns={handleResetColumns}
                />
              )}
            </div>
          </div>
        </header>
        <main ref={mainContainerRef} className="overflow-auto flex-grow">
          {activeView && <ProjectTable 
              tasks={filteredTasks} 
              columns={activeView.columns}
              setColumns={handleSetColumns}
              onToggle={toggleTaskExpansion} 
              selectedTaskIds={selectedTaskIds}
              visibleTaskIds={visibleTaskIds}
              onToggleRow={handleToggleRow}
              onToggleAll={handleToggleAll}
              rowNumberMap={rowNumberMap}
              editingCell={editingCell}
              onEditCell={setEditingCell}
              onUpdateTask={handleUpdateTask}
              isScrolled={isScrolled}
              displayDensity={activeView.displayDensity || 'compact'}
          />}
        </main>
        <footer className="p-2 border-t border-gray-200 flex-shrink-0">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium px-2 py-1.5 rounded-md hover:bg-gray-100">
            <PlusIcon className="w-4 h-4" />
            Item
          </button>
        </footer>
      </div>
      {isCreateViewModalOpen && (
        <CreateViewModal 
          onSave={handleCreateView}
          onCancel={() => setIsCreateViewModalOpen(false)}
          title="Create new view"
        />
      )}
      {renamingView && (
        <CreateViewModal 
          initialName={renamingView.name}
          onSave={handleRenameView}
          onCancel={() => setRenamingView(null)}
          title="Rename view"
        />
      )}
    </div>
  );
};

export default App;
