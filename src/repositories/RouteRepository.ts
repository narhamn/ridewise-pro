import { BaseRepository } from './BaseRepository';
import { Route, RoutePoint } from '@/types/shuttle';
import { supabase } from '@/lib/supabase';

export class RouteRepository extends BaseRepository<Route> {
  constructor() {
    super('routes');
  }

  async getPoints(routeId: string): Promise<RoutePoint[]> {
    const { data, error } = await supabase
      .from('route_points')
      .select('*')
      .eq('route_id', routeId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data as RoutePoint[];
  }

  async getByRayon(rayon: string): Promise<Route[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('rayon', rayon);

    if (error) throw error;
    return data as Route[];
  }
}

export const routeRepository = new RouteRepository();
