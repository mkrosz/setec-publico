const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "2026-10-05" -> "5 out" (vazio se a data não puder ser lida). */
export function shortDayLabel(isoDate: string | null | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate ?? '');
  if (!match) return '';
  const month = MESES_CURTOS[Number(match[2]) - 1];
  return month ? `${Number(match[3])} ${month}` : '';
}

/** "5 out • 13:30 - 14:15", "13:30 - 14:15", "13:30" ou "" conforme o que existir. */
export function scheduleLabel(item: { date?: string; timeStart: string; timeEnd: string }, showDay = false): string {
  const time = item.timeStart ? `${item.timeStart}${item.timeEnd ? ` - ${item.timeEnd}` : ''}` : '';
  const day = showDay ? shortDayLabel(item.date) : '';
  return [day, time].filter(Boolean).join(' • ');
}
