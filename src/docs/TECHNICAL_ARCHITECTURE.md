# Ridewise Pro: Arsitektur Teknis & Integrasi Database

Dokumen ini menjelaskan analisis teknis komprehensif untuk integrasi aplikasi Ridewise Pro dengan database Supabase, mencakup keamanan, performa, dan skalabilitas.

## 1. Spesifikasi Database & Skema
Aplikasi menggunakan **PostgreSQL 15** melalui layanan Supabase dengan ekstensi berikut:
- `uuid-ossp`: Untuk identifikasi unik berbasis UUID.
- `postgis`: Untuk kueri spasial (lokasi driver terdekat, geofencing).
- `pg_net`: Untuk integrasi eksternal via HTTP dari database triggers.

### Skema Tabel Utama
| Tabel | Deskripsi | Realtime |
|-------|-----------|----------|
| `profiles` | Data user & role (admin, driver, customer). | Tidak |
| `drivers` | Profil detail driver & status verifikasi. | Ya |
| `schedules` | Jadwal perjalanan & status trip. | Ya |
| `bookings` | Transaksi pemesanan kursi. | Ya |
| `driver_locations` | Koordinat GPS driver (PostGIS enabled). | Ya (High Freq) |
| `ride_requests` | Permintaan ride-hailing realtime. | Ya |
| `notifications` | Sistem notifikasi in-app. | Ya |

## 2. Row Level Security (RLS)
Keamanan data dijamin di level database menggunakan kebijakan RLS yang ketat:

- **Customer**:
    - Hanya dapat melihat dan mengedit profil sendiri.
    - Dapat melihat rute, jadwal, dan driver yang sudah terverifikasi (`approved`).
    - Dapat membuat booking untuk diri sendiri.
    - Hanya dapat melihat lokasi driver yang bertugas pada booking aktif mereka.
- **Driver**:
    - Dapat memperbarui status online/offline dan koordinat GPS sendiri.
    - Dapat melihat detail booking pada jadwal yang ditugaskan kepada mereka.
    - Dapat menerima `ride_requests` yang berstatus `pending`.
- **Admin**:
    - Memiliki akses `ALL` (CRUD) ke seluruh tabel untuk manajemen sistem.

## 3. Realtime Subscriptions
Implementasi realtime menggunakan **Supabase Realtime (WebSockets)** untuk fitur-fitur berikut:
- **Tracking Map**: Pelanggan berlangganan ke `driver_locations` untuk melihat pergerakan driver secara langsung.
- **Trip Updates**: Berlangganan ke `schedules` untuk update status perjalanan (Boarding -> Departed -> Arrived).
- **Push Notifications**: Berlangganan ke `notifications` untuk mendapatkan alert instan saat ada booking baru atau perubahan status.
- **Driver Dispatch**: Driver berlangganan ke `ride_requests` untuk mendapatkan notifikasi permintaan perjalanan baru di sekitar mereka.

## 4. Repository Pattern & Data Access
Untuk menjaga kode tetap bersih dan terukur, aplikasi menggunakan **Repository Pattern**:
- **BaseRepository**: Menyediakan logika CRUD standar (get, create, update, delete).
- **Specialized Repositories**: (`BookingRepository`, `DriverRepository`, dll.) Menangani logika bisnis spesifik seperti pemesanan aman via RPC atau pembaruan status verifikasi.
- **Abstraction**: `ShuttleContext` tidak lagi melakukan kueri langsung ke Supabase, melainkan melalui layer repository ini.

## 5. Sistem Notifikasi & Triggers
Mekanisme notifikasi berbasis event database:
- **Trigger `on_booking_created`**: Otomatis membuat entri di tabel `notifications` saat booking baru masuk.
- **Trigger `on_trip_status_change`**: Mengirim notifikasi ke seluruh penumpang di jadwal tersebut saat status berubah menjadi `departed`.
- **Edge Functions Integration**: Triggers dapat memanggil Edge Functions via `pg_net` untuk mengirim push notification ke OneSignal atau FCM.

## 6. Edge Functions (Business Logic)
Proses bisnis kompleks yang tidak aman dijalankan di client-side:
- `process-booking`: Validasi ketersediaan kursi, kalkulasi harga final (server-side pricing), dan pemotongan kuota diskon dalam satu transaksi atomik (diimplementasikan via RPC).
- `payment-webhook`: Menangani callback dari payment gateway (Midtrans/Xendit) untuk update status `payment_status` secara otomatis.
- `driver-verification`: Menangani upload dokumen driver dan integrasi dengan layanan OCR pihak ketiga.

## 7. Authentication Flow
1. **Sign Up**: User mendaftar via Supabase Auth. Trigger database otomatis membuat entri di tabel `profiles` dengan role default `customer`.
2. **Login**: Mendapatkan JWT yang berisi `user_id` dan `role`.
3. **Authorization**: JWT dikirimkan pada setiap request ke PostgREST. PostgreSQL mengevaluasi kebijakan RLS berdasarkan `auth.uid()` dan data role di `profiles`.

## 8. Strategi Deployment & Monitoring
- **CI/CD**: Otomasi migrasi database menggunakan Supabase CLI saat push ke branch `main`. Seluruh perubahan skema dikelola melalui file migrasi di folder `supabase/migrations/` yang dijalankan secara berurutan.
- **Monitoring**:
    - **Performance**: Menggunakan *Supabase Dashboard Metrics* untuk memantau API response time dan kueri terlambat.
    - **Error Tracking**: Integrasi Edge Functions dengan Sentry untuk menangkap runtime errors.
    - **Audit Logs**: Seluruh perubahan harga dan data sensitif dicatat di tabel `audit_logs`.

## 9. Testing Scenarios
- **Security Test**: Mencoba akses data user lain menggunakan JWT user biasa (Ekspektasi: HTTP 403/Empty Result).
- **Concurrency Test**: Melakukan booking pada kursi yang sama secara simultan (Ekspektasi: Hanya 1 yang berhasil via database constraint/edge function).
- **Realtime Test**: Simulasi pergerakan driver dan memastikan latency di client < 500ms.
