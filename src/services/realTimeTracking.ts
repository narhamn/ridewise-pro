import { DriverLocation, TrackingLog, Schedule } from '@/types/shuttle';

export type RealTimeEventData =
  | { type: 'location_update'; data: DriverLocation }
  | { type: 'schedule_update'; data: Schedule }
  | { type: 'driver_status_change'; data: { driverId: string; status: string } }
  | { type: 'booking_update'; data: { bookingId: string; status: string } }
  | { type: 'connection_status'; data: { status: 'connected' | 'disconnected' | 'error' } };

export interface RealTimeEvent {
  type: 'location_update' | 'schedule_update' | 'driver_status_change' | 'booking_update' | 'connection_status';
  data: RealTimeEventData['data'];
  timestamp: string;
}

export interface RealTimeTrackingConfig {
  updateInterval: number;
  enableWebSocket: boolean;
  webSocketUrl?: string;
  enableGeofencing: boolean;
  enableHistoryTracking: boolean;
  maxHistoryPoints: number;
}

class RealTimeTrackingService {
  private subscribers: Map<string, (event: RealTimeEvent) => void> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private wsConnection: WebSocket | null = null;
  private config: RealTimeTrackingConfig;
  private isConnected = false;
  private failureCount = 0;
  private maxRetries = 5;

  constructor(config: Partial<RealTimeTrackingConfig> = {}) {
    this.config = {
      updateInterval: 3000,
      enableWebSocket: false,
      enableGeofencing: true,
      enableHistoryTracking: true,
      maxHistoryPoints: 100,
      ...config
    };
  }

  // Subscribe to real-time events
  subscribe(eventType: string, callback: (event: RealTimeEvent) => void): () => void {
    this.subscribers.set(eventType, callback);

    return () => {
      this.subscribers.delete(eventType);
    };
  }

  // Initialize real-time tracking
  async initialize(): Promise<void> {
    if (this.config.enableWebSocket && this.config.webSocketUrl) {
      await this.connectWebSocket();
    } else {
      this.startPollingUpdates();
    }
  }

  // Connect to WebSocket for real-time updates
  private async connectWebSocket(): Promise<void> {
    if (!this.config.webSocketUrl) return;

    try {
      this.wsConnection = new WebSocket(this.config.webSocketUrl);

      this.wsConnection.onopen = () => {
        this.isConnected = true;
        console.log('Real-time tracking WebSocket connected');
        this.notifySubscribers({
          type: 'connection_status',
          data: { status: 'connected' },
          timestamp: new Date().toISOString()
        });
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data: RealTimeEvent = JSON.parse(event.data);
          this.notifySubscribers(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.wsConnection.onclose = () => {
        this.isConnected = false;
        console.log('Real-time tracking WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      // Fallback to polling
      this.startPollingUpdates();
    }
  }

  // Start polling for updates (fallback when WebSocket is not available)
  private startPollingUpdates(): void {
    this.updateInterval = setInterval(async () => {
      try {
        await this.fetchUpdates();
        // Reset failure count on success
        this.failureCount = 0;
      } catch (error) {
        this.failureCount++;
        
        // Log error only on first failure or every 10 attempts to reduce noise
        if (this.failureCount === 1 || this.failureCount % 10 === 0) {
          console.warn(`[RealTimeTracking] Fetch failed (attempt ${this.failureCount}):`, error);
        }
        
        // Stop polling after too many failures
        if (this.failureCount >= this.maxRetries) {
          console.warn('[RealTimeTracking] Max retries exceeded, stopping polling');
          if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
          }
        }
      }
    }, this.config.updateInterval);
  }

  // Fetch updates from API
  private async fetchUpdates(): Promise<void> {
    try {
      // Simulate API calls - replace with actual API endpoints
      const [locationsResponse, schedulesResponse] = await Promise.all([
        fetch('/api/driver-locations').catch(() => {
          // Silently handle fetch errors - endpoints may not exist in development
          return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }),
        fetch('/api/active-schedules').catch(() => {
          // Silently handle fetch errors - endpoints may not exist in development
          return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
        })
      ]);

      // Process locations response
      if (locationsResponse.ok) {
        try {
          const contentType = locationsResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const locations: DriverLocation[] = await locationsResponse.json();
            locations.forEach(location => {
              this.notifySubscribers({
                type: 'location_update',
                data: location,
                timestamp: new Date().toISOString()
              });
            });
          }
          // Silently skip invalid content types - API may not be available
        } catch (parseError) {
          // Silently handle parse errors - API response may be HTML error page
        }
      }

      // Process schedules response
      if (schedulesResponse.ok) {
        try {
          const contentType = schedulesResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const schedules: Schedule[] = await schedulesResponse.json();
            schedules.forEach(schedule => {
              this.notifySubscribers({
                type: 'schedule_update',
                data: schedule,
                timestamp: new Date().toISOString()
              });
            });
          }
          // Silently skip invalid content types - API may not be available
        } catch (parseError) {
          // Silently handle parse errors - API response may be HTML error page
        }
      }
    } catch (error) {
      // Only log truly unexpected errors
      if (!(error instanceof Error && (error.message.includes('fetch') || error.message.includes('network')))) {
        console.error('Failed to fetch updates:', error);
      }
    }
  }

  // Send location update (for mobile apps/drivers)
  async sendLocationUpdate(location: DriverLocation): Promise<void> {
    if (this.wsConnection && this.isConnected) {
      this.wsConnection.send(JSON.stringify({
        type: 'location_update',
        data: location,
        timestamp: new Date().toISOString()
      }));
    } else {
      // Fallback to HTTP POST
      try {
        await fetch('/api/driver-locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(location)
        });
      } catch (error) {
        console.error('Failed to send location update:', error);
      }
    }
  }

  // Send driver status change
  async sendDriverStatusChange(driverId: string, status: string): Promise<void> {
    const event: RealTimeEvent = {
      type: 'driver_status_change',
      data: { driverId, status },
      timestamp: new Date().toISOString()
    };

    if (this.wsConnection && this.isConnected) {
      this.wsConnection.send(JSON.stringify(event));
    } else {
      try {
        await fetch('/api/driver-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event.data)
        });
      } catch (error) {
        console.error('Failed to send driver status change:', error);
      }
    }
  }

  // Notify all subscribers of an event
  private notifySubscribers(event: RealTimeEvent): void {
    this.subscribers.forEach((callback, eventType) => {
      if (eventType === event.type || eventType === 'all') {
        callback(event);
      }
    });
  }

  // Check if geofence is triggered
  checkGeofence(location: DriverLocation, geofence: { lat: number; lng: number; radius: number }): boolean {
    if (!this.config.enableGeofencing) return false;

    const distance = this.calculateDistance(
      location.latitude,
      location.longitude,
      geofence.lat,
      geofence.lng
    );

    return distance <= geofence.radius;
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Get connection status
  getConnectionStatus(): { connected: boolean; type: 'websocket' | 'polling' } {
    return {
      connected: this.isConnected,
      type: this.wsConnection ? 'websocket' : 'polling'
    };
  }

  // Cleanup resources
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }

    this.subscribers.clear();
    this.isConnected = false;
  }
}

// Singleton instance
let trackingService: RealTimeTrackingService | null = null;

export const getRealTimeTrackingService = (config?: Partial<RealTimeTrackingConfig>): RealTimeTrackingService => {
  if (!trackingService) {
    trackingService = new RealTimeTrackingService(config);
  }
  return trackingService;
};

export default RealTimeTrackingService;