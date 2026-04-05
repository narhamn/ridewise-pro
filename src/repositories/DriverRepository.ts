import { BaseRepository } from './BaseRepository';
import { Driver, VerificationStatus, DriverLocation } from '@/types/shuttle';
import { supabase } from '@/lib/supabase';

export class DriverRepository extends BaseRepository<Driver> {
  constructor() {
    super('drivers');
  }

  async getVerified(): Promise<Driver[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('verification_status', 'approved');

    if (error) throw error;
    return data as Driver[];
  }

  async updateLocation(driverId: string, location: Omit<DriverLocation, 'timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('driver_locations')
      .upsert({
        driver_id: driverId,
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        accuracy: location.accuracy,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async updateVerification(driverId: string, status: VerificationStatus, reason?: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ verification_status: status, rejection_reason: reason })
      .eq('id', driverId);

    if (error) throw error;

    // Log verification change
    await supabase.from('verification_logs').insert({
      registration_id: driverId,
      status,
      reason
    });
  }
}

export const driverRepository = new DriverRepository();
