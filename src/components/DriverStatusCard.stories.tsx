import type { Meta, StoryObj } from '@storybook/react';
import { DriverStatusCard } from './DriverStatusCard';
import { vi } from 'vitest';

const meta: Meta<typeof DriverStatusCard> = {
  title: 'Components/DriverStatusCard',
  component: DriverStatusCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DriverStatusCard>;

const mockOnToggle = async (status: 'online' | 'offline') => {
  console.log('Toggled to:', status);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return true;
};

export const Offline: Story = {
  args: {
    driver: {
      id: 'd1',
      name: 'Budi Santoso',
      phoneNumber: '0812345678',
      licenseNumber: 'SIM-123',
      status: 'offline',
      rating: 4.8,
      totalTrips: 150,
      joinDate: '2023-01-01',
      lastStatusChange: new Date().toISOString(),
    },
    onToggle: mockOnToggle,
  },
};

export const Online: Story = {
  args: {
    driver: {
      ...Offline.args!.driver!,
      status: 'online',
    },
    onToggle: mockOnToggle,
  },
};

export const Loading: Story = {
  args: {
    ...Online.args,
  },
  // To demonstrate loading, we would need to control the internal state of the component
  // which is not directly possible via args in this simple implementation.
  // But in a real storybook, we could wrap it in a controller.
};
