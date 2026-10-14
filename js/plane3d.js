/**
 * plane3d.js - Pesawat 3D menggunakan Three.js
 *
 * Membuat mesh pesawat sederhana dengan vertex color + flat shading.
 * Jika Three.js tidak tersedia, modul ini tidak melakukan apa-apa
 * dan renderer.js akan menggambar versi 2D fallback.
 */

export let renderer3  = null; // THREE.WebGLRenderer
export let scene      = null; // THREE.Scene
export let cam3       = null; // THREE.OrthographicCamera
export let planeGroup = null; // THREE.Group  (root transform)
export let planeMesh  = null; // THREE.Mesh   (rotasi bank)

/**
 * Inisialisasi scene Three.js, mesh pesawat, DAN langsung setSize.
 * Dengan cara ini canvas #c3 selalu berukuran benar sejak pertama kali.
 *
 * @param {number} dpr - device pixel ratio
 * @param {number} w   - lebar viewport
 * @param {number} h   - tinggi viewport
 */
export function init3D(dpr, w, h) {
  if (!window.THREE) return;

  try {
    const T = THREE;

    // ── Renderer ────────────────────────────────────────────────
    renderer3 = new T.WebGLRenderer({
      canvas:    document.getElementById('c3'),
      alpha:     true,
      antialias: true
    });

    // Ukuran framebuffer dan CSS canvas harus diset SEGERA setelah
    // renderer dibuat — jika tidak, canvas tetap 300x150 (default).
    renderer3.setPixelRatio(dpr);
    renderer3.setSize(w, h);
    renderer3.domElement.style.width  = w + 'px';
    renderer3.domElement.style.height = h + 'px';

    // ── Scene & kamera orthographic ─────────────────────────────
    scene = new T.Scene();
    cam3  = new T.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 1, 1000);
    cam3.position.z = 400;

    // ── Geometri pesawat (5 segitiga, vertex color) ─────────────
    const N  = [ 32,   0,  0];  // hidung
    const L  = [-22, -20,  5];  // sayap kiri
    const Rr = [-22,  20,  5];  // sayap kanan
    const Tt = [-16,   0,  2];  // ekor atas
    const K  = [-22,   0, -9];  // keel bawah

    const tris = [
      [N,  L,  Tt, '#f2f4ff'],
      [N,  Tt, Rr, '#e4e7ff'],
      [N,  K,  Tt, '#b9bfee'],
      [L,  Tt,  K, '#ffd166'],
      [Tt, Rr,  K, '#ffc233']
    ];

    const pos = [];
    const col = [];

    tris.forEach(([a, b, c, hex]) => {
      const color = new T.Color(hex);
      [a, b, c].forEach(v => {
        pos.push(...v);
        col.push(color.r, color.g, color.b);
      });
    });

    const geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color',    new T.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();

    planeMesh = new T.Mesh(geo, new T.MeshStandardMaterial({
      vertexColors: true,
      flatShading:  true,
      side:         T.DoubleSide,
      roughness:    0.65
    }));

    planeGroup = new T.Group();
    planeGroup.add(planeMesh);
    planeGroup.scale.set(1.15, 1.15, 1.15);
    scene.add(planeGroup);

    // ── Pencahayaan ─────────────────────────────────────────────
    scene.add(new T.AmbientLight(0xffffff, 0.75));
    const dl = new T.DirectionalLight(0xffffff, 0.9);
    dl.position.set(-200, 300, 400);
    scene.add(dl);

  } catch (e) {
    console.error('[plane3d] init3D gagal:', e);
    renderer3 = null;
  }
}

/**
 * Resize renderer saat jendela browser diubah ukurannya.
 *
 * @param {number} dpr - device pixel ratio
 * @param {number} w   - lebar viewport baru
 * @param {number} h   - tinggi viewport baru
 */
export function resize3D(dpr, w, h) {
  if (!renderer3) return;

  renderer3.setPixelRatio(dpr);
  renderer3.setSize(w, h);
  renderer3.domElement.style.width  = w + 'px';
  renderer3.domElement.style.height = h + 'px';

  cam3.left   = -w / 2;
  cam3.right  =  w / 2;
  cam3.top    =  h / 2;
  cam3.bottom = -h / 2;
  cam3.updateProjectionMatrix();
}

/**
 * Perbarui posisi & rotasi pesawat 3D, lalu render frame.
 *
 * Koordinat Three.js: (0,0) = tengah layar.
 * Offset dari kamera world ke plane world = posisi relatif di layar.
 *
 * @param {number} px    - posisi world X pesawat
 * @param {number} py    - posisi world Y pesawat
 * @param {number} cx    - posisi kamera 2D world X
 * @param {number} cy    - posisi kamera 2D world Y
 * @param {number} angle - heading pesawat (radian)
 * @param {number} bank  - kemiringan sayap (-1..1)
 * @param {number} t     - timestamp animasi (ms)
 */
export function render3D(px, py, cx, cy, angle, bank, t) {
  if (!renderer3) return;

  planeGroup.position.set(px - cx, -(py - cy), 0);
  planeGroup.rotation.z = -angle;
  planeMesh.rotation.x  = bank * 0.7;
  planeMesh.rotation.y  = -0.18 + Math.sin(t / 400) * 0.05;

  renderer3.render(scene, cam3);
}