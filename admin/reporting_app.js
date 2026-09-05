// Stato dei documenti
let documents = {
    'green-enerbras': [],
    'tri-star': []
};

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    loadDocuments();
    setupDate();
    setupDragAndDrop('drop-zone-ge', 'file-input-ge', 'green-enerbras');
    setupDragAndDrop('drop-zone-ts', 'file-input-ts', 'tri-star');
});

function setupDate() {
    const today = new Date();
    document.getElementById('last-updated').textContent = today.toLocaleDateString('it-IT');
}

function toggleFolder(contentId) {
    const content = document.getElementById(contentId);
    content.classList.toggle('active');
    
    // Toggle chevron icon
    const icon = content.previousElementSibling.querySelector('.fa-chevron-down, .fa-chevron-up');
    if (content.classList.contains('active')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// Caricamento e Salvataggio Localforage (IndexedDB)
async function loadDocuments() {
    try {
        if (typeof firebase !== 'undefined' && firebase.database) {
            const snap = await firebase.database().ref('green_enerbras_reports').once('value');
            if (snap.exists()) {
                const data = snap.val() || {};
                
                const getArray = (val) => {
                    if (!val) return [];
                    if (Array.isArray(val)) return val;
                    return Object.values(val);
                };
                
                documents = {
                    'green-enerbras': getArray(data['green-enerbras']),
                    'tri-star': getArray(data['tri-star'])
                };
            }
        }
    } catch (e) {
        console.error("Errore nel caricamento dei documenti da Firebase", e);
    }
    renderTable('green-enerbras', 'table-ge');
    renderTable('tri-star', 'table-ts');
}

async function saveDocuments() {
    try {
        if (typeof firebase !== 'undefined' && firebase.database) {
            await firebase.database().ref('green_enerbras_reports').set(documents);
        }
    } catch (e) {
        console.error("Errore nel salvataggio su Firebase", e);
        alert("Errore durante il salvataggio dei documenti nel Cloud.");
    }
    renderTable('green-enerbras', 'table-ge');
    renderTable('tri-star', 'table-ts');
}

// Setup Drag & Drop
function setupDragAndDrop(zoneId, inputId, folderKey) {
    const dropZone = document.getElementById(zoneId);
    const fileInput = document.getElementById(inputId);
    if (!dropZone || !fileInput) return;

    // Click per aprire input
    // Già gestito dal pulsante Sfoglia, ma supportiamo il click sull'area
    dropZone.addEventListener('click', (e) => {
        if(e.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files, folderKey);
        fileInput.value = ''; // Reset
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
        handleFiles(e.dataTransfer.files, folderKey);
    });
}

async function handleFiles(fileList, folderKey) {
    if (!fileList || !fileList.length) return;
    
    if (typeof firebase === 'undefined' || !firebase.storage) {
        alert("Firebase non inizializzato correttamente. Riprova.");
        return;
    }
    
    const overlay = document.getElementById('upload-overlay');
    const progressFill = document.getElementById('upload-progress-fill');
    const progressText = document.getElementById('upload-progress-text');
    const fileNameEl = document.getElementById('upload-file-name');

    const files = Array.from(fileList);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (overlay) {
            overlay.classList.add('active');
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
            fileNameEl.textContent = `File ${i+1}/${files.length}: ${file.name}`;
        }
        
        try {
            let doc = {};
            const storageFolderPath = folderKey === 'tri-star' ? 'uploads/tristar/' : 'uploads/reporting/';
            
            const safeName = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const storageRef = firebase.storage().ref().child(storageFolderPath + safeName);
            
            const uploadTask = storageRef.put(file);
            
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if(progressFill) progressFill.style.width = progress + '%';
                    if(progressText) progressText.textContent = `Upload in corso: ${Math.round(progress)}%`;
                }
            );
            
            await uploadTask;
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            
            doc = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: formatBytes(file.size),
                type: getFileType(file.name),
                date: new Date().toLocaleDateString('it-IT'),
                visibleToUser: false,
                dataUrl: downloadURL,
                storagePath: storageFolderPath + safeName
            };
            
            documents[folderKey].push(doc);
            await saveDocuments();
        } catch(e) {
            console.error("Errore upload file su Firebase", e);
            alert("Errore durante il caricamento di " + file.name + "\n\nDettaglio: " + e.message);
        }
    }
    
    if (overlay) overlay.classList.remove('active');
}

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

function renderTable(folderKey, tableId) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const docs = documents[folderKey] || [];
    
    if (docs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Nessun documento caricato.</td></tr>';
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

            catDocs.forEach(doc => {
                const eyeClass = doc.visibleToUser ? 'btn-visible' : 'btn-hidden';
                const eyeTitle = doc.visibleToUser ? 'Visibile agli User' : 'Nascosto agli User';
                const eyeIcon = doc.visibleToUser ? 'fa-eye' : 'fa-eye-slash';

                let translationBtn = '';
                if (doc.type === 'pdf' || doc.type === 'word') {
                    translationBtn = `
                        <button class="btn-action" title="Traduci con IA (Es. per richieste pendenti)" onclick="adminTranslateDoc('${folderKey}', '${doc.id}')" style="color: #f59e0b;">
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
                tr.ondragstart = (e) => handleDragStart(e, folderKey, doc.id);
                tr.ondragover = (e) => handleDragOver(e);
                tr.ondragenter = (e) => e.preventDefault();
                tr.ondrop = (e) => handleDrop(e, folderKey, doc.id);
                tr.ondragend = (e) => handleDragEnd(e);
                
                tr.innerHTML = `
                    <td><i class="fa-solid fa-grip-vertical" style="color: #6b7280; margin-right: 10px; cursor: grab;" title="Trascina per riordinare"></i> ${getIconForType(doc.type)}</td>
                    <td>
                        <strong style="vertical-align: middle;">${doc.name}</strong> 
                    </td>
                    <td>${doc.date}</td>
                    <td>${doc.size}</td>
                    <td style="text-align: right;">
                        ${doc.isAiTranslated ? '<span style="font-size: 0.7rem; background: var(--accent-green); color: white; padding: 2px 5px; border-radius: 4px; margin-right: 5px; vertical-align: middle;">AI</span>' : ''}
                        ${translationLinks}
                        ${translationBtn}
                        <button class="btn-action" title="Leggi Documento (Preview)" onclick="openPreview('${doc.id}', '${folderKey}')" style="color: #10b981;">
                            <i class="fa-solid fa-book-open"></i>
                        </button>
                        <button class="btn-action" title="Rinomina Documento" onclick="renameDocument('${folderKey}', '${doc.id}')" style="color: #3b82f6;">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-action ${eyeClass}" title="${eyeTitle}" onclick="toggleVisibility('${folderKey}', '${doc.id}')">
                            <i class="fa-solid ${eyeIcon}"></i>
                        </button>
                        <button class="btn-action btn-delete" title="Elimina" onclick="deleteDocument('${folderKey}', '${doc.id}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    });
}

// ---- Drag & Drop Reordering ----
let dragSrcDocId = null;
let dragFolderKey = null;

window.handleDragStart = function(e, folderKey, docId) {
    dragSrcDocId = docId;
    dragFolderKey = folderKey;
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.4';
    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
};

window.handleDragOver = function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
};

window.handleDrop = function(e, folderKey, targetDocId) {
    e.stopPropagation();
    
    if (dragFolderKey === folderKey && dragSrcDocId !== targetDocId) {
        const docs = documents[folderKey];
        const srcIndex = docs.findIndex(d => d.id === dragSrcDocId);
        const targetIndex = docs.findIndex(d => d.id === targetDocId);
        
        if (srcIndex > -1 && targetIndex > -1) {
            const [movedDoc] = docs.splice(srcIndex, 1);
            docs.splice(targetIndex, 0, movedDoc);
            saveDocuments();
        }
    }
    return false;
};

window.handleDragEnd = function(e) {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.backgroundColor = '';
};

// Azioni
function toggleVisibility(folderKey, docId) {
    const doc = documents[folderKey].find(d => d.id === docId);
    if (doc) {
        doc.visibleToUser = !doc.visibleToUser;
        saveDocuments();
    }
}

function deleteDocument(folderKey, docId) {
    if (confirm("Sei sicuro di voler eliminare questo documento?")) {
        documents[folderKey] = documents[folderKey].filter(d => d.id !== docId);
        saveDocuments();
    }
}

function renameDocument(folderKey, docId) {
    const doc = documents[folderKey].find(d => d.id === docId);
    if (doc) {
        const newName = prompt("Inserisci il nuovo nome per il documento:", doc.name);
        if (newName !== null && newName.trim() !== "") {
            doc.name = newName.trim();
            saveDocuments();
        }
    }
}

function openPreview(docId, folderKey) {
    const doc = documents[folderKey].find(d => d.id === docId);
    if (!doc) return;

    document.getElementById('preview-title').innerHTML = `<i class="fa-solid fa-file"></i> Anteprima: ${doc.name}`;
    
    const previewContainer = document.getElementById('preview-content-container');
    
    let urlToUse = doc.dataUrl;
    const lang = localStorage.getItem('app_lang') || 'it';
    
    // Removed translation override: book icon should open original document
    
    if (urlToUse) {
        if (doc.type === 'pdf') {
            previewContainer.innerHTML = `<iframe src="${urlToUse}" style="width:100%; height:100%; border:none;"></iframe>`;
        } else if (doc.type === 'image') {
            previewContainer.innerHTML = `<img src="${urlToUse}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
        } else if (doc.type === 'video') {
            previewContainer.innerHTML = `<video src="${urlToUse}" controls style="max-width:100%; max-height:100%;"></video>`;
        } else {
            // Word or other format
            previewContainer.innerHTML = `
                <div style="text-align: center;">
                    <i class="fa-solid fa-file-word" style="font-size: 5rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h2>${doc.name}</h2>
                    <p style="color: var(--text-muted); margin-top: 1rem;">L'anteprima in-browser non è supportata per questo formato.<br>Clicca su "Scarica" per ottenere il file.</p>
                </div>
            `;
        }
    } else {
        previewContainer.innerHTML = `
            <div style="text-align: center;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 5rem; color: #f59e0b; margin-bottom: 1rem;"></i>
                <h2>File Non Trovato</h2>
                <p style="color: var(--text-muted); margin-top: 1rem;">Il contenuto di questo file non è stato salvato (potrebbe essere stato caricato prima dell'aggiornamento). Ricaricalo dall'Admin.</p>
            </div>
        `;
    }
    
    document.getElementById('preview-modal').style.display = 'flex';
}

window.adminTranslateDoc = async function(folderKey, docId) {
    if (!documents[folderKey]) return;
    const doc = documents[folderKey].find(d => d.id === docId);
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
            const storageFolderPath = folderKey === 'tri-star' ? 'uploads/tristar/' : 'uploads/reporting/';
            const transRes = await uploadSingleFileToFirebase(translatedFile, storageFolderPath);
            
            if (!doc.translations) doc.translations = {};
            doc.translations[lang] = transRes.downloadURL;
            doc.isAiTranslated = true;
            
            saveDocuments();
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
