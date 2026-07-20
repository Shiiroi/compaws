export interface MapBounds {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export interface PlaceInBounds {
  id: string;
  name: string;
  address: string;
  city: string | null;
  latitude: number;
  longitude: number;
  category: string;
  status: string;
  claim: 'allowed' | 'not_allowed' | 'outdoor_only' | null;
  agreeing_devices: number;
  pet_menu: 'yes' | 'no' | 'not_sure' | null;
  pet_menu_agreeing_devices: number;
  price_range: 'budget' | 'mid' | 'splurge' | null;
  price_range_agreeing_devices: number;
}

export interface ReportItem {
  claim: 'allowed' | 'not_allowed' | 'outdoor_only';
  pet_menu: 'yes' | 'no' | 'not_sure';
  price_range: 'budget' | 'mid' | 'splurge';
  notes: string | null;
  created_at: string;
  device_id: string;
  nickname?: string | null;
}
