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
 * Dynamically appends the Google Maps JavaScript API script to the head.
 * 
 * WHY DYNAMIC LOADING:
 * Avoids hardcoding key injection or script tags inside index.html, allowing the
 * React app to read the validated env config variable dynamically during startup.
 * 
 * @param {string} apiKey - The client-restricted Google Maps API key.
 * @returns {Promise<void>} Resolves when script has loaded.
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
 * WHY PLACES (NEW) API & AUTOCOMPLETE SUGGESTIONS:
 * Old Google Maps AutocompleteService is deprecated and blocked for new projects.
 * We import the new 'places' library and fetch predictions using AutocompleteSuggestion.
 * 
 * @param {string} query - The search string query.
 * @param {any} sessionToken - The active AutocompleteSessionToken object.
 * @returns {Promise<GeocodingResult[]>} Pure text predictions list (Google) or resolved items (OSM fallback).
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

/**
 * Lazy-fetches coordinates for a single chosen place ID.
 * 
 * WHY PLACE (NEW) DETAILS:
 * Requests coordinates using the new Google Place class and limits fields to location
 * to keep usage pricing within free quota limits.
 * 
 * @param {string} placeId - The selected Google Place UUID.
 * @param {any} sessionToken - The active AutocompleteSessionToken.
 * @returns {Promise<{ lat: number, lng: number } | null>} Coords payload.
 */
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: any
): Promise<{ lat: number; lng: number } | null> {
  const hasGoogleSDK = typeof window !== 'undefined' && (window as any).google?.maps;
  if (!hasGoogleSDK) {
    return null;
  }

  try {
    const { Place } = await (window as any).google.maps.importLibrary("places");
    const place = new Place({ id: placeId });
    
    await place.fetchFields({
      fields: ['location'],
      sessionToken,
    });

    if (!place.location) {
      return null;
    }

    return {
      lat: place.location.lat(),
      lng: place.location.lng(),
    };
  } catch (err) {
    console.error('[Google Details Query Failed]:', err);
    return null;
  }
}
