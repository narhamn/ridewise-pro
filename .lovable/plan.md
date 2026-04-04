

# Logika Driver Mendapatkan Penumpang (Terjadwal + Realtime)

## Konsep

Saat ini driver hanya melihat penumpang yang sudah booking via jadwal. Fitur baru menambahkan kemampuan driver untuk **menambah penumpang secara langsung (realtime)** di perjalanan yang sedang berjalan — mirip angkutan umum yang bisa naikkan penumpang di jalan.

## Perubahan

### 1. Update Type — Tandai booking terjadwal vs realtime
**File:** `src/types/shuttle.ts`
- Tambah field `bookingType: 'scheduled' | 'realtime'` ke interface `Booking`
- Booking dari customer app = `scheduled`, booking dari driver = `realtime`

### 2. Fitur "Tambah Penumpang" di DriverTripDetail
**File:** `src/pages/driver/DriverTripDetail.tsx`
- Tambah tombol **"+ Tambah Penumpang"** (hanya muncul saat status `departed` atau `boarding`)
- Dialog form: Nama penumpang, Pilih titik jemput (dropdown dari route points), Pilih kursi kosong
- Harga otomatis dihitung dari titik jemput yang dipilih (distanceToDestination × pricePerMeter)
- Metode bayar: Cash / QRIS (bayar langsung ke driver)
- Booking baru dibuat dengan `bookingType: 'realtime'`, `paymentStatus: 'paid'`
- Peta kursi dan daftar penumpang langsung ter-update

### 3. Bedakan tampilan penumpang terjadwal vs realtime
**File:** `src/pages/driver/DriverTripDetail.tsx`
- Di daftar penumpang, tambah badge **"Terjadwal"** (biru) atau **"Realtime"** (hijau/orange) 
- Driver bisa lihat mana penumpang yang sudah booking dan mana yang naik di jalan

### 4. Update Context — fungsi addBooking sudah ada, cukup dipakai
**File:** `src/contexts/ShuttleContext.tsx`
- Tidak perlu perubahan besar, `addBooking` sudah tersedia
- Pastikan booking realtime juga masuk ke daftar bookings global

### 5. Update dummy data
**File:** `src/data/dummy.ts`
- Tambah `bookingType: 'scheduled'` ke semua booking dummy yang ada

### 6. Update referensi booking lainnya
**File:** `src/pages/customer/CustomerBookingNew.tsx`, `src/pages/admin/AdminBookings.tsx`
- Set `bookingType: 'scheduled'` saat customer booking
- Admin bookings: tampilkan kolom/badge tipe booking

## Dampak File

| File | Aksi |
|------|------|
| `src/types/shuttle.ts` | Tambah `bookingType` ke Booking |
| `src/data/dummy.ts` | Tambah `bookingType: 'scheduled'` ke dummy |
| `src/pages/driver/DriverTripDetail.tsx` | Tambah dialog "Tambah Penumpang" + badge tipe |
| `src/pages/customer/CustomerBookingNew.tsx` | Set `bookingType: 'scheduled'` |
| `src/pages/admin/AdminBookings.tsx` | Tampilkan badge tipe booking |

