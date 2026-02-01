
import React from 'react';
import { Category, Todo } from './types';

export const CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', icon: '💼', color: 'bg-blue-100 text-blue-600' },
  { id: 'personal', name: 'Personal', icon: '🏠', color: 'bg-green-100 text-green-600' },
  { id: 'health', name: 'Health', icon: '🍎', color: 'bg-red-100 text-red-600' },
  { id: 'finance', name: 'Finance', icon: '💰', color: 'bg-yellow-100 text-yellow-600' },
  { id: 'education', name: 'Learning', icon: '📚', color: 'bg-purple-100 text-purple-600' },
];

export const INITIAL_TODOS: Todo[] = [
  {
    id: '1',
    title: 'Welcome to ZenTask AI',
    description: 'Try clicking the "Magic" wand to break down tasks!',
    completed: false,
    priority: 'medium',
    category: 'personal',
    createdAt: Date.now(),
    subTasks: []
  },
  {
    id: '2',
    title: 'Update project documentation',
    description: 'Review API specs and update README',
    completed: true,
    priority: 'high',
    category: 'work',
    createdAt: Date.now() - 86400000,
    subTasks: []
  }
];
