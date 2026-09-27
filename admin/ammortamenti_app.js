/**
 * GREEN ENERBRAS ONE SCSp - MODULO AMMORTAMENTI CESPITI (PCN LUSSEMBURGO)
 * Calcolo ammortamenti lineari (quote costanti) su Immobilizzazioni Materiali ed Immateriali
 * e Contabilizzazione automatica delle quote di assestamento a fine anno nel Bilancio.
 */

// Categorie PCN standard Lussemburgo
const PCN_CATEGORIES = {
    immateriale: [
        { code: '2010000', fundCode: '2018000', pnlCode: '6511000', label: "2010000 - Frais d'établissement (Costi di costituzione e impianto)", defaultYears: 5 },
        { code: '2020000', fundCode: '2028000', pnlCode: '6511000', label: "2020000 - Frais de recherche et de développement", defaultYears: 5 },
        { code: '2120000', fundCode: '2128000', pnlCode: '6511000', label: "2120000 - Concessions, brevets, licences, marques et droits similaires", defaultYears: 5 },
        { code: '2140000', fundCode: '2148000', pnlCode: '6511000', label: "2140000 - Logiciels informatiques (Software e Piattaforme)", defaultYears: 3 }
    ],
    materiale: [
        { code: '2210000', fundCode: '2218000', pnlCode: '6512000', label: "2210000 - Terrains et constructions (Fabbricati e strutture)", defaultYears: 30 },
        { code: '2310000', fundCode: '2318000', pnlCode: '6512000', label: "2310000 - Installations techniques et usines solaires (Parchi Fotovoltaici)", defaultYears: 20 },
        { code: '2320000', fundCode: '2328000', pnlCode: '6512000', label: "2320000 - Équipements électriques, onduleurs et transformateurs", defaultYears: 10 },
        { code: '2410000', fundCode: '2418000', pnlCode: '6512000', label: "2410000 - Outillage et matériel d'exploitation", defaultYears: 8 },
        { code: '2510000', fundCode: '2518000', pnlCode: '6512000', label: "2510000 - Mobilier et agencements", defaultYears: 8 },
        { code: '2520000', fundCode: '2528000', pnlCode: '6512000', label: "2520000 - Matériel informatique et électronique (Server/PC)", defaultYears: 5 }
    ]
};

// Cespiti precaricati di default per GREEN ENERBRAS ONE SCSp
const DEFAULT_ASSETS = [
    {
        id: 'asset-1',
        code: 'IMM-2025-01',
        desc: "Frais de constitution et d'immatriculation SCSp (Costi notarili e amministrativi costituzione)",
        type: 'immateriale',
        pcnCode: '2010000',
        fundCode: '2018000',
        pnlCode: '6511000',
        date: '2025-03-31',
        supplier: 'RCS Luxembourg / Notaire Schaeffer',
        invoice: 'NOT-2025-01',
        cost: 5000.00,
        residual: 0.00,
        years: 5,
        rate: 20.00,
        prorata: true
    },
    {
        id: 'asset-2',
        code: 'IMM-2025-02',
        desc: "Licenza Software Piattaforma Gestione Fotovoltaico & Telecontrollo",
        type: 'immateriale',
        pcnCode: '2140000',
        fundCode: '2148000',
        pnlCode: '6511000',
        date: '2025-09-01',
        supplier: 'SolarTech Cloud Solutions',
        invoice: 'LIC-8842',
        cost: 3600.00,
        residual: 0.00,
        years: 3,
        rate: 33.3333,
        prorata: true
    },
    {
        id: 'asset-3',
        code: 'MAT-2025-01',
        desc: "Infrastrutture Hardware, Server & Sistemi di Telemetria Parchi Solari",
        type: 'materiale',
        pcnCode: '2520000',
        fundCode: '2528000',
        pnlCode: '6512000',
        date: '2025-09-15',
        supplier: 'Dell Technologies Luxembourg',
        invoice: 'INV-44102',
        cost: 4500.00,
        residual: 0.00,
        years: 5,
        rate: 20.00,
        prorata: true
    },
    {
        id: 'asset-4',
        code: 'MAT-2026-01',
        desc: "Impianto Fotovoltaico Pilota & Componenti di Produzione",
        type: 'materiale',
        pcnCode: '2310000',
        fundCode: '2318000',
        pnlCode: '6512000',
        date: '2026-01-15',
        supplier: 'Tri Star Energy Brasil',
        invoice: 'TRI-001/2026',
        cost: 25000.00,
        residual: 0.00,
        years: 20,
        rate: 5.00,
        prorata: true
    },
    {
        id: 'asset-5',
        code: 'MAT-2026-02',
        desc: "Gruppo Inverter e Cabine di Trasformazione MT/BT",
        type: 'materiale',
        pcnCode: '2320000',
        fundCode: '2328000',
        pnlCode: '6512000',
        date: '2026-03-01',
        supplier: 'SMA Solar Technology',
        invoice: 'SMA-2026-90',
        cost: 12000.00,
        residual: 0.00,
        years: 10,
        rate: 10.00,
        prorata: true
    }
];

// Stato dell'applicazione Ammortamenti
let assetsData = [];
let selectedAmmoYear = '2025';
let selectedAmmoType = '';
let ammoSearchText = '';
let activeAmmoTab = 'tab-registro';

const ASSETS_STORAGE_KEY = 'green_enerbras_assets_data';
const POSTED_AMMO_STORAGE_KEY = 'green_enerbras_posted_ammortamenti';

// ==========================================
// Inizializzazione Dati
// ==========================================
function loadAssetsData() {
    try {
        const stored = localStorage.getItem(ASSETS_STORAGE_KEY);
        if (stored) {
            assetsData = JSON.parse(stored);
        } else {
            assetsData = JSON.parse(JSON.stringify(DEFAULT_ASSETS));
            saveAssetsData();
        }
    } catch(e) {
        console.error("Errore nel caricamento dei cespiti:", e);
        assetsData = JSON.parse(JSON.stringify(DEFAULT_ASSETS));
    }
    if (typeof window !== 'undefined') {
        window.assetsData = assetsData;
    }
    return assetsData;
}

function saveAssetsData() {
    try {
        localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assetsData));
    } catch(e) {
        console.error("Errore nel salvataggio dei cespiti:", e);
    }
}

function getPostedAmmortamentiMap() {
    try {
        const stored = localStorage.getItem(POSTED_AMMO_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch(e) {
        return {};
    }
}

function savePostedAmmortamentiMap(map) {
    try {
        localStorage.setItem(POSTED_AMMO_STORAGE_KEY, JSON.stringify(map));
    } catch(e) {}
}

// ==========================================
// Formattazione
// ==========================================
function formatCurrency(num) {
    if (num === null || num === undefined || isNaN(num) || num === '') return '0,00 €';
    const n = Number(num);
    const isNegative = n < 0;
    const absVal = Math.abs(n);
    const parts = absVal.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formatted = parts.join(',') + ' €';
    return isNegative ? ('- ' + formatted) : formatted;
}

// ==========================================
// Motore di Calcolo Ammortamenti Lineari
// ==========================================
/**
 * Calcola il piano di ammortamento completo per un singolo cespite
 */
function calculateAssetDepreciationPlan(asset) {
    const cost = Number(asset.cost) || 0;
    const residual = Number(asset.residual) || 0;
    const amortizable = Math.max(0, cost - residual);
    const years = Math.max(1, Number(asset.years) || 5);
    const annualStandardQuota = amortizable / years;
    
    // Data di acquisizione
    const parts = (asset.date || '2025-01-01').split('-');
    const acqYear = parseInt(parts[0], 10) || 2025;
    const acqMonth = parseInt(parts[1], 10) || 1; // 1-12

    // Calcolo pro-rata temporis primo anno
    let firstYearMonths = 12;
    if (asset.prorata) {
        // Mesi da mese di acquisizione a fine anno (incluso mese acq)
        firstYearMonths = Math.max(1, 12 - acqMonth + 1);
    }
    const firstYearQuota = Math.min(amortizable, (annualStandardQuota * (firstYearMonths / 12)));

    const plan = [];
    let currentVNC = cost;
    let cumAmort = 0;
    let year = acqYear;

    // Anno 1
    const y1Quota = firstYearQuota;
    cumAmort += y1Quota;
    currentVNC = Math.max(residual, cost - cumAmort);
    plan.push({
        year: year,
        initialValue: cost,
        quota: y1Quota,
        cumAmort: cumAmort,
        vnc: currentVNC,
        percAmort: (cumAmort / amortizable) * 100
    });

    // Anni successivi
    while (cumAmort < amortizable - 0.001) {
        year++;
        const prevVNC = currentVNC;
        const remaining = amortizable - cumAmort;
        const quota = Math.min(remaining, annualStandardQuota);
        cumAmort += quota;
        currentVNC = Math.max(residual, cost - cumAmort);
        
        plan.push({
            year: year,
            initialValue: prevVNC,
            quota: quota,
            cumAmort: cumAmort,
            vnc: currentVNC,
            percAmort: (cumAmort / amortizable) * 100
        });

        if (plan.length > 50) break; // Protezione loop infinito
    }

    return plan;
}

/**
 * Calcola i valori di ammortamento per un dato esercizio/anno
 */
function getAssetValuesForYear(asset, targetYear) {
    const cost = Number(asset.cost) || 0;
    const plan = calculateAssetDepreciationPlan(asset);
    
    if (!plan.length) {
        return { initialFund: 0, yearQuota: 0, totalFund: 0, vnc: cost, isDepreciated: false, activeThisYear: false };
    }

    const tYear = targetYear === 'all' ? (new Date().getFullYear()) : parseInt(targetYear, 10);
    const firstYear = plan[0].year;
    const lastYear = plan[plan.length - 1].year;

    if (tYear < firstYear) {
        // Cespite non ancora acquisito nell'anno selezionato
        return {
            initialFund: 0,
            yearQuota: 0,
            totalFund: 0,
            vnc: cost,
            isDepreciated: false,
            activeThisYear: false,
            notAcquiredYet: true
        };
    }

    // Cerca la riga del piano per l'anno target
    const yearRow = plan.find(p => p.year === tYear);
    if (yearRow) {
        const initialFund = yearRow.cumAmort - yearRow.quota;
        return {
            initialFund: initialFund,
            yearQuota: yearRow.quota,
            totalFund: yearRow.cumAmort,
            vnc: yearRow.vnc,
            isDepreciated: yearRow.vnc <= (Number(asset.residual) || 0) + 0.01,
            activeThisYear: true
        };
    } else if (tYear > lastYear) {
        // Cespite già completamente ammortizzato in esercizi precedenti
        const totalFund = plan[plan.length - 1].cumAmort;
        return {
            initialFund: totalFund,
            yearQuota: 0,
            totalFund: totalFund,
            vnc: Number(asset.residual) || 0,
            isDepreciated: true,
            activeThisYear: false
        };
    }

    return { initialFund: 0, yearQuota: 0, totalFund: 0, vnc: cost, isDepreciated: false, activeThisYear: false };
}

// ==========================================
// Rendering Principale della Pagina
// ==========================================
function renderAmmortamenti() {
    const yearSelect = document.getElementById('filter-ammo-year');
    if (yearSelect) selectedAmmoYear = yearSelect.value;
    
    const typeSelect = document.getElementById('filter-ammo-type');
    if (typeSelect) selectedAmmoType = typeSelect.value;

    const sInput = document.getElementById('filter-ammo-search');
    ammoSearchText = sInput ? sInput.value.trim().toLowerCase() : '';

    // Filtra cespiti per tipologia e ricerca
    const filteredAssets = assetsData.filter(a => {
        if (selectedAmmoType && a.type !== selectedAmmoType) return false;
        if (ammoSearchText) {
            const matchesCode = (a.code || '').toLowerCase().includes(ammoSearchText);
            const matchesDesc = (a.desc || '').toLowerCase().includes(ammoSearchText);
            const matchesSupplier = (a.supplier || '').toLowerCase().includes(ammoSearchText);
            const matchesPcn = (a.pcnCode || '').toLowerCase().includes(ammoSearchText);
            if (!matchesCode && !matchesDesc && !matchesSupplier && !matchesPcn) return false;
        }
        return true;
    });

    // Calcolo totali KPI per l'anno selezionato
    let totalGrossCost = 0;
    let totalAccumFund = 0;
    let totalNetBookValue = 0;
    let totalYearQuota = 0;
    let countImmateriali = 0;
    let countMateriali = 0;

    assetsData.forEach(a => {
        if (a.type === 'immateriale') countImmateriali++;
        else countMateriali++;

        const vals = getAssetValuesForYear(a, selectedAmmoYear);
        if (!vals.notAcquiredYet) {
            totalGrossCost += Number(a.cost) || 0;
            totalAccumFund += vals.totalFund;
            totalNetBookValue += vals.vnc;
            totalYearQuota += vals.yearQuota;
        }
    });

    // Aggiorna KPI Cards
    const elCost = document.getElementById('kpi-valore-storico');
    if (elCost) elCost.textContent = formatCurrency(totalGrossCost);

    const elFund = document.getElementById('kpi-fondo-ammortamento');
    if (elFund) elFund.textContent = formatCurrency(totalAccumFund);

    const elNet = document.getElementById('kpi-valore-netto');
    if (elNet) elNet.textContent = formatCurrency(totalNetBookValue);

    const elQuota = document.getElementById('kpi-quota-anno');
    if (elQuota) elQuota.textContent = formatCurrency(totalYearQuota);

    const elCounts = document.getElementById('kpi-conteggio-cespiti');
    if (elCounts) elCounts.textContent = `${countImmateriali} Immat. / ${countMateriali} Mat.`;

    // Verifica Stato Contabilizzazione
    updateBookingStatusBadge();

    // Render Tab 1 (Registro)
    renderRegistroTable(filteredAssets);

    // Render Tab 2 (Pluriennale)
    renderPluriennaleTable(filteredAssets);

    // Render Tab 3 (Scritture)
    renderScrittureTable(filteredAssets);
}

function updateBookingStatusBadge() {
    const badgeEl = document.getElementById('booking-status-badge');
    const btnPost = document.getElementById('btn-post-bilan');
    const btnUnpost = document.getElementById('btn-unpost-bilan');
    if (!badgeEl) return;

    const postedMap = getPostedAmmortamentiMap();
    const isPosted = !!postedMap[selectedAmmoYear];

    if (selectedAmmoYear === 'all') {
        badgeEl.innerHTML = `<span style="background: rgba(148, 163, 184, 0.15); color: #cbd5e1; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 600; font-size: 0.82rem; border: 1px solid rgba(148, 163, 184, 0.3);"><i class="fa-solid fa-eye"></i> Vista Globale Storica</span>`;
        if (btnPost) btnPost.style.opacity = '0.5';
        if (btnUnpost) btnUnpost.style.opacity = '0.5';
        return;
    }

    if (isPosted) {
        badgeEl.innerHTML = `<span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; border: 1px solid rgba(16, 185, 129, 0.4);"><i class="fa-solid fa-circle-check"></i> Contabilizzato a Bilancio ${selectedAmmoYear}</span>`;
        if (btnPost) {
            btnPost.style.opacity = '0.7';
            btnPost.innerHTML = `<i class="fa-solid fa-rotate"></i> Aggiorna Bilancio`;
        }
        if (btnUnpost) {
            btnUnpost.style.display = 'inline-flex';
            btnUnpost.style.opacity = '1';
            btnUnpost.style.border = '2px solid #ef4444';
            btnUnpost.style.background = 'rgba(239, 68, 68, 0.25)';
        }
    } else {
        badgeEl.innerHTML = `<span style="background: rgba(245, 158, 11, 0.18); color: #fbbf24; padding: 0.35rem 0.75rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; border: 1px solid rgba(245, 158, 11, 0.4);"><i class="fa-solid fa-clock"></i> Non Contabilizzato a Bilancio ${selectedAmmoYear}</span>`;
        if (btnPost) {
            btnPost.style.opacity = '1';
            btnPost.innerHTML = `<i class="fa-solid fa-bolt"></i> ⚡ Contabilizza a Bilancio`;
        }
        if (btnUnpost) {
            btnUnpost.style.display = 'inline-flex';
            btnUnpost.style.opacity = '0.5';
            btnUnpost.style.border = '1px solid rgba(239, 68, 68, 0.4)';
            btnUnpost.style.background = 'rgba(239, 68, 68, 0.1)';
        }
    }
}

// ==========================================
// TAB 1: REGISTRO CESPITI TABLE
// ==========================================
function renderRegistroTable(assets) {
    const tbody = document.getElementById('table-body-ammo-registro');
    if (!tbody) return;

    if (!assets.length) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align: center; padding: 2rem; color: var(--text-muted);">Nessun cespite trovato corrispondente ai filtri applicati.</td></tr>`;
        return;
    }

    let html = '';
    assets.forEach(a => {
        const vals = getAssetValuesForYear(a, selectedAmmoYear);
        const typeBadge = a.type === 'immateriale' 
            ? `<span class="badge-immateriale"><i class="fa-solid fa-file-shield"></i> Immateriale</span>` 
            : `<span class="badge-materiale"><i class="fa-solid fa-solar-panel"></i> Materiale</span>`;
        
        let statusBadge = '';
        if (vals.notAcquiredYet) {
            statusBadge = `<span style="color: var(--text-muted); font-size: 0.75rem;">Futuro (${a.date.substring(0,4)})</span>`;
        } else if (vals.isDepreciated) {
            statusBadge = `<span class="badge-ammortizzato"><i class="fa-solid fa-check-double"></i> Ammortizzato</span>`;
        } else {
            statusBadge = `<span class="badge-attivo"><i class="fa-solid fa-arrows-rotate"></i> In Ammort.</span>`;
        }

        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.2s;">
                <td style="padding: 0.75rem 0.5rem; font-family: monospace; font-weight: bold; color: #93c5fd; white-space: nowrap;">${a.code}</td>
                <td style="padding: 0.75rem 0.5rem;">
                    <div style="font-weight: 600; color: white;">${a.desc}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">
                        ${a.supplier ? `<i class="fa-solid fa-building"></i> ${a.supplier}` : ''}
                        ${a.invoice ? ` • <i class="fa-solid fa-receipt"></i> ${a.invoice}` : ''}
                    </div>
                </td>
                <td style="padding: 0.75rem 0.5rem; text-align: center; white-space: nowrap;">${typeBadge}</td>
                <td style="padding: 0.75rem 0.5rem; font-family: monospace; font-size: 0.85rem; color: #6ee7b7; white-space: nowrap;">
                    ${a.pcnCode}<br><small style="color: var(--text-muted);">${a.fundCode}</small>
                </td>
                <td style="padding: 0.75rem 0.5rem; text-align: center; font-family: monospace; font-size: 0.82rem; white-space: nowrap;">${a.date}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; font-weight: bold; white-space: nowrap;">${formatCurrency(a.cost)}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: center; font-size: 0.85rem; white-space: nowrap;">
                    ${a.rate ? Number(a.rate).toFixed(1) : (100/a.years).toFixed(1)}% <small style="color: var(--text-muted);">(${a.years}a)</small>
                </td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; color: var(--text-muted); white-space: nowrap;">${formatCurrency(vals.initialFund)}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; font-weight: bold; color: #f87171; white-space: nowrap;">${formatCurrency(vals.yearQuota)}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; font-weight: 600; color: #fb923c; white-space: nowrap;">${formatCurrency(vals.totalFund)}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; font-weight: bold; color: #34d399; white-space: nowrap;">${formatCurrency(vals.vnc)}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: center; white-space: nowrap;">
                    <button onclick="viewSinglePlan('${a.id}')" title="Visualizza Piano Pluriennale" style="background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); border-radius: 6px; padding: 0.3rem 0.5rem; cursor: pointer; margin-right: 3px;"><i class="fa-solid fa-list-ol"></i></button>
                    <button onclick="editAsset('${a.id}')" title="Modifica" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px; padding: 0.3rem 0.5rem; cursor: pointer; margin-right: 3px;"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteAsset('${a.id}')" title="Elimina" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 6px; padding: 0.3rem 0.5rem; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// ==========================================
// TAB 2: PIANO PLURIENNALE TABLE
// ==========================================
function renderPluriennaleTable(assets) {
    const tbody = document.getElementById('table-body-ammo-pluriennale');
    if (!tbody) return;

    if (!assets.length) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">Nessun cespite disponibile.</td></tr>`;
        return;
    }

    let html = '';
    assets.forEach(a => {
        const plan = calculateAssetDepreciationPlan(a);
        plan.forEach((row, idx) => {
            const isFirst = idx === 0;
            const isCurrentYear = String(row.year) === String(selectedAmmoYear);
            const rowStyle = isCurrentYear ? 'background: rgba(16, 185, 129, 0.12); font-weight: 600;' : 'border-bottom: 1px solid rgba(255,255,255,0.04);';
            const perc = Math.min(100, Math.round(row.percAmort));

            html += `
                <tr style="${rowStyle}">
                    <td style="padding: 0.65rem 0.5rem; font-family: monospace; color: #93c5fd; white-space: nowrap;">${a.code}</td>
                    <td style="padding: 0.65rem 0.5rem;">${a.desc}</td>
                    <td style="padding: 0.65rem 0.5rem; text-align: center; font-weight: bold; ${isCurrentYear ? 'color: #10b981;' : ''}">
                        ${row.year} ${isCurrentYear ? '<i class="fa-solid fa-star" style="font-size: 0.7rem; color: #10b981;"></i>' : ''}
                    </td>
                    <td style="padding: 0.65rem 0.5rem; text-align: right; white-space: nowrap;">${formatCurrency(row.initialValue)}</td>
                    <td style="padding: 0.65rem 0.5rem; text-align: right; color: #f87171; font-weight: bold; white-space: nowrap;">- ${formatCurrency(row.quota)}</td>
                    <td style="padding: 0.65rem 0.5rem; text-align: right; color: #fb923c; white-space: nowrap;">${formatCurrency(row.cumAmort)}</td>
                    <td style="padding: 0.65rem 0.5rem; text-align: right; color: #34d399; font-weight: bold; white-space: nowrap;">${formatCurrency(row.vnc)}</td>
                    <td style="padding: 0.65rem 0.5rem; text-align: center; width: 130px;">
                        <div style="background: rgba(255,255,255,0.1); border-radius: 4px; height: 12px; width: 100%; overflow: hidden; position: relative;">
                            <div style="background: linear-gradient(90deg, #10b981, #3b82f6); height: 100%; width: ${perc}%;"></div>
                        </div>
                        <small style="font-size: 0.72rem; color: var(--text-muted);">${perc}%</small>
                    </td>
                </tr>
            `;
        });
    });

    tbody.innerHTML = html;
}

// ==========================================
// TAB 3: SCRITTURE CONTABILI DI ASSESTAMENTO
// ==========================================
function renderScrittureTable(assets) {
    const tbody = document.getElementById('table-body-ammo-scritture');
    if (!tbody) return;

    const targetYear = selectedAmmoYear === 'all' ? (new Date().getFullYear()) : parseInt(selectedAmmoYear, 10);
    const dateStr = `31/12/${targetYear}`;

    // Aggrega quote per conto PCN
    const pnlMap = {};
    const fundMap = {};

    assets.forEach(a => {
        const vals = getAssetValuesForYear(a, targetYear);
        if (vals.yearQuota > 0.001) {
            // Conto P&L Oneri
            const pnlCode = a.pnlCode || (a.type === 'immateriale' ? '6511000' : '6512000');
            const pnlLabel = a.type === 'immateriale' 
                ? "6511000 - Dotations aux amortissements sur immobilisations incorporelles"
                : "6512000 - Dotations aux amortissements sur immobilisations corporelles";
            
            if (!pnlMap[pnlCode]) {
                pnlMap[pnlCode] = { code: pnlCode, label: pnlLabel, total: 0, items: [] };
            }
            pnlMap[pnlCode].total += vals.yearQuota;
            pnlMap[pnlCode].items.push({ asset: a, quota: vals.yearQuota });

            // Conto Fondo Ammortamento (Stato Patrimoniale)
            const fundCode = a.fundCode || (a.type === 'immateriale' ? '2018000' : '2318000');
            const fundLabel = `${fundCode} - Amortissements cumulés sur ${a.desc.substring(0, 30)}...`;
            if (!fundMap[fundCode]) {
                fundMap[fundCode] = { code: fundCode, label: fundLabel, total: 0, items: [] };
            }
            fundMap[fundCode].total += vals.yearQuota;
            fundMap[fundCode].items.push({ asset: a, quota: vals.yearQuota });
        }
    });

    let totalDare = 0;
    let totalAvere = 0;
    let html = '';

    // Righe DARE (P&L Oneri)
    Object.values(pnlMap).forEach(p => {
        totalDare += p.total;
        html += `
            <tr style="background: rgba(239, 68, 68, 0.08); border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 0.75rem 0.5rem; text-align: center; font-family: monospace; color: var(--text-muted);">${dateStr}</td>
                <td style="padding: 0.75rem 0.5rem; font-family: monospace; font-weight: bold; color: #fca5a5;">${p.code}</td>
                <td style="padding: 0.75rem 0.5rem;">
                    <strong>${p.label}</strong>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">Quota di ammortamento esercizio ${targetYear} (${p.items.length} cespiti)</div>
                </td>
                <td style="padding: 0.75rem 0.5rem; text-align: center;"><span class="badge" style="background: rgba(239,68,68,0.2); color:#fca5a5;">P&L</span></td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; font-weight: bold; color: #f87171;">${formatCurrency(p.total)}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; color: var(--text-muted);">-</td>
            </tr>
        `;
    });

    // Righe AVERE (Stato Patrimoniale Fondi)
    Object.values(fundMap).forEach(f => {
        totalAvere += f.total;
        html += `
            <tr style="background: rgba(59, 130, 246, 0.08); border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 0.75rem 0.5rem; text-align: center; font-family: monospace; color: var(--text-muted);">${dateStr}</td>
                <td style="padding: 0.75rem 0.5rem; font-family: monospace; font-weight: bold; color: #93c5fd;">${f.code}</td>
                <td style="padding: 0.75rem 0.5rem;">
                    <strong>${f.label}</strong>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">Incremento fondo ammortamento al 31/12/${targetYear}</div>
                </td>
                <td style="padding: 0.75rem 0.5rem; text-align: center;"><span class="badge" style="background: rgba(59,130,246,0.2); color:#93c5fd;">BIL</span></td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; color: var(--text-muted);">-</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right; font-weight: bold; color: #93c5fd;">${formatCurrency(f.total)}</td>
            </tr>
        `;
    });

    // Totale Pareggio Scrittura
    html += `
        <tr style="background: rgba(0,0,0,0.35); font-weight: 800; border-top: 2px solid #10b981;">
            <td colspan="4" style="padding: 0.85rem 0.5rem; color: white;">
                <i class="fa-solid fa-scale-balanced" style="color: #10b981;"></i> TOTALE SCRITTURE DI CHIUSURA ${targetYear} (PAREGGIO DARE = AVERE)
            </td>
            <td style="padding: 0.85rem 0.5rem; text-align: right; color: #f87171;">${formatCurrency(totalDare)}</td>
            <td style="padding: 0.85rem 0.5rem; text-align: right; color: #93c5fd;">${formatCurrency(totalAvere)}</td>
        </tr>
    `;

    tbody.innerHTML = html;
}

// ==========================================
// CONTABILIZZAZIONE DI ASSESTAMENTO NEL BILANCIO
// ==========================================
window.postDepreciationToAccounting = function() {
    if (selectedAmmoYear === 'all') {
        alert("Seleziona un anno specifico (es. 2025 o 2026) per contabilizzare gli ammortamenti nel bilancio.");
        return;
    }

    const year = parseInt(selectedAmmoYear, 10);
    const dateStr = `${year}-12-31`;

    // Calcola le quote per tutti i cespiti nell'anno selezionato
    const generatedRecords = [];
    let totalQuotaYear = 0;

    assetsData.forEach(a => {
        const vals = getAssetValuesForYear(a, year);
        if (vals.yearQuota > 0.001) {
            totalQuotaYear += vals.yearQuota;
            const isImmat = a.type === 'immateriale';
            
            // 1. Scrittura P&L (Costo ammortamento)
            generatedRecords.push({
                data: dateStr,
                valuta: dateStr,
                mese: 12,
                anno: year,
                competenza: year,
                imp: -Math.abs(vals.yearQuota),
                tvaPerc: 0.0,
                tva: 0.0,
                totale: -Math.abs(vals.yearQuota),
                tipo: 'PP',
                ap: 'COSTS',
                classe: 'C. CHARGES D\'EXPLOITATION',
                tipologia: isImmat 
                    ? "6511000 - DOTATIONS AUX AMORTISSEMENTS SUR IMMOBILISATIONS INCORPORELLES"
                    : "6512000 - DOTATIONS AUX AMORTISSEMENTS SUR IMMOBILISATIONS CORPORELLES",
                pcnCode: isImmat ? "6511000" : "6512000",
                desc: `Ammortamento ${year}: ${a.desc} (${a.code})`,
                partner: a.supplier || "GREEN ENERBRAS ONE SCSp",
                fattura: `AMM-${year}-${a.code}`,
                paye: "OUI",
                isNonCashAccrual: true,
                isInternalOffset: false,
                isDepreciationRecord: true,
                assetId: a.id
            });

            // 2. Scrittura Bilan (Rettifica Attivo / Fondo Ammortamento)
            generatedRecords.push({
                data: dateStr,
                valuta: dateStr,
                mese: 12,
                anno: year,
                competenza: year,
                imp: -Math.abs(vals.yearQuota),
                tvaPerc: 0.0,
                tva: 0.0,
                totale: -Math.abs(vals.yearQuota),
                tipo: 'BIL',
                ap: 'IMMOBILISATIONS',
                classe: isImmat ? "A. IMMOBILISATIONS INCORPORELLES" : "B. IMMOBILISATIONS CORPORELLES",
                tipologia: `${a.fundCode || (isImmat ? '2018000' : '2318000')} - AMORTISSEMENTS CUMULES SUR ${a.code}`,
                pcnCode: a.fundCode || (isImmat ? '2018000' : '2318000'),
                desc: `Fondo Ammortamento ${year}: ${a.desc}`,
                partner: "GREEN ENERBRAS ONE SCSp",
                fattura: `AMM-${year}-${a.code}`,
                paye: "OUI",
                isNonCashAccrual: true,
                isInternalOffset: false,
                isDepreciationRecord: true,
                assetId: a.id
            });
        }
    });

    if (totalQuotaYear === 0) {
        alert(`Nessuna quota di ammortamento da contabilizzare per l'esercizio ${year}.`);
        return;
    }

    // Salva nella mappa dei postati
    const postedMap = getPostedAmmortamentiMap();
    postedMap[selectedAmmoYear] = {
        year: year,
        total: totalQuotaYear,
        postedAt: new Date().toISOString(),
        records: generatedRecords
    };
    savePostedAmmortamentiMap(postedMap);

    alert(`✅ Contabilizzazione completata con successo per l'anno ${year}!\n\n` +
          `• Totale Ammortamenti contabilizzati: ${formatCurrency(totalQuotaYear)}\n` +
          `• Scritture P&L e Stato Patrimoniale inserite nel Bilancio PCN.\n` +
          `• Puoi visualizzare i risultati aggiornati nella pagina Contabilità.`);

    renderAmmortamenti();
};

window.unpostDepreciationFromAccounting = function() {
    if (selectedAmmoYear === 'all') {
        alert("Seleziona un anno specifico (es. 2025 o 2026) per stornare gli ammortamenti.");
        return;
    }
    const year = parseInt(selectedAmmoYear, 10);
    const postedMap = getPostedAmmortamentiMap();
    if (!postedMap[selectedAmmoYear]) {
        alert(`Nessuna scrittura di ammortamento risulta attualmente contabilizzata per l'anno ${year}.`);
        return;
    }

    if (confirm(`Sei sicuro di voler stornare/annullare la contabilizzazione degli ammortamenti per l'esercizio ${year}?`)) {
        delete postedMap[selectedAmmoYear];
        savePostedAmmortamentiMap(postedMap);

        alert(`↺ Contabilizzazione per l'anno ${year} rimossa con successo dal Bilancio.`);
        renderAmmortamenti();
    }
};

window.clearAllAssets = function() {
    if (confirm("Sei sicuro di voler eliminare TUTTI i cespiti di prova/simulazione? Il registro cespiti verrà completamente svuotato.")) {
        assetsData = [];
        saveAssetsData();
        const postedMap = getPostedAmmortamentiMap();
        delete postedMap[selectedAmmoYear];
        savePostedAmmortamentiMap(postedMap);
        renderAmmortamenti();
        alert("Registro cespiti svuotato con successo! Ora puoi inserire i tuoi cespiti reali.");
    }
};

window.restoreDefaultAssets = function() {
    if (confirm("Vuoi ripristinare i 5 cespiti di simulazione/esempio (costi impianto, software, hardware, fotovoltaico, inverter)?")) {
        assetsData = JSON.parse(JSON.stringify(DEFAULT_ASSETS));
        saveAssetsData();
        renderAmmortamenti();
        alert("Cespiti di simulazione ripristinati!");
    }
};

// ==========================================
// GESTIONE MODALE & CRUD CESPITI
// ==========================================
window.openAssetModal = function(assetId = null) {
    const modal = document.getElementById('modal-asset');
    const form = document.getElementById('form-asset');
    const titleEl = document.getElementById('modal-asset-title');
    if (!modal || !form) return;

    populatePcnDropdown();

    if (assetId) {
        const asset = assetsData.find(a => a.id === assetId);
        if (asset) {
            titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Modifica Cespite: ${asset.code}`;
            document.getElementById('asset-id').value = asset.id;
            document.getElementById('asset-code').value = asset.code;
            document.getElementById('asset-type').value = asset.type;
            onAssetTypeChange();
            document.getElementById('asset-desc').value = asset.desc;
            document.getElementById('asset-pcn').value = asset.pcnCode;
            document.getElementById('asset-date').value = asset.date;
            document.getElementById('asset-supplier').value = asset.supplier || '';
            document.getElementById('asset-invoice').value = asset.invoice || '';
            document.getElementById('asset-cost').value = asset.cost;
            document.getElementById('asset-years').value = asset.years;
            document.getElementById('asset-residual').value = asset.residual || 0;
            document.getElementById('asset-prorata').checked = !!asset.prorata;
            calculateRatePreview();
        }
    } else {
        titleEl.innerHTML = `<i class="fa-solid fa-cube"></i> Nuovo Cespite / Investimento`;
        form.reset();
        document.getElementById('asset-id').value = '';
        document.getElementById('asset-code').value = `MAT-${new Date().getFullYear()}-${String(assetsData.length + 1).padStart(2, '0')}`;
        document.getElementById('asset-type').value = 'materiale';
        onAssetTypeChange();
        document.getElementById('asset-date').value = `${new Date().getFullYear()}-01-01`;
        document.getElementById('asset-years').value = 10;
        document.getElementById('asset-residual').value = '0.00';
        document.getElementById('asset-prorata').checked = true;
        calculateRatePreview();
    }

    modal.style.display = 'flex';
};

window.closeAssetModal = function() {
    const modal = document.getElementById('modal-asset');
    if (modal) modal.style.display = 'none';
};

window.onAssetTypeChange = function() {
    populatePcnDropdown();
    const type = document.getElementById('asset-type').value;
    const codeInput = document.getElementById('asset-code');
    const assetId = document.getElementById('asset-id').value;
    
    if (!assetId && codeInput) {
        const prefix = type === 'immateriale' ? 'IMM' : 'MAT';
        codeInput.value = `${prefix}-${new Date().getFullYear()}-${String(assetsData.length + 1).padStart(2, '0')}`;
    }

    // Default duration
    const yearsInput = document.getElementById('asset-years');
    if (yearsInput && !assetId) {
        yearsInput.value = type === 'immateriale' ? 5 : 10;
    }
    calculateRatePreview();
};

function populatePcnDropdown() {
    const typeSelect = document.getElementById('asset-type');
    const pcnSelect = document.getElementById('asset-pcn');
    if (!typeSelect || !pcnSelect) return;

    const type = typeSelect.value || 'materiale';
    const categories = PCN_CATEGORIES[type] || [];

    let options = '';
    categories.forEach(cat => {
        options += `<option value="${cat.code}" data-fund="${cat.fundCode}" data-pnl="${cat.pnlCode}">${cat.label}</option>`;
    });

    pcnSelect.innerHTML = options;
}

window.calculateRatePreview = function() {
    const years = parseFloat(document.getElementById('asset-years').value) || 1;
    const rate = (100 / Math.max(1, years)).toFixed(2);
    const preview = document.getElementById('asset-rate-preview');
    if (preview) preview.value = `${rate} % / anno`;
};

window.saveAsset = function(e) {
    e.preventDefault();
    const id = document.getElementById('asset-id').value || `asset-${Date.now()}`;
    const code = document.getElementById('asset-code').value.trim();
    const type = document.getElementById('asset-type').value;
    const desc = document.getElementById('asset-desc').value.trim();
    const pcnSelect = document.getElementById('asset-pcn');
    const pcnCode = pcnSelect.value;
    const selectedOpt = pcnSelect.options[pcnSelect.selectedIndex];
    const fundCode = selectedOpt ? selectedOpt.getAttribute('data-fund') : (type === 'immateriale' ? '2018000' : '2318000');
    const pnlCode = selectedOpt ? selectedOpt.getAttribute('data-pnl') : (type === 'immateriale' ? '6511000' : '6512000');
    const date = document.getElementById('asset-date').value;
    const supplier = document.getElementById('asset-supplier').value.trim();
    const invoice = document.getElementById('asset-invoice').value.trim();
    const cost = parseFloat(document.getElementById('asset-cost').value) || 0;
    const years = parseInt(document.getElementById('asset-years').value, 10) || 5;
    const residual = parseFloat(document.getElementById('asset-residual').value) || 0;
    const prorata = document.getElementById('asset-prorata').checked;
    const rate = 100 / years;

    const assetObj = {
        id,
        code,
        type,
        desc,
        pcnCode,
        fundCode,
        pnlCode,
        date,
        supplier,
        invoice,
        cost,
        years,
        rate,
        residual,
        prorata
    };

    const existingIdx = assetsData.findIndex(a => a.id === id);
    if (existingIdx >= 0) {
        assetsData[existingIdx] = assetObj;
    } else {
        assetsData.push(assetObj);
    }

    saveAssetsData();
    closeAssetModal();
    renderAmmortamenti();
};

window.deleteAsset = function(id) {
    const asset = assetsData.find(a => a.id === id);
    if (!asset) return;

    if (confirm(`Sei sicuro di voler eliminare il cespite "${asset.desc}" (${asset.code})?`)) {
        assetsData = assetsData.filter(a => a.id !== id);
        saveAssetsData();
        renderAmmortamenti();
    }
};

window.editAsset = function(id) {
    openAssetModal(id);
};

// ==========================================
// MODALE PIANO SINGOLO CESPITE
// ==========================================
window.viewSinglePlan = function(id) {
    const asset = assetsData.find(a => a.id === id);
    if (!asset) return;

    const modal = document.getElementById('modal-single-plan');
    const titleEl = document.getElementById('single-plan-title');
    const infoEl = document.getElementById('single-plan-info');
    const tbody = document.getElementById('table-body-single-plan');
    if (!modal || !tbody) return;

    titleEl.innerHTML = `<i class="fa-solid fa-table-list"></i> Piano Ammortamento: ${asset.code}`;
    infoEl.innerHTML = `
        <strong>${asset.desc}</strong><br>
        • Costo Storico: <strong>${formatCurrency(asset.cost)}</strong> | Valore Residuo: <strong>${formatCurrency(asset.residual)}</strong><br>
        • Data Messa in Funzione: <strong>${asset.date}</strong> | Vita Utile: <strong>${asset.years} anni (${(100/asset.years).toFixed(2)}%)</strong> | Pro-rata: <strong>${asset.prorata ? 'SI' : 'NO'}</strong>
    `;

    const plan = calculateAssetDepreciationPlan(asset);
    let html = '';
    plan.forEach(row => {
        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 0.6rem 0.5rem; text-align: center; font-weight: bold;">${row.year}</td>
                <td style="padding: 0.6rem 0.5rem; text-align: right;">${formatCurrency(row.initialValue)}</td>
                <td style="padding: 0.6rem 0.5rem; text-align: right; color: #f87171; font-weight: bold;">- ${formatCurrency(row.quota)}</td>
                <td style="padding: 0.6rem 0.5rem; text-align: right; color: #fb923c;">${formatCurrency(row.cumAmort)}</td>
                <td style="padding: 0.6rem 0.5rem; text-align: right; color: #34d399; font-weight: bold;">${formatCurrency(row.vnc)}</td>
                <td style="padding: 0.6rem 0.5rem; text-align: center; font-size: 0.85rem;">${row.percAmort.toFixed(1)}%</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    modal.style.display = 'flex';
};

window.closeSinglePlanModal = function() {
    const modal = document.getElementById('modal-single-plan');
    if (modal) modal.style.display = 'none';
};

// ==========================================
// RILEVAMENTO AUTOMATICO SPESE DA CONTABILITA
// ==========================================
let detectedCandidateRecords = [];

window.openAutoDetectModal = function() {
    const modal = document.getElementById('modal-autodetect');
    if (!modal) return;

    // Sincronizza il filtro anno con la selezione corrente
    const filterYearSelect = document.getElementById('autodetect-year-filter');
    if (filterYearSelect) {
        if (selectedAmmoYear !== 'all') {
            filterYearSelect.value = selectedAmmoYear;
        } else {
            filterYearSelect.value = '2025';
        }
    }

    renderAutoDetectTable();
    modal.style.display = 'flex';
};

window.closeAutoDetectModal = function() {
    const modal = document.getElementById('modal-autodetect');
    if (modal) modal.style.display = 'none';
};

window.toggleAllDetectedCheckboxes = function(checked) {
    const checkboxes = document.querySelectorAll('.autodetect-row-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checked;
    });
    const headerCb = document.getElementById('check-all-detected');
    if (headerCb) headerCb.checked = checked;
};

window.getDetectedExpensesFromAccounting = function(targetYear = '2025') {
    const records = (typeof CONTABILITA_RECORDS !== 'undefined' ? CONTABILITA_RECORDS : (window.CONTABILITA_RECORDS || []));
    if (!records || records.length === 0) return [];

    const candidates = [];

    records.forEach((r, idx) => {
        // Ignora movimenti interni di compensazione/rimborso e scritture non di costo reale
        if (r.isInternalOffset === true || r.isDepreciationRecord === true) return;
        if (r.imp >= 0) return; // Vogliamo le spese/uscite (valori negativi)

        const rYear = r.anno || (r.data ? parseInt(r.data.substring(0, 4), 10) : 2025);
        if (targetYear !== 'all' && String(rYear) !== String(targetYear)) return;

        const tipologia = (r.tipologia || '').toUpperCase();
        const desc = (r.desc || '').toUpperCase();
        const pcnCode = (r.pcnCode || '');
        const partner = (r.partner || '');
        const amount = Math.abs(r.imp);

        let isCandidate = false;
        let pcnSuggested = '2010000';
        let fundSuggested = '2018000';
        let pnlSuggested = '6511000';
        let typeSuggested = 'immateriale';
        let yearsSuggested = 5;
        let isFormation = false;

        // 1. Spese notarili, legali, amministrative, costituzione SCSp (Frais d'établissement)
        if (pcnCode.includes('6135') || tipologia.includes('6135') || tipologia.includes('NOTAR') ||
            desc.includes('NOTAIRE') || desc.includes('R.C.S.') || desc.includes('RCS') || 
            desc.includes('R.B.E.') || desc.includes('RBE') || desc.includes('APOSTILLE') || 
            desc.includes('IMMATRICULATION') || desc.includes('EXTRAIT') || desc.includes('CONSTITUTION')) {
            isCandidate = true;
            isFormation = true;
            pcnSuggested = '2010000';
            fundSuggested = '2018000';
            pnlSuggested = '6511000';
            typeSuggested = 'immateriale';
            yearsSuggested = 5;
        }
        // 2. Licenze Software e Piattaforme IT
        else if (desc.includes('SOFTWARE') || desc.includes('LOGICIEL') || desc.includes('LICEN') || 
                 tipologia.includes('LOGICIEL') || tipologia.includes('SOFTWARE')) {
            isCandidate = true;
            pcnSuggested = '2140000';
            fundSuggested = '2148000';
            pnlSuggested = '6511000';
            typeSuggested = 'immateriale';
            yearsSuggested = 3;
        }
        // 3. Hardware, Server, Sistemi di Telecontrollo ed Elettronica
        else if (desc.includes('SERVER') || desc.includes('HARDWARE') || desc.includes('INFORMATIQUE') || 
                 desc.includes('ORDINAT') || tipologia.includes('MATÉRIEL INFORMATIQUE')) {
            isCandidate = true;
            pcnSuggested = '2520000';
            fundSuggested = '2528000';
            pnlSuggested = '6512000';
            typeSuggested = 'materiale';
            yearsSuggested = 5;
        }
        // 4. Impianti Fotovoltaici, Moduli, Usines Solaires
        else if (desc.includes('PHOTOVOLTA') || desc.includes('FOTOVOLTA') || desc.includes('SOLAIRE') || 
                 desc.includes('CENTRALE') || desc.includes('PANNEAUX') || tipologia.includes('INSTALLATIONS TECHNIQUES')) {
            isCandidate = true;
            pcnSuggested = '2310000';
            fundSuggested = '2318000';
            pnlSuggested = '6512000';
            typeSuggested = 'materiale';
            yearsSuggested = 20;
        }
        // 5. Inverter, Cabine elettriche e trasformatori
        else if (desc.includes('INVERTER') || desc.includes('ONDULEUR') || desc.includes('TRANSFORMATEUR')) {
            isCandidate = true;
            pcnSuggested = '2320000';
            fundSuggested = '2328000';
            pnlSuggested = '6512000';
            typeSuggested = 'materiale';
            yearsSuggested = 10;
        }
        // 6. Altri cespiti e attrezzature tecniche (escludendo le partecipazioni finanziarie 233 che non si ammortizzano)
        else if ((r.ap === 'IMMOBILISATIONS' || (r.classe && r.classe.includes('IMMOBILISATIONS'))) && 
                 !tipologia.includes('PARTICIPATION') && !desc.includes('PARTICIPATION') && !pcnCode.startsWith('233')) {
            isCandidate = true;
            pcnSuggested = '2410000';
            fundSuggested = '2418000';
            pnlSuggested = '6512000';
            typeSuggested = 'materiale';
            yearsSuggested = 8;
        }

        if (isCandidate) {
            candidates.push({
                index: idx,
                date: r.data,
                year: rYear,
                partner: partner || 'Fornitore',
                desc: r.desc,
                invoice: r.fattura && r.fattura !== '-' ? r.fattura : `DOC-${r.data}`,
                cost: amount,
                pcnCode: pcnSuggested,
                fundCode: fundSuggested,
                pnlCode: pnlSuggested,
                type: typeSuggested,
                years: yearsSuggested,
                isFormation: isFormation
            });
        }
    });

    return candidates;
};

window.renderAutoDetectTable = function() {
    const filterYearSelect = document.getElementById('autodetect-year-filter');
    const targetYear = filterYearSelect ? filterYearSelect.value : '2025';
    const tbody = document.getElementById('table-body-autodetect');
    if (!tbody) return;

    detectedCandidateRecords = getDetectedExpensesFromAccounting(targetYear);

    if (detectedCandidateRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.4;"></i><br>
                    Nessun movimento di spesa capitalizzabile rilevato nella contabilità per l'esercizio selezionato (${targetYear}).
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    detectedCandidateRecords.forEach((item, idx) => {
        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.2s;" class="autodetect-row">
                <td style="padding: 0.65rem 0.5rem; text-align: center;">
                    <input type="checkbox" class="autodetect-row-checkbox" data-idx="${idx}" checked style="width: 17px; height: 17px; cursor: pointer;">
                </td>
                <td style="padding: 0.65rem 0.5rem; text-align: center; font-family: monospace; color: var(--text-muted); font-size: 0.85rem;">
                    ${item.date}
                </td>
                <td style="padding: 0.65rem 0.5rem;">
                    <div style="font-weight: 600; color: white;">${item.partner}</div>
                    <div style="font-size: 0.82rem; color: #94a3b8;">${item.desc}</div>
                    ${item.invoice ? `<small style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-receipt"></i> ${item.invoice}</small>` : ''}
                </td>
                <td style="padding: 0.65rem 0.5rem; text-align: right; font-weight: bold; color: #38bdf8; white-space: nowrap;">
                    ${formatCurrency(item.cost)}
                </td>
                <td style="padding: 0.65rem 0.5rem;">
                    <span class="badge ${item.type === 'immateriale' ? 'badge-immateriale' : 'badge-materiale'}">
                        ${item.pcnCode}
                    </span>
                    <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;">
                        ${item.type === 'immateriale' ? 'Immat.' : 'Mat.'} (${item.years} anni - ${(100/item.years).toFixed(0)}%)
                    </div>
                </td>
                <td style="padding: 0.65rem 0.5rem; text-align: center; font-weight: 600; color: #10b981;">
                    ${item.years}
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
};

window.importSelectedDetectedExpenses = function() {
    const checkboxes = document.querySelectorAll('.autodetect-row-checkbox:checked');
    if (checkboxes.length === 0) {
        alert("Seleziona almeno un movimento da importare nel Registro Cespiti.");
        return;
    }

    const groupFormation = document.getElementById('autodetect-group-formation')?.checked ?? true;
    const selectedCandidates = [];

    checkboxes.forEach(cb => {
        const idx = parseInt(cb.getAttribute('data-idx'), 10);
        if (detectedCandidateRecords[idx]) {
            selectedCandidates.push(detectedCandidateRecords[idx]);
        }
    });

    let newAssetsAdded = 0;
    const formationItems = [];
    const regularItems = [];

    selectedCandidates.forEach(cand => {
        if (groupFormation && cand.isFormation) {
            formationItems.push(cand);
        } else {
            regularItems.push(cand);
        }
    });

    // 1. Importa raggruppamento spese notarili / costituzione se richiesto
    if (formationItems.length > 0) {
        const totalFormationCost = formationItems.reduce((sum, item) => sum + item.cost, 0);
        const firstDate = formationItems[0].date || '2025-03-31';
        const targetYear = firstDate.substring(0, 4);

        const groupAsset = {
            id: `asset-formation-${Date.now()}`,
            code: `IMM-${targetYear}-01`,
            type: 'immateriale',
            desc: "Frais d'établissement SCSp (Spese notarili, RCS, RBE, Apostille costituzione)",
            pcnCode: '2010000',
            fundCode: '2018000',
            pnlCode: '6511000',
            date: firstDate,
            supplier: 'RCS Luxembourg / Notaire Schaeffer / RBE',
            invoice: 'NOT-RCS-2025',
            cost: parseFloat(totalFormationCost.toFixed(2)),
            years: 5,
            rate: 20.00,
            residual: 0.00,
            prorata: true
        };

        // Rimuovi eventuali vecchi duplicati con lo stesso codice se necessario
        assetsData.push(groupAsset);
        newAssetsAdded++;
    }

    // 2. Importa le altre voci singolarmente
    regularItems.forEach((item, i) => {
        const itemYear = item.year || (item.date ? item.date.substring(0, 4) : '2025');
        const prefix = item.type === 'immateriale' ? 'IMM' : 'MAT';
        const nextNum = assetsData.length + 1 + i;
        const code = `${prefix}-${itemYear}-${String(nextNum).padStart(2, '0')}`;

        const asset = {
            id: `asset-auto-${Date.now()}-${i}`,
            code: code,
            type: item.type,
            desc: item.desc,
            pcnCode: item.pcnCode,
            fundCode: item.fundCode,
            pnlCode: item.pnlCode,
            date: item.date,
            supplier: item.partner,
            invoice: item.invoice,
            cost: parseFloat(item.cost.toFixed(2)),
            years: item.years,
            rate: parseFloat((100 / item.years).toFixed(4)),
            residual: 0.00,
            prorata: true
        };

        assetsData.push(asset);
        newAssetsAdded++;
    });

    saveAssetsData();
    closeAutoDetectModal();
    renderAmmortamenti();

    alert(`🎉 Rilevamento completato!\n\n` +
          `• Inseriti ${newAssetsAdded} nuovi cespiti nel Registro Cespiti.\n` +
          `• Il piano di ammortamento e le scritture contabili sono state aggiornate in tempo reale.\n` +
          `• Puoi ora verificare i dati e cliccare su "⚡ Contabilizza a Bilancio".`);
};


// ==========================================
// GESTIONE TABS & FILTRI
// ==========================================
window.switchAmmoTab = function(tabId) {
    activeAmmoTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderBottom = '3px solid transparent';
        btn.style.opacity = '0.7';
    });

    document.querySelectorAll('.tab-content').forEach(c => {
        c.style.display = 'none';
    });

    const activeBtn = document.querySelector(`[onclick="switchAmmoTab('${tabId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.borderBottom = '3px solid #10b981';
        activeBtn.style.opacity = '1';
    }

    const target = document.getElementById(tabId);
    if (target) target.style.display = 'block';
};

window.onAmmoFilterChange = function() {
    renderAmmortamenti();
};

// ==========================================
// ESPORTAZIONE EXCEL & PDF
// ==========================================
window.exportAmmortamentiExcel = function() {
    if (typeof XLSX === 'undefined') {
        alert("Libreria SheetJS non caricata.");
        return;
    }

    const wb = XLSX.utils.book_new();

    // Foglio 1: Registro Cespiti Anno
    const regRows = [
        ["GREEN ENERBRAS ONE SCSp - REGISTRO CESPITI ED AMMORTAMENTI"],
        [`Esercizio di Riferimento: ${selectedAmmoYear}`],
        [],
        ["Codice", "Descrizione", "Tipologia", "Conto PCN", "Fondo PCN", "Data Entrata", "Fornitore", "Fattura", "Costo Storico (€)", "Aliquota %", "Anni", "Fondo Iniziale (€)", "Quota Anno (€)", "Fondo al 31/12 (€)", "VNC al 31/12 (€)"]
    ];

    assetsData.forEach(a => {
        const vals = getAssetValuesForYear(a, selectedAmmoYear);
        regRows.push([
            a.code,
            a.desc,
            a.type === 'immateriale' ? 'Immateriale' : 'Materiale',
            a.pcnCode,
            a.fundCode,
            a.date,
            a.supplier || '',
            a.invoice || '',
            a.cost,
            a.rate ? (a.rate / 100) : (1 / a.years),
            a.years,
            vals.initialFund,
            vals.yearQuota,
            vals.totalFund,
            vals.vnc
        ]);
    });

    const wsReg = XLSX.utils.aoa_to_sheet(regRows);
    XLSX.utils.book_append_sheet(wb, wsReg, "Registro Cespiti");

    // Foglio 2: Piano Pluriennale
    const planRows = [
        ["GREEN ENERBRAS ONE SCSp - PIANO PLURIENNALE AMMORTAMENTI"],
        [],
        ["Codice Cespite", "Descrizione", "Esercizio", "Valore Iniziale (€)", "Quota Ammortamento (€)", "Fondo Cumulato (€)", "VNC al 31/12 (€)", "% Ammortizzata"]
    ];

    assetsData.forEach(a => {
        const plan = calculateAssetDepreciationPlan(a);
        plan.forEach(r => {
            planRows.push([
                a.code,
                a.desc,
                r.year,
                r.initialValue,
                r.quota,
                r.cumAmort,
                r.vnc,
                (r.percAmort / 100)
            ]);
        });
    });

    const wsPlan = XLSX.utils.aoa_to_sheet(planRows);
    XLSX.utils.book_append_sheet(wb, wsPlan, "Piano Pluriennale");

    XLSX.writeFile(wb, `GREEN_ENERBRAS_Ammortamenti_${selectedAmmoYear}.xlsx`);
};

window.exportAmmortamentiPDF = function() {
    if (typeof window.jspdf === 'undefined') {
        alert("Libreria jsPDF non disponibile.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Intestazione
    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text("GREEN ENERBRAS ONE SCSp", 14, 15);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Registro Cespiti & Calcolo Ammortamenti Lineari (PCN Lussemburgo) - Esercizio ${selectedAmmoYear}`, 14, 22);

    const headers = [["Codice", "Descrizione", "Tipo", "PCN", "Data", "Costo (€)", "Aliq.", "F. Iniz. (€)", "Quota Anno (€)", "F. 31/12 (€)", "VNC 31/12 (€)"]];
    const data = assetsData.map(a => {
        const vals = getAssetValuesForYear(a, selectedAmmoYear);
        return [
            a.code,
            a.desc.length > 35 ? a.desc.substring(0, 35) + '...' : a.desc,
            a.type === 'immateriale' ? 'Immat.' : 'Mat.',
            a.pcnCode,
            a.date,
            formatCurrency(a.cost),
            `${(100/a.years).toFixed(0)}%`,
            formatCurrency(vals.initialFund),
            formatCurrency(vals.yearQuota),
            formatCurrency(vals.totalFund),
            formatCurrency(vals.vnc)
        ];
    });

    doc.autoTable({
        head: headers,
        body: data,
        startY: 28,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 }
    });

    doc.save(`GREEN_ENERBRAS_Ammortamenti_${selectedAmmoYear}.pdf`);
};

// Expose to window for global access and interoperability
window.loadAssetsData = loadAssetsData;
window.saveAssetsData = saveAssetsData;
window.getPostedAmmortamentiMap = getPostedAmmortamentiMap;
window.calculateAssetDepreciationPlan = calculateAssetDepreciationPlan;
window.getAssetValuesForYear = getAssetValuesForYear;
window.renderAmmortamenti = renderAmmortamenti;

// ==========================================
// Avvio al caricamento del DOM
// ==========================================
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('DOMContentLoaded', () => {
        loadAssetsData();
        renderAmmortamenti();
    });
}
