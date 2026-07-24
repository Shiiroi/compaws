import React from 'react';
import { FaBone } from 'react-icons/fa';
import { theme } from '../../../shared/styles/theme';
import type { PetMenuDetails, PetMenuCategory } from '../../../shared/types/pet-menu';

interface PetMenuViewProps {
  details?: PetMenuDetails | null;
  petMenuClaim?: 'yes' | 'no' | 'not_sure' | null;
  onEditClick?: () => void;
}

const CATEGORY_ICONS: Record<PetMenuCategory, string> = {
  food: '🍖',
  drink: '🥤',
  treat: '🦴',
  freebie: '🎁',
};

export const PetMenuView: React.FC<PetMenuViewProps> = ({
  details,
  petMenuClaim,
  onEditClick,
}) => {
  const hasMenu = details?.has_pet_menu === 'yes' || petMenuClaim === 'yes';
  const isWaterOnly = details?.has_pet_menu === 'water_bowl_only';
  const items = details?.items || [];

  return (
    <div
      style={{
        marginTop: '12px',
        padding: '12px 14px',
        backgroundColor: '#fffcfb',
        borderRadius: '16px',
        border: `1.5px solid ${theme.colors.softPink}`,
        fontFamily: theme.fonts.body,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>🦴</span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: theme.colors.textDark,
              fontFamily: theme.fonts.heading,
            }}
          >
            Pet Menu Offerings
          </span>
        </div>
        {onEditClick && (
          <button
            type="button"
            onClick={onEditClick}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.terracotta,
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Suggest / Edit Menu
          </button>
        )}
      </div>

      <div style={{ marginTop: '8px' }}>
        {hasMenu ? (
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                backgroundColor: '#E8F5E9',
                color: '#2E7D32',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: items.length > 0 ? '10px' : '4px',
              }}
            >
              <FaBone size={12} />
              <span>Offers Pet Menu</span>
            </div>

            {items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      padding: '8px 10px',
                      border: `1px solid ${theme.colors.borderLight}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{CATEGORY_ICONS[item.category] || '🦴'}</span>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: theme.colors.textDark }}>
                          {item.name}
                        </div>
                        {item.notes && (
                          <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    {item.price && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: theme.colors.terracotta,
                        }}
                      >
                        {typeof item.price === 'number' ? `₱${item.price}` : item.price}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '11px', color: theme.colors.textMuted, margin: '4px 0 0 0' }}>
                Pet menu reported, but specific item names haven't been listed yet!
              </p>
            )}
          </div>
        ) : isWaterOnly ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: '#E1F5FE',
              color: '#0288D1',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            <span>🥣</span>
            <span>Free Water Bowl Available</span>
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: theme.colors.textMuted, margin: '2px 0 0 0' }}>
            No dedicated pet menu reported yet.
          </p>
        )}

        {details?.notes && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px 10px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              borderLeft: `3px solid ${theme.colors.terracotta}`,
              fontSize: '11px',
              color: theme.colors.textDark,
              lineHeight: 1.4,
            }}
          >
            💡 {details.notes}
          </div>
        )}
      </div>
    </div>
  );
};
