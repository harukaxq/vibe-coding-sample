import type { CreateProjectInput } from '../../core/project';
import { isValidColor, isValidTargetPomodoros } from '../../core/project';

export type CreateProjectCommandInput = CreateProjectInput;

export type CreateProjectCommandError = 
  | { type: 'INVALID_COLOR' }
  | { type: 'INVALID_TARGET_POMODOROS' }
  | { type: 'NAME_TOO_SHORT' }
  | { type: 'NAME_TOO_LONG' };

export function validateCreateProjectInput(input: CreateProjectCommandInput): CreateProjectCommandError | null {
  if (input.name.length < 1) {
    return { type: 'NAME_TOO_SHORT' };
  }

  if (input.name.length > 100) {
    return { type: 'NAME_TOO_LONG' };
  }

  if (input.color && !isValidColor(input.color)) {
    return { type: 'INVALID_COLOR' };
  }

  if (input.targetPomodoros !== undefined && !isValidTargetPomodoros(input.targetPomodoros)) {
    return { type: 'INVALID_TARGET_POMODOROS' };
  }

  return null;
}