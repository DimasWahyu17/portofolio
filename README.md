# Portofolio — Langit Interaktif ✈️

Portofolio berbasis canvas interaktif: terbangkan pesawat melintasi langit malam untuk menjelajahi setiap bagian profil Anda.

## Struktur Project

```
portofolio-langit/
├── index.html          ← Halaman utama (markup & loader)
├── css/
│   └── style.css       ← Semua styling (design tokens, layout, komponen)
├── js/
│   ├── data.js         ← 🔧 DATA ANDA — edit di sini!
│   ├── audio.js        ← Web Audio API (mesin + angin + chime)
│   ├── plane3d.js      ← Pesawat 3D (Three.js)
│   ├── physics.js      ← Fisika pergerakan pesawat & kamera
│   ├── renderer.js     ← Rendering canvas 2D (langit, station, dll)
│   └── main.js         ← Entry point & game loop
└── README.md
```

## Cara Menggunakan

### Langsung buka (tanpa server)
> ⚠️ ES Module (`import/export`) memerlukan HTTP server karena keamanan browser.

### Dengan server lokal (direkomendasikan)

**Node.js (npx serve):**
```bash
npx serve .
```

**Python:**
```bash
python -m http.server 8080
```

**VS Code:** Install ekstensi **Live Server**, lalu klik "Go Live".

---

## Personalisasi Portofolio

Edit file **`js/data.js`** — satu-satunya file yang perlu diubah untuk konten:

```js
// Foto profil (URL atau data URI base64)
export const AVATAR  = 'https://link-foto-anda.jpg';
export const INISIAL = 'NA';  // Tampil jika AVATAR kosong

// Section-section portofolio
export const STATIONS = [
  {
    id:    'tentang',
    label: 'Tentang',
    x: 760, y: 520,         // Posisi di langit (0–2600 / 0–1700)
    color: '#ffd166',        // Warna aksen
    html: `<h2>...</h2>...` // Konten HTML bebas
  },
  // ... tambah atau hapus section sesuai kebutuhan
];
```

## Kontrol

| Input         | Aksi                        |
|---------------|-----------------------------|
| 🖱️ Mouse move  | Arahkan pesawat             |
| 👆 Sentuh layar| Arahkan pesawat             |
| ← → ↑ ↓ / WASD | Kontrol manual             |
| Tombol nav    | Auto-pilot ke section       |
| 🔊 Tombol Suara| Toggle mute/unmute         |

## Teknologi

- **Canvas 2D API** — langit, bintang, awan, trail, minimap
- **Three.js r128** — model pesawat 3D (fallback 2D jika tidak tersedia)
- **Web Audio API** — efek suara prosedural (tanpa file audio)
- **ES Modules** — modularisasi JavaScript native
- **Bricolage Grotesque** — tipografi dari Google Fonts
