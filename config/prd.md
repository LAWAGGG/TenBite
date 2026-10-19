# PRD — TenBite

**Product Requirements Document**
Website penjualan makanan danusan bertema piknik.

| | |
|---|---|
| Nama produk | TenBite |
| Jenis | Web app (SPA), 2 halaman |
| Tech stack | React JS + Google Spreadsheet (tanpa database) |
| Dokumen terkait | `design.md` |

---

## 1. Latar Belakang

Penjualan danusan saat ini dipromosikan melalui poster dan pemesanan melalui Google Form. Proses ini terbatas: tampilan produk statis, pesanan tidak terstruktur, dan pembeli tidak bisa memesan beberapa produk sekaligus dengan mudah.

TenBite adalah website katalog dan pemesanan danusan yang menampilkan produk secara menarik (tema piknik), memungkinkan pemesanan langsung, dan mengelola seluruh data lewat Google Spreadsheet sehingga mudah diubah oleh pengurus tanpa perlu mengubah kode.

## 2. Tujuan

1. Menampilkan seluruh produk danusan beserta foto, nama, dan harga.
2. Memudahkan pembeli memesan satu produk atau beberapa produk sekaligus.
3. Menyimpan data pesanan secara otomatis ke Google Spreadsheet.
4. Mengelola data produk (nama, harga, stok, gambar, status) dari Spreadsheet, tanpa database dan tanpa deploy ulang.
5. Mendukung dua metode pembayaran: QRIS dan bayar di tempat.

### Di Luar Cakupan (Non-Goals)

- Login/registrasi pengguna.
- Panel admin di dalam website (admin memakai Spreadsheet langsung).
- Verifikasi pembayaran QRIS otomatis (verifikasi manual oleh penjual).
- Database selain Google Spreadsheet.
- Notifikasi WhatsApp otomatis (opsional pengembangan lanjutan).

## 3. Pengguna

| Peran | Deskripsi | Kebutuhan |
|---|---|---|
| Pembeli | Siswa/guru/pengunjung | Melihat produk, memesan cepat lewat HP |
| Penjual/Pengurus | Pelaksana danusan | Mengubah produk dan melihat pesanan di Spreadsheet |
| Developer | Pembuat web | Konfigurasi, deploy, upload gambar QRIS |

## 4. Ruang Lingkup Halaman

Website hanya terdiri dari **2 halaman**:

| Halaman | Route | Fungsi |
|---|---|---|
| Daftar Produk | `/` | Menampilkan semua produk, tambah ke keranjang, buka keranjang |
| Detail Produk | `/product/:id` | Detail produk + form pemesanan |

Komponen pendukung (bukan halaman): Cart Drawer, form pemesanan dari keranjang, modal sukses.

---

## 5. Kebutuhan Fungsional

### 5.1 Halaman Daftar Produk

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Menampilkan header dengan teks "TenBite" menggunakan font berbeda untuk huruf "T" dan "enbite" sesuai gambar acuan | Must |
| FR-02 | Mengambil daftar produk dari Spreadsheet saat halaman dimuat | Must |
| FR-03 | Setiap produk menampilkan gambar, nama, dan harga | Must |
| FR-04 | Setiap produk memiliki tombol **Add to Cart** | Must |
| FR-05 | Setiap produk memiliki tombol **Detail** yang menuju `/product/:id` | Must |
| FR-06 | Menampilkan tombol keranjang melayang di pojok kanan bawah dengan badge jumlah item | Must |
| FR-07 | Tombol keranjang membuka daftar keranjang (drawer) | Must |
| FR-08 | Di keranjang: ubah jumlah, hapus item, lihat total, tombol **Pesan Semua** | Must |
| FR-09 | Produk dengan stok habis atau status nonaktif ditandai "HABIS" dan tombolnya dinonaktifkan; produk nonaktif (`aktif = FALSE`) disembunyikan | Must |
| FR-10 | Menampilkan banner info (contoh "Ready Hari Selasa"), sticky note, dan kontak dari Spreadsheet `Settings` | Should |
| FR-11 | Keranjang tetap tersimpan saat halaman di-refresh (localStorage) | Should |
| FR-12 | Menampilkan skeleton loading dan pesan error jika gagal memuat produk (dengan tombol "Muat Ulang") | Must |

### 5.2 Halaman Detail Produk

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-20 | Menampilkan gambar, nama, deskripsi, dan harga produk | Must |
| FR-21 | Menampilkan form pemesanan: **Nama, Kelas, Nomor Telepon, Catatan, Jumlah** | Must |
| FR-22 | Menampilkan **Total Pesanan** yang dihitung otomatis (harga × jumlah) | Must |
| FR-23 | Pilihan pembayaran: **Scan QRIS** atau **Bayar di Tempat** | Must |
| FR-24 | Jika QRIS dipilih, tampilkan gambar QRIS dari `/uploads/qris.png` beserta total tagihan | Must |
| FR-25 | Validasi form sebelum kirim (lihat 5.4) | Must |
| FR-26 | Tombol **Pesan Sekarang** mengirim pesanan ke Spreadsheet | Must |
| FR-27 | Tombol **Tambah ke Keranjang** | Should |
| FR-28 | Setelah sukses, tampilkan modal konfirmasi dengan kode pesanan | Must |
| FR-29 | Jika `:id` tidak ditemukan, tampilkan pesan "Produk tidak ditemukan" dan tombol kembali | Must |
| FR-30 | Tombol keranjang melayang tetap tampil di halaman ini | Should |

### 5.3 Pemesanan dari Keranjang ("Pesan Semua")

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-40 | **Pesan Semua** membuka form pemesanan (Nama, Kelas, No. Telepon, Catatan, Metode Pembayaran) | Must |
| FR-41 | Ringkasan pesanan menampilkan semua item, jumlah, subtotal, dan total | Must |
| FR-42 | Satu kali kirim menghasilkan **satu pesanan** dengan banyak item | Must |
| FR-43 | Setelah sukses, keranjang dikosongkan dan modal sukses tampil | Must |

### 5.4 Validasi Form

| Field | Aturan |
|---|---|
| Nama | Wajib, 2–50 karakter |
| Kelas | Wajib, maks 20 karakter |
| Nomor Telepon | Wajib, hanya angka (boleh awalan `+`), format `08xxxxxxxx` atau `+628xxxxxxxx`, 9–15 digit |
| Jumlah | Bilangan bulat ≥ 1 dan ≤ stok |
| Catatan | Opsional, maks 200 karakter |
| Metode pembayaran | Wajib dipilih |

Aturan tambahan:

- Mencegah kirim ganda: tombol dinonaktifkan selama proses kirim.
- Total dihitung ulang di server (Apps Script) berdasarkan harga dari sheet `Products`, bukan dipercaya dari klien.
- Honeypot field tersembunyi untuk mengurangi spam bot.

---

## 6. Kebutuhan Non-Fungsional

| Aspek | Target |
|---|---|
| Performa | LCP < 2,5 detik di jaringan 4G; gambar produk lazy-load |
| Responsif | Mobile-first (360px) hingga desktop |
| Kompatibilitas | Chrome, Safari, Firefox, Edge versi terbaru |
| Aksesibilitas | Mengikuti WCAG AA untuk kontras dan fokus keyboard |
| Ketersediaan | Mengikuti layanan Google (Sheets/Apps Script) dan hosting statis |
| Keamanan | Lihat bagian 10 |
| Bahasa | Bahasa Indonesia |

---

## 7. Arsitektur Teknis

### 7.1 Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | React JS (Vite), React Router, Tailwind CSS (atau CSS Modules) |
| Animasi | Framer Motion (opsional) |
| State keranjang | React Context + `useReducer`, disimpan ke `localStorage` |
| Data fetching | `fetch` bawaan (atau TanStack Query untuk cache) |
| "Backend" | Google Apps Script Web App (terikat ke Google Spreadsheet) |
| Penyimpanan data | Google Spreadsheet (tanpa database) |
| Gambar QRIS & aset | Folder `public/uploads/` pada frontend |
| Hosting | Vercel / Netlify / GitHub Pages |

### 7.2 Alur Data

```
┌──────────────┐   GET  ?action=products     ┌───────────────────┐   ┌─────────────┐
│              │ ──────────────────────────▶ │  Google Apps      │──▶│  Sheet:     │
│  React App   │                             │  Script Web App   │   │  Products   │
│  (Frontend)  │ ◀────────────────────────── │  (doGet / doPost) │◀──│  Settings   │
│              │   JSON produk & settings    │                   │   └─────────────┘
│              │                             │                   │   ┌─────────────┐
│              │ ── POST  {order} ─────────▶ │                   │──▶│  Sheet:     │
│              │ ◀─────  {ok, orderId} ───── │                   │   │  Orders     │
└──────────────┘                             └───────────────────┘   └─────────────┘
```

Catatan keputusan:

- **Membaca produk:** Apps Script `doGet` mengembalikan JSON (disarankan karena mendukung CORS sederhana dan bisa menyaring kolom). Alternatif: Sheet di-publish ke web dan dibaca sebagai CSV, tetapi pembaruan bisa tertunda beberapa menit dan tidak bisa menyembunyikan kolom.
- **Menulis pesanan:** Browser tidak bisa menulis langsung ke Sheet tanpa kredensial, sehingga digunakan Apps Script `doPost` yang menambahkan baris ke sheet `Orders`.
- **CORS:** kirim `POST` dengan `Content-Type: text/plain;charset=utf-8` (body berupa string JSON) agar tidak memicu preflight `OPTIONS`, yang tidak didukung Apps Script.
- Aset (foto produk, QRIS) disimpan di frontend, bukan di Spreadsheet.

### 7.3 Struktur Folder Frontend

```
tenbite/
├── public/
│   └── uploads/
│       ├── qris.png
│       ├── bg-garden.jpg
│       └── products/...
├── src/
│   ├── api/
│   │   └── sheets.js          # getProducts(), getSettings(), submitOrder()
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ProductCard.jsx
│   │   ├── PriceStar.jsx
│   │   ├── CartFab.jsx
│   │   ├── CartDrawer.jsx
│   │   ├── OrderForm.jsx
│   │   ├── PaymentOption.jsx
│   │   ├── QrisPanel.jsx
│   │   └── SuccessModal.jsx
│   ├── context/
│   │   └── CartContext.jsx
│   ├── pages/
│   │   ├── ProductListPage.jsx
│   │   └── ProductDetailPage.jsx
│   ├── utils/
│   │   ├── format.js          # formatRupiah, formatShortPrice
│   │   └── validate.js
│   ├── App.jsx
│   └── main.jsx
├── .env                        # VITE_APPS_SCRIPT_URL=...
└── package.json
```

---

## 8. Model Data (Google Spreadsheet)

Satu file Spreadsheet dengan tiga sheet.

### 8.1 Sheet `Products`

| Kolom | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `id` | teks | `samyang-roll` | Unik, dipakai di URL |
| `nama` | teks | Samyang Roll isi 4 Pcs | |
| `harga` | angka | 10000 | Rupiah, tanpa titik |
| `deskripsi` | teks | Roll renyah isi 4 pcs... | |
| `gambar` | teks | `/uploads/products/samyang-roll.jpg` | Path di frontend |
| `stok` | angka | 30 | 0 = habis |
| `aktif` | boolean | TRUE | FALSE = disembunyikan |
| `urutan` | angka | 1 | Urutan tampil |

Data awal:

| id | nama | harga |
|---|---|---|
| `samyang-roll` | Samyang Roll isi 4 Pcs | 10000 |
| `nasi-ayam-geprek` | Nasi Ayam Geprek | 11000 |
| `es-jelly-lumut-coklat` | Es Jelly Lumut Coklat | 8000 |
| `brownies-coklat` | Brownies Coklat | 10000 |
| `roti-gulung-sosis` | Roti Gulung Sosis | 10000 |
| `risol-aneka-rasa` | Risol Aneka Rasa | 5000 |

### 8.2 Sheet `Orders`

Satu baris per pesanan.

| Kolom | Contoh | Keterangan |
|---|---|---|
| `order_id` | `TB-0001` | Dibuat otomatis oleh Apps Script |
| `timestamp` | 2026-10-20 09:15:02 | Waktu server |
| `nama` | Budi | |
| `kelas` | XI-MP 1 | |
| `no_telp` | 081234567890 | Disimpan sebagai teks agar angka 0 di depan tidak hilang |
| `catatan` | Tanpa pedas | |
| `items` | Nasi Ayam Geprek x2; Es Jelly Lumut Coklat x1 | Ringkasan terbaca manusia |
| `items_json` | `[{"id":"...","qty":2,"harga":11000}]` | Untuk pengolahan data |
| `total` | 30000 | Dihitung ulang server |
| `metode_bayar` | QRIS / COD | |
| `status` | BARU | Diubah manual: BARU, DIBAYAR, SELESAI, BATAL |

### 8.3 Sheet `Settings` (format key–value)

| key | value |
|---|---|
| `edition_label` | 59 |
| `banner_text` | Ready Hari Selasa |
| `sticky_title` | MISSION HARI INI: JANGAN SAMPAI KEHABISAN!!! |
| `sticky_body` | Stok terbatas. Peminat nggak terbatas. Siapa cepat, dia kenyang. |
| `contact_name` | Annisa (XI-MP) |
| `contact_phone` | +62 857-7440-6605 |
| `contact_form_url` | (URL Google Form, opsional) |
| `store_open` | TRUE (FALSE = pemesanan ditutup) |

---

## 9. Kontrak API (Apps Script Web App)

Base URL: `VITE_APPS_SCRIPT_URL`

### `GET ?action=products`

Respons:

```json
{
  "ok": true,
  "products": [
    {
      "id": "samyang-roll",
      "nama": "Samyang Roll isi 4 Pcs",
      "harga": 10000,
      "deskripsi": "…",
      "gambar": "/uploads/products/samyang-roll.jpg",
      "stok": 30
    }
  ]
}
```

### `GET ?action=settings`

```json
{ "ok": true, "settings": { "banner_text": "Ready Hari Selasa", "store_open": true } }
```

(Opsional: gabungkan dengan `products` dalam satu request `?action=bootstrap` agar hanya satu panggilan jaringan.)

### `POST` (`Content-Type: text/plain`) — kirim pesanan

Body:

```json
{
  "nama": "Budi",
  "kelas": "XI-MP 1",
  "no_telp": "081234567890",
  "catatan": "Tanpa pedas",
  "metode_bayar": "QRIS",
  "items": [
    { "id": "nasi-ayam-geprek", "qty": 2 },
    { "id": "es-jelly-lumut-coklat", "qty": 1 }
  ],
  "website": ""
}
```

Respons sukses:

```json
{ "ok": true, "orderId": "TB-0001", "total": 30000 }
```

Respons gagal:

```json
{ "ok": false, "error": "STOK_TIDAK_CUKUP", "message": "Stok Nasi Ayam Geprek tersisa 1" }
```

Kode error: `VALIDASI_GAGAL`, `STOK_TIDAK_CUKUP`, `PRODUK_TIDAK_DITEMUKAN`, `TOKO_TUTUP`, `SPAM_TERDETEKSI`, `SERVER_ERROR`.

### Logika `doPost` (ringkas)

1. Parse JSON dan validasi semua field di server.
2. Jika honeypot `website` terisi, tolak.
3. `LockService.getScriptLock()` agar pesanan bersamaan tidak berbenturan.
4. Baca `Products`, cocokkan `id`, hitung ulang `total`, cek stok.
5. Kurangi stok (opsional, dikontrol konfigurasi) dan tambahkan baris ke `Orders`.
6. Buat `order_id` berurutan dan kembalikan respons.

Kerangka kode:

```javascript
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'products') return json({ ok: true, products: readProducts() });
  if (action === 'settings') return json({ ok: true, settings: readSettings() });
  return json({ ok: false, error: 'AKSI_TIDAK_DIKENAL' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    // validasi, hitung total dari sheet Products, cek stok, appendRow ke Orders
    return json({ ok: true, orderId: 'TB-0001', total: 30000 });
  } catch (err) {
    return json({ ok: false, error: 'SERVER_ERROR', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Deploy sebagai **Web app**: *Execute as: Me*, *Who has access: Anyone*.

---

## 10. Keamanan & Risiko

| Risiko | Mitigasi |
|---|---|
| URL Apps Script bersifat publik | Validasi dan hitung ulang total di server; tidak ada data sensitif di sheet `Products`/`Settings` |
| Spam / pesanan palsu | Honeypot, batasi panjang input, opsional pembatasan permintaan per nomor telepon dalam rentang waktu tertentu |
| Manipulasi harga dari klien | Harga hanya diambil dari sheet `Products` di server |
| Injeksi formula Spreadsheet (nilai awalan `=`, `+`, `-`, `@`) | Sanitasi input: awali dengan `'` bila diawali karakter tersebut sebelum `appendRow` |
| Data pribadi (nama, kelas, telepon) terbuka | Spreadsheet tidak dibagikan publik; hanya pengurus yang diberi akses |
| Pesanan bersamaan melebihi stok | `LockService` pada `doPost` |
| Kuota Apps Script / latensi (1–3 detik) | Cache produk di klien (mis. 60 detik), skeleton loading, `CacheService` di server |
| Pembayaran QRIS tidak terverifikasi otomatis | Status `BARU` → `DIBAYAR` diubah manual; tampilkan petunjuk jelas di UI |
| Aset QRIS salah/kedaluwarsa | Dokumentasikan lokasi `public/uploads/qris.png` untuk penggantian |
| Spreadsheet atau Apps Script gagal | Pesan error ramah, tombol coba lagi, kontak WhatsApp penjual sebagai cadangan |

---

## 11. Alur Pengguna

### 11.1 Pesan satu produk

1. Pembeli membuka `/`, melihat daftar produk.
2. Menekan **Detail** pada produk.
3. Mengisi form (nama, kelas, telepon, catatan, jumlah).
4. Memilih metode pembayaran (jika QRIS: scan kode, lalu lanjut).
5. Menekan **Pesan Sekarang**.
6. Melihat modal sukses dengan kode pesanan.

### 11.2 Pesan beberapa produk

1. Menekan **Add to Cart** pada beberapa produk di `/`.
2. Membuka tombol keranjang di pojok kanan bawah.
3. Mengatur jumlah, lalu menekan **Pesan Semua**.
4. Mengisi data dan memilih pembayaran.
5. Mengirim; keranjang dikosongkan; modal sukses tampil.

---

## 12. Kriteria Penerimaan (Acceptance Criteria)

| # | Kriteria |
|---|---|
| AC-01 | Mengubah `harga`, `nama`, atau `stok` di sheet `Products` terlihat di website setelah muat ulang, tanpa deploy |
| AC-02 | Produk dengan `aktif = FALSE` tidak tampil; `stok = 0` tampil "HABIS" dan tidak bisa dipesan |
| AC-03 | Setiap kartu produk menampilkan gambar, nama, harga, tombol Add to Cart dan Detail |
| AC-04 | Tombol keranjang selalu terlihat di pojok kanan bawah dan menampilkan jumlah item yang benar |
| AC-05 | Keranjang bertahan setelah refresh halaman |
| AC-06 | Form kosong atau tidak valid tidak bisa dikirim dan menampilkan pesan error per field |
| AC-07 | Pesanan sukses menambah satu baris di sheet `Orders` dengan data lengkap dan total benar |
| AC-08 | "Pesan Semua" menghasilkan satu baris pesanan berisi semua item keranjang |
| AC-09 | Memilih QRIS menampilkan gambar dari `/uploads/qris.png`; COD tidak menampilkannya |
| AC-10 | Total yang tersimpan dihitung ulang server dan sama dengan harga sheet × jumlah |
| AC-11 | Tampilan sesuai tema piknik (gingham merah, latar taman, papan gabus, piring kayu, bintang harga) di layar 360px sampai 1440px |
| AC-12 | Jika API gagal, pengguna melihat pesan error dan bisa mencoba lagi tanpa kehilangan isian form |
| AC-13 | Tidak ada database selain Google Spreadsheet |

---

## 13. Rencana Pengembangan (Milestone)

| Tahap | Pekerjaan | Hasil |
|---|---|---|
| 1. Setup | Buat Spreadsheet (3 sheet), Apps Script `doGet`/`doPost`, deploy Web app, proyek React + Vite + router | API bisa dites lewat browser/Postman |
| 2. UI dasar | Layout tema piknik, Header, ProductCard, PriceStar, latar | Halaman `/` statis sesuai desain |
| 3. Integrasi produk | `getProducts`, `getSettings`, skeleton, error state | Produk tampil dari Spreadsheet |
| 4. Keranjang | CartContext, CartFab, CartDrawer, localStorage | Add to cart & ubah jumlah berfungsi |
| 5. Detail & form | Halaman detail, OrderForm, validasi, PaymentOption, QrisPanel | Form lengkap |
| 6. Kirim pesanan | `submitOrder`, validasi server, modal sukses, Pesan Semua | Pesanan masuk ke sheet `Orders` |
| 7. Polish & QA | Animasi, responsif, aksesibilitas, uji ponsel, uji beban ringan | Siap rilis |
| 8. Deploy | Hosting (Vercel/Netlify), set env, ganti QRIS asli | Website live |

---

## 14. Pertanyaan Terbuka

1. Apakah stok perlu berkurang otomatis setiap pesanan masuk, atau diatur manual oleh penjual?
2. Apakah perlu batas waktu pemesanan (contoh: hanya sampai hari Senin untuk pengiriman Selasa) via `store_open` dan `banner_text`?
3. Apakah perlu tautan WhatsApp otomatis ke penjual setelah pesanan sukses (konfirmasi + bukti bayar QRIS)?
4. Apakah foto produk disimpan di `public/uploads/products/` (butuh deploy ulang saat ganti foto) atau memakai tautan gambar eksternal agar bisa diganti dari Spreadsheet?
5. Badge angka "59" pada logo: merupakan nomor edisi, nomor kelas, atau hal lain? (Saat ini dibuat konfigurable lewat `edition_label`.)
