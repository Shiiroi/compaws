import { uuidv4 } from '../utils/uuid';

/**
 * Represents an offline report queued in IndexedDB for remote synchronization.
 * Supports multiple payload schemas distinguished by the `type` discriminator.
 */
export interface PendingReport {
  /** Unique primary key for this outbox record. */
  id: string;
  /** Categorizes the target database operation:
   * - 'report': policy updates on existing places
   * - 'place': new places submitted with an initial report
   * - 'flag': moderation flags on places
   */
  type: 'report' | 'place' | 'flag';
  /** Payload parameters matching the destination API endpoint structure. */
  payload: any;
  /** ISO timestamp recording when the record was cached locally. */
  created_at: string;
  /** Synchronization status flag. Defaults to false. */
  synced: boolean;
}

const DB_NAME = 'compaws-outbox';
const DB_VERSION = 1;
const STORE_NAME = 'pending-reports';

/**
 * Opens a connection to the IndexedDB outbox database.
 * Creates the object store when initializing the database for the first time.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Queues a report payload into the IndexedDB outbox database.
 * 
 * Rationale: Captures user submissions offline so browser refreshes or closures do not lose data.
 * 
 * @param {'report' | 'place' | 'flag'} type - Schema discriminator.
 * @param {any} payload - Submission parameters.
 * @returns {Promise<PendingReport>} The cached outbox record.
 */
export async function addPendingReport(type: 'report' | 'place' | 'flag', payload: any): Promise<PendingReport> {
  const db = await openDB();
  const report: PendingReport = {
    id: uuidv4(),
    type,
    payload,
    created_at: new Date().toISOString(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(report);

    request.onsuccess = () => resolve(report);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves all pending outbox records from IndexedDB.
 * 
 * @returns {Promise<PendingReport[]>} Array of cached outbox records.
 */
export async function getPendingReports(): Promise<PendingReport[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Marks an outbox record as synced in IndexedDB.
 * 
 * @param {string} id - Unique identifier of the outbox record.
 */
export async function markReportSynced(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const report = getRequest.result as PendingReport | undefined;
      if (report) {
        report.synced = true;
        const putRequest = store.put(report);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Deletes a synchronized report from the local IndexedDB outbox.
 * 
 * Immediate deletion rationale: Prevents unbounded storage growth after Supabase verifies receipt.
 * 
 * @param {string} id - Unique identifier of the outbox record.
 */
export async function deletePendingReport(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
