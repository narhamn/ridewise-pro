# Gabung Modul Kendaraan + Assign Driver

Menggabungkan dua halaman terpisah (`AdminVehicles` dan `AdminAssign`) menjadi satu halaman dengan **Tabs**: "Kendaraan" dan "Assign Driver".

## Perubahan

### 1. Gabungkan ke `AdminVehicles.tsx`

- Gunakan komponen `Tabs` dengan 2 tab:
  - **Tab "Kendaraan"** — isi seperti sekarang (CRUD kendaraan dengan status kendaraan)
  - **Tab "Assign Driver"** — isi dari `AdminAssign` (tabel jadwal + dropdown assign driver)
- Judul halaman: "Kendaraan & Assign Driver"

### 2. Hapus `AdminAssign.tsx`

- File tidak lagi diperlukan karena kontennya sudah masuk ke tab

### 3. Update Sidebar (`AdminLayout.tsx`)

- Hapus menu item "Assign Driver" (`/admin/assign`)
- Rename "Kendaraan" menjadi "Kendaraan & Driver" (atau tetap "Kendaraan")

### 4. Update Routing (`App.tsx`)

- Hapus route `/admin/assign`
- Hapus import `AdminAssign`

## File yang Diubah


| File                                | Aksi                                           |
| ----------------------------------- | ---------------------------------------------- |
| `src/pages/admin/AdminVehicles.tsx` | Tambah Tabs, integrasikan konten assign driver |
| `src/pages/admin/AdminAssign.tsx`   | **Hapus**                                      |
| `src/layouts/AdminLayout.tsx`       | Hapus menu "Assign Driver"                     |
| `src/App.tsx`                       | Hapus route + import AdminAssign               |
