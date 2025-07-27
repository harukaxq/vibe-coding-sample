import type { GetCalendarDataQueryInput, CalendarData, CalendarDay } from './core';
import { PomodoroSessionRepositoryPrisma } from '../../../../adapter/repository/pomodoroSessionRepository.prisma';

const sessionRepository = new PomodoroSessionRepositoryPrisma();

export async function getCalendarData(input: GetCalendarDataQueryInput): Promise<CalendarData> {
  // 月の開始日と終了日を計算
  const startDate = new Date(input.year, input.month - 1, 1);
  const endDate = new Date(input.year, input.month, 0); // 月末日
  endDate.setHours(23, 59, 59, 999);

  // 指定月のセッションを取得
  const sessions = await sessionRepository.findByDateRange(input.userId, startDate, endDate);

  // 日ごとにセッションを集計
  const dayMap = new Map<string, { count: number; minutes: number }>();

  for (const session of sessions) {
    if (session.completedAt && session.type === 'work') {
      const dateKey = session.completedAt.toISOString().split('T')[0];
      const current = dayMap.get(dateKey) ?? { count: 0, minutes: 0 };
      dayMap.set(dateKey, {
        count: current.count + 1,
        minutes: current.minutes + session.duration,
      });
    }
  }

  // カレンダーデータを構築
  const days: CalendarDay[] = [];
  const daysInMonth = endDate.getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(input.year, input.month - 1, day);
    const dateKey = date.toISOString().split('T')[0];
    const dayData = dayMap.get(dateKey) ?? { count: 0, minutes: 0 };

    days.push({
      date,
      completedPomodoros: dayData.count,
      totalMinutes: dayData.minutes,
    });
  }

  return {
    year: input.year,
    month: input.month,
    days,
  };
}