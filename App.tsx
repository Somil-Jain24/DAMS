
import React, { useState, useEffect, useMemo } from 'react';
import { Todo, Priority, SubTask } from './types';
import { INITIAL_TODOS, CATEGORIES } from './constants';
import { TodoItem } from './components/TodoItem';
import { TodoForm } from './components/TodoForm';
import { Icon } from './components/Icon';
import { getSmartProductivityAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('zentask_todos');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  useEffect(() => {
    localStorage.setItem('zentask_todos', JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = (data: { title: string; description: string; priority: Priority; category: string }) => {
    const newTodo: Todo = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      completed: false,
      createdAt: Date.now(),
      subTasks: []
    };
    setTodos([newTodo, ...todos]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const handleUpdateSubTasks = (todoId: string, subTasks: SubTask[]) => {
    setTodos(todos.map(t => t.id === todoId ? { ...t, subTasks } : t));
  };

  const getAdvice = async () => {
    if (todos.filter(t => !t.completed).length === 0) {
      setAdvice("No pending tasks! Time for a well-deserved break.");
      return;
    }
    setIsLoadingAdvice(true);
    try {
      const resp = await getSmartProductivityAdvice(todos);
      setAdvice(resp);
    } catch (err) {
      setAdvice("Focus on your highest priority task first.");
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      const matchesTab = 
        activeTab === 'all' ? true :
        activeTab === 'pending' ? !t.completed :
        t.completed;
      
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesTab && matchesSearch;
    }).sort((a, b) => {
      // Sort by priority first (high -> medium -> low), then by date
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return b.createdAt - a.createdAt;
    });
  }, [todos, activeTab, searchQuery]);

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
  };

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 p-6 flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Icon name="sparkles" className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">ZenTask AI</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">Main View</div>
          {(['pending', 'completed', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${activeTab === tab ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <span className="capitalize">{tab} Tasks</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab ? 'bg-indigo-200' : 'bg-slate-100'}`}>
                {tab === 'pending' ? stats.pending : tab === 'completed' ? stats.completed : stats.total}
              </span>
            </button>
          ))}

          <div className="pt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">Categories</div>
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 cursor-pointer group">
              <span className="text-lg">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.name}</span>
              <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100 bg-slate-100 px-1.5 rounded">
                {todos.filter(t => t.category === cat.id).length}
              </span>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-4 text-white shadow-xl shadow-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold opacity-80">Daily Progress</span>
              <span className="text-xs font-bold">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 p-6 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          {/* Header Mobile */}
          <header className="md:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Icon name="sparkles" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-slate-800">ZenTask</h1>
            </div>
            <button className="p-2 bg-white rounded-lg border border-slate-200">
              <Icon name="search" className="w-5 h-5 text-slate-500" />
            </button>
          </header>

          {/* AI Productivity Widget */}
          <div className="relative mb-8 p-6 bg-white border border-indigo-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Icon name="brain" className="w-24 h-24 text-indigo-600" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-slate-800 font-bold text-lg flex items-center gap-2 mb-1">
                  AI Focus Coach
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                </h2>
                <p className="text-sm text-slate-500 max-w-md">
                  {isLoadingAdvice ? "Analyzing your workflow..." : advice || "Get smart advice on what to prioritize next based on your list."}
                </p>
              </div>
              <button 
                onClick={getAdvice}
                disabled={isLoadingAdvice}
                className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors whitespace-nowrap flex items-center gap-2"
              >
                {isLoadingAdvice ? <Icon name="sparkles" className="w-4 h-4 animate-spin" /> : <Icon name="brain" className="w-4 h-4" />}
                {advice ? "Refresh Advice" : "Analyze Tasks"}
              </button>
            </div>
          </div>

          <TodoForm onAdd={handleAddTodo} />

          {/* Search & Tabs (Mobile only tabs) */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1 relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>
            <div className="md:hidden flex bg-white rounded-xl border border-slate-200 p-1">
              {(['pending', 'all'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize ${activeTab === tab ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTodos.length > 0 ? (
              filteredTodos.map(todo => (
                <TodoItem 
                  key={todo.id} 
                  todo={todo} 
                  onToggle={handleToggleTodo} 
                  onDelete={handleDeleteTodo}
                  onUpdateSubTask={handleUpdateSubTasks}
                />
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="clock" className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-800 font-bold">No tasks found</h3>
                <p className="text-slate-400 text-sm mt-1">Try adding a new task or clearing filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
