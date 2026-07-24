export interface GeocodingResult {
  /** Unique identifier for the search result (place_id or OSM id). */
  id: string;
  /** Primary label representing the location name. */
  displayName: string;
  /** Full text address. */
  address: string;
  /** Latitude coordinate (optional during autocomplete, resolved on selection). */
  lat?: number;
  /** Longitude coordinate (optional during autocomplete). */
  lng?: number;
}

let isLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Appends the Google Maps JavaScript API script to the document head.
 * 
 * @param {string} apiKey - Client-restricted Google Maps API key.
 * @returns {Promise<void>} Resolves when script finishes loading.
 */
export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (isLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();

    // Prevent double-loading script tags if already initialized
    if ((window as any).google?.maps) {
      isLoaded = true;
      return resolve();
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error('[Google Maps Script Load Error] Failed to download script tag.'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Searches geocoding directories to resolve address autocomplete predictions.
 * 
 * @param {string} query - The search string query.
 * @param {any} sessionToken - Active AutocompleteSessionToken object.
 * @returns {Promise<GeocodingResult[]>} Text predictions list from Google or OSM.
 */
export async function searchGooglePlaces(
  query: string,
  sessionToken?: any
): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const hasGoogleSDK = typeof window !== 'undefined' && (window as any).google?.maps;

  if (hasGoogleSDK) {
    try {
      // Dynamic import of the modern places library as recommended by Google Maps
      const { AutocompleteSuggestion } = await (window as any).google.maps.importLibrary("places");

      const result = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: query,
        sessionToken,
        includedRegionCodes: ["ph"],
      });

      const suggestions = result.suggestions || [];

      return suggestions.map((s: any) => {
        const pred = s.placePrediction;
        return {
          id: pred.placeId,
          displayName: pred.mainText ? pred.mainText.toString() : (pred.text ? pred.text.toString() : ''),
          address: pred.text ? pred.text.toString() : '',
        };
      });
    } catch (err) {
      console.error('[Google Autocomplete Suggestion Failed]:', err);
      return [];
    }
  }

  // FALLBACK: OpenStreetMap Nominatim API
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=5&countrycodes=ph`;
    
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim query failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    return data.map((item: any) => ({
      id: `osm-${item.place_id}`,
      displayName: item.name || item.display_name.split(',')[0],
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (error) {
    console.error('[Geocoding Fallback Failed] Nominatim search failed:', error);
    return [];
  }
}

import type { WeeklyOperatingHours } from '../types/hours';

/**
 * Helper to extract city/municipality and province from Google address components array.
 */
export function parseCityProvince(addressComponents: any[]): { city: string; province: string } {
  if (!addressComponents || !Array.isArray(addressComponents)) {
    return { city: '', province: '' };
  }

  let locality = '';
  let sublocality = '';
  let adminLevel2 = '';
  let adminLevel1 = '';

  for (const comp of addressComponents) {
    const types: string[] = comp.types || [];
    const text = (comp.longText || comp.name || comp.shortText || comp.long_name || comp.short_name || '').trim();

    if (types.includes('locality')) {
      locality = text;
    } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
      sublocality = text;
    } else if (types.includes('administrative_area_level_2')) {
      adminLevel2 = text;
    } else if (types.includes('administrative_area_level_1')) {
      adminLevel1 = text;
    }
  }

  let city = locality || sublocality || adminLevel2 || '';
  if (city.startsWith('City of ')) {
    city = city.replace('City of ', '') + ' City';
  }

  let province = adminLevel2 || adminLevel1 || city;

  // Auto-fill Metro Manila for NCR & all NCR cities
  const ncrPattern = /ncr|national capital region|metro manila|quezon city|manila|makati|taguig|pasig|mandaluyong|san juan|pasay|parañaque|las piñas|muntinlupa|marikina|valenzuela|malabon|navotas|pateros|caloocan/i;
  
  if (ncrPattern.test(adminLevel1) || ncrPattern.test(adminLevel2) || ncrPattern.test(city)) {
    province = 'Metro Manila';
  } else if (/region|calabarzon|mimaropa|bicol|soccsksargen|caraga|bangsamoro|cordillera/i.test(adminLevel1) && adminLevel2) {
    // If adminLevel1 is a Region name, use adminLevel2 as the actual Province
    province = adminLevel2;
  }

  return { city, province };
}

/**
 * Fetches coordinates, opening hours, city, and province for a single chosen place ID.
 * 
 * @param {string} placeId - Selected Google Place ID.
 * @param {any} sessionToken - Active AutocompleteSessionToken.
 * @returns {Promise<{ lat: number; lng: number; openingHours?: WeeklyOperatingHours | null; city?: string; province?: string } | null>} Place details payload.
 */
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: any
): Promise<{ lat: number; lng: number; openingHours?: WeeklyOperatingHours | null; city?: string; province?: string } | null> {
  const hasGoogleSDK = typeof window !== 'undefined' && (window as any).google?.maps;
  if (!hasGoogleSDK) {
    return null;
  }

  try {
    const { Place } = await (window as any).google.maps.importLibrary("places");
    const place = new Place({ id: placeId });
    
    await place.fetchFields({
      fields: ['location', 'addressComponents'],
      sessionToken,
    });

    if (!place.location) {
      return null;
    }

    const locInfo = parseCityProvince(place.addressComponents);

    return {
      lat: place.location.lat(),
      lng: place.location.lng(),
      openingHours: null,
      city: locInfo.city,
      province: locInfo.province,
    };
  } catch (err) {
    console.error('[Google Details Query Failed]:', err);
    return null;
  }
}
