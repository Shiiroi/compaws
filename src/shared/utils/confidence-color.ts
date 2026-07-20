import { theme } from '../styles/theme';

export interface ConfidenceStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  isSolid: boolean;
  borderStyle: 'solid' | 'dashed';
}

/**
 * Returns consistent styling configurations for badges and map pins based on confidence and values.
 * 
 * WHY WE EXTRACT THIS:
 * Centralizing the confirmed vs unconfirmed logic prevents discrepancies where Map pins 
 * and details badges render different visual states for the same consensus data.
 */
export function getConfidenceStyle(
  valueType: 'policy' | 'price' | 'menu',
  value: string | null,
  agreeingDevices: number
): ConfidenceStyle {
  const isConfirmed = agreeingDevices >= 2 && value !== null;

  if (isConfirmed) {
    if (valueType === 'policy') {
      if (value === 'allowed') {
        return {
          backgroundColor: theme.colors.allowed, // solid Sage Green (#81B29A)
          textColor: '#ffffff',
          borderColor: theme.colors.allowed,
          isSolid: true,
          borderStyle: 'solid',
        };
      }
      if (value === 'not_allowed') {
        return {
          backgroundColor: theme.colors.notAllowed, // solid Coral Red (#E76F51)
          textColor: '#ffffff',
          borderColor: theme.colors.notAllowed,
          isSolid: true,
          borderStyle: 'solid',
        };
      }
      // Note: 'outdoor_only' on Map pins is intentionally unconfirmed/dashed even if confirmed.
    } else if (valueType === 'menu') {
      if (value === 'yes') {
        return {
          backgroundColor: '#059669', // solid green
          textColor: '#ffffff',
          borderColor: '#059669',
          isSolid: true,
          borderStyle: 'solid',
        };
      }
      if (value === 'no') {
        return {
          backgroundColor: theme.colors.notAllowed, // solid Coral Red (#E76F51)
          textColor: '#ffffff',
          borderColor: theme.colors.notAllowed,
          isSolid: true,
          borderStyle: 'solid',
        };
      }
    } else if (valueType === 'price') {
      if (value === 'budget') {
        return {
          backgroundColor: '#059669', // solid green
          textColor: '#ffffff',
          borderColor: '#059669',
          isSolid: true,
          borderStyle: 'solid',
        };
      }
      if (value === 'mid') {
        return {
          backgroundColor: theme.colors.tan, // solid amber
          textColor: '#ffffff',
          borderColor: theme.colors.tan,
          isSolid: true,
          borderStyle: 'solid',
        };
      }
      if (value === 'splurge') {
        return {
          backgroundColor: '#7c3aed', // solid purple
          textColor: '#ffffff',
          borderColor: '#7c3aed',
          isSolid: true,
          borderStyle: 'solid',
        };
      }
    }
  }

  // Unconfirmed or Outlined state (agreeingDevices < 2, value is null, or value type not matched above)
  let color = theme.colors.unconfirmed; // default muted gray (#9CA3AF)

  if (value === 'outdoor_only') {
    color = theme.colors.outdoorOnly; // amber/orange
  }

  return {
    backgroundColor: '#ffffff',
    textColor: color,
    borderColor: color,
    isSolid: false,
    borderStyle: 'dashed',
  };
}
