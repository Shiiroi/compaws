import React, { useState } from 'react';
import { theme } from '../../../shared/styles/theme';
import { DAYS_OF_WEEK, DAY_LABELS } from '../types/hours';
import type {
  DayOfWeek,
  DaySchedule,
  WeeklyOperatingHours,
} from '../types/hours';
import { getDefaultOperatingHours } from '../../../shared/utils/operating-hours';
import { FaClock, FaCalendarAlt, FaCheckCircle, FaPlus, FaTrash } from 'react-icons/fa';

interface StoreHoursFormInputProps {
  value: WeeklyOperatingHours | null;
  onChange: (hours: WeeklyOperatingHours) => void;
}

export const StoreHoursFormInput: React.FC<StoreHoursFormInputProps> = ({
  value,
  onChange,
}) => {
  const hours = value || getDefaultOperatingHours();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
  const [activeTab, setActiveTab] = useState<'presets' | 'edit'>('presets');

  const updateDaySchedule = (day: DayOfWeek, update: Partial<DaySchedule>) => {
    const updatedDay: DaySchedule = {
      ...hours[day],
      ...update,
    };
    onChange({
      ...hours,
      [day]: updatedDay,
    });
  };

  const applyPreset247 = () => {
    const newHours = { ...hours };
    DAYS_OF_WEEK.forEach((day) => {
      newHours[day] = { isClosed: false, is24Hours: true, slots: [] };
    });
    onChange(newHours);
  };

  const applyPresetStandard = () => {
    const newHours = { ...hours };
    DAYS_OF_WEEK.forEach((day) => {
      newHours[day] = {
        isClosed: false,
        is24Hours: false,
        slots: [{ open: '09:00', close: '18:00' }],
      };
    });
    onChange(newHours);
  };

  const applyPresetWeekdaysAndWeekends = () => {
    const newHours = { ...hours };
    DAYS_OF_WEEK.forEach((day) => {
      if (day === 'saturday' || day === 'sunday') {
        newHours[day] = {
          isClosed: false,
          is24Hours: false,
          slots: [{ open: '10:00', close: '20:00' }],
        };
      } else {
        newHours[day] = {
          isClosed: false,
          is24Hours: false,
          slots: [{ open: '09:00', close: '18:00' }],
        };
      }
    });
    onChange(newHours);
  };

  const copySelectedDayToAll = () => {
    const template = hours[selectedDay];
    const newHours = { ...hours };
    DAYS_OF_WEEK.forEach((day) => {
      newHours[day] = {
        ...template,
        slots: template.slots ? template.slots.map((s) => ({ ...s })) : [],
      };
    });
    onChange(newHours);
  };

  const currentSched = hours[selectedDay] || {
    isClosed: false,
    is24Hours: false,
    slots: [{ open: '09:00', close: '18:00' }],
  };

  const addSlot = () => {
    const slots = currentSched.slots ? [...currentSched.slots] : [];
    slots.push({ open: '17:00', close: '21:00' });
    updateDaySchedule(selectedDay, { slots, isClosed: false, is24Hours: false });
  };

  const removeSlot = (index: number) => {
    const slots = (currentSched.slots || []).filter((_, i) => i !== index);
    updateDaySchedule(selectedDay, { slots });
  };

  const updateSlot = (index: number, field: 'open' | 'close', val: string) => {
    const slots = (currentSched.slots || []).map((slot, i) => {
      if (i === index) {
        return { ...slot, [field]: val };
      }
      return slot;
    });
    updateDaySchedule(selectedDay, { slots });
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: `1.5px solid ${theme.colors.softPink}`,
        padding: '16px',
        marginTop: '12px',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          color: theme.colors.terracotta,
          fontWeight: 700,
          fontSize: '15px',
          fontFamily: theme.fonts.heading,
        }}
      >
        <FaClock size={16} />
        <span>Store Operating Hours</span>
      </div>

      {/* Mode selection tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '14px',
          backgroundColor: '#F7FAFC',
          padding: '4px',
          borderRadius: '10px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'presets' ? '#ffffff' : 'transparent',
            color: activeTab === 'presets' ? theme.colors.terracotta : theme.colors.textMuted,
            boxShadow: activeTab === 'presets' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Quick Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'edit' ? '#ffffff' : 'transparent',
            color: activeTab === 'edit' ? theme.colors.terracotta : theme.colors.textMuted,
            boxShadow: activeTab === 'edit' ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Custom Day-by-Day
        </button>
      </div>

      {activeTab === 'presets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={applyPresetStandard}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: `1px solid ${theme.colors.borderLight}`,
              backgroundColor: '#FAFAFA',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: theme.colors.textDark }}>
                Standard Hours (9 AM – 6 PM)
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>
                Open 9:00 AM to 6:00 PM every day
              </div>
            </div>
            <FaCheckCircle style={{ color: theme.colors.allowed }} />
          </button>

          <button
            type="button"
            onClick={applyPresetWeekdaysAndWeekends}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: `1px solid ${theme.colors.borderLight}`,
              backgroundColor: '#FAFAFA',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: theme.colors.textDark }}>
                Weekdays 9–6 & Weekends 10–8
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>
                Standard weekdays, extended weekend hours
              </div>
            </div>
            <FaCalendarAlt style={{ color: theme.colors.terracotta }} />
          </button>

          <button
            type="button"
            onClick={applyPreset247}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: `1px solid ${theme.colors.borderLight}`,
              backgroundColor: '#FAFAFA',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: theme.colors.textDark }}>
                Open 24/7
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>
                Open 24 hours every day of the week
              </div>
            </div>
            <FaClock style={{ color: theme.colors.tan }} />
          </button>
        </div>
      )}

      {/* Day pill selector */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: theme.colors.textMuted, marginBottom: '6px' }}>
          Select day to view or customize:
        </div>
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '6px' }}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            const sched = hours[day];
            const statusColor = sched?.isClosed
              ? theme.colors.notAllowed
              : sched?.is24Hours
              ? theme.colors.tan
              : theme.colors.allowed;

            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                  setActiveTab('edit');
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: isSelected ? `2px solid ${theme.colors.terracotta}` : `1px solid ${theme.colors.borderLight}`,
                  backgroundColor: isSelected ? theme.colors.softPink : '#ffffff',
                  color: isSelected ? theme.colors.terracotta : theme.colors.textDark,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: statusColor,
                  }}
                />
                {DAY_LABELS[day].slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Day Editor */}
      {activeTab === 'edit' && (
        <div
          style={{
            marginTop: '12px',
            backgroundColor: '#FBFBFB',
            borderRadius: '12px',
            padding: '12px',
            border: `1px solid ${theme.colors.borderLight}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: theme.colors.textDark, fontFamily: theme.fonts.heading }}>
              {DAY_LABELS[selectedDay]} Schedule
            </span>
            <button
              type="button"
              onClick={copySelectedDayToAll}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: theme.colors.terracotta,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Apply {DAY_LABELS[selectedDay]} to all days
            </button>
          </div>

          {/* Day Status Mode */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => updateDaySchedule(selectedDay, { isClosed: false, is24Hours: false })}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '8px',
                border: !currentSched.isClosed && !currentSched.is24Hours ? `2px solid ${theme.colors.allowed}` : `1px solid ${theme.colors.borderLight}`,
                backgroundColor: !currentSched.isClosed && !currentSched.is24Hours ? '#E8F5E9' : '#ffffff',
                color: theme.colors.textDark,
                cursor: 'pointer',
              }}
            >
              Set Open Hours
            </button>
            <button
              type="button"
              onClick={() => updateDaySchedule(selectedDay, { isClosed: false, is24Hours: true, slots: [] })}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '8px',
                border: currentSched.is24Hours ? `2px solid ${theme.colors.tan}` : `1px solid ${theme.colors.borderLight}`,
                backgroundColor: currentSched.is24Hours ? '#FFF3E0' : '#ffffff',
                color: theme.colors.textDark,
                cursor: 'pointer',
              }}
            >
              Open 24 Hours
            </button>
            <button
              type="button"
              onClick={() => updateDaySchedule(selectedDay, { isClosed: true, is24Hours: false, slots: [] })}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '8px',
                border: currentSched.isClosed ? `2px solid ${theme.colors.notAllowed}` : `1px solid ${theme.colors.borderLight}`,
                backgroundColor: currentSched.isClosed ? '#FFEBEE' : '#ffffff',
                color: theme.colors.textDark,
                cursor: 'pointer',
              }}
            >
              Closed All Day
            </button>
          </div>

          {/* Time slots inputs if open */}
          {!currentSched.isClosed && !currentSched.is24Hours && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(currentSched.slots && currentSched.slots.length > 0
                ? currentSched.slots
                : [{ open: '09:00', close: '18:00' }]
              ).map((slot, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#ffffff',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.borderLight}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <span style={{ fontSize: '11px', color: theme.colors.textMuted }}>Opens:</span>
                    <input
                      type="time"
                      value={slot.open}
                      onChange={(e) => updateSlot(index, 'open', e.target.value)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.colors.borderLight}`,
                        fontSize: '12px',
                        width: '100%',
                      }}
                    />
                  </div>
                  <span style={{ color: theme.colors.textMuted }}>–</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                    <span style={{ fontSize: '11px', color: theme.colors.textMuted }}>Closes:</span>
                    <input
                      type="time"
                      value={slot.close}
                      onChange={(e) => updateSlot(index, 'close', e.target.value)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.colors.borderLight}`,
                        fontSize: '12px',
                        width: '100%',
                      }}
                    />
                  </div>
                  {(currentSched.slots || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlot(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.colors.notAllowed,
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addSlot}
                style={{
                  alignSelf: 'flex-start',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: theme.colors.terracotta,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <FaPlus size={10} /> Add split shift / break time
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
