import { Injectable } from '@angular/core';
import { CallsignEntry, CallsignLookupResult } from '../_models/callsign-lookup.model';

@Injectable({
  providedIn: 'root'
})
export class CallsignLookupService {
  private readonly DB_NAME = 'callsign-db';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'callsigns';
  private readonly META_STORE = 'meta';
  private readonly CSV_URL = 'https://raw.githubusercontent.com/payne/ham-radio-data/refs/heads/main/people.csv';

  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {}

  /**
   * Initialize the database. Downloads data from CSV if not already cached.
   * Call this before using lookup methods, or they will call it automatically.
   */
  async initialize(): Promise<void> {
    if (this.db) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    this.db = await this.openDatabase();

    const isPopulated = await this.isDatabasePopulated();
    if (!isPopulated) {
      console.log('CallsignLookupService: Downloading callsign data...');
      await this.downloadAndStoreData();
      console.log('CallsignLookupService: Callsign data loaded successfully');
    } else {
      console.log('CallsignLookupService: Using cached callsign data');
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB: ' + request.error?.message));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create callsigns store with callSign as key for fast lookups
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'callSign' });
          // Index for partial matching searches
          store.createIndex('callSignUpper', 'callSignUpper', { unique: false });
        }

        // Create meta store for tracking data status
        if (!db.objectStoreNames.contains(this.META_STORE)) {
          db.createObjectStore(this.META_STORE, { keyPath: 'key' });
        }
      };
    });
  }

  private async isDatabasePopulated(): Promise<boolean> {
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.META_STORE], 'readonly');
      const store = transaction.objectStore(this.META_STORE);
      const request = store.get('dataLoaded');

      request.onsuccess = () => {
        resolve(request.result?.value === true);
      };

      request.onerror = () => {
        resolve(false);
      };
    });
  }

  private async downloadAndStoreData(): Promise<void> {
    const response = await fetch(this.CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to download callsign data: ${response.statusText}`);
    }

    const csvText = await response.text();
    const entries = this.parseCSV(csvText);

    await this.storeEntries(entries);
    await this.markDataLoaded();
  }

  private parseCSV(csvText: string): CallsignEntry[] {
    const lines = csvText.split('\n');
    const entries: CallsignEntry[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parsed = this.parseCSVLine(line);
      if (parsed.length >= 3) {
        entries.push({
          callSign: parsed[0].toUpperCase(),
          firstName: parsed[1],
          lastName: parsed[2]
        });
      }
    }

    return entries;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private async storeEntries(entries: CallsignEntry[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Store in batches to avoid blocking the UI
    const batchSize = 5000;

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      await this.storeBatch(batch);
    }
  }

  private storeBatch(entries: CallsignEntry[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      entries.forEach(entry => {
        store.put({
          ...entry,
          callSignUpper: entry.callSign.toUpperCase()
        });
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private markDataLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.META_STORE], 'readwrite');
      const store = transaction.objectStore(this.META_STORE);

      store.put({ key: 'dataLoaded', value: true, timestamp: Date.now() });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Look up a person by their exact call sign
   * @param callSign The call sign to look up (case insensitive)
   * @returns The person's information or null if not found
   */
  async lookupCallsign(callSign: string): Promise<CallsignLookupResult | null> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(callSign.toUpperCase());

      request.onsuccess = () => {
        const entry = request.result as CallsignEntry | undefined;
        if (entry) {
          resolve({
            callSign: entry.callSign,
            firstName: entry.firstName,
            lastName: entry.lastName,
            fullName: `${entry.lastName}, ${entry.firstName}`
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error('Failed to lookup callsign: ' + request.error?.message));
      };
    });
  }

  /**
   * Search for call signs that start with or contain the given partial string
   * @param partialCallSign The partial call sign to search for (case insensitive)
   * @param maxResults Maximum number of results to return (default 50)
   * @returns Array of matching entries (prefix matches first, then contains matches)
   */
  async searchCallsigns(partialCallSign: string, maxResults: number = 50): Promise<CallsignLookupResult[]> {
    await this.initialize();

    const searchTerm = partialCallSign.toUpperCase();
    const prefixResults: CallsignLookupResult[] = [];
    const containsResults: CallsignLookupResult[] = [];
    const seenCallsigns = new Set<string>();

    // First, get prefix matches (fast, using index)
    await new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('callSignUpper');

      const range = IDBKeyRange.bound(searchTerm, searchTerm + '\uffff');
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor && prefixResults.length < maxResults) {
          const entry = cursor.value as CallsignEntry;
          seenCallsigns.add(entry.callSign);
          prefixResults.push({
            callSign: entry.callSign,
            firstName: entry.firstName,
            lastName: entry.lastName,
            fullName: `${entry.lastName}, ${entry.firstName}`
          });
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error('Failed to search callsigns: ' + request.error?.message));
    });

    // If we already have enough results from prefix search, return them
    if (prefixResults.length >= maxResults) {
      return prefixResults.slice(0, maxResults);
    }

    // Otherwise, scan for "contains" matches to fill remaining slots
    const remainingSlots = maxResults - prefixResults.length;

    await new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor && containsResults.length < remainingSlots) {
          const entry = cursor.value as CallsignEntry;
          // Check if callsign contains search term (but not as prefix, those are already included)
          if (!seenCallsigns.has(entry.callSign) && entry.callSign.includes(searchTerm)) {
            containsResults.push({
              callSign: entry.callSign,
              firstName: entry.firstName,
              lastName: entry.lastName,
              fullName: `${entry.lastName}, ${entry.firstName}`
            });
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(new Error('Failed to search callsigns: ' + request.error?.message));
    });

    // Return prefix matches first, then contains matches
    return [...prefixResults, ...containsResults];
  }

  /**
   * Get the person's name in "LastName, FirstName" format
   * @param callSign The call sign to look up
   * @returns The formatted name or null if not found
   */
  async getFormattedName(callSign: string): Promise<string | null> {
    const result = await this.lookupCallsign(callSign);
    return result ? result.fullName : null;
  }

  /**
   * Check if the database has been populated with data
   */
  async isDataLoaded(): Promise<boolean> {
    await this.initialize();
    return this.isDatabasePopulated();
  }

  /**
   * Force a refresh of the callsign data from the remote source
   */
  async refreshData(): Promise<void> {
    await this.initialize();

    // Clear existing data
    await new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORE_NAME, this.META_STORE], 'readwrite');
      const callsignStore = transaction.objectStore(this.STORE_NAME);
      const metaStore = transaction.objectStore(this.META_STORE);

      callsignStore.clear();
      metaStore.clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    // Re-download data
    await this.downloadAndStoreData();
  }
}
