
export type Priority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: number;
  subTasks: SubTask[];
  aiBreakdownRequested?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}
