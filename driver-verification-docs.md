# Dokumentasi Modul Driver Terpadu (Unified Driver Module)

## 1. Arsitektur Modul
Modul Driver dan Modul Verifikasi telah digabungkan menjadi satu kesatuan sistem manajemen driver yang terintegrasi. Sistem ini mengelola seluruh siklus hidup mitra driver, mulai dari pendaftaran (pending), verifikasi (approved/rejected), hingga manajemen driver aktif.

### Perubahan Utama:
- **Unified State**: Seluruh data driver (pendaftar maupun aktif) dikelola dalam satu array `drivers` di `ShuttleContext`.
- **Unified Interface**: `Driver` dan `DriverRegistration` sekarang menggunakan struktur data yang sama.
- **Unified UI**: Halaman `AdminDriverManager` menggantikan `AdminDrivers` dan `AdminDriverVerification`.

## 2. Struktur Data (Standardized)
Semua entitas driver sekarang mengikuti interface `Driver` yang mencakup:
- **Profil Dasar**: Nama, Email, Telepon, Lisensi.
- **Status Verifikasi**: `verificationStatus` (`pending`, `approved`, `rejected`).
- **Status Operasional**: `status` (`online`, `offline`, `active`, `inactive`).
- **Dokumen & Kendaraan**: Menggunakan sub-interface terstandarisasi `DriverDocument` dan `DriverVehicleDetails`.
- **Audit Trail**: Array `logs` yang mencatat setiap perubahan status verifikasi.

## 3. Alur Kerja Terintegrasi
1.  **Pendaftaran**: Driver mendaftar melalui `DriverRegister.tsx`, data disimpan dengan `verificationStatus: 'pending'`.
2.  **Manajemen Admin**: Admin membuka `AdminDriverManager` yang memiliki dua tab:
    - **Daftar Driver**: Untuk mengelola driver yang sudah `approved`.
    - **Verifikasi**: Untuk meninjau pendaftar baru (`pending`).
3.  **Approval**: Saat disetujui, `verificationStatus` berubah menjadi `approved` dan driver langsung muncul di daftar driver aktif. Sistem melakukan validasi duplikasi data secara otomatis.

## 4. Migration Guide untuk Developer

### Perubahan Nama Field
Jika Anda mengerjakan modul yang berinteraksi dengan pendaftaran driver, perhatikan perubahan berikut:
- `fullName` -> `name`
- `simNumber` -> `licenseNumber`
- `status` (pendaftaran) -> `verificationStatus`

### Akses Data
- Gunakan `drivers` dari `useShuttle()` untuk mendapatkan semua data.
- Gunakan `registrations` (derived state) jika hanya ingin mendapatkan data pendaftar (non-approved).

### Routing
- Route `/admin/drivers` dan `/admin/verifications` sekarang keduanya mengarah ke `AdminDriverManager`.
- Gunakan query param `?tab=verification` untuk membuka tab verifikasi secara langsung.

## 5. Keamanan & Validasi
- **Duplicate Check**: Validasi otomatis terhadap `licenseNumber`, `phoneNumber`, dan `plateNumber` saat proses approval.
- **Audit Logging**: Setiap tindakan verifikasi wajib mencatat Admin ID dan alasan (untuk penolakan).
- **Role Access**: Modul manajemen hanya dapat diakses oleh user dengan role `admin`.
