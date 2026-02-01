
import React, { useState } from 'react';
import { Priority } from '../types';
import { CATEGORIES } from '../constants';
import { Icon } from './Icon';
import { suggestPriority } from '../services/geminiService';

interface TodoFormProps {
  onAdd: (data: { title: string; description: string; priority: Priority; category: string }) => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, description, priority, category });
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  const handleAISuggestPriority = async () => {
    if (!title.trim()) return;
    setIsSuggesting(true);
    try {
      const suggested = await suggestPriority(title, description);
      setPriority(suggested);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-8">
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full text-lg font-semibold bg-transparent border-none focus:ring-0 placeholder:text-slate-300"
        />
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details (optional)..."
          rows={2}
          className="w-full text-sm text-slate-600 bg-transparent border-none focus:ring-0 placeholder:text-slate-300 resize-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100">
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${priority === p ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={handleAISuggestPriority}
                disabled={isSuggesting || !title}
                className={`ml-1 p-1.5 rounded-md transition-colors ${isSuggesting ? 'bg-indigo-50 text-indigo-500' : 'text-slate-400 hover:text-indigo-500'}`}
                title="Suggest priority with AI"
              >
                <Icon name="brain" className={`w-4 h-4 ${isSuggesting ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all shadow-indigo-200 shadow-lg"
          >
            <Icon name="plus" className="w-5 h-5" />
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
};
