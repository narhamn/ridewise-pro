

# Tampilkan Titik Jemput di Daftar Rute

## Saat Ini

Halaman Manajemen Rute menampilkan daftar rute sebagai kartu. Setiap kartu hanya menunjukkan **jumlah** titik jemput (misal "5 titik jemput"), tanpa detail titik mana saja.

## Perubahan

### `src/pages/admin/AdminRoutes.tsx` — Expand route cards

Di setiap kartu rute (lines 776-799), tambahkan daftar titik jemput yang collapsed/expandable:

- Di bawah info rute, tampilkan daftar titik jemput rute tersebut (dari `routePoints.filter(p => p.routeId === r.id)`)
- Setiap titik menampilkan: **urutan**, **kode**, **nama**, **jarak ke tujuan** (km), dan **harga**
- Titik terakhir (tujuan) ditandai badge "Tujuan"
- Gunakan komponen `Collapsible` dari shadcn agar tidak memenuhi layar — klik kartu untuk expand/collapse, klik detail untuk masuk ke halaman edit
- Visual: garis vertikal penghubung antar titik (timeline-style) dengan dot numbered

### Layout tiap titik (dalam collapsible):

```text
① J1 Hermes       38.0 km → Rp 76.000
② J2 Amplas       28.0 km → Rp 56.000
③ J3 Tembung      18.0 km → Rp 36.000
④ KNO             Tujuan
```

### Interaksi

- Klik **nama rute / chevron** → expand/collapse daftar titik (TIDAK navigasi ke detail)
- Klik **tombol edit (pensil)** → dialog edit rute (tetap seperti sekarang)
- Klik **"Lihat Detail →"** button baru → navigasi ke detail rute (`setSelectedRouteId`)

### File yang Diubah

| File | Aksi |
|------|------|
| `src/pages/admin/AdminRoutes.tsx` | Tambah collapsible daftar titik jemput di setiap kartu rute |

Satu file saja. Tidak ada perubahan tipe atau data.

