/**
 * GREEN_ENERBRAS - Photos & Vidéos Management & Interactive Diaporama (Slideshow)
 * Comprehensive media gallery with fullscreen viewers, customizable slideshow with MP3 music,
 * drag & drop reordering, title editing, download, and deletion.
 */

// Global State
let currentMediaList = [];
let allPhotos = [];
let allVideos = [];
let allAudio = [];
let activeTypeFilter = 'all'; // 'all' | 'photo' | 'video'
let activeVillaFilter = 'all'; // 'all' | 'Impianti Solari' | 'Parchi Solari' | 'Tri Star' | 'Villa F' | 'Villa G' | 'Villa H' | 'Villa I' | 'Resort'
let searchQuery = '';

// Diaporama State
let diaporamaPhotos = [];
let currentSlideIndex = 0;
let diaporamaTimer = null;
let diaporamaSpeed = 4000; // ms
let isDiaporamaPlaying = false;
let diaporamaAudio = null;
let isMusicMuted = false;
let currentAudioTrack = null;

// Helper: resolve relative URLs depending on whether we are in /admin/ or at root
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

// Initialize on DOM Ready

function normalizeVilla(villa) {
    if (!villa) return 'Impianti Solari';
    if (villa === 'Villa F' || villa === 'Villa G') return 'Impianti Solari';
    if (villa === 'Villa H' || villa === 'Villa I') return 'Parchi Solari';
    if (villa === 'Resort' || villa === 'Sombra Resort') return 'Tri Star';
    return villa;
}

document.addEventListener('DOMContentLoaded', () => {
    initMediaGallery();
    initGlobalEventListeners();
    initInlineDropZone();
});

function initMediaGallery() {
    const dataCatalog = window.GREEN_MEDIA_DATA || window.SOMBRA_MEDIA_DATA;
    if (!dataCatalog) return;

    // Load Deleted IDs
    const deletedIds = getDeletedMediaIds();

    // Load Custom Titles
    const customTitles = getCustomMediaTitles();

    // Load User Uploads
    const userMedia = getUserUploads();

    // Combine Stock Data + User Uploads
    const stockPhotos = (dataCatalog.photos || []).map(p => ({ ...p, type: 'photo' }));
    const stockVideos = (dataCatalog.videos || []).map(v => ({ ...v, type: 'video' }));
    allAudio = dataCatalog.audio || [];

    let combined = [...stockPhotos, ...stockVideos, ...userMedia];

    // Filter out deleted
    combined = combined.filter(item => !deletedIds.includes(item.id));

    // Apply custom titles & custom sections if edited
    combined.forEach(item => {
        if (customTitles[item.id]) {
            if (typeof customTitles[item.id] === 'string') {
                item.title = customTitles[item.id];
            } else if (typeof customTitles[item.id] === 'object') {
                if (customTitles[item.id].title) item.title = customTitles[item.id].title;
                if (customTitles[item.id].villa) item.villa = customTitles[item.id].villa;
            }
        }
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

    combined.forEach(item => {
        item.villa = normalizeVilla(item.villa);
    });
    currentMediaList = combined;
    allPhotos = currentMediaList.filter(item => item.type === 'photo');
    allVideos = currentMediaList.filter(item => item.type === 'video');

    renderGallery();
    populateAudioSelectors();
    initAudioElement();
    updateMediaStats();
}

/* ==========================================================================
   STORAGE HELPERS
   ========================================================================== */
function getDeletedMediaIds() {
    try {
        const stored = localStorage.getItem('green_deleted_media') || localStorage.getItem('sombra_deleted_media');
        return JSON.parse(stored || '[]');
    } catch (e) {
        return [];
    }
}

function saveDeletedMediaId(id) {
    const list = getDeletedMediaIds();
    if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('green_deleted_media', JSON.stringify(list));
    }
}

function getCustomMediaTitles() {
    try {
        const stored = localStorage.getItem('green_media_titles') || localStorage.getItem('sombra_media_titles');
        return JSON.parse(stored || '{}');
    } catch (e) {
        return {};
    }
}

function saveCustomMediaTitle(id, newTitle, newVilla = null) {
    const titles = getCustomMediaTitles();
    titles[id] = { title: newTitle, villa: newVilla };
    localStorage.setItem('green_media_titles', JSON.stringify(titles));
}

function getSavedMediaOrder() {
    try {
        const stored = localStorage.getItem('green_media_order') || localStorage.getItem('sombra_media_order');
        return JSON.parse(stored || '[]');
    } catch (e) {
        return [];
    }
}

function saveMediaOrder() {
    const ids = currentMediaList.map(item => item.id);
    localStorage.setItem('green_media_order', JSON.stringify(ids));
}

function getUserUploads() {
    try {
        const stored = localStorage.getItem('green_user_media') || localStorage.getItem('sombra_user_media');
        return JSON.parse(stored || '[]');
    } catch (e) {
        return [];
    }
}

function saveUserUpload(item) {
    const list = getUserUploads();
    list.unshift(item);
    localStorage.setItem('green_user_media', JSON.stringify(list));
}

/* ==========================================================================
   GALLERY RENDERING & FILTERING
   ========================================================================== */
function renderGallery() {
    const container = document.getElementById('mediaGrid');
    if (!container) return;

    let items = currentMediaList.filter(item => {
        // Type filter
        if (activeTypeFilter !== 'all' && item.type !== activeTypeFilter) return false;
        // Villa / Section filter
        if (activeVillaFilter !== 'all' && item.villa !== activeVillaFilter) return false;
        // Search query
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            const matchesTitle = (item.title || '').toLowerCase().includes(q);
            const matchesVilla = (item.villa || '').toLowerCase().includes(q);
            const matchesFile = (item.filename || '').toLowerCase().includes(q);
            if (!matchesTitle && !matchesVilla && !matchesFile) return false;
        }
        return true;
    });

    if (items.length === 0) {
        container.innerHTML = `
            <div class="media-empty-state">
                <i class="fa-solid fa-photo-film"></i>
                <h3 data-i18n="media_empty_title">Nessun elemento multimediale trovato</h3>
                <p data-i18n="media_empty_desc">Nessuna foto o video corrisponde ai filtri selezionati.</p>
                <button class="btn btn-secondary btn-sm" onclick="resetFilters()">
                    <i class="fa-solid fa-rotate-left"></i> <span data-i18n="media_empty_reset">Reimposta filtri</span>
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(item => createMediaCardHTML(item)).join('');
    initCardDragAndDrop();
}

function createMediaCardHTML(item) {
    const isVideo = item.type === 'video';
    const resolvedUrl = resolveMediaUrl(item.url);
    const villaBadgeClass = getVillaBadgeClass(item.villa);

    return `
        <div class="media-card glass-panel" 
             id="card_${item.id}" 
             data-id="${item.id}" 
             data-type="${item.type}"
             draggable="true">
            
            <div class="media-card-top-bar">
                <div class="media-drag-handle" title="Trascina per riordinare">
                    <i class="fa-solid fa-grip-vertical"></i>
                </div>
                <div class="media-badges">
                    <span class="badge ${villaBadgeClass}">${escapeHtml(item.villa || 'Impianti Solari')}</span>
                    <span class="media-type-badge ${isVideo ? 'badge-video' : 'badge-photo'}">
                        <i class="fa-solid ${isVideo ? 'fa-video' : 'fa-image'}"></i> ${isVideo ? 'Video' : 'Foto'}
                    </span>
                </div>
            </div>

            <div class="media-thumb-wrap" onclick="${isVideo ? `openVideoTheater('${item.id}')` : `openLightbox('${item.id}')`}">
                ${isVideo ? `
                    <div class="media-video-thumb">
                        <i class="fa-solid fa-circle-play video-play-glyph"></i>
                        <span class="video-label-tag"><i class="fa-solid fa-play"></i> Riproduci Video</span>
                    </div>
                ` : `
                    <img src="${resolvedUrl}" alt="${escapeHtml(item.title)}" loading="lazy" class="media-thumb-img">
                `}
                <div class="media-hover-overlay">
                    <div class="hover-action-btn" title="${isVideo ? 'Guarda il video' : 'Ingrandisci la foto'}">
                        <i class="fa-solid ${isVideo ? 'fa-play' : 'fa-magnifying-glass-plus'}"></i>
                    </div>
                </div>
            </div>

            <div class="media-card-info">
                <div class="media-title-row">
                    <div class="media-card-title" id="title_text_${item.id}" title="${escapeHtml(item.title)}">
                        ${escapeHtml(item.title)}
                    </div>
                    <button type="button" class="media-action-icon-btn btn-edit-title" onclick="editMediaTitle('${item.id}')" title="Modifica titolo e sezione">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                </div>

                <div class="media-meta-row">
                    <span class="media-meta-size">
                        <i class="fa-solid fa-hard-drive"></i> ${item.size_mb || 0} MB
                    </span>
                    <div class="media-card-actions">
                        <button type="button" class="media-action-icon-btn btn-view" onclick="${isVideo ? `openVideoTheater('${item.id}')` : `openLightbox('${item.id}')`}" title="Schermo intero">
                            <i class="fa-solid fa-expand"></i>
                        </button>
                        <a href="${resolvedUrl}" download="${escapeHtml(item.filename)}" class="media-action-icon-btn btn-download" title="Scarica file" onclick="event.stopPropagation()">
                            <i class="fa-solid fa-download"></i>
                        </a>
                        <button type="button" class="media-action-icon-btn btn-delete" onclick="deleteMediaItem('${item.id}')" title="Rimuovi dalla galleria">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getVillaBadgeClass(villa) {
    switch (villa) {
        case 'Impianti Solari': return 'badge-emerald';
        case 'Parchi Solari': return 'badge-cyan';
        case 'Tri Star': return 'badge-amber';
        case 'Generale': return 'badge-blue';
        default: return 'badge-emerald';
    }
}

function setTypeFilter(type, btn) {
    activeTypeFilter = type;
    document.querySelectorAll('.media-type-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderGallery();
}

function setVillaFilter(villa, btn) {
    activeVillaFilter = villa;
    document.querySelectorAll('.media-villa-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderGallery();
}

function onSearchInput(val) {
    searchQuery = val || '';
    renderGallery();
}

function resetFilters() {
    activeTypeFilter = 'all';
    activeVillaFilter = 'all';
    searchQuery = '';
    const searchInput = document.getElementById('mediaSearchInput');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.media-type-tab').forEach(b => b.classList.toggle('active', b.dataset.type === 'all'));
    document.querySelectorAll('.media-villa-pill').forEach(b => b.classList.toggle('active', b.dataset.villa === 'all'));
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
   DRAG & DROP REORDERING
   ========================================================================== */
let draggedCardEl = null;

function initCardDragAndDrop() {
    const cards = document.querySelectorAll('.media-card');
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
   TITLE MODIFICATION & DELETION
   ========================================================================== */
function editMediaTitle(id) {
    const item = currentMediaList.find(m => m.id === id);
    if (!item) return;

    const modal = document.getElementById('editTitleModal');
    const inputTitle = document.getElementById('modalEditTitleInput');
    const selectVilla = document.getElementById('modalEditVillaSelect');
    const hiddenId = document.getElementById('modalEditMediaId');

    if (modal && inputTitle && selectVilla && hiddenId) {
        hiddenId.value = id;
        inputTitle.value = item.title;
        selectVilla.value = item.villa || 'Impianti Solari';
        modal.style.display = 'flex';
        modal.classList.add('active');
        inputTitle.focus();
        inputTitle.select();
    } else {
        const newTitle = prompt("Modifica il titolo del media:", item.title);
        if (newTitle !== null && newTitle.trim() !== '') {
            saveTitleAndRefresh(id, newTitle.trim());
        }
    }
}

function saveModalTitle() {
    const hiddenId = document.getElementById('modalEditMediaId');
    const inputTitle = document.getElementById('modalEditTitleInput');
    const selectVilla = document.getElementById('modalEditVillaSelect');

    if (!hiddenId || !inputTitle) return;
    const id = hiddenId.value;
    const newTitle = inputTitle.value.trim();
    const newVilla = selectVilla ? selectVilla.value : null;

    if (newTitle) {
        saveTitleAndRefresh(id, newTitle, newVilla);
    }
    closeEditTitleModal();
}

function saveTitleAndRefresh(id, newTitle, newVilla = null) {
    const item = currentMediaList.find(m => m.id === id);
    if (item) {
        item.title = newTitle;
        if (newVilla) item.villa = newVilla;
        saveCustomMediaTitle(id, newTitle, newVilla);
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

function deleteMediaItem(id) {
    const item = currentMediaList.find(m => m.id === id);
    if (!item) return;

    const confirmMsg = `Sei sicuro di voler rimuovere "${item.title}" dalla galleria?`;
    if (confirm(confirmMsg)) {
        saveDeletedMediaId(id);
        currentMediaList = currentMediaList.filter(m => m.id !== id);
        allPhotos = currentMediaList.filter(m => m.type === 'photo');
        allVideos = currentMediaList.filter(m => m.type === 'video');
        saveMediaOrder();
        renderGallery();
        updateMediaStats();
    }
}

function restoreAllDeletedMedia() {
    if (confirm("Vuoi ripristinare tutti i file multimediali rimossi in precedenza?")) {
        localStorage.removeItem('green_deleted_media');
        localStorage.removeItem('sombra_deleted_media');
        initMediaGallery();
    }
}

/* ==========================================================================
   EASY UPLOAD (PHOTOS, VIDEOS, AUDIO MP3)
   ========================================================================== */
function openUploadModal() {
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
    processUploadedFiles(Array.from(input.files));
    input.value = '';
}

function handleInlineFileInput(input) {
    if (!input.files || input.files.length === 0) return;
    const inlineSelect = document.getElementById('inlineUploadSectionSelect');
    const chosenSection = inlineSelect ? inlineSelect.value : 'Impianti Solari';
    processUploadedFiles(Array.from(input.files), chosenSection);
    input.value = '';
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

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
            const inlineSelect = document.getElementById('inlineUploadSectionSelect');
            const chosenSection = inlineSelect ? inlineSelect.value : 'Impianti Solari';
            processUploadedFiles(Array.from(dt.files), chosenSection);
        }
    }, false);
}

function processUploadedFiles(files, customSection = null) {
    const villaSelect = document.getElementById('uploadVillaSelect');
    const chosenVilla = customSection || (villaSelect ? villaSelect.value : 'Impianti Solari');

    files.forEach(file => {
        const fileExt = file.name.split('.').pop().toLowerCase();
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        const fileBlobUrl = URL.createObjectURL(file);
        const nameNoExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt)) {
            const newPhoto = {
                id: 'user_photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                filename: file.name,
                title: nameNoExt,
                path: fileBlobUrl,
                url: fileBlobUrl,
                villa: chosenVilla,
                size_mb: parseFloat(sizeMb),
                type: 'photo',
                isUserUpload: true
            };
            saveUserUpload(newPhoto);
            currentMediaList.unshift(newPhoto);
        } else if (['mp4', 'mov', 'webm'].includes(fileExt)) {
            const newVideo = {
                id: 'user_video_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                filename: file.name,
                title: nameNoExt,
                path: fileBlobUrl,
                url: fileBlobUrl,
                villa: chosenVilla,
                size_mb: parseFloat(sizeMb),
                type: 'video',
                isUserUpload: true
            };
            saveUserUpload(newVideo);
            currentMediaList.unshift(newVideo);
        } else if (['mp3', 'm4a', 'wav'].includes(fileExt)) {
            const newAudio = {
                id: 'user_audio_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                filename: file.name,
                title: nameNoExt,
                album: 'Musica Personalizzata',
                path: fileBlobUrl,
                url: fileBlobUrl,
                size_mb: parseFloat(sizeMb),
                isUserUpload: true
            };
            allAudio.unshift(newAudio);
            populateAudioSelectors();
            playAudioTrack(newAudio.url, newAudio.title);
        }
    });

    allPhotos = currentMediaList.filter(item => item.type === 'photo');
    allVideos = currentMediaList.filter(item => item.type === 'video');
    saveMediaOrder();
    renderGallery();
    updateMediaStats();
    closeUploadModal();
}

/* ==========================================================================
   PHOTO LIGHTBOX (SINGLE VIEW)
   ========================================================================== */
let currentLightboxIndex = 0;

function openLightbox(photoId) {
    const index = allPhotos.findIndex(p => p.id === photoId);
    if (index === -1) return;

    currentLightboxIndex = index;
    const photo = allPhotos[index];

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
    if (villaEl) villaEl.textContent = photo.villa || 'Impianti Solari';
    if (counterEl) counterEl.textContent = `${index + 1} / ${allPhotos.length}`;
    if (downloadEl) {
        downloadEl.href = resolvedUrl;
        downloadEl.download = photo.filename;
    }

    modal.style.display = 'flex';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function nextLightboxPhoto() {
    if (allPhotos.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % allPhotos.length;
    openLightbox(allPhotos[currentLightboxIndex].id);
}

function prevLightboxPhoto() {
    if (allPhotos.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + allPhotos.length) % allPhotos.length;
    openLightbox(allPhotos[currentLightboxIndex].id);
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
   VIDEO THEATER (PLAYER FULLSCREEN)
   ========================================================================== */
function openVideoTheater(videoId) {
    const video = allVideos.find(v => v.id === videoId);
    if (!video) return;

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
   DIAPORAMA (SLIDESHOW) WITH MP3 AUDIO
   ========================================================================== */
function startDiaporama(startFromId = null) {
    closeLightbox();
    diaporamaPhotos = allPhotos.slice();
    if (diaporamaPhotos.length === 0) {
        alert("Nessuna foto disponibile per il diaporama.");
        return;
    }

    if (startFromId) {
        const foundIdx = diaporamaPhotos.findIndex(p => p.id === startFromId);
        currentSlideIndex = foundIdx !== -1 ? foundIdx : 0;
    } else {
        currentSlideIndex = 0;
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

    // Start background music if selected
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
    if (villaEl) villaEl.textContent = photo.villa || 'Impianti Solari';
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
   AUDIO MP3 CONTROLS FOR DIAPORAMA
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

    // Pick first track by default
    if (allAudio && allAudio.length > 0) {
        currentAudioTrack = allAudio[0];
        diaporamaAudio.src = resolveMediaUrl(currentAudioTrack.url);
        updateAudioDisplay(currentAudioTrack.title);
    }

    diaporamaAudio.addEventListener('play', () => {
        setMusicVisualizerActive(true);
    });
    diaporamaAudio.addEventListener('pause', () => {
        setMusicVisualizerActive(false);
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

        // Group by album
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
                opt.value = track.url;
                opt.textContent = track.title;
                if (currentAudioTrack && currentAudioTrack.url === track.url) {
                    opt.selected = true;
                }
                group.appendChild(opt);
            });
            select.appendChild(group);
        });
    });
}

function onAudioTrackChange(url) {
    const track = allAudio.find(a => a.url === url);
    if (!track) return;
    currentAudioTrack = track;
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

function handleCustomAudioFile(input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const blobUrl = URL.createObjectURL(file);
    const title = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

    const customTrack = {
        id: 'user_audio_' + Date.now(),
        filename: file.name,
        title: title,
        album: 'Brano Personalizzato',
        path: blobUrl,
        url: blobUrl,
        size_mb: parseFloat((file.size / (1024 * 1024)).toFixed(2))
    };

    allAudio.unshift(customTrack);
    currentAudioTrack = customTrack;
    populateAudioSelectors();
    playAudioTrack(customTrack.url, customTrack.title);
    input.value = '';
}

/* ==========================================================================
   GLOBAL KEYBOARD SHORTCUTS
   ========================================================================== */
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

    // Close modals on background click
    window.addEventListener('click', (e) => {
        if (e.target.id === 'photoLightboxModal') closeLightbox();
        if (e.target.id === 'videoTheaterModal') closeVideoTheater();
        if (e.target.id === 'uploadModal') closeUploadModal();
        if (e.target.id === 'editTitleModal') closeEditTitleModal();
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
