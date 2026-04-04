import { PickupPoint } from '@/types/shuttle';

// ========== Validation ==========

export interface ValidationError {
  field: string;
  message: string;
}

export const validatePickupPoint = (pickupPoint: Partial<PickupPoint>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!pickupPoint.code || pickupPoint.code.trim() === '') {
    errors.push({ field: 'code', message: 'Kode titik jemput harus diisi' });
  } else if (!/^PK-[A-D]-\d{3}$/.test(pickupPoint.code)) {
    errors.push({ field: 'code', message: 'Format kode harus mengikuti format: PK-A-001' });
  }

  if (!pickupPoint.name || pickupPoint.name.trim() === '') {
    errors.push({ field: 'name', message: 'Nama titik jemput harus diisi' });
  } else if (pickupPoint.name.length < 3) {
    errors.push({ field: 'name', message: 'Nama titik jemput minimal 3 karakter' });
  }

  if (!pickupPoint.rayon) {
    errors.push({ field: 'rayon', message: 'Rayon harus dipilih' });
  }

  if (!pickupPoint.address || pickupPoint.address.trim() === '') {
    errors.push({ field: 'address', message: 'Alamat harus diisi' });
  } else if (pickupPoint.address.length < 5) {
    errors.push({ field: 'address', message: 'Alamat minimal 5 karakter' });
  }

  if (!pickupPoint.city || pickupPoint.city.trim() === '') {
    errors.push({ field: 'city', message: 'Kota harus diisi' });
  }

  if (!pickupPoint.district || pickupPoint.district.trim() === '') {
    errors.push({ field: 'district', message: 'Kecamatan harus diisi' });
  }

  if (!pickupPoint.phone || pickupPoint.phone.trim() === '') {
    errors.push({ field: 'phone', message: 'Nomor telepon harus diisi' });
  } else if (!/^(\+62|0)[0-9\s\-()]{7,}$/.test(pickupPoint.phone.replace(/\s/g, ''))) {
    errors.push({ field: 'phone', message: 'Format nomor telepon tidak valid' });
  }

  if (!pickupPoint.contactPerson || pickupPoint.contactPerson.trim() === '') {
    errors.push({ field: 'contactPerson', message: 'Nama kontak harus diisi' });
  }

  if (pickupPoint.lat === undefined || pickupPoint.lat === null) {
    errors.push({ field: 'lat', message: 'Latitude harus diisi' });
  } else if (isNaN(pickupPoint.lat) || pickupPoint.lat < -90 || pickupPoint.lat > 90) {
    errors.push({ field: 'lat', message: 'Latitude tidak valid' });
  }

  if (pickupPoint.lng === undefined || pickupPoint.lng === null) {
    errors.push({ field: 'lng', message: 'Longitude harus diisi' });
  } else if (isNaN(pickupPoint.lng) || pickupPoint.lng < -180 || pickupPoint.lng > 180) {
    errors.push({ field: 'lng', message: 'Longitude tidak valid' });
  }

  if (pickupPoint.maxCapacity !== undefined && pickupPoint.maxCapacity !== null) {
    if (pickupPoint.maxCapacity <= 0) {
      errors.push({ field: 'maxCapacity', message: 'Kapasitas harus lebih dari 0' });
    }
  }

  if (pickupPoint.estimatedWaitTime !== undefined && pickupPoint.estimatedWaitTime !== null) {
    if (pickupPoint.estimatedWaitTime < 0) {
      errors.push({ field: 'estimatedWaitTime', message: 'Waktu tunggu tidak boleh negatif' });
    }
  }

  if (
    pickupPoint.operatingHours &&
    pickupPoint.operatingHours.open &&
    pickupPoint.operatingHours.close
  ) {
    if (pickupPoint.operatingHours.open >= pickupPoint.operatingHours.close) {
      errors.push({ field: 'operatingHours', message: 'Jam tutup harus lebih besar dari jam buka' });
    }
  }

  return errors;
};

// ========== Search & Filter ==========

export interface PickupPointFilter {
  rayon?: string;
  isActive?: boolean;
  city?: string;
  searchText?: string;
}

export const filterPickupPoints = (
  pickupPoints: PickupPoint[],
  filter: PickupPointFilter
): PickupPoint[] => {
  return pickupPoints.filter(pp => {
    if (filter.rayon && pp.rayon !== filter.rayon) return false;
    if (filter.isActive !== undefined && pp.isActive !== filter.isActive) return false;
    if (filter.city && pp.city.toLowerCase() !== filter.city.toLowerCase()) return false;

    if (filter.searchText) {
      const search = filter.searchText.toLowerCase();
      return (
        pp.name.toLowerCase().includes(search) ||
        pp.code.toLowerCase().includes(search) ||
        pp.address.toLowerCase().includes(search) ||
        pp.phone.includes(search)
      );
    }

    return true;
  });
};

// ========== Duplicate Detection ==========

export const isDuplicatePickupPoint = (
  pickupPoints: PickupPoint[],
  newPickupPoint: Partial<PickupPoint>,
  excludeId?: string
): { isDuplicate: boolean; duplicateFields: string[] } => {
  const duplicateFields: string[] = [];

  const codeExists = pickupPoints.some(
    pp => pp.code === newPickupPoint.code && pp.id !== excludeId
  );
  if (codeExists) duplicateFields.push('code');

  const coordinateDuplicate = pickupPoints.some(
    pp =>
      pp.lat === newPickupPoint.lat &&
      pp.lng === newPickupPoint.lng &&
      pp.id !== excludeId
  );
  if (coordinateDuplicate) duplicateFields.push('coordinates');

  const nameDuplicate = pickupPoints.some(
    pp =>
      pp.name.toLowerCase() === newPickupPoint.name?.toLowerCase() &&
      pp.rayon === newPickupPoint.rayon &&
      pp.id !== excludeId
  );
  if (nameDuplicate) duplicateFields.push('name');

  return {
    isDuplicate: duplicateFields.length > 0,
    duplicateFields,
  };
};

// ========== Distance Calculation ==========

const toRad = (deg: number) => deg * (Math.PI / 180);

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ========== Nearby Pickup Points ==========

export const findNearbyPickupPoints = (
  pickupPoints: PickupPoint[],
  lat: number,
  lng: number,
  radiusKm: number = 5
): PickupPoint[] => {
  return pickupPoints
    .filter(pp => pp.isActive)
    .map(pp => ({
      pickupPoint: pp,
      distance: calculateDistance(lat, lng, pp.lat, pp.lng),
    }))
    .filter(item => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .map(item => item.pickupPoint);
};

// ========== Formatting ==========

export const formatCoordinates = (lat: number, lng: number): string => {
  return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
};

export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(2)} km`;
};
