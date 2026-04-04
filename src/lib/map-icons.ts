/**
 * Map Icons Utility
 * Membuat custom Leaflet icons untuk driver, route points, dan waypoints
 */

import L from 'leaflet';
import { Driver, Schedule, RoutePoint } from '@/types/shuttle';

export type DriverStatusType = 'online-moving' | 'online-stopped' | 'offline' | 'on-trip';
export type RoutePointType = 'origin' | 'destination' | 'intermediate' | 'pickup' | 'dropoff';

/**
 * Membuat icon untuk driver dengan status
 */
export const createDriverIcon = (
  status: DriverStatusType,
  isSelected: boolean = false,
  hasActiveTrip: boolean = false
) => {
  const iconMap: Record<DriverStatusType, { color: string; bgColor: string; emoji: string }> = {
    'online-moving': { color: '#10b981', bgColor: '#ecfdf5', emoji: '🚐' },
    'online-stopped': { color: '#f59e0b', bgColor: '#fffbeb', emoji: '⏹️' },
    'offline': { color: '#6b7280', bgColor: '#f3f4f6', emoji: '📵' },
    'on-trip': { color: '#3b82f6', bgColor: '#eff6ff', emoji: '🚙' },
  };

  const { color, bgColor, emoji } = iconMap[status];
  const size = isSelected ? 56 : 40;
  const borderWidth = isSelected ? 4 : 2;

  const html = `
    <div class="driver-marker-container relative">
      <div class="driver-marker" style="
        width: ${size}px;
        height: ${size}px;
        background: ${bgColor};
        border: ${borderWidth}px solid ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: all 0.2s ease;
        cursor: pointer;
        ${isSelected ? `transform: scale(1.2); box-shadow: 0 4px 12px ${color}40;` : ''}
      ">
        ${emoji}
      </div>
      ${hasActiveTrip ? `
        <div class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-white" style="
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        "></div>
      ` : ''}
      ${status === 'online-moving' ? `
        <div class="absolute inset-0 rounded-full" style="
          border: 2px solid ${color};
          opacity: 0.5;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
      ` : ''}
    </div>
  `;

  return L.divIcon({
    className: 'driver-icon-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 10)],
  });
};

/**
 * Membuat icon untuk route point (pickup/dropoff)
 */
export const createRoutePointIcon = (
  type: RoutePointType,
  order: number = 0,
  isActive: boolean = false,
  isSelected: boolean = false
) => {
  const typeConfig: Record<RoutePointType, { color: string; bgColor: string; icon: string; label: string }> = {
    'origin': { color: '#10b981', bgColor: '#ecfdf5', icon: '🏁', label: 'Awal' },
    'destination': { color: '#ef4444', bgColor: '#fef2f2', icon: '🎯', label: 'Akhir' },
    'intermediate': { color: '#3b82f6', bgColor: '#eff6ff', icon: '📍', label: 'Point' },
    'pickup': { color: '#8b5cf6', bgColor: '#faf5ff', icon: '🚪', label: 'Jemput' },
    'dropoff': { color: '#06b6d4', bgColor: '#ecfdf5', icon: '📍', label: 'Antar' },
  };

  const config = typeConfig[type];
  const size = isSelected ? 48 : 40;
  const borderWidth = isSelected ? 3 : 2;

  const html = `
    <div class="route-point-marker-container relative">
      <div class="route-point-marker" style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, ${config.color}, ${config.color}dd);
        border: ${borderWidth}px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        color: white;
        font-weight: bold;
        position: relative;
        ${isSelected ? `transform: scale(1.15);` : ''}
        ${isActive ? `animation: bounce 1s ease-in-out infinite;` : ''}
      ">
        ${config.icon}
      </div>
      <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none">
        <span class="text-xs font-bold px-2 py-1 rounded-full" style="
          background: ${config.color};
          color: white;
          opacity: ${isActive ? '1' : '0.7'};
        ">
          ${order > 0 ? `#${order}` : config.label}
        </span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'route-point-icon-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 20)],
  });
};

/**
 * Membuat icon untuk vehicle/depot
 */
export const createDepotIcon = () => {
  const size = 40;
  const html = `
    <div class="depot-marker-container" style="
      width: ${size}px;
      height: ${size}px;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    ">
      🏢
    </div>
  `;

  return L.divIcon({
    className: 'depot-icon-marker',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 10)],
  });
};

/**
 * Membuat polyline untuk rute dengan styling berdasarkan status
 */
export const createRouteLine = (
  latlngs: L.LatLngExpression[],
  status: Schedule['status'] = 'scheduled',
  isActive: boolean = false
) => {
  const statusConfig: Record<Schedule['status'], { color: string; weight: number; dashArray?: string }> = {
    'scheduled': { color: '#94a3b8', weight: 3, dashArray: '10, 5' },
    'boarding': { color: '#f59e0b', weight: 4 },
    'departed': { color: '#10b981', weight: 5 },
    'arrived': { color: '#3b82f6', weight: 4 },
    'cancelled': { color: '#ef4444', weight: 2, dashArray: '5, 5' },
  };

  const config = statusConfig[status];

  return L.polyline(latlngs, {
    color: config.color,
    weight: config.weight,
    opacity: isActive ? 0.9 : 0.6,
    dashArray: config.dashArray,
    lineCap: 'round',
    lineJoin: 'round',
    className: 'route-line',
    interactive: true,
  });
};

/**
 * Membuat popup untuk driver dengan informasi detail
 */
export const createDriverPopup = (
  driver: Driver,
  schedule?: Schedule,
  location?: any
) => {
  const distanceKm = location?.accuracy ? (location.accuracy / 1000).toFixed(2) : 'N/A';
  const speed = location?.speed ? (location.speed * 3.6).toFixed(1) : '0'; // m/s ke km/h
  
  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'online': '#10b981',
      'offline': '#6b7280',
      'boarding': '#f59e0b',
      'departed': '#3b82f6',
      'arrived': '#059669',
      'active': '#06b6d4',
      'inactive': '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const html = `
    <div class="map-popup-container" style="min-width: 280px;">
      <div style="
        background: linear-gradient(135deg, ${statusBadge(driver.status)}, ${statusBadge(driver.status)}dd);
        color: white;
        padding: 12px;
        border-radius: 8px 8px 0 0;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span style="font-size: 20px;">${driver.status === 'online' ? '🟢' : '⚫'}</span>
        <div>
          <div>${driver.name}</div>
          <div style="font-size: 12px; opacity: 0.9;">${driver.phoneNumber}</div>
        </div>
      </div>
      
      <div style="
        background: white;
        padding: 12px;
        border-radius: 0 0 8px 8px;
        font-size: 13px;
        line-height: 1.6;
        border: 1px solid #e5e7eb;
        border-top: none;
      ">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; margin-bottom: 8px;">
          <span style="color: #6b7280;">Status:</span>
          <span style="font-weight: 600; color: ${statusBadge(driver.status ? driver.status : 'offline')};">
            ${driver.status?.toUpperCase() || 'OFFLINE'}
          </span>
          
          <span style="color: #6b7280;">📊 Rating:</span>
          <span>⭐ ${driver.rating.toFixed(1)} (${driver.totalTrips} trips)</span>
          
          ${schedule ? `
            <span style="color: #6b7280;">✈️ Trip:</span>
            <span>${schedule.id.substring(0, 8)}...</span>
          ` : ''}
          
          ${location ? `
            <span style="color: #6b7280;">🚀 Kecepatan:</span>
            <span>${speed} km/h</span>
            
            <span style="color: #6b7280;">📍 Akurasi:</span>
            <span>±${distanceKm} km</span>
          ` : ''}
        </div>
        
        <div style="
          border-top: 1px solid #e5e7eb;
          padding-top: 8px;
          margin-top: 8px;
          text-align: center;
        ">
          <button style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s;
          " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
            📞 Hubungi Driver
          </button>
        </div>
      </div>
    </div>
  `;

  return html;
};

/**
 * Membuat popup untuk route point dengan informasi rute
 */
export const createRoutePointPopup = (
  point: RoutePoint,
  order: number,
  nextPoint?: RoutePoint,
  distanceFromStart: number = 0
) => {
  const distanceToNext = nextPoint ? 
    Math.sqrt(Math.pow(nextPoint.lat - point.lat, 2) + Math.pow(nextPoint.lng - point.lng, 2)) * 111000 // rough km to meters conversion
    : 0;

  const html = `
    <div class="map-popup-container" style="min-width: 300px;">
      <div style="
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        padding: 12px;
        border-radius: 8px 8px 0 0;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span style="font-size: 18px;">#${order}</span>
        <div>
          <div>${point.name}</div>
          <div style="font-size: 12px; opacity: 0.9;">Kode: ${point.code || point.id.substring(0, 8)}</div>
        </div>
      </div>
      
      <div style="
        background: white;
        padding: 12px;
        border-radius: 0 0 8px 8px;
        font-size: 13px;
        line-height: 1.6;
        border: 1px solid #e5e7eb;
        border-top: none;
      ">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; margin-bottom: 8px;">
          <span style="color: #6b7280;">📍 Posisi:</span>
          <span style="font-family: monospace; font-size: 12px;">
            ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
          </span>
          
          <span style="color: #6b7280;">💰 Harga:</span>
          <span style="font-weight: 600; color: #059669;">Rp ${point.price?.toLocaleString() || '0'}</span>
          
          ${distanceFromStart > 0 ? `
            <span style="color: #6b7280;">📏 Dari Start:</span>
            <span>${(distanceFromStart / 1000).toFixed(2)} km</span>
          ` : ''}
          
          ${distanceToNext > 0 ? `
            <span style="color: #6b7280;">➡️ Ke Point Selanjutnya:</span>
            <span>${(distanceToNext / 1000).toFixed(2)} km</span>
          ` : ''}
          
          ${(point as any).waiting_time ? `
            <span style="color: #6b7280;">⏱️ Waktu Tunggu:</span>
            <span>${(point as any).waiting_time} menit</span>
          ` : ''}
        </div>
        
        <div style="
          background: #f3f4f6;
          padding: 8px;
          border-radius: 4px;
          margin-top: 8px;
          font-size: 12px;
        ">
          <div style="color: #6b7280; margin-bottom: 4px;">📋 Informasi Rute:</div>
          <div style="color: #374151;">
            Titik ${order} dari rute, harga: Rp ${point.price?.toLocaleString() || '0'}
          </div>
        </div>
      </div>
    </div>
  `;

  return html;
};

/**
 * CSS styles untuk animasi markers
 */
export const getMapStyles = () => `
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes ping {
      75%, 100% {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .driver-icon-marker .driver-marker {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .driver-icon-marker:hover .driver-marker {
      transform: scale(1.1);
    }
    
    .route-point-icon-marker .route-point-marker {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .route-point-icon-marker:hover .route-point-marker {
      transform: scale(1.1);
      filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.3));
    }
    
    .map-popup-container {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    /* Leaflet custom styling */
    .leaflet-popup-content {
      margin: 0;
      padding: 0;
    }
    
    .leaflet-popup-close-button {
      top: 8px;
      right: 8px;
    }
  </style>
`;
