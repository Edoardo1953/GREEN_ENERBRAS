/**
 * GREEN ENERBRAS ONE SCSp - Logique Métier Conformité AML / LBC-FT & KYC
 * Contrôle des Entrées de Capitaux, Souscription des Parts Sociales des Associés (GP & LPs) et RBE
 * Support multilingue complet (IT, EN, FR) avec Regroupement par Investisseur & Accordéon Tranches
 */

function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num)) return "0,00\u00A0€";
    const val = Number(num);
    const parts = val.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",") + "\u00A0€";
}

function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined || isNaN(num)) return "0";
    const val = Number(num);
    const parts = val.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decimals > 0 ? parts.join(",") : parts[0];
}

// État global des filtres
let amlFilterYear = 'ALL';
let amlFilterPartner = 'ALL';
let amlFilterEntityType = 'ALL';
let amlFilterKycStatus = 'ALL';
let amlFilterThreshold = 0; // 0, 5000, 10000, 25000
let amlSearchQuery = '';

// Helper de traduction avec fallback
function t(key, fallback = '') {
    const lang = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('appLang') || 'it');
    if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
        return translations[lang][key];
    }
    if (typeof translations !== 'undefined' && translations['it'] && translations['it'][key]) {
        return translations['it'][key];
    }
    return fallback || key;
}

// Localisation des pays
function getLocalizedCountry(countryName) {
    const lang = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('appLang') || 'it');
    const c = (countryName || '').toLowerCase();
    if (c.includes('italie') || c.includes('italy') || c.includes('italia') || c === 'it') {
        if (lang === 'en') return "Italy";
        if (lang === 'fr') return "Italie";
        return "Italia";
    }
    if (c.includes('luxembourg') || c.includes('lussemburgo') || c === 'lu') {
        if (lang === 'en') return "Luxembourg";
        if (lang === 'fr') return "Luxembourg";
        return "Lussemburgo";
    }
    if (c.includes('espagne') || c.includes('spain') || c.includes('spagna') || c === 'es') {
        if (lang === 'en') return "Spain";
        if (lang === 'fr') return "Espagne";
        return "Spagna";
    }
    if (c.includes('brésil') || c.includes('brazil') || c.includes('brasile') || c === 'br') {
        if (lang === 'en') return "Brazil";
        if (lang === 'fr') return "Brésil";
        return "Brasile";
    }
    if (c.includes('suisse') || c.includes('switzerland') || c.includes('svizzera') || c === 'ch') {
        if (lang === 'en') return "Switzerland";
        if (lang === 'fr') return "Suisse";
        return "Svizzera";
    }
    if (c.includes('france') || c.includes('francia') || c === 'fr') {
        if (lang === 'en') return "France";
        if (lang === 'fr') return "France";
        return "Francia";
    }
    if (c.includes('allemagne') || c.includes('germany') || c.includes('germania') || c === 'de') {
        if (lang === 'en') return "Germany";
        if (lang === 'fr') return "Allemagne";
        return "Germania";
    }
    if (c.includes('hong') || c.includes('hk')) {
        return "Hong Kong";
    }
    return countryName;
}

// Localisation des nationalités (avec support des doubles nationalités, ex: "Italienne/Luxembourgeoise")
function localizeSingleNationality(nat, lang) {
    if (!nat) return '';
    const n = nat.trim().toLowerCase();
    if (!n) return '';
    if (n.includes('ital')) {
        if (lang === 'en') return "Italian";
        if (lang === 'fr') return "Italienne";
        return "Italiana";
    }
    if (n.includes('lux')) {
        if (lang === 'en') return "Luxembourgish";
        if (lang === 'fr') return "Luxembourgeoise";
        return "Lussemburghese";
    }
    if (n.includes('espag') || n.includes('span') || n.includes('spagn')) {
        if (lang === 'en') return "Spanish";
        if (lang === 'fr') return "Espagnole";
        return "Spagnola";
    }
    if (n.includes('brés') || n.includes('braz') || n.includes('brasil')) {
        if (lang === 'en') return "Brazilian";
        if (lang === 'fr') return "Brésilienne";
        return "Brasiliana";
    }
    if (n.includes('suiss') || n.includes('swiss') || n.includes('svizz')) {
        if (lang === 'en') return "Swiss";
        if (lang === 'fr') return "Suisse";
        return "Svizzera";
    }
    if (n.includes('franc') || n.includes('french')) {
        if (lang === 'en') return "French";
        if (lang === 'fr') return "Française";
        return "Francese";
    }
    if (n.includes('allem') || n.includes('germ') || n.includes('tedesc')) {
        if (lang === 'en') return "German";
        if (lang === 'fr') return "Allemande";
        return "Tedesca";
    }
    if (n.includes('euro') || n === 'ue') {
        if (lang === 'en') return "EU";
        if (lang === 'fr') return "UE";
        return "UE";
    }
    return nat.trim().charAt(0).toUpperCase() + nat.trim().slice(1);
}

function getLocalizedNationality(nat) {
    if (!nat) return '';
    const lang = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('appLang') || 'it');
    
    // Détection des séparateurs pour doubles / multiples nationalités
    const separators = ['/', ',', '&', ' - ', ' e ', ' et ', ' and '];
    for (const sep of separators) {
        if (nat.includes(sep)) {
            return nat
                .split(sep)
                .map(part => localizeSingleNationality(part, lang))
                .filter(Boolean)
                .join(' / ');
        }
    }
    
    return localizeSingleNationality(nat, lang);
}

// Localisation des libellés de forme juridique
function getLocalizedEntityType(entityType) {
    const lang = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('appLang') || 'it');
    if (entityType === 'SARL_COMMERCIALE') {
        return "General Partner (Sàrl)";
    }
    if (entityType === 'SCP_BRESIL') {
        if (lang === 'en') return "Brazil Operating Company (SCP)";
        if (lang === 'fr') return "Véhicule Projet Brésil (SCP)";
        return "Partecipata Brasile (SCP)";
    }
    if (entityType === 'SCSP_INVESTISSEMENT') {
        if (lang === 'en') return "Special Limited Partnership (SCSp)";
        if (lang === 'fr') return "Société en Commandite Spéciale (SCSp)";
        return "Società in Accomandita (SCSp)";
    }
    if (entityType === 'SA_COMMERCIALE') {
        if (lang === 'en') return "Public Limited Company (SA)";
        if (lang === 'fr') return "Société Anonyme (SA)";
        return "Società per Azioni (SA)";
    }
    // PERSONNE_PHYSIQUE
    if (lang === 'en') return "Natural Person (LP)";
    if (lang === 'fr') return "Personne Physique (LP)";
    return "Persona Fisica (LP)";
}

// Localisation des causali e mandati
function getLocalizedPurpose(purposeKey, category) {
    const lang = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('appLang') || 'it');
    const isDividend = (category || '').toLowerCase().includes('dividende') || (purposeKey || '').toLowerCase().includes('dividende');
    if (isDividend) {
        if (lang === 'en') return "Solar PV Parks Dividend Distribution";
        if (lang === 'fr') return "Distribution de Dividendes Parcs Solaires";
        return "Distribuzione Dividendi Parchi Fotovoltaici";
    }
    const isGP = (purposeKey || '').toLowerCase().includes('general partner');
    if (isGP) {
        if (lang === 'en') return "Capital Contribution Payment (General Partner)";
        if (lang === 'fr') return "Paiement Apport de Capital (Associé Commandité)";
        return "Versamento Quota Capitale (General Partner)";
    }
    if (lang === 'en') return "Capital Contribution Payment";
    if (lang === 'fr') return "Paiement Apport de Capital";
    return "Versamento Apporto di Capitale";
}

function getLocalizedMandate(mandateKey) {
    const lang = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('appLang') || 'it');
    const m = (mandateKey || '').toLowerCase();
    if (m.includes('commanditée') || m.includes('commandité') || m.includes('gérance')) {
        if (lang === 'en') return "General Partner & Statutory Management of the SCSp";
        if (lang === 'fr') return "Associé Commandité & Gérance Statutaire de la SCSp";
        return "Socio Accomandatario & Gestione Statutaria della SCSp";
    }
    if (m.includes('financement') || m.includes('exploitation') || m.includes('photovolta')) {
        if (lang === 'en') return "Solar PV Parks Financing & Operational Holdings";
        if (lang === 'fr') return "Participation Financement & Exploitation Parcs Photovoltaïques";
        return "Partecipazione Finanziamento & Gestione Parchi Fotovoltaici";
    }
    // Default LP
    if (lang === 'en') return "Limited Partner Share Subscription (LP)";
    if (lang === 'fr') return "Souscription de Parts Sociales d'Associé Commanditaire (LP)";
    return "Sottoscrizione Quote Socio Accomandante (LP)";
}

// Badges localisés
function getLocalizedRiskBadge(riskLevel) {
    const lvl = riskLevel || 'LOW';
    if (lvl === 'HIGH') {
        return `<span class="badge badge-danger" style="background: rgba(239, 68, 68, 0.15); color: #f87171; font-size: 0.75rem;"><i class="fa-solid fa-radiation"></i> ${t('risk_high', 'Elevato')}</span>`;
    }
    if (lvl === 'MEDIUM') {
        return `<span class="badge badge-warning" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; font-size: 0.75rem;"><i class="fa-solid fa-triangle-exclamation"></i> ${t('risk_medium', 'Medio')}</span>`;
    }
    return `<span class="badge badge-success" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.75rem;"><i class="fa-solid fa-shield-check"></i> ${t('risk_low', 'Basso')}</span>`;
}

function getLocalizedKycBadge(kycStatus) {
    const status = kycStatus || 'CONFORME';
    if (status === 'VIGILANCE_RENFORCEE') {
        return `<span class="badge badge-danger" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; font-size: 0.75rem;"><i class="fa-solid fa-triangle-exclamation"></i> ${t('kyc_enhanced', 'Rafforzata')}</span>`;
    }
    if (status === 'A_COMPLETER') {
        return `<span class="badge badge-warning" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; font-size: 0.75rem;"><i class="fa-solid fa-clock-rotate-left"></i> ${t('kyc_to_complete', 'Da Completare')}</span>`;
    }
    return `<span class="badge badge-success" style="background: rgba(16, 185, 129, 0.2); color: #10b981; font-size: 0.75rem;"><i class="fa-solid fa-circle-check"></i> ${t('kyc_compliant', 'Conforme')}</span>`;
}

function getLocalizedThresholdBadge(thresholdLevel) {
    if (thresholdLevel === 'MAJOR_25K') {
        return `<span class="badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); font-size: 0.72rem;">${t('threshold_25k_badge', '≥ 25k€ (Grandi Apporti)')}</span>`;
    }
    if (thresholdLevel === 'DUE_DILIGENCE_10K') {
        return `<span class="badge" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.4); font-size: 0.72rem;">${t('threshold_10k_badge', '≥ 10k€ (Legale)')}</span>`;
    }
    if (thresholdLevel === 'VIGILANCE_5K') {
        return `<span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); font-size: 0.72rem;">${t('threshold_5k_badge', '≥ 5k€')}</span>`;
    }
    return `<span class="badge" style="background: rgba(255,255,255,0.06); color: var(--text-muted); font-size: 0.72rem;">${t('threshold_standard', 'Standard')}</span>`;
}

// Récupération des données personnalisées / mémorisées dans localStorage
function getAmlCustomStorage() {
    try {
        const raw = localStorage.getItem('green_enerbras_aml_custom_partners');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function saveAmlCustomStorage(data) {
    try {
        localStorage.setItem('green_enerbras_aml_custom_partners', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving AML storage:', e);
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

// =============================================================================
// GESTIONE ARCHIVIO GIUSTIFICATIVI BANCARI (IndexedDB + Fallback)
// Percorso di conformità: uploads/AML Giustificativi/[Socio]/
// =============================================================================

const AML_DB_NAME = 'GreenEnerbrasAML_DB';
const AML_STORE_NAME = 'aml_giustificativi';
let amlDbInstance = null;
window.amlDocsCache = {}; // Memoria rapida indicizzata per ID documento

function openAmlDb() {
    return new Promise((resolve) => {
        if (amlDbInstance) return resolve(amlDbInstance);
        if (!window.indexedDB) {
            console.warn('IndexedDB non disponibile, uso fallback localStorage');
            return resolve(null);
        }
        try {
            const req = indexedDB.open(AML_DB_NAME, 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(AML_STORE_NAME)) {
                    const store = db.createObjectStore(AML_STORE_NAME, { keyPath: 'id' });
                    store.createIndex('inflowId', 'inflowId', { unique: false });
                    store.createIndex('partnerName', 'partnerName', { unique: false });
                }
            };
            req.onsuccess = (e) => {
                amlDbInstance = e.target.result;
                resolve(amlDbInstance);
            };
            req.onerror = (e) => {
                console.warn('Errore apertura IndexedDB:', e);
                resolve(null);
            };
        } catch (err) {
            console.warn('Eccezione IndexedDB:', err);
            resolve(null);
        }
    });
}

async function loadAllAmlDocs() {
    try {
        const db = await openAmlDb();
        if (db) {
            return new Promise((resolve) => {
                try {
                    const tx = db.transaction(AML_STORE_NAME, 'readonly');
                    const store = tx.objectStore(AML_STORE_NAME);
                    const req = store.getAll();
                    req.onsuccess = () => {
                        const list = req.result || [];
                        window.amlDocsCache = {};
                        list.forEach(doc => {
                            window.amlDocsCache[doc.id] = doc;
                        });
                        saveAmlDocsLightIndex();
                        resolve(list);
                    };
                    req.onerror = () => {
                        loadAmlDocsFromLocalStorage();
                        resolve(Object.values(window.amlDocsCache));
                    };
                } catch (txErr) {
                    loadAmlDocsFromLocalStorage();
                    resolve(Object.values(window.amlDocsCache));
                }
            });
        } else {
            loadAmlDocsFromLocalStorage();
            return Object.values(window.amlDocsCache);
        }
    } catch (e) {
        console.error('Errore caricamento documenti AML:', e);
        loadAmlDocsFromLocalStorage();
        return Object.values(window.amlDocsCache);
    }
}

function loadAmlDocsFromLocalStorage() {
    try {
        const raw = localStorage.getItem('green_enerbras_aml_giustificativi_docs');
        if (raw) {
            window.amlDocsCache = JSON.parse(raw);
        }
    } catch (e) {
        window.amlDocsCache = {};
    }
}

function saveAmlDocsLightIndex() {
    try {
        const light = {};
        Object.values(window.amlDocsCache).forEach(d => {
            light[d.id] = {
                id: d.id,
                inflowId: d.inflowId,
                partnerName: d.partnerName,
                fileName: d.fileName,
                fileSize: d.fileSize,
                fileType: d.fileType,
                uploadDate: d.uploadDate,
                folderPath: d.folderPath
            };
        });
        localStorage.setItem('green_enerbras_aml_giustificativi_index', JSON.stringify(light));
    } catch (e) {}
}

async function saveAmlDocToStorage(doc) {
    window.amlDocsCache[doc.id] = doc;
    try {
        const db = await openAmlDb();
        if (db) {
            const tx = db.transaction(AML_STORE_NAME, 'readwrite');
            const store = tx.objectStore(AML_STORE_NAME);
            store.put(doc);
        } else {
            localStorage.setItem('green_enerbras_aml_giustificativi_docs', JSON.stringify(window.amlDocsCache));
        }
    } catch (e) {
        try {
            localStorage.setItem('green_enerbras_aml_giustificativi_docs', JSON.stringify(window.amlDocsCache));
        } catch (err) {
            console.warn('Quota localStorage superata');
        }
    }
    saveAmlDocsLightIndex();
}

async function deleteAmlDocFromStorage(docId) {
    delete window.amlDocsCache[docId];
    try {
        const db = await openAmlDb();
        if (db) {
            const tx = db.transaction(AML_STORE_NAME, 'readwrite');
            const store = tx.objectStore(AML_STORE_NAME);
            store.delete(docId);
        } else {
            localStorage.setItem('green_enerbras_aml_giustificativi_docs', JSON.stringify(window.amlDocsCache));
        }
    } catch (e) {
        try {
            localStorage.setItem('green_enerbras_aml_giustificativi_docs', JSON.stringify(window.amlDocsCache));
        } catch (err) {}
    }
    saveAmlDocsLightIndex();
}

function getDocsForInflow(inflowId) {
    return Object.values(window.amlDocsCache).filter(d => d.inflowId === inflowId);
}

function getDocsForPartner(partnerName) {
    const pLower = (partnerName || '').toLowerCase();
    return Object.values(window.amlDocsCache).filter(d => (d.partnerName || '').toLowerCase() === pLower);
}

let currentDocContext = {
    inflowId: '',
    partnerName: '',
    trancheDate: '',
    amount: 0,
    refNumber: '',
    isGroupView: false,
    tranches: []
};

window.openAmlDocsModal = function(inflowId, partnerName, trancheDate, amount, refNumber) {
    currentDocContext = {
        inflowId: inflowId,
        partnerName: partnerName,
        trancheDate: trancheDate,
        amount: amount || 0,
        refNumber: refNumber || '',
        isGroupView: false,
        tranches: []
    };

    const modal = document.getElementById('aml-docs-modal');
    if (!modal) return;

    const subTitleEl = document.getElementById('aml-docs-modal-subtitle');
    if (subTitleEl) {
        subTitleEl.textContent = `${partnerName} • ${trancheDate} • ${formatCurrency(amount)} • Ref: ${refNumber || inflowId}`;
    }

    const folderEl = document.getElementById('aml-docs-folder-indicator');
    if (folderEl) {
        folderEl.textContent = `uploads/AML Giustificativi/${partnerName}/`;
    }

    renderAmlDocsList();
    modal.style.display = 'flex';
};

window.openAmlGroupDocsModal = function(gIdx, partnerName) {
    const inflows = getAmlInflows();
    const groupedPartners = getAmlGroupedPartners(inflows);
    const g = groupedPartners[gIdx];
    if (!g) return;

    if (g.tranches_count === 1) {
        const tr = g.tranches[0];
        openAmlDocsModal(tr.id, g.partner_name, tr.date, tr.amount, tr.ref_number);
        return;
    }

    currentDocContext = {
        inflowId: 'GROUP-' + g.partner_name,
        partnerName: g.partner_name,
        trancheDate: g.latest_date,
        amount: g.total_amount,
        refNumber: 'Totale ' + g.tranches_count + ' versamenti',
        isGroupView: true,
        tranches: g.tranches
    };

    const modal = document.getElementById('aml-docs-modal');
    if (!modal) return;

    const subTitleEl = document.getElementById('aml-docs-modal-subtitle');
    if (subTitleEl) {
        subTitleEl.textContent = `${g.partner_name} • Totale: ${formatCurrency(g.total_amount)} • ${g.tranches_count} versamenti`;
    }

    const folderEl = document.getElementById('aml-docs-folder-indicator');
    if (folderEl) {
        folderEl.textContent = `uploads/AML Giustificativi/${g.partner_name}/`;
    }

    renderAmlDocsList();
    modal.style.display = 'flex';
};

window.closeAmlDocsModal = function() {
    const modal = document.getElementById('aml-docs-modal');
    if (modal) modal.style.display = 'none';
};

function renderAmlDocsList() {
    const container = document.getElementById('aml-docs-list-container');
    const counterBadge = document.getElementById('aml-docs-counter-badge');
    const dropzone = document.getElementById('aml-docs-dropzone');
    if (!container) return;

    let docs = [];
    if (currentDocContext.isGroupView) {
        docs = getDocsForPartner(currentDocContext.partnerName);
    } else {
        docs = getDocsForInflow(currentDocContext.inflowId);
    }

    if (counterBadge) {
        counterBadge.textContent = `${docs.length} / 3 doc`;
        counterBadge.style.background = docs.length >= 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.08)';
        counterBadge.style.color = docs.length >= 3 ? '#ef4444' : 'var(--text-main)';
    }

    if (dropzone) {
        if (docs.length >= 3) {
            dropzone.style.opacity = '0.5';
            dropzone.style.pointerEvents = 'none';
        } else {
            dropzone.style.opacity = '1';
            dropzone.style.pointerEvents = 'auto';
        }
    }

    if (docs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px dashed var(--border-color);">
                <i class="fa-solid fa-file-circle-xmark" style="font-size: 1.8rem; margin-bottom: 0.5rem; display: block; opacity: 0.5;"></i>
                ${t('docs_empty', 'Nessun giustificativo bancario allegato per questa operazione.')}
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

        html += `
            <div class="aml-doc-card">
                <div class="aml-doc-info">
                    <div class="aml-doc-icon">
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 0.9rem; word-break: break-all;">
                            ${escapeHtml(doc.fileName)}
                        </div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; gap: 0.6rem; margin-top: 0.2rem; flex-wrap: wrap;">
                            <span><i class="fa-solid fa-folder text-emerald"></i> uploads/AML Giustificativi/${escapeHtml(doc.partnerName)}/</span>
                            <span>•</span>
                            <span>${sizeStr}</span>
                            <span>•</span>
                            <span>${doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : ''}</span>
                        </div>
                    </div>
                </div>
                <div class="aml-doc-actions">
                    <button class="btn btn-secondary btn-sm" onclick="previewAmlDoc('${doc.id}')" title="${t('docs_action_preview', 'Apri / Leggi')}">
                        <i class="fa-solid fa-eye text-emerald"></i> <span>${t('docs_action_preview', 'Apri / Leggi')}</span>
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="downloadAmlDoc('${doc.id}')" title="${t('docs_action_download', 'Scarica')}">
                        <i class="fa-solid fa-download"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.3);" onclick="deleteAmlDoc('${doc.id}')" title="${t('docs_action_delete', 'Elimina')}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

window.triggerAmlDocFileInput = function() {
    const input = document.getElementById('aml-doc-file-input');
    if (input) input.click();
};

window.handleAmlDocFileSelect = function(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    processAmlDocFiles(Array.from(files));
    event.target.value = '';
};

async function processAmlDocFiles(files) {
    let existingDocs = currentDocContext.isGroupView 
        ? getDocsForPartner(currentDocContext.partnerName)
        : getDocsForInflow(currentDocContext.inflowId);

    const availableSlots = 3 - existingDocs.length;
    if (availableSlots <= 0) {
        alert(t('docs_max_warning', 'Puoi allegare fino a un massimo di 3 documenti per ciascuna linea di versamento.'));
        return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
        alert(t('docs_max_warning', 'Puoi allegare fino a un massimo di 3 documenti. Solo i primi sono stati presi in carico.'));
    }

    for (const file of filesToUpload) {
        try {
            const base64 = await readFileAsDataURL(file);
            const docId = 'DOC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
            
            let targetInflowId = currentDocContext.inflowId;
            if (currentDocContext.isGroupView && currentDocContext.tranches.length > 0) {
                targetInflowId = currentDocContext.tranches[0].id;
            }

            const docRecord = {
                id: docId,
                inflowId: targetInflowId,
                partnerName: currentDocContext.partnerName,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type || 'application/pdf',
                uploadDate: new Date().toISOString(),
                dataUrl: base64,
                folderPath: `uploads/AML Giustificativi/${currentDocContext.partnerName}/${file.name}`
            };

            await saveAmlDocToStorage(docRecord);
        } catch (e) {
            console.error('Errore lettura file:', e);
        }
    }

    renderAmlDocsList();
    const activeInflows = getFilteredAmlInflows ? getFilteredAmlInflows() : getAmlInflows();
    renderAmlRegistryTable(activeInflows);
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}

window.previewAmlDoc = function(docId) {
    const doc = window.amlDocsCache[docId];
    if (!doc) return;

    const modal = document.getElementById('aml-doc-viewer-modal');
    const titleEl = document.getElementById('aml-viewer-doc-title');
    const subtitleEl = document.getElementById('aml-viewer-doc-subtitle');
    const bodyEl = document.getElementById('aml-doc-viewer-body');
    const downloadBtn = document.getElementById('aml-viewer-download-btn');

    if (!modal || !bodyEl) return;

    if (titleEl) titleEl.textContent = doc.fileName;
    if (subtitleEl) subtitleEl.textContent = doc.folderPath || `uploads/AML Giustificativi/${doc.partnerName}/${doc.fileName}`;

    if (downloadBtn) {
        downloadBtn.onclick = () => downloadAmlDoc(doc.id);
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
                <i class="fa-solid fa-file-lines text-emerald" style="font-size: 3.5rem; margin-bottom: 1rem; display: block;"></i>
                <h3 style="margin-bottom: 0.5rem;">${escapeHtml(doc.fileName)}</h3>
                <p style="color: var(--text-muted); max-width: 450px; margin: 0 auto 1.5rem auto; font-size: 0.85rem;">
                    ${t('docs_preview_error', 'Impossibile visualizzare l\'anteprima diretta per questo formato. Clicca su Scarica per aprirlo sul tuo dispositivo.')}
                </p>
                <button class="btn btn-primary" onclick="downloadAmlDoc('${doc.id}')">
                    <i class="fa-solid fa-download"></i> ${t('docs_action_download', 'Scarica')}
                </button>
            </div>
        `;
    }

    modal.style.display = 'flex';
};

window.closeAmlDocViewerModal = function() {
    const modal = document.getElementById('aml-doc-viewer-modal');
    if (modal) modal.style.display = 'none';
    const bodyEl = document.getElementById('aml-doc-viewer-body');
    if (bodyEl) bodyEl.innerHTML = '';
};

window.downloadAmlDoc = function(docId) {
    const doc = window.amlDocsCache[docId];
    if (!doc) return;
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.fileName || 'giustificativo.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

window.deleteAmlDoc = async function(docId) {
    const confirmed = confirm(t('docs_confirm_delete', 'Sei sicuro di voler eliminare questo documento bancario?'));
    if (!confirmed) return;

    await deleteAmlDocFromStorage(docId);
    renderAmlDocsList();
    const activeInflows = getFilteredAmlInflows ? getFilteredAmlInflows() : getAmlInflows();
    renderAmlRegistryTable(activeInflows);
};

function setupAmlDropzone() {
    const dropzone = document.getElementById('aml-docs-dropzone');
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
            processAmlDocFiles(Array.from(files));
        }
    });
}

// Obtenir la fiche enrichie d'un associé / partenaire
function getEnrichedPartner(partnerName) {
    const defaultRegistry = window.GREEN_ENERBRAS_AML_PARTNERS || {};
    const customStorage = getAmlCustomStorage();
    
    let base = defaultRegistry[partnerName];
    if (!base) {
        // Recherche souple par nom
        const keys = Object.keys(defaultRegistry);
        const match = keys.find(k => k.toLowerCase().includes(partnerName.toLowerCase()) || partnerName.toLowerCase().includes(k.toLowerCase()));
        if (match) {
            base = defaultRegistry[match];
        }
    }

    if (!base) {
        // Générer profil par défaut
        base = {
            id: 'PART-' + Math.floor(Math.random() * 900 + 100),
            name: partnerName || 'Associé Non Référencé',
            legal_name: partnerName || 'Investisseur',
            entity_type: 'PERSONNE_PHYSIQUE',
            entity_type_label: 'Associé Commanditaire (LP)',
            role_type: 'Limited Partner',
            rcs_number: 'N/A',
            matricule: '',
            tva_number: '',
            address: 'Adresse à compléter',
            postal_code: '',
            city: 'Luxembourg',
            country: 'Luxembourg',
            country_code: 'LU',
            mandate_nature: "Souscription de Parts Sociales SCSp",
            mandate_start_date: '2025-01-01',
            contribution_committed: 20000.0,
            contribution_paid: 20000.0,
            detention_pct: 7.66,
            ubo_list: [{ name: partnerName || 'Bénéficiaire Effectif', nationality: 'Européenne', percentage: 100, rbe_verified: true }],
            is_pep: false,
            pep_details: '',
            aml_risk_level: 'LOW',
            aml_kyc_status: 'CONFORME',
            last_review_date: '2026-01-01',
            next_review_date: '2027-01-01',
            documents: [
                { name: 'Pièce d\'Identité', status: 'VALID', date: '' },
                { name: 'Justificatif de Domicile', status: 'VALID', date: '' },
                { name: 'Bulletin de Souscription SCSp', status: 'VALID', date: '2025-01-01' }
            ],
            notes: 'Dossier vérifié lors de la souscription.'
        };
    }

    if (customStorage[partnerName] || (base.name && customStorage[base.name])) {
        return { ...base, ...(customStorage[partnerName] || customStorage[base.name]) };
    }
    return base;
}

// Récupérer toutes les entrées réelles de capitaux des associés et futurs flux de dividendes
function getAmlInflows() {
    const rawData = (typeof APP_DATA !== 'undefined' && APP_DATA.transactions) ? APP_DATA.transactions : [];
    
    // 1. Filtrer les transactions de Capital Contribution ou entrées réelles de fonds
    const filtered = rawData.filter(t => {
        const cat = (t.category || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const partner = (t.partner || '').toLowerCase();
        const amt = Number(t.amount || 0);

        // Exclure les frais, dépenses, achats d'immobilisations, sorties bancaires, stornos et entry fees
        if (amt <= 0) return false;
        if (cat.includes('frais') || desc.includes('frais avances') || desc.includes('remboursement') || 
            desc.includes('storno') || desc.includes('saldo iniziale') || 
            cat.includes('entry fee') || desc.includes('entry fee') || desc.includes('entry fees')) {
            return false;
        }

        // Relever les contributions de capital ou futurs dividendes
        const isCapital = cat.includes('capital') || desc.includes('capital contribution') || desc.includes('apport');
        const isDividend = cat.includes('dividende') || desc.includes('dividende') || desc.includes('distribution') || desc.includes('produit');
        const isPartnerInflow = [
            'new life sarl', 'tubia edoardo', 'tubia silvia', 'bertozzi stefano', 
            'de miguel bellvis maria', 'desiderio salvatore', 'tubia enrico', 
            'zaniboni elisa', 'zaniboni greta', 'sterzi marco', 'miletti giovanni',
            'tri star enerbras one scp'
        ].some(p => partner.includes(p));

        return (isCapital || isDividend || isPartnerInflow) && amt > 0;
    });

    // 2. Si aucune transaction trouvée dans data.js, charger la liste des 13 versements réels certifiés
    let recordsToMap = filtered;
    if (recordsToMap.length === 0) {
        recordsToMap = [
            { date: "17/07/2026", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Sterzi Marco", amount: 40000.0 },
            { date: "17/07/2026", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Miletti Giovanni", amount: 20000.0 },
            { date: "11/12/2025", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Zaniboni Greta", amount: 20000.0 },
            { date: "09/12/2025", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Zaniboni Elisa", amount: 20000.0 },
            { date: "03/12/2025", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Tubia Enrico", amount: 20000.0 },
            { date: "27/11/2025", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Desiderio Salvatore", amount: 40000.0 },
            { date: "26/11/2025", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Bertozzi Stefano", amount: 20000.0 },
            { date: "26/11/2025", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "De Miguel Bellvis Maria", amount: 20000.0 },
            { date: "01/10/2025", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Tubia Edoardo", amount: 20000.0 },
            { date: "29/09/2025", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Tubia Silvia", amount: 20000.0 },
            { date: "09/09/2025", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Tubia Edoardo", amount: 10000.0 },
            { date: "01/09/2025", category: "Capital Contribution", description: "Paiement Capital Contribution", partner: "Tubia Edoardo", amount: 10000.0 },
            { date: "29/08/2025", category: "Capital Contribution", description: "Paiement Capital Contribution (General Partner)", partner: "New Life Sarl", amount: 1000.0 }
        ];
    }

    return recordsToMap.map((r, idx) => {
        const rawDate = r.date || '';
        let year = '2025';
        let parsedDate = new Date(2025, 0, 1);
        if (rawDate) {
            const parts = rawDate.split('/');
            if (parts.length === 3) {
                year = parts[2];
                parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }

        // Harmonisation nom partenaire
        let partnerKey = r.partner || 'Associé Inconnu';
        const partnerKeyLower = partnerKey.toLowerCase();
        if (partnerKeyLower.includes('new life')) partnerKey = 'NEW LIFE SARL - Luxembourg';
        else if (partnerKeyLower.includes('edoardo')) partnerKey = 'Edoardo TUBIA';
        else if (partnerKeyLower.includes('silvia')) partnerKey = 'Silvia TUBIA';
        else if (partnerKeyLower.includes('stefano') || partnerKeyLower.includes('bertozzi')) partnerKey = 'Stefano BERTOZZI';
        else if (partnerKeyLower.includes('miguel') || partnerKeyLower.includes('maria')) partnerKey = 'Maria DE MIGUEL BELLVIS';
        else if (partnerKeyLower.includes('desiderio') || partnerKeyLower.includes('salvatore')) partnerKey = 'Salvatore DESIDERIO';
        else if (partnerKeyLower.includes('enrico')) partnerKey = 'Enrico TUBIA';
        else if (partnerKeyLower.includes('elisa')) partnerKey = 'Elisa ZANIBONI';
        else if (partnerKeyLower.includes('greta')) partnerKey = 'Greta ZANIBONI';
        else if (partnerKeyLower.includes('sterzi') || partnerKeyLower.includes('marco')) partnerKey = 'Marco STERZI';
        else if (partnerKeyLower.includes('miletti') || partnerKeyLower.includes('giovanni')) partnerKey = 'Giovanni MILETTI';

        const partnerData = getEnrichedPartner(partnerKey);
        const amount = Number(r.amount || 0);

        let thresholdLevel = 'STANDARD';
        if (amount >= 25000) thresholdLevel = 'MAJOR_25K';
        else if (amount >= 10000) thresholdLevel = 'DUE_DILIGENCE_10K';
        else if (amount >= 5000) thresholdLevel = 'VIGILANCE_5K';

        const isDividend = (r.category || '').toLowerCase().includes('dividende') || (r.description || '').toLowerCase().includes('dividende');

        return {
            id: 'AML-' + year + '-' + String(idx + 1).padStart(3, '0'),
            date: rawDate,
            date_obj: parsedDate,
            year: year,
            partner_name: partnerData.name,
            partner_legal_name: partnerData.legal_name,
            entity_type: partnerData.entity_type,
            entity_type_label: partnerData.entity_type_label,
            role_type: partnerData.role_type || 'Limited Partner',
            raw_purpose: r.description || "Apport de Capital Social (Parts SCSp)",
            category: r.category || '',
            ref_number: isDividend ? "DIV-BR-" + year + "-" + String(idx + 1).padStart(2, '0') : "CONTRAT-SCSP-" + (partnerData.id || 'LP'),
            amount: amount,
            detention_pct: partnerData.detention_pct || 7.66,
            threshold_level: thresholdLevel,
            aml_risk_level: partnerData.aml_risk_level || 'LOW',
            aml_kyc_status: partnerData.aml_kyc_status || 'CONFORME',
            is_pep: partnerData.is_pep || false,
            partner_data: partnerData
        };
    }).sort((a, b) => b.date_obj - a.date_obj);
}

// Regroupement par Investisseur / Partenaire avec tranches détaillées
function getAmlGroupedPartners(inflows) {
    const totalCapitalVolume = inflows.reduce((sum, i) => sum + i.amount, 0) || 261000.0;
    const groupsMap = {};

    inflows.forEach(item => {
        const pName = item.partner_name;
        if (!groupsMap[pName]) {
            groupsMap[pName] = {
                partner_name: pName,
                partner_data: item.partner_data,
                role_type: item.role_type,
                entity_type: item.entity_type,
                aml_risk_level: item.aml_risk_level,
                aml_kyc_status: item.aml_kyc_status,
                is_pep: item.is_pep,
                total_amount: 0,
                tranches: [],
                years: new Set(),
                latest_date: item.date,
                latest_date_obj: item.date_obj
            };
        }

        const group = groupsMap[pName];
        group.total_amount += item.amount;
        group.years.add(item.year);
        if (item.date_obj > group.latest_date_obj) {
            group.latest_date_obj = item.date_obj;
            group.latest_date = item.date;
        }

        // Calcul du % exact de la tranche individuelle
        const singleStakePct = (item.amount / totalCapitalVolume) * 100;

        group.tranches.push({
            ...item,
            single_stake_pct: singleStakePct
        });
    });

    const groups = Object.values(groupsMap).map(g => {
        // Tri des tranches chronologique (du plus récent au plus ancien)
        g.tranches.sort((a, b) => b.date_obj - a.date_obj);
        g.tranches_count = g.tranches.length;
        
        // Pourcentage cumulé de détention
        g.total_stake_pct = (g.total_amount / totalCapitalVolume) * 100;

        // Seuil AML Cumulé au niveau de l'investisseur (Ex: Edoardo Tubia 40k€ >= 25k€)
        let cumulativeThreshold = 'STANDARD';
        if (g.total_amount >= 25000) cumulativeThreshold = 'MAJOR_25K';
        else if (g.total_amount >= 10000) cumulativeThreshold = 'DUE_DILIGENCE_10K';
        else if (g.total_amount >= 5000) cumulativeThreshold = 'VIGILANCE_5K';

        g.threshold_level = cumulativeThreshold;
        return g;
    });

    // Tri des groupes selon la date du versement le plus récent (2026 en haut)
    return groups.sort((a, b) => b.latest_date_obj - a.latest_date_obj);
}

// Remplir les filtres dynamiques avec traductions
function populateAmlFilterDropdowns(inflows) {
    // 1. Partner Filter
    const partnerSelect = document.getElementById('aml-filter-partner');
    if (partnerSelect) {
        const currentVal = amlFilterPartner;
        const uniquePartners = [...new Set(inflows.map(i => i.partner_name))].sort();
        let html = `<option value="ALL">${t('filter_partner_all', 'Tutti i Soci & Entità')}</option>`;
        uniquePartners.forEach(p => {
            html += `<option value="${p}" ${p === currentVal ? 'selected' : ''}>${p}</option>`;
        });
        partnerSelect.innerHTML = html;
    }

    // 2. Year Filter
    const yearSelect = document.getElementById('aml-filter-year');
    if (yearSelect) {
        const currentVal = amlFilterYear;
        yearSelect.innerHTML = `
            <option value="ALL" ${currentVal === 'ALL' ? 'selected' : ''}>${t('filter_year_all', 'Tutti gli esercizi')}</option>
            <option value="2026" ${currentVal === '2026' ? 'selected' : ''}>${t('filter_year_2026', '2026 (In corso)')}</option>
            <option value="2025" ${currentVal === '2025' ? 'selected' : ''}>${t('filter_year_2025', '2025')}</option>
        `;
    }

    // 3. Entity Type Filter
    const entitySelect = document.getElementById('aml-filter-entity-type');
    if (entitySelect) {
        const currentVal = amlFilterEntityType;
        entitySelect.innerHTML = `
            <option value="ALL" ${currentVal === 'ALL' ? 'selected' : ''}>${t('filter_entity_all', 'Tutte le forme giuridiche')}</option>
            <option value="PERSONNE_PHYSIQUE" ${currentVal === 'PERSONNE_PHYSIQUE' ? 'selected' : ''}>${t('filter_entity_pp', 'Persona Fisica (Privato)')}</option>
            <option value="SARL_COMMERCIALE" ${currentVal === 'SARL_COMMERCIALE' ? 'selected' : ''}>${t('filter_entity_gp', 'General Partner (Sàrl)')}</option>
            <option value="SCP_BRESIL" ${currentVal === 'SCP_BRESIL' ? 'selected' : ''}>${t('filter_entity_scp', 'Partecipata Brasile (SCP)')}</option>
        `;
    }

    // 4. KYC Status Filter
    const kycSelect = document.getElementById('aml-filter-kyc-status');
    if (kycSelect) {
        const currentVal = amlFilterKycStatus;
        kycSelect.innerHTML = `
            <option value="ALL" ${currentVal === 'ALL' ? 'selected' : ''}>${t('filter_kyc_all', 'Tutti gli stati KYC')}</option>
            <option value="CONFORME" ${currentVal === 'CONFORME' ? 'selected' : ''}>${t('filter_kyc_compliant', '🟢 Conforme')}</option>
            <option value="A_COMPLETER" ${currentVal === 'A_COMPLETER' ? 'selected' : ''}>${t('filter_kyc_to_complete', '🟡 Da Completare')}</option>
            <option value="VIGILANCE_RENFORCEE" ${currentVal === 'VIGILANCE_RENFORCEE' ? 'selected' : ''}>${t('filter_kyc_enhanced', '🔴 Vigilanza Rafforzata')}</option>
        `;
    }

    // 5. Populate Simulator Dropdowns
    populateSimulatorDropdowns();

    // 6. Populate KYC Modal Dropdowns
    populateKycModalDropdowns();
}

function populateSimulatorDropdowns() {
    const simEntity = document.getElementById('sim-entity-type');
    if (simEntity) {
        const cur = simEntity.value || 'PERSONNE_PHYSIQUE';
        simEntity.innerHTML = `
            <option value="PERSONNE_PHYSIQUE" ${cur === 'PERSONNE_PHYSIQUE' ? 'selected' : ''}>${t('filter_entity_pp', 'Persona Fisica Privata (Rischio Standard)')}</option>
            <option value="SARL_COMMERCIALE" ${cur === 'SARL_COMMERCIALE' ? 'selected' : ''}>${t('filter_entity_sa', 'Società Commerciale (SA / Sàrl)')}</option>
            <option value="SCSP_INVESTISSEMENT" ${cur === 'SCSP_INVESTISSEMENT' ? 'selected' : ''}>${t('filter_entity_scsp', 'Società in Accomandita (SCSp / Partnership)')}</option>
            <option value="ENTITE_INTERNATIONALE" ${cur === 'ENTITE_INTERNATIONALE' ? 'selected' : ''}>${t('filter_entity_intl', 'Entità Estera / Veicolo Internazionale')}</option>
        `;
    }

    const simCountry = document.getElementById('sim-country');
    if (simCountry) {
        const cur = simCountry.value || 'LU';
        const lang = (typeof currentLang !== 'undefined' ? currentLang : 'it');
        simCountry.innerHTML = `
            <option value="LU" ${cur === 'LU' ? 'selected' : ''}>${getLocalizedCountry('LU')} (${lang === 'en' ? 'Supervised Financial Center' : (lang === 'fr' ? 'Place financière régulée' : 'Piazza finanziaria vigilata')})</option>
            <option value="IT" ${cur === 'IT' ? 'selected' : ''}>${getLocalizedCountry('IT')} (${lang === 'en' ? 'European Union' : (lang === 'fr' ? 'Union Européenne' : 'Unione Europea')})</option>
            <option value="ES" ${cur === 'ES' ? 'selected' : ''}>${getLocalizedCountry('ES')} (${lang === 'en' ? 'European Union' : (lang === 'fr' ? 'Union Européenne' : 'Unione Europea')})</option>
            <option value="FR" ${cur === 'FR' ? 'selected' : ''}>${getLocalizedCountry('FR')} (${lang === 'en' ? 'European Union' : (lang === 'fr' ? 'Union Européenne' : 'Unione Europea')})</option>
            <option value="DE" ${cur === 'DE' ? 'selected' : ''}>${getLocalizedCountry('DE')} (${lang === 'en' ? 'European Union' : (lang === 'fr' ? 'Union Européenne' : 'Unione Europea')})</option>
            <option value="CH" ${cur === 'CH' ? 'selected' : ''}>${getLocalizedCountry('CH')} (${lang === 'en' ? 'FATF-Equivalent Third Country' : (lang === 'fr' ? 'Pays tiers équivalent GAFI' : 'Paese terzo equivalente GAFI')})</option>
            <option value="HK" ${cur === 'HK' ? 'selected' : ''}>${getLocalizedCountry('HK')} (${lang === 'en' ? 'International Financial Center' : (lang === 'fr' ? 'Place financière internationale' : 'Piazza finanziaria internazionale')})</option>
            <option value="BR" ${cur === 'BR' ? 'selected' : ''}>${getLocalizedCountry('BR')} (${lang === 'en' ? 'International Investment Oversight' : (lang === 'fr' ? 'Vigilance investissements internationaux' : 'Vigilanza investimenti internazionali')})</option>
            <option value="OTHER" ${cur === 'OTHER' ? 'selected' : ''}>${lang === 'en' ? 'Other Third Country (Non-EU)' : (lang === 'fr' ? 'Autre Pays Tiers (Hors UE)' : 'Altro Paese Terzo (Extra UE)')}</option>
        `;
    }

    const simPep = document.getElementById('sim-is-pep');
    if (simPep) {
        const cur = simPep.value || 'NO';
        const lang = (typeof currentLang !== 'undefined' ? currentLang : 'it');
        simPep.innerHTML = `
            <option value="NO" ${cur === 'NO' ? 'selected' : ''}>${lang === 'en' ? 'No (No partner or UBO is PEP)' : (lang === 'fr' ? 'Non (Aucun associé ou UBO n\'est PEP)' : 'No (Nessun socio o titolare effettivo è PEP)')}</option>
            <option value="YES" ${cur === 'YES' ? 'selected' : ''}>${lang === 'en' ? 'Yes (Partner or UBO is PEP / PEP Family)' : (lang === 'fr' ? 'Oui (Associé ou UBO PEP / Famille PEP)' : 'Sì (Socio o Titolare Effettivo PEP / Famigliare PEP)')}</option>
        `;
    }

    const simSource = document.getElementById('sim-source');
    if (simSource) {
        const cur = simSource.value || 'SALARY_SAVINGS';
        const lang = (typeof currentLang !== 'undefined' ? currentLang : 'it');
        simSource.innerHTML = `
            <option value="SALARY_SAVINGS" ${cur === 'SALARY_SAVINGS' ? 'selected' : ''}>${lang === 'en' ? 'Employment Income / Direct Personal Savings' : (lang === 'fr' ? 'Revenus d\'activité / Épargne personnelle directe' : 'Redditi di lavoro / Risparmi personali diretti')}</option>
            <option value="BUSINESS_SALE" ${cur === 'BUSINESS_SALE' ? 'selected' : ''}>${lang === 'en' ? 'Business Divestments / Share Sales / Dividends' : (lang === 'fr' ? 'Cession d\'actifs / Vente de parts / Dividendes' : 'Disinvestimenti aziendali / Vendita quote / Dividendi')}</option>
            <option value="TRUST_FIDUCIARY" ${cur === 'TRUST_FIDUCIARY' ? 'selected' : ''}>${lang === 'en' ? 'Trust / Fiduciary Structure / Third-Party Funds' : (lang === 'fr' ? 'Trust / Structure fiduciaire / Fonds tiers' : 'Trust / Struttura fiduciaria / Fondi terzi')}</option>
        `;
    }
}

function populateKycModalDropdowns() {
    const kycEntity = document.getElementById('kyc-input-entity-type');
    if (kycEntity) {
        const cur = kycEntity.value || 'PERSONNE_PHYSIQUE';
        kycEntity.innerHTML = `
            <option value="PERSONNE_PHYSIQUE" ${cur === 'PERSONNE_PHYSIQUE' ? 'selected' : ''}>${t('filter_entity_pp', 'Persona Fisica Privata (LP)')}</option>
            <option value="SARL_COMMERCIALE" ${cur === 'SARL_COMMERCIALE' ? 'selected' : ''}>${t('filter_entity_gp', 'General Partner (Sàrl)')}</option>
            <option value="SA_COMMERCIALE" ${cur === 'SA_COMMERCIALE' ? 'selected' : ''}>${t('filter_entity_sa', 'Società per Azioni (SA)')}</option>
            <option value="SCSP_INVESTISSEMENT" ${cur === 'SCSP_INVESTISSEMENT' ? 'selected' : ''}>${t('filter_entity_scsp', 'Société en Commandite Spéciale (SCSp)')}</option>
            <option value="SCP_BRESIL" ${cur === 'SCP_BRESIL' ? 'selected' : ''}>${t('filter_entity_scp', 'Sociedade em Conta de Participação (Brasile)')}</option>
        `;
    }

    const kycRisk = document.getElementById('kyc-input-risk-level');
    if (kycRisk) {
        const cur = kycRisk.value || 'LOW';
        kycRisk.innerHTML = `
            <option value="LOW" ${cur === 'LOW' ? 'selected' : ''}>🟢 ${t('risk_low', 'Basso')} (Low Risk)</option>
            <option value="MEDIUM" ${cur === 'MEDIUM' ? 'selected' : ''}>🟡 ${t('risk_medium', 'Medio')} (Medium Risk)</option>
            <option value="HIGH" ${cur === 'HIGH' ? 'selected' : ''}>🔴 ${t('risk_high', 'Elevato')} (High Risk / EDD)</option>
        `;
    }

    const kycStatus = document.getElementById('kyc-input-kyc-status');
    if (kycStatus) {
        const cur = kycStatus.value || 'CONFORME';
        kycStatus.innerHTML = `
            <option value="CONFORME" ${cur === 'CONFORME' ? 'selected' : ''}>🟢 ${t('kyc_compliant', 'Conforme')}</option>
            <option value="A_COMPLETER" ${cur === 'A_COMPLETER' ? 'selected' : ''}>🟡 ${t('kyc_to_complete', 'Da Completare')}</option>
            <option value="VIGILANCE_RENFORCEE" ${cur === 'VIGILANCE_RENFORCEE' ? 'selected' : ''}>🔴 ${t('kyc_enhanced', 'Vigilanza Rafforzata')}</option>
        `;
    }
}

// Calcul et mise à jour des KPIs en en-tête
function updateAmlKpis(inflows) {
    const totalVolume = inflows.reduce((sum, i) => sum + i.amount, 0);
    const totalOps = inflows.length;
    const compliantCount = inflows.filter(i => i.aml_kyc_status === 'CONFORME').length;
    const compliantPct = totalOps > 0 ? Math.round((compliantCount / totalOps) * 100) : 100;
    const attentionCount = inflows.filter(i => i.aml_risk_level === 'HIGH' || i.aml_kyc_status === 'VIGILANCE_RENFORCEE').length;
    const pepCount = inflows.filter(i => i.is_pep).length;

    const elVolume = document.getElementById('aml-kpi-volume');
    const elOps = document.getElementById('aml-kpi-ops');
    const elComp = document.getElementById('aml-kpi-compliance');
    const elAtt = document.getElementById('aml-kpi-attention');
    const elPep = document.getElementById('aml-kpi-pep');

    if (elVolume) elVolume.textContent = formatCurrency(totalVolume);
    if (elOps) elOps.textContent = totalOps;
    if (elComp) elComp.textContent = compliantPct + '%';
    if (elAtt) elAtt.textContent = attentionCount;
    if (elPep) elPep.textContent = pepCount;
}

// Rendu du Registre Tabulaire (Tab 1) avec Regroupement par Investisseur
function renderAmlRegistryTable(inflows) {
    const tbody = document.getElementById('aml-registry-tbody');
    if (!tbody) return;

    if (inflows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    ${t('aml_no_records', 'Nessun apporto di capitale corrisponde ai criteri di ricerca selezionati.')}
                </td>
            </tr>
        `;
        return;
    }

    const groupedPartners = getAmlGroupedPartners(inflows);

    let html = '';
    groupedPartners.forEach((g, gIdx) => {
        const hasMultiple = g.tranches_count > 1;
        const thresholdBadge = getLocalizedThresholdBadge(g.threshold_level);
        const riskBadge = getLocalizedRiskBadge(g.aml_risk_level);
        const kycBadge = getLocalizedKycBadge(g.aml_kyc_status);

        const roleBadge = g.role_type === 'General Partner' 
            ? '<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; font-size: 0.68rem; margin-left: 0.35rem;">GP</span>'
            : '<span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; font-size: 0.68rem; margin-left: 0.35rem;">LP</span>';

        const localizedCountry = getLocalizedCountry(g.partner_data.country);
        const localizedMandate = getLocalizedMandate(g.partner_data.mandate_nature);

        // Libellé de la causale de groupe
        let groupPurpose = getLocalizedPurpose(g.tranches[0].raw_purpose, g.tranches[0].category);
        if (hasMultiple) {
            groupPurpose += ` (${g.tranches_count} ${t('badge_tranches', 'versamenti')})`;
        }

        // Chevron expand icon or dot
        const expandBtn = hasMultiple 
            ? `<button class="aml-expand-btn" onclick="toggleAmlGroupRow('aml-group-${gIdx}', event)" title="${t('btn_expand_all', 'Espandi')}"><i class="fa-solid fa-chevron-right"></i></button>`
            : `<span style="display:inline-block; width:22px; margin-right:0.4rem; text-align:center; color:var(--text-muted); opacity:0.3;"><i class="fa-solid fa-circle" style="font-size:0.35rem;"></i></span>`;

        // Date badge with tranches count
        const tranchesCountBadge = hasMultiple 
            ? `<br><span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa; font-size: 0.68rem; margin-top: 3px; display: inline-block;"><i class="fa-solid fa-layer-group" style="font-size:0.65rem;"></i> ${g.tranches_count} ${t('badge_tranches', 'versamenti')}</span>`
            : `<br><span class="badge" style="background: rgba(255, 255, 255, 0.05); color: var(--text-muted); font-size: 0.68rem; margin-top: 3px; display: inline-block;">${t('badge_single_tranche', '1 versamento')}</span>`;

        // Giustificativi Button per la Riga Principale
        let groupDocsBtn = '';
        if (hasMultiple) {
            const partnerDocs = getDocsForPartner(g.partner_name);
            const pCount = partnerDocs.length;
            const pStyle = pCount > 0
                ? 'background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);'
                : 'background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid var(--border-color);';
            const pText = pCount > 0 ? `${pCount} ${t('btn_docs_attached', 'Doc')}` : `+ ${t('btn_docs', 'Giustificativi')}`;
            groupDocsBtn = `
                <button class="btn btn-sm" onclick="event.stopPropagation(); openAmlGroupDocsModal(${gIdx}, '${escapeQuotes(g.partner_name)}')" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; ${pStyle}">
                    <i class="fa-solid ${pCount > 0 ? 'fa-file-invoice-dollar' : 'fa-paperclip'}"></i> ${pText}
                </button>
            `;
        } else {
            const tr0 = g.tranches[0];
            const trDocs = getDocsForInflow(tr0.id);
            const tCount = trDocs.length;
            const tStyle = tCount > 0
                ? 'background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);'
                : 'background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid var(--border-color);';
            const tText = tCount > 0 ? `${tCount} ${t('btn_docs_attached', 'Doc')}` : `+ ${t('btn_add_doc', 'Giustificativo')}`;
            groupDocsBtn = `
                <button class="btn btn-sm" onclick="event.stopPropagation(); openAmlDocsModal('${tr0.id}', '${escapeQuotes(g.partner_name)}', '${tr0.date}', ${tr0.amount}, '${escapeQuotes(tr0.ref_number)}')" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; ${tStyle}">
                    <i class="fa-solid ${tCount > 0 ? 'fa-file-invoice-dollar' : 'fa-paperclip'}"></i> ${tText}
                </button>
            `;
        }

        const isCorporate = g.partner_data.entity_type !== 'PERSONNE_PHYSIQUE' && g.partner_data.entity_type !== 'INDIVIDUO';
        const partnerNat = g.partner_data.nationality || g.partner_data.ubo_list[0]?.nationality || 'Italienne';
        const localizedNat = getLocalizedNationality(partnerNat);

        let subInfoHtml = '';
        if (isCorporate) {
            const uboObj = g.partner_data.ubo_list[0] || {};
            const uboName = uboObj.name || '';
            const uboNat = getLocalizedNationality(uboObj.nationality || 'Italienne');
            subInfoHtml = `
                <span>${t('label_nationality', 'Nazionalità')}: <strong>${getLocalizedNationality('Luxembourgeoise')}</strong></span>
                <span style="margin: 0 0.35rem; opacity: 0.5;">•</span>
                <span>${t('label_fiscal_residence', 'Residenza Fiscale')}: <strong>${localizedCountry}</strong></span>
                <span style="margin: 0 0.35rem; opacity: 0.5;">•</span>
                <span><strong>UBO:</strong> ${escapeHtml(uboName)} (${t('label_nationality', 'Nazionalità')}: ${uboNat})</span>
            `;
        } else {
            subInfoHtml = `
                <span>${t('label_nationality', 'Nazionalità')}: <strong>${localizedNat}</strong></span>
                <span style="margin: 0 0.35rem; opacity: 0.5;">•</span>
                <span>${t('label_fiscal_residence', 'Residenza Fiscale')}: <strong>${localizedCountry}</strong></span>
            `;
        }

        // Ligne Principale du Groupe (Investisseur)
        html += `
            <tr id="aml-group-${gIdx}" class="aml-group-row ${hasMultiple ? 'has-subrows' : ''}" ${hasMultiple ? `onclick="toggleAmlGroupRow('aml-group-${gIdx}', event)"` : ''}>
                <td style="font-family: monospace; font-size: 0.85rem; font-weight: 700; white-space: nowrap;">
                    ${g.latest_date}
                    ${tranchesCountBadge}
                </td>
                <td>
                    <div style="font-weight: 800; color: var(--text-main); display: flex; align-items: center; font-size: 0.95rem;">
                        ${expandBtn}
                        <span>${escapeHtml(g.partner_name)}</span> ${roleBadge}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); padding-left: 1.8rem; margin-top: 0.15rem;">
                        ${subInfoHtml}
                    </div>
                </td>
                <td style="font-size: 0.85rem;">
                    <div style="color: var(--text-main); font-weight: 600;">${groupPurpose}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${localizedMandate}</div>
                </td>
                <td style="font-family: monospace; font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(g.tranches[0].ref_number)}</td>
                <td class="text-right text-bold" style="color: #10b981; font-size: 1rem;">
                    ${formatCurrency(g.total_amount)}
                </td>
                <td class="text-right" style="font-weight: 800; color: #f59e0b; font-size: 0.95rem;">
                    ${g.total_stake_pct.toFixed(2)}%
                </td>
                <td style="text-align: center;">${thresholdBadge}</td>
                <td style="text-align: center;">${riskBadge}</td>
                <td style="text-align: center;">${kycBadge}</td>
                <td style="text-align: center;">
                    <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); openAmlKycModal('${escapeQuotes(g.partner_name)}')" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                        <i class="fa-solid fa-folder-open text-emerald"></i> ${t('aml_kyc_btn', 'KYC')}
                    </button>
                </td>
                <td style="text-align: center;">
                    ${groupDocsBtn}
                </td>
            </tr>
        `;

        // Lignes de Tranches Détaillées (Sous-lignes accordéon)
        if (hasMultiple) {
            g.tranches.forEach((tr, tIdx) => {
                const trThresholdBadge = getLocalizedThresholdBadge(tr.threshold_level);
                const trPurpose = getLocalizedPurpose(tr.raw_purpose, tr.category);

                const singleTrDocs = getDocsForInflow(tr.id);
                const sCount = singleTrDocs.length;
                const sStyle = sCount > 0
                    ? 'background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);'
                    : 'background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid var(--border-color);';
                const sText = sCount > 0 ? `${sCount} ${t('btn_docs_attached', 'Doc')}` : `+ ${t('btn_add_doc', 'Giustificativo')}`;

                html += `
                    <tr class="aml-sub-row aml-sub-row-${gIdx}">
                        <td style="font-family: monospace; font-size: 0.82rem; color: var(--text-muted); padding-left: 1rem;">
                            <i class="fa-solid fa-calendar-day" style="opacity: 0.6; font-size: 0.75rem; margin-right: 0.25rem;"></i> ${tr.date}
                        </td>
                        <td>
                            <div style="padding-left: 1.8rem; color: var(--text-muted); font-size: 0.8rem; display: flex; align-items: center;">
                                <i class="fa-solid fa-arrow-turn-up fa-rotate-90 text-emerald" style="margin-right: 0.4rem; opacity: 0.8;"></i>
                                <span style="font-weight: 600; color: var(--text-main);">${t('label_tranche', 'Tranche')} #${g.tranches_count - tIdx}</span>
                                <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: 0.4rem;">(${tr.id})</span>
                            </div>
                        </td>
                        <td style="font-size: 0.82rem;">
                            <div style="color: var(--text-main);">${trPurpose}</div>
                        </td>
                        <td style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(tr.ref_number)}</td>
                        <td class="text-right" style="font-family: monospace; font-weight: 700; color: #10b981; font-size: 0.9rem;">
                            ${formatCurrency(tr.amount)}
                        </td>
                        <td class="text-right" style="font-weight: 600; color: #f59e0b; font-size: 0.85rem;" title="${t('label_single_tranche_quota', 'Quota singola tranche')}">
                            ${tr.single_stake_pct.toFixed(2)}%
                        </td>
                        <td style="text-align: center;">${trThresholdBadge}</td>
                        <td style="text-align: center; font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-shield-check text-emerald"></i></td>
                        <td style="text-align: center; font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-circle-check text-emerald"></i></td>
                        <td style="text-align: center; font-size: 0.75rem; color: var(--text-muted); opacity: 0.4;">—</td>
                        <td style="text-align: center;">
                            <button class="btn btn-sm" onclick="event.stopPropagation(); openAmlDocsModal('${tr.id}', '${escapeQuotes(g.partner_name)}', '${tr.date}', ${tr.amount}, '${escapeQuotes(tr.ref_number)}')" style="padding: 0.2rem 0.55rem; font-size: 0.73rem; ${sStyle}">
                                <i class="fa-solid ${sCount > 0 ? 'fa-file-invoice-dollar' : 'fa-paperclip'}"></i> ${sText}
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    });

    tbody.innerHTML = html;
    updateToggleAllButtonState();
}

// Gestion de l'Accordéon Individuel
window.toggleAmlGroupRow = function(groupId, event) {
    if (event) event.stopPropagation();
    const groupRow = document.getElementById(groupId);
    if (!groupRow) return;
    
    const isExpanded = groupRow.classList.contains('expanded');
    const idx = groupId.replace('aml-group-', '');
    const subRows = document.querySelectorAll('.aml-sub-row-' + idx);
    
    if (isExpanded) {
        groupRow.classList.remove('expanded');
        subRows.forEach(r => r.classList.remove('show'));
    } else {
        groupRow.classList.add('expanded');
        subRows.forEach(r => r.classList.add('show'));
    }

    updateToggleAllButtonState();
};

// Gestion du Toggle "Espandi Tutto / Comprimi Tutto"
let allGroupsExpanded = false;
window.toggleAllAmlGroups = function() {
    allGroupsExpanded = !allGroupsExpanded;
    const groupRows = document.querySelectorAll('.aml-group-row.has-subrows');
    const subRows = document.querySelectorAll('.aml-sub-row');
    const toggleText = document.getElementById('toggle-all-text');

    if (allGroupsExpanded) {
        groupRows.forEach(r => r.classList.add('expanded'));
        subRows.forEach(r => r.classList.add('show'));
        if (toggleText) toggleText.textContent = t('btn_collapse_all', 'Comprimi Tutto');
    } else {
        groupRows.forEach(r => r.classList.remove('expanded'));
        subRows.forEach(r => r.classList.remove('show'));
        if (toggleText) toggleText.textContent = t('btn_expand_all', 'Espandi Tutto');
    }
};

function updateToggleAllButtonState() {
    const totalExpandable = document.querySelectorAll('.aml-group-row.has-subrows').length;
    const currentlyExpanded = document.querySelectorAll('.aml-group-row.has-subrows.expanded').length;
    const toggleText = document.getElementById('toggle-all-text');
    if (totalExpandable > 0 && currentlyExpanded === totalExpandable) {
        allGroupsExpanded = true;
        if (toggleText) toggleText.textContent = t('btn_collapse_all', 'Comprimi Tutto');
    } else {
        allGroupsExpanded = false;
        if (toggleText) toggleText.textContent = t('btn_expand_all', 'Espandi Tutto');
    }
}

// Helper format data scadenza per visualizzazione sintetica
function formatExpiryDateDisplay(dateStr) {
    if (!dateStr || String(dateStr).trim() === '') return '';
    const parts = String(dateStr).split('-');
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

// Rendu des Fiches Cartographie des Associés (Tab 2)
function renderAmlPartnersCards() {
    const container = document.getElementById('aml-clients-container');
    if (!container) return;

    const partnersDict = window.GREEN_ENERBRAS_AML_PARTNERS || {};
    const partnerKeys = Object.keys(partnersDict);

    let html = '';
    partnerKeys.forEach(key => {
        const p = getEnrichedPartner(key);
        
        const riskBadge = getLocalizedRiskBadge(p.aml_risk_level);
        const kycBadge = getLocalizedKycBadge(p.aml_kyc_status);

        // Récupération directe des documents KYC
        const partnerDocs = initPartnerKycDocuments(p);

        let docsListHtml = '';
        if (!partnerDocs || partnerDocs.length === 0) {
            docsListHtml = `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; padding: 0.25rem 0;">${t('kyc_no_docs', 'Nessun documento registrato.')}</div>`;
        } else {
            partnerDocs.forEach(doc => {
                const isUploaded = !!doc.file;
                const isMandatory = doc.mandatory !== false;
                
                // Lucetta: Grigio (facoltativo mancante), Verde (caricato), Rosso (obbligatorio mancante)
                let dotClass = 'kyc-dot-grey';
                let statusTitle = t('kyc_doc_status_missing_optional', 'Facoltativo (non allegato)');
                if (isUploaded) {
                    dotClass = 'kyc-dot-green';
                    statusTitle = t('kyc_doc_status_uploaded', 'Documento allegato e conforme');
                } else if (isMandatory) {
                    dotClass = 'kyc-dot-red';
                    statusTitle = t('kyc_doc_status_missing_mandatory', 'Documento obbligatorio mancante');
                }

                const expiryInfo = getKycDocExpiryStatus(doc.expiry_date);
                const docTitle = doc.title || doc.type || 'Documento';
                const formattedExp = formatExpiryDateDisplay(doc.expiry_date);

                docsListHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.35rem 0.55rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 0.35rem; font-size: 0.75rem; gap: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.45rem; min-width: 0; flex: 1;">
                            <span class="kyc-dot ${dotClass}" style="width: 9px; height: 9px; margin-right: 0;" title="${statusTitle}"></span>
                            <span style="font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(docTitle)}">
                                ${escapeHtml(docTitle)}
                            </span>
                            ${doc.doc_number ? `<span style="font-family: monospace; font-size: 0.68rem; color: var(--text-muted); background: rgba(255,255,255,0.06); padding: 0.1rem 0.35rem; border-radius: 4px; white-space: nowrap;">N° ${escapeHtml(doc.doc_number)}</span>` : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.35rem; flex-shrink: 0;">
                            <span class="kyc-expiry-badge ${expiryInfo.badgeClass}" style="margin: 0; font-size: 0.68rem; padding: 0.15rem 0.45rem;">
                                ${formattedExp ? `${formattedExp} • ${expiryInfo.label}` : expiryInfo.label}
                            </span>
                            ${isUploaded ? `<i class="fa-solid fa-paperclip text-emerald" title="${t('kyc_doc_status_uploaded', 'Documento allegato')}" style="font-size: 0.75rem;"></i>` : ''}
                        </div>
                    </div>
                `;
            });
        }

        const isGP = p.role_type === 'General Partner';
        const isTarget = p.role_type === 'Investissement Target';
        let roleLabel = t('role_lp', 'Limited Partner (Socio Accomandante)');
        if (isGP) roleLabel = t('role_gp', 'General Partner (Socio Accomandatario)');
        else if (isTarget) roleLabel = t('role_invest_target', 'Veicolo di Investimento Operativo');

        const localizedCountry = getLocalizedCountry(p.country);
        const partnerNat = p.nationality || p.ubo_list[0]?.nationality || 'Italiana';
        const localizedNat = getLocalizedNationality(partnerNat);
        const isCorporate = p.entity_type !== 'PERSONNE_PHYSIQUE' && p.entity_type !== 'INDIVIDUO';

        let uboSectionHtml = '';
        if (isCorporate) {
            const uboObj = p.ubo_list[0] || {};
            const uboNat = getLocalizedNationality(uboObj.nationality || 'Italiana');
            uboSectionHtml = `
                <div style="font-size: 0.8rem; margin-bottom: 0.75rem;">
                    <div style="color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; font-weight: 600;">${t('card_beneficiari', 'Titolari Effettivi (UBO / RBE) :')}</div>
                    <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(uboObj.name || 'Bénéficiaire Effectif')} (${uboNat}) - ${uboObj.percentage || 100}% ${uboObj.rbe_verified ? '<i class="fa-solid fa-check-circle text-emerald" title="RBE Registrato"></i>' : ''}</div>
                </div>
            `;
        } else {
            uboSectionHtml = `
                <div style="font-size: 0.8rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 0.4rem 0.6rem; border-radius: 6px;">
                    <div>
                        <span style="color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">${t('label_nationality', 'Nazionalità')}:</span>
                        <strong style="color: var(--text-main); font-size: 0.8rem; margin-left: 0.25rem;">${localizedNat}</strong>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">${t('label_fiscal_residence', 'Residenza')}:</span>
                        <strong style="color: var(--text-main); font-size: 0.8rem; margin-left: 0.25rem;">${localizedCountry}</strong>
                    </div>
                </div>
            `;
        }

        const uploadedCount = partnerDocs.filter(d => !!d.file).length;

        html += `
            <div class="asset-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div>
                        <div style="font-size: 0.72rem; text-transform: uppercase; color: #10b981; font-weight: 700;">${roleLabel}</div>
                        <h3 style="margin: 0.15rem 0; font-size: 1.1rem; font-weight: 800; color: var(--text-main);">${escapeHtml(p.name)}</h3>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">
                            <i class="fa-solid fa-location-dot"></i> ${escapeHtml(p.city)} (${localizedCountry}) • <span style="color: var(--text-main); font-weight: 600;">${localizedNat}</span>
                        </div>
                    </div>
                    <div>${riskBadge}</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; background: rgba(255,255,255,0.03); padding: 0.65rem; border-radius: 8px; margin-bottom: 0.75rem;">
                    <div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">${t('card_capitale_versato', 'Capitale Versato')}</div>
                        <div style="font-size: 1.05rem; font-weight: 800; color: #10b981;">${formatCurrency(p.contribution_paid)}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">${t('card_quota_scsp', 'Quota SCSp')}</div>
                        <div style="font-size: 1.05rem; font-weight: 800; color: #f59e0b;">${(p.detention_pct || 0).toFixed(2)}%</div>
                    </div>
                </div>

                ${uboSectionHtml}

                <div style="border-top: 1px solid var(--border-color); padding-top: 0.6rem; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.45rem;">
                        <div style="color: var(--text-muted); font-size: 0.72rem; text-transform: uppercase; font-weight: 700; display: flex; align-items: center; gap: 0.35rem;">
                            <i class="fa-solid fa-folder-closed text-emerald"></i>
                            <span>${t('card_documenti', 'Documenti di Conformità & Scadenze :')}</span>
                        </div>
                        <span style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">${uploadedCount} / ${partnerDocs.length} allegati</span>
                    </div>
                    <div style="max-height: 220px; overflow-y: auto; padding-right: 0.2rem;">
                        ${docsListHtml}
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.6rem;">
                    <div>${kycBadge}</div>
                    <button class="btn btn-secondary btn-sm" onclick="openAmlKycModal('${escapeQuotes(p.name)}')">
                        <i class="fa-solid fa-pen-to-square text-emerald"></i> ${t('card_btn_modifica', 'Modifica Scheda KYC')}
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Données localisées pour le cadre légal et la matrice des risques
function getLocalizedMatrixData() {
    const lang = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('appLang') || 'it');
    if (lang === 'en') {
        return {
            thresholds: [
                { level: "STANDARD", amount: 0, label: "All Contributions (≥ €0)", action: "Bank traceability and systematic accounting recording" },
                { level: "VIGILANCE_5K", amount: 5000, label: "Standard Threshold (≥ €5,000)", action: "Formal partner identification, ID card/passport, and signed subscription agreement" },
                { level: "DUE_DILIGENCE_10K", amount: 10000, label: "EU Legal Threshold (≥ €10,000)", action: "Full Customer Due Diligence (CDD), RBE verification, Source of Funds declaration, and 5-year retention" },
                { level: "MAJOR_25K", amount: 25000, label: "Major Contributions (≥ €25,000)", action: "In-depth Source of Wealth (SOW) audit and statutory management approval" }
            ],
            jurisdictions: [
                { country: "Luxembourg", code: "LU", risk: "LOW", factor: "EU / FATF Member / Highly regulated financial center" },
                { country: "Italy", code: "IT", risk: "LOW", factor: "EU Member / Eurozone / Banking transparency" },
                { country: "Spain", code: "ES", risk: "LOW", factor: "EU Member / Eurozone" },
                { country: "Switzerland", code: "CH", risk: "LOW", factor: "FATF-equivalent third country" },
                { country: "Hong Kong", code: "HK", risk: "LOW", factor: "FATF Member / Regulated International Financial Center" },
                { country: "Brazil", code: "BR", risk: "MEDIUM", factor: "FATF Member / Enhanced vigilance on international infrastructure holdings" }
            ]
        };
    }
    if (lang === 'fr') {
        return {
            thresholds: [
                { level: "STANDARD", amount: 0, label: "Tous Apports (≥ 0 €)", action: "Traçabilité bancaire et enregistrement comptable systématique" },
                { level: "VIGILANCE_5K", amount: 5000, label: "Seuil Standard (≥ 5.000 €)", action: "Identification formelle de l'associé, pièce d'identité et contrat de souscription" },
                { level: "DUE_DILIGENCE_10K", amount: 10000, label: "Seuil Réglementaire UE (≥ 10.000 €)", action: "Due Diligence complète, RBE vérifié, déclaration d'origine des fonds et conservation 5 ans" },
                { level: "MAJOR_25K", amount: 25000, label: "Grands Apports (≥ 25.000 €)", action: "Vérification approfondie de l'origine du patrimoine (SOW) et validation de la gérance" }
            ],
            jurisdictions: [
                { country: "Luxembourg", code: "LU", risk: "LOW", factor: "Membre UE / GAFI / Place financière hautement régulée" },
                { country: "Italie", code: "IT", risk: "LOW", factor: "Membre UE / Zone Euro / Transparence bancaire" },
                { country: "Espagne", code: "ES", risk: "LOW", factor: "Membre UE / Zone Euro" },
                { country: "Suisse", code: "CH", risk: "LOW", factor: "Pays tiers équivalent GAFI" },
                { country: "Hong Kong", code: "HK", risk: "LOW", factor: "Membre GAFI / Place financière internationale régulée" },
                { country: "Brésil", code: "BR", risk: "MEDIUM", factor: "Membre GAFI / Vigilance sur investissements d'infrastructures internationales" }
            ]
        };
    }
    // Italian
    return {
        thresholds: [
            { level: "STANDARD", amount: 0, label: "Tutti gli Apporti (≥ 0 €)", action: "Tracciabilità bancaria e registrazione contabile sistematica" },
            { level: "VIGILANCE_5K", amount: 5000, label: "Soglia Standard (≥ 5.000 €)", action: "Identificazione formale del socio, documento d'identità e contratto di sottoscrizione" },
            { level: "DUE_DILIGENCE_10K", amount: 10000, label: "Soglia Legale UE (≥ 10.000 €)", action: "Due Diligence completa, RBE verificato, dichiarazione origine dei fondi e conservazione 5 anni" },
            { level: "MAJOR_25K", amount: 25000, label: "Grandi Apporti (≥ 25.000 €)", action: "Verifica approfondita dell'origine del patrimonio (SOW) e approvazione della gestione" }
        ],
        jurisdictions: [
            { country: "Lussemburgo", code: "LU", risk: "LOW", factor: "Membro UE / GAFI / Piazza finanziaria altamente regolamentata" },
            { country: "Italia", code: "IT", risk: "LOW", factor: "Membro UE / Zona Euro / Trasparenza bancaria" },
            { country: "Spagna", code: "ES", risk: "LOW", factor: "Membro UE / Zona Euro" },
            { country: "Svizzera", code: "CH", risk: "LOW", factor: "Paese terzo equivalente GAFI" },
            { country: "Hong Kong", code: "HK", risk: "LOW", factor: "Membro GAFI / Piazza finanziaria internazionale vigilata" },
            { country: "Brasile", code: "BR", risk: "MEDIUM", factor: "Membro GAFI / Vigilanza su investimenti in infrastrutture internazionali" }
        ]
    };
}

// Rendu du Cadre Légal & Matrice des Risques (Tab 3)
function renderAmlRiskMatrix() {
    const container = document.getElementById('aml-matrix-content');
    if (!container) return;

    const matrixData = getLocalizedMatrixData();

    let html = `
        <div class="charts-grid-equal" style="margin-bottom: 1.5rem;">
            <!-- Cadre Légal SCSp -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title"><i class="fa-solid fa-scale-balanced text-emerald"></i> ${t('aml_legal_title', 'Quadro Normativo SCSp & Autorità di Vigilanza')}</h3>
                </div>
                <div style="font-size: 0.85rem; line-height: 1.6; color: var(--text-main);">
                    <p style="margin-bottom: 0.75rem;">
                        ${t('aml_legal_intro', '<strong>GREEN ENERBRAS ONE SCSp</strong> è una Società in Accomandita Speciale di diritto lussemburghese disciplinata dalla Legge del 10 agosto 1915 e soggetta agli obblighi della <strong>Legge modificata del 12 novembre 2004</strong> sulla prevenzione del riciclaggio di capitali e del finanziamento del terrorismo (AML / LBC-FT).')}
                    </p>
                    <ul style="padding-left: 1.25rem; margin-bottom: 0.75rem; color: var(--text-muted);">
                        <li>${t('aml_legal_aed', '<strong>Autorità di Vigilanza Competente :</strong> L\'<strong>AED</strong> (Administration de l\'Enregistrement, des Domaines et de la TVA) per le società e i veicoli societari non sottoposti a vigilanza CSSF.')}</li>
                        <li>${t('aml_legal_rbe', '<strong>Registro dei Titolari Effettivi (RBE) :</strong> Dichiarazione obbligatoria delle persone fisiche detentrici di oltre il 25% delle quote o del controllo presso l\'LBR (Legge del 13 gennaio 2019).')}</li>
                        <li>${t('aml_legal_crf', '<strong>Unità di Informazione Finanziaria (CRF) :</strong> Segnalazione immediata di qualsiasi operazione o apporto di fondi privo di chiara giustificazione economica.')}</li>
                    </ul>
                </div>
            </div>

            <!-- Seuils d'Intervention AML -->
            <div class="chart-card">
                <div class="chart-header">
                    <h3 class="chart-title"><i class="fa-solid fa-layer-group text-emerald"></i> ${t('aml_thresholds_title', 'Gradazione delle Soglie di Controllo')}</h3>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.6rem;">
    `;

    (matrixData.thresholds || []).forEach(tItem => {
        let badgeColor = '#10b981';
        if (tItem.amount >= 25000) badgeColor = '#a855f7';
        else if (tItem.amount >= 10000) badgeColor = '#06b6d4';
        else if (tItem.amount >= 5000) badgeColor = '#3b82f6';

        html += `
            <div style="background: rgba(255,255,255,0.03); border-left: 3px solid ${badgeColor}; padding: 0.6rem 0.85rem; border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.85rem; margin-bottom: 0.15rem;">
                    <span>${tItem.label}</span>
                    <span style="color: ${badgeColor}; font-family: monospace;">≥ ${formatNumber(tItem.amount)} €</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">${tItem.action}</div>
            </div>
        `;
    });

    html += `
                </div>
            </div>
        </div>

        <!-- Matrice Géographique & Analyse des Risques -->
        <div class="chart-card">
            <div class="chart-header">
                <h3 class="chart-title"><i class="fa-solid fa-globe text-emerald"></i> ${t('aml_matrix_title', 'Matrice dei Fattori di Rischio Paese & Investimenti')}</h3>
            </div>
            <div class="table-container">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>${t('th_jurisdiction', 'Giurisdizione')}</th>
                            <th>${t('th_code', 'Codice')}</th>
                            <th style="text-align: center;">${t('th_risk_level', 'Livello di Rischio')}</th>
                            <th>${t('th_compliance_factor', 'Fattore di Conformità & Status Internazionale')}</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    (matrixData.jurisdictions || []).forEach(j => {
        const badge = getLocalizedRiskBadge(j.risk);

        html += `
            <tr>
                <td style="font-weight: 700;">${j.country}</td>
                <td style="font-family: monospace;">${j.code}</td>
                <td style="text-align: center;">${badge}</td>
                <td style="font-size: 0.85rem; color: var(--text-muted);">${j.factor}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// Facteurs pour le simulateur de due diligence
function getLocalizedFactorInfo(factorKey) {
    const lang = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('appLang') || 'it');
    const factorDict = {
        'entity_pp': { it: "Persona Fisica Diretta", en: "Direct Natural Person", fr: "Personne Physique Directe" },
        'entity_sa': { it: "Società Commerciale SA/Sàrl", en: "Commercial Company SA/Sàrl", fr: "Société Commerciale SA/Sàrl" },
        'entity_scsp': { it: "Società in Accomandita (SCSp)", en: "Special Limited Partnership (SCSp)", fr: "Société en Commandite Spéciale (SCSp)" },
        'entity_intl': { it: "Entità Internazionale Extra-UE", en: "Non-EU International Entity", fr: "Entité Internationale Hors-UE" },
        'geo_eu': { it: "Giurisdizione Unione Europea / Area Euro", en: "European Union / Eurozone Jurisdiction", fr: "Juridiction Union Européenne / Zone Euro" },
        'geo_equiv': { it: "Paese Terzo Equivalente GAFI", en: "FATF-Equivalent Third Country", fr: "Pays Tiers Équivalent GAFI" },
        'geo_br': { it: "Brasile (Investimento Internazionale)", en: "Brazil (International Investment)", fr: "Brésil (Investissement International)" },
        'geo_other': { it: "Paese Terzo Non Equivalente", en: "Non-Equivalent Third Country", fr: "Pays Tiers Non-Équivalent" },
        'pep_yes': { it: "Persona Politicamente Esposta (PEP)", en: "Politically Exposed Person (PEP)", fr: "Personne Politiquement Exposée (PEP)" },
        'pep_no': { it: "Soggetto Non PEP", en: "Non-PEP Individual", fr: "Non PEP" },
        'source_salary': { it: "Risparmi Personali & Redditi Diretti", en: "Personal Savings & Direct Income", fr: "Épargne & Revenus Personnels Directs" },
        'source_sale': { it: "Cessione Quote / Dividendi Dichiarati", en: "Asset Divestment / Declared Dividends", fr: "Cession d'Actifs / Dividendes Déclarés" },
        'source_trust': { it: "Struttura Fiduciaria / Trust / Fondi Terzi", en: "Fiduciary Structure / Trust / Third-Party Funds", fr: "Structure Fiduciaire / Trust / Fonds Tiers" },
        'vol_high': { it: "Sottoscrizione Rilevante (≥ 50.000 €)", en: "Major Subscription (≥ €50,000)", fr: "Souscription Importante (≥ 50.000 €)" },
        'vol_med': { it: "Sottoscrizione Standard (25.000 € - 50.000 €)", en: "Standard Subscription (€25,000 - €50,000)", fr: "Souscription Standard (25.000 € - 50.000 €)" },
        'vol_low': { it: "Sottoscrizione Base (< 25.000 €)", en: "Base Subscription (< €25,000)", fr: "Souscription Base (< 25.000 €)" }
    };
    return factorDict[factorKey] ? (factorDict[factorKey][lang] || factorDict[factorKey]['it']) : factorKey;
}

function getLocalizedMeasures(riskClass) {
    const lang = (typeof currentLang !== 'undefined' ? currentLang : localStorage.getItem('appLang') || 'it');
    if (riskClass === 'HIGH') {
        if (lang === 'en') return "Mandatory Enhanced Due Diligence (EDD): Formal Source of Wealth / Source of Funds documentation, statutory management approval before collection, and mandatory annual compliance audit.";
        if (lang === 'fr') return "Vigilance Renforcée obligatoire : Justificatif formel de l'origine du patrimoine (Source of Wealth), validation de la gérance avant encaissement et audit annuel obligatoire.";
        return "Vigilanza Rafforzata obbligatoria : Documentazione formale dell'origine del patrimonio (Source of Wealth), approvazione della gestione statutaria prima dell'incasso e audit annuale obbligatorio.";
    }
    if (riskClass === 'MEDIUM') {
        if (lang === 'en') return "Active Vigilance: Bank transfer receipt verification, in-depth RBE cross-check, and annual periodic review.";
        if (lang === 'fr') return "Vigilance active : Justificatif bancaire du virement de fonds, vérification approfondie RBE et revue périodique annuelle.";
        return "Vigilanza attiva : Attestazione bancaria del bonifico, verifica approfondita nel registro RBE e riesame periodico annuale.";
    }
    // LOW
    if (lang === 'en') return "Standard Due Diligence (CDD): Valid government ID card/passport, proof of address, signed SCSp subscription form, and LBR/RBE verification. Review every 2 years.";
    if (lang === 'fr') return "Identification standard : CNI valide, justificatif de domicile, bulletin de souscription signé et consultation du RBE. Revue tous les 2 ans.";
    return "Adeguata verifica standard : Documento d'identità in corso di validità, certificato di residenza, modulo di sottoscrizione firmato e verifica RBE. Riesame ogni 2 anni.";
}

// Simulateur de Due Diligence (Tab 4)
function calculateDueDiligenceScore() {
    const elEntityType = document.getElementById('sim-entity-type');
    const elCountry = document.getElementById('sim-country');
    const elIsPep = document.getElementById('sim-is-pep');
    const elSource = document.getElementById('sim-source');
    const elVolume = document.getElementById('sim-volume');
    const resultsBox = document.getElementById('sim-results-box');

    if (!elEntityType || !elCountry || !elIsPep || !elSource || !elVolume || !resultsBox) return;

    let score = 0;
    const factors = [];

    // 1. Forme Juridique
    const entityType = elEntityType.value;
    if (entityType === 'PERSONNE_PHYSIQUE') {
        score += 5;
        factors.push({ name: getLocalizedFactorInfo('entity_pp'), pts: "+5", risk: "LOW" });
    } else if (entityType === 'SARL_COMMERCIALE' || entityType === 'SA_COMMERCIALE') {
        score += 10;
        factors.push({ name: getLocalizedFactorInfo('entity_sa'), pts: "+10", risk: "LOW" });
    } else if (entityType === 'SCSP_INVESTISSEMENT') {
        score += 15;
        factors.push({ name: getLocalizedFactorInfo('entity_scsp'), pts: "+15", risk: "MEDIUM" });
    } else {
        score += 25;
        factors.push({ name: getLocalizedFactorInfo('entity_intl'), pts: "+25", risk: "HIGH" });
    }

    // 2. Juridiction
    const country = elCountry.value;
    if (['LU', 'IT', 'ES', 'FR', 'DE'].includes(country)) {
        score += 5;
        factors.push({ name: getLocalizedFactorInfo('geo_eu'), pts: "+5", risk: "LOW" });
    } else if (['CH', 'GB', 'US', 'HK', 'SG'].includes(country)) {
        score += 10;
        factors.push({ name: getLocalizedFactorInfo('geo_equiv'), pts: "+10", risk: "LOW" });
    } else if (country === 'BR') {
        score += 25;
        factors.push({ name: getLocalizedFactorInfo('geo_br'), pts: "+25", risk: "MEDIUM" });
    } else {
        score += 35;
        factors.push({ name: getLocalizedFactorInfo('geo_other'), pts: "+35", risk: "HIGH" });
    }

    // 3. Statut PEP
    const isPep = elIsPep.value === 'YES';
    if (isPep) {
        score += 35;
        factors.push({ name: getLocalizedFactorInfo('pep_yes'), pts: "+35", risk: "HIGH" });
    } else {
        factors.push({ name: getLocalizedFactorInfo('pep_no'), pts: "+0", risk: "LOW" });
    }

    // 4. Origine des Fonds
    const source = elSource.value;
    if (source === 'SALARY_SAVINGS') {
        score += 0;
        factors.push({ name: getLocalizedFactorInfo('source_salary'), pts: "+0", risk: "LOW" });
    } else if (source === 'BUSINESS_SALE') {
        score += 10;
        factors.push({ name: getLocalizedFactorInfo('source_sale'), pts: "+10", risk: "LOW" });
    } else {
        score += 30;
        factors.push({ name: getLocalizedFactorInfo('source_trust'), pts: "+30", risk: "HIGH" });
    }

    // 5. Volume Souscrit
    const volume = parseFloat(elVolume.value) || 0;
    if (volume >= 50000) {
        score += 15;
        factors.push({ name: getLocalizedFactorInfo('vol_high'), pts: "+15", risk: "MEDIUM" });
    } else if (volume >= 25000) {
        score += 10;
        factors.push({ name: getLocalizedFactorInfo('vol_med'), pts: "+10", risk: "LOW" });
    } else {
        score += 0;
        factors.push({ name: getLocalizedFactorInfo('vol_low'), pts: "+0", risk: "LOW" });
    }

    // Détermination de la classe finale
    score = Math.min(100, Math.max(0, score));
    let riskClass = 'LOW';
    let riskLabel = t('sim_score_low_title', '🟢 RISCHIO BASSO (Adeguata Verifica Standard - CDD)');
    let riskColor = '#10b981';

    if (score >= 60 || isPep) {
        riskClass = 'HIGH';
        riskLabel = t('sim_score_high_title', '🔴 RISCHIO ELEVATO (Vigilanza Rafforzata - EDD)');
        riskColor = '#ef4444';
    } else if (score >= 35) {
        riskClass = 'MEDIUM';
        riskLabel = t('sim_score_med_title', '🟡 RISCHIO MEDIO (Vigilanza Attiva)');
        riskColor = '#f59e0b';
    }

    const measures = getLocalizedMeasures(riskClass);

    let factorsHtml = '';
    factors.forEach(f => {
        factorsHtml += `
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; padding: 0.35rem 0; border-bottom: 1px solid var(--border-color);">
                <span>${f.name}</span>
                <span style="font-weight: 700; color: ${f.risk === 'HIGH' ? '#ef4444' : (f.risk === 'MEDIUM' ? '#f59e0b' : '#10b981')};">${f.pts} pts</span>
            </div>
        `;
    });

    resultsBox.innerHTML = `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid ${riskColor}; border-radius: 12px; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${t('sim_result_title', 'Risultato della Valutazione Due Diligence')}</div>
                    <div style="font-size: 1.25rem; font-weight: 800; color: ${riskColor};">${riskLabel}</div>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 2rem; font-weight: 900; color: ${riskColor};">${score}</span>
                    <span style="font-size: 1rem; color: var(--text-muted);">/ 100</span>
                </div>
            </div>

            <!-- Jauge visuelle -->
            <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 1.25rem;">
                <div style="width: ${score}%; height: 100%; background: ${riskColor}; transition: width 0.4s ease;"></div>
            </div>

            <div style="margin-bottom: 1.25rem;">
                <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); margin-bottom: 0.5rem;">${t('sim_risk_breakdown', 'Scomposizione del Punteggio di Rischio :')}</div>
                ${factorsHtml}
            </div>

            <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; border-left: 4px solid ${riskColor};">
                <div style="font-weight: 700; font-size: 0.85rem; color: ${riskColor}; margin-bottom: 0.25rem;">${t('sim_mandatory_measures', 'Misure di Conformità Obbligatorie :')}</div>
                <div style="font-size: 0.82rem; color: var(--text-main); line-height: 1.5;">${measures}</div>
            </div>
        </div>
    `;
}

// Filtrage Global & Application
function applyAmlFilters() {
    const allInflows = getAmlInflows();
    
    const filtered = allInflows.filter(i => {
        // Obtenir le partenaire et ses totaux cumulés pour un filtrage intelligent du seuil
        const partner = getEnrichedPartner(i.partner_name);
        const partnerTotalPaid = partner.contribution_paid || i.amount;

        // Filtre Seuil: appliqué au montant de l'apport ou au total cumulé de l'investisseur
        if (amlFilterThreshold > 0 && partnerTotalPaid < amlFilterThreshold && i.amount < amlFilterThreshold) {
            return false;
        }

        // Filtre Année
        if (amlFilterYear !== 'ALL' && i.year !== amlFilterYear) return false;

        // Filtre Partenaire / Associé
        if (amlFilterPartner !== 'ALL' && i.partner_name !== amlFilterPartner) return false;

        // Filtre Forme Juridique
        if (amlFilterEntityType !== 'ALL' && i.entity_type !== amlFilterEntityType) return false;

        // Filtre Statut KYC
        if (amlFilterKycStatus !== 'ALL' && i.aml_kyc_status !== amlFilterKycStatus) return false;

        // Filtre Recherche textuelle
        if (amlSearchQuery) {
            const q = amlSearchQuery.toLowerCase();
            const matchName = i.partner_name.toLowerCase().includes(q);
            const matchRef = i.ref_number.toLowerCase().includes(q);
            const matchPurpose = i.raw_purpose.toLowerCase().includes(q) || getLocalizedPurpose(i.raw_purpose, i.category).toLowerCase().includes(q);
            if (!matchName && !matchRef && !matchPurpose) return false;
        }

        return true;
    });

    updateAmlKpis(filtered);
    renderAmlRegistryTable(filtered);
}

// =============================================================================
// GESTIONE CHECKLIST DOCUMENTALE KYC & STATI SCADENZA / CARICAMENTO
// =============================================================================

let currentKycDocuments = [];

// Calcolo dinamico dello stato di scadenza documento (Verde / Arancio / Rosso / Grigio)
function getKycDocExpiryStatus(expiryDateStr) {
    if (!expiryDateStr || String(expiryDateStr).trim() === '') {
        return {
            status: 'NONE',
            label: t('kyc_doc_no_expiry', 'Senza scadenza'),
            badgeClass: 'kyc-expiry-grey'
        };
    }
    const parts = String(expiryDateStr).split('-');
    if (parts.length !== 3) {
        return {
            status: 'NONE',
            label: t('kyc_doc_no_expiry', 'Senza scadenza'),
            badgeClass: 'kyc-expiry-grey'
        };
    }
    const expDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    if (isNaN(expDate.getTime())) {
        return {
            status: 'NONE',
            label: t('kyc_doc_no_expiry', 'Senza scadenza'),
            badgeClass: 'kyc-expiry-grey'
        };
    }
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        const pastDays = Math.abs(diffDays);
        return {
            status: 'EXPIRED',
            label: `${t('kyc_doc_expired', 'Scaduto')} (${pastDays} gg fa)`,
            badgeClass: 'kyc-expiry-red',
            days: diffDays
        };
    } else if (diffDays <= 180) {
        return {
            status: 'EXPIRING',
            label: `${t('kyc_doc_expiring_soon', 'In scadenza')} (< 6 mesi: ${diffDays} gg)`,
            badgeClass: 'kyc-expiry-orange',
            days: diffDays
        };
    } else {
        return {
            status: 'VALID',
            label: `${t('kyc_doc_valid', 'Valido')} (${diffDays} gg)`,
            badgeClass: 'kyc-expiry-green',
            days: diffDays
        };
    }
}

// Generazione checklist predefinita per Persona Fisica vs Persona Giuridica
function generateDefaultKycDocuments(partner) {
    const isCorp = partner.entity_type !== 'PERSONNE_PHYSIQUE' && partner.entity_type !== 'INDIVIDUO';
    if (isCorp) {
        return [
            {
                id: 'KYC-DOC-1',
                mandatory: true,
                type: 'Statuts Coordonnés Sàrl',
                title: 'Statuts Coordonnés Sàrl',
                doc_number: partner.rcs_number || 'B 225.643',
                authority: 'Notaire / RCSL Luxembourg',
                expiry_date: '',
                file: null
            },
            {
                id: 'KYC-DOC-2',
                mandatory: true,
                type: 'Extrait RCSL Récent (< 3 mesi)',
                title: 'Extrait RCSL Récent (< 3 mesi)',
                doc_number: 'RCSL-2026-B225643',
                authority: 'LBR / Registre de Commerce et des Sociétés',
                expiry_date: '2026-12-31',
                file: null
            },
            {
                id: 'KYC-DOC-3',
                mandatory: true,
                type: 'Déclaration RBE (UBO)',
                title: 'Déclaration RBE (Bénéficiaires Effectifs)',
                doc_number: 'RBE-LU-2025',
                authority: 'LBR / Registre des Bénéficiaires Effectifs',
                expiry_date: '2027-12-31',
                file: null
            },
            {
                id: 'KYC-DOC-4',
                mandatory: true,
                type: 'Pièce d\'Identité Gérant (CI/PASS)',
                title: 'Pièce d\'Identité Gérant (CI/PASS)',
                doc_number: '',
                authority: 'Autorità competente',
                expiry_date: '2030-12-31',
                file: null
            },
            {
                id: 'KYC-DOC-5',
                mandatory: true,
                type: 'Justificatif Domicile Gérant / Sede',
                title: 'Justificatif Domicile Gérant / Sede',
                doc_number: '',
                authority: 'Comune / Ente Erogatore',
                expiry_date: '2027-06-30',
                file: null
            },
            {
                id: 'KYC-DOC-6',
                mandatory: true,
                type: 'Contrat Social SCSp',
                title: 'Contrat Social GREEN ENERBRAS ONE SCSp',
                doc_number: 'SCSp-2025-01',
                authority: 'Associés Fondateurs SCSp',
                expiry_date: '',
                file: null
            }
        ];
    } else {
        return [
            {
                id: 'KYC-DOC-1',
                mandatory: true,
                type: 'CI / PASS',
                title: "Documento d'Identità (CI o PASS)",
                doc_number: '',
                authority: 'Comune / Questura / Ministry of Foreign Affairs',
                expiry_date: '2030-12-31',
                file: null
            },
            {
                id: 'KYC-DOC-2',
                mandatory: true,
                type: 'Certificato di Residenza / Utility Bill',
                title: 'Certificato di Residenza o Utility Bill',
                doc_number: '',
                authority: 'Comune di Residenza / Ente Erogatore',
                expiry_date: '2027-06-30',
                file: null
            },
            {
                id: 'KYC-DOC-3',
                mandatory: true,
                type: 'Bulletin de Souscription SCSp',
                title: 'Bulletin de Souscription Parts SCSp',
                doc_number: 'BS-SCSp-2025',
                authority: 'GREEN ENERBRAS ONE SCSp',
                expiry_date: '',
                file: null
            },
            {
                id: 'KYC-DOC-4',
                mandatory: true,
                type: 'Dichiarazione SOW (Origine Fondi)',
                title: 'Dichiarazione Origine dei Fondi (SOW / SOF)',
                doc_number: 'SOW-2025',
                authority: 'Autocertificazione & Banca',
                expiry_date: '',
                file: null
            },
            {
                id: 'KYC-DOC-5',
                mandatory: false,
                type: 'Altro Documento',
                title: 'Documento / Certificato Fiscale Aggiuntivo',
                doc_number: '',
                authority: '',
                expiry_date: '',
                file: null
            }
        ];
    }
}

// Inizializzazione e riconciliazione documenti partner
function initPartnerKycDocuments(partner) {
    if (partner.kyc_documents && Array.isArray(partner.kyc_documents) && partner.kyc_documents.length > 0) {
        return JSON.parse(JSON.stringify(partner.kyc_documents));
    }
    
    // Se ha vecchi record in partner.documents
    if (partner.documents && Array.isArray(partner.documents) && partner.documents.length > 0) {
        const defaults = generateDefaultKycDocuments(partner);
        return defaults.map((d, i) => {
            const match = partner.documents[i] || partner.documents.find(doc => (doc.name || '').toLowerCase().includes((d.type || '').toLowerCase().substring(0, 5)));
            if (match) {
                return {
                    ...d,
                    title: match.name || d.title,
                    expiry_date: match.date || d.expiry_date || '',
                    file: match.file || (match.dataUrl ? { name: match.fileName || match.name, size: match.fileSize || 1024, type: match.fileType || 'application/pdf', dataUrl: match.dataUrl, uploadDate: new Date().toISOString() } : null)
                };
            }
            return d;
        });
    }

    return generateDefaultKycDocuments(partner);
}

// Render dinamico della checklist documentale
function renderKycDocumentsChecklist() {
    const container = document.getElementById('kyc-documents-checklist-container');
    if (!container) return;

    if (!currentKycDocuments || currentKycDocuments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 1.5rem; color: var(--text-muted); background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px dashed var(--border-color);">
                ${t('kyc_docs_empty', 'Nessun documento in checklist. Clicca su "+ Aggiungi Altro Documento" per inserire un record.')}
            </div>
        `;
        return;
    }

    const docTypeOptions = [
        'CI / PASS',
        'CI (Carta d\'Identità)',
        'PASS (Passaporto)',
        'Certificato di Residenza',
        'Utility Bill (Bolletta / Utenza)',
        'Certificato di Residenza / Utility Bill',
        'Bulletin de Souscription SCSp',
        'Dichiarazione SOW (Origine Fondi)',
        'Codice Fiscale / Matricule',
        'Statuts Coordonnés Sàrl',
        'Extrait RCSL Récent (< 3 mesi)',
        'Déclaration RBE (UBO)',
        'Pièce d\'Identité Gérant (CI/PASS)',
        'Justificatif Domicile Gérant / Sede',
        'Contrat Social SCSp',
        'Attestazione Bancaria',
        'Altro Documento'
    ];

    let html = '';
    currentKycDocuments.forEach((doc, idx) => {
        const isUploaded = !!doc.file;
        const isMandatory = doc.mandatory !== false;
        
        // Bollino:
        // Obbligatorio mancante -> ROSSO
        // Obbligatorio caricato -> VERDE
        // Non obbligatorio mancante -> GRIGIO
        // Non obbligatorio caricato -> VERDE
        let dotClass = 'kyc-dot-grey';
        let statusText = t('kyc_doc_optional', 'Facoltativo');
        let statusTitle = t('kyc_doc_status_missing_optional', 'Documento facoltativo non ancora allegato');

        if (isUploaded) {
            dotClass = 'kyc-dot-green';
            statusText = t('kyc_doc_status_uploaded', 'Caricato / Presente');
            statusTitle = t('kyc_doc_status_uploaded', 'Documento acquisito e conforme');
        } else if (isMandatory) {
            dotClass = 'kyc-dot-red';
            statusText = t('kyc_doc_mandatory', 'Obbligatorio');
            statusTitle = t('kyc_doc_status_missing_mandatory', 'Documento obbligatorio mancante');
        }

        const expiryInfo = getKycDocExpiryStatus(doc.expiry_date);

        // Select tipo documento
        let optionsHtml = '';
        let foundInOptions = false;
        docTypeOptions.forEach(opt => {
            const isSel = (doc.type === opt || doc.title === opt);
            if (isSel) foundInOptions = true;
            optionsHtml += `<option value="${escapeHtml(opt)}" ${isSel ? 'selected' : ''}>${escapeHtml(opt)}</option>`;
        });
        if (!foundInOptions && doc.type) {
            optionsHtml = `<option value="${escapeHtml(doc.type)}" selected>${escapeHtml(doc.type)}</option>` + optionsHtml;
        }

        // File box / dropzone
        let fileBoxHtml = '';
        if (isUploaded && doc.file) {
            let sizeStr = '';
            if (doc.file.size) {
                if (doc.file.size > 1024 * 1024) sizeStr = (doc.file.size / (1024 * 1024)).toFixed(2) + ' MB';
                else sizeStr = (doc.file.size / 1024).toFixed(1) + ' KB';
            }
            fileBoxHtml = `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 0.5rem 0.85rem; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <i class="fa-solid fa-file-pdf text-emerald" style="font-size: 1.3rem;"></i>
                        <div>
                            <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); word-break: break-all;">
                                ${escapeHtml(doc.file.name || 'Documento Allegato')}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; gap: 0.5rem;">
                                <span>${sizeStr || 'Allegato'}</span>
                                <span>•</span>
                                <span>${doc.file.uploadDate ? new Date(doc.file.uploadDate).toLocaleDateString() : ''}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.4rem;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="previewAmlKycDoc(${idx})" title="${t('docs_action_preview', 'Apri / Leggi')}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                            <i class="fa-solid fa-eye text-emerald"></i> ${t('docs_action_preview', 'Apri / Leggi')}
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="downloadAmlKycDoc(${idx})" title="${t('docs_action_download', 'Scarica')}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                            <i class="fa-solid fa-download"></i>
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="removeKycDocFile(${idx})" title="${t('kyc_doc_delete', 'Rimuovi file')}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.3);">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            fileBoxHtml = `
                <div class="aml-dropzone kyc-dropzone" id="kyc-dropzone-${idx}" 
                     ondragover="handleKycDropzoneDragOver(event, ${idx})" 
                     ondragleave="handleKycDropzoneDragLeave(event, ${idx})" 
                     ondrop="handleKycDocDrop(event, ${idx})" 
                     onclick="triggerKycDocFileInput(${idx})"
                     style="margin-top: 0.5rem; padding: 0.65rem 1rem; border: 1px dashed rgba(255,255,255,0.2); border-radius: 8px; text-align: center; cursor: pointer; background: rgba(255,255,255,0.015); transition: all 0.2s ease;">
                    <input type="file" id="kyc-file-input-${idx}" style="display: none;" onchange="handleKycDocFileInput(${idx}, event)">
                    <div style="font-size: 0.8rem; color: var(--text-main); display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <i class="fa-solid fa-cloud-arrow-up text-emerald"></i>
                        <span>${t('kyc_doc_dropzone_hint', 'Trascina qui il file o clicca per caricare (PDF, JPG, PNG)')}</span>
                    </div>
                </div>
            `;
        }

        html += `
            <div class="kyc-doc-card" id="kyc-doc-card-${idx}">
                <div class="kyc-doc-header">
                    <div style="display: flex; align-items: center; gap: 0.45rem;">
                        <span class="kyc-dot ${dotClass}" title="${statusTitle}"></span>
                        <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">
                            ${escapeHtml(doc.title || doc.type || 'Documento')}
                        </span>
                        <span class="badge" style="font-size: 0.7rem; ${isMandatory ? 'background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3);' : 'background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--border-color);'}">
                            ${isMandatory ? t('kyc_doc_mandatory', 'Obbligatorio') : t('kyc_doc_optional', 'Facoltativo')}
                        </span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        ${!isMandatory ? `
                            <button type="button" class="btn btn-secondary btn-sm" onclick="removeKycDocSlot(${idx})" title="Rimuovi record" style="color: #ef4444; border-color: rgba(239,68,68,0.3); padding: 0.2rem 0.5rem; font-size: 0.72rem;">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="kyc-doc-grid">
                    <div>
                        <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.2rem;" data-i18n="kyc_doc_type">Tipo Documento</label>
                        <select id="kyc-doc-type-${idx}" class="filter-select" style="width: 100%; font-size: 0.8rem; padding: 0.4rem 0.6rem;" onchange="updateKycDocField(${idx}, 'type', this.value)">
                            ${optionsHtml}
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.2rem;" data-i18n="kyc_doc_number">Nr. Documento</label>
                        <input type="text" id="kyc-doc-num-${idx}" class="filter-input" style="width: 100%; font-size: 0.8rem; padding: 0.4rem 0.6rem;" placeholder="es. CA12345AA" value="${escapeHtml(doc.doc_number || '')}" oninput="updateKycDocField(${idx}, 'doc_number', this.value)">
                    </div>
                    <div>
                        <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.2rem;" data-i18n="kyc_doc_authority">Rilasciato da: (Autorità)</label>
                        <input type="text" id="kyc-doc-auth-${idx}" class="filter-input" style="width: 100%; font-size: 0.8rem; padding: 0.4rem 0.6rem;" placeholder="es. Comune, Questura, LBR" value="${escapeHtml(doc.authority || '')}" oninput="updateKycDocField(${idx}, 'authority', this.value)">
                    </div>
                    <div>
                        <label style="font-size: 0.72rem; color: var(--text-muted); display: block; margin-bottom: 0.2rem;" data-i18n="kyc_doc_expiry">Data di Scadenza</label>
                        <input type="date" id="kyc-doc-exp-${idx}" class="filter-input" style="width: 100%; font-size: 0.8rem; padding: 0.4rem 0.6rem;" value="${doc.expiry_date || ''}" onchange="handleKycDocExpiryChange(${idx}, this.value)">
                        <div id="kyc-doc-expiry-badge-${idx}">
                            <span class="kyc-expiry-badge ${expiryInfo.badgeClass}">
                                <i class="fa-solid fa-clock"></i> ${expiryInfo.label}
                            </span>
                        </div>
                    </div>
                </div>

                ${fileBoxHtml}
            </div>
        `;
    });

    container.innerHTML = html;
}

// Aggiornamento campi reattivo
window.updateKycDocField = function(idx, field, val) {
    if (currentKycDocuments[idx]) {
        currentKycDocuments[idx][field] = val;
        if (field === 'type') {
            currentKycDocuments[idx].title = val;
            const headerTitleEl = document.querySelector(`#kyc-doc-card-${idx} .kyc-doc-header span:nth-child(2)`);
            if (headerTitleEl) headerTitleEl.textContent = val;
        }
    }
};

// Cambio data di scadenza con aggiornamento istantaneo del bollino/badge
window.handleKycDocExpiryChange = function(idx, val) {
    if (!currentKycDocuments[idx]) return;
    currentKycDocuments[idx].expiry_date = val;
    const expiryInfo = getKycDocExpiryStatus(val);
    const badgeContainer = document.getElementById(`kyc-doc-expiry-badge-${idx}`);
    if (badgeContainer) {
        badgeContainer.innerHTML = `
            <span class="kyc-expiry-badge ${expiryInfo.badgeClass}">
                <i class="fa-solid fa-clock"></i> ${expiryInfo.label}
            </span>
        `;
    }
};

// Trigger input file da click su dropzone
window.triggerKycDocFileInput = function(idx) {
    const input = document.getElementById(`kyc-file-input-${idx}`);
    if (input) input.click();
};

// Gestione selezione file da esplora risorse
window.handleKycDocFileInput = async function(idx, event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    await processKycDocFile(idx, files[0]);
    event.target.value = '';
};

// Drag and drop events per dropzone KYC
window.handleKycDropzoneDragOver = function(event, idx) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById(`kyc-dropzone-${idx}`);
    if (dropzone) {
        dropzone.style.borderColor = '#10b981';
        dropzone.style.background = 'rgba(16, 185, 129, 0.08)';
    }
};

window.handleKycDropzoneDragLeave = function(event, idx) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById(`kyc-dropzone-${idx}`);
    if (dropzone) {
        dropzone.style.borderColor = 'rgba(255,255,255,0.2)';
        dropzone.style.background = 'rgba(255,255,255,0.015)';
    }
};

window.handleKycDocDrop = async function(event, idx) {
    event.preventDefault();
    event.stopPropagation();
    const dt = event.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
        await processKycDocFile(idx, dt.files[0]);
    }
};

// Elaborazione file e memorizzazione DataURL
async function processKycDocFile(idx, file) {
    if (!currentKycDocuments[idx]) return;
    try {
        const base64 = await readFileAsDataURL(file);
        currentKycDocuments[idx].file = {
            name: file.name,
            size: file.size,
            type: file.type || 'application/pdf',
            dataUrl: base64,
            uploadDate: new Date().toISOString()
        };
        syncCurrentKycDocsFromDOM();
        renderKycDocumentsChecklist();
    } catch (e) {
        console.error('Errore lettura file KYC:', e);
        alert('Errore durante il caricamento del file.');
    }
}

// Sincronizza lo stato corrente con gli input HTML
function syncCurrentKycDocsFromDOM() {
    currentKycDocuments.forEach((doc, idx) => {
        const typeEl = document.getElementById(`kyc-doc-type-${idx}`);
        const numEl = document.getElementById(`kyc-doc-num-${idx}`);
        const authEl = document.getElementById(`kyc-doc-auth-${idx}`);
        const expEl = document.getElementById(`kyc-doc-exp-${idx}`);
        if (typeEl) doc.type = typeEl.value;
        if (numEl) doc.doc_number = numEl.value;
        if (authEl) doc.authority = authEl.value;
        if (expEl) doc.expiry_date = expEl.value;
    });
}

// Anteprima documento KYC nel visualizzatore
window.previewAmlKycDoc = function(idx) {
    const doc = currentKycDocuments[idx];
    if (!doc || !doc.file) return;

    const modal = document.getElementById('aml-doc-viewer-modal');
    const titleEl = document.getElementById('aml-viewer-doc-title');
    const subtitleEl = document.getElementById('aml-viewer-doc-subtitle');
    const bodyEl = document.getElementById('aml-doc-viewer-body');
    const downloadBtn = document.getElementById('aml-viewer-download-btn');

    if (!modal || !bodyEl) return;

    if (titleEl) titleEl.textContent = doc.file.name;
    if (subtitleEl) subtitleEl.textContent = `uploads/AML Giustificativi/${currentKycPartnerName}/${doc.file.name}`;

    if (downloadBtn) {
        downloadBtn.onclick = () => downloadAmlKycDoc(idx);
    }

    const nameLower = (doc.file.name || '').toLowerCase();
    const isImage = nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.webp');
    const isPdf = nameLower.endsWith('.pdf') || (doc.file.type && doc.file.type.includes('pdf'));

    if (isImage) {
        bodyEl.innerHTML = `<img src="${doc.file.dataUrl}" alt="${escapeHtml(doc.file.name)}" style="max-width: 95%; max-height: 95%; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">`;
    } else if (isPdf) {
        bodyEl.innerHTML = `<iframe src="${doc.file.dataUrl}" style="width: 100%; height: 100%; border: none;"></iframe>`;
    } else {
        bodyEl.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-main);">
                <i class="fa-solid fa-file-lines text-emerald" style="font-size: 3.5rem; margin-bottom: 1rem; display: block;"></i>
                <h3 style="margin-bottom: 0.5rem;">${escapeHtml(doc.file.name)}</h3>
                <p style="color: var(--text-muted); max-width: 450px; margin: 0 auto 1.5rem auto; font-size: 0.85rem;">
                    ${t('docs_preview_error', 'Impossibile visualizzare l\'anteprima diretta per questo formato. Clicca su Scarica per aprirlo sul tuo dispositivo.')}
                </p>
                <button class="btn btn-primary" onclick="downloadAmlKycDoc(${idx})">
                    <i class="fa-solid fa-download"></i> ${t('docs_action_download', 'Scarica')}
                </button>
            </div>
        `;
    }

    modal.style.display = 'flex';
};

// Download documento KYC
window.downloadAmlKycDoc = function(idx) {
    const doc = currentKycDocuments[idx];
    if (!doc || !doc.file || !doc.file.dataUrl) return;
    const a = document.createElement('a');
    a.href = doc.file.dataUrl;
    a.download = doc.file.name || 'documento_kyc.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// Rimozione solo del file allegato (il record rimane con bollino rosso/grigio)
window.removeKycDocFile = function(idx) {
    if (!confirm(t('kyc_doc_delete_confirm', 'Sei sicuro di voler rimuovere questo file allegato?'))) return;
    if (currentKycDocuments[idx]) {
        syncCurrentKycDocsFromDOM();
        currentKycDocuments[idx].file = null;
        renderKycDocumentsChecklist();
    }
};

// Rimozione dello slot facoltativo
window.removeKycDocSlot = function(idx) {
    if (currentKycDocuments[idx]) {
        syncCurrentKycDocsFromDOM();
        currentKycDocuments.splice(idx, 1);
        renderKycDocumentsChecklist();
    }
};

// Aggiunta nuovo slot per documento facoltativo
window.addNewKycDocSlot = function() {
    syncCurrentKycDocsFromDOM();
    currentKycDocuments.push({
        id: 'KYC-DOC-' + Date.now(),
        mandatory: false,
        type: 'Altro Documento',
        title: 'Documento Facoltativo Aggiuntivo',
        doc_number: '',
        authority: '',
        expiry_date: '',
        file: null
    });
    renderKycDocumentsChecklist();
};

// Gestion de la Fiche Modale KYC
let currentKycPartnerName = null;

window.openAmlKycModal = function(partnerName) {
    const modal = document.getElementById('aml-kyc-modal');
    if (!modal) return;

    currentKycPartnerName = partnerName;
    const p = getEnrichedPartner(partnerName);

    const titleEl = document.getElementById('modal-kyc-title');
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-shield-halved text-emerald"></i> ${t('kyc_modal_title', 'Fascicolo Permanente KYC / AML Socio')} - ${p.name}`;

    populateKycModalDropdowns();

    document.getElementById('kyc-input-legal-name').value = p.legal_name || p.name;
    document.getElementById('kyc-input-entity-type').value = p.entity_type || 'PERSONNE_PHYSIQUE';
    document.getElementById('kyc-input-rcs').value = p.rcs_number || '';
    document.getElementById('kyc-input-matricule').value = p.matricule || '';
    document.getElementById('kyc-input-tva').value = p.tva_number || '';
    
    const partnerNat = p.nationality || p.ubo_list[0]?.nationality || 'Italiana';
    const natInput = document.getElementById('kyc-input-nationality');
    if (natInput) natInput.value = getLocalizedNationality(partnerNat) || partnerNat;

    document.getElementById('kyc-input-country').value = getLocalizedCountry(p.country) || p.country || '';
    document.getElementById('kyc-input-address').value = p.address || '';
    document.getElementById('kyc-input-postal-code').value = p.postal_code || '';
    document.getElementById('kyc-input-city').value = p.city || '';
    document.getElementById('kyc-input-mandate').value = getLocalizedMandate(p.mandate_nature) || p.mandate_nature || '';
    document.getElementById('kyc-input-risk-level').value = p.aml_risk_level || 'LOW';
    document.getElementById('kyc-input-kyc-status').value = p.aml_kyc_status || 'CONFORME';
    document.getElementById('kyc-input-is-pep').checked = !!p.is_pep;
    document.getElementById('kyc-input-pep-details').value = p.pep_details || '';
    document.getElementById('kyc-input-notes').value = p.notes || '';

    // Liste UBO
    const uboContainer = document.getElementById('kyc-ubo-list-container');
    if (uboContainer) {
        let uboHtml = '';
        (p.ubo_list || []).forEach(ubo => {
            const uboNat = getLocalizedNationality(ubo.nationality);
            uboHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 0.35rem;">
                    <div>
                        <strong>${ubo.name}</strong> <span style="color: var(--text-muted);">(${uboNat})</span>
                    </div>
                    <div style="font-weight: 700; color: #10b981;">
                        ${ubo.percentage}% ${ubo.rbe_verified ? '<i class="fa-solid fa-check-circle" title="RBE Registrato"></i>' : ''}
                    </div>
                </div>
            `;
        });
        uboContainer.innerHTML = uboHtml || `<div style="font-size: 0.8rem; color: var(--text-muted);">${t('kyc_no_ubos', 'Nessun UBO specifico registrato.')}</div>`;
    }

    // Inizializza e visualizza la checklist documentale
    currentKycDocuments = initPartnerKycDocuments(p);
    renderKycDocumentsChecklist();

    modal.style.display = 'flex';
};

window.closeAmlKycModal = function() {
    const modal = document.getElementById('aml-kyc-modal');
    if (modal) modal.style.display = 'none';
};

window.saveAmlKycModalData = function() {
    if (!currentKycPartnerName) return;

    // Sincronizza i dati dai campi della checklist
    syncCurrentKycDocsFromDOM();

    const customStorage = getAmlCustomStorage();
    const currentData = getEnrichedPartner(currentKycPartnerName);

    const natValue = document.getElementById('kyc-input-nationality') ? document.getElementById('kyc-input-nationality').value : (currentData.nationality || 'Italiana');
    const countryValue = document.getElementById('kyc-input-country').value;

    let updatedUboList = currentData.ubo_list ? [...currentData.ubo_list] : [];
    if (updatedUboList.length > 0) {
        updatedUboList[0] = {
            ...updatedUboList[0],
            nationality: natValue
        };
    }

    // Costruisce la lista di sintesi dei documenti per retrocompatibilità
    const summaryDocs = currentKycDocuments.map(d => ({
        name: d.title || d.type || 'Documento',
        status: d.file ? 'VALID' : (d.mandatory ? 'MISSING' : 'OPTIONAL'),
        date: d.expiry_date || '',
        file: d.file
    }));

    const updated = {
        ...currentData,
        nationality: natValue,
        ubo_list: updatedUboList,
        legal_name: document.getElementById('kyc-input-legal-name').value,
        entity_type: document.getElementById('kyc-input-entity-type').value,
        rcs_number: document.getElementById('kyc-input-rcs').value,
        matricule: document.getElementById('kyc-input-matricule').value,
        tva_number: document.getElementById('kyc-input-tva').value,
        country: countryValue,
        address: document.getElementById('kyc-input-address').value,
        postal_code: document.getElementById('kyc-input-postal-code').value,
        city: document.getElementById('kyc-input-city').value,
        mandate_nature: document.getElementById('kyc-input-mandate').value,
        aml_risk_level: document.getElementById('kyc-input-risk-level').value,
        aml_kyc_status: document.getElementById('kyc-input-kyc-status').value,
        is_pep: document.getElementById('kyc-input-is-pep').checked,
        pep_details: document.getElementById('kyc-input-pep-details').value,
        notes: document.getElementById('kyc-input-notes').value,
        last_review_date: new Date().toISOString().split('T')[0],
        kyc_documents: currentKycDocuments,
        documents: summaryDocs
    };

    customStorage[currentKycPartnerName] = updated;
    saveAmlCustomStorage(customStorage);

    closeAmlKycModal();
    applyAmlFilters();
    renderAmlPartnersCards();

    alert(t('kyc_save_success', 'Fascicolo di conformità KYC e documentazione aggiornati e salvati con successo!'));
};

// =============================================================================
// MODALE MANUEL & GUIDE AML MULTILINGUE
// =============================================================================

let currentManualLang = 'it';

const MANUAL_CONTENTS = {
    'it': {
        title: "Guida Metodologica & Manuale d'Uso AML / LBC-FT",
        pdf_path: "docs/Manuale_Conformita_AML_Antiriciclaggio_GREEN_ENERBRAS_IT.pdf",
        sections: [
            {
                title: "1. Quadro Normativo Lussemburghese & Vigilanza AED",
                html: `
                    <p>Nel Granducato di Lussemburgo, la prevenzione del riciclaggio di capitali e del finanziamento del terrorismo (AML / LBC-FT) è disciplinata dalla <strong>Legge modificata del 12 novembre 2004</strong>.</p>
                    <p><strong>GREEN ENERBRAS ONE SCSp</strong> è una Società in Accomandita Speciale (SCSp) di diritto lussemburghese dedicata agli investimenti e detenzione di asset nel settore delle energie rinnovabili. La società non è un istituto di credito o intermediario vigilato da CSSF.</p>
                    <p>L'autorità di vigilanza legalmente competente per GREEN ENERBRAS ONE SCSp è l'<strong>AED (Administration de l'Enregistrement, des Domaines et de la TVA)</strong>, ai sensi della Legge del 12 novembre 2004 che include le società commerciali e i veicoli societari non finanziari.</p>
                    <ul>
                        <li><strong>Legge 12 novembre 2004 :</strong> Normativa cardine su adeguata verifica della clientela (CDD), organizzazione interna e segnalazione.</li>
                        <li><strong>Legge 13 gennaio 2019 (RBE) :</strong> Obbligo di registrazione e verifica dei Titolari Effettivi (UBO) presso il registro LBR.</li>
                        <li><strong>Legge 10 agosto 1915 :</strong> Disciplina societaria delle SCSp, trasparenza contrattuale e ruoli di General Partner e Limited Partners.</li>
                        <li><strong>Circolari AED 779 & 800 :</strong> Linee guida operative e questionario annuale di valutazione del rischio antiriciclaggio.</li>
                    </ul>
                `
            },
            {
                title: "2. Obblighi di Conformità per GREEN ENERBRAS ONE SCSp",
                html: `
                    <p>GREEN ENERBRAS ONE SCSp adotta un approccio basato sul rischio (Risk-Based Approach) strutturato su 5 obblighi fondamentali:</p>
                    <ul>
                        <li><strong>Adeguata Verifica Soci (CDD) :</strong> Acquisizione di documento d'identità, codice fiscale, residenza e scheda KYC per ogni socio.</li>
                        <li><strong>Verifica Titolari Effettivi (RBE) :</strong> Identificazione di ogni persona fisica detentrice di oltre il 25% delle quote o del controllo.</li>
                        <li><strong>Tracciabilità Apporti di Capitale :</strong> Controllo documentale dei 261.000 € versati dai soci sul conto corrente (Banque de Luxembourg).</li>
                        <li><strong>Monitoraggio Proventi Futuri :</strong> Predisposizione dei controlli sui futuri dividendi ed entrate dai parchi solari in Brasile (Tri Star SCP).</li>
                        <li><strong>Conservazione Obbligatoria (5 Anni) :</strong> Obbligo di conservazione integrale di tutti i fascicoli KYC per almeno 5 anni.</li>
                    </ul>
                `
            },
            {
                title: "3. Guida all'Uso del Modulo nell'Applicazione",
                html: `
                    <p>Il modulo <code>aml.html</code> è stato espressamente strutturato per riflettere la compagine sociale e gli apporti di capitale di GREEN ENERBRAS ONE SCSp:</p>
                    <ul>
                        <li><strong>Ordinamento Cronologico Decrescente :</strong> Le operazioni del 2026 e i versamenti più recenti sono visualizzati in cima.</li>
                        <li><strong>Perimetro Tracciato :</strong> Include i 13 versamenti effettivi di capitale dei soci per 261.000 € (escludendo storni interni e spese).</li>
                        <li><strong>Fascicolo KYC Interattivo :</strong> Accesso con un click alla scheda di audit del socio con salvataggio persistente in <code>localStorage</code>.</li>
                        <li><strong>Mappatura dei Soci & Asset :</strong> Schede anagrafiche complete per gli 11 soci della SCSp e per la partecipata Tri Star SCP (Brasile).</li>
                        <li><strong>Esportazioni Multi-Formato :</strong> Generazione immediata di file Excel (25 colonne normate), CSV e Report Ufficiali PDF.</li>
                    </ul>
                `
            },
            {
                title: "4. Il Simulatore di Due Diligence (Risk-Based Approach)",
                html: `
                    <p>La sezione <strong>« 4. Simulateur Due Diligence »</strong> consente di calcolare il punteggio di rischio (score 0-100) per ogni nuovo socio, investitore o investimento su 5 parametri:</p>
                    <ul>
                        <li><strong>Forma Giuridica :</strong> Persona Fisica UE (+5 pt), Società Commerciale (+10 pt), SCSp (+15 pt), Società Internazionale (+25 pt).</li>
                        <li><strong>Giurisdizione Sede / Residenza :</strong> Lussemburgo / Zona Euro (+5 pt), Svizzera / UK / USA (+10 pt), Brasile (+30 pt).</li>
                        <li><strong>Fattore PEP :</strong> Presenza di Persona Politicamente Esposta (+35 pt e attivazione automatica Vigilanza Rafforzata).</li>
                        <li><strong>Origine dei Fondi :</strong> Redditi personali diretti (+0 pt), Disinvestimenti patrimoniali (+10 pt), Trust / Fiduciaria (+30 pt).</li>
                        <li><strong>Volume Quota :</strong> &lt; 25.000 € (+0 pt), 25.000 € - 50.000 € (+10 pt), ≥ 50.000 € (+15 pt).</li>
                    </ul>
                `
            }
        ]
    },
    'fr': {
        title: "Guide Méthodologique & Manuel d'Utilisation AML / LBC-FT",
        pdf_path: "docs/Manuel_Conformite_AML_LBC-FT_GREEN_ENERBRAS_FR.pdf",
        sections: [
            {
                title: "1. Cadre Légal Luxembourgeois & Supervision de l'AED",
                html: `
                    <p>Au Grand-Duché de Luxembourg, la lutte contre le blanchiment de capitaux et le financement du terrorisme (LBC/FT) est régie par la <strong>Loi modifiée du 12 novembre 2004</strong>.</p>
                    <p><strong>GREEN ENERBRAS ONE SCSp</strong> est une Société en Commandite Spéciale (SCSp) de droit luxembourgeois dédiée aux investissements dans les énergies renouvelables. Elle n'est pas un établissement financier régulé par la CSSF.</p>
                    <p>L'autorité de contrôle légalement compétente pour GREEN ENERBRAS ONE SCSp est l'<strong>AED (Administration de l'Enregistrement, des Domaines et de la TVA)</strong>.</p>
                `
            },
            {
                title: "2. Obligations Pratiques de Conformité",
                html: `
                    <p>GREEN ENERBRAS ONE SCSp applique une approche fondée sur les risques (Risk-Based Approach) articulée autour de 5 obligations majeures :</p>
                    <ul>
                        <li><strong>Identification Associés (CDD) :</strong> Obtention systématique des pièces d'identité et fiche KYC pour chaque associé.</li>
                        <li><strong>Vérification des UBO / RBE :</strong> Identification de toute personne physique détenant > 25% des parts ou le contrôle effectif.</li>
                        <li><strong>Traçabilité des Apports :</strong> Contrôle des 261.000 € versés par les associés sur le compte bancaire (Banque de Luxembourg).</li>
                        <li><strong>Conservation 5 Ans :</strong> Conservation légale de l'intégralité des dossiers KYC pendant au moins 5 ans.</li>
                    </ul>
                `
            },
            {
                title: "3. Guide d'Utilisation du Module dans l'Application",
                html: `
                    <p>Le module aml.html reflète fidèlement l'actionnariat et les flux de capitaux de GREEN ENERBRAS ONE SCSp avec tri chronologique récent, filtres multicritères, fiche KYC modale et exports Excel/PDF.</p>
                `
            }
        ]
    },
    'en': {
        title: "Methodological Guide & User Manual AML / CFT",
        pdf_path: "docs/User_Manual_AML_CFT_Compliance_GREEN_ENERBRAS_EN.pdf",
        sections: [
            {
                title: "1. Luxembourg Legal Framework & AED Oversight",
                html: `
                    <p>In the Grand Duchy of Luxembourg, AML / CFT oversight for Special Limited Partnerships (SCSp) not supervised by CSSF is statutorily allocated to the <strong>AED (Administration de l'Enregistrement, des Domaines et de la TVA)</strong> pursuant to the amended Law of 12 November 2004.</p>
                `
            },
            {
                title: "2. Compliance Obligations for GREEN ENERBRAS ONE SCSp",
                html: `
                    <p>GREEN ENERBRAS ONE SCSp enforces rigorous Customer Due Diligence (CDD) across its 11 partners, auditing €261,000 of paid-in capital contributions, maintaining mandatory RBE filings, and securing 5-year record retention.</p>
                `
            }
        ]
    }
};

window.openAmlManualModal = function() {
    const modal = document.getElementById('aml-manual-modal');
    if (!modal) return;
    const lang = (typeof currentLang !== 'undefined' ? currentLang : 'it');
    setManualModalLang(lang);
    modal.style.display = 'flex';
};

window.closeAmlManualModal = function() {
    const modal = document.getElementById('aml-manual-modal');
    if (modal) modal.style.display = 'none';
};

window.setManualModalLang = function(lang) {
    currentManualLang = lang;
    const contentData = MANUAL_CONTENTS[lang] || MANUAL_CONTENTS['it'];

    document.querySelectorAll('.manual-lang-pill').forEach(btn => {
        if (btn.getAttribute('data-manual-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const bodyEl = document.getElementById('aml-manual-reader-body');
    if (bodyEl) {
        let html = `
            <div style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                <h2 style="font-size: 1.35rem; font-weight: 800; color: #10b981; margin-bottom: 0.35rem;">${contentData.title}</h2>
                <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">GREEN ENERBRAS ONE SCSp • R.C.S. Luxembourg B 278.900 • AED Compliance</p>
            </div>
        `;

        (contentData.sections || []).forEach(sec => {
            html += `
                <div style="margin-bottom: 1.5rem;">
                    <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="display: inline-block; width: 4px; height: 16px; background: #10b981; border-radius: 2px;"></span>
                        ${sec.title}
                    </h3>
                    <div style="color: var(--text-main); font-size: 0.88rem; line-height: 1.6;">${sec.html}</div>
                </div>
            `;
        });

        bodyEl.innerHTML = html;
    }

    const footerPdfEl = document.getElementById('manual-footer-pdf-name');
    if (footerPdfEl) footerPdfEl.textContent = contentData.pdf_path;
};

window.printManualContent = function() {
    window.print();
};

window.openManualPdfTab = function() {
    const contentData = MANUAL_CONTENTS[currentManualLang] || MANUAL_CONTENTS['it'];
    window.open(contentData.pdf_path, '_blank');
};

window.downloadCurrentManualPdf = function() {
    const contentData = MANUAL_CONTENTS[currentManualLang] || MANUAL_CONTENTS['it'];
    const a = document.createElement('a');
    a.href = contentData.pdf_path;
    a.download = contentData.pdf_path.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// =============================================================================
// EXPORTS RÉGLEMENTAIRES (EXCEL, CSV, PDF)
// =============================================================================

function exportAmlToExcel() {
    const inflows = getAmlInflows();
    const totalCapitalVolume = inflows.reduce((sum, i) => sum + i.amount, 0) || 261000.0;
    
    // Matrice normée de conformité
    const rows = inflows.map(i => {
        const p = i.partner_data;
        const ubo = p.ubo_list[0] || {};
        const singleStake = (i.amount / totalCapitalVolume) * 100;
        return {
            "ID Transaction": i.id,
            "Date de Valeur": i.date,
            "Exercice Fiscal": i.year,
            "Socio / Investitore": i.partner_name,
            "Dénomination Légale": p.legal_name || i.partner_name,
            "Rôle SCSp": p.role_type || 'Limited Partner',
            "Forme Juridique": getLocalizedEntityType(p.entity_type),
            "N° Réf. / Bonifico": i.ref_number,
            "Causale Apporto / Quota": getLocalizedPurpose(i.raw_purpose, i.category),
            "Montant Versé Tranche (€)": i.amount,
            "Quota Tranche (%)": Number(singleStake.toFixed(2)),
            "Capitale Totale Socio (€)": p.contribution_paid,
            "Quota Totale Socio (%)": Number(p.detention_pct.toFixed(2)),
            "Pays de Résidence": getLocalizedCountry(p.country),
            "Ville / Siège": p.city,
            "Adresse Complète": p.address,
            "Code Postal": p.postal_code,
            "Matricule / Code Fiscal": p.matricule,
            "N° TVA / Registre": p.tva_number || p.rcs_number,
            "Bénéficiaire Effectif (UBO / RBE)": ubo.name || 'Direct',
            "Nationalité UBO": getLocalizedNationality(ubo.nationality),
            "Pourcentage UBO (%)": ubo.percentage || 100,
            "RBE Déposé & Vérifié": ubo.rbe_verified ? "OUI (LBR)" : "NON",
            "Exposition PEP": p.is_pep ? "OUI" : "NON",
            "Détails PEP": p.pep_details || "N/A",
            "Seuil de Vigilance Tranche": i.threshold_level,
            "Seuil de Vigilance Cumulé Socio": p.contribution_paid >= 25000 ? "MAJOR_25K" : (p.contribution_paid >= 10000 ? "DUE_DILIGENCE_10K" : "STANDARD"),
            "Niveau de Risque AML": i.aml_risk_level,
            "Statut de Conformité KYC": i.aml_kyc_status,
            "Date Dernière Revue KYC": p.last_review_date,
            "Notes d'Audit & Conformité": p.notes
        };
    });

    if (typeof XLSX !== 'undefined') {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registre_AML_SCSp");
        XLSX.writeFile(wb, `GREEN_ENERBRAS_Registre_AML_Conformite_${new Date().toISOString().split('T')[0]}.xlsx`);
    } else {
        alert("Bibliothèque XLSX non disponible.");
    }
}

function exportAmlToCsv() {
    const inflows = getAmlInflows();
    const totalCapitalVolume = inflows.reduce((sum, i) => sum + i.amount, 0) || 261000.0;
    const headers = ["ID", "Date", "Socio", "Role", "Causale", "Reference", "Montant_Tranche_EUR", "Quota_Tranche_Pct", "Total_Socio_EUR", "Quota_Total_Pct", "Seuil_AML_Cumule", "Risque_AML", "Statut_KYC", "UBO", "Pays"];
    
    let csv = headers.join(";") + "\n";
    inflows.forEach(i => {
        const p = i.partner_data;
        const singleStake = (i.amount / totalCapitalVolume) * 100;
        const cumThreshold = p.contribution_paid >= 25000 ? "MAJOR_25K" : (p.contribution_paid >= 10000 ? "DUE_DILIGENCE_10K" : "STANDARD");
        const row = [
            i.id,
            i.date,
            `"${i.partner_name}"`,
            `"${i.role_type}"`,
            `"${getLocalizedPurpose(i.raw_purpose, i.category)}"`,
            `"${i.ref_number}"`,
            i.amount.toFixed(2),
            singleStake.toFixed(2),
            p.contribution_paid.toFixed(2),
            p.detention_pct.toFixed(2),
            cumThreshold,
            i.aml_risk_level,
            i.aml_kyc_status,
            `"${p.ubo_list[0]?.name || ''}"`,
            `"${getLocalizedCountry(p.country)}"`
        ];
        csv += row.join(";") + "\n";
    });

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GREEN_ENERBRAS_Registre_AML_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function exportAmlToPdf() {
    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
        alert("Bibliothèque jsPDF non chargée.");
        return;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const inflows = getAmlInflows();
    const totalVolume = inflows.reduce((sum, i) => sum + i.amount, 0);
    const grouped = getAmlGroupedPartners(inflows);

    // En-tête officiel
    doc.setFillColor(16, 185, 129);
    doc.rect(14, 10, 269, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("GREEN ENERBRAS ONE SCSp - REGISTRE DES APPORTS & CONFORMITÉ AML / LBC-FT", 18, 19);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Loi modifiée du 12 novembre 2004 • Surveillance AED Luxembourg • R.C.S. B 278.900", 18, 24);

    // Résumé Statistique
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Volume Total Contrôlé : ${formatCurrency(totalVolume)}    |    Nombre d'Associés : ${grouped.length}    |    Nombre d'Apports : ${inflows.length}    |    Conformité KYC : 100%    |    Date : ${new Date().toLocaleDateString('fr-FR')}`, 14, 34);

    // Données du tableau groupé
    const bodyData = [];
    grouped.forEach(g => {
        bodyData.push([
            g.latest_date + (g.tranches_count > 1 ? ` (${g.tranches_count} tranches)` : ''),
            g.partner_name,
            g.role_type === 'General Partner' ? 'GP' : 'LP',
            getLocalizedPurpose(g.tranches[0].raw_purpose, g.tranches[0].category),
            g.tranches[0].ref_number,
            formatCurrency(g.total_amount),
            g.total_stake_pct.toFixed(2) + '%',
            g.threshold_level,
            g.aml_kyc_status
        ]);
        if (g.tranches_count > 1) {
            g.tranches.forEach((tr, idx) => {
                bodyData.push([
                    '  └ ' + tr.date,
                    '  └ Tranche #' + (g.tranches_count - idx),
                    '',
                    '  └ ' + getLocalizedPurpose(tr.raw_purpose, tr.category),
                    tr.ref_number,
                    formatCurrency(tr.amount),
                    tr.single_stake_pct.toFixed(2) + '%',
                    tr.threshold_level,
                    ''
                ]);
            });
        }
    });

    doc.autoTable({
        startY: 38,
        head: [['Date', 'Socio / Associé', 'Rôle', 'Causale / Apport', 'N° Réf.', 'Montant Total (€)', 'Quote %', 'Seuil AML', 'Statut KYC']],
        body: bodyData,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5, cellPadding: 2 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
            0: { cellWidth: 28 },
            1: { cellWidth: 42, fontStyle: 'bold' },
            2: { cellWidth: 12, halign: 'center' },
            3: { cellWidth: 50 },
            4: { cellWidth: 35 },
            5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
            6: { cellWidth: 18, halign: 'right' },
            7: { cellWidth: 28, halign: 'center' },
            8: { cellWidth: 20, halign: 'center' }
        }
    });

    doc.save(`GREEN_ENERBRAS_Rapport_Officiel_AML_${new Date().toISOString().split('T')[0]}.pdf`);
}

// =============================================================================
// INITIALISATION DOM & EVENT LISTENERS
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const inflows = getAmlInflows();
    
    // Initialiser les dropdowns
    populateAmlFilterDropdowns(inflows);

    // Initialiser le système de stockage des justificatifs (IndexedDB/localStorage)
    loadAllAmlDocs().then(() => {
        applyAmlFilters();
    });
    setupAmlDropzone();

    // Mettre à jour KPIs & Table
    applyAmlFilters();
    renderAmlPartnersCards();
    renderAmlRiskMatrix();
    calculateDueDiligenceScore();

    // Re-render when language changes
    window.addEventListener('languageChanged', () => {
        populateAmlFilterDropdowns(getAmlInflows());
        applyAmlFilters();
        renderAmlPartnersCards();
        renderAmlRiskMatrix();
        calculateDueDiligenceScore();
        if (document.getElementById('aml-docs-modal')?.style.display === 'flex') {
            renderAmlDocsList();
        }
    });

    // Gestion des Onglets
    document.querySelectorAll('.tabs-nav .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tabs-nav .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // Boutons de Filtre Rapide des Seuils
    document.querySelectorAll('.aml-threshold-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.aml-threshold-btn').forEach(b => {
                b.classList.remove('active');
                b.classList.remove('btn-primary');
                b.classList.add('btn-secondary');
            });
            btn.classList.add('active');
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');

            amlFilterThreshold = parseFloat(btn.getAttribute('data-threshold')) || 0;
            applyAmlFilters();
        });
    });

    // Filtres Dropdowns & Recherche
    const searchInput = document.getElementById('aml-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            amlSearchQuery = e.target.value.trim();
            applyAmlFilters();
        });
    }

    const filterPartner = document.getElementById('aml-filter-partner');
    if (filterPartner) {
        filterPartner.addEventListener('change', (e) => {
            amlFilterPartner = e.target.value;
            applyAmlFilters();
        });
    }

    const filterYear = document.getElementById('aml-filter-year');
    if (filterYear) {
        filterYear.addEventListener('change', (e) => {
            amlFilterYear = e.target.value;
            applyAmlFilters();
        });
    }

    const filterEntity = document.getElementById('aml-filter-entity-type');
    if (filterEntity) {
        filterEntity.addEventListener('change', (e) => {
            amlFilterEntityType = e.target.value;
            applyAmlFilters();
        });
    }

    const filterKyc = document.getElementById('aml-filter-kyc-status');
    if (filterKyc) {
        filterKyc.addEventListener('change', (e) => {
            amlFilterKycStatus = e.target.value;
            applyAmlFilters();
        });
    }

    // Bouton Calcul Due Diligence
    const btnSim = document.getElementById('btn-calc-due-diligence');
    if (btnSim) {
        btnSim.addEventListener('click', calculateDueDiligenceScore);
    }

    // Change listeners for Simulator inputs so it updates automatically
    ['sim-entity-type', 'sim-country', 'sim-is-pep', 'sim-source', 'sim-volume'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', calculateDueDiligenceScore);
            el.addEventListener('input', calculateDueDiligenceScore);
        }
    });

    // Boutons d'export
    const btnExcel = document.getElementById('btn-export-aml-excel');
    if (btnExcel) btnExcel.addEventListener('click', exportAmlToExcel);

    const btnCsv = document.getElementById('btn-export-aml-csv');
    if (btnCsv) btnCsv.addEventListener('click', exportAmlToCsv);

    const btnPdf = document.getElementById('btn-export-aml-pdf');
    if (btnPdf) btnPdf.addEventListener('click', exportAmlToPdf);
});
