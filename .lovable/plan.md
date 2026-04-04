# Penumpang Realtime ala GoCar/GrabCar

## Konsep

Saat ini driver menambah penumpang secara manual (input nama). Fitur baru mengubah flow menjadi seperti ride-hailing:

1. **Customer** melihat shuttle yang sedang jalan (status `boarding`/`departed`) dan request naik
2. **Driver** mendapat notifikasi request masuk dan bisa **Terima** atau **Tolak**
3. Setelah diterima, kursi otomatis terisi dan penumpang dapat e-ticket

```text
Customer                          Driver
   │                                │
   ├─ Lihat shuttle aktif ──────►   │
   ├─ Pilih titik jemput + kursi    │
   ├─ Request Naik ─────────────►   │
   │                                ├─ Notifikasi masuk
   │                                ├─ Terima / Tolak
   │  ◄──────── Konfirmasi ─────────┤
   ├─ Dapat tiket + status          │
   └────────────────────────────────┘
```

## Perubahan

### 1. Tambah tipe `RideRequest` di `src/types/shuttle.ts`

- Interface baru: `RideRequest { id, userId, userName, scheduleId, routeId, pickupPointId, pickupPointName, seatNumber, price, status: 'pending' | 'accepted' | 'rejected', createdAt }`
- Ini mewakili request customer yang menunggu konfirmasi driver

### 2. Update Context — tambah state & fungsi ride request

**File:** `src/contexts/ShuttleContext.tsx`

- State baru: `rideRequests: RideRequest[]`
- Fungsi: `addRideRequest()`, `acceptRideRequest(id)` (buat booking otomatis), `rejectRideRequest(id)`

### 3. Halaman customer: "Naik Sekarang"

**File baru:** `src/pages/customer/CustomerRideNow.tsx`

- Tampilkan daftar shuttle yang sedang aktif (`boarding`/`departed`) dengan kursi kosong
- Customer pilih shuttle → pilih titik jemput → pilih kursi → "Request Naik"
- Setelah request, tampilkan status menunggu konfirmasi driver
- Jika diterima → redirect ke booking detail  / Pembayaran / e-ticket
- Jika ditolak → tampilkan pesan ditolak

### 4. Tombol "Naik Sekarang" di CustomerHome

**File:** `src/pages/customer/CustomerHome.tsx`

- Tambah card/button prominent "🚐 Naik Sekarang" di atas daftar rute
- Navigate ke `/customer/ride-now`

### 5. Driver: panel request masuk di DriverTripDetail

**File:** `src/pages/driver/DriverTripDetail.tsx`

- Tampilkan section "Request Masuk" dengan daftar pending requests
- Setiap request menampilkan: nama, titik jemput, kursi, harga
- Tombol **Terima** (hijau) dan **Tolak** (merah)
- Terima → otomatis buat booking `realtime` + `paid`, update kursi
- Tolak → update status request jadi `rejected`
- Tetap pertahankan tombol "+ Penumpang" manual untuk kasus tanpa smartphone

### 6. Routing & Layout

**File:** `src/App.tsx`

- Tambah route `/customer/ride-now` → `CustomerRideNow`

## Dampak File


| File                                     | Aksi                                        |
| ---------------------------------------- | ------------------------------------------- |
| `src/types/shuttle.ts`                   | Tambah interface `RideRequest`              |
| `src/contexts/ShuttleContext.tsx`        | State + fungsi ride request                 |
| `src/pages/customer/CustomerRideNow.tsx` | **Baru** — halaman request naik realtime    |
| `src/pages/customer/CustomerHome.tsx`    | Tambah tombol "Naik Sekarang"               |
| `src/pages/driver/DriverTripDetail.tsx`  | Tambah section request masuk + terima/tolak |
| `src/App.tsx`                            | Tambah route `/customer/ride-now`           |
