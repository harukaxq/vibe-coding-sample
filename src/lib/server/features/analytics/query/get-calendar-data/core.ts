export type GetCalendarDataQueryInput = {
  userId: string;
  year: number;
  month: number; // 1-12
};

export type CalendarDay = {
  date: Date;
  completedPomodoros: number;
  totalMinutes: number;
};

export type CalendarData = {
  year: number;
  month: number;
  days: CalendarDay[];
};