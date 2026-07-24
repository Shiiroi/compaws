import { WeeklyOperatingHours } from './types/hours';

export * from './types/hours';

export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  operating_hours?: WeeklyOperatingHours | null;
}
