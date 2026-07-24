import type { WeeklyOperatingHours } from './types/hours';

export type * from './types/hours';
export { DAYS_OF_WEEK, DAY_LABELS, SHORT_DAY_LABELS } from './types/hours';

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  operating_hours?: WeeklyOperatingHours | null;
}
