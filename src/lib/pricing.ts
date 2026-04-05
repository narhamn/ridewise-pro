/**
 * Pricing Engine Utility
 * Sentralisasi logika perhitungan harga untuk aplikasi PYU GO.
 */

import { PricingAuditLog } from "@/types/shuttle";

export interface PricingMultipliers {
  roadCondition?: number;
  vehicleType?: number;
  markup?: number;
}

export interface PricingOptions {
  multipliers?: PricingMultipliers;
  discountRate?: number; // 0 to 1
  discountFixed?: number; // nominal amount
  maxDiscount?: number; // max discount cap
  taxRate?: number; // 0 to 1
  currency?: string;
}

export interface PricingResult {
  basePrice: number;
  multiplierEffect: number;
  discountAmount: number;
  taxAmount: number;
  subtotal: number;
  finalPrice: number;
  currency: string;
}

/**
 * Menghitung harga dasar berdasarkan jarak dan tarif per meter.
 * 
 * @param distanceMeters Jarak dalam satuan meter
 * @param pricePerMeter Tarif dalam Rupiah per meter
 * @returns Harga dasar (Base Price)
 */
export const calculateBasePrice = (distanceMeters: number, pricePerMeter: number): number => {
  const distance = Math.max(0, distanceMeters);
  const price = Math.max(0, pricePerMeter);
  return distance * price;
};

/**
 * Menerapkan faktor pengali (multipliers) ke harga.
 * 
 * @param price Harga awal
 * @param multipliers Objek berisi faktor pengali (road, vehicle, markup)
 * @returns Harga setelah dikalikan faktor-faktor terkait
 */
export const applyMultipliers = (price: number, multipliers?: PricingMultipliers): number => {
  if (price < 0) return 0;
  let result = price;
  if (multipliers) {
    result *= (multipliers.roadCondition ?? 1);
    result *= (multipliers.vehicleType ?? 1);
    result *= (multipliers.markup ?? 1);
  }
  return result;
};

/**
 * Menghitung jumlah diskon.
 * 
 * @param amount Jumlah harga sebelum diskon
 * @param discountRate Rate diskon (0 sampai 1)
 * @returns Nilai nominal diskon
 */
export const calculateDiscount = (amount: number, discountRate: number = 0): number => {
  const rate = Math.min(Math.max(0, discountRate), 1);
  return amount * rate;
};

/**
 * Menghitung jumlah pajak.
 * 
 * @param amount Jumlah harga sebelum pajak
 * @param taxRate Rate pajak (0 sampai 1)
 * @returns Nilai nominal pajak
 */
export const calculateTax = (amount: number, taxRate: number = 0): number => {
  const rate = Math.min(Math.max(0, taxRate), 1);
  return amount * rate;
};

/**
 * Fungsi utama Pricing Engine untuk menghitung harga akhir secara menyeluruh.
 * 
 * @param distanceMeters Jarak tempuh dalam meter
 * @param pricePerMeter Harga dasar per meter
 * @param options Opsi tambahan seperti multiplier, diskon, dan pajak
 * @returns Objek PricingResult yang berisi rincian perhitungan
 */
export const calculateFinalPrice = (
  distanceMeters: number,
  pricePerMeter: number,
  options: PricingOptions = {}
): PricingResult => {
  const { 
    multipliers, 
    discountRate = 0, 
    discountFixed = 0,
    maxDiscount = Infinity,
    taxRate = 0, 
    currency = 'IDR' 
  } = options;

  const basePrice = calculateBasePrice(distanceMeters, pricePerMeter);
  const priceAfterMultipliers = applyMultipliers(basePrice, multipliers);
  const multiplierEffect = priceAfterMultipliers - basePrice;

  let discountAmount = calculateDiscount(priceAfterMultipliers, discountRate) + discountFixed;
  if (discountAmount > maxDiscount) {
    discountAmount = maxDiscount;
  }
  if (discountAmount > priceAfterMultipliers) {
    discountAmount = priceAfterMultipliers;
  }

  const subtotal = priceAfterMultipliers - discountAmount;
  
  const taxAmount = calculateTax(subtotal, taxRate);
  const finalPrice = Math.round(subtotal + taxAmount);

  return {
    basePrice,
    multiplierEffect,
    discountAmount,
    taxAmount,
    subtotal,
    finalPrice,
    currency
  };
};

/**
 * Mengonversi harga ke mata uang lain (Placeholder untuk implementasi masa depan).
 * Saat ini hanya mendukung IDR.
 * 
 * @param amount Jumlah dalam mata uang asal
 * @param rate Kurs konversi
 * @returns Jumlah setelah konversi
 */
export const convertCurrency = (amount: number, rate: number = 1): number => {
  return amount * rate;
};

/**
 * Memformat angka ke format mata uang Rupiah atau lainnya.
 * 
 * @param amount Jumlah uang
 * @param currency Kode mata uang (default: IDR)
 * @returns String terformat
 */
export const formatPrice = (amount: number, currency: string = 'IDR'): string => {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Validates a list of audit logs against pricing changes.
 * 
 * @param logs Array of PricingAuditLog
 * @param rayon Rayon code
 * @returns Filtered logs for the specific rayon
 */
export const getAuditLogsByRayon = (logs: PricingAuditLog[], rayon: 'A' | 'B' | 'C' | 'D'): PricingAuditLog[] => {
  return logs.filter(log => log.rayon === rayon);
};
