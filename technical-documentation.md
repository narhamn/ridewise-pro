# Dokumentasi Teknis: Modul Manajemen Rute & Perhitungan Harga

Dokumen ini menjelaskan implementasi perhitungan jarak geografis dan logika penetapan harga otomatis pada aplikasi PYU GO.

## 1. Perhitungan Jarak (Algoritma Haversine)

Kami menggunakan **Algoritma Haversine** untuk menghitung jarak "lingkaran besar" antara dua titik koordinat (latitude dan longitude) di permukaan bumi.

### Rumus Haversine:
```
a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
c = 2 * atan2(√a, √(1-a))
d = R * c
```
Dimana:
- `R` adalah jari-jari bumi (rata-rata 6.371 km).
- `Δlat` & `Δlon` adalah perbedaan latitude dan longitude dalam radian.
- `d` adalah jarak dalam kilometer.

**Implementasi:** Lihat fungsi `calculateHaversineDistance` di [utils.ts](file:///d%3A/PYU-GO/ridewise-master/src/lib/utils.ts).

## 2. Skema Data Terperbarui

Tipe data `Route` telah dimodifikasi untuk mendukung transparansi jarak dan faktor harga tambahan.

### Interface `Route`:
- `distanceKm`: Jarak total rute dalam kilometer.
- `roadConditionMultiplier`: Faktor pengali berdasarkan kondisi jalan (contoh: 1.0 untuk jalan aspal mulus, 1.2 untuk jalan rusak/pegunungan).
- `vehicleTypeMultiplier`: Faktor pengali berdasarkan jenis kendaraan (contoh: 1.0 untuk standar, 1.5 untuk mewah/premium).

Lihat [shuttle.ts](file:///d%3A/PYU-GO/ridewise-master/src/types/shuttle.ts).

## 3. Logika Penetapan Harga Otomatis

Harga rute dihitung secara otomatis menggunakan parameter berikut:

### Rumus Perhitungan Harga:
```
Harga Akhir = (Jarak Meter * Tarif per Meter) * Faktor Kondisi Jalan * Faktor Jenis Kendaraan
```

**Integrasi:**
Fungsi `recalculateRouteDistanceAndPrice` di [ShuttleContext.tsx](file:///d%3A/PYU-GO/ridewise-master/src/contexts/ShuttleContext.tsx) secara otomatis:
1. Mengambil seluruh `RoutePoints` yang terkait dengan rute tersebut.
2. Menghitung jarak kumulatif antar titik menggunakan Haversine.
3. Memperbarui `distanceKm` dan `price` pada objek rute.
4. Memvalidasi koordinat sebelum melakukan perhitungan.

## 4. Validasi & Keamanan Data

- **Koordinat Valid**: Sistem memvalidasi bahwa latitude berada antara -90 hingga 90, dan longitude antara -180 hingga 180.
- **Jarak Positif**: Jarak selalu dihitung sebagai nilai absolut positif. Jika titik asal dan tujuan sama, jarak akan bernilai 0.
- **Tipe Data**: Menggunakan TypeScript untuk memastikan integritas data multiplier (multiplier harus berupa angka).

## 6. Fitur Pengaturan Jarak Dinamis

Sistem kini mendukung pengaturan jarak secara fleksibel antara titik asal dan tujuan:

### Fitur Utama:
- **Input Manual & Otomatis**: Pengguna dapat menginput jarak secara manual dalam kilometer (km) melalui form rute, atau menggunakan fitur **Auto-Calc** yang menghitung jarak berdasarkan koordinat GPS titik penjemputan.
- **Validasi Jarak**: Terdapat validasi sisi klien yang mencegah input nilai jarak negatif.
- **Penyimpanan Dinamis**: Nilai jarak disimpan dalam field `distanceKm` dan `distanceMeters` pada objek rute, memungkinkan perubahan kapan saja.
- **Filter Range Jarak**: Di dashboard admin, tersedia filter untuk menyaring daftar rute berdasarkan rentang jarak minimum dan maksimum.
- **Ekspor Data**: Mendukung ekspor seluruh data rute ke format **CSV** (Excel compatible).

### Struktur CRUD Jarak (Mock API Context):
- **CREATE/UPDATE**: Melalui fungsi `handleSaveRoute` yang menerima payload `distanceKm`.
- **READ**: Mengakses array `routes` dengan filter range jarak.
- **DELETE**: Menghapus objek rute beserta data jarak terkait.

### Performa & Skalabilitas:
- **Response Time**: Logika filter dan perhitungan jarak dilakukan di sisi klien (in-memory) menggunakan React state, memastikan response time jauh di bawah 2 detik untuk 10.000 record.
- **Batch Processing**: Penggunaan `recalculateRouteDistanceAndPrice` memungkinkan pemrosesan jarak rute secara massal berdasarkan data koordinat.
