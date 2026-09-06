const WEEKDAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;
export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export function todayISO() {
  return toISO(new Date());
}

export function toISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function weekdayKeyOf(isoDate: string): WeekdayKey {
  const [y, m, d] = isoDate.split("-").map(Number);
  return WEEKDAY_KEYS[new Date(y, m - 1, d).getDay()];
}

/** Datas (ISO) de segunda a domingo da semana que contém `isoDate` (hoje, por padrão) */
export function currentWeekDates(isoDate: string = todayISO()): string[] {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay(); // 0 = domingo
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d2 = new Date(monday);
    d2.setDate(monday.getDate() + i);
    return toISO(d2);
  });
}
