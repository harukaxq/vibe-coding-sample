export type GetProjectProgressQueryInput = {
  userId: string;
  days?: number; // 過去何日分のデータを取得するか（デフォルト: 7）
};

export type ProjectProgressData = {
  projectId: string;
  projectName: string;
  color: string;
  targetPomodoros: number;
  completedPomodoros: number;
  progressPercentage: number;
  remainingPomodoros: number;
};