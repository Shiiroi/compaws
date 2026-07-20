import React from 'react';
import { theme } from '../styles/theme';
import { getConfidenceStyle } from '../utils/confidence-color';

/**
 * DOCUMENTATION ON DESIGN DECISIONS:
 *
 * 1. Visual Alignment and Grid Consistency:
 *    All status rows (Price Range, Pet Menu, Pet Requirements) share this single component
 *    to eliminate layout drift. Everything is strictly left-aligned, ensuring clean scannability.
 *
 * 2. Visual Separation of Concerns:
 *    The Icon Chip color and the Confidence Pill color are completely independent systems.
 *    - Icon Chip Color: Represents category semantics (e.g. Price tiers, Menu availability).
 *    - Confidence Pill Color: Represents data consensus level (confirmed vs pending).
 *    These two systems NEVER share the same color family, preventing users from confusing
 *    what the value is with how certain the database is about that value.
 *
 * 3. Consistent Trust Level Indicators:
 *    The Confidence Pill imports and uses the shared `getConfidenceStyle` utility.
 *    - Confirmed (N >= 2): Uses the app's universal green color (theme.colors.allowed) with solid border.
 *    - Reported (N < 2): Uses a dashed gray outline to signal unconfirmed/pending status.
 *    Consistency is crucial; if trust states used different colors or borders across the app,
 *    the visual indicators would lose their meaning and reliability.
 *
 * 4. Value Text Neutrality:
 *    The value text itself is always displayed in neutral dark (theme.colors.textDark), never colored.
 *    The icon chip carries the category accent, keeping the page clean and the text highly readable.
 */

interface StatusCardProps {
  /** The icon component to display in the chip container. */
  icon: React.ReactNode;
  /** Small muted header text above the value. */
  label: string;
  /** Human-readable value label (always neutral color). If null, renders children or emptyText. */
  value: string | null;
  /** Text to show if value is null and no custom children exist. */
  emptyText: string;
  /** Colors specifically for the category icon chip (bg and fg). */
  iconChipColors: { bg: string; fg: string };
  /** Number of contributing devices who agreed on this consensus. */
  agreeingDevices: number;
  /** Custom children row (e.g. requirement badge pills). */
  children?: React.ReactNode;
  /** Hide the confidence pill entirely (e.g., for Requirements). */
  hideConfidencePill?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  icon,
  label,
  value,
  emptyText,
  iconChipColors,
  agreeingDevices,
  children,
  hideConfidencePill = false,
}) => {
  const isConfirmed = agreeingDevices >= 2;
  const hasValue = value !== null;

  // Use the shared confidence utility for trust visual consistency
  const confStyle = getConfidenceStyle('policy', isConfirmed && hasValue ? 'allowed' : null, agreeingDevices);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: '10px 12px',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        border: `1px solid ${theme.colors.borderLight}`,
        gap: '10px',
      }}
    >
      {/* Icon Chip — holds the category-specific meaning color */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          backgroundColor: iconChipColors.bg,
          color: iconChipColors.fg,
          flexShrink: 0,
          fontSize: '18px',
        }}
      >
        {icon}
      </div>

      {/* Content Area — always left-aligned */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              color: theme.colors.textMuted,
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>

          {/* Confidence Pill — aligned to the right */}
          {!hideConfidencePill && agreeingDevices > 0 && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: confStyle.backgroundColor,
                color: confStyle.textColor,
                border: `1px ${confStyle.borderStyle} ${confStyle.borderColor}`,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {isConfirmed ? `Confirmed (${agreeingDevices})` : `Reported (${agreeingDevices})`}
            </span>
          )}
        </div>

        {/* Value Area */}
        {value !== null ? (
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: theme.colors.textDark,
              textAlign: 'left',
            }}
          >
            {value}
          </span>
        ) : children ? (
          // Custom badge row container for requirements
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}>
            {children}
          </div>
        ) : (
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: theme.colors.textMuted,
              textAlign: 'left',
            }}
          >
            {emptyText}
          </span>
        )}
      </div>
    </div>
  );
};
