export type GetProjectsQueryInput = {
  userId: string;
};

export type ProjectSummary = {
  id: string;
  name: string;
  color: string;
  targetPomodoros: number;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt: Date;
};