

# Merger: Manajemen Rute + Titik Jemput

## Analisa Saat Ini

**Masalah**: Rute dan Titik Jemput dikelola di 2 halaman terpisah (`AdminRoutes` dan `AdminPoints`), padahal titik jemput selalu milik sebuah rute. Ini memaksa admin bolak-balik antar halaman.

**Data saat ini**:
- `Route`: punya `distanceMeters` dan `pricePerMeter` di level rute (jarak total)
- `RoutePoint`: hanya punya `code`, `name`, `order`, `lat`, `lng` — tidak punya jarak/harga sendiri

## Perubahan yang Direncanakan

### 1. Update Type `RoutePoint` — tambah jarak & harga per titik
Setiap titik jemput akan punya `distanceMeters` (jarak dari titik sebelumnya) dan `price` (harga dari asal ke titik ini). Harga rute total dihitung otomatis dari titik terakhir.

```text
RoutePoint {
  ...existing fields
  distanceFromPrevious: number  // jarak dari titik sebelumnya (meter)
  cumulativeDistance: number    // jarak kumulatif dari asal
  price: number                // harga dari asal ke titik ini
}
```

### 2. Gabung jadi satu halaman `AdminRoutes`
Layout baru menggunakan pola **master-detail**:
- **Kiri/Atas**: Daftar rute (card per rute dengan info rayon, asal-tujuan, total jarak, total harga)
- **Kanan/Bawah**: Saat rute diklik/dipilih, tampilkan tabel titik jemput milik rute tersebut dengan kolom: Kode, Nama, Jarak dari titik sebelumnya, Jarak kumulatif, Harga
- Tombol tambah/edit/hapus titik jemput langsung di dalam detail rute
- Dialog tambah rute tetap ada, tapi `distanceMeters` dan `price` di Route dihitung otomatis dari titik jemput terakhir

### 3. Hapus halaman & route `AdminPoints`
- Hapus `AdminPoints` dari `App.tsx` routing
- Hapus menu "Titik Jemput" dari sidebar `AdminLayout`
- File `AdminPoints.tsx` tidak lagi digunakan

### 4. Update dummy data
- Tambah `distanceFromPrevious`, `cumulativeDistance`, `price` ke setiap `RoutePoint` di `dummy.ts`
- Harga dihitung proporsional berdasarkan jarak kumulatif x `pricePerMeter` rute

### 5. Update referensi lain
- Customer booking flow (`CustomerBookingNew`, `CustomerRouteDetail`) yang menampilkan titik jemput — tampilkan harga per titik jemput, bukan harga flat rute
- Booking `price` akan mengambil harga dari titik jemput yang dipilih, bukan dari rute

## Dampak File

| File | Aksi |
|------|------|
| `src/types/shuttle.ts` | Update `RoutePoint` interface |
| `src/data/dummy.ts` | Tambah field baru ke data dummy |
| `src/pages/admin/AdminRoutes.tsx` | Rewrite — gabung rute + titik jemput |
| `src/pages/admin/AdminPoints.tsx` | Tidak digunakan lagi |
| `src/layouts/AdminLayout.tsx` | Hapus menu "Titik Jemput" |
| `src/App.tsx` | Hapus route `/admin/points` |
| `src/pages/customer/CustomerRouteDetail.tsx` | Tampilkan harga per titik |
| `src/pages/customer/CustomerBookingNew.tsx` | Harga dari titik jemput |

