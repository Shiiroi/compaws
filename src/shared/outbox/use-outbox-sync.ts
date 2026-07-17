import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../api/supabase-client';
import { getPendingReports, deletePendingReport, type PendingReport } from './outbox-db';
import { getDeviceId } from '../utils/device-id';

/**
 * Monitors connection changes and automatically pushes queued offline contributions
 * (adds, reviews, flags) from IndexedDB to the database upon recovery.
 * 
 * WHY VISIBILITY STATE FALLBACK:
 * Some mobile browsers (particularly iOS Safari) suspend timers and socket state
 * when tabs are backgrounded. When network recovers while backgrounded, they fail to
 * fire the standard window 'online' event upon active foreground wakeup. Listening
 * to 'visibilitychange' acts as a deliberate redundancy to ensure queued uploads flush.
 * 
 * WHY ABORT-ON-ERROR ITERATION:
 * When processing the queue oldest-first, if any record fails due to a transport error,
 * we halt the entire sync process immediately. We do NOT loop or immediately retry to
 * avoid spamming/hammering recovering connections, or spinning endlessly on permanent failures.
 */
export function useOutboxSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const flushOutbox = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    
    let pending: PendingReport[];
    try {
      pending = await getPendingReports();
    } catch (err) {
      console.error('[Outbox Sync] Failed to read IndexedDB outbox queue:', err);
      return;
    }

    // Keep only unsynced items and sort oldest-first to preserve logical timeline history
    const unsynced = pending
      .filter((item) => !item.synced)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (unsynced.length === 0) {
      return;
    }

    setIsSyncing(true);
    setSyncStatus(`Syncing ${unsynced.length} pending report${unsynced.length > 1 ? 's' : ''}... 🐾`);

    // Ensure the device is registered in the database before replaying contributions.
    // This prevents 409 foreign key violations if the device ID was generated while offline.
    try {
      const deviceId = getDeviceId();
      const { error: deviceError } = await supabase
        .from('devices')
        .upsert({ device_id: deviceId }, { onConflict: 'device_id' });

      if (deviceError) {
        console.error('[Outbox Sync] Failed to ensure device registration:', deviceError);
        setIsSyncing(false);
        setSyncStatus(null);
        return;
      }
    } catch (deviceExc) {
      console.error('[Outbox Sync] Exception during device registration check:', deviceExc);
      setIsSyncing(false);
      setSyncStatus(null);
      return;
    }

    let succeededCount = 0;

    for (const entry of unsynced) {
      try {
        let error: any = null;

        // Route the replay payload to its respective API controller endpoint
        if (entry.type === 'report') {
          const res = await supabase.from('pet_policy_reports').insert(entry.payload);
          error = res.error;
        } else if (entry.type === 'place') {
          const res = await supabase.rpc('create_place_with_report', {
            p_name: entry.payload.p_name,
            p_address: entry.payload.p_address,
            p_city: entry.payload.p_city,
            p_province: entry.payload.p_province,
            p_category: entry.payload.p_category,
            p_latitude: entry.payload.p_latitude,
            p_longitude: entry.payload.p_longitude,
            p_device_id: entry.payload.p_device_id,
            p_claim: entry.payload.p_claim,
            p_notes: entry.payload.p_notes,
          });
          error = res.error;
        } else if (entry.type === 'flag') {
          const res = await supabase.from('flags').insert(entry.payload);
          error = res.error;
        }

        if (error) {
          console.error(`[Outbox Sync] Failed to sync report ${entry.id}:`, error);
          break; // Stop immediately; retry on the next online/visibility trigger
        }

        // Clean up database storage immediately on success
        await deletePendingReport(entry.id);
        succeededCount++;
      } catch (err) {
        console.error(`[Outbox Sync] Exception thrown replaying report ${entry.id}:`, err);
        break; // Stop and retry next cycle
      }
    }

    // Display status update briefly to provide visual assurance to the user
    if (succeededCount > 0) {
      setSyncStatus(`All synced ✓ (${succeededCount} contribution${succeededCount > 1 ? 's' : ''} uploaded)`);
      setTimeout(() => {
        setSyncStatus(null);
      }, 3000);
    } else {
      setSyncStatus(null);
    }
    setIsSyncing(false);
  }, [isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flushOutbox();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        flushOutbox();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Run immediately on startup to clear anything cached in previous browser sessions
    if (navigator.onLine) {
      flushOutbox();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flushOutbox]);

  return {
    isOnline,
    isSyncing,
    syncStatus,
  };
}
