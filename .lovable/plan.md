

# Implementasi Tanggal Berangkat pada Jadwal

## Situasi Saat Ini

`Schedule` hanya punya `departureTime: string` (jam saja, misal "07:00"). Tidak ada tanggal. Semua jadwal tampil tanpa konteks tanggal — customer tidak bisa booking untuk tanggal tertentu, driver tidak tahu jadwal hari apa.

## Perubahan

### 1. Update Type `Schedule` — tambah `departureDate`

**File:** `src/types/shuttle.ts`

- Tambah field `departureDate: string` (format `YYYY-MM-DD`) ke interface `Schedule`

### 2. Update Dummy Data

**File:** `src/data/dummy.ts`

- Tambah `departureDate` ke semua `dummySchedules` (mix tanggal hari ini, besok, lusa)

### 3. Admin — Form Jadwal tambah Date Picker

**File:** `src/pages/admin/AdminRoutes.tsx`

- `scheduleForm` tambah field `departureDate`
- Tambah input tanggal (Popover + Calendar) di form tambah jadwal
- Tabel jadwal tampilkan kolom "Tanggal"
- Filter/sort jadwal berdasarkan tanggal

### 4. Customer — Pilih tanggal saat lihat jadwal

**File:** `src/pages/customer/CustomerRouteDetail.tsx`

- Tambah Date Picker di atas daftar jadwal
- Filter `availableSchedules` berdasarkan tanggal yang dipilih (default: hari ini)
- Tampilkan tanggal di card jadwal

### 5. Customer — Booking menampilkan tanggal

**File:** `src/pages/customer/CustomerBookingNew.tsx`

- Tampilkan tanggal berangkat di info booking
- Set `bookingDate` dari `schedule.departureDate`

**File:** `src/pages/customer/CustomerBookingDetail.tsx`

- Tampilkan tanggal berangkat

**File:** `src/pages/customer/CustomerHistory.tsx`

- Sudah tampil `bookingDate` — pastikan formatnya konsisten

### 6. Customer — Ride Now filter hari ini

**File:** `src/pages/customer/CustomerRideNow.tsx`

- Filter `activeSchedules` hanya yang `departureDate` = hari ini

### 7. Driver — Filter jadwal per tanggal

**File:** `src/pages/driver/DriverDashboard.tsx`

- Judul "Perjalanan Hari Ini" → filter `mySchedules` yang `departureDate` = hari ini
- Tampilkan tanggal di card

**File:** `src/pages/driver/DriverTrips.tsx`

- Tampilkan tanggal di setiap card trip
- Group atau sort by tanggal

### 8. E-Ticket — tampilkan tanggal

**File:** `src/components/ETicket.tsx`

- Tambah tanggal berangkat di tampilan tiket (ambil dari `booking.bookingDate`)

### 9. Admin Bookings — kolom tanggal

**File:** `src/pages/admin/AdminBookings.tsx`

- Kolom "Tanggal" sudah ada (`bookingDate`) — pastikan tampil jelas

## File yang Diubah

| File | Aksi |
|------|------|
| `src/types/shuttle.ts` | Tambah `departureDate` ke Schedule |
| `src/data/dummy.ts` | Tambah `departureDate` ke dummy schedules |
| `src/pages/admin/AdminRoutes.tsx` | Date picker di form jadwal + kolom tanggal |
| `src/pages/customer/CustomerRouteDetail.tsx` | Date picker filter + tampilkan tanggal |
| `src/pages/customer/CustomerBookingNew.tsx` | Tampilkan tanggal, set bookingDate |
| `src/pages/customer/CustomerBookingDetail.tsx` | Tampilkan tanggal berangkat |
| `src/pages/customer/CustomerRideNow.tsx` | Filter departureDate = hari ini |
| `src/pages/driver/DriverDashboard.tsx` | Filter hari ini + tampilkan tanggal |
| `src/pages/driver/DriverTrips.tsx` | Tampilkan tanggal + sort by date |
| `src/components/ETicket.tsx` | Tampilkan tanggal di tiket |

