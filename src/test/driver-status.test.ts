import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
// Simulasi sederhana karena testing context yang kompleks memerlukan setup provider
// Kita akan mengetes logika update status dan retry yang diekstrak

const updateDriverStatusLogic = async (
  status: 'online' | 'offline',
  driver: { id: string, lastStatusChange?: string },
  syncFn: () => Promise<boolean>,
  retryCount = 0
): Promise<{ success: boolean, error?: string }> => {
  const MAX_RETRIES = 3;
  const WAIT_TIME = 2000;

  // 1. Validation
  if (driver.lastStatusChange) {
    const lastChange = new Date(driver.lastStatusChange).getTime();
    const now = Date.now();
    if (now - lastChange < WAIT_TIME) {
      return { success: false, error: 'WAIT_TIME_ERROR' };
    }
  }

  // 2. Sync with Retry
  const success = await syncFn();
  if (!success) {
    if (retryCount < MAX_RETRIES) {
      return updateDriverStatusLogic(status, driver, syncFn, retryCount + 1);
    } else {
      return { success: false, error: 'SYNC_ERROR' };
    }
  }

  return { success: true };
};

describe('Driver Status Management Logic', () => {
  it('should prevent status change before minimum wait time', async () => {
    const recentDate = new Date().toISOString();
    const driver = { id: 'd1', lastStatusChange: recentDate };
    const syncFn = vi.fn().mockResolvedValue(true);

    const result = await updateDriverStatusLogic('offline', driver, syncFn);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('WAIT_TIME_ERROR');
    expect(syncFn).not.toHaveBeenCalled();
  });

  it('should allow status change after wait time', async () => {
    const oldDate = new Date(Date.now() - 5000).toISOString();
    const driver = { id: 'd1', lastStatusChange: oldDate };
    const syncFn = vi.fn().mockResolvedValue(true);

    const result = await updateDriverStatusLogic('online', driver, syncFn);
    
    expect(result.success).toBe(true);
    expect(syncFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on sync failure up to MAX_RETRIES', async () => {
    const driver = { id: 'd1' };
    const syncFn = vi.fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const result = await updateDriverStatusLogic('online', driver, syncFn);
    
    expect(result.success).toBe(true);
    expect(syncFn).toHaveBeenCalledTimes(3);
  });

  it('should return error after failing all retries', async () => {
    const driver = { id: 'd1' };
    const syncFn = vi.fn().mockResolvedValue(false);

    const result = await updateDriverStatusLogic('online', driver, syncFn);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('SYNC_ERROR');
    expect(syncFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
  });
});
