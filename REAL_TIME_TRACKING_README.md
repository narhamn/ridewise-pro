# Real-Time Map Tracking System

## Overview

The PYU GO application now features a comprehensive real-time map tracking system that provides live location updates for drivers, passengers, and fleet management. This system enhances the existing map functionality with advanced real-time capabilities.

## Architecture

### Core Components

1. **RealTimeMap Component** (`src/components/RealTimeMap.tsx`)
   - Main map component with real-time driver tracking
   - Supports traffic layers, geofencing, and history trails
   - Enhanced marker icons based on driver status and activity

2. **RealTimeTrackingService** (`src/services/realTimeTracking.ts`)
   - Core service for managing real-time data connections
   - Supports both WebSocket and polling fallbacks
   - Handles geofencing, location updates, and event management

3. **useRealTimeTracking Hook** (`src/hooks/useRealTimeTracking.ts`)
   - React hook for easy integration of real-time tracking
   - Manages connection state and data synchronization
   - Provides callbacks for location and status updates

### Updated Pages

- **AdminTracking** (`src/pages/admin/AdminTracking.tsx`)
  - Enhanced with real-time fleet monitoring
  - Connection status indicators
  - Advanced filtering and search capabilities

- **CustomerBookingDetail** (`src/pages/customer/CustomerBookingDetail.tsx`)
  - Real-time shuttle tracking for passengers
  - Live status updates and location information

## Features

### Real-Time Driver Tracking
- Live location updates every 2-3 seconds
- Dynamic marker icons showing driver status (moving, stopped, online/offline)
- Speed and accuracy information display
- Connection status monitoring

### Enhanced Map Visualization
- **Traffic Layer**: Optional traffic overlay for route planning
- **Geofencing**: Pickup zone visualization with 100m radius circles
- **History Trails**: Driver movement history with customizable trail length
- **Route Visualization**: Color-coded routes based on schedule status

### Interactive Features
- Click-to-focus on drivers
- Real-time popup information
- Search and filter capabilities
- Responsive design for mobile and desktop

### Connection Management
- Automatic fallback from WebSocket to polling
- Connection status indicators
- Reconnection handling
- Error recovery and user notifications

## Configuration

### RealTimeTrackingService Configuration

```typescript
const config: RealTimeTrackingConfig = {
  updateInterval: 2000,        // Update frequency in milliseconds
  enableWebSocket: false,      // Enable WebSocket connections
  webSocketUrl: 'ws://...',   // WebSocket endpoint
  enableGeofencing: true,      // Enable geofence calculations
  enableHistoryTracking: true, // Track movement history
  maxHistoryPoints: 200        // Maximum history points to keep
};
```

### RealTimeMap Props

```typescript
interface RealTimeMapProps {
  center?: [number, number];           // Map center coordinates
  zoom?: number;                       // Initial zoom level
  showTraffic?: boolean;               // Show traffic layer
  showGeofences?: boolean;             // Show pickup zones
  enableClustering?: boolean;          // Enable marker clustering
  showHistory?: boolean;               // Show movement history
  updateInterval?: number;             // Update frequency
  onDriverClick?: (driverId: string) => void; // Driver click handler
}
```

## Usage Examples

### Basic Real-Time Map

```tsx
import RealTimeMap from '@/components/RealTimeMap';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';

const MyComponent = () => {
  const {
    driverLocations,
    activeSchedules,
    isConnected
  } = useRealTimeTracking();

  return (
    <RealTimeMap
      driverLocations={driverLocations}
      activeSchedules={activeSchedules}
      showTraffic={true}
      showGeofences={true}
      onDriverClick={(driverId) => console.log('Driver clicked:', driverId)}
    />
  );
};
```

### Admin Fleet Tracking

```tsx
const AdminTracking = () => {
  const { driverLocations, isConnected, connectionType } = useRealTimeTracking({
    config: { updateInterval: 2000 }
  });

  return (
    <div>
      <Badge className={isConnected ? 'bg-green-500' : 'bg-red-500'}>
        {isConnected ? '🟢' : '🔴'} {connectionType.toUpperCase()}
      </Badge>

      <RealTimeMap
        driverLocations={driverLocations}
        showHistory={true}
        enableClustering={true}
      />
    </div>
  );
};
```

### Customer Shuttle Tracking

```tsx
const CustomerView = () => {
  const { driverLocations } = useRealTimeTracking({
    config: { updateInterval: 3000 }
  });

  return (
    <RealTimeMap
      driverLocations={driverLocations}
      showTraffic={false}
      showGeofences={false}
      enableClustering={false}
    />
  );
};
```

## API Integration

### WebSocket Events

The system supports WebSocket connections for real-time updates. Expected message format:

```json
{
  "type": "location_update",
  "data": {
    "driverId": "driver-123",
    "latitude": 3.5952,
    "longitude": 98.6722,
    "speed": 45.5,
    "accuracy": 5.2,
    "heading": 90,
    "altitude": 50,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### HTTP Polling Fallback

When WebSocket is unavailable, the system falls back to HTTP polling:

```typescript
// GET /api/driver-locations
// Returns: DriverLocation[]

// GET /api/active-schedules
// Returns: Schedule[]
```

## Performance Considerations

### Optimization Strategies

1. **Update Frequency**: Admin views use 2-second intervals, customer views use 3-second intervals
2. **History Limiting**: Maximum 200 history points per driver to prevent memory issues
3. **Marker Clustering**: Enabled for admin views with many drivers
4. **Lazy Loading**: Map components only initialize when tracking is active

### Memory Management

- Automatic cleanup of inactive markers and routes
- History trail pruning based on configurable limits
- WebSocket connection cleanup on component unmount

## Security Features

### Data Validation

- Location data validation on client and server
- Rate limiting for API endpoints
- Authentication checks for WebSocket connections

### Privacy Protection

- Location data anonymization options
- Configurable data retention policies
- Secure WebSocket connections (WSS)

## Testing

The real-time tracking system includes comprehensive tests:

```bash
npm test
```

Test coverage includes:
- Real-time data synchronization
- Connection management and fallbacks
- Geofencing calculations
- Component rendering and interactions

## Future Enhancements

### Planned Features

1. **WebSocket Support**: Full WebSocket implementation for true real-time updates
2. **Offline Mode**: Location caching and sync when connection is restored
3. **Route Optimization**: Real-time route recalculation based on traffic
4. **Push Notifications**: Arrival notifications and status updates
5. **Analytics**: Movement pattern analysis and performance metrics

### Scalability Improvements

1. **Load Balancing**: Distribute tracking load across multiple servers
2. **Data Compression**: Reduce bandwidth usage for location updates
3. **Caching Layer**: Redis-based caching for frequently accessed data
4. **Microservices**: Separate tracking service for better scalability

## Troubleshooting

### Common Issues

1. **Connection Problems**
   - Check network connectivity
   - Verify WebSocket/WebSocket URL configuration
   - Check browser console for connection errors

2. **Performance Issues**
   - Reduce update frequency for slower devices
   - Disable history trails for memory-constrained devices
   - Enable marker clustering for dense driver areas

3. **Map Rendering Issues**
   - Clear browser cache
   - Check Leaflet CSS loading
   - Verify coordinate data format

### Debug Mode

Enable debug logging:

```typescript
const service = getRealTimeTrackingService({
  // ... config
});

// Enable debug logging
console.log('Connection status:', service.getConnectionStatus());
```

## Contributing

When contributing to the real-time tracking system:

1. Maintain backward compatibility with existing map components
2. Add comprehensive tests for new features
3. Update documentation for configuration changes
4. Consider performance impact on mobile devices
5. Test with various network conditions

## License

This real-time tracking system is part of the PYU GO application and follows the same licensing terms.