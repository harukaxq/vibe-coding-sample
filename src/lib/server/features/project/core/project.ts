export type Project = Readonly<{
  id: string;
  name: string;
  color: string;
  targetPomodoros: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}>;

export type CreateProjectInput = {
  name: string;
  color?: string;
  targetPomodoros?: number;
  userId: string;
};

export type UpdateProjectInput = {
  name?: string;
  color?: string;
  targetPomodoros?: number;
};

export function createProject(input: CreateProjectInput): Omit<Project, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: input.name,
    color: input.color ?? '#000000',
    targetPomodoros: input.targetPomodoros ?? 0,
    userId: input.userId,
  };
}

export function isValidColor(color: string): boolean {
  const colorRegex = /^#[0-9A-Fa-f]{6}$/;
  return colorRegex.test(color);
}

export function isValidTargetPomodoros(count: number): boolean {
  return count >= 0 && count <= 100; // 最大100ポモドーロまで
}