export type TaskStatus = 'Pending' | 'InProgress' | 'Completed';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskDto = {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
};

export type TaskFilter = {
  status?: TaskStatus;
  priority?: TaskPriority;
};
