// Stato dei documenti degli impianti
let impiantiDocuments = {};
let currentImpiantoId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Set last updated date
    document.getElementById('last-updated').textContent = APP_DATA.lastUpdated;
    
    // Carica documenti da storage
    loadImpiantiDocuments();
    
    // Setup Drag and Drop
    setupDragAndDrop('drop-zone-impianto', 'file-input-impianto');

    // Initialize Map with a global view
    // Starting coordinates (somewhere above the Atlantic/Equator for a globe view)
    const map = L.map('map').setView([0, -20], 2);

    // Add Esri WorldImagery tiles for a realistic geographic look
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
    }).addTo(map);

    // Green custom marker icon
    const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const markers = [];

    // Animation to fly to Brazil after 1 second
    setTimeout(() => {
        // Rio Grande do Norte center approximately
        map.flyTo([-5.8, -35.5], 8, {
            duration: 3, // 3 seconds flight
            easeLinearity: 0.25
        });
    }, 1000);

    const container = document.getElementById('impianti-container');

    // Group plants by coordinate to avoid completely overlapping markers
    const locationMap = new Map();

    // Group logic dinamica basata su colonna Excel 'GRUPPO'
    const groupsMap = new Map();

    APP_DATA.modules.forEach(impianto => {
        // Fallback nel caso la colonna non sia ancora stata compilata
        const groupName = (impianto.gruppo && impianto.gruppo.trim() !== '') ? impianto.gruppo.trim() : 'Gruppo Generale';
        
        if (!groupsMap.has(groupName)) {
            groupsMap.set(groupName, {
                id: groupName, // es: 'Gruppo A'
                name: groupName,
                impianti: []
            });
        }
        groupsMap.get(groupName).impianti.push(impianto);
    });

    const groups = Array.from(groupsMap.values()).map(g => {
        // Ricostruisce il suffisso (USINA 1-2)
        const nums = g.impianti.map(imp => parseInt(imp.impianto.replace(/\\D/g, ''), 10)).filter(n => !isNaN(n));
        let usinaText = '';
        if (nums.length === 1) {
            usinaText = `(USINA ${nums[0]})`;
        } else if (nums.length > 1) {
            usinaText = `(USINA ${nums[0]}-${nums[nums.length - 1]})`;
        }
        
        const displayGroupName = g.name.toUpperCase();
        g.name = usinaText ? `${displayGroupName} ${usinaText}` : displayGroupName;
        return g;
    });

    groups.forEach(gruppo => {
        const card = document.createElement('div');
        card.className = 'impianto-card glass-panel';
        
        let impiantiHtml = '';
        let mainLat = gruppo.impianti[0].lat;
        let mainLng = gruppo.impianti[0].lng;

        gruppo.impianti.forEach((impianto, index) => {
            let statoKey = '';
              if (impianto.stato.toUpperCase() === 'ATTIVO') statoKey = 'status_attivi';
              else if (impianto.stato.toUpperCase().includes('FINITO')) statoKey = 'status_finiti_cosern';
              else if (impianto.stato.toUpperCase().includes('COSTRUZIONE')) statoKey = 'status_in_costruzione';
              else if (impianto.stato.toUpperCase().includes('PRODUZIONE')) statoKey = 'status_in_produzione';
              else if (impianto.stato.toUpperCase().includes('CORSO')) statoKey = 'status_in_corso';
              else if (impianto.stato.toUpperCase().includes('PIANIFICATO')) statoKey = 'status_pianificato';
              
              const statusClass = (impianto.stato.toUpperCase() === 'ATTIVO' || impianto.stato.toUpperCase().includes('PRODUZIONE')) ? 'status-attivo' : 'status-costruzione';
            impiantiHtml += `
                <div style="${index > 0 ? 'margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;' : ''}">
                    <div class="impianto-header" style="border: none; padding: 0; margin-bottom: 0.5rem;">
                        <h4 style="color: var(--green); margin:0; font-size: 1.1rem;">${impianto.impianto} - ${impianto.nome}</h4>
                        <span class="impianto-status ${statusClass}" data-i18n="${statoKey}">${impianto.stato}</span>
                    </div>
                    <div class="impianto-detail">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>${impianto.localizzazione || 'Localizzazione non disponibile'}</span>
                    </div>
                    <div class="impianto-detail">
                        <i class="fa-solid fa-file-contract"></i>
                        <span><span data-i18n="label_auth_cosern">Autorizzazione Cosern</span>: ${impianto.autorizzazioneCosern === 'SI' ? '<span data-i18n="label_si">SI</span>' + (impianto.dataAutorizzazione ? ' - ' + impianto.dataAutorizzazione : '') : (impianto.autorizzazioneCosern === 'NO' ? '<span data-i18n="label_no">NO</span>' : (impianto.autorizzazioneCosern || '<span data-i18n="label_na">N/A</span>'))}</span>
                    </div>
                    <div class="impianto-detail">
                        <i class="fa-solid fa-user-tie"></i>
                        <span><span data-i18n="label_cliente">Cliente</span>: ${impianto.cliente || '<span data-i18n="label_na">N/A</span>'}</span>
                    </div>
                    <div class="impianto-detail">
                        <i class="fa-solid fa-expand"></i>
                        <span><span data-i18n="label_superficie">Superficie</span>: ${impianto.superficie || '<span data-i18n="label_na">N/A</span>'}</span>
                    </div>
                    ${(impianto.affitto || impianto.internet) ? `
                    <div class="impianto-detail">
                        <i class="fa-solid fa-money-bill-wave"></i>
                        <span>${impianto.affitto ? '<span data-i18n="label_affitto">Affitto</span> ' + impianto.affitto + ' R$' : ''}${impianto.affitto && impianto.internet ? ' + ' : ''}${impianto.internet ? '<span data-i18n="label_internet">Internet</span> ' + impianto.internet + ' R$' : ''}</span>
                    </div>
                    ` : ''}
                    <div class="impianto-detail">
                        <i class="fa-solid fa-euro-sign"></i>
                        <span><span data-i18n="kpi_investimenti">Investimenti</span>: € ${impianto.investimento.toLocaleString('it-IT')}</span>
                    </div>
                    ${(impianto.lat && impianto.lng) ? `
                    <div class="impianto-detail" style="cursor: pointer; color: #10b981; transition: color 0.3s; margin-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 0.5rem;" onmouseover="this.style.color='#34d399'" onmouseout="this.style.color='#10b981'" onclick="focusMap(${impianto.lat}, ${impianto.lng}, '${impianto.impianto}')">
                        <i class="fa-solid fa-location-arrow"></i>
                        <span><span data-i18n="label_coordinate">Coordinate</span>: ${impianto.lat}, ${impianto.lng}</span>
                    </div>
                    ` : ''}
                </div>
            `;
            
            if (impianto.lat && impianto.lng) {
                const locKey = `${impianto.lat},${impianto.lng}`;
                if (!locationMap.has(locKey)) {
                    locationMap.set(locKey, []);
                }
                locationMap.get(locKey).push(impianto);
            }
        });

        card.innerHTML = `
            <div style="margin-bottom: 0.5rem; border-bottom: 2px solid rgba(16, 185, 129, 0.5); padding-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin:0; font-size: 1.2rem; color: #fff;"><i class="fa-solid fa-layer-group"></i> <span data-i18n="group_label">Gruppo</span> ${gruppo.name.replace(/Gruppo/i, '').trim()}</h3>
                <button class="btn-docs" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; width: auto;" onclick="openDocsModal('${gruppo.id}')">
                    <i class="fa-solid fa-folder-open"></i> <span data-i18n="btn_gestisci_doc">Gestisci Documenti</span>
                </button>
            </div>
            ${impiantiHtml}
            <div style="margin-top: 1.5rem;">
                <button class="map-btn" style="width: 100%; margin-bottom: 0.5rem;" onclick="focusMap(${mainLat}, ${mainLng}, '${gruppo.impianti[0].impianto}')">
                    <i class="fa-solid fa-magnifying-glass-location"></i> <span data-i18n="btn_mostra_mappa">Mostra su Mappa</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    if (typeof applyTranslations === 'function') applyTranslations();

        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6', '#f43f5e', '#8b5cf6', '#d946ef', '#0ea5e9'];
    const allImp = APP_DATA.modules.map(m => String(parseInt(m.impianto.replace('USINA ', ''), 10))).sort((a,b) => Number(a) - Number(b));

    // Create markers spreading overlapping ones side-by-side
    locationMap.forEach((impiantiGroup, key) => {
        const [baseLat, baseLng] = key.split(',').map(Number);
        const count = impiantiGroup.length;
        
        impiantiGroup.forEach((imp, index) => {
            const lat = baseLat;
            const lng = baseLng;
            const impIdNum = parseInt(imp.impianto.replace('USINA ', ''), 10);
            const impIdStr = String(impIdNum);
            const color = colors[allImp.indexOf(impIdStr) % colors.length];
            
            let popupContent = `<div style="font-family: 'Inter', sans-serif;">`;
            popupContent += `<h4 style="margin: 0 0 5px 0; color: ` + color + `;">` + imp.nome + `</h4>`;
            popupContent += `<p style="margin: 3px 0;"><strong>` + imp.impianto + `</strong> (<span data-i18n="stato_` + imp.stato.replace(/\s+/g, '_') + `">` + imp.stato + `</span>)</p>`;
            popupContent += `</div>`;

            const customIcon = L.divIcon({
                className: 'custom-pin',
                html: `<div style="
                    background-color: ` + color + `; 
                    width: 28px; 
                    height: 28px; 
                    border-radius: 50% 50% 50% 0; 
                    transform: rotate(-45deg); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    border: 2px solid white;
                    box-shadow: 0 0 5px rgba(0,0,0,0.5);
                ">
                    <span style="
                        transform: rotate(45deg); 
                        color: white; 
                        font-weight: bold; 
                        font-size: 13px;
                    ">` + impIdNum + `</span>
                </div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 28],
                popupAnchor: [0, -28]
            });

            const marker = L.marker([lat, lng], {icon: customIcon})
                .addTo(map)
                .bindPopup(popupContent);
            
            markers.push({lat: baseLat, lng: baseLng, marker: marker, idString: imp.impianto});
        });
    });

    // Global function to focus map from card
    window.focusMap = function(lat, lng, id) {
        if (!lat || !lng) return;
        
        // Hide other markers, show only the target
        markers.forEach(m => {
            if (m.idString === id) {
                if (!map.hasLayer(m.marker)) map.addLayer(m.marker);
            } else {
                if (map.hasLayer(m.marker)) map.removeLayer(m.marker);
            }
        });

        map.flyTo([lat, lng], 14, {
            duration: 1.5
        });
        
        // Find and open popup
        const targetMarker = markers.find(m => m.idString === id);
        if (targetMarker) {
            setTimeout(() => {
                targetMarker.marker.openPopup();
            }, 1500);
        }
        
        // Scroll to map smoothly
        document.querySelector('.map-container').scrollIntoView({ behavior: 'smooth' });
    };

    window.showAllMarkers = function() {
        markers.forEach(m => {
            if (!map.hasLayer(m.marker)) map.addLayer(m.marker);
        });
        map.flyTo([-5.8, -35.5], 8, { duration: 1.5 });
    };

    // Add a custom control to restore all markers
    const MostraTuttiControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function(map) {
            const btn = L.DomUtil.create('button', 'map-btn');
            btn.innerHTML = '<i class="fa-solid fa-globe"></i> <span data-i18n="btn_mostra_tutti">Mostra Tutti</span>';
            btn.style.backgroundColor = '#10b981';
            btn.style.color = 'white';
            btn.style.border = '2px solid rgba(255,255,255,0.2)';
            btn.style.padding = '5px 10px';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';
            btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
            
            btn.onclick = function(e) {
                e.stopPropagation();
                window.showAllMarkers();
            };
            return btn;
        }
    });
    map.addControl(new MostraTuttiControl());

    const ScrollToListControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function(map) {
            const btn = L.DomUtil.create('button', 'map-btn');
            btn.innerHTML = '<i class="fa-solid fa-arrow-down"></i> <span data-i18n="btn_vedi_dettagli">Vedi Dettagli</span>';
            btn.style.backgroundColor = '#10b981';
            btn.style.color = 'white';
            btn.style.border = '2px solid rgba(255,255,255,0.2)';
            btn.style.padding = '5px 10px';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';
            btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.5)';
            btn.style.marginTop = '10px';
            
            btn.onclick = function(e) {
                e.stopPropagation();
                const container = document.getElementById('impianti-container');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };
            return btn;
        }
    });
    map.addControl(new ScrollToListControl());
    
    // Applica le traduzioni anche ai controlli appena aggiunti alla mappa
    if (typeof applyTranslations === 'function') applyTranslations();
});

// Funzioni Rubrica Documenti

async function loadImpiantiDocuments() {
    try {
        if (typeof firebase !== 'undefined' && firebase.database) {
            const snap = await Promise.race([
                firebase.database().ref('impianti_reports').once('value'),
                new Promise((_, rej) => setTimeout(() => rej(new Error('DB read timeout')), 15000))
            ]);
            if (snap.exists()) {
                const raw = snap.val() || {};
                // Firebase converte arrays in oggetti con chiavi numeriche: ripristina arrays
                Object.keys(raw).forEach(k => {
                    const v = raw[k];
                    if (v && typeof v === 'object' && !Array.isArray(v)) {
                        raw[k] = Object.values(v);
                    }
                });
                impiantiDocuments = raw;
                console.log("Documenti caricati dal Realtime Database:", Object.keys(impiantiDocuments).length, "impianti");
                if (document.getElementById('impianto-docs-modal').style.display === 'flex') {
                    renderDocsTable();
                }
                return; // Esce dalla funzione
            } else {
                alert("DEBUG ERROR: Firebase dice che la cartella documenti è completamente vuota online!");
            }
        } else {
            alert("DEBUG ERROR: Sistema Firebase non inizializzato correttamente!");
        }
    } catch (e) {
        alert("DEBUG ERROR DURANTE IL CARICAMENTO: " + e.message);
        console.warn("Realtime Database non disponibile, uso localStorage:", e.message);
    }
    // Fallback: localStorage
    try {
        const saved = localStorage.getItem('impianti_reports');
        if (saved) impiantiDocuments = JSON.parse(saved);
        console.log("Documenti caricati da localStorage");
        if (document.getElementById('impianto-docs-modal').style.display === 'flex') {
            renderDocsTable();
        }
    } catch(e) {}
}

async function saveImpiantiDocuments() {
    // 1. Salva su Realtime Database (cloud)
    try {
        if (typeof firebase !== 'undefined' && firebase.database) {
            if (currentImpiantoId) {
                await Promise.race([
                    firebase.database().ref(`impianti_reports/${currentImpiantoId}`).set(impiantiDocuments[currentImpiantoId]),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('DB write timeout')), 10000))
                ]);
            } else {
                await Promise.race([
                    firebase.database().ref('impianti_reports').set(impiantiDocuments),
                    new Promise((_, rej) => setTimeout(() => rej(new Error('DB write timeout')), 10000))
                ]);
            }
            console.log("Documenti salvati sul Realtime Database!");
        }
    } catch (e) {
        console.warn("Realtime DB write fallito, salvo su localStorage:", e.message);
    }
    // 2. Sempre salva anche su localStorage come copia locale
    try { localStorage.setItem('impianti_reports', JSON.stringify(impiantiDocuments)); } catch(le) {}

    
    if (currentImpiantoId) {
        renderDocsTable();
    }
}

window.openDocsModal = function(impiantoId) {
    currentImpiantoId = impiantoId;
    document.getElementById('docs-modal-title').innerHTML = `<i class="fa-solid fa-folder-open"></i> <span data-i18n="btn_doc_impianto">Documenti Impianto</span>: ${impiantoId}`;
    
    // Inizializza array vuoto se non esiste
    if (!impiantiDocuments[impiantoId]) {
        impiantiDocuments[impiantoId] = [];
    }

    const filterContainer = document.getElementById('usina-filter-container');
    if (filterContainer) {
        const usinas = APP_DATA.modules.filter(m => (m.gruppo && m.gruppo.trim() === impiantoId) || (!m.gruppo && impiantoId === 'Gruppo Generale')).map(m => m.impianto);
        let filterHtml = `
            <label style="color: #e2e8f0; font-weight: bold; margin-right: 0.5rem;"><i class="fa-solid fa-filter"></i> <span data-i18n="filter_impianto">Filtra per Impianto:</span></label>
            <label style="color: #cbd5e1; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                <input type="checkbox" class="usina-filter-cb" value="generico" checked onchange="renderDocsTable()"> <span data-i18n="filter_generici">Generici Gruppo</span>
            </label>
        `;
        usinas.forEach(u => {
            const num = u.replace(/\D/g, '');
            const labelStr = num ? `<span data-i18n="table_impianto">Impianto</span> ${num}` : u;
            filterHtml += `
            <label style="color: #cbd5e1; cursor: pointer; display: flex; align-items: center; gap: 0.3rem;">
                <input type="checkbox" class="usina-filter-cb" value="${u}" checked onchange="renderDocsTable()"> ${labelStr}
            </label>`;
        });
        filterContainer.innerHTML = filterHtml;
    }
    
    renderDocsTable();
    document.getElementById('impianto-docs-modal').style.display = 'flex';
};

window.closeDocsModal = function() {
    document.getElementById('impianto-docs-modal').style.display = 'none';
    currentImpiantoId = null;
};

function setupDragAndDrop(zoneId, inputId) {
    const dropZone = document.getElementById(zoneId);
    const fileInput = document.getElementById(inputId);

    dropZone.addEventListener('click', (e) => {
        if(e.target.tagName !== 'BUTTON') fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; 
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
}

async function handleFiles(fileList) {
    if (!fileList || !fileList.length || !currentImpiantoId) return;
    
    if (!fileList || !fileList.length || !currentImpiantoId) return;
    
    if (typeof firebase === 'undefined' || !firebase.storage) {
        alert("Firebase non inizializzato correttamente. Riprova tra qualche secondo.");
        return;
    }

    const overlay = document.getElementById('upload-overlay');
    const progressFill = document.getElementById('upload-progress-fill');
    const progressText = document.getElementById('upload-progress-text');
    const fileNameEl = document.getElementById('upload-file-name');
    
    const files = Array.from(fileList);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Mostra overlay progresso
        overlay.classList.add('active');
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        fileNameEl.textContent = `File ${i+1}/${files.length}: ${file.name}`;

        try {
            let doc = {};
            // FLUSSO STANDARD (L'AI è stata spostata nella fase successiva)
            const safeName = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const storageRef = firebase.storage().ref().child('uploads/impianti/' + safeName);
            
            await new Promise((resolve, reject) => {
                const uploadTask = storageRef.put(file);
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                        progressFill.style.width = pct + '%';
                        progressText.textContent = 'Upload in corso: ' + pct + '%';
                    },
                    (error) => { reject(error); },
                    async () => { resolve(); }
                );
            });
            
            let downloadURL = '';
            try {
                downloadURL = await storageRef.getDownloadURL();
            } catch(e) {
                const bucket = 'green-enerbras.firebasestorage.app';
                const path = encodeURIComponent('uploads/impianti/' + safeName);
                downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${path}?alt=media`;
            }
            
            doc = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: formatBytes(file.size),
                type: getFileType(file.name),
                date: new Date().toLocaleDateString('it-IT'),
                visibleToUser: false,
                dataUrl: downloadURL,
                storagePath: 'uploads/impianti/' + safeName
            };

            if(!impiantiDocuments[currentImpiantoId]) impiantiDocuments[currentImpiantoId] = [];
            impiantiDocuments[currentImpiantoId].push(doc);
            saveImpiantiDocuments();
        } catch(err) {
            overlay.classList.remove('active');
            console.error("Upload error per " + file.name, err);
            alert("❌ Errore caricamento " + file.name + ": " + err.message);
            return;
        }
    }

    // Nascondi overlay al termine
    overlay.classList.remove('active');
}

// ---- Drag & Drop reordering state ----
let dragSrcIndex = null;

function renderDocsTable() {
    const tbody = document.getElementById('table-impianto-docs');
    tbody.innerHTML = '';
    
    const allDocs = impiantiDocuments[currentImpiantoId] || [];
    
    const filterCheckboxes = document.querySelectorAll('.usina-filter-cb');
    let selectedUsinas = [];
    let showGenerici = true;
    if (filterCheckboxes.length > 0) {
        selectedUsinas = Array.from(filterCheckboxes).filter(cb => cb.checked && cb.value !== 'generico').map(cb => cb.value);
        showGenerici = Array.from(filterCheckboxes).find(cb => cb.value === 'generico')?.checked || false;
    }
    
    const allUsinasForGroup = APP_DATA.modules.filter(m => (m.gruppo && m.gruppo.trim() === currentImpiantoId) || (!m.gruppo && currentImpiantoId === 'Gruppo Generale')).map(m => m.impianto);

    const docs = allDocs.filter(doc => {
        if (filterCheckboxes.length === 0) return true;
        const docNameUpper = doc.name.toUpperCase();
        
        const usinasInDoc = allUsinasForGroup.filter(u => {
            const numRaw = u.replace(/\D/g, '');
            if (!numRaw) return docNameUpper.includes(u.toUpperCase());
            const numInt = parseInt(numRaw, 10).toString();
            const numPad2 = numInt.padStart(2, '0');
            const numPad3 = numInt.padStart(3, '0');
            const regex = new RegExp('(?:USINA\\s*|U\\s*)(?:' + numInt + '|' + numPad2 + '|' + numPad3 + ')(?![0-9])', 'i');
            return regex.test(docNameUpper);
        });

        if (usinasInDoc.length === 0) return showGenerici;
        return usinasInDoc.some(u => selectedUsinas.includes(u));
    });
    
    if (docs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:2rem;">Nessun documento trovato.</td></tr>`;
        return;
    }

    const categories = [
        { id: 'DOCUMENTI', icon: 'fa-file-pdf', color: '#3b82f6', types: ['pdf', 'word', 'default'] },
        { id: 'VIDEO', icon: 'fa-video', color: '#8b5cf6', types: ['video'] },
        { id: 'FOTO', icon: 'fa-image', color: '#10b981', types: ['image'] }
    ];

    categories.forEach(cat => {
        const catDocs = docs.filter(d => cat.types.includes(d.type));
        if (catDocs.length > 0) {
            const headerTr = document.createElement('tr');
            headerTr.style.background = 'rgba(255, 255, 255, 0.03)';
            headerTr.innerHTML = `<td colspan="5" style="padding: 0.8rem; font-weight: bold; color: ${cat.color}; border-bottom: 1px solid var(--border-color);"><i class="fa-solid ${cat.icon}"></i> &nbsp;<span data-i18n="cat_${cat.id.toLowerCase()}">${cat.id}</span></td>`;
            tbody.appendChild(headerTr);

            catDocs.forEach((doc) => {
                const eyeTitle  = doc.visibleToUser ? 'Visibile agli Investitori' : 'Nascosto agli Investitori';
                const eyeIcon   = doc.visibleToUser ? 'fa-eye' : 'fa-eye-slash';
                const eyeColor  = doc.visibleToUser ? '#10b981' : '#64748b';

                const btnBase = `
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: #e2e8f0;
                    border-radius: 7px;
                    width: 34px; height: 34px;
                    cursor: pointer;
                    display: inline-flex; align-items: center; justify-content: center;
                    font-size: 0.85rem;
                    margin-left: 4px;
                    transition: background 0.2s, color 0.2s;
                `;

                let translationBtn = '';
                if (doc.type === 'pdf' || doc.type === 'word') {
                    translationBtn = `
                        <button title="Traduci con IA (Es. per richieste pendenti)" onclick="adminTranslateDoc('${doc.id}')" style="${btnBase} color:#f59e0b;">
                            <i class="fa-solid fa-language"></i>
                        </button>
                    `;
                }

                let translationLinks = '';
                if (doc.translations && Object.keys(doc.translations).length > 0) {
                    if (doc.translations.it) translationLinks += `<a href="${doc.translations.it}" target="_blank" title="Scarica Traduzione IT" style="font-size: 0.7rem; background: #3b82f6; color: white; padding: 2px 5px; border-radius: 4px; margin-left: 5px; text-decoration: none; display: inline-block; vertical-align: middle;">IT</a>`;
                    if (doc.translations.en) translationLinks += `<a href="${doc.translations.en}" target="_blank" title="Scarica Traduzione EN" style="font-size: 0.7rem; background: #3b82f6; color: white; padding: 2px 5px; border-radius: 4px; margin-left: 5px; text-decoration: none; display: inline-block; vertical-align: middle;">EN</a>`;
                    if (doc.translations.fr) translationLinks += `<a href="${doc.translations.fr}" target="_blank" title="Scarica Traduzione FR" style="font-size: 0.7rem; background: #3b82f6; color: white; padding: 2px 5px; border-radius: 4px; margin-left: 5px; text-decoration: none; display: inline-block; vertical-align: middle;">FR</a>`;
                }

                const tr = document.createElement('tr');
                tr.draggable = true;
                tr.ondragstart = (e) => handleDragStart(e, doc.id);
                tr.ondragover = (e) => handleDragOver(e);
                tr.ondragenter = (e) => e.preventDefault();
                tr.ondrop = (e) => handleDrop(e, doc.id);
                tr.ondragend = (e) => handleDragEnd(e);
                tr.style.cursor = 'grab';

                tr.innerHTML = `
                    <td style="width:44px;"><i class="fa-solid fa-grip-vertical" style="color: #6b7280; margin-right: 10px; cursor: grab;" title="Trascina per riordinare"></i>${getIconForType(doc.type)}</td>
                    <td style="max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${doc.name}">
                        <strong style="font-size:0.95rem; vertical-align: middle;">${doc.name}</strong> 
                    </td>
                    <td style="color:#94a3b8; font-size:0.85rem; white-space:nowrap;">${doc.date}</td>
                    <td style="color:#94a3b8; font-size:0.85rem; white-space:nowrap;">${doc.size}</td>
                    <td style="text-align:right; white-space:nowrap; padding-right:0.5rem;">
                        ${doc.isAiTranslated ? '<span style="font-size: 0.7rem; background: var(--accent-green); color: white; padding: 2px 5px; border-radius: 4px; margin-right: 5px; vertical-align: middle;">AI</span>' : ''}
                        ${translationLinks}
                        ${translationBtn}
                        <button title="Anteprima" onclick="openPreview('${doc.id}')" style="${btnBase} color:#10b981;">
                            <i class="fa-solid fa-book-open"></i>
                        </button>
                        <button title="Rinomina" onclick="renameDocument('${doc.id}')" style="${btnBase} color:#3b82f6;">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button title="${eyeTitle}" onclick="toggleVisibility('${doc.id}')" style="${btnBase} color:${eyeColor};">
                            <i class="fa-solid ${eyeIcon}"></i>
                        </button>
                        <button title="Elimina" onclick="deleteDocument('${doc.id}')" style="${btnBase} color:#ef4444;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    });
}

// ---- Drag & Drop Reordering Logic ----
window.handleDragStart = function(e, docId) {
    if (!currentImpiantoId) return;
    dragSrcIndex = impiantiDocuments[currentImpiantoId].findIndex(d => d.id === docId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.4';
    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
};

window.handleDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
};

window.handleDrop = function(e, targetDocId) {
    e.stopPropagation();
    if (!currentImpiantoId || dragSrcIndex === null) return false;
    
    const docs = impiantiDocuments[currentImpiantoId];
    const targetIndex = docs.findIndex(d => d.id === targetDocId);
    
    if (dragSrcIndex > -1 && targetIndex > -1 && dragSrcIndex !== targetIndex) {
        const [movedDoc] = docs.splice(dragSrcIndex, 1);
        docs.splice(targetIndex, 0, movedDoc);
        saveImpiantiDocuments();
    }
    dragSrcIndex = null;
    return false;
};

window.resetGeminiApiKey = function(e) {
    e.preventDefault();
    const newKey = prompt("Inserisci la nuova API Key di Gemini (verrà salvata nel browser):");
    if (newKey && newKey.trim() !== '') {
        localStorage.setItem('gemini_api_key', newKey.trim());
        alert("API Key aggiornata con successo! Ora puoi ricaricare il tuo PDF.");
    }
};

window.handleDragEnd = function(e) {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.backgroundColor = '';
};

window.toggleVisibility = function(docId) {
    if (!currentImpiantoId) return;
    const doc = impiantiDocuments[currentImpiantoId].find(d => d.id === docId);
    if (doc) {
        doc.visibleToUser = !doc.visibleToUser;
        saveImpiantiDocuments();
    }
};

window.deleteDocument = async function(docId) {
    if (!currentImpiantoId) return;
    if (confirm("Sei sicuro di voler eliminare questo documento?")) {
        impiantiDocuments[currentImpiantoId] = impiantiDocuments[currentImpiantoId].filter(d => d.id !== docId);
        saveImpiantiDocuments();
    }
};

window.renameDocument = function(docId) {
    if (!currentImpiantoId) return;
    const doc = impiantiDocuments[currentImpiantoId].find(d => d.id === docId);
    if (doc) {
        const newName = prompt("Inserisci il nuovo nome per il documento:", doc.name);
        if (newName !== null && newName.trim() !== "") {
            doc.name = newName.trim();
            saveImpiantiDocuments();
        }
    }
};

let galleryImages = [];
let currentGalleryIndex = 0;

window.openPreview = function(docId) {
    if (!currentImpiantoId) return;
    const allDocs = impiantiDocuments[currentImpiantoId] || [];
    const doc = allDocs.find(d => d.id === docId);
    if (!doc) return;

    if (doc.type === 'image') {
        galleryImages = allDocs.filter(d => d.type === 'image');
        currentGalleryIndex = galleryImages.findIndex(d => d.id === docId);
        renderGalleryImage();
    } else {
        galleryImages = [];
        document.getElementById('preview-title').innerHTML = `<i class="fa-solid fa-file"></i> Anteprima: ${doc.name}`;
        const previewContainer = document.getElementById('preview-content-container');
        
        const docUrl = doc.dataUrl;

        if (docUrl) {
            if (doc.type === 'pdf') {
                previewContainer.innerHTML = `<iframe src="${docUrl}" style="width:100%; height:100%; border:none;"></iframe>`;
            } else if (doc.type === 'video') {
                previewContainer.innerHTML = `<video src="${docUrl}" controls style="max-width:100%; max-height:100%;"></video>`;
            } else {
                previewContainer.innerHTML = `
                    <div style="text-align: center;">
                        <i class="fa-solid fa-file-word" style="font-size: 5rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                        <h2>${doc.name}</h2>
                        <p style="color: var(--text-muted); margin-top: 1rem;">L'anteprima in-browser non è supportata per questo formato.<br>Scarica il file (se implementato) per aprirlo.</p>
                    </div>
                `;
            }
        } else {
            previewContainer.innerHTML = `
                <div style="text-align: center;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 5rem; color: #f59e0b; margin-bottom: 1rem;"></i>
                    <h2>File Non Trovato</h2>
                    <p style="color: var(--text-muted); margin-top: 1rem;">Il contenuto di questo file non è stato salvato.</p>
                </div>
            `;
        }
        document.getElementById('preview-modal').style.display = 'flex';
    }
};

function renderGalleryImage() {
    if (galleryImages.length === 0) return;
    const doc = galleryImages[currentGalleryIndex];
    
    document.getElementById('preview-title').innerHTML = `<i class="fa-solid fa-image"></i> Anteprima: ${doc.name} (${currentGalleryIndex + 1} di ${galleryImages.length})`;
    const previewContainer = document.getElementById('preview-content-container');
    
    previewContainer.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;" id="gallery-container">
            <img src="${doc.dataUrl}" style="max-width:100%; max-height:100%; object-fit:contain; border-radius: 4px;">
            
            ${galleryImages.length > 1 ? `
                <button onclick="prevGalleryImage(event)" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.6); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; justify-content: center; align-items: center; z-index: 10; transition: background 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.6)'">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button onclick="nextGalleryImage(event)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.6); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; display: flex; justify-content: center; align-items: center; z-index: 10; transition: background 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.6)'">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            ` : ''}
            
            <button onclick="toggleFullscreen(event)" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; border: none; width: 40px; height: 40px; border-radius: 6px; cursor: pointer; font-size: 1.2rem; display: flex; justify-content: center; align-items: center; z-index: 10; transition: background 0.3s;" onmouseover="this.style.background='rgba(0,0,0,0.9)'" onmouseout="this.style.background='rgba(0,0,0,0.6)'" title="Schermo Intero">
                <i class="fa-solid fa-expand"></i>
            </button>
        </div>
    `;
    
    document.getElementById('preview-modal').style.display = 'flex';
}

window.nextGalleryImage = function(e) {
    if (e) e.stopPropagation();
    currentGalleryIndex++;
    if (currentGalleryIndex >= galleryImages.length) {
        currentGalleryIndex = 0;
    }
    renderGalleryImage();
};

window.prevGalleryImage = function(e) {
    if (e) e.stopPropagation();
    currentGalleryIndex--;
    if (currentGalleryIndex < 0) {
        currentGalleryIndex = galleryImages.length - 1;
    }
    renderGalleryImage();
};

window.toggleFullscreen = function(e) {
    if (e) e.stopPropagation();
    const container = document.getElementById('gallery-container');
    if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
};

document.addEventListener('keydown', function(e) {
    if (document.getElementById('preview-modal').style.display === 'flex' && galleryImages.length > 1) {
        if (e.key === 'ArrowRight') {
            nextGalleryImage();
        } else if (e.key === 'ArrowLeft') {
            prevGalleryImage();
        }
    }
});

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov'].includes(ext)) return 'video';
    return 'default';
}

function getIconForType(type) {
    switch(type) {
        case 'pdf': return '<i class="fa-solid fa-file-pdf doc-icon icon-pdf"></i>';
        case 'word': return '<i class="fa-solid fa-file-word doc-icon icon-word"></i>';
        case 'image': return '<i class="fa-solid fa-file-image doc-icon icon-image"></i>';
        case 'video': return '<i class="fa-solid fa-file-video doc-icon icon-video"></i>';
        default: return '<i class="fa-solid fa-file doc-icon icon-default"></i>';
    }
}

window.adminTranslateDoc = async function(docId) {
    if (!currentImpiantoId) return;
    const doc = impiantiDocuments[currentImpiantoId].find(d => d.id === docId);
    if (!doc) return;

    const langStr = prompt(`Traduci il documento "${doc.name}"\nInserisci la lingua (es. en, it, fr) o lascia vuoto per annullare:`);
    if (!langStr) return;
    
    const lang = langStr.trim().toLowerCase();
    if (!['it', 'en', 'fr'].includes(lang)) {
        alert("Lingua non supportata. Inserisci 'it', 'en', o 'fr'.");
        return;
    }

    let geminiApiKey = localStorage.getItem('gemini_api_key');
    if (!geminiApiKey) {
        geminiApiKey = prompt("Inserisci la tua API Key di Gemini (verrà salvata nel browser):");
        if (geminiApiKey) {
            localStorage.setItem('gemini_api_key', geminiApiKey);
        } else {
            alert("Operazione annullata: API Key mancante.");
            return;
        }
    }

    const overlay = document.getElementById('upload-overlay');
    const progressFill = document.getElementById('upload-progress-fill');
    const progressText = document.getElementById('upload-progress-text');
    const fileNameEl = document.getElementById('upload-file-name');

    if (overlay) {
        overlay.classList.add('active');
        progressFill.style.width = '0%';
        progressText.textContent = 'Scaricamento file originale...';
        fileNameEl.textContent = `Traduzione di: ${doc.name} in ${lang.toUpperCase()}`;
    }

    try {
        let blob = null;
        let fetchError = null;

        // Metodo 1: Fetch diretto (funziona se Firebase CORS è configurato)
        try {
            const res = await fetch(doc.dataUrl);
            if (res.ok) blob = await res.blob();
            else throw new Error("Direct fetch failed");
        } catch (e) {
            fetchError = e;
        }

        // Metodo 2: Proxy AllOrigins
        if (!blob) {
            try {
                const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(doc.dataUrl);
                const res = await fetch(proxyUrl);
                if (res.ok) blob = await res.blob();
                else throw new Error("AllOrigins failed");
            } catch (e) {
                fetchError = e;
            }
        }

        // Metodo 3: Proxy CorsProxy.io
        if (!blob) {
            try {
                const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(doc.dataUrl);
                const res = await fetch(proxyUrl);
                if (res.ok) blob = await res.blob();
                else throw new Error("CorsProxy failed");
            } catch (e) {
                fetchError = e;
            }
        }

        let file;
        if (!blob) {
            file = await new Promise((resolve, reject) => {
                if (progressText) {
                    progressText.innerHTML = `
                        <div style="text-align:center;">
                            <p style="margin-bottom:15px; color:#f87171;"><i class="fa-solid fa-shield-halved"></i> Blocco di sicurezza (CORS) rilevato dal browser.</p>
                            <p style="margin-bottom:15px; font-size:0.9rem;">Il download automatico in background non è permesso.<br>Per tradurre, seleziona manualmente il file originale <b>${doc.name}</b> dal tuo PC:</p>
                            <button id="fallback-upload-btn" style="padding:10px 20px; background:#10b981; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Seleziona File Originale</button>
                            <button id="fallback-cancel-btn" style="margin-top:10px; padding:8px 15px; background:transparent; color:#94a3b8; border:1px solid #475569; border-radius:5px; cursor:pointer; display:block; margin-left:auto; margin-right:auto;">Annulla Operazione</button>
                            <input type="file" id="fallback-file-input" accept=".pdf,.doc,.docx" style="display:none;">
                        </div>
                    `;
                    
                    const btnUpload = document.getElementById('fallback-upload-btn');
                    const btnCancel = document.getElementById('fallback-cancel-btn');
                    const fileInput = document.getElementById('fallback-file-input');

                    btnUpload.onclick = () => fileInput.click();
                    btnCancel.onclick = () => reject(new Error("Operazione annullata dall'utente."));
                    
                    fileInput.onchange = e => {
                        if (e.target.files && e.target.files.length > 0) resolve(e.target.files[0]);
                        else reject(new Error("Nessun file selezionato."));
                    };
                } else {
                    reject(new Error("Impossibile caricare il fallback UI."));
                }
            });
        } else {
            file = new File([blob], doc.name, { type: blob.type || 'application/pdf' });
        }

        if (progressText) progressText.innerHTML = 'Inizio traduzione IA...';
        const resultFiles = await processPdfWithAI(file, geminiApiKey, (msg) => {
            if (progressText) progressText.textContent = msg;
        }, [lang]);

        if (progressText) progressText.textContent = 'Caricamento traduzione su Firebase...';
        
        let translatedFile = null;
        if (lang === 'it') translatedFile = resultFiles.fileIT;
        if (lang === 'en') translatedFile = resultFiles.fileEN;
        if (lang === 'fr') translatedFile = resultFiles.fileFR;

        if (translatedFile) {
            const transRes = await uploadSingleFileToFirebase(translatedFile);
            
            if (!doc.translations) doc.translations = {};
            doc.translations[lang] = transRes.downloadURL;
            doc.isAiTranslated = true;
            
            saveImpiantiDocuments();
            alert("Traduzione completata con successo!");
        } else {
            throw new Error("File tradotto non generato.");
        }
    } catch(err) {
        console.error("Errore traduzione", err);
        if (err.message.includes('API Gemini') || err.message.includes('Gemini API Error')) {
            if (err.message.toLowerCase().includes('high demand') || err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('rate limit')) {
                alert("❌ I server di Google Gemini sono temporaneamente sovraccarichi:\n\n" + err.message + "\n\nRiprova tra qualche minuto (la tua chiave API è corretta ed è stata mantenuta).");
            } else {
                localStorage.removeItem('gemini_api_key');
                alert("❌ Errore con l'API Key di Gemini: " + err.message + "\n\nLa chiave salvata è stata rimossa. Riprova a caricare il file per inserire una nuova chiave.");
            }
        } else {
            alert("❌ Errore traduzione " + doc.name + ": " + err.message);
        }
    } finally {
        if (overlay) overlay.classList.remove('active');
    }
}
