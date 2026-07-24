export type PetMenuCategory = 'food' | 'drink' | 'treat' | 'freebie';

export interface PetMenuItem {
  id: string;
  name: string;
  category: PetMenuCategory;
  price?: number | string | null;
  notes?: string;
}

export interface PetMenuDetails {
  has_pet_menu: 'yes' | 'no' | 'water_bowl_only';
  items?: PetMenuItem[];
  notes?: string;
  updated_at?: string;
}
