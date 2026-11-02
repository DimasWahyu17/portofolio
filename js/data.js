/**
 * data.js — Isi portofolio Dimas Wahyu
 *
 * PANDUAN EDIT:
 * - AVATAR  : URL atau data URI base64 foto. Kosongkan ('') untuk menampilkan inisial.
 * - INISIAL : Dua huruf yang muncul jika AVATAR kosong.
 * - PROJECTS: Daftar proyek. Untuk menambah proyek, salin satu baris { ... },
 *             tempel di bawahnya, lalu ubah isinya.
 *               kode = link repo GitHub (isi HANYA jika repo Public)
 *               demo = link demo / video / prototipe (boleh kosong)
 * - STATIONS: Section portofolio yang tersebar di langit.
 *     id, label, x/y (0–2600 / 0–1700), color (hex), html (isi kartu)
 */

// ── Foto & inisial ────────────────────────────────────────────
export const AVATAR  = '';   // Contoh: 'foto.jpg' (file di folder yang sama)
export const INISIAL = 'DW';

// ── Daftar proyek ─────────────────────────────────────────────
const PROJECTS = [
  { judul: 'Dashboard Pengelolaan Data dan Dokumen',
    desk: 'Dashboard web untuk mengelola data dan dokumen di lingkungan Dinas Pendidikan Kota Salatiga.',
    tech: ['Python', 'React', 'Vite', 'Tailwind CSS'],
    catatan: 'Proyek magang. Kode tidak dipublikasikan.', kode: '', demo: '' },
  { judul: 'Buku Tamu Digital',
    desk: 'Aplikasi buku tamu digital untuk mencatat kunjungan tamu di Dinas Pendidikan Kota Salatiga.',
    tech: [],
    catatan: 'Proyek magang. Kode tidak dipublikasikan.', kode: '', demo: '' },
  { judul: 'Aplikasi Pemesanan Tiket Pesawat',
    desk: 'Aplikasi mobile dengan pencarian penerbangan, detail tiket, pemesanan, dan riwayat transaksi.',
    tech: ['Flutter'], catatan: '', kode: '', demo: '' },
  { judul: 'Website SPK Transportasi (AHP)',
    desk: 'Membantu pengguna memilih moda transportasi terbaik dengan perhitungan kriteria dan pembobotan AHP.',
    tech: ['Flask', 'React', 'AHP'], catatan: '', kode: '', demo: '' },
  { judul: 'Desain UI/UX Recyclo',
    desk: 'Antarmuka aplikasi edukasi daur ulang sampah: wireframe, prototipe interaktif, dan skema warna bertema lingkungan.',
    tech: ['Figma'], catatan: '', kode: '', demo: '' },
  { judul: 'Portofolio Langit Interaktif',
    desk: 'Website ini: pesawat 3D yang bisa diterbangkan pengunjung untuk menjelajahi isi portofolio.',
    tech: ['JavaScript', 'Canvas', 'Three.js'], catatan: '', kode: '', demo: '' }
];

const LINK = (u, t) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
const PJ = p => `<div class="pj"><b>${p.judul}</b><p>${p.desk}</p>`
  + (p.tech.length ? `<div class="chips">${p.tech.map(x => `<span>${x}</span>`).join('')}</div>` : '')
  + (p.catatan ? `<p class="nt">${p.catatan}</p>` : '')
  + ((p.kode || p.demo) ? `<p class="nt">${[p.kode && LINK(p.kode, 'Kode'), p.demo && LINK(p.demo, 'Demo')].filter(Boolean).join(' · ')}</p>` : '')
  + `</div>`;

// ── Section-section portofolio ────────────────────────────────
export const STATIONS = [
  {
    id: 'tentang',
    label: 'Tentang',
    x: 760, y: 520,
    color: '#ffd166',
    html: `
      <div class="av" ${AVATAR ? `style="background-image:url('${AVATAR}')"` : ''}>
        ${AVATAR ? '' : INISIAL}
      </div>
      <h2>Tentang saya</h2>
      <p>Lulusan S1 Informatika (IPK 3,69) dari Universitas Jenderal Achmad Yani Yogyakarta
         dengan landasan kuat dalam analisis sistem dan pengelolaan data.</p>
      <p>Berbekal magang di Dinas Pendidikan Kota Salatiga, saya terlatih disiplin,
         adaptif, dan berorientasi pada solusi.</p>
    `
  },
  {
    id: 'proyek',
    label: 'Proyek',
    x: 1750, y: 440,
    color: '#7ae0d0',
    html: `<h2>Proyek</h2>` + PROJECTS.map(PJ).join('')
  },
  {
    id: 'keahlian',
    label: 'Keahlian',
    x: 1850, y: 1180,
    color: '#ff8fab',
    html: `
      <h2>Keahlian</h2>
      <p>Web &amp; backend</p>
      <div class="chips"><span>React</span><span>Flask</span><span>JavaScript</span><span>Python</span><span>RESTful API</span></div>
      <p style="margin-top:10px">Mobile &amp; desain</p>
      <div class="chips"><span>Flutter</span><span>Figma</span></div>
      <p style="margin-top:10px">Data &amp; alat</p>
      <div class="chips"><span>MySQL</span><span>MongoDB</span><span>Git</span><span>Trello</span></div>
      <p style="margin-top:10px">Soft skill</p>
      <div class="chips"><span>Problem Solving</span><span>Teamwork</span><span>Adaptability</span><span>Time Management</span></div>
    `
  },
  {
    id: 'pengalaman',
    label: 'Pengalaman',
    x: 1300, y: 300,
    color: '#ffb86b',
    html: `
      <h2>Pengalaman</h2>
      <div class="pj"><b>Magang ICT</b>
        <p>Dinas Pendidikan Kota Salatiga · Juli–Agustus 2025</p>
        <ul>
          <li>Perawatan perangkat keras dan jaringan</li>
          <li>Backup data dan dukungan teknis pegawai</li>
          <li>Pembaruan website dinas dan dokumentasi sistem</li>
        </ul>
      </div>
      <div class="pj"><b>Ketua Tim Fullstack Developer</b>
        <p>Decision Support System (AHP) · Sep 2024–Jan 2025</p>
        <ul>
          <li>Memimpin tim membangun SPK berbasis web</li>
          <li>React, Flask, dan MySQL; selesai tepat waktu dengan dokumentasi teknis</li>
        </ul>
      </div>
    `
  },
  {
    id: 'sertifikat',
    label: 'Sertifikat',
    x: 1330, y: 1390,
    color: '#9be564',
    html: `
      <h2>Sertifikat</h2>
      <div class="pj"><b>Pemrogram Mobile Pratama</b>
        <p>Junior Mobile Programmer · Profesi Teknologi Digital · 2025–2028</p>
      </div>
      <p><b>Pelatihan</b></p>
      <ul>
        <li>Seminar Data Science for Business Intelligence Strategy (2023)</li>
        <li>Seminar Keamanan Cyber dalam Smart System (2023)</li>
        <li>Lokakarya Pengenalan Tugas Akhir Data Mining (2023)</li>
      </ul>
    `
  },
  {
    id: 'kontak',
    label: 'Kontak',
    x: 820, y: 1230,
    color: '#b69cff',
    html: `
      <h2>Kontak</h2>
      <p>Terbuka untuk magang, kerja, dan kolaborasi. Ayo ngobrol.</p>
      <p><a href="mailto:ryudimas17@gmail.com">ryudimas17@gmail.com</a></p>
      <p><a href="https://github.com/DimasWahyu17" target="_blank" rel="noopener">GitHub</a></p>
    `
  }
];