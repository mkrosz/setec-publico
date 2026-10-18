export type PeriodId = 'manha' | 'tarde' | 'noite' | 'madrugada';

// Faixas pelo horário de início: 06h01–12h00 manhã, 12h01–18h00 tarde,
// 18h01–00h00 noite e 00h01–06h00 madrugada
export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: 'manha', label: 'Manhã' },
  { id: 'tarde', label: 'Tarde' },
  { id: 'noite', label: 'Noite' },
  { id: 'madrugada', label: 'Madrugada' },
];

/** Período de um horário "HH:MM" (ou "" se não der para ler). */
export function periodOf(time: string): PeriodId | '' {
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return '';
  const minutes = (Number(match[1]) * 60 + Number(match[2])) % (24 * 60);
  if (minutes === 0) return 'noite';
  if (minutes <= 6 * 60) return 'madrugada';
  if (minutes <= 12 * 60) return 'manha';
  if (minutes <= 18 * 60) return 'tarde';
  return 'noite';
}
