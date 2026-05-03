// ============================================================
//  app.js  —  Frontend logic, fetch ke API PHP
//  Sesuaikan BASE_URL dengan nama folder di C:\laragon\www\
// ============================================================

const BASE_URL = '/galeri-antik/api/products.php';
// Jika nama folder berbeda, contoh: '/galeri_antik/api/products.php'

// ── state ───────────────────────────────────────────
let currentFilter = 'all';
let editingId     = null;

// ── fetch helper ────────────────────────────────────
async function api(params = '', method = 'GET', body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(BASE_URL + (params ? '?' + params : ''), opts);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Error dari server.');
    return json.data;
}

// ── navigasi ────────────────────────────────────────
function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => a.classList.remove('active'));

    document.getElementById('page-' + pageId)?.classList.add('active');
    document.querySelectorAll(`[data-nav="${pageId}"]`).forEach(a => a.classList.add('active'));

    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'home')       loadFeatured();
    if (pageId === 'collection') loadCollection();
}

function toggleMobileMenu() { document.getElementById('mobileMenu').classList.toggle('open'); }
function closeMobileMenu()  { document.getElementById('mobileMenu').classList.remove('open'); }

// ── format ──────────────────────────────────────────
function formatRp(n)   { return 'Rp ' + parseInt(n).toLocaleString('id-ID'); }
function catName(c)    { return { keramik:'Keramik', perabot:'Perabot', lukisan:'Seni & Tekstil' }[c] || c; }
function loading(id)   { const el = document.getElementById(id); if (el) el.innerHTML = '<div class="empty-state"><p>Memuat...</p></div>'; }

// ── HOME: produk unggulan ────────────────────────────
async function loadFeatured() {
    loading('featured-grid');
    try {
        const data = await api('action=featured');
        const grid = document.getElementById('featured-grid');
        grid.innerHTML = data.length
            ? data.map(p => cardHTML(p, false)).join('')
            : '<div class="empty-state"><p>Belum ada produk unggulan.</p></div>';
    } catch(e) {
        document.getElementById('featured-grid').innerHTML = `<div class="empty-state"><p>${e.message}</p></div>`;
    }
}

// ── KOLEKSI ──────────────────────────────────────────
async function loadCollection() {
    loading('collection-grid');
    try {
        const q = currentFilter === 'all'
            ? 'action=all'
            : `action=all&category=${currentFilter}`;
        const data = await api(q);
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = data.length
            ? data.map(p => cardHTML(p, true)).join('')
            : '<div class="empty-state"><h3>Tidak ada produk</h3><p>Belum ada produk di kategori ini.</p></div>';
    } catch(e) {
        document.getElementById('collection-grid').innerHTML = `<div class="empty-state"><p>${e.message}</p></div>`;
    }
}

function setFilter(cat) {
    currentFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.filter === cat));
    loadCollection();
}

// ── CARD HTML ────────────────────────────────────────
function cardHTML(p, showActions) {
    const fallback = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80';
    return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-card-img" onclick="viewDetail(${p.id})">
        <img src="${p.image_url || fallback}" alt="${p.name}" loading="lazy"
             onerror="this.src='${fallback}'">
      </div>
      <div class="product-card-body" onclick="viewDetail(${p.id})">
        <div class="product-category-badge">${catName(p.category)}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-year">${p.year_era} · ${p.origin}</div>
        <div class="product-price">${formatRp(p.price)}</div>
      </div>
      ${showActions ? `
      <div class="product-card-actions">
        <button class="btn-edit"   onclick="openEdit(${p.id})">Edit</button>
        <button class="btn-delete" onclick="hapus(${p.id})">Hapus</button>
      </div>` : ''}
    </div>`;
}

// ── DETAIL ──────────────────────────────────────────
async function viewDetail(id) {
    document.getElementById('detail-content').innerHTML =
        '<div style="grid-column:1/-1;padding:6rem 2rem;text-align:center;color:var(--mid-gray)">Memuat...</div>';
    navigate('detail');
    try {
        const p = await api(`action=one&id=${id}`);
        document.getElementById('detail-content').innerHTML = `
          <div class="detail-img-main">
            <img src="${p.image_url}" alt="${p.name}"
                 onerror="this.src='https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80'">
          </div>
          <div class="detail-info">
            <div class="detail-label">${catName(p.category)}</div>
            <h1 class="detail-title">${p.name}</h1>
            <div class="divider"></div>
            <div class="detail-price">${formatRp(p.price)}</div>
            <p class="detail-desc">${p.description}</p>
            <div class="detail-meta">
              <div class="meta-item"><div class="meta-key">Asal Barang</div><div class="meta-val">${p.origin}</div></div>
              <div class="meta-item"><div class="meta-key">Tahun / Era</div><div class="meta-val">${p.year_era}</div></div>
              <div class="meta-item"><div class="meta-key">Kondisi</div><div class="meta-val">${p.condition}</div></div>
              <div class="meta-item"><div class="meta-key">Kategori</div><div class="meta-val">${catName(p.category)}</div></div>
            </div>
            <button class="btn-back" onclick="navigate('collection')">Kembali ke Koleksi</button>
          </div>`;
    } catch(e) {
        document.getElementById('detail-content').innerHTML =
            `<div style="padding:6rem 2rem;color:var(--mid-gray)">${e.message}</div>`;
    }
}

// ── MODAL: tambah ────────────────────────────────────
function openAdd() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Tambah Barang Baru';
    document.getElementById('productForm').reset();
    document.getElementById('productModal').classList.add('open');
}

// ── MODAL: edit ──────────────────────────────────────
async function openEdit(id) {
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Barang';
    document.getElementById('productModal').classList.add('open');
    try {
        const p = await api(`action=one&id=${id}`);
        document.getElementById('f-name').value        = p.name;
        document.getElementById('f-category').value    = p.category;
        document.getElementById('f-price').value       = p.price;
        document.getElementById('f-year').value        = p.year_era;
        document.getElementById('f-origin').value      = p.origin;
        document.getElementById('f-condition').value   = p.condition;
        document.getElementById('f-image').value       = p.image_url;
        document.getElementById('f-description').value = p.description;
        document.getElementById('f-featured').value    = p.is_featured ? 'true' : 'false';
    } catch(e) { closeModal(); showToast('Gagal memuat data: ' + e.message); }
}

function closeModal() {
    document.getElementById('productModal').classList.remove('open');
    editingId = null;
}

// ── SIMPAN (create / update) ─────────────────────────
async function saveProduct() {
    const payload = {
        name:        document.getElementById('f-name').value.trim(),
        category:    document.getElementById('f-category').value,
        price:       parseInt(document.getElementById('f-price').value) || 0,
        year_era:    document.getElementById('f-year').value.trim(),
        origin:      document.getElementById('f-origin').value.trim(),
        condition:   document.getElementById('f-condition').value,
        image_url:   document.getElementById('f-image').value.trim(),
        description: document.getElementById('f-description').value.trim(),
        is_featured: document.getElementById('f-featured').value === 'true',
    };

    if (!payload.name || !payload.category || !payload.year_era || !payload.origin || !payload.description) {
        showToast('Harap isi semua field wajib.'); return;
    }

    const btn = document.querySelector('.btn-save');
    btn.disabled = true; btn.textContent = 'Menyimpan...';

    try {
        if (editingId) {
            await api(`action=update&id=${editingId}`, 'POST', payload);
            showToast('Produk berhasil diperbarui.');
        } else {
            await api('action=create', 'POST', payload);
            showToast('Produk berhasil ditambahkan.');
        }
        closeModal();
        loadCollection();
        loadFeatured();
    } catch(e) {
        showToast('Gagal: ' + e.message);
    } finally {
        btn.disabled = false; btn.textContent = 'Simpan';
    }
}

// ── HAPUS ────────────────────────────────────────────
async function hapus(id) {
    if (!confirm('Yakin ingin menghapus barang ini?')) return;
    try {
        await api(`action=delete&id=${id}`, 'POST');
        showToast('Produk berhasil dihapus.');
        loadCollection();
        loadFeatured();
    } catch(e) { showToast('Gagal: ' + e.message); }
}

// ── TOAST ────────────────────────────────────────────
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ── KONTAK ───────────────────────────────────────────
function handleContact(e) {
    e.preventDefault();
    document.getElementById('successMsg').style.display = 'block';
    e.target.reset();
    setTimeout(() => document.getElementById('successMsg').style.display = 'none', 4000);
}

// ── NAVBAR SCROLL ────────────────────────────────────
window.addEventListener('scroll', () => {
    document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 20);
});

// ── INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    navigate('home');
    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
});