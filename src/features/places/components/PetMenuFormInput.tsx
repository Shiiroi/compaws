import React from 'react';
import { theme } from '../../../shared/styles/theme';
import type { PetMenuDetails, PetMenuItem, PetMenuCategory } from '../../../shared/types/pet-menu';

interface PetMenuFormInputProps {
  value: PetMenuDetails;
  onChange: (updated: PetMenuDetails) => void;
}

export const PetMenuFormInput: React.FC<PetMenuFormInputProps> = ({ value, onChange }) => {
  const handleStatusChange = (status: 'yes' | 'no' | 'water_bowl_only') => {
    onChange({
      ...value,
      has_pet_menu: status,
    });
  };

  const handleAddItem = () => {
    const newItem: PetMenuItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      category: 'treat',
      price: '',
      notes: '',
    };
    onChange({
      ...value,
      items: [...(value.items || []), newItem],
    });
  };

  const handleUpdateItem = (id: string, field: keyof PetMenuItem, fieldValue: any) => {
    const updatedItems = (value.items || []).map((item) => {
      if (item.id === id) {
        return { ...item, [field]: fieldValue };
      }
      return item;
    });
    onChange({ ...value, items: updatedItems });
  };

  const handleRemoveItem = (id: string) => {
    const updatedItems = (value.items || []).filter((item) => item.id !== id);
    onChange({ ...value, items: updatedItems });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Availability Status Select */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            color: theme.colors.textDark,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Pet Menu Offering Status
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { id: 'yes', label: 'Has Pet Menu 🍖' },
            { id: 'water_bowl_only', label: 'Water Bowl Only 🥣' },
            { id: 'no', label: 'No Pet Menu ❌' },
          ].map((opt) => {
            const isSelected = value.has_pet_menu === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleStatusChange(opt.id as any)}
                style={{
                  padding: '10px 6px',
                  borderRadius: '12px',
                  border: isSelected
                    ? `2px solid ${theme.colors.terracotta}`
                    : `1px solid ${theme.colors.borderLight}`,
                  backgroundColor: isSelected ? theme.colors.softPink : '#ffffff',
                  color: isSelected ? theme.colors.terracotta : theme.colors.textDark,
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pet Menu Item List */}
      {value.has_pet_menu === 'yes' && (
        <div
          style={{
            borderTop: `1px solid ${theme.colors.borderLight}`,
            paddingTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: theme.colors.textDark }}>
              Menu Items ({value.items?.length || 0})
            </h4>
            <button
              type="button"
              onClick={handleAddItem}
              style={{
                backgroundColor: theme.colors.softPink,
                color: theme.colors.terracotta,
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Add Item
            </button>
          </div>

          {(value.items || []).length === 0 ? (
            <p style={{ fontSize: '12px', color: theme.colors.textMuted, margin: 0, fontStyle: 'italic' }}>
              No items added yet. Click "+ Add Item" to list doggy treats, pup cups, or pet meals! 🐾
            </p>
          ) : (
            (value.items || []).map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  padding: '12px',
                  border: `1px solid ${theme.colors.borderLight}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Item Name (e.g. Pup Cup, Dog Steak)"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '12px',
                      backgroundColor: '#ffffff',
                      color: theme.colors.textDark,
                    }}
                  />
                  <select
                    value={item.category}
                    onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value as PetMenuCategory)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '12px',
                      backgroundColor: '#ffffff',
                      color: theme.colors.textDark,
                    }}
                  >
                    <option value="treat">🦴 Treat</option>
                    <option value="food">🍖 Food</option>
                    <option value="drink">🥤 Drink</option>
                    <option value="freebie">🎁 Freebie</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Price (e.g. ₱150 or Free)"
                    value={item.price || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                    style={{
                      width: '120px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '12px',
                      backgroundColor: '#ffffff',
                      color: theme.colors.textDark,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional e.g. lactose-free whipped cream)"
                    value={item.notes || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.colors.borderLight}`,
                      fontSize: '12px',
                      backgroundColor: '#ffffff',
                      color: theme.colors.textDark,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#ef4444',
                      border: 'none',
                      borderRadius: '8px',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* General Pet Menu Notes */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 700,
            color: theme.colors.textDark,
            marginBottom: '4px',
          }}
        >
          Special Instructions or Notes (Optional)
        </label>
        <textarea
          rows={2}
          placeholder="e.g., Ask barista for complimentary puppuccino with any coffee purchase!"
          value={value.notes || ''}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: '10px',
            border: `1px solid ${theme.colors.borderLight}`,
            fontSize: '12px',
            fontFamily: theme.fonts.body,
            backgroundColor: '#ffffff',
            color: theme.colors.textDark,
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
};
