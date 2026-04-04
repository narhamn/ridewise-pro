import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DriverStatusCard } from './DriverStatusCard';
import { Driver } from '@/types/shuttle';

const mockDriver: Driver = {
  id: 'd1',
  name: 'Test Driver',
  phoneNumber: '0812345678',
  licenseNumber: 'SIM-123',
  status: 'offline',
  rating: 4.5,
  totalTrips: 10,
  joinDate: '2023-01-01',
};

describe('DriverStatusCard', () => {
  it('renders offline status correctly', () => {
    render(<DriverStatusCard driver={mockDriver} onToggle={async () => true} />);
    
    expect(screen.getByText('Driver Tidak Aktif')).toBeDefined();
    expect(screen.getByText('Go Online')).toBeDefined();
    expect(screen.getByText(/Terakhir:/)).toBeDefined();
  });

  it('renders online status correctly', () => {
    const onlineDriver = { ...mockDriver, status: 'online' as const };
    render(<DriverStatusCard driver={onlineDriver} onToggle={async () => true} />);
    
    expect(screen.getByText('Driver Aktif')).toBeDefined();
    expect(screen.getByText('Go Offline')).toBeDefined();
  });

  it('calls onToggle when button is clicked', async () => {
    const onToggle = vi.fn().mockResolvedValue(true);
    render(<DriverStatusCard driver={mockDriver} onToggle={onToggle} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onToggle).toHaveBeenCalledWith('online');
    expect(screen.getByText('Memproses...')).toBeDefined();
    
    await waitFor(() => {
      expect(screen.queryByText('Memproses...')).toBeNull();
    });
  });

  it('formats timestamp correctly', () => {
    const driverWithTime = { 
      ...mockDriver, 
      lastStatusChange: '2024-04-04T10:30:00.000Z' 
    };
    render(<DriverStatusCard driver={driverWithTime} onToggle={async () => true} />);
    
    // The format depends on local time zone, but we can check if it contains WIB
    expect(screen.getByText(/WIB/)).toBeDefined();
  });
});
