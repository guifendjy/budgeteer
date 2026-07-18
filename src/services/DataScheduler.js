import { PersistenceService } from "./Persistence";

export const DataScheduler = {
  _queues: new Map(), // Tracks active timers
  _buffer: new Map(), // Tracks pending data

  /**
   * Persist data with a debounce
   * @param {string} store - 'bills' or 'budget'
   * @param {object} data - The record to save
   */
  persist(store, data, delay = 800) {
    const key = `${store}:${data.id || data.userId}`;

    // 1. Buffer the latest version of the data
    this._buffer.set(key, { store, data });

    // 2. Clear existing timer for this record
    if (this._queues.has(key)) {
      clearTimeout(this._queues.get(key));
    }

    // 3. Schedule the flush
    const timerId = setTimeout(() => this.flush(key), delay);
    this._queues.set(key, timerId);
  },

  async flush(key) {
    const item = this._buffer.get(key);
    if (!item) return;

    try {
      await PersistenceService.save(item.store, item.data);
      this._buffer.delete(key);
      this._queues.delete(key);
      console.log(`[Scheduler] Flushed: ${key}`);
    } catch (err) {
      console.error(`[Scheduler] Critical Save Error:`, err);
    }
  },

  async forceFlushAll() {
    const tasks = Array.from(this._buffer.keys()).map((k) => this.flush(k));
    await Promise.all(tasks);
  },
};

window.addEventListener("beforeunload", () => {
  DataScheduler.forceFlushAll();
});
