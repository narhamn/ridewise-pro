

# Logika Harga: Jarak ke Tujuan Akhir + Pengaturan Harga

## Perubahan Logika Harga

**Saat ini**: Harga = jarak kumulatif dari asal × Rp/m (semakin jauh dari asal, semakin mahal)
**Yang diminta**: Harga = jarak dari titik jemput ke tujuan akhir × Rp/m (semakin dekat ke tujuan, semakin murah)

Contoh rute Hermes → Kualanamu (38 km, Rp2/m):
```text
Titik          Jarak ke KNO    Harga
J1 (Hermes)    38.000 m        Rp 76.000
J2 (Simpang)   33.000 m        Rp 66.000
J3 (Tembung)   25.000 m        Rp 50.000
J4 (Btg Kuis)  13.000 m        Rp 26.000
J5 (KNO)       0 m             — (tujuan)
```

### Perubahan RoutePoint
- Tambah field `distanceToDestination` = totalDistance - cumulativeDistance
- Field `price` dihitung dari `distanceToDestination × pricePerMeter`
- Titik pertama (asal) = harga tertinggi, titik terakhir (tujuan) = 0

### Fitur Pengaturan Harga (Admin)
Halaman baru atau section di AdminRoutes untuk mengatur:
- **Harga per meter per rayon** — default rate per rayon (A=Rp2, B=Rp1.5, C=Rp1.2, D=Rp1)
- **Override per rute** — admin bisa set harga/m khusus per rute
- **Simulasi harga** — preview harga setiap titik jemput saat rate diubah
- **Bulk update** — saat rate rayon berubah, semua rute di rayon itu ter-update otomatis

## File yang Diubah

| File | Aksi |
|------|------|
| `src/types/shuttle.ts` | Tambah `distanceToDestination` ke RoutePoint |
| `src/data/dummy.ts` | Recalculate semua harga dummy (jarak ke tujuan) |
| `src/pages/admin/AdminRoutes.tsx` | Update logika hitung harga + tambah section pengaturan harga |
| `src/pages/customer/CustomerBookingNew.tsx` | Sesuaikan tampilan harga |
| `src/pages/customer/CustomerRouteDetail.tsx` | Sesuaikan tampilan harga |
| `src/contexts/ShuttleContext.tsx` | Tambah state rayon pricing config |

