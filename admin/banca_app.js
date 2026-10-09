document.addEventListener('DOMContentLoaded', () => {
    if (typeof APP_DATA === 'undefined') {
        console.error("Dati non trovati. Esegui update_data.ps1 per generare data.js");
        return;
    }

    const formatCurrency = (num) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(num);

    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl && APP_DATA.lastUpdated) {
        lastUpdatedEl.textContent = APP_DATA.lastUpdated;
    }

    // 1. Calculate Bank Balances
    let currentBalance = 0;
    let generalExpenses = 0;
    let participationFees = 0;
    let lastDate = '';
    
    if (APP_DATA.transactions && APP_DATA.transactions.length > 0) {
        const lastTx = APP_DATA.transactions[APP_DATA.transactions.length - 1];
        if (lastTx && lastTx.date) lastDate = lastTx.date;

        APP_DATA.transactions.forEach(t => {
            currentBalance += t.amount;
            
            const catLower = (t.category || '').toLowerCase();
            const isExpense = ['frais', 'fee', 'cost', 'spes', 'altro', 'other', 'tax', 'impost', 'commission'].some(k => catLower.includes(k));
            
            if (isExpense) {
                if (catLower.includes('entry fee') || catLower.includes('participation fee')) {
                    participationFees += t.amount;
                } else {
                    generalExpenses += t.amount;
                }
            }
        });
    }

    // 2. Popola KPIs
    const balanceKpi = document.getElementById('kpi-balance');
    if(balanceKpi) {
        balanceKpi.textContent = formatCurrency(currentBalance);
        if(currentBalance < 0) {
            balanceKpi.classList.remove('text-green');
            balanceKpi.style.color = '#ef4444';
        }
    }

    const lastDateKpi = document.getElementById('kpi-last-date');
    if (lastDateKpi && lastDate) lastDateKpi.innerHTML = `<span data-i18n="text_al">al:</span> ${lastDate}`;
    
    const generalExpensesKpi = document.getElementById('kpi-general-expenses');
    if(generalExpensesKpi) generalExpensesKpi.textContent = formatCurrency(generalExpenses);

    const participationFeesKpi = document.getElementById('kpi-participation-fees');
    if(participationFeesKpi) participationFeesKpi.textContent = formatCurrency(participationFees);

    // =============================================================================
    // GESTIONE GIUSTIFICATIVI BANCARI (uploads/Bank Giustificativi)
    // =============================================================================

    const BANK_DOCS_STORAGE_KEY = 'green_enerbras_bank_docs';
    window.bankDocsCache = {};

    function getBankDocsStorage() {
        try {
            const raw = localStorage.getItem(BANK_DOCS_STORAGE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            Object.values(parsed).forEach(docList => {
                if (Array.isArray(docList)) {
                    docList.forEach(d => {
                        if (d && d.id) window.bankDocsCache[d.id] = d;
                    });
                }
            });
            return parsed;
        } catch (e) {
            console.error("Errore lettura storage giustificativi bancari:", e);
            return {};
        }
    }

    function saveBankDocsStorage(data) {
        try {
            localStorage.setItem(BANK_DOCS_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Errore scrittura storage giustificativi bancari:", e);
            alert("Attenzione: Spazio di memoria locale esaurito per i file allegati.");
        }
    }

    function getDocsForBankTx(txId) {
        const storage = getBankDocsStorage();
        return storage[txId] || [];
    }

    async function saveBankDocToStorage(docRecord) {
        const storage = getBankDocsStorage();
        if (!storage[docRecord.txId]) {
            storage[docRecord.txId] = [];
        }
        storage[docRecord.txId].push(docRecord);
        window.bankDocsCache[docRecord.id] = docRecord;
        saveBankDocsStorage(storage);
    }

    async function deleteBankDocFromStorage(docId) {
        const storage = getBankDocsStorage();
        let found = false;
        for (const txId in storage) {
            const beforeLen = storage[txId].length;
            storage[txId] = storage[txId].filter(d => d.id !== docId);
            if (storage[txId].length !== beforeLen) {
                found = true;
                if (storage[txId].length === 0) {
                    delete storage[txId];
                }
                break;
            }
        }
        if (found) {
            delete window.bankDocsCache[docId];
            saveBankDocsStorage(storage);
        }
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

    function escapeQuotes(str) {
        if (!str) return '';
        return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
    }

    let currentBankDocContext = {
        txId: null,
        date: '',
        amount: 0,
        partner: '',
        description: '',
        category: ''
    };

    window.openBankDocsModal = function(txId, date, amount, partner, description, category) {
        currentBankDocContext = {
            txId: txId,
            date: date,
            amount: Number(amount) || 0,
            partner: partner || '',
            description: description || '',
            category: category || ''
        };

        const modal = document.getElementById('bank-docs-modal');
        if (!modal) return;

        const subTitleEl = document.getElementById('bank-docs-modal-subtitle');
        if (subTitleEl) {
            const partnerOrDesc = partner || description || category || 'Operazione';
            subTitleEl.textContent = `${date} • ${formatCurrency(currentBankDocContext.amount)} • ${partnerOrDesc}`;
        }

        const cleanFolder = (partner || category || 'Operazioni_Bancarie').replace(/[\\/:*?"<>|]/g, '_').trim();
        const folderEl = document.getElementById('bank-docs-folder-indicator');
        if (folderEl) {
            folderEl.textContent = `uploads/Bank Giustificativi/${cleanFolder}/`;
        }

        renderBankDocsList();
        modal.style.display = 'flex';
    };

    window.closeBankDocsModal = function() {
        const modal = document.getElementById('bank-docs-modal');
        if (modal) modal.style.display = 'none';
    };

    function renderBankDocsList() {
        const container = document.getElementById('bank-docs-list-container');
        const counterBadge = document.getElementById('bank-docs-counter-badge');
        const dropzone = document.getElementById('bank-docs-dropzone');
        if (!container) return;

        const docs = getDocsForBankTx(currentBankDocContext.txId);

        if (counterBadge) {
            counterBadge.textContent = `${docs.length} / 5 doc`;
            counterBadge.style.background = docs.length >= 5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.08)';
            counterBadge.style.color = docs.length >= 5 ? '#ef4444' : 'var(--text-main)';
        }

        if (dropzone) {
            if (docs.length >= 5) {
                dropzone.style.opacity = '0.5';
                dropzone.style.pointerEvents = 'none';
            } else {
                dropzone.style.opacity = '1';
                dropzone.style.pointerEvents = 'auto';
            }
        }

        if (docs.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px dashed var(--border-color, rgba(255,255,255,0.1));">
                    <i class="fa-solid fa-file-circle-xmark" style="font-size: 1.8rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
                    ${typeof t === 'function' ? t('docs_empty', 'Nessun giustificativo bancario allegato per questa operazione.') : 'Nessun giustificativo bancario allegato per questa operazione.'}
                </div>
            `;
            return;
        }

        let html = '';
        docs.forEach(doc => {
            let sizeStr = '';
            if (doc.fileSize) {
                if (doc.fileSize > 1024 * 1024) sizeStr = (doc.fileSize / (1024 * 1024)).toFixed(2) + ' MB';
                else sizeStr = (doc.fileSize / 1024).toFixed(1) + ' KB';
            }

            let iconClass = 'fa-file-pdf text-emerald';
            const nameLower = (doc.fileName || '').toLowerCase();
            if (nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.webp')) {
                iconClass = 'fa-file-image text-blue';
            } else if (nameLower.endsWith('.xls') || nameLower.endsWith('.xlsx')) {
                iconClass = 'fa-file-excel text-emerald';
            } else if (nameLower.endsWith('.doc') || nameLower.endsWith('.docx')) {
                iconClass = 'fa-file-word text-blue';
            }

            const previewLabel = typeof t === 'function' ? t('docs_action_preview', 'Apri / Leggi') : 'Apri / Leggi';
            const downloadLabel = typeof t === 'function' ? t('docs_action_download', 'Scarica') : 'Scarica';
            const deleteLabel = typeof t === 'function' ? t('docs_action_delete', 'Elimina') : 'Elimina';

            html += `
                <div class="bank-doc-card">
                    <div class="bank-doc-info">
                        <div class="bank-doc-icon">
                            <i class="fa-solid ${iconClass}" style="color: #10b981;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 700; color: var(--text-main); font-size: 0.9rem; word-break: break-all;">
                                ${escapeHtml(doc.fileName)}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; gap: 0.6rem; margin-top: 0.2rem; flex-wrap: wrap;">
                                <span><i class="fa-solid fa-folder text-emerald" style="color: #10b981;"></i> ${escapeHtml(doc.folderPath || 'uploads/Bank Giustificativi/')}</span>
                                <span>•</span>
                                <span>${sizeStr || 'File'}</span>
                                <span>•</span>
                                <span>${doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : ''}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bank-doc-actions">
                        <button class="btn btn-secondary btn-sm" onclick="previewBankDoc('${doc.id}')" title="${previewLabel}">
                            <i class="fa-solid fa-eye text-emerald" style="color: #10b981;"></i> <span>${previewLabel}</span>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="downloadBankDoc('${doc.id}')" title="${downloadLabel}">
                            <i class="fa-solid fa-download"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);" onclick="deleteBankDoc('${doc.id}')" title="${deleteLabel}">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    window.triggerBankDocFileInput = function() {
        const input = document.getElementById('bank-doc-file-input');
        if (input) input.click();
    };

    window.handleBankDocFileSelect = function(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        processBankDocFiles(Array.from(files));
        event.target.value = '';
    };

    async function processBankDocFiles(files) {
        let existingDocs = getDocsForBankTx(currentBankDocContext.txId);
        const availableSlots = 5 - existingDocs.length;
        if (availableSlots <= 0) {
            alert(typeof t === 'function' ? t('docs_max_warning', 'Puoi allegare fino a un massimo di 5 documenti per ciascuna operazione bancaria.') : 'Puoi allegare fino a un massimo di 5 documenti.');
            return;
        }

        const filesToUpload = files.slice(0, availableSlots);
        const cleanFolder = (currentBankDocContext.partner || currentBankDocContext.category || 'Operazioni_Bancarie').replace(/[\\/:*?"<>|]/g, '_').trim();

        for (const file of filesToUpload) {
            try {
                const base64 = await readFileAsDataURL(file);
                const docId = 'BANK-DOC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

                const docRecord = {
                    id: docId,
                    txId: currentBankDocContext.txId,
                    partnerName: currentBankDocContext.partner || currentBankDocContext.category || 'Operazione',
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type || 'application/pdf',
                    uploadDate: new Date().toISOString(),
                    dataUrl: base64,
                    folderPath: `uploads/Bank Giustificativi/${cleanFolder}/${file.name}`
                };

                await saveBankDocToStorage(docRecord);
            } catch (e) {
                console.error('Errore lettura file bancario:', e);
            }
        }

        renderBankDocsList();
        if (typeof window.refreshBankTable === 'function') {
            window.refreshBankTable();
        }
    }

    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }

    window.previewBankDoc = function(docId) {
        const doc = window.bankDocsCache[docId];
        if (!doc) return;

        const modal = document.getElementById('bank-doc-viewer-modal');
        const titleEl = document.getElementById('bank-viewer-doc-title');
        const subtitleEl = document.getElementById('bank-viewer-doc-subtitle');
        const bodyEl = document.getElementById('bank-doc-viewer-body');
        const downloadBtn = document.getElementById('bank-viewer-download-btn');

        if (!modal || !bodyEl) return;

        if (titleEl) titleEl.textContent = doc.fileName;
        if (subtitleEl) subtitleEl.textContent = doc.folderPath || `uploads/Bank Giustificativi/${doc.fileName}`;

        if (downloadBtn) {
            downloadBtn.onclick = () => downloadBankDoc(doc.id);
        }

        const nameLower = (doc.fileName || '').toLowerCase();
        const isImage = nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.webp');
        const isPdf = nameLower.endsWith('.pdf') || (doc.fileType && doc.fileType.includes('pdf'));

        if (isImage) {
            bodyEl.innerHTML = `<img src="${doc.dataUrl}" alt="${escapeHtml(doc.fileName)}" style="max-width: 95%; max-height: 95%; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">`;
        } else if (isPdf) {
            bodyEl.innerHTML = `<iframe src="${doc.dataUrl}" style="width: 100%; height: 100%; border: none;"></iframe>`;
        } else {
            bodyEl.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-main);">
                    <i class="fa-solid fa-file-lines text-emerald" style="font-size: 3.5rem; margin-bottom: 1rem; display: block; color: #10b981;"></i>
                    <h3 style="margin-bottom: 0.5rem;">${escapeHtml(doc.fileName)}</h3>
                    <p style="color: var(--text-muted); max-width: 450px; margin: 0 auto 1.5rem auto; font-size: 0.85rem;">
                        ${typeof t === 'function' ? t('docs_preview_error', 'Impossibile visualizzare l\'anteprima diretta per questo formato. Clicca su Scarica per aprirlo sul tuo dispositivo.') : 'Impossibile visualizzare l\'anteprima diretta. Clicca su Scarica.'}
                    </p>
                    <button class="btn btn-primary" onclick="downloadBankDoc('${doc.id}')">
                        <i class="fa-solid fa-download"></i> ${typeof t === 'function' ? t('docs_action_download', 'Scarica') : 'Scarica'}
                    </button>
                </div>
            `;
        }

        modal.style.display = 'flex';
    };

    window.closeBankDocViewerModal = function() {
        const modal = document.getElementById('bank-doc-viewer-modal');
        if (modal) modal.style.display = 'none';
        const bodyEl = document.getElementById('bank-doc-viewer-body');
        if (bodyEl) bodyEl.innerHTML = '';
    };

    window.downloadBankDoc = function(docId) {
        const doc = window.bankDocsCache[docId];
        if (!doc) return;
        const a = document.createElement('a');
        a.href = doc.dataUrl;
        a.download = doc.fileName || 'giustificativo_bancario.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    window.deleteBankDoc = async function(docId) {
        const msg = typeof t === 'function' ? t('docs_confirm_delete', 'Sei sicuro di voler eliminare questo documento bancario?') : 'Sei sicuro di voler eliminare questo documento?';
        if (!confirm(msg)) return;

        await deleteBankDocFromStorage(docId);
        renderBankDocsList();
        if (typeof window.refreshBankTable === 'function') {
            window.refreshBankTable();
        }
    };

    function setupBankDropzone() {
        const dropzone = document.getElementById('bank-docs-dropzone');
        if (!dropzone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, () => dropzone.classList.remove('dragover'), false);
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                processBankDocFiles(Array.from(files));
            }
        });
    }

    // 3. Popola Tabella Bank Movements
    const bankTableBody = document.getElementById('bank-table-body');
    if (bankTableBody && APP_DATA.transactions) {
        
        // Pre-calculate progressive
        let runningBalance = 0;
        APP_DATA.transactions.forEach((t, idx) => {
            runningBalance += t.amount;
            t.actualProgressive = runningBalance;
            if (!t.id) {
                t.id = 'TX-' + (t.date || '').replace(/[\/\-]/g, '') + '-' + Math.abs(t.amount || 0).toFixed(0) + '-' + idx;
            }
        });

        const renderTable = () => {
            bankTableBody.innerHTML = '';
            
            const filterYear = document.getElementById('filter-year')?.value || '';
            const filterMonth = document.getElementById('filter-month')?.value || '';
            const filterCat = Array.from(document.querySelectorAll('#ms-category .multiselect-checkbox:checked')).map(cb => cb.value.toLowerCase());
            const filterDesc = (document.getElementById('filter-desc')?.value || '').toLowerCase();
            const filterPartner = Array.from(document.querySelectorAll('#ms-partner .multiselect-checkbox:checked')).map(cb => cb.value.toLowerCase());
            
            const isFiltered = filterYear !== '' || filterMonth !== '' || filterCat.length > 0 || filterDesc !== '' || filterPartner.length > 0;
            const colProgressivo = document.getElementById('col-progressivo');
            if (colProgressivo) {
                colProgressivo.style.display = isFiltered ? 'none' : 'table-cell';
            }
            
            let subtotal = 0;
            window.currentFilteredData = []; // Store filtered data for export
            const filteredTransactions = window.currentFilteredData;
            
            APP_DATA.transactions.forEach((t, idx) => {
                if (filterYear || filterMonth) {
                    if (!t.date) return;
                    const parts = t.date.split('/');
                    if (parts.length === 3) {
                        if (filterYear && parts[2] !== filterYear) return;
                        if (filterMonth && parts[1] !== filterMonth) return;
                    } else {
                        return;
                    }
                }
                if (filterCat.length > 0 && !filterCat.includes(t.category.toLowerCase())) return;
                if (filterDesc && !t.description.toLowerCase().includes(filterDesc)) return;
                const p = (t.partner || '').toLowerCase();
                if (filterPartner.length > 0 && !filterPartner.includes(p)) return;
                
                filteredTransactions.push(t);
                subtotal += t.amount;
                
                const tr = document.createElement('tr');
                const isNegative = t.amount < 0;
                const amountColor = isNegative ? '#ef4444' : '#10b981';
                const progressiveColor = t.actualProgressive < 0 ? '#ef4444' : '#3b82f6';
                const relatedEntity = t.partner;

                const txId = t.id || ('TX-' + (t.date || '').replace(/[\/\-]/g, '') + '-' + Math.abs(t.amount || 0).toFixed(0) + '-' + idx);
                const docs = getDocsForBankTx(txId);
                const dCount = docs.length;
                const dStyle = dCount > 0
                    ? 'background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);'
                    : 'background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid var(--border-color, rgba(255,255,255,0.1));';
                const dText = dCount > 0 ? `${dCount} ${typeof t_i18n === 'function' ? t_i18n('btn_docs_attached', 'Doc') : (typeof t === 'function' ? t('btn_docs_attached', 'Doc') : 'Doc')}` : `+ ${typeof t_i18n === 'function' ? t_i18n('btn_add_doc', 'Giustificativo') : (typeof t === 'function' ? t('btn_add_doc', 'Giustificativo') : 'Giustificativo')}`;
                
                tr.innerHTML = `
                    <td style="white-space: nowrap;">${t.date}</td>
                    <td><span class="badge" style="background: rgba(255,255,255,0.1);">${t.category}</span></td>
                    <td>${t.description}</td>
                    <td>${relatedEntity || '-'}</td>
                    <td class="text-bold" style="text-align: right; color: ${amountColor};">${formatCurrency(t.amount)}</td>
                    ${isFiltered ? '' : `<td class="text-bold" style="text-align: right; color: ${progressiveColor};">${formatCurrency(t.actualProgressive)}</td>`}
                    <td style="text-align: center;">
                        <button class="btn btn-sm" onclick="openBankDocsModal('${escapeQuotes(txId)}', '${escapeQuotes(t.date || '')}', ${t.amount || 0}, '${escapeQuotes(t.partner || '')}', '${escapeQuotes(t.description || '')}', '${escapeQuotes(t.category || '')}')" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; cursor: pointer; ${dStyle}">
                            <i class="fa-solid ${dCount > 0 ? 'fa-file-invoice-dollar' : 'fa-paperclip'}"></i> ${dText}
                        </button>
                    </td>
                `;
                bankTableBody.appendChild(tr);
            });

            const subtotalEl = document.getElementById('subtotal-amount');
            if (subtotalEl) {
                subtotalEl.textContent = formatCurrency(subtotal);
                subtotalEl.style.color = subtotal < 0 ? '#ef4444' : '#10b981';
            }
        };

        window.refreshBankTable = renderTable;
        setupBankDropzone();

        // Populate custom multiselects
        const catSet = new Set();
        const partnerSet = new Set();
        APP_DATA.transactions.forEach(t => {
            if (t.category) catSet.add(t.category);
            if (t.partner) partnerSet.add(t.partner);
        });
        
        const populateDropdown = (id, values) => {
            const dropdown = document.querySelector(`#${id} .multiselect-dropdown`);
            if (!dropdown) return;
            dropdown.innerHTML = '';
            values.forEach(v => {
                const label = document.createElement('label');
                label.style.display = 'flex';
                label.style.justifyContent = 'space-between';
                label.style.alignItems = 'center';
                label.style.padding = '0.3rem 0.5rem';
                label.style.cursor = 'pointer';
                label.style.borderRadius = '3px';
                label.innerHTML = `
                    <span style="flex:1;">${v}</span>
                    <input type="checkbox" class="multiselect-checkbox" value="${v}" style="margin-left: 10px; cursor: pointer;">
                `;
                label.addEventListener('mouseenter', () => label.style.background = 'rgba(255,255,255,0.05)');
                label.addEventListener('mouseleave', () => label.style.background = 'transparent');
                dropdown.appendChild(label);
            });
        };
        
        populateDropdown('ms-category', Array.from(catSet).sort());
        populateDropdown('ms-partner', Array.from(partnerSet).sort());
        
        // Setup dropdown toggles and listeners
        document.querySelectorAll('.custom-multiselect').forEach(ms => {
            const btn = ms.querySelector('.multiselect-btn');
            const dropdown = ms.querySelector('.multiselect-dropdown');
            const label = ms.querySelector('.multiselect-label');
            const defaultTextHTML = ms.id === 'ms-category' ? '<span data-i18n="filter_tutte">Tutte</span>' : '<span data-i18n="filter_tutti">Tutti</span>';
            
            // Insert clear button at the top of dropdown
            const resetBtn = document.createElement('div');
            resetBtn.style.padding = '0.5rem';
            resetBtn.style.cursor = 'pointer';
            resetBtn.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            resetBtn.style.marginBottom = '0.5rem';
            resetBtn.style.color = '#9ca3af';
            resetBtn.style.textAlign = 'center';
            resetBtn.style.fontSize = '0.9rem';
            resetBtn.innerHTML = `<i class="fa-solid fa-filter-circle-xmark"></i> <span data-i18n="filter_rimuovi">Rimuovi Filtri</span>`;
            resetBtn.addEventListener('mouseenter', () => resetBtn.style.color = '#fff');
            resetBtn.addEventListener('mouseleave', () => resetBtn.style.color = '#9ca3af');
            resetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ms.querySelectorAll('.multiselect-checkbox').forEach(cb => cb.checked = false);
                label.innerHTML = defaultTextHTML; if (typeof applyTranslations === "function") applyTranslations();
                renderTable();
                dropdown.style.display = 'none';
            });
            dropdown.insertBefore(resetBtn, dropdown.firstChild);
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close others
                document.querySelectorAll('.multiselect-dropdown').forEach(d => {
                    if(d !== dropdown) d.style.display = 'none';
                });
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });
            
            dropdown.addEventListener('click', (e) => e.stopPropagation());
            
            ms.querySelectorAll('.multiselect-checkbox').forEach(cb => {
                cb.addEventListener('change', () => {
                    const checked = ms.querySelectorAll('.multiselect-checkbox:checked');
                    if (checked.length === 0) {
                        label.innerHTML = defaultTextHTML; if (typeof applyTranslations === "function") applyTranslations();
                    } else if (checked.length === 1) {
                        label.textContent = checked[0].value;
                    } else {
                        label.innerHTML = `${checked.length} <span data-i18n="filter_selezionati">selezionati</span>`; if (typeof applyTranslations === "function") applyTranslations();
                    }
                    renderTable();
                });
            });
        });
        
        document.addEventListener('click', () => {
            document.querySelectorAll('.multiselect-dropdown').forEach(d => d.style.display = 'none');
        });

        // Add listeners to text inputs
        document.querySelectorAll('input.filter-input[type="text"]').forEach(input => {
            input.addEventListener('input', renderTable);
        });

        const yearSelect = document.getElementById('filter-year');
        if (yearSelect) {
            const yearSet = new Set();
            APP_DATA.transactions.forEach(t => {
                if (t.date) {
                    const parts = t.date.split('/');
                    if (parts.length === 3) yearSet.add(parts[2]);
                }
            });
            Array.from(yearSet).sort().forEach(y => {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                yearSelect.appendChild(opt);
            });
            yearSelect.addEventListener('change', renderTable);
        }
        
        const monthSelect = document.getElementById('filter-month');
        if (monthSelect) monthSelect.addEventListener('change', renderTable);

        renderTable();
        
        // --- LOGICA ESPORTAZIONE (EXCEL / PDF) ---
        window.exportData = function(type) {
            const period = document.getElementById('export-period').value;
            let dataToExport = [];
            
            // Determina mese/anno attuali (usiamo la data di oggi o l'ultima transazione)
            const today = new Date();
            const currentYear = today.getFullYear().toString();
            let currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
            
            if (period === 'filtered') {
                dataToExport = window.currentFilteredData || [];
            } else if (period === 'global') {
                dataToExport = APP_DATA.transactions;
            } else if (period === 'current_year') {
                dataToExport = APP_DATA.transactions.filter(t => t.date && t.date.endsWith('/' + currentYear));
            } else if (period === 'current_month') {
                dataToExport = APP_DATA.transactions.filter(t => t.date && t.date.includes('/' + currentMonth + '/' + currentYear));
                // Fallback logico: se non ci sono dati questo mese, potremmo avvisare l'utente o usare l'ultimo mese disponibile
                if (dataToExport.length === 0) {
                    alert("Nessun dato trovato per il mese in corso (" + currentMonth + "/" + currentYear + "). L'esportazione sarà vuota.");
                }
            }

            if (dataToExport.length === 0) {
                alert("Nessun dato da esportare con i filtri selezionati.");
                return;
            }

            // Prepara i dati in un formato piatto per le tabelle
            const exportRows = dataToExport.map(t => [
                t.date || '',
                t.category || '',
                t.description || '',
                t.partner || '',
                t.amount !== undefined ? t.amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
                t.actualProgressive !== undefined ? t.actualProgressive.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
            ]);

            const headers = ["Data", "Categoria", "Descrizione", "Partner", "Importo (€)", "Progressivo (€)"];
            
            const filename = `EstrattoConto_GreenEnerbras_${period}_${new Date().toISOString().slice(0,10)}`;

            if (type === 'excel') {
                // Generazione EXCEL tramite SheetJS
                if (typeof XLSX === 'undefined') {
                    alert("Libreria XLSX non caricata."); return;
                }
                const wsData = [headers, ...exportRows];
                const ws = XLSX.utils.aoa_to_sheet(wsData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Estratto Conto");
                XLSX.writeFile(wb, `${filename}.xlsx`);

            } else if (type === 'pdf') {
                // Generazione PDF tramite jsPDF e autotable
                if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
                    alert("Libreria jsPDF non caricata."); return;
                }
                const jsPDF = window.jspdf.jsPDF;
                const doc = new jsPDF({ orientation: 'landscape' });
                
                doc.setFontSize(18);
                doc.text("Estratto Conto - GREEN ENERBRAS ONE", 14, 20);
                doc.setFontSize(11);
                doc.setTextColor(100);
                doc.text(`Periodo: ${period.replace('_', ' ').toUpperCase()} | Generato il: ${new Date().toLocaleDateString('it-IT')}`, 14, 28);
                
                doc.autoTable({
                    startY: 35,
                    head: [headers],
                    body: exportRows,
                    theme: 'striped',
                    styles: { fontSize: 9 },
                    headStyles: { fillColor: [16, 185, 129] }, // text-green
                    columnStyles: {
                        4: { halign: 'right' },
                        5: { halign: 'right' }
                    }
                });

                doc.save(`${filename}.pdf`);
            }
        };
    }
});

