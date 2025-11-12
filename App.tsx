
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { MOCK_TASKS, DEFAULT_COLUMNS } from './constants';
import { Task, Column, View, DisplayDensity, ColumnId, SortConfig, FilterRule, Priority } from './types';
import ProjectTable from './components/ProjectTable';
import { PlusIcon, FilterIcon, SettingsIcon, SearchIcon } from './components/Icons';
import SettingsMenu from './components/FieldsMenu';
import ViewTabs from './components/ViewTabs';
import CreateViewModal from './components/CreateViewModal';
import ItemDetailsPanel from './components/ItemDetailsPanel';
import FilterMenu from './components/FilterMenu';
import ViewModeSwitcher, { ViewMode } from './components/ViewModeSwitcher';
import BoardView from './components/BoardView';
import GanttChartView from './components/GanttChartView';
import LookaheadView from './components/LookaheadView';


const VIEWS_STORAGE_KEY = 'project-table-views';
const ACTIVE_VIEW_STORAGE_KEY = 'project-table-active-view-id';
const DEFAULT_VIEW_ID = 'project-table-default-view-id';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set<number>());
  const [editingCell, setEditingCell] = useState<{ taskId: number; column: string } | null>(null);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isCreateViewModalOpen, setIsCreateViewModalOpen] = useState(false);
  const [renamingView, setRenamingView] = useState<View | null>(null);
  const mainContainerRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [detailedTask, setDetailedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');


  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container || viewMode !== 'table') {
        setIsScrolled(false);
        return;
    };

    const handleScroll = () => {
      setIsScrolled(container.scrollLeft > 1);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 

    const observer = new ResizeObserver(handleScroll);
    observer.observe(container);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [viewMode]);

  // FIX: Use useMemo to safely compute initial views from localStorage once.
  // This resolves both the try...catch syntax error and the invalid dependency
  // between the useState initializers for 'views' and 'activeViewId'.
  const initialViews = useMemo<View[]>(() => {
    try {
      const savedViews = localStorage.getItem(VIEWS_STORAGE_KEY);
      if (savedViews) return JSON.parse(savedViews);
    } catch (error) {
      console.error("Failed to parse views from localStorage", error);
    }
    return [{ id: 'default', name: 'Table', columns: DEFAULT_COLUMNS, displayDensity: 'standard', showGridLines: false, sortConfig: null, filters: [], searchQuery: '' }];
  }, []);

  const [views, setViews] = useState<View[]>(initialViews);

  const [activeViewId, setActiveViewId] = useState<string>(() => {
    const savedActiveId = localStorage.getItem(ACTIVE_VIEW_STORAGE_KEY);
    const defaultViewId = localStorage.getItem(DEFAULT_VIEW_ID);
    return savedActiveId || defaultViewId || initialViews[0]?.id || 'default';
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
  
  // FIX: Removed local sortConfig state and effects. sortConfig is now derived directly from activeView.
  const sortConfig = activeView?.sortConfig || null;

  const handleSetColumns = (newColumnsFunc: React.SetStateAction<Column[]>) => {
    setViews(prevViews => prevViews.map(view => {
      if (view.id === activeViewId) {
        const newColumns = typeof newColumnsFunc === 'function' ? newColumnsFunc(view.columns) : newColumnsFunc;
        return { ...view, columns: newColumns };
      }
      return view;
    }));
  };
  
  const handleSetSearchQuery = (query: string) => {
    setViews(prevViews => prevViews.map(view => 
        view.id === activeViewId ? { ...view, searchQuery: query } : view
    ));
  };

  const handleSetFilters = (filters: FilterRule[]) => {
    setViews(prevViews => prevViews.map(view => 
        view.id === activeViewId ? { ...view, filters } : view
    ));
  };

  const handleSetDisplayDensity = (density: DisplayDensity) => {
    setViews(prevViews => prevViews.map(view => {
      if (view.id === activeViewId) {
        return { ...view, displayDensity: density };
      }
      return view;
    }));
  };

  const handleSetShowGridLines = (show: boolean) => {
    setViews(prevViews => prevViews.map(view => {
      if (view.id === activeViewId) {
        return { ...view, showGridLines: show };
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
      columns: activeView.columns,
      displayDensity: activeView.displayDensity || 'standard',
      showGridLines: activeView.showGridLines || false,
      sortConfig: activeView.sortConfig,
      searchQuery: activeView.searchQuery || '',
      filters: activeView.filters || [],
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
    if (detailedTask && detailedTask.id === taskId) {
      setDetailedTask(prev => prev ? { ...prev, ...updatedValues } : null);
    }
  }, [detailedTask]);

  const handlePriorityChange = useCallback((taskId: number, priority: Priority) => {
    handleUpdateTask(taskId, { priority });
  }, [handleUpdateTask]);

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

  const handleSort = (columnId: ColumnId) => {
    const current = sortConfig;
    let newSortConfig: SortConfig = { columnId, direction: 'asc' };

    if (current?.columnId === columnId) {
      if (current.direction === 'asc') {
        newSortConfig = { columnId, direction: 'desc' };
      } else {
        newSortConfig = null;
      }
    }

    setViews(prevViews => prevViews.map(view =>
      view.id === activeViewId ? { ...view, sortConfig: newSortConfig } : view
    ));
  };

  const sortedAndFilteredTasks = useMemo(() => {
    let processedTasks: Task[] = [...tasks];
    const filters = activeView?.filters;
    const searchQuery = activeView?.searchQuery?.toLowerCase() || '';

    // --- Search Query Filtering ---
    if (searchQuery) {
        const searchFilterRecursively = (taskArray: Task[]): Task[] => {
            const result: Task[] = [];
            for (const task of taskArray) {
                const selfMatches = task.name.toLowerCase().includes(searchQuery);
                const filteredChildren = task.children ? searchFilterRecursively(task.children) : undefined;
                const hasMatchingChildren = !!filteredChildren && filteredChildren.length > 0;

                if (selfMatches) {
                    result.push({ ...task, children: filteredChildren || task.children });
                } else if (hasMatchingChildren) {
                    result.push({ ...task, children: filteredChildren, isExpanded: true });
                }
            }
            return result;
        };
        processedTasks = searchFilterRecursively(processedTasks);
    }

    // --- Advanced Filtering ---
    if (filters && filters.length > 0) {
      const checkFilterRule = (task: Task, rule: FilterRule): boolean => {
          const { columnId, operator, value } = rule;
          
          const isEmptyOp = operator === 'is_empty';
          const isNotEmptyOp = operator === 'is_not_empty';

          switch (columnId) {
              case 'name':
                  const name = task.name.toLowerCase();
                  if (isEmptyOp) return name === '';
                  if (isNotEmptyOp) return name !== '';
                  const strValue = String(value || '').toLowerCase();
                  if (operator === 'contains') return name.includes(strValue);
                  if (operator === 'not_contains') return !name.includes(strValue);
                  if (operator === 'is') return name === strValue;
                  if (operator === 'is_not') return name !== strValue;
                  break;
              case 'status':
              case 'priority':
              case 'impact':
                  const enumValue = task[columnId];
                  if (isEmptyOp) return !enumValue;
                  if (isNotEmptyOp) return !!enumValue;
                  const arrValue = value as string[] || [];
                  if (operator === 'is') return arrValue.includes(enumValue!);
                  if (operator === 'is_not') return !arrValue.includes(enumValue!);
                  break;
              case 'assignee':
                  if (isEmptyOp) return task.assignees.length === 0;
                  if (isNotEmptyOp) return task.assignees.length > 0;
                  const assigneeValues = value as string[] || [];
                  if (operator === 'is') return task.assignees.some(a => assigneeValues.includes(a.id));
                  if (operator === 'is_not') return !task.assignees.some(a => assigneeValues.includes(a.id));
                  break;
              case 'dates':
                  const datesStr = `${task.startDate} - ${task.dueDate}`.toLowerCase();
                  if (isEmptyOp) return datesStr.trim() === '-';
                  if (isNotEmptyOp) return datesStr.trim() !== '-';
                  const dateStrValue = String(value || '').toLowerCase();
                  if (operator === 'contains') return datesStr.includes(dateStrValue);
                  if (operator === 'not_contains') return !datesStr.includes(dateStrValue);
                  break;
          }
          return false;
      };

      const checkAllFilters = (task: Task) => filters.every(rule => checkFilterRule(task, rule));

      const filterRecursively = (taskArray: Task[]): Task[] => {
          const result: Task[] = [];
          for (const task of taskArray) {
              const selfMatches = checkAllFilters(task);
              const filteredChildren = task.children ? filterRecursively(task.children) : undefined;
              const hasMatchingChildren = !!filteredChildren && filteredChildren.length > 0;

              if (selfMatches) {
                  result.push({ ...task, children: filteredChildren || task.children });
              } else if (hasMatchingChildren) {
                  result.push({ ...task, children: filteredChildren, isExpanded: true });
              }
          }
          return result;
      };
      processedTasks = filterRecursively(processedTasks);
    }
    
    // --- Sorting ---
    if (!sortConfig) {
      return processedTasks;
    }

    const { columnId, direction } = sortConfig;

    const parseDate = (dateStr: string): Date => {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return new Date(0);
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    const getComparableValue = (task: Task, column: ColumnId): string | number => {
        switch (column) {
            case 'name': return task.name.toLowerCase();
            case 'status': return task.status;
            case 'assignee': return task.assignees[0]?.name.toLowerCase() || '';
            case 'dates': return parseDate(task.startDate).getTime();
            case 'progress': return task.progress?.percentage ?? -1;
            default: return 0;
        }
    };

    const sortRecursively = (taskArray: Task[]): Task[] => {
      const sortedArray = [...taskArray].sort((a, b) => {
        const aValue = getComparableValue(a, columnId);
        const bValue = getComparableValue(b, columnId);

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        }
        
        return direction === 'asc' ? comparison : -comparison;
      });

      return sortedArray.map(task => ({
        ...task,
        children: task.children ? sortRecursively(task.children) : undefined
      }));
    };
    
    return sortRecursively(processedTasks);

  }, [tasks, activeView]);

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
    return getVisibleIds(sortedAndFilteredTasks);
  }, [sortedAndFilteredTasks]);
  
  const rowNumberMap = useMemo(() => {
    const map = new Map<number, number>();
    let counter = 1;
    const generateMap = (currentTasks: Task[]) => {
      for (const task of currentTasks) {
        map.set(task.id, counter++);
        if (task.children) generateMap(task.children);
      }
    };
    generateMap(sortedAndFilteredTasks);
    return map;
  }, [sortedAndFilteredTasks]);

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

  const findTaskById = (tasks: Task[], id: number): Task | null => {
    for (const task of tasks) {
      if (task.id === id) return task;
      if (task.children) {
        const found = findTaskById(task.children, id);
        if (found) return found;
      }
    }
    return null;
  }
  
  const handleShowDetailsById = (taskId: number) => {
      const task = findTaskById(tasks, taskId);
      if(task) setDetailedTask(task);
  }

  const hasActiveFilters = (activeView?.filters?.length || 0) > 0;

  const renderActiveView = () => {
    if (!activeView) return null;

    switch(viewMode) {
      case 'table':
        return <ProjectTable 
                  tasks={sortedAndFilteredTasks} 
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
                  onShowDetails={handleShowDetailsById}
                  displayDensity={activeView.displayDensity || 'standard'}
                  showGridLines={activeView.showGridLines || false}
                  sortConfig={sortConfig}
                  onSort={handleSort}
              />;
      case 'board':
        return <BoardView tasks={sortedAndFilteredTasks} onPriorityChange={handlePriorityChange} />;
      case 'gantt':
        return <GanttChartView tasks={sortedAndFilteredTasks} onToggle={toggleTaskExpansion} onPriorityChange={handlePriorityChange} />;
      case 'lookahead':
        return <LookaheadView />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-full mx-auto bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col" style={{height: 'calc(100vh - 4rem)'}}>
        <header className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0 relative z-40">
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={activeView?.searchQuery || ''}
                onChange={(e) => handleSetSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                aria-label="Search tasks"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterMenuOpen(prev => !prev)}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 ${hasActiveFilters ? 'text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : 'text-gray-600'}`}
              >
                <FilterIcon className="w-4 h-4" />
                Filter
                {hasActiveFilters && (
                  <span className="bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{activeView.filters?.length}</span>
                )}
              </button>
              {isFilterMenuOpen && activeView && (
                <FilterMenu 
                  filters={activeView.filters || []}
                  setFilters={handleSetFilters}
                  onClose={() => setIsFilterMenuOpen(false)}
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <ViewModeSwitcher activeMode={viewMode} onModeChange={setViewMode} />
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
                  displayDensity={activeView.displayDensity || 'standard'}
                  setDisplayDensity={handleSetDisplayDensity}
                  showGridLines={activeView.showGridLines || false}
                  setShowGridLines={handleSetShowGridLines}
                  onClose={() => setIsSettingsMenuOpen(false)}
                  onResetColumns={handleResetColumns}
                />
              )}
            </div>
          </div>
        </header>
        <div className="flex-grow flex relative overflow-hidden">
          <main ref={mainContainerRef} className="flex-grow w-full h-full overflow-auto">
            {renderActiveView()}
          </main>
          <ItemDetailsPanel task={detailedTask} onClose={() => setDetailedTask(null)} onPriorityChange={handlePriorityChange} />
        </div>
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