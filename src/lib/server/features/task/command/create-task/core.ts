import type { CreateTaskInput } from '../../core/task';
import { isValidEstimatedPomodoros } from '../../core/task';

export type CreateTaskCommandInput = CreateTaskInput;

export type CreateTaskCommandError = 
  | { type: 'TITLE_TOO_SHORT' }
  | { type: 'TITLE_TOO_LONG' }
  | { type: 'DESCRIPTION_TOO_LONG' }
  | { type: 'INVALID_ESTIMATED_POMODOROS' };

export function validateCreateTaskInput(input: CreateTaskCommandInput): CreateTaskCommandError | null {
  if (input.title.length < 1) {
    return { type: 'TITLE_TOO_SHORT' };
  }

  if (input.title.length > 200) {
    return { type: 'TITLE_TOO_LONG' };
  }

  if (input.description && input.description.length > 1000) {
    return { type: 'DESCRIPTION_TOO_LONG' };
  }

  if (input.estimatedPomodoros !== undefined && !isValidEstimatedPomodoros(input.estimatedPomodoros)) {
    return { type: 'INVALID_ESTIMATED_POMODOROS' };
  }

  return null;
}