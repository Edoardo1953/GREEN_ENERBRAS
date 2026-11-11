/**
 * GREEN_ENERBRAS - Photos & Videos Management & Interactive Slideshow (Diaporama)
 * - 100% independent storage (IndexedDB + green_* localStorage keys, zero shared app data)
 * - Persistent local uploads via IndexedDB (photos, videos, custom MP3s survive reloads)
 * - Dossier organization + multi-photo selection for Slideshow (photos only)
 * - Videos separated and launched individually in Video Theater
 */

const DEFAULT_DOSSIERS = ['Dossier App', 'Impianti Solari', 'Parchi Solari', 'Tri Star', 'Generale'];

const STORAGE_KEYS = {
    deleted: 'green_deleted_media',
    titles: 'green_media_titles',
    order: 'green_media_order',
    userMedia: 'green_user_media',
    dossiers: 'green_media_dossiers',
    userAudio: 'green_user_audio'
};

const MEDIA_DB_NAME = 'GreenEnerbrasMediaDB';
const MEDIA_STORE_NAME = 'media_blobs';

// Global State
let currentMediaList = [];
let allPhotos = [];
let allVideos = [];
let allAudio = [];
let activeTypeFilter = 'all'; // 'all' | 'photo' | 'video'
let activeDossierFilter = 'all'; // 'all' | dossier name
let searchQuery = '';

// Multi-selection State (Photos ONLY)
let selectedPhotoIds = new Set();
let lastSelectedPhotoId = null;

// Blob URL cache & IndexedDB handle
let mediaDbInstance = null;
const activeBlobUrls = {};

// Diaporama State (Photos ONLY)
let diaporamaPhotos = [];
let currentSlideIndex = 0;
let diaporamaTimer = null;
let diaporamaSpeed = 4000;
let isDiaporamaPlaying = false;
let diaporamaAudio = null;
let isMusicMuted = false;
let currentAudioTrack = null;

// Lightbox State
let lightboxPhotosList = [];
let currentLightboxIndex = 0;

/* ==========================================================================
   URL & MIME HELPERS
   ========================================================================== */
function resolveMediaUrl(url) {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    const isInsideAdmin = window.location.pathname.includes('/admin/') || window.location.pathname.includes('\\admin\\');
    if (isInsideAdmin) {
        if (url.startsWith('../')) return url;
        return '../' + url;
    } else {
        if (url.startsWith('../')) return url.substring(3);
        return url;
    }
}

function inferMimeType(filename, mediaType) {
    const ext = (filename || '').split('.').pop().toLowerCase();
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'mp4' || ext === 'm4v') return 'video/mp4';
    if (ext === 'mov') return 'video/quicktime';
    if (ext === 'webm') return 'video/webm';
    if (ext === 'mp3') return 'audio/mpeg';
    if (ext === 'wav') return 'audio/wav';
    if (ext === 'm4a') return 'audio/mp4';
    if (mediaType === 'video') return 'video/mp4';
    if (mediaType === 'audio') return 'audio/mpeg';
    return 'image/jpeg';
}

function normalizeDossier(val) {
    if (!val || typeof val !== 'string') return 'Dossier App';
    const trimmed = val.trim();
    if (!trimmed) return 'Dossier App';
    if (trimmed === 'Villa F' || trimmed === 'Villa G') return 'Impianti Solari';
    if (trimmed === 'Villa H' || trimmed === 'Villa I') return 'Parchi Solari';
    if (trimmed === 'Resort' || trimmed === 'Sombra Resort') return 'Tri Star';
    return trimmed;
}

/* ==========================================================================
   INDEXEDDB PERSISTENT BLOB STORAGE
   ========================================================================== */
function openMediaDb() {
    return new Promise((resolve) => {
        if (mediaDbInstance) return resolve(mediaDbInstance);
        if (!window.indexedDB) {
            console.warn('IndexedDB non disponibile');
            return resolve(null);
        }
        try {
            const req = indexedDB.open(MEDIA_DB_NAME, 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
                    db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id' });
                }
            };
            req.onsuccess = (e) => {
                mediaDbInstance = e.target.result;
                resolve(mediaDbInstance);
            };
            req.onerror = (e) => {
                console.warn('Errore apertura IndexedDB media:', e);
                resolve(null);
            };
        } catch (err) {
            console.warn('Eccezione IndexedDB media:', err);
            resolve(null);
        }
    });
}

async function saveMediaBlob(id, file) {
    try {
        const buffer = await file.arrayBuffer();
        const mimeType = file.type || inferMimeType(file.name);
        const blob = new Blob([buffer], { type: mimeType });
        const objectUrl = URL.createObjectURL(blob);
        if (activeBlobUrls[id]) {
            try { URL.revokeObjectURL(activeBlobUrls[id]); } catch (e) {}
        }
        activeBlobUrls[id] = objectUrl;

        const db = await openMediaDb();
        if (db) {
            await new Promise((resolve, reject) => {
                const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
                const store = tx.objectStore(MEDIA_STORE_NAME);
                store.put({
                    id,
                    filename: file.name,
                    mimeType,
                    buffer,
                    savedAt: Date.now()
                });
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => reject(tx.error);
            });
        }
        return objectUrl;
    } catch (e) {
        console.warn('Errore salvataggio blob media in IndexedDB:', e);
        const fallbackUrl = URL.createObjectURL(file);
        activeBlobUrls[id] = fallbackUrl;
        return fallbackUrl;
    }
}

async function getMediaBlobRecord(id) {
    try {
        const db = await openMediaDb();
        if (!db) return null;
        return await new Promise((resolve) => {
            const tx = db.transaction(MEDIA_STORE_NAME, 'readonly');
            const store = tx.objectStore(MEDIA_STORE_NAME);
            const req = store.get(id);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    } catch (e) {
        return null;
    }
}

async function restoreBlobUrl(item) {
    if (activeBlobUrls[item.id]) return activeBlobUrls[item.id];
    const rec = await getMediaBlobRecord(item.id);
    if (rec && rec.buffer) {
        const mime = rec.mimeType || inferMimeType(item.filename, item.type);
        const blob = new Blob([rec.buffer], { type: mime });
        const url = URL.createObjectURL(blob);
        activeBlobUrls[item.id] = url;
        return url;
    }
    return null;
}

async function deleteMediaBlob(id) {
    if (activeBlobUrls[id]) {
        try { URL.revokeObjectURL(activeBlobUrls[id]); } catch (e) {}
        delete activeBlobUrls[id];
    }
    try {
        const db = await openMediaDb();
        if (!db) return;
        const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
        tx.objectStore(MEDIA_STORE_NAME).delete(id);
    } catch (e) {}
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initMediaGallery();
    initGlobalEventListeners();
    initInlineDropZone();
    initModalDropZone();
});

async function initMediaGallery() {
    const dataCatalog = window.GREEN_MEDIA_DATA;
    if (!dataCatalog) return;

    const deletedIds = getDeletedMediaIds();
    const customTitles = getCustomMediaTitles();
    const userMedia = getUserUploads();
    const userAudio = getUserAudioUploads();

    // Restore persistent Blob URLs from IndexedDB for user-uploaded items
    for (const item of userMedia) {
        const restoredUrl = await restoreBlobUrl(item);
        if (restoredUrl) {
            item.url = restoredUrl;
            item._expiredBlob = false;
        } else if (!item.url || item.url.startsWith('blob:')) {
            item.url = '';
            item._expiredBlob = true;
        }
    }

    const restoredUserAudio = [];
    for (const track of userAudio) {
        const restoredUrl = await restoreBlobUrl(track);
        if (restoredUrl) {
            track.url = restoredUrl;
            restoredUserAudio.push(track);
        }
    }

    const stockPhotos = (dataCatalog.photos || []).map(p => ({ ...p, type: 'photo', dossier: normalizeDossier(p.dossier || p.villa) }));
    const stockVideos = (dataCatalog.videos || []).map(v => ({ ...v, type: 'video', dossier: normalizeDossier(v.dossier || v.villa || 'Video Tour') }));
    allAudio = [...restoredUserAudio, ...(dataCatalog.audio || [])];

    let combined = [...userMedia, ...stockPhotos, ...stockVideos];

    // Filter out deleted
    combined = combined.filter(item => !deletedIds.includes(item.id));

    // Apply custom titles & dossiers if edited
    combined.forEach(item => {
        if (customTitles[item.id]) {
            if (typeof customTitles[item.id] === 'string') {
                item.title = customTitles[item.id];
            } else if (typeof customTitles[item.id] === 'object') {
                if (customTitles[item.id].title) item.title = customTitles[item.id].title;
                if (customTitles[item.id].dossier) item.dossier = customTitles[item.id].dossier;
                else if (customTitles[item.id].villa) item.dossier = customTitles[item.id].villa;
            }
        }
        item.dossier = normalizeDossier(item.dossier || item.villa);
        item.villa = item.dossier;
    });

    // Apply Saved Drag & Drop Order if exists
    const savedOrder = getSavedMediaOrder();
    if (savedOrder && savedOrder.length > 0) {
        combined.sort((a, b) => {
            const indexA = savedOrder.indexOf(a.id);
            const indexB = savedOrder.indexOf(b.id);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }

    currentMediaList = combined;
    allPhotos = currentMediaList.filter(item => item.type === 'photo');
    allVideos = currentMediaList.filter(item => item.type === 'video');

    // Prune stale selected IDs
    const validPhotoSet = new Set(allPhotos.map(p => p.id));
    selectedPhotoIds.forEach(id => {
        if (!validPhotoSet.has(id)) selectedPhotoIds.delete(id);
    });

    populateDossierSelects();
    renderDossierBar();
    renderGallery();
    populateAudioSelectors();
    initAudioElement();
    updateMediaStats();
    updateSelectionUI();
}

/* ==========================================================================
   LOCALSTORAGE HELPERS (GREEN_ENERBRAS ISOLATED KEYS ONLY)
   ========================================================================== */
function getDeletedMediaIds() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.deleted) || '[]');
    } catch (e) {
        return [];
    }
}

function saveDeletedMediaId(id) {
    const list = getDeletedMediaIds();
    if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(STORAGE_KEYS.deleted, JSON.stringify(list));
    }
}

function getCustomMediaTitles() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.titles) || '{}');
    } catch (e) {
        return {};
    }
}

function saveCustomMediaTitle(id, newTitle, newDossier = null) {
    const titles = getCustomMediaTitles();
    titles[id] = { title: newTitle, dossier: newDossier, villa: newDossier };
    localStorage.setItem(STORAGE_KEYS.titles, JSON.stringify(titles));
}

function getSavedMediaOrder() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.order) || '[]');
    } catch (e) {
        return [];
    }
}

function saveMediaOrder() {
    const ids = currentMediaList.map(item => item.id);
    localStorage.setItem(STORAGE_KEYS.order, JSON.stringify(ids));
}

function getUserUploads() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.userMedia) || '[]');
    } catch (e) {
        return [];
    }
}

function saveUserUploadsList(list) {
    // Never persist ephemeral blob: URLs in localStorage
    const cleanList = list.map(item => {
        const copy = { ...item };
        if (copy.url && copy.url.startsWith('blob:')) copy.url = '';
        if (copy.path && copy.path.startsWith('blob:')) copy.path = '';
        delete copy._expiredBlob;
        return copy;
    });
    localStorage.setItem(STORAGE_KEYS.userMedia, JSON.stringify(cleanList));
}

function saveUserUpload(item) {
    const list = getUserUploads();
    list.unshift(item);
    saveUserUploadsList(list);
}

function getUserAudioUploads() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.userAudio) || '[]');
    } catch (e) {
        return [];
    }
}

function saveUserAudioUpload(track) {
    const list = getUserAudioUploads();
    const copy = { ...track, url: '', path: '' };
    list.unshift(copy);
    localStorage.setItem(STORAGE_KEYS.userAudio, JSON.stringify(list));
}

function getCustomDossiers() {
    try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.dossiers) || '[]');
        return Array.isArray(list) ? list : [];
    } catch (e) {
        return [];
    }
}

function saveCustomDossiers(list) {
    const unique = Array.from(new Set(list.map(s => (s || '').trim()).filter(Boolean)));
    localStorage.setItem(STORAGE_KEYS.dossiers, JSON.stringify(unique));
}

function getAllDossiers() {
    const set = new Set(DEFAULT_DOSSIERS);
    getCustomDossiers().forEach(d => set.add(d));
    allPhotos.forEach(p => {
        if (p.dossier) set.add(p.dossier);
    });
    return Array.from(set);
}

function registerDossierIfNew(name) {
    const clean = (name || '').trim();
    if (!clean) return;
    if (!DEFAULT_DOSSIERS.includes(clean)) {
        const custom = getCustomDossiers();
        if (!custom.includes(clean)) {
            custom.push(clean);
            saveCustomDossiers(custom);
        }
    }
}

/* ==========================================================================
   DOSSIER MANAGEMENT & UI
   ========================================================================== */
function populateDossierSelects() {
    const dossiers = getAllDossiers();
    const selectIds = [
        'inlineUploadSectionSelect',
        'uploadVillaSelect',
        'modalEditVillaSelect',
        'bulkMoveDossierSelect'
    ];

    selectIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const prev = el.value;
        el.innerHTML = '';
        dossiers.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            el.appendChild(opt);
        });
        if (prev && dossiers.includes(prev)) {
            el.value = prev;
        } else if (id === 'inlineUploadSectionSelect' || id === 'uploadVillaSelect') {
            el.value = activeDossierFilter !== 'all' ? activeDossierFilter : (dossiers.includes('Impianti Solari') ? 'Impianti Solari' : dossiers[0]);
        }
    });
}

function renderDossierBar() {
    const container = document.getElementById('dossierPillsContainer');
    if (!container) return;

    const dossiers = getAllDossiers();
    const counts = {};
    allPhotos.forEach(p => {
        const d = p.dossier || 'Dossier App';
        counts[d] = (counts[d] || 0) + 1;
    });

    const totalPhotosCount = allPhotos.length;
    let html = `
        <div class="dossier-chip ${activeDossierFilter === 'all' ? 'active' : ''}" onclick="setDossierFilter('all')">
            <i class="fa-solid fa-layer-group"></i>
            <span class="dossier-chip-name">${escapeHtml(getI18nText('media_dossiers_all', 'Tutti i Dossier'))}</span>
            <span class="dossier-chip-count">${totalPhotosCount}</span>
        </div>
    `;

    dossiers.forEach(d => {
        const count = counts[d] || 0;
        const isCustom = !DEFAULT_DOSSIERS.includes(d);
        const isActive = activeDossierFilter === d;
        const escapedName = escapeJsString(d);

        html += `
            <div class="dossier-chip ${isActive ? 'active' : ''}" onclick="setDossierFilter('${escapedName}')">
                <i class="fa-solid ${isActive ? 'fa-folder-open' : 'fa-folder'}"></i>
                <span class="dossier-chip-name">${escapeHtml(d)}</span>
                <span class="dossier-chip-count">${count}</span>
                ${count > 0 ? `
                    <button type="button" class="dossier-chip-play" onclick="event.stopPropagation(); startDiaporama({ dossier: '${escapedName}' })" title="Avvia Slideshow del dossier ${escapeHtml(d)}">
                        <i class="fa-solid fa-play"></i>
                    </button>
                ` : ''}
                ${isCustom ? `
                    <button type="button" class="dossier-chip-delete" onclick="event.stopPropagation(); deleteCustomDossier('${escapedName}')" title="Elimina dossier personalizzato">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

function setDossierFilter(dossier) {
    activeDossierFilter = dossier || 'all';
    populateDossierSelects();
    renderDossierBar();
    renderGallery();
    updateSelectionUI();
}

function openNewDossierModal(targetSelectId = '') {
    const modal = document.getElementById('newDossierModal');
    const input = document.getElementById('newDossierNameInput');
    const targetInput = document.getElementById('newDossierTargetSelectId');
    if (!modal || !input) return;

    if (targetInput) targetInput.value = targetSelectId || '';
    input.value = '';
    modal.style.display = 'flex';
    modal.classList.add('active');
    setTimeout(() => input.focus(), 50);
}

function closeNewDossierModal() {
    const modal = document.getElementById('newDossierModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function confirmCreateDossier() {
    const input = document.getElementById('newDossierNameInput');
    const targetSelectId = document.getElementById('newDossierTargetSelectId')?.value;
    const name = (input?.value || '').trim();
    if (!name) return;

    registerDossierIfNew(name);
    populateDossierSelects();

    if (targetSelectId) {
        const sel = document.getElementById(targetSelectId);
        if (sel) sel.value = name;
    } else {
        activeDossierFilter = name;
    }

    renderDossierBar();
    renderGallery();
    updateSelectionUI();
    closeNewDossierModal();
    showMediaToast(`Dossier "${name}" pronto!`, 'success');
}

function deleteCustomDossier(name) {
    if (DEFAULT_DOSSIERS.includes(name)) return;
    const photosInDossier = allPhotos.filter(p => p.dossier === name);
    const msg = photosInDossier.length > 0
        ? `Eliminare il dossier "${name}"? Le ${photosInDossier.length} foto al suo interno verranno spostate in "Generale".`
        : `Eliminare il dossier vuoto "${name}"?`;

    if (!confirm(msg)) return;

    if (photosInDossier.length > 0) {
        const userUploads = getUserUploads();
        let userChanged = false;
        photosInDossier.forEach(p => {
            p.dossier = 'Generale';
            p.villa = 'Generale';
            saveCustomMediaTitle(p.id, p.title, 'Generale');
            const uIdx = userUploads.findIndex(u => u.id === p.id);
            if (uIdx !== -1) {
                userUploads[uIdx].dossier = 'Generale';
                userUploads[uIdx].villa = 'Generale';
                userChanged = true;
            }
        });
        if (userChanged) saveUserUploadsList(userUploads);
    }

    const custom = getCustomDossiers().filter(d => d !== name);
    saveCustomDossiers(custom);
    if (activeDossierFilter === name) activeDossierFilter = 'all';

    populateDossierSelects();
    renderDossierBar();
    renderGallery();
    updateSelectionUI();
    showMediaToast(`Dossier "${name}" rimosso.`, 'info');
}

/* ==========================================================================
   GALLERY RENDERING & SEPARATE PHOTO / VIDEO SECTIONS
   ========================================================================== */
function getFilteredPhotos() {
    return allPhotos.filter(item => {
        if (activeDossierFilter !== 'all' && item.dossier !== activeDossierFilter) return false;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            const matchesTitle = (item.title || '').toLowerCase().includes(q);
            const matchesDossier = (item.dossier || '').toLowerCase().includes(q);
            const matchesFile = (item.filename || '').toLowerCase().includes(q);
            if (!matchesTitle && !matchesDossier && !matchesFile) return false;
        }
        return true;
    });
}

function getFilteredVideos() {
    return allVideos.filter(item => {
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            const matchesTitle = (item.title || '').toLowerCase().includes(q);
            const matchesDossier = (item.dossier || '').toLowerCase().includes(q);
            const matchesFile = (item.filename || '').toLowerCase().includes(q);
            if (!matchesTitle && !matchesDossier && !matchesFile) return false;
        }
        return true;
    });
}

function renderGallery() {
    const photoSection = document.getElementById('photoSectionContainer');
    const videoSection = document.getElementById('videoSectionContainer');
    const photoGrid = document.getElementById('photoGrid');
    const videoGrid = document.getElementById('videoGrid');
    const photoQuickActions = document.getElementById('photoQuickActions');

    const showPhotos = activeTypeFilter === 'all' || activeTypeFilter === 'photo';
    const showVideos = activeTypeFilter === 'all' || activeTypeFilter === 'video';

    if (photoSection) photoSection.style.display = showPhotos ? 'block' : 'none';
    if (videoSection) videoSection.style.display = showVideos ? 'block' : 'none';
    if (photoQuickActions) photoQuickActions.style.display = showPhotos ? 'flex' : 'none';

    if (showPhotos && photoGrid) {
        const photos = getFilteredPhotos();
        const badge = document.getElementById('photoSectionCountBadge');
        if (badge) badge.textContent = photos.length;

        if (photos.length === 0) {
            photoGrid.innerHTML = `
                <div class="media-empty-state">
                    <i class="fa-solid fa-images"></i>
                    <h3 data-i18n="media_empty_photos_title">Nessuna foto in questo Dossier</h3>
                    <p data-i18n="media_empty_photos_desc">Carica nuove foto qui sopra oppure cambia Dossier / filtro di ricerca.</p>
                    <button class="btn btn-secondary btn-sm" onclick="resetFilters()">
                        <i class="fa-solid fa-rotate-left"></i> <span data-i18n="media_empty_reset">Reimposta filtri</span>
                    </button>
                </div>
            `;
        } else {
            photoGrid.innerHTML = photos.map(item => createPhotoCardHTML(item)).join('');
            initCardDragAndDrop();
        }
    }

    if (showVideos && videoGrid) {
        const videos = getFilteredVideos();
        const badge = document.getElementById('videoSectionCountBadge');
        if (badge) badge.textContent = videos.length;

        if (videos.length === 0) {
            videoGrid.innerHTML = `
                <div class="media-empty-state">
                    <i class="fa-solid fa-film"></i>
                    <h3 data-i18n="media_empty_videos_title">Nessun video trovato</h3>
                    <p data-i18n="media_empty_videos_desc">Carica video MP4/MOV/WEBM nell'area qui sopra per riprodurli singolarmente.</p>
                </div>
            `;
        } else {
            videoGrid.innerHTML = videos.map(item => createVideoCardHTML(item)).join('');
        }
    }

    updateSelectionUI();
}

function createPhotoCardHTML(item) {
    const resolvedUrl = resolveMediaUrl(item.url);
    const dossierBadgeClass = getDossierBadgeClass(item.dossier);
    const isSelected = selectedPhotoIds.has(item.id);
    const isExpired = !!item._expiredBlob || !resolvedUrl;

    return `
        <div class="media-card glass-panel ${isSelected ? 'is-selected' : ''} ${isExpired ? 'is-expired-blob' : ''}"
             id="card_${item.id}"
             data-id="${item.id}"
             data-type="photo"
             draggable="true">

            <div class="media-card-top-bar">
                <div style="display:flex; align-items:center; gap:6px;">
                    <label class="media-select-checkbox-wrap" onclick="event.stopPropagation();" title="Seleziona foto per Slideshow">
                        <input type="checkbox"
                               class="media-select-checkbox"
                               data-photo-id="${item.id}"
                               ${isSelected ? 'checked' : ''}
                               ${isExpired ? 'disabled' : ''}
                               onclick="togglePhotoSelection('${item.id}', event)">
                        <span class="media-checkbox-visual"><i class="fa-solid fa-check"></i></span>
                    </label>
                    <div class="media-drag-handle" title="Trascina per riordinare">
                        <i class="fa-solid fa-grip-vertical"></i>
                    </div>
                </div>
                <div class="media-badges">
                    <span class="badge ${dossierBadgeClass}" title="Dossier">${escapeHtml(item.dossier || 'Dossier App')}</span>
                    <span class="media-type-badge badge-photo">
                        <i class="fa-solid fa-image"></i> Foto
                    </span>
                </div>
            </div>

            <div class="media-thumb-wrap" onclick="${isExpired ? `relinkMediaFile('${item.id}')` : `openLightbox('${item.id}')`}">
                ${isExpired ? `
                    <div class="media-expired-placeholder">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <span>File temporaneo scaduto</span>
                        <button type="button" class="btn-relink-file" onclick="event.stopPropagation(); relinkMediaFile('${item.id}')">
                            <i class="fa-solid fa-upload"></i> Ricarica file
                        </button>
                    </div>
                ` : `
                    <img src="${resolvedUrl}" alt="${escapeHtml(item.title)}" loading="lazy" class="media-thumb-img" onerror="handleThumbError(this, '${item.id}')">
                    <div class="media-hover-overlay">
                        <div class="hover-action-btn" title="Ingrandisci la foto">
                            <i class="fa-solid fa-magnifying-glass-plus"></i>
                        </div>
                    </div>
                `}
            </div>

            <div class="media-card-info">
                <div class="media-title-row">
                    <div class="media-card-title" id="title_text_${item.id}" title="${escapeHtml(item.title)}">
                        ${escapeHtml(item.title)}
                    </div>
                    <button type="button" class="media-action-icon-btn btn-edit-title" onclick="editMediaTitle('${item.id}')" title="Modifica titolo e Dossier">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </div>

                <div class="media-meta-row">
                    <span class="media-meta-size">
                        <i class="fa-solid fa-hard-drive"></i> ${item.size_mb || 0} MB
                    </span>
                    <div class="media-card-actions">
                        ${!isExpired ? `
                            <button type="button" class="media-action-icon-btn btn-view" onclick="openLightbox('${item.id}')" title="Ingrandisci">
                                <i class="fa-solid fa-expand"></i>
                            </button>
                            <a href="${resolvedUrl}" download="${escapeHtml(item.filename)}" class="media-action-icon-btn btn-download" title="Scarica foto" onclick="event.stopPropagation()">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        ` : ''}
                        <button type="button" class="media-action-icon-btn btn-delete" onclick="deleteMediaItem('${item.id}')" title="Rimuovi dalla galleria">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createVideoCardHTML(item) {
    const resolvedUrl = resolveMediaUrl(item.url);
    const isExpired = !!item._expiredBlob || !resolvedUrl;

    return `
        <div class="media-card media-video-card glass-panel ${isExpired ? 'is-expired-blob' : ''}"
             id="card_${item.id}"
             data-id="${item.id}"
             data-type="video">

            <div class="media-card-top-bar">
                <span class="video-solo-pill">
                    <i class="fa-solid fa-circle-play"></i> Singolo
                </span>
                <div class="media-badges">
                    <span class="media-type-badge badge-video">
                        <i class="fa-solid fa-video"></i> Video
                    </span>
                </div>
            </div>

            <div class="media-thumb-wrap" onclick="${isExpired ? `relinkMediaFile('${item.id}')` : `openVideoTheater('${item.id}')`}">
                ${isExpired ? `
                    <div class="media-expired-placeholder">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <span>Video temporaneo scaduto</span>
                        <button type="button" class="btn-relink-file" onclick="event.stopPropagation(); relinkMediaFile('${item.id}')">
                            <i class="fa-solid fa-upload"></i> Ricarica video
                        </button>
                    </div>
                ` : `
                    <div class="media-video-thumb">
                        <video src="${resolvedUrl}#t=0.5" preload="metadata" muted playsinline class="media-video-preview"></video>
                        <div class="media-video-play-center">
                            <i class="fa-solid fa-circle-play video-play-glyph"></i>
                            <span class="video-label-tag"><i class="fa-solid fa-play"></i> Riproduci Video</span>
                        </div>
                    </div>
                `}
            </div>

            <div class="media-card-info">
                <div class="media-title-row">
                    <div class="media-card-title" id="title_text_${item.id}" title="${escapeHtml(item.title)}">
                        ${escapeHtml(item.title)}
                    </div>
                    <button type="button" class="media-action-icon-btn btn-edit-title" onclick="editMediaTitle('${item.id}')" title="Modifica titolo">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </div>

                <div class="media-meta-row">
                    <span class="media-meta-size">
                        <i class="fa-solid fa-hard-drive"></i> ${item.size_mb || 0} MB
                    </span>
                    <div class="media-card-actions">
                        ${!isExpired ? `
                            <button type="button" class="media-action-icon-btn btn-view" onclick="openVideoTheater('${item.id}')" title="Riproduci Video">
                                <i class="fa-solid fa-play"></i>
                            </button>
                            <a href="${resolvedUrl}" download="${escapeHtml(item.filename)}" class="media-action-icon-btn btn-download" title="Scarica video" onclick="event.stopPropagation()">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        ` : ''}
                        <button type="button" class="media-action-icon-btn btn-delete" onclick="deleteMediaItem('${item.id}')" title="Rimuovi video">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function handleThumbError(imgEl, id) {
    if (!imgEl || imgEl.dataset.errored) return;
    imgEl.dataset.errored = '1';
    const wrap = imgEl.parentElement;
    if (wrap) {
        wrap.innerHTML = `
            <div class="media-expired-placeholder">
                <i class="fa-solid fa-image"></i>
                <span>Anteprima non disponibile</span>
                <button type="button" class="btn-relink-file" onclick="event.stopPropagation(); relinkMediaFile('${id}')">
                    <i class="fa-solid fa-upload"></i> Ricarica foto
                </button>
            </div>
        `;
    }
}

function getDossierBadgeClass(dossier) {
    switch (dossier) {
        case 'Dossier App': return 'badge-blue';
        case 'Impianti Solari': return 'badge-emerald';
        case 'Parchi Solari': return 'badge-cyan';
        case 'Tri Star': return 'badge-amber';
        case 'Generale': return 'badge-blue';
        default: return 'badge-fuchsia';
    }
}

function setTypeFilter(type, btn) {
    activeTypeFilter = type;
    document.querySelectorAll('.media-type-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderGallery();
}

function onSearchInput(val) {
    searchQuery = val || '';
    renderGallery();
}

function resetFilters() {
    activeTypeFilter = 'all';
    activeDossierFilter = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('mediaSearchInput');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.media-type-tab').forEach(b => b.classList.toggle('active', b.dataset.type === 'all'));
    renderDossierBar();
    renderGallery();
}

function updateMediaStats() {
    const countTotal = document.getElementById('statTotalMedia');
    const countPhotos = document.getElementById('statTotalPhotos');
    const countVideos = document.getElementById('statTotalVideos');

    if (countTotal) countTotal.textContent = currentMediaList.length;
    if (countPhotos) countPhotos.textContent = allPhotos.length;
    if (countVideos) countVideos.textContent = allVideos.length;
}

/* ==========================================================================
   MULTI-PHOTO SELECTION FOR SLIDESHOW
   ========================================================================== */
function togglePhotoSelection(id, event) {
    if (event) event.stopPropagation();
    const visiblePhotos = getFilteredPhotos().filter(p => !p._expiredBlob && p.url);
    const checkbox = document.querySelector(`.media-select-checkbox[data-photo-id="${id}"]`);
    const willSelect = checkbox ? checkbox.checked : !selectedPhotoIds.has(id);

    if (event && event.shiftKey && lastSelectedPhotoId && lastSelectedPhotoId !== id) {
        const idxA = visiblePhotos.findIndex(p => p.id === lastSelectedPhotoId);
        const idxB = visiblePhotos.findIndex(p => p.id === id);
        if (idxA !== -1 && idxB !== -1) {
            const start = Math.min(idxA, idxB);
            const end = Math.max(idxA, idxB);
            for (let i = start; i <= end; i++) {
                if (willSelect) selectedPhotoIds.add(visiblePhotos[i].id);
                else selectedPhotoIds.delete(visiblePhotos[i].id);
            }
        }
    } else {
        if (willSelect) selectedPhotoIds.add(id);
        else selectedPhotoIds.delete(id);
    }

    lastSelectedPhotoId = id;
    updateSelectionUI();
}

function selectAllVisiblePhotos() {
    const visible = getFilteredPhotos().filter(p => !p._expiredBlob && p.url);
    visible.forEach(p => selectedPhotoIds.add(p.id));
    updateSelectionUI();
}

function clearPhotoSelection() {
    selectedPhotoIds.clear();
    lastSelectedPhotoId = null;
    updateSelectionUI();
}

function updateSelectionUI() {
    const count = selectedPhotoIds.size;

    document.querySelectorAll('#photoGrid .media-card').forEach(card => {
        const id = card.dataset.id;
        const selected = selectedPhotoIds.has(id);
        card.classList.toggle('is-selected', selected);
        const cb = card.querySelector('.media-select-checkbox');
        if (cb) cb.checked = selected;
    });

    const bar = document.getElementById('photoSelectionBar');
    const countEl = document.getElementById('selectionCountText');
    const clearTopBtn = document.getElementById('btnClearSelectionTop');

    if (bar) bar.style.display = count > 0 ? 'flex' : 'none';
    if (countEl) countEl.textContent = count === 1 ? '1 foto selezionata' : `${count} foto selezionate`;
    if (clearTopBtn) clearTopBtn.style.display = count > 0 ? 'inline-flex' : 'none';

    // Update Banner Slideshow Subtitle & Section Dossier Button
    const scopeSub = document.getElementById('slideshowLaunchScopeSub');
    const dossierBtn = document.getElementById('btnSlideshowCurrentDossier');
    const dossierBtnLabel = document.getElementById('btnSlideshowDossierLabel');

    const visibleValid = getFilteredPhotos().filter(p => !p._expiredBlob && p.url);

    if (scopeSub) {
        if (count > 0) {
            scopeSub.textContent = `${count} foto selezionate • Solo Foto + Musica MP3`;
        } else if (activeDossierFilter !== 'all') {
            scopeSub.textContent = `Dossier "${activeDossierFilter}" (${visibleValid.length} foto) • Solo Foto + MP3`;
        } else {
            scopeSub.textContent = `Tutte le foto (${visibleValid.length}) • Solo Foto + Musica MP3`;
        }
    }

    if (dossierBtn && dossierBtnLabel) {
        if (count > 0) {
            dossierBtnLabel.textContent = `Avvia Slideshow (${count} selezionate)`;
            dossierBtn.disabled = false;
        } else if (activeDossierFilter !== 'all') {
            dossierBtnLabel.textContent = `Avvia Slideshow "${activeDossierFilter}" (${visibleValid.length})`;
            dossierBtn.disabled = visibleValid.length === 0;
        } else {
            dossierBtnLabel.textContent = `Avvia Slideshow Tutte (${visibleValid.length})`;
            dossierBtn.disabled = visibleValid.length === 0;
        }
    }
}

function bulkMoveSelectedToDossier() {
    if (selectedPhotoIds.size === 0) return;
    const select = document.getElementById('bulkMoveDossierSelect');
    const targetDossier = select ? select.value : 'Generale';
    if (!targetDossier) return;

    registerDossierIfNew(targetDossier);
    const userUploads = getUserUploads();
    let userChanged = false;

    selectedPhotoIds.forEach(id => {
        const item = allPhotos.find(p => p.id === id);
        if (item) {
            item.dossier = targetDossier;
            item.villa = targetDossier;
            saveCustomMediaTitle(id, item.title, targetDossier);
            const uIdx = userUploads.findIndex(u => u.id === id);
            if (uIdx !== -1) {
                userUploads[uIdx].dossier = targetDossier;
                userUploads[uIdx].villa = targetDossier;
                userChanged = true;
            }
        }
    });

    if (userChanged) saveUserUploadsList(userUploads);

    const movedCount = selectedPhotoIds.size;
    clearPhotoSelection();
    renderDossierBar();
    renderGallery();
    showMediaToast(`${movedCount} foto spostate nel dossier "${targetDossier}"`, 'success');
}

async function bulkDeleteSelectedPhotos() {
    if (selectedPhotoIds.size === 0) return;
    const count = selectedPhotoIds.size;
    if (!confirm(`Vuoi rimuovere le ${count} foto selezionate dalla galleria?`)) return;

    const toDelete = Array.from(selectedPhotoIds);
    for (const id of toDelete) {
        const item = currentMediaList.find(m => m.id === id);
        if (item && item._expiredBlob) {
            const userUploads = getUserUploads().filter(u => u.id !== id);
            saveUserUploadsList(userUploads);
            await deleteMediaBlob(id);
        } else {
            saveDeletedMediaId(id);
        }
    }

    currentMediaList = currentMediaList.filter(m => !selectedPhotoIds.has(m.id));
    allPhotos = currentMediaList.filter(item => item.type === 'photo');
    allVideos = currentMediaList.filter(item => item.type === 'video');
    selectedPhotoIds.clear();
    saveMediaOrder();
    renderDossierBar();
    renderGallery();
    updateMediaStats();
    showMediaToast(`${count} foto rimosse.`, 'info');
}

/* ==========================================================================
   DRAG & DROP REORDERING (PHOTOS)
   ========================================================================== */
let draggedCardEl = null;

function initCardDragAndDrop() {
    const cards = document.querySelectorAll('#photoGrid .media-card');
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            draggedCardEl = card;
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.id);
        });

        card.addEventListener('dragend', () => {
            if (draggedCardEl) {
                draggedCardEl.classList.remove('dragging');
                draggedCardEl = null;
            }
            cards.forEach(c => c.classList.remove('drag-over'));
        });

        card.addEventListener('dragover', (e) => {
            if (!draggedCardEl) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (card !== draggedCardEl && !card.classList.contains('drag-over')) {
                card.classList.add('drag-over');
            }
        });

        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });

        card.addEventListener('drop', (e) => {
            if (!draggedCardEl) return;
            e.preventDefault();
            card.classList.remove('drag-over');
            const draggedId = e.dataTransfer.getData('text/plain');
            const targetId = card.dataset.id;

            if (draggedId && targetId && draggedId !== targetId) {
                const fromIndex = currentMediaList.findIndex(item => item.id === draggedId);
                const toIndex = currentMediaList.findIndex(item => item.id === targetId);

                if (fromIndex !== -1 && toIndex !== -1) {
                    const [movedItem] = currentMediaList.splice(fromIndex, 1);
                    currentMediaList.splice(toIndex, 0, movedItem);
                    saveMediaOrder();
                    allPhotos = currentMediaList.filter(item => item.type === 'photo');
                    allVideos = currentMediaList.filter(item => item.type === 'video');
                    renderGallery();
                }
            }
        });
    });
}

/* ==========================================================================
   TITLE & DOSSIER MODIFICATION & DELETION
   ========================================================================== */
function editMediaTitle(id) {
    const item = currentMediaList.find(m => m.id === id);
    if (!item) return;

    populateDossierSelects();
    const modal = document.getElementById('editTitleModal');
    const inputTitle = document.getElementById('modalEditTitleInput');
    const selectDossier = document.getElementById('modalEditVillaSelect');
    const dossierRow = document.getElementById('modalEditDossierRow');
    const hiddenId = document.getElementById('modalEditMediaId');

    if (modal && inputTitle && selectDossier && hiddenId) {
        hiddenId.value = id;
        inputTitle.value = item.title;
        if (dossierRow) {
            dossierRow.style.display = item.type === 'video' ? 'none' : 'block';
        }
        selectDossier.value = item.dossier || 'Dossier App';
        modal.style.display = 'flex';
        modal.classList.add('active');
        inputTitle.focus();
        inputTitle.select();
    }
}

function saveModalTitle() {
    const hiddenId = document.getElementById('modalEditMediaId');
    const inputTitle = document.getElementById('modalEditTitleInput');
    const selectDossier = document.getElementById('modalEditVillaSelect');

    if (!hiddenId || !inputTitle) return;
    const id = hiddenId.value;
    const newTitle = inputTitle.value.trim();
    const item = currentMediaList.find(m => m.id === id);
    const newDossier = (item && item.type === 'photo' && selectDossier) ? selectDossier.value : (item ? item.dossier : 'Dossier App');

    if (newTitle) {
        saveTitleAndRefresh(id, newTitle, newDossier);
    }
    closeEditTitleModal();
}

function saveTitleAndRefresh(id, newTitle, newDossier = null) {
    const item = currentMediaList.find(m => m.id === id);
    if (item) {
        item.title = newTitle;
        if (newDossier) {
            item.dossier = newDossier;
            item.villa = newDossier;
        }
        saveCustomMediaTitle(id, newTitle, item.dossier);

        const userUploads = getUserUploads();
        const uIdx = userUploads.findIndex(u => u.id === id);
        if (uIdx !== -1) {
            userUploads[uIdx].title = newTitle;
            if (newDossier) {
                userUploads[uIdx].dossier = newDossier;
                userUploads[uIdx].villa = newDossier;
            }
            saveUserUploadsList(userUploads);
        }

        renderDossierBar();
        renderGallery();
    }
}

function closeEditTitleModal() {
    const modal = document.getElementById('editTitleModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

async function deleteMediaItem(id) {
    const item = currentMediaList.find(m => m.id === id);
    if (!item) return;

    const confirmMsg = `Sei sicuro di voler rimuovere "${item.title}" dalla galleria?`;
    if (confirm(confirmMsg)) {
        if (item._expiredBlob) {
            const userUploads = getUserUploads().filter(u => u.id !== id);
            saveUserUploadsList(userUploads);
            await deleteMediaBlob(id);
        } else {
            saveDeletedMediaId(id);
        }
        selectedPhotoIds.delete(id);
        currentMediaList = currentMediaList.filter(m => m.id !== id);
        allPhotos = currentMediaList.filter(item => item.type === 'photo');
        allVideos = currentMediaList.filter(item => item.type === 'video');
        saveMediaOrder();
        renderDossierBar();
        renderGallery();
        updateMediaStats();
    }
}

function restoreAllDeletedMedia() {
    if (confirm("Vuoi ripristinare tutti i file multimediali rimossi in precedenza?")) {
        localStorage.removeItem(STORAGE_KEYS.deleted);
        initMediaGallery();
        showMediaToast("File rimossi ripristinati!", "success");
    }
}

/* ==========================================================================
   RELINK EXPIRED LEGACY BLOB UPLOADS
   ========================================================================== */
function relinkMediaFile(id) {
    const input = document.getElementById('relinkMediaInput');
    if (!input) return;
    const item = currentMediaList.find(m => m.id === id);
    if (!item) return;

    input.accept = item.type === 'video' ? 'video/*' : 'image/*';
    input.onchange = async () => {
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];
        const blobUrl = await saveMediaBlob(item.id, file);
        const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));

        item.url = blobUrl;
        item.filename = file.name;
        item.size_mb = sizeMb;
        item._expiredBlob = false;

        const userUploads = getUserUploads();
        const uIdx = userUploads.findIndex(u => u.id === item.id);
        if (uIdx !== -1) {
            userUploads[uIdx].filename = file.name;
            userUploads[uIdx].size_mb = sizeMb;
            userUploads[uIdx].url = '';
            saveUserUploadsList(userUploads);
        }

        input.value = '';
        renderGallery();
        showMediaToast(`"${item.title}" ricaricato e salvato permanentemente!`, 'success');
    };
    input.click();
}

/* ==========================================================================
   PERSISTENT UPLOADS (FILES & FOLDERS -> INDEXEDDB)
   ========================================================================== */
function openUploadModal() {
    populateDossierSelects();
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function handleFileInputChange(input) {
    if (!input.files || input.files.length === 0) return;
    const select = document.getElementById('uploadVillaSelect');
    const chosenDossier = select ? select.value : 'Impianti Solari';
    processUploadedFiles(Array.from(input.files), chosenDossier, false);
    input.value = '';
}

function handleFolderInputChange(input) {
    if (!input.files || input.files.length === 0) return;
    const select = document.getElementById('uploadVillaSelect');
    const fallbackDossier = select ? select.value : 'Impianti Solari';
    processUploadedFiles(Array.from(input.files), fallbackDossier, true);
    input.value = '';
}

function handleInlineFileInput(input) {
    if (!input.files || input.files.length === 0) return;
    const inlineSelect = document.getElementById('inlineUploadSectionSelect');
    const chosenDossier = inlineSelect ? inlineSelect.value : 'Impianti Solari';
    processUploadedFiles(Array.from(input.files), chosenDossier, false);
    input.value = '';
}

function handleInlineFolderInput(input) {
    if (!input.files || input.files.length === 0) return;
    const inlineSelect = document.getElementById('inlineUploadSectionSelect');
    const fallbackDossier = inlineSelect ? inlineSelect.value : 'Impianti Solari';
    processUploadedFiles(Array.from(input.files), fallbackDossier, true);
    input.value = '';
}

async function extractFilesFromDataTransfer(dt) {
    const collected = [];
    if (dt.items && dt.items.length > 0 && typeof dt.items[0].webkitGetAsEntry === 'function') {
        const entries = [];
        for (let i = 0; i < dt.items.length; i++) {
            const entry = dt.items[i].webkitGetAsEntry();
            if (entry) entries.push(entry);
        }

        async function readEntry(entry, folderPrefix) {
            if (entry.isFile) {
                await new Promise((resolve) => {
                    entry.file((file) => {
                        collected.push({ file, folderName: folderPrefix });
                        resolve();
                    }, () => resolve());
                });
            } else if (entry.isDirectory) {
                const dirReader = entry.createReader();
                const readAllEntries = async () => {
                    const batch = await new Promise((resolve) => dirReader.readEntries(resolve, () => resolve([])));
                    if (batch && batch.length > 0) {
                        for (const child of batch) {
                            await readEntry(child, folderPrefix || entry.name);
                        }
                        await readAllEntries();
                    }
                };
                await readAllEntries();
            }
        }

        for (const entry of entries) {
            await readEntry(entry, entry.isDirectory ? entry.name : null);
        }
        return collected;
    }

    if (dt.files) {
        Array.from(dt.files).forEach(file => collected.push({ file, folderName: null }));
    }
    return collected;
}

function initInlineDropZone() {
    const dropzone = document.getElementById('inlineDropZone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dropzone-active');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dropzone-active');
        }, false);
    });

    dropzone.addEventListener('drop', async (e) => {
        const dt = e.dataTransfer;
        if (!dt) return;
        const inlineSelect = document.getElementById('inlineUploadSectionSelect');
        const chosenDossier = inlineSelect ? inlineSelect.value : 'Impianti Solari';
        const entries = await extractFilesFromDataTransfer(dt);
        if (entries.length > 0) {
            await processUploadedEntries(entries, chosenDossier);
        }
    }, false);
}

function initModalDropZone() {
    const dropzone = document.getElementById('modalDropZone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dropzone-hover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dropzone-hover');
        }, false);
    });

    dropzone.addEventListener('drop', async (e) => {
        const dt = e.dataTransfer;
        if (!dt) return;
        const select = document.getElementById('uploadVillaSelect');
        const chosenDossier = select ? select.value : 'Impianti Solari';
        const entries = await extractFilesFromDataTransfer(dt);
        if (entries.length > 0) {
            await processUploadedEntries(entries, chosenDossier);
        }
    }, false);
}

async function processUploadedFiles(files, chosenDossier, detectFolderFromPath = false) {
    const entries = files.map(file => {
        let folderName = null;
        if (detectFolderFromPath && file.webkitRelativePath) {
            const parts = file.webkitRelativePath.split('/');
            if (parts.length > 1 && parts[0]) folderName = parts[0];
        }
        return { file, folderName };
    });
    await processUploadedEntries(entries, chosenDossier);
}

async function processUploadedEntries(entries, fallbackDossier) {
    let addedPhotos = 0;
    let addedVideos = 0;
    let addedAudio = 0;
    let lastDossierUsed = null;

    for (const { file, folderName } of entries) {
        if (!file || !file.name) continue;
        const fileExt = file.name.split('.').pop().toLowerCase();
        const sizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
        const nameNoExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const targetDossier = normalizeDossier(folderName || fallbackDossier || 'Impianti Solari');

        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(fileExt)) {
            const id = 'user_photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            const blobUrl = await saveMediaBlob(id, file);
            registerDossierIfNew(targetDossier);
            lastDossierUsed = targetDossier;

            const newPhoto = {
                id,
                filename: file.name,
                title: nameNoExt,
                path: '',
                url: blobUrl,
                dossier: targetDossier,
                villa: targetDossier,
                size_mb: sizeMb,
                type: 'photo',
                isUserUpload: true
            };
            saveUserUpload(newPhoto);
            currentMediaList.unshift(newPhoto);
            addedPhotos++;
        } else if (['mp4', 'mov', 'webm', 'm4v'].includes(fileExt)) {
            const id = 'user_video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            const blobUrl = await saveMediaBlob(id, file);

            const newVideo = {
                id,
                filename: file.name,
                title: nameNoExt,
                path: '',
                url: blobUrl,
                dossier: 'Video Tour',
                villa: 'Video Tour',
                size_mb: sizeMb,
                type: 'video',
                isUserUpload: true
            };
            saveUserUpload(newVideo);
            currentMediaList.unshift(newVideo);
            addedVideos++;
        } else if (['mp3', 'm4a', 'wav'].includes(fileExt)) {
            const id = 'user_audio_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            const blobUrl = await saveMediaBlob(id, file);

            const newAudio = {
                id,
                filename: file.name,
                title: nameNoExt,
                album: 'Musica Personalizzata',
                path: '',
                url: blobUrl,
                size_mb: sizeMb,
                isUserUpload: true
            };
            saveUserAudioUpload(newAudio);
            allAudio.unshift(newAudio);
            populateAudioSelectors();
            playAudioTrack(newAudio.url, newAudio.title);
            addedAudio++;
        }
    }

    allPhotos = currentMediaList.filter(item => item.type === 'photo');
    allVideos = currentMediaList.filter(item => item.type === 'video');
    saveMediaOrder();
    populateDossierSelects();
    renderDossierBar();
    renderGallery();
    updateMediaStats();
    closeUploadModal();

    const parts = [];
    if (addedPhotos > 0) parts.push(`${addedPhotos} foto${lastDossierUsed ? ` in "${lastDossierUsed}"` : ''}`);
    if (addedVideos > 0) parts.push(`${addedVideos} video`);
    if (addedAudio > 0) parts.push(`${addedAudio} brani MP3`);
    if (parts.length > 0) {
        showMediaToast(`Salvati permanentemente: ${parts.join(', ')}`, 'success');
    }
}

/* ==========================================================================
   PHOTO LIGHTBOX (SINGLE VIEW)
   ========================================================================== */
function openLightbox(photoId) {
    const visibleValid = getFilteredPhotos().filter(p => !p._expiredBlob && p.url);
    lightboxPhotosList = visibleValid.length > 0 ? visibleValid : allPhotos.filter(p => !p._expiredBlob && p.url);
    const index = lightboxPhotosList.findIndex(p => p.id === photoId);
    if (index === -1) return;

    currentLightboxIndex = index;
    const photo = lightboxPhotosList[index];

    const modal = document.getElementById('photoLightboxModal');
    const imgEl = document.getElementById('lightboxImg');
    const titleEl = document.getElementById('lightboxTitle');
    const villaEl = document.getElementById('lightboxVilla');
    const counterEl = document.getElementById('lightboxCounter');
    const downloadEl = document.getElementById('lightboxDownloadBtn');

    if (!modal || !imgEl) return;

    const resolvedUrl = resolveMediaUrl(photo.url);
    imgEl.src = resolvedUrl;
    if (titleEl) titleEl.textContent = photo.title;
    if (villaEl) villaEl.textContent = photo.dossier || 'Dossier App';
    if (counterEl) counterEl.textContent = `${index + 1} / ${lightboxPhotosList.length}`;
    if (downloadEl) {
        downloadEl.href = resolvedUrl;
        downloadEl.download = photo.filename;
    }

    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function nextLightboxPhoto() {
    if (lightboxPhotosList.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxPhotosList.length;
    openLightbox(lightboxPhotosList[currentLightboxIndex].id);
}

function prevLightboxPhoto() {
    if (lightboxPhotosList.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxPhotosList.length) % lightboxPhotosList.length;
    openLightbox(lightboxPhotosList[currentLightboxIndex].id);
}

function startDiaporamaFromLightbox() {
    const current = lightboxPhotosList[currentLightboxIndex];
    if (!current) return;
    if (selectedPhotoIds.size > 0 && selectedPhotoIds.has(current.id)) {
        startDiaporama({ startFromId: current.id });
    } else {
        startDiaporama({ photoIds: lightboxPhotosList.map(p => p.id), startFromId: current.id, sourceLabel: activeDossierFilter !== 'all' ? `Dossier: ${activeDossierFilter}` : 'Galleria Foto' });
    }
}

function closeLightbox() {
    const modal = document.getElementById('photoLightboxModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/* ==========================================================================
   VIDEO THEATER (INDIVIDUAL VIDEO PLAYBACK - SEPARATE FROM SLIDESHOW)
   ========================================================================== */
function openVideoTheater(videoId) {
    const video = allVideos.find(v => v.id === videoId);
    if (!video || video._expiredBlob || !video.url) return;

    // Pause background slideshow music if playing so audio does not overlap
    if (diaporamaAudio && !diaporamaAudio.paused) {
        diaporamaAudio.pause();
    }

    const modal = document.getElementById('videoTheaterModal');
    const player = document.getElementById('videoTheaterPlayer');
    const titleEl = document.getElementById('videoTheaterTitle');
    const downloadBtn = document.getElementById('videoTheaterDownloadBtn');

    if (!modal || !player) return;

    const resolvedUrl = resolveMediaUrl(video.url);
    player.src = resolvedUrl;
    if (titleEl) titleEl.textContent = video.title;
    if (downloadBtn) {
        downloadBtn.href = resolvedUrl;
        downloadBtn.download = video.filename;
    }

    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    player.play().catch(() => {});
}

function closeVideoTheater() {
    const modal = document.getElementById('videoTheaterModal');
    const player = document.getElementById('videoTheaterPlayer');
    if (player) {
        player.pause();
        player.src = '';
    }
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/* ==========================================================================
   DIAPORAMA / SLIDESHOW (STRICTLY PHOTOS ONLY - BY DOSSIER OR MULTI-SELECT)
   ========================================================================== */
function startDossierSlideshow() {
    if (selectedPhotoIds.size > 0) {
        startSelectedPhotosSlideshow();
    } else if (activeDossierFilter !== 'all') {
        startDiaporama({ dossier: activeDossierFilter });
    } else {
        startDiaporama();
    }
}

function startSelectedPhotosSlideshow() {
    if (selectedPhotoIds.size === 0) {
        alert("Seleziona prima almeno una foto da includere nello Slideshow.");
        return;
    }
    startDiaporama({ photoIds: Array.from(selectedPhotoIds), sourceLabel: `Selezione (${selectedPhotoIds.size} foto)` });
}

function startDiaporama(options = {}) {
    if (typeof options === 'string') {
        options = { startFromId: options };
    }
    closeLightbox();
    closeVideoTheater();

    // Only valid photos can ever enter the Slideshow
    const validPhotos = allPhotos.filter(p => p.type === 'photo' && !p._expiredBlob && p.url);
    let sourceLabel = 'Tutte le foto';

    if (options.dossier) {
        diaporamaPhotos = validPhotos.filter(p => p.dossier === options.dossier);
        sourceLabel = `Dossier: ${options.dossier}`;
    } else if (Array.isArray(options.photoIds) && options.photoIds.length > 0) {
        const idSet = new Set(options.photoIds);
        diaporamaPhotos = validPhotos.filter(p => idSet.has(p.id));
        sourceLabel = options.sourceLabel || `Selezione (${diaporamaPhotos.length} foto)`;
    } else if (selectedPhotoIds.size > 0) {
        diaporamaPhotos = validPhotos.filter(p => selectedPhotoIds.has(p.id));
        sourceLabel = `Selezione (${diaporamaPhotos.length} foto)`;
    } else if (activeDossierFilter !== 'all') {
        diaporamaPhotos = validPhotos.filter(p => p.dossier === activeDossierFilter);
        sourceLabel = `Dossier: ${activeDossierFilter}`;
    } else {
        const filtered = getFilteredPhotos().filter(p => !p._expiredBlob && p.url);
        diaporamaPhotos = filtered.length > 0 ? filtered : validPhotos;
        sourceLabel = searchQuery.trim() ? `Ricerca (${diaporamaPhotos.length} foto)` : `Tutte le foto (${diaporamaPhotos.length})`;
    }

    if (diaporamaPhotos.length === 0) {
        alert("Nessuna foto valida disponibile per lo Slideshow in questo dossier o selezione.");
        return;
    }

    if (options.startFromId) {
        const foundIdx = diaporamaPhotos.findIndex(p => p.id === options.startFromId);
        currentSlideIndex = foundIdx !== -1 ? foundIdx : 0;
    } else {
        currentSlideIndex = 0;
    }

    const sourceBadge = document.getElementById('diaporamaSourceBadge');
    if (sourceBadge) {
        sourceBadge.textContent = sourceLabel;
        sourceBadge.style.display = 'inline-flex';
    }

    const overlay = document.getElementById('diaporamaOverlay');
    if (!overlay) return;

    overlay.style.display = 'flex';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderCurrentSlide();
    isDiaporamaPlaying = true;
    updateDiaporamaPlayButton();
    startDiaporamaTimer();

    if (!isMusicMuted && diaporamaAudio && diaporamaAudio.src) {
        diaporamaAudio.play().catch(e => console.log('Autoplay prevented', e));
    }
}

function renderCurrentSlide() {
    if (diaporamaPhotos.length === 0) return;
    const photo = diaporamaPhotos[currentSlideIndex];
    if (!photo) return;

    const imgEl = document.getElementById('diaporamaImg');
    const titleEl = document.getElementById('diaporamaTitle');
    const villaEl = document.getElementById('diaporamaVilla');
    const counterEl = document.getElementById('diaporamaCounter');
    const progressBar = document.getElementById('diaporamaProgress');

    const resolvedUrl = resolveMediaUrl(photo.url);

    if (imgEl) {
        imgEl.style.opacity = '0';
        setTimeout(() => {
            imgEl.src = resolvedUrl;
            imgEl.style.opacity = '1';
        }, 150);
    }

    if (titleEl) titleEl.textContent = photo.title;
    if (villaEl) villaEl.textContent = photo.dossier || 'Dossier App';
    if (counterEl) counterEl.textContent = `Slide ${currentSlideIndex + 1} / ${diaporamaPhotos.length}`;

    if (progressBar) {
        const pct = ((currentSlideIndex + 1) / diaporamaPhotos.length) * 100;
        progressBar.style.width = `${pct}%`;
    }
}

function nextSlide() {
    if (diaporamaPhotos.length === 0) return;
    currentSlideIndex = (currentSlideIndex + 1) % diaporamaPhotos.length;
    renderCurrentSlide();
    if (isDiaporamaPlaying) {
        restartDiaporamaTimer();
    }
}

function prevSlide() {
    if (diaporamaPhotos.length === 0) return;
    currentSlideIndex = (currentSlideIndex - 1 + diaporamaPhotos.length) % diaporamaPhotos.length;
    renderCurrentSlide();
    if (isDiaporamaPlaying) {
        restartDiaporamaTimer();
    }
}

function toggleDiaporamaPlay() {
    isDiaporamaPlaying = !isDiaporamaPlaying;
    updateDiaporamaPlayButton();
    if (isDiaporamaPlaying) {
        startDiaporamaTimer();
        if (diaporamaAudio && !isMusicMuted && diaporamaAudio.paused) {
            diaporamaAudio.play().catch(() => {});
        }
    } else {
        stopDiaporamaTimer();
    }
}

function updateDiaporamaPlayButton() {
    const btn = document.getElementById('btnDiaporamaPlay');
    if (!btn) return;
    if (isDiaporamaPlaying) {
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        btn.title = "Pausa (Spazio)";
    } else {
        btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        btn.title = "Riproduci (Spazio)";
    }
}

function setDiaporamaSpeed(speedMs) {
    diaporamaSpeed = parseInt(speedMs) || 4000;
    if (isDiaporamaPlaying) {
        restartDiaporamaTimer();
    }
}

function startDiaporamaTimer() {
    stopDiaporamaTimer();
    diaporamaTimer = setInterval(() => {
        nextSlide();
    }, diaporamaSpeed);
}

function stopDiaporamaTimer() {
    if (diaporamaTimer) {
        clearInterval(diaporamaTimer);
        diaporamaTimer = null;
    }
}

function restartDiaporamaTimer() {
    stopDiaporamaTimer();
    startDiaporamaTimer();
}

function closeDiaporama() {
    stopDiaporamaTimer();
    isDiaporamaPlaying = false;
    if (diaporamaAudio) {
        diaporamaAudio.pause();
    }
    const overlay = document.getElementById('diaporamaOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function toggleDiaporamaFullscreen() {
    const elem = document.getElementById('diaporamaOverlay');
    if (!elem) return;

    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen().catch(() => {});
    }
}

/* ==========================================================================
   AUDIO MP3 CONTROLS FOR SLIDESHOW
   ========================================================================== */
function initAudioElement() {
    diaporamaAudio = document.getElementById('diaporamaAudio');
    if (!diaporamaAudio) {
        diaporamaAudio = new Audio();
        diaporamaAudio.id = 'diaporamaAudio';
        diaporamaAudio.loop = true;
        document.body.appendChild(diaporamaAudio);
    }
    diaporamaAudio.volume = 0.65;

    if (allAudio && allAudio.length > 0) {
        currentAudioTrack = allAudio[0];
        diaporamaAudio.src = resolveMediaUrl(currentAudioTrack.url);
        updateAudioDisplay(currentAudioTrack.title);
    }

    diaporamaAudio.addEventListener('play', () => {
        setMusicVisualizerActive(true);
        const icon = document.getElementById('btnAudioMainIcon');
        if (icon) icon.className = 'fa-solid fa-pause';
    });
    diaporamaAudio.addEventListener('pause', () => {
        setMusicVisualizerActive(false);
        const icon = document.getElementById('btnAudioMainIcon');
        if (icon) icon.className = 'fa-solid fa-play';
    });
}

function populateAudioSelectors() {
    const selects = [
        document.getElementById('diaporamaTrackSelect'),
        document.getElementById('headerMusicTrackSelect')
    ];

    selects.forEach(select => {
        if (!select) return;
        select.innerHTML = '';

        const albums = {};
        allAudio.forEach(track => {
            const alb = track.album || 'Altri brani';
            if (!albums[alb]) albums[alb] = [];
            albums[alb].push(track);
        });

        Object.keys(albums).forEach(albumName => {
            const group = document.createElement('optgroup');
            group.label = albumName;
            albums[albumName].forEach(track => {
                const opt = document.createElement('option');
                opt.value = track.id;
                opt.textContent = track.title;
                if (currentAudioTrack && currentAudioTrack.id === track.id) {
                    opt.selected = true;
                }
                group.appendChild(opt);
            });
            select.appendChild(group);
        });
    });
}

function onAudioTrackChange(trackIdOrUrl) {
    const track = allAudio.find(a => a.id === trackIdOrUrl || a.url === trackIdOrUrl);
    if (!track) return;
    currentAudioTrack = track;
    populateAudioSelectors();
    playAudioTrack(track.url, track.title);
}

function playAudioTrack(url, title) {
    if (!diaporamaAudio) return;
    diaporamaAudio.src = resolveMediaUrl(url);
    diaporamaAudio.play().then(() => {
        updateAudioDisplay(title);
    }).catch(e => console.log('Audio playback info', e));
}

function toggleMusicPlayback() {
    if (!diaporamaAudio) return;
    if (diaporamaAudio.paused) {
        diaporamaAudio.play().catch(() => {});
    } else {
        diaporamaAudio.pause();
    }
}

function toggleMusicMute() {
    if (!diaporamaAudio) return;
    isMusicMuted = !isMusicMuted;
    diaporamaAudio.muted = isMusicMuted;
    const btn = document.getElementById('btnToggleMute');
    if (btn) {
        btn.innerHTML = isMusicMuted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    }
}

function onAudioVolumeChange(val) {
    if (!diaporamaAudio) return;
    const volume = parseFloat(val);
    diaporamaAudio.volume = Math.max(0, Math.min(1, volume));
}

function updateAudioDisplay(title) {
    const labels = [
        document.getElementById('diaporamaTrackTitle'),
        document.getElementById('headerTrackTitle')
    ];
    labels.forEach(l => {
        if (l) l.textContent = title || 'Musica MP3';
    });
}

function setMusicVisualizerActive(active) {
    const waves = document.querySelectorAll('.music-wave-bars');
    waves.forEach(w => w.classList.toggle('wave-active', active));
}

function triggerCustomAudioUpload() {
    const input = document.getElementById('customAudioInput');
    if (input) input.click();
}

async function handleCustomAudioFile(input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const id = 'user_audio_' + Date.now();
    const blobUrl = await saveMediaBlob(id, file);
    const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

    const customTrack = {
        id,
        filename: file.name,
        title: title,
        album: 'Brano Personalizzato',
        path: '',
        url: blobUrl,
        size_mb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
        isUserUpload: true
    };

    saveUserAudioUpload(customTrack);
    allAudio.unshift(customTrack);
    currentAudioTrack = customTrack;
    populateAudioSelectors();
    playAudioTrack(customTrack.url, customTrack.title);
    input.value = '';
    showMediaToast(`Brano "${title}" salvato nella playlist!`, 'success');
}

/* ==========================================================================
   TOAST NOTIFICATIONS & GLOBAL KEYBOARD SHORTCUTS
   ========================================================================== */
function showMediaToast(message, type = 'info') {
    let toast = document.getElementById('ge-media-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ge-media-toast';
        toast.className = 'media-toast';
        document.body.appendChild(toast);
    }
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    toast.className = `media-toast media-toast-${type} visible`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;

    clearTimeout(window._geMediaToastTimer);
    window._geMediaToastTimer = setTimeout(() => {
        toast.classList.remove('visible');
    }, 3500);
}

function initGlobalEventListeners() {
    document.addEventListener('keydown', (e) => {
        const diaporamaActive = document.getElementById('diaporamaOverlay')?.classList.contains('active');
        const lightboxActive = document.getElementById('photoLightboxModal')?.classList.contains('active');
        const videoActive = document.getElementById('videoTheaterModal')?.classList.contains('active');

        if (diaporamaActive) {
            if (e.key === 'Escape') closeDiaporama();
            else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
            else if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
            else if (e.key.toLowerCase() === 'f') { toggleDiaporamaFullscreen(); }
            else if (e.key.toLowerCase() === 'm') { toggleMusicMute(); }
        } else if (lightboxActive) {
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowRight') nextLightboxPhoto();
            else if (e.key === 'ArrowLeft') prevLightboxPhoto();
        } else if (videoActive) {
            if (e.key === 'Escape') closeVideoTheater();
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target.id === 'photoLightboxModal') closeLightbox();
        if (e.target.id === 'videoTheaterModal') closeVideoTheater();
        if (e.target.id === 'uploadModal') closeUploadModal();
        if (e.target.id === 'editTitleModal') closeEditTitleModal();
        if (e.target.id === 'newDossierModal') closeNewDossierModal();
    });

    window.addEventListener('languageChanged', () => {
        renderDossierBar();
        updateSelectionUI();
    });
}

function getI18nText(key, fallback) {
    if (typeof window.t === 'function') {
        const res = window.t(key, fallback);
        if (res && res !== key) return res;
    }
    return fallback;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeJsString(str) {
    if (!str) return '';
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
