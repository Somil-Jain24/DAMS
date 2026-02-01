
import React, { useState } from 'react';
import { Todo, SubTask } from '../types';
import { Icon } from './Icon';
import { CATEGORIES } from '../constants';
import { breakdownTask } from '../services/geminiService';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateSubTask: (todoId: string, subTasks: SubTask[]) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onUpdateSubTask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const category = CATEGORIES.find(c => c.id === todo.category);

  const handleAIDecomposition = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (todo.subTasks.length > 0 || isBreakingDown) return;
    
    setIsBreakingDown(true);
    setIsExpanded(true);
    
    try {
      const suggestions = await breakdownTask(todo.title);
      const newSubTasks: SubTask[] = suggestions.map(title => ({
        id: Math.random().toString(36).substr(2, 9),
        title,
        completed: false
      }));
      onUpdateSubTask(todo.id, newSubTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const toggleSubTask = (subId: string) => {
    const updated = todo.subTasks.map(st => 
      st.id === subId ? { ...st, completed: !st.completed } : st
    );
    onUpdateSubTask(todo.id, updated);
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-amber-100 text-amber-600',
    high: 'bg-rose-100 text-rose-600'
  };

  return (
    <div className={`group mb-3 bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md ${todo.completed ? 'opacity-75' : ''}`}>
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(todo.id); }}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${todo.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-500'}`}
        >
          {todo.completed && <Icon name="check" className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${priorityColors[todo.priority]}`}>
              {todo.priority}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${category?.color}`}>
              {category?.name}
            </span>
          </div>
          <h3 className={`text-slate-800 font-medium truncate ${todo.completed ? 'line-through text-slate-400' : ''}`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-sm text-slate-500 truncate">{todo.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!todo.completed && todo.subTasks.length === 0 && (
            <button 
              onClick={handleAIDecomposition}
              disabled={isBreakingDown}
              className={`p-2 rounded-lg transition-colors ${isBreakingDown ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
              title="Break down with AI"
            >
              <Icon name="sparkles" className={`w-4 h-4 ${isBreakingDown ? 'animate-pulse' : ''}`} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <Icon name="trash" className="w-4 h-4" />
          </button>
          <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} className="w-5 h-5 text-slate-300" />
        </div>
      </div>

      {isExpanded && (todo.subTasks.length > 0 || isBreakingDown) && (
        <div className="px-14 pb-4 animate-in fade-in slide-in-from-top-2">
          {isBreakingDown ? (
            <div className="flex items-center gap-3 text-sm text-indigo-500 py-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              Analyzing task complexity...
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t border-slate-50">
              {todo.subTasks.map(st => (
                <div 
                  key={st.id} 
                  className="flex items-center gap-3 group/sub"
                  onClick={() => toggleSubTask(st.id)}
                >
                  <button className={`w-4 h-4 rounded border flex items-center justify-center ${st.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover/sub:border-emerald-500'}`}>
                    {st.completed && <Icon name="check" className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`text-sm ${st.completed ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
