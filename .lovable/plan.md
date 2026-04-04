

# Implementasi Scan Barcode/QR untuk Verifikasi Penumpang

## Situasi Saat Ini
- ETicket sudah generate QR code berisi JSON: `{ id, scheduleId, seat, route }`
- Dialog scan di DriverTripDetail hanya input manual (ketik ID booking)
- Belum ada kamera scanner yang benar-benar berfungsi

## Perubahan

### 1. Install library `html5-qrcode`
- Library ringan untuk scan QR/barcode via kamera device
- Mendukung QR Code, Barcode (Code128, EAN, dll)

### 2. Buat komponen `QRScanner`
**File baru:** `src/components/QRScanner.tsx`
- Wrapper komponen untuk `Html5QrcodeScanner`
- Props: `onScanSuccess(data)`, `onClose()`
- Otomatis start kamera saat mount, stop saat unmount
- Tampilkan viewfinder kamera dengan overlay scan area

### 3. Update dialog scan di `DriverTripDetail.tsx`
- Ganti placeholder kamera dengan komponen `QRScanner` yang aktif
- Saat QR ter-scan, parse JSON data dari QR code
- Validasi: cocokkan `scheduleId` dari QR dengan trip yang sedang aktif
- Tambah state `checkedIn` untuk tracking penumpang yang sudah di-verifikasi
- Hasil scan tampilkan detail: nama, kursi, titik jemput, status (Valid/Invalid)
- Tetap pertahankan input manual sebagai fallback

### 4. Tambah field `checkedIn` ke Booking
**File:** `src/types/shuttle.ts`
- Tambah `checkedIn?: boolean` ke interface Booking

### 5. Update Context untuk check-in
**File:** `src/contexts/ShuttleContext.tsx`  
- Tambah fungsi `checkInPassenger(bookingId)` yang set `checkedIn: true`

### 6. Visual feedback di daftar penumpang
**File:** `src/pages/driver/DriverTripDetail.tsx`
- Penumpang yang sudah scan: badge hijau "✓ Checked In"
- Penumpang belum scan: badge abu "Belum Check-in"
- Counter di header: "Checked In: 3/5"

## File yang Diubah

| File | Aksi |
|------|------|
| `package.json` | Install `html5-qrcode` |
| `src/components/QRScanner.tsx` | **Baru** — komponen kamera scanner |
| `src/types/shuttle.ts` | Tambah `checkedIn` ke Booking |
| `src/contexts/ShuttleContext.tsx` | Tambah `checkInPassenger()` |
| `src/pages/driver/DriverTripDetail.tsx` | Integrasi scanner + check-in UI |

