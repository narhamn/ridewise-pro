import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { ShuttleProvider, useShuttle } from '../contexts/ShuttleContext';
import { NotificationProvider } from '../contexts/NotificationContext';

// Mock Sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>
    <ShuttleProvider>{children}</ShuttleProvider>
  </NotificationProvider>
);

describe('Driver Verification Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent non-admin from verifying driver', async () => {
    const { result } = renderHook(() => useShuttle(), { wrapper });

    // Login as customer
    act(() => {
      result.current.login('customer@example.com', 'password', 'customer');
    });

    // Try to approve a registration
    act(() => {
      result.current.updateRegistrationStatus('reg-1', 'approved');
    });

    // Check if error toast was called
    const { toast } = await import('sonner');
    expect(toast.error).toHaveBeenCalledWith('Hanya administrator yang dapat melakukan verifikasi.');
    
    // Status should still be pending
    const reg = result.current.drivers.find(r => r.id === 'reg-1');
    expect(reg?.verificationStatus).toBe('pending');
  });

  it('should allow admin to approve driver', async () => {
    const { result } = renderHook(() => useShuttle(), { wrapper });

    // Login as admin
    act(() => {
      result.current.login('admin@example.com', 'password', 'admin');
    });

    // Approve a registration
    act(() => {
      result.current.updateRegistrationStatus('reg-1', 'approved');
    });

    // Check if success toast was called
    const { toast } = await import('sonner');
    expect(toast.success).toHaveBeenCalledWith('Status pendaftaran diperbarui menjadi approved');

    // Check if status updated
    const reg = result.current.drivers.find(r => r.id === 'reg-1');
    expect(reg?.verificationStatus).toBe('approved');
    expect(reg?.vehicleDetails?.verificationStatus).toBe('approved');
  });

  it('should prevent approval if duplicate data exists', async () => {
    const { result } = renderHook(() => useShuttle(), { wrapper });

    // Login as admin
    act(() => {
      result.current.login('admin@example.com', 'password', 'admin');
    });

    // 1. Approve reg-1
    act(() => {
      result.current.updateRegistrationStatus('reg-1', 'approved');
    });

    // 2. Submit a new registration with SAME license number as reg-1
    // reg-1 licenseNumber in dummy.ts is '1234-5678-901234'
    act(() => {
      result.current.submitDriverRegistration({
        name: 'Duplicate Driver',
        email: 'dup@example.com',
        phoneNumber: '081234567899',
        licenseNumber: '1234-5678-901234',
        address: 'Test Address',
        vehicleDetails: {
          plateNumber: 'BK 123 DUP',
          brandModel: 'Toyota Hiace',
          year: 2023,
          color: 'White',
          verificationStatus: 'pending'
        },
        documents: []
      });
    });

    const dupReg = result.current.drivers.find(d => d.email === 'dup@example.com');

    // 3. Try to approve the duplicate registration
    act(() => {
      result.current.updateRegistrationStatus(dupReg!.id, 'approved');
    });

    const { toast } = await import('sonner');
    expect(toast.error).toHaveBeenCalledWith('Gagal menyetujui: Data driver atau kendaraan sudah terdaftar dalam sistem.');
  });

  it('should allow admin to reject driver with reason', async () => {
    const { result } = renderHook(() => useShuttle(), { wrapper });

    // Login as admin
    act(() => {
      result.current.login('admin@example.com', 'password', 'admin');
    });

    const reason = 'Dokumen KTP tidak jelas';

    // Reject a registration
    act(() => {
      result.current.updateRegistrationStatus('reg-1', 'rejected', reason);
    });

    // Check if status updated and reason saved
    const reg = result.current.drivers.find(r => r.id === 'reg-1');
    expect(reg?.verificationStatus).toBe('rejected');
    expect(reg?.rejectionReason).toBe(reason);

    // Check if audit log was added
    const lastLog = reg?.logs?.[reg.logs.length - 1];
    expect(lastLog?.status).toBe('rejected');
    expect(lastLog?.reason).toBe(reason);
  });
});
