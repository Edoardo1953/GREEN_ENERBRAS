// ============================================
// LOGICA TABS
// ============================================
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + tabId).classList.add('active');
    document.getElementById('btn-tab-' + tabId).classList.add('active');
}

window.allUsersData = {};

// RESTORE loadUsers
async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) {
        console.error("Tabella utenti non trovata!");
        return;
    }
    tbody.innerHTML = '';
    try {
        const usersObj = await Auth.getUsers();
        console.log("Dati utenti dal server:", usersObj);
        window.allUsersData = usersObj || {};
        
        if (usersObj) {
            // Convert object to array and sort by order
            const usersArray = Object.keys(usersObj).map(key => {
                let u = usersObj[key];
                if (typeof u !== 'object') u = {};
                return {
                    username: key,
                    ...u
                };
            });
            usersArray.sort((a, b) => (a.order || 0) - (b.order || 0));

            usersArray.forEach(user => {
                const username = user.username;
                const tr = document.createElement('tr');
                tr.dataset.username = username;
                if (user.role === 'admin') tr.classList.add('disabled-drag');
                
                let actionButtons = '';
                let dragHandle = '';
                if (user.role !== 'admin') {
                    actionButtons = '<button onclick="editUser(&quot;' + username + '&quot;)" style="background:#f59e0b; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-right: 5px;" title="Modifica"><i class="fa-solid fa-pen"></i></button>' +
                                    '<button onclick="deleteUser(&quot;' + username + '&quot;)" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Elimina"><i class="fa-solid fa-trash"></i></button>';
                    dragHandle = '<i class="fa-solid fa-grip-vertical drag-handle" style="cursor: grab; color: var(--text-muted); font-size: 1.2rem;"></i>';
                } else {
                    actionButtons = '<button onclick="editUser(&quot;' + username + '&quot;)" style="background:#f59e0b; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;" title="Modifica"><i class="fa-solid fa-pen"></i></button>';
                }

                tr.innerHTML = '<td>' + dragHandle + '</td>' +
                               '<td>' + username + '</td>' +
                               '<td>' + (user.password || '') + '</td>' +
                               '<td><span class="badge ' + (user.role === 'admin' ? 'badge-gp' : 'badge-lp') + '">' + (user.role || 'user') + '</span></td>' +
                               '<td>' + (user.partnerName || '-') + '</td>' +
                               '<td>' + actionButtons + '</td>';
                tbody.appendChild(tr);
            });
        } else {
            console.warn("Nessun utente restituito dal server o utente non autorizzato.");
        }
    } catch (e) {
        console.error("Errore durante loadUsers:", e);
        alert("Si è verificato un errore nel caricamento degli utenti: " + e.message);
    }
}

window.deleteUser = async function(username) {
    if (confirm('Sei sicuro di voler eliminare ' + username + '?')) {
        await Auth.deleteUser(username);
        await loadUsers();
    }
}

window.editUser = function(username) {
    const user = window.allUsersData[username];
    if (!user) return;

    document.getElementById('form-username').value = username;
    document.getElementById('form-password').value = user.password || '';
    document.getElementById('form-role').value = user.role || 'partner';
    
    document.getElementById('user-form').dataset.originalUsername = username;
    const formTitle = document.getElementById('form-title');
    if (formTitle) formTitle.textContent = "Modifica Utente: " + username;

    // trigger change event to show/hide partner select
    document.getElementById('form-role').dispatchEvent(new Event('change'));

    if (user.role === 'partner' && user.partnerName) {
        document.getElementById('form-partner').value = user.partnerName;
    }
    
    // Scroll to form
    if (formTitle) formTitle.scrollIntoView({ behavior: 'smooth' });
}


document.addEventListener('DOMContentLoaded', async () => {
    
    // ============================================
    // LOGICA GESTIONE UTENTI (Ereditata)
    // ============================================
    if(Auth.currentUser) {
        document.getElementById('current-username').textContent = Auth.currentUser.id;
    }

    const partnerSelect = document.getElementById('form-partner');
    if (typeof APP_DATA !== 'undefined' && APP_DATA.partners) {
        APP_DATA.partners.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            opt.textContent = p.name;
            partnerSelect.appendChild(opt);
        });
    }

    const roleSelect = document.getElementById('form-role');
    const partnerContainer = document.getElementById('partner-select-container');
    
    if(roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            if (e.target.value === 'partner') {
                partnerContainer.style.display = 'block';
                partnerSelect.required = true;
            } else {
                partnerContainer.style.display = 'none';
                partnerSelect.required = false;
                partnerSelect.value = '';
            }
        });
    }

    await loadUsers();

    const tbody = document.getElementById('users-table-body');
    if(tbody && typeof Sortable !== 'undefined') {
        new Sortable(tbody, {
            animation: 150,
            handle: '.drag-handle',
            filter: '.disabled-drag, button',
            preventOnFilter: false,
            onMove: function (evt) {
                if (evt.related && evt.related.classList.contains('disabled-drag')) {
                    return false;
                }
            },
            onEnd: async function (evt) {
                const rows = tbody.querySelectorAll('tr');
                const updates = {};
                rows.forEach((row, index) => {
                    const username = row.dataset.username;
                    updates['users/' + username + '/order'] = index;
                });
                try {
                    await firebase.database().ref().update(updates);
                } catch (err) {
                    console.error("Errore salvataggio ordine", err);
                    alert("Errore salvataggio ordine: " + err.message);
                }
            }
        });
    }

    const userForm = document.getElementById('user-form');
    if(userForm) {
        userForm.addEventListener('reset', () => {
            delete userForm.dataset.originalUsername;
            const formTitle = document.getElementById('form-title');
            if (formTitle) formTitle.textContent = "Aggiungi / Modifica Utente";
        });

        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('form-username').value.trim();
            const password = document.getElementById('form-password').value.trim();
            const role = document.getElementById('form-role').value;
            const partnerName = role === 'partner' ? document.getElementById('form-partner').value : null;

            const originalUsername = userForm.dataset.originalUsername;

            const data = { password, role };
            if (partnerName) data.partnerName = partnerName;

            const rows = tbody ? tbody.querySelectorAll('tr') : [];
            if (originalUsername && window.allUsersData[originalUsername]) {
                data.order = window.allUsersData[originalUsername].order || rows.length;
            } else {
                data.order = rows.length;
            }

            try {
                if (originalUsername && originalUsername !== username) {
                    await Auth.deleteUser(originalUsername);
                }
                await Auth.saveUser(username, data);
                alert("Utente salvato con successo!");
                userForm.reset();
                if(roleSelect) roleSelect.dispatchEvent(new Event('change'));
                await loadUsers();
            } catch (err) {
                alert("Errore salvataggio utente: " + err.message);
            }
        });
    }


    // ============================================
    // LOGICA GESTIONE SLIDESHOW
    // ============================================
    const slidesContainer = document.getElementById('slides-container');
    const dbSlideshowRef = firebase.database().ref('settings/slideshow');

    let slideshowConfig = {
        interval: 5000,
        slides: [
            { imageUrl: '../uploads/slide1.jpg', texts: [] },
            { imageUrl: '../uploads/slide2.jpg', texts: [] },
            { imageUrl: '../uploads/slide3.jpg', texts: [] }
        ]
    };

    function compressImageFile(file, maxWidth = 1920, quality = 0.82) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Load da Firebase
    dbSlideshowRef.once('value').then(snap => {
        if(snap.exists()) {
            slideshowConfig = snap.val();
            try { localStorage.setItem('green_enerbras_slideshow_config', JSON.stringify(slideshowConfig)); } catch(e) {}
        }
        document.getElementById('slideshow-interval').value = slideshowConfig.interval || 5000;
        renderSlidesEditors();
    });

    function renderSlidesEditors() {
        slidesContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            if(!slideshowConfig.slides[i]) {
                slideshowConfig.slides[i] = { imageUrl: '../uploads/slide' + (i+1) + '.jpg', texts: [] };
            }
            if (!slideshowConfig.slides[i].imageUrl || slideshowConfig.slides[i].imageUrl.trim() === '') {
                slideshowConfig.slides[i].imageUrl = '../uploads/slide' + (i+1) + '.jpg';
            }
            createSlideEditor(i, slideshowConfig.slides[i]);
        }
    }

    function createSlideEditor(index, slideData) {
        const slideId = 'slide-' + index;
        const wrapper = document.createElement('div');
        wrapper.className = 'slide-editor';
        wrapper.innerHTML = 
            '<div class="slide-preview-container" id="preview-' + slideId + '">' +
                '<img id="img-' + slideId + '" class="slide-preview-img" src="' + (slideData.imageUrl || '') + '" alt="Nessuna Immagine">' +
                '<!-- I testi verranno aggiunti qui -->' +
            '</div>' +
            
            '<div class="slide-controls">' +
                '<h3>Slide ' + (index + 1) + '</h3>' +
                
                '<div>' +
                    '<label style="color:var(--text-muted); font-size: 0.9rem;" data-i18n="lbl_carica_immagine">Carica Nuova Immagine (Consigliato < 1MB):</label>' +
                    '<input type="file" id="file-' + slideId + '" accept="image/*" style="width: 100%; margin-top: 5px; color: white;">' +
                '</div>' +
                
                '<hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">' +
                
                '<button class="btn-add-text" id="add-text-' + slideId + '"><i class="fa-solid fa-font"></i> <span data-i18n="btn_aggiungi_scritta">Aggiungi Scritta sulla Foto</span></button>' +
                
                '<div id="texts-list-' + slideId + '" style="margin-top: 10px; display: flex; flex-direction: column; gap: 5px;"></div>' +
            '</div>';
            
        slidesContainer.appendChild(wrapper);

        const previewContainer = document.getElementById('preview-' + slideId);
        const fileInput = document.getElementById('file-' + slideId);
        const addTextBtn = document.getElementById('add-text-' + slideId);
        const imgElement = document.getElementById('img-' + slideId);

        // Handle Image Upload with Auto-compression to JPEG Full-HD
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(file) {
                try {
                    imgElement.style.opacity = '0.5';
                    const compressed = await compressImageFile(file, 1920, 0.82);
                    imgElement.src = compressed;
                    imgElement.style.opacity = '1';
                    slideData.imageUrl = compressed; // update data
                } catch(err) {
                    console.error("Errore compressione immagine:", err);
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        imgElement.src = ev.target.result;
                        imgElement.style.opacity = '1';
                        slideData.imageUrl = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            }
        });

        // Add Text logic
        addTextBtn.addEventListener('click', () => {
            const newTextData = { content: 'Nuovo Testo', content_en: '', content_fr: '', x: 50, y: 50 }; // default center
            if(!slideData.texts) slideData.texts = [];
            slideData.texts.push(newTextData);
            renderTextOnPreview(newTextData, slideData.texts.length - 1, previewContainer, slideData);
            renderTextListRow(newTextData, slideData.texts.length - 1, slideId, slideData, previewContainer);
        });

        // Render existing texts
        if(slideData.texts && slideData.texts.length > 0) {
            slideData.texts.forEach((textObj, tIndex) => {
                renderTextOnPreview(textObj, tIndex, previewContainer, slideData);
                renderTextListRow(textObj, tIndex, slideId, slideData, previewContainer);
            });
        }
    }

    function renderTextOnPreview(textObj, tIndex, previewContainer, slideData) {
        const textDiv = document.createElement('div');
        textDiv.className = 'draggable-text';
        textDiv.textContent = textObj.content;
        textDiv.style.left = textObj.x + '%';
        textDiv.style.top = textObj.y + '%';
        textDiv.style.transform = 'translate(-50%, -50%)'; // center exactly on coordinates
        textDiv.dataset.tIndex = tIndex;

        // Make it draggable
        let isDragging = false;
        textDiv.addEventListener('mousedown', (e) => {
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if(isDragging) {
                const rect = previewContainer.getBoundingClientRect();
                let clientX = e.clientX;
                let clientY = e.clientY;
                
                // Calculate percentage
                let xPercent = ((clientX - rect.left) / rect.width) * 100;
                let yPercent = ((clientY - rect.top) / rect.height) * 100;
                
                // Bounds
                if(xPercent < 0) xPercent = 0; if(xPercent > 100) xPercent = 100;
                if(yPercent < 0) yPercent = 0; if(yPercent > 100) yPercent = 100;

                textDiv.style.left = xPercent + '%';
                textDiv.style.top = yPercent + '%';
                
                // Save back to data
                textObj.x = xPercent;
                textObj.y = yPercent;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        previewContainer.appendChild(textDiv);
    }

    
    async function autoTranslate(text) {
        if (!text) return { en: '', fr: '' };
        try {
            const resEn = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=en&dt=t&q=${encodeURIComponent(text)}`);
            const dataEn = await resEn.json();
            const enText = dataEn[0].map(x => x[0]).join('');

            const resFr = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=fr&dt=t&q=${encodeURIComponent(text)}`);
            const dataFr = await resFr.json();
            const frText = dataFr[0].map(x => x[0]).join('');

            return { en: enText, fr: frText };
        } catch (e) {
            console.error("Auto-translate error:", e);
            return null;
        }
    }

    function renderTextListRow(textObj, tIndex, slideId, slideData, previewContainer) {
        const listContainer = document.getElementById('texts-list-' + slideId);
        const row = document.createElement('div');
        row.className = 'text-input-row';
        row.innerHTML = 
            '<label>IT:</label> <input type="text" value="' + (textObj.content || '') + '" id="input-' + slideId + '-' + tIndex + '" style="width:100px;">' +
            '<label>EN:</label> <input type="text" value="' + (textObj.content_en || '') + '" id="input-en-' + slideId + '-' + tIndex + '" style="width:100px;">' +
            '<label>FR:</label> <input type="text" value="' + (textObj.content_fr || '') + '" id="input-fr-' + slideId + '-' + tIndex + '" style="width:100px;">' +
            '<button id="del-' + slideId + '-' + tIndex + '"><span data-i18n="btn_rimuovi">Rimuovi</span></button>';
        
        listContainer.appendChild(row);
        if(typeof applyTranslations === 'function') applyTranslations();

        const input = document.getElementById('input-' + slideId + '-' + tIndex);
        input.addEventListener('input', (e) => {
            textObj.content = e.target.value;
            // Update preview text
            const previewTextDiv = previewContainer.querySelector('.draggable-text[data-t-index="' + tIndex + '"]');
            if(previewTextDiv) previewTextDiv.textContent = e.target.value;
        });

        input.addEventListener('change', async (e) => {
            const val = e.target.value;
            if(val) {
                const translations = await autoTranslate(val);
                if(translations) {
                    const inputEn = document.getElementById('input-en-' + slideId + '-' + tIndex);
                    const inputFr = document.getElementById('input-fr-' + slideId + '-' + tIndex);
                    inputEn.value = translations.en;
                    textObj.content_en = translations.en;
                    inputFr.value = translations.fr;
                    textObj.content_fr = translations.fr;
                }
            }
        });

        const inputEn = document.getElementById('input-en-' + slideId + '-' + tIndex);
        inputEn.addEventListener('input', (e) => { textObj.content_en = e.target.value; });

        const inputFr = document.getElementById('input-fr-' + slideId + '-' + tIndex);
        inputFr.addEventListener('input', (e) => { textObj.content_fr = e.target.value; });

        const delBtn = document.getElementById('del-' + slideId + '-' + tIndex);
        delBtn.addEventListener('click', () => {
            slideData.texts.splice(tIndex, 1);
            // Re-render everything for this slide to fix indices
            previewContainer.innerHTML = '<img class="slide-preview-img" src="' + slideData.imageUrl + '" alt="Nessuna Immagine">';
            listContainer.innerHTML = '';
            if(slideData.texts) {
                slideData.texts.forEach((tObj, nIndex) => {
                    renderTextOnPreview(tObj, nIndex, previewContainer, slideData);
                    renderTextListRow(tObj, nIndex, slideId, slideData, previewContainer);
                });
            }
        });

        if(textObj.content && (!textObj.content_en || !textObj.content_fr)) {
            autoTranslate(textObj.content).then(translations => {
                if(translations) {
                    const inpEn = document.getElementById('input-en-' + slideId + '-' + tIndex);
                    const inpFr = document.getElementById('input-fr-' + slideId + '-' + tIndex);
                    if(inpEn && !inpEn.value) { inpEn.value = translations.en; textObj.content_en = translations.en; }
                    if(inpFr && !inpFr.value) { inpFr.value = translations.fr; textObj.content_fr = translations.fr; }
                }
            });
        }
    }


    // Save All Data to Firebase & Local Storage
    document.getElementById('btn-save-slideshow').addEventListener('click', async () => {
        const interval = document.getElementById('slideshow-interval').value;
        slideshowConfig.interval = parseInt(interval) || 5000;
        
        const btn = document.getElementById('btn-save-slideshow');
        btn.textContent = "Salvataggio...";
        
        // 1. Salva SEMPRE in locale per rendere subito attivi timing e testi su questo browser
        try { 
            localStorage.setItem('green_enerbras_slideshow_config', JSON.stringify(slideshowConfig)); 
        } catch(e) {
            console.warn("Errore salvataggio localStorage:", e);
        }

        // 2. Tenta il salvataggio su Firebase Cloud Database
        try {
            if (dbSlideshowRef) {
                await dbSlideshowRef.set(slideshowConfig);
                alert("Configurazione salvata con successo sia in locale che sul database cloud!");
            } else {
                alert("Configurazione salvata in locale con successo!");
            }
        } catch(e) {
            console.warn("Avviso sincronizzazione Firebase:", e);
            if (e.message && e.message.includes('PERMISSION_DENIED')) {
                alert("Configurazione salvata e attiva con successo!\n\n(I testi e i tempi sono stati applicati localmente. Per sincronizzarli anche con gli altri utenti sul cloud, le regole di Firebase Realtime Database richiedono il permesso di scrittura sul nodo 'settings/slideshow'.)");
            } else {
                alert("Configurazione salvata localmente!\n(Nota cloud: " + e.message + ")");
            }
        } finally {
            btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salva Configurazione su Database';
        }
    });

});
