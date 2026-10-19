# DESIGN.md — TenBite

Dokumen desain visual website penjualan makanan danusan **TenBite**. Acuan utama: poster promosi TenBite (tema piknik, papan gabus, kain kotak-kotak merah, latar taman).

---

## 1. Konsep Desain

**Tema:** Piknik di taman.
**Nuansa:** Hangat, ceria, homemade, seperti poster menu yang ditempel di papan gabus di atas taplak piknik.

Elemen visual utama yang harus muncul di seluruh website:

| Elemen | Penerapan |
|---|---|
| Kain kotak-kotak merah-putih (gingham) | Sudut kartu produk, alas section, border, footer, header cart |
| Latar taman (pohon, langit, rumput, blur) | Background halaman (fixed, di-blur ringan) |
| Papan gabus (cork board) | Container utama daftar produk |
| Piring kayu bulat | Frame foto produk |
| Bintang kuning | Badge harga |
| Label krem seperti selotip/kertas | Nama produk |
| Sticky note kuning + pin merah | Pesan promosi / catatan penting |
| Karakter chef + topi chef | Dekorasi header |
| Struk (receipt) pudar | Tekstur latar di belakang papan gabus & ringkasan keranjang |
| Keranjang piknik + stroberi | Dekorasi footer / empty state |

---

## 2. Color Palette

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-olive` | `#5B6B34` | Huruf "T" logo, outline teks, tombol utama |
| `--color-olive-dark` | `#3F4A24` | Hover tombol, teks judul |
| `--color-lime-cream` | `#E4F2B8` | Huruf "enbite" pada logo |
| `--color-cream` | `#FBEBC4` | Label nama produk, kartu, panel form |
| `--color-cream-dark` | `#F2D99B` | Border label, hover |
| `--color-gingham-red` | `#D9322F` | Kotak-kotak, aksen, tombol hapus |
| `--color-white` | `#FFFFFF` | Kotak-kotak putih |
| `--color-cork` | `#C99A5B` | Papan gabus |
| `--color-wood` | `#D9A66B` | Piring kayu |
| `--color-wood-dark` | `#A86F3A` | Border piring kayu |
| `--color-star` | `#F6C42B` | Bintang harga |
| `--color-star-border` | `#E0A312` | Outline bintang |
| `--color-sticky` | `#F7D872` | Sticky note |
| `--color-ink` | `#3A2E22` | Teks isi (cokelat tua, bukan hitam murni) |
| `--color-success` | `#4C8B3A` | Status berhasil |
| `--color-danger` | `#C62828` | Error / stok habis |

Aturan kontras: teks isi di atas krem harus `--color-ink`; teks di atas olive harus `--color-lime-cream` atau putih. Rasio kontras minimal WCAG AA (4.5:1).

---

## 3. Tipografi

Semua font dari Google Fonts.

| Peran | Font | Catatan |
|---|---|---|
| Logo huruf "T" | **Lobster Two** (Italic, Bold) atau **Pacifico** | Script miring, ukuran paling besar, warna olive dengan outline lime-cream dan shadow |
| Logo "enbite" | **Fredoka** (Bold 700) | Rounded, tebal, warna lime-cream, outline olive tebal, drop shadow |
| Nama produk | **Lobster Two** / **Kaushan Script** | Script dekoratif, warna cokelat-emas `#B8893F` di atas label krem |
| Judul section & tombol | **Fredoka** (SemiBold) | |
| Body, form, deskripsi | **Nunito** (Regular/SemiBold) | Mudah dibaca |
| Angka harga | **Fredoka** (Bold) | Di dalam bintang |
| Catatan sticky note | **Caveat** atau Nunito Italic | Kesan tulisan tangan |

Skala ukuran (mobile → desktop):

| Elemen | Mobile | Desktop |
|---|---|---|
| Logo TenBite | 64px | 120px |
| H1 (judul halaman detail) | 28px | 40px |
| Nama produk (kartu) | 22px | 26px |
| Harga | 18px | 22px |
| Body | 14px | 16px |
| Caption | 12px | 13px |

### Spesifikasi Logo (header)

- Teks: **T**enbite. "T" jauh lebih besar dan bergaya script; "enbite" bergaya rounded tebal.
- Efek: outline tebal olive, fill lime-cream, drop shadow lembut ke bawah-kanan.
- Badge **"59"** di dalam piring perak/putih di kanan bawah logo (nilai bisa dikonfigurasi dari Spreadsheet, tab `Settings`, key `edition_label`).
- Dekorasi: topi chef di kiri atas, karakter chef di kanan atas.
- Di atas logo: pill/kapsul transparan berisi dua logo sekolah (opsional, dari `/uploads/logo-*.png`).

---

## 4. Layout & Grid

- Pendekatan **mobile-first** (poster aslinya vertikal / portrait).
- Lebar konten maksimum: `1100px`, di tengah.
- Breakpoint: `sm 640px`, `md 768px`, `lg 1024px`.
- Spacing menggunakan skala 4px (`4, 8, 12, 16, 24, 32, 48`).
- Border radius: kartu `20px`, tombol `999px` (pill), label `10px`, piring `50%`.

### Layering latar belakang (dari belakang ke depan)

1. Foto taman (fixed, `object-fit: cover`) dengan blur `4px`.
2. Overlay gingham merah-putih di bagian bawah/tepi (CSS pattern, lihat bawah).
3. Tekstur struk pudar (opacity 0.15) di belakang papan.
4. Papan gabus berbingkai kayu sebagai container produk.

### CSS Pattern Gingham

```css
.gingham {
  --size: 28px;
  background-color: #fff;
  background-image:
    linear-gradient(90deg, rgba(217, 50, 47, 0.55) 50%, transparent 50%),
    linear-gradient(rgba(217, 50, 47, 0.55) 50%, transparent 50%);
  background-size: var(--size) var(--size);
}
```

### Variabel CSS

```css
:root {
  --color-olive: #5B6B34;
  --color-olive-dark: #3F4A24;
  --color-lime-cream: #E4F2B8;
  --color-cream: #FBEBC4;
  --color-cream-dark: #F2D99B;
  --color-gingham-red: #D9322F;
  --color-cork: #C99A5B;
  --color-wood: #D9A66B;
  --color-wood-dark: #A86F3A;
  --color-star: #F6C42B;
  --color-sticky: #F7D872;
  --color-ink: #3A2E22;
  --radius-card: 20px;
  --shadow-soft: 0 8px 20px rgba(58, 46, 34, 0.25);
}
```

---

## 5. Halaman 1 — Daftar Produk (`/`)

### 5.1 Struktur dari atas ke bawah

1. **Header**: pill logo sekolah, logo TenBite besar, badge "59", dekorasi chef.
2. **Banner info** (dari Spreadsheet `Settings`): contoh "Ready Hari Selasa" dalam speech bubble putih berborder hitam.
3. **Papan gabus** berisi daftar produk.
4. **Sticky note**: "MISSION HARI INI: JANGAN SAMPAI KEHABISAN!!!" + "Stok terbatas. Peminat nggak terbatas. Siapa cepat, dia kenyang."
5. **Contact Person**: kartu krem dengan ikon WhatsApp dan ikon form.
6. **Footer**: kain gingham + keranjang stroberi.
7. **Floating Cart Button** (pojok kanan bawah, fixed).

### 5.2 Kartu Produk

Tata letak mengikuti poster: foto dalam piring kayu bulat, bintang harga menempel di sudut piring, label nama produk di sebelahnya.

```
Desktop (grid 2 kolom, zig-zag seperti poster)

 ┌───────────────────────────────────────────┐
 │  (★10k)(Piring foto)  [Samyang Roll ...]  │
 │                                           │
 │  [Nasi Ayam Geprek]  (Piring foto)(★11k)  │
 └───────────────────────────────────────────┘

Mobile (1 kolom)

 ┌───────────────────────┐
 │ ★10k   (Piring foto)  │
 │  [ Samyang Roll isi 4 │
 │    Pcs ]              │
 │ [Add to Cart][Detail] │
 └───────────────────────┘
```

Detail kartu:

| Bagian | Spesifikasi |
|---|---|
| Piring kayu | Lingkaran 160px (mobile) / 220px (desktop), border `--color-wood-dark` 6px, alas gingham merah di belakang sebagai taplak (rotasi -6°), foto di-crop lingkaran |
| Bintang harga | Bintang 5 sudut, fill `--color-star`, teks harga tebal berwarna putih dengan outline cokelat (contoh "10k"). Posisi di sudut atas piring, rotasi acak ±12° |
| Label nama | Latar `--color-cream`, padding `8px 16px`, font script, sedikit rotasi (±1°), shadow tipis |
| Tombol Add to Cart | Pill olive, ikon keranjang, teks lime-cream |
| Tombol Detail | Pill outline olive, teks olive, latar krem |
| Stok habis | Foto grayscale, stempel merah "HABIS" miring, kedua tombol disabled |

Format harga: tampil `10k` di bintang (singkatan), dan `Rp10.000` di tempat lain (detail, keranjang).

### 5.3 Floating Cart Button

- Posisi: `fixed; right: 16px; bottom: 16px; z-index: 50`.
- Bentuk: lingkaran 64px, latar olive, ikon keranjang piknik, border gingham merah-putih.
- Badge jumlah item: lingkaran merah di kanan atas.
- Animasi: bounce kecil saat item ditambahkan.

### 5.4 Cart Drawer

Slide-in dari kanan (desktop) / bottom sheet (mobile), latar tekstur struk.

Isi:

1. Judul "Keranjang Piknik" + tombol tutup.
2. Daftar item: thumbnail bulat, nama, harga, stepper `- 1 +`, tombol hapus.
3. Garis putus-putus ala struk, lalu **Total**.
4. Tombol utama **Pesan Semua** (lebar penuh, olive).
5. Empty state: ilustrasi keranjang stroberi + teks "Keranjangmu masih kosong".

Tombol **Pesan Semua** membuka form pemesanan (modal/step berikutnya di drawer) dengan field yang sama seperti form detail produk, tetapi ringkasan pesanan berisi seluruh item keranjang.

---

## 6. Halaman 2 — Detail Produk (`/product/:id`)

### 6.1 Struktur

1. Header kecil (logo TenBite versi ringkas, klik kembali ke `/`).
2. Tombol **← Kembali**.
3. Dua kolom di desktop, satu kolom di mobile:
   - **Kiri:** foto produk besar dalam piring kayu, bintang harga.
   - **Kanan:** nama produk (font script), harga, deskripsi, status stok.
4. **Form Pemesanan** dalam kartu krem berbingkai gingham.
5. Floating Cart Button tetap tampil.

### 6.2 Form Pemesanan

| Field | Tipe | Validasi |
|---|---|---|
| Nama | text | Wajib, 2–50 karakter |
| Kelas | text | Wajib, contoh "XI-MP 1" |
| Nomor Telepon | tel | Wajib, format Indonesia (`08xx` atau `+62`), 9–15 digit |
| Jumlah | stepper | Min 1, maks sesuai stok |
| Catatan | textarea | Opsional, maks 200 karakter |
| **Total Pesanan** | read-only | Otomatis: harga × jumlah, tampil `Rp10.000` |
| Metode Pembayaran | radio card | Wajib: **QRIS** atau **Bayar di Tempat** |

**Radio card metode pembayaran:**

- Dua kartu besar berdampingan (ikon QR dan ikon tangan/uang).
- Terpilih: border olive 3px + centang di pojok.
- Jika **QRIS** dipilih: tampil panel berisi gambar QRIS (`/uploads/qris.png`), nominal total di atasnya, dan teks "Scan lalu tekan Pesan Sekarang".
- Jika **Bayar di Tempat** dipilih: tampil teks "Bayar saat pesanan diterima / diambil."

Tombol bawah: **Pesan Sekarang** (olive, lebar penuh) dan **Tambah ke Keranjang** (outline).

### 6.3 State Feedback

| State | Tampilan |
|---|---|
| Loading kirim | Tombol disabled + spinner, teks "Mengirim pesanan..." |
| Sukses | Modal dengan ilustrasi chef, kode pesanan (misalnya `TB-0001`), ringkasan, tombol "Kembali Belanja" |
| Gagal | Banner merah di atas form, tombol "Coba Lagi", data form tidak dihapus |
| Validasi | Pesan error merah di bawah field, border field merah |

---

## 7. Komponen UI

| Komponen | Keterangan |
|---|---|
| `Header` | Logo, badge edisi, dekorasi chef |
| `ProductCard` | Piring, bintang harga, label nama, 2 tombol |
| `PriceStar` | Bintang kuning dengan harga |
| `WoodPlate` | Frame foto lingkaran bergaya piring kayu |
| `NameLabel` | Label krem dengan font script |
| `StickyNote` | Catatan kuning dengan pin merah |
| `CartFab` | Tombol keranjang melayang + badge |
| `CartDrawer` | Daftar keranjang + tombol Pesan Semua |
| `OrderForm` | Form pemesanan (dipakai di detail & keranjang) |
| `PaymentOption` | Radio card QRIS / COD |
| `QrisPanel` | Menampilkan gambar QRIS dan total |
| `SuccessModal` | Konfirmasi pesanan |
| `Skeleton` | Placeholder loading produk |
| `GinghamBorder` | Pembatas bermotif kotak-kotak |

---

## 8. Interaksi & Animasi

Gunakan CSS transition atau Framer Motion; durasi 150–300ms.

- Hover kartu: naik 4px + shadow lebih tebal, piring berputar ±3°.
- Klik Add to Cart: foto kecil "terbang" ke Floating Cart Button, badge jumlah membesar sesaat.
- Drawer: slide + fade.
- Bintang harga: wobble kecil saat hover.
- Hormati `prefers-reduced-motion` (matikan animasi non-esensial).

---

## 9. Responsif

| Ukuran | Perilaku |
|---|---|
| < 640px | 1 kolom, kartu zig-zag disederhanakan, drawer jadi bottom sheet |
| 640–1023px | 2 kolom produk |
| ≥ 1024px | Papan gabus lebar penuh, 2 kolom zig-zag, form detail 2 kolom |

Area sentuh minimum 44×44px. Floating Cart Button tidak boleh menutupi tombol utama (beri `padding-bottom: 96px` pada konten).

---

## 10. Aset

Lokasi di frontend: `public/uploads/`

```
public/uploads/
├── qris.png              # gambar QRIS (diunggah developer)
├── bg-garden.jpg         # latar taman
├── chef.png              # karakter chef (transparan)
├── chef-hat.png          # topi chef
├── receipt-texture.png   # tekstur struk
├── basket-strawberry.png # dekorasi footer
├── logo-school-1.png
├── logo-school-2.png
└── products/
    ├── samyang-roll.jpg
    ├── nasi-ayam-geprek.jpg
    ├── es-jelly-lumut-coklat.jpg
    ├── brownies-coklat.jpg
    ├── roti-gulung-sosis.jpg
    └── risol-aneka-rasa.jpg
```

Ketentuan gambar: format WebP/JPG, foto produk persegi minimum 600×600px, maksimum 200 KB per file, gunakan `loading="lazy"` dan atribut `alt`.

---

## 11. Konten Awal (dari poster)

| Produk | Harga |
|---|---|
| Samyang Roll isi 4 Pcs | Rp10.000 |
| Nasi Ayam Geprek | Rp11.000 |
| Es Jelly Lumut Coklat | Rp8.000 |
| Brownies Coklat | Rp10.000 |
| Roti Gulung Sosis | Rp10.000 |
| Risol Aneka Rasa | Rp5.000 |

Teks pendukung:

- Banner: "Ready Hari Selasa"
- Sticky note: "MISSION HARI INI: JANGAN SAMPAI KEHABISAN!!! Stok terbatas. Peminat nggak terbatas. Siapa cepat, dia kenyang."
- Kontak: Annisa (XI-MP), +62 857-7440-6605

Semua teks di atas dibaca dari Spreadsheet (lihat PRD) agar mudah diubah tanpa deploy ulang.

---

## 12. Aksesibilitas

- Semua gambar produk memiliki `alt` berupa nama produk.
- Tombol ikon memiliki `aria-label` (contoh "Buka keranjang, 3 item").
- Fokus keyboard terlihat jelas (outline 3px `--color-olive`).
- Drawer dan modal menangkap fokus dan bisa ditutup dengan `Esc`.
- Informasi status (stok habis, error) tidak hanya mengandalkan warna.
- Dekorasi murni memakai `aria-hidden="true"`.
