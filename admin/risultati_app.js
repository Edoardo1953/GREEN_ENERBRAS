document.addEventListener('DOMContentLoaded', () => {
    initRisultati();
});

window.addEventListener('languageChanged', () => {
    renderTables();
});

let currentTab = 'tab-ricavi-costi';
let currentLpPeriod = '2025-2026';

window.onLpPeriodChange = function(newPeriod) {
    currentLpPeriod = newPeriod;
    renderRisultatoLimitedPartners(currentLpPeriod);
};

window.switchTab = function(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderBottom = '3px solid transparent';
        btn.style.opacity = '0.7';
    });

    const activeBtn = document.querySelector(`button[onclick="switchTab('${tabId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.borderBottom = '3px solid #10b981';
        activeBtn.style.opacity = '1';
    }
};

function formatEur(num) {
    let val = parseFloat(num) || 0;
    let isNeg = val < 0;
    val = Math.abs(val);
    let parts = val.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (isNeg ? '-\u00A0' : '') + parts.join(',') + "\u00A0\u20AC";
}

function initRisultati() {
    if (!APP_DATA || !APP_DATA.transactions) return;

    // Extract available years from transactions
    const yearsSet = new Set();
    APP_DATA.transactions.forEach(t => {
        if (t.date) {
            const parts = t.date.split('/');
            if (parts.length === 3 && parts[2]) {
                yearsSet.add(parts[2].trim());
            }
        }
    });

    const years = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    const yearSelect = document.getElementById('filter-year');
    
    if (yearSelect && yearSelect.options.length <= 1) {
        yearSelect.innerHTML = '';
        const optAll = document.createElement('option');
        optAll.value = 'all';
        optAll.setAttribute('data-i18n', 'filter_tutti_anni');
        optAll.textContent = '2025 / 2026 (Accorpato - Tutti gli anni)';
        yearSelect.appendChild(optAll);

        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        });
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', renderTables);
    }

    renderTables();
}

function renderTables() {
    if (!APP_DATA || !APP_DATA.transactions) return;
    
    const yearSelect = document.getElementById('filter-year');
    const selectedYear = yearSelect ? yearSelect.value : 'all';
    
    let txs = APP_DATA.transactions;
    if (selectedYear !== 'all') {
        txs = txs.filter(t => t.date && t.date.endsWith('/' + selectedYear));
    }

    renderRicaviCosti(txs);
    renderCapitaleImmobilizzazioni(txs);
    
    // Per Tab 3 usa currentLpPeriod
    const lpSelect = document.getElementById('select-periodo-lp');
    if (lpSelect && lpSelect.value) {
        currentLpPeriod = lpSelect.value;
    }
    renderRisultatoLimitedPartners(currentLpPeriod);
    
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
}

window.toggleRowDetail = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = (el.style.display === 'none') ? '' : 'none';
};

function renderRicaviCosti(txs) {
    const tbody = document.getElementById('table-body-ricavi-costi');
    if (!tbody) return;
    tbody.innerHTML = '';

    // 1. RICAVI (Attualmente a ZERO come richiesto)
    let totalRevenues = 0;
    
    const trR = document.createElement('tr');
    trR.style.background = 'rgba(16, 185, 129, 0.2)';
    trR.innerHTML = `<td colspan="2" style="padding: 1rem; font-weight: bold;" data-i18n="section_ricavi">RICAVI</td>`;
    tbody.appendChild(trR);

    // Filter any revenue transactions if ever present
    const revTxs = txs.filter(t => t.category && (t.category.toLowerCase().includes('ricav') || t.category.toLowerCase().includes('revenu')) && t.amount > 0);
    
    if (revTxs.length > 0) {
        const revGroups = {};
        revTxs.forEach(t => {
            const cat = t.category || 'Altri Ricavi';
            if (!revGroups[cat]) revGroups[cat] = { total: 0, items: [] };
            revGroups[cat].total += t.amount;
            revGroups[cat].items.push(t);
        });

        Object.keys(revGroups).sort().forEach((cat, idx) => {
            const group = revGroups[cat];
            totalRevenues += group.total;
            const rowId = 'detail-r-' + idx;
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            tr.style.cursor = 'pointer';
            tr.onclick = () => toggleRowDetail(rowId);
            tr.innerHTML = `
                <td style="padding: 1rem;"><i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-right: 5px;"></i> ${cat}</td>
                <td style="padding: 1rem; text-align: right; color: #10b981; font-weight: 600;">${formatEur(group.total)}</td>
            `;
            tbody.appendChild(tr);

            const detailTr = document.createElement('tr');
            detailTr.id = rowId;
            detailTr.style.display = 'none';
            detailTr.style.background = 'rgba(0,0,0,0.1)';
            let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
            detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Data</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Importo</th></tr>';
            group.items.forEach(item => {
                detailHtml += `<tr>
                    <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:var(--text-main, #1e293b); border-bottom:1px solid rgba(128,128,128,0.1);">${item.date || '-'}</td>
                    <td style="padding:0.5rem 1rem; font-size:0.85rem; color:var(--text-main, #1e293b); border-bottom:1px solid rgba(128,128,128,0.1);">${item.partner || '-'}</td>
                    <td style="padding:0.5rem 1rem; font-size:0.85rem; color:var(--text-main, #1e293b); border-bottom:1px solid rgba(128,128,128,0.1);">${item.description || '-'}</td>
                    <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#10b981; border-bottom:1px solid rgba(128,128,128,0.1); font-weight:600;">${formatEur(item.amount)}</td>
                </tr>`;
            });
            detailHtml += '</table></td>';
            detailTr.innerHTML = detailHtml;
            tbody.appendChild(detailTr);
        });
    }

    const trTotR = document.createElement('tr');
    trTotR.innerHTML = `
        <td style="padding: 1rem; text-align: right; font-weight: bold;" data-i18n="totale_ricavi">Totale Ricavi:</td>
        <td style="padding: 1rem; text-align: right; font-weight: bold; color: #10b981;">${formatEur(totalRevenues)}</td>
    `;
    tbody.appendChild(trTotR);

    // 2. COSTI (Spese suddivise per le categorie del conto bancario)
    const trC = document.createElement('tr');
    trC.style.background = 'rgba(239, 68, 68, 0.2)';
    trC.innerHTML = `<td colspan="2" style="padding: 1rem; font-weight: bold;" data-i18n="section_costi">COSTI</td>`;
    tbody.appendChild(trC);

    let totalCosts = 0;

    // Filter cost transactions: exclude Capital Contribution, Immobilisations, Saldo iniziale
    const costTxs = txs.filter(t => {
        if (!t.category) return false;
        const catLower = t.category.toLowerCase();
        if (catLower === 'saldo iniziale') return false;
        if (catLower.includes('capital contribution') || catLower === 'capitale versato') return false;
        if (catLower.includes('immobilisat')) return false;
        return true;
    });

    // Group costs by category
    const costGroups = {};
    costTxs.forEach(t => {
        const cat = t.category.trim() || 'Altre Spese';
        if (!costGroups[cat]) costGroups[cat] = { total: 0, items: [] };
        costGroups[cat].total += t.amount;
        costGroups[cat].items.push(t);
    });

    Object.keys(costGroups).sort().forEach((cat, idx) => {
        const group = costGroups[cat];
        totalCosts += group.total;
        const rowId = 'detail-c-' + idx;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(128,128,128,0.15)';
        tr.style.cursor = 'pointer';
        tr.onclick = () => toggleRowDetail(rowId);
        tr.innerHTML = `
            <td style="padding: 1rem; color: var(--text-main, #1e293b); font-weight: 600;"><i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-right: 5px;"></i> ${cat}</td>
            <td style="padding: 1rem; text-align: right; color: #ef4444; font-weight: 600;">${formatEur(group.total)}</td>
        `;
        tbody.appendChild(tr);

        // Detail row
        const detailTr = document.createElement('tr');
        detailTr.id = rowId;
        detailTr.style.display = 'none';
        detailTr.style.background = 'rgba(0,0,0,0.1)';
        let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
        detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Data</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Importo</th></tr>';
        group.items.forEach(item => {
            const amtColor = item.amount >= 0 ? '#10b981' : '#ef4444';
            detailHtml += `<tr>
                <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:var(--text-main, #1e293b); border-bottom:1px solid rgba(128,128,128,0.1);">${item.date || '-'}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:var(--text-main, #1e293b); border-bottom:1px solid rgba(128,128,128,0.1);">${item.partner || '-'}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:var(--text-main, #1e293b); border-bottom:1px solid rgba(128,128,128,0.1);">${item.description || '-'}</td>
                <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:${amtColor}; border-bottom:1px solid rgba(128,128,128,0.1); font-weight:600;">${formatEur(item.amount)}</td>
            </tr>`;
        });
        detailHtml += '</table></td>';
        detailTr.innerHTML = detailHtml;
        tbody.appendChild(detailTr);
    });

    const trTotC = document.createElement('tr');
    trTotC.innerHTML = `
        <td style="padding: 1rem; text-align: right; font-weight: bold;" data-i18n="totale_costi">Totale Costi:</td>
        <td style="padding: 1rem; text-align: right; font-weight: bold; color: #ef4444;">${formatEur(totalCosts)}</td>
    `;
    tbody.appendChild(trTotC);

    // 3. RISULTATO NETTO
    const net = totalRevenues + totalCosts;
    const color = net >= 0 ? '#10b981' : '#ef4444';
    const trNet = document.createElement('tr');
    trNet.style.background = 'rgba(255,255,255,0.1)';
    trNet.innerHTML = `
        <td style="padding: 1rem; text-align: right; font-weight: bold; font-size: 1.1rem;" data-i18n="risultato_netto">Risultato Netto:</td>
        <td style="padding: 1rem; text-align: right; font-weight: bold; font-size: 1.1rem; color: ${color};">${formatEur(net)}</td>
    `;
    tbody.appendChild(trNet);
}

function renderCapitaleImmobilizzazioni(txs) {
    const tbody = document.getElementById('table-body-capitale');
    if (!tbody) return;
    tbody.innerHTML = '';

    let totalCap = 0;
    let totalImm = 0;

    // 1. PATRIMONIO NETTO E PASSIVO (Capitale Versato)
    const trC = document.createElement('tr');
    trC.style.background = 'rgba(59, 130, 246, 0.2)';
    trC.innerHTML = `<td colspan="2" style="padding: 1rem; font-weight: bold;" data-i18n="section_capitaux">PATRIMONIO NETTO E PASSIVO</td>`;
    tbody.appendChild(trC);

    const capTxs = txs.filter(t => t.category && (t.category.toLowerCase().includes('capital contribution') || t.category.toLowerCase().includes('capitale versato')));
    
    // Group capital contributions by Partner
    const capGroups = {};
    capTxs.forEach(t => {
        const partnerName = t.partner ? t.partner.trim() : 'Altri Apporti';
        if (!capGroups[partnerName]) capGroups[partnerName] = { total: 0, items: [] };
        capGroups[partnerName].total += t.amount;
        capGroups[partnerName].items.push(t);
    });

    // New Life (General Partner) ALWAYS FIRST by default
    const sortedPartnerKeys = Object.keys(capGroups).sort((a, b) => {
        const isGpa = a.toLowerCase().includes('new life') || a.toLowerCase().includes('general partner');
        const isGpb = b.toLowerCase().includes('new life') || b.toLowerCase().includes('general partner');
        if (isGpa && !isGpb) return -1;
        if (!isGpa && isGpb) return 1;
        return a.localeCompare(b);
    });

    sortedPartnerKeys.forEach((partnerName, idx) => {
        const group = capGroups[partnerName];
        totalCap += group.total;
        const rowId = 'detail-cap-' + idx;
        const isGP = partnerName.toLowerCase().includes('new life') || partnerName.toLowerCase().includes('general partner');
        const badgeHtml = isGP ? ` <span class="badge badge-gp" style="margin-left: 8px; font-size: 0.75rem;">General Partner</span>` : '';

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(128,128,128,0.15)';
        tr.style.cursor = 'pointer';
        tr.onclick = () => toggleRowDetail(rowId);
        tr.innerHTML = `
            <td style="padding: 1rem; color: var(--text-main, #1e293b); font-weight: 600;"><i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-right: 5px;"></i> ${partnerName}${badgeHtml}</td>
            <td style="padding: 1rem; text-align: right; color: #3b82f6; font-weight: 600;">${formatEur(group.total)}</td>
        `;
        tbody.appendChild(tr);

        // Detail row
        const detailTr = document.createElement('tr');
        detailTr.id = rowId;
        detailTr.style.display = 'none';
        detailTr.style.background = 'rgba(0,0,0,0.1)';
        let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
        detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Data</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:var(--text-muted, #64748b); border-bottom:1px solid rgba(128,128,128,0.15);">Importo</th></tr>';
        group.items.forEach(item => {
            detailHtml += `<tr>
                <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:var(--text-main, #1e293b); border-bottom:1px solid rgba(128,128,128,0.1);">${item.date || '-'}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:var(--text-main, #1e293b); border-bottom:1px solid rgba(128,128,128,0.1);">${item.partner || '-'}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:var(--text-main, #1e293b); border-bottom:1px solid rgba(128,128,128,0.1);">${item.description || '-'}</td>
                <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#3b82f6; border-bottom:1px solid rgba(128,128,128,0.1); font-weight:600;">${formatEur(item.amount)}</td>
            </tr>`;
        });
        detailHtml += '</table></td>';
        detailTr.innerHTML = detailHtml;
        tbody.appendChild(detailTr);
    });

    const trTotCap = document.createElement('tr');
    trTotCap.innerHTML = `
        <td style="padding: 1rem; text-align: right; font-weight: bold;" data-i18n="totale_capitaux">Totale Patrimonio Netto:</td>
        <td style="padding: 1rem; text-align: right; font-weight: bold; color: #3b82f6; font-size: 1.05rem;">${formatEur(totalCap)}</td>
    `;
    tbody.appendChild(trTotCap);

    // 2. IMMOBILIZZAZIONI (Investimenti / Partecipazioni)
    const trI = document.createElement('tr');
    trI.style.background = 'rgba(245, 158, 11, 0.2)';
    trI.innerHTML = `<td colspan="2" style="padding: 1rem; font-weight: bold;" data-i18n="section_immobili">IMMOBILIZZAZIONI</td>`;
    tbody.appendChild(trI);

    const immTxs = txs.filter(t => {
        const cat = (t.category || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        return cat.includes('immobilisat') || desc.includes('participation');
    });

    if (immTxs.length === 0) {
        const emptyTr = document.createElement('tr');
        emptyTr.innerHTML = `<td colspan="2" style="padding: 1rem; color: var(--text-muted, #64748b); font-style: italic;">Nessun investimento nel periodo selezionato</td>`;
        tbody.appendChild(emptyTr);
    } else {
        immTxs.forEach((t, idx) => {
            const amt = Math.abs(t.amount);
            totalImm += amt;
            const dest = t.partner ? t.partner : 'TRI STAR ENERBRAS ONE SCP';
            const desc = t.description || 'Achat de participation';
            const dateBadge = t.date ? `<span style="background: rgba(245, 158, 11, 0.2); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.4); padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700; font-size: 0.85rem; margin-right: 0.75rem;"><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i>${t.date}</span>` : '';

            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(128,128,128,0.15)';
            tr.innerHTML = `
                <td style="padding: 0.9rem 1rem;">
                    <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.35rem;">
                        ${dateBadge}
                        <strong style="color: var(--text-main, #1e293b); font-weight: 700;">${desc}</strong>
                        <span style="color: var(--text-muted, #64748b); font-size: 0.88rem; font-weight: 600;">- ${dest}</span>
                    </div>
                </td>
                <td style="padding: 0.9rem 1rem; text-align: right; color: #d97706; font-weight: 700; font-size: 1rem;">${formatEur(amt)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    const trTotImm = document.createElement('tr');
    trTotImm.innerHTML = `
        <td style="padding: 1rem; text-align: right; font-weight: bold;" data-i18n="totale_immobili">Totale Immobilizzazioni:</td>
        <td style="padding: 1rem; text-align: right; font-weight: bold; color: #d97706; font-size: 1.05rem;">${formatEur(totalImm)}</td>
    `;
    tbody.appendChild(trTotImm);
}

// =========================================================================
// 3. RISULTATO ECONOMICO LIMITED PARTNERS (LP) - PRO-RATA TEMPORIS
// =========================================================================
function parseDateDMY(dStr) {
    if (!dStr) return null;
    const p = dStr.split('/');
    if (p.length === 3) {
        return new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
    }
    return null;
}

function normalizeLPName(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

function renderRisultatoLimitedPartners(selectedPeriod) {
    const tbody = document.getElementById('table-body-lp-risultati');
    const tfoot = document.getElementById('table-foot-lp-risultati');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (tfoot) tfoot.innerHTML = '';

    const period = selectedPeriod || currentLpPeriod || '2025-2026';
    currentLpPeriod = period;
    const isAccorpato = (period === '2025-2026' || period === '2025/2026' || period === 'all');
    const targetYear = isAccorpato ? 2026 : parseInt(period, 10);

    // Sincronizza il selettore se presente nel DOM
    const lpSelect = document.getElementById('select-periodo-lp');
    if (lpSelect) {
        if (isAccorpato && lpSelect.value !== '2025-2026') {
            lpSelect.value = '2025-2026';
        } else if (!isAccorpato && lpSelect.value !== String(targetYear)) {
            lpSelect.value = String(targetYear);
        }
    }

    const allTxs = APP_DATA.transactions || [];
    
    // 1. Calcola Risultato Netto Totale della Società per il periodo selezionato
    const periodTxs = allTxs.filter(t => {
        if (!t.date) return false;
        if (isAccorpato) return t.date.endsWith('/2025') || t.date.endsWith('/2026');
        return t.date.endsWith('/' + targetYear);
    });
    
    let totalRevenues = 0;
    let totalCosts = 0;
    periodTxs.forEach(t => {
        const cat = (t.category || '').toLowerCase();
        if (cat === 'saldo iniziale') return;
        if (cat.includes('capital contribution') || cat === 'capitale versato') return;
        if (cat.includes('immobilisat') || (t.description || '').toLowerCase().includes('participation')) return;
        if ((cat.includes('ricav') || cat.includes('revenu')) && t.amount > 0) {
            totalRevenues += t.amount;
        } else {
            totalCosts += t.amount;
        }
    });
    const companyNet = totalRevenues + totalCosts; // -7.028,03 per 2025/2026; 0.00 se futuro senza txs

    // Aggiorna Badge di periodo nel banner
    const badgePeriodo = document.getElementById('badge-periodo-lp');
    const badgeStatus = document.getElementById('badge-status-lp');
    if (badgePeriodo) {
        if (isAccorpato) {
            badgePeriodo.textContent = t('badge_accorpato', 'Esercizio 2025 / 2026 (Accorpato)');
            badgePeriodo.style.background = '#10b981';
            badgePeriodo.style.color = '#022c22';
            if (badgeStatus) badgeStatus.style.display = 'none';
        } else {
            badgePeriodo.textContent = `${t('badge_esercizio_ordinario', 'Esercizio')} ${targetYear}`;
            badgePeriodo.style.background = '#3b82f6';
            badgePeriodo.style.color = '#ffffff';
            if (badgeStatus) {
                if (periodTxs.length === 0) {
                    badgeStatus.style.display = 'inline-block';
                    badgeStatus.textContent = t('badge_in_attesa_consuntivo', 'In attesa di consuntivo');
                } else {
                    badgeStatus.style.display = 'none';
                }
            }
        }
    }

    // 2. Definizione dei Limited Partners
    const lpDefinitions = [
        { name: 'Edoardo TUBIA', matches: ['tubia edoardo', 'edoardo tubia'], role: 'Limited Partner', initialDetention: 22.99 },
        { name: 'Salvatore DESIDERIO', matches: ['desiderio'], role: 'Limited Partner', initialDetention: 15.33 },
        { name: 'Marco STERZI', matches: ['sterzi'], role: 'Limited Partner', initialDetention: 15.33 },
        { name: 'Silvia TUBIA', matches: ['tubia silvia', 'silvia tubia'], role: 'Limited Partner', initialDetention: 7.66 },
        { name: 'Stefano BERTOZZI', matches: ['bertozzi'], role: 'Limited Partner', initialDetention: 7.66 },
        { name: 'Maria DE MIGUEL BELLVIS', matches: ['de miguel', 'bellvis'], role: 'Limited Partner', initialDetention: 7.66 },
        { name: 'Enrico TUBIA', matches: ['tubia enrico', 'enrico tubia'], role: 'Limited Partner', initialDetention: 7.66 },
        { name: 'Greta ZANIBONI', matches: ['zaniboni greta', 'greta zaniboni'], role: 'Limited Partner', initialDetention: 7.66 },
        { name: 'Giovanni MILETTI', matches: ['miletti'], role: 'Limited Partner', initialDetention: 7.66 },
        { name: 'Elisa ZANIBONI', matches: ['zaniboni elisa', 'elisa zaniboni'], role: 'Limited Partner (Cessione)', isZero: true, initialDetention: 0.00 }
    ];

    const isLeap = ((targetYear % 4 === 0 && targetYear % 100 !== 0) || targetYear % 400 === 0);
    const daysInTargetYear = isLeap ? 366 : 365;
    const refEndDate = new Date(targetYear, 11, 31);

    // 3. Raccoglie versamenti e calcola capital-days per ciascun socio
    let totalAllLpCapDays = 0;
    let totalAllLpCapital = 0;
    let totalAllLpRimborsi = 0;
    let totalAllLpDividendi = 0;

    const partnerResults = lpDefinitions.map(def => {
        const normMatches = def.matches.map(m => normalizeLPName(m));
        
        // Controlla eventuali rimborsi di capitale o dividendi per il periodo
        const rimborsiTxs = allTxs.filter(t => {
            const cat = (t.category || '').toLowerCase();
            const desc = (t.description || '').toLowerCase();
            const isRimb = (cat.includes('rimborso capitale') || desc.includes('rimborso capitale'));
            if (!isRimb) return false;
            const pNorm = normalizeLPName(t.partner);
            if (!normMatches.some(m => pNorm.includes(m))) return false;
            if (isAccorpato) return t.date && (t.date.endsWith('/2025') || t.date.endsWith('/2026'));
            return t.date && t.date.endsWith('/' + targetYear);
        });

        const dividendiTxs = allTxs.filter(t => {
            const cat = (t.category || '').toLowerCase();
            const desc = (t.description || '').toLowerCase();
            const isDiv = (cat.includes('dividendo') || desc.includes('dividendo') || cat.includes('dividend'));
            if (!isDiv) return false;
            const pNorm = normalizeLPName(t.partner);
            if (!normMatches.some(m => pNorm.includes(m))) return false;
            if (isAccorpato) return t.date && (t.date.endsWith('/2025') || t.date.endsWith('/2026'));
            return t.date && t.date.endsWith('/' + targetYear);
        });

        const rimborsiTot = rimborsiTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const dividendiTot = dividendiTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        let capDays = 0;
        let netCap = 0;
        const validTranches = [];

        if (!def.isZero) {
            if (isAccorpato) {
                // Periodo accorpato 2025 / 2026
                const tranches = allTxs.filter(t => {
                    const cat = (t.category || '').toLowerCase();
                    const isCap = cat.includes('capital contribution') || cat.includes('capitale versato');
                    if (!isCap) return false;
                    const pNorm = normalizeLPName(t.partner);
                    return normMatches.some(m => pNorm.includes(m));
                });

                tranches.forEach(tr => {
                    const amt = tr.amount;
                    netCap += amt;
                    if (amt > 0) {
                        let trancheDate = tr.date;
                        let displayDate = tr.date;
                        let trancheNote = '';

                        // Se Tubia Edoardo ha rilevato la quota di 20.000 € di Elisa Zaniboni, la data da attribuire
                        // all'acquisto per il calcolo pro-rata è quella originaria di sottoscrizione (09/12/2025) e non il 18/11/2026
                        const isEdoardoZaniboniQuota = def.matches.some(m => m.includes('edoardo')) && 
                            (tr.date === '18/11/2026' || (tr.description || '').toLowerCase().includes('zaniboni') || (amt === 20000 && tr.date !== '01/10/2025'));

                        if (isEdoardoZaniboniQuota) {
                            trancheDate = '09/12/2025';
                            displayDate = '09/12/2025';
                            trancheNote = t('note_subtable_ex_zaniboni', 'ex Quota E. Zaniboni sottoscritta il 09/12/2025');
                        }

                        const d = parseDateDMY(trancheDate);
                        const days = d ? Math.max(1, Math.round((refEndDate - d) / (1000 * 60 * 60 * 24))) : 365;
                        capDays += amt * days;
                        validTranches.push({ 
                            date: displayDate, 
                            originalBankDate: tr.date, 
                            amount: amt, 
                            days: days, 
                            note: trancheNote 
                        });
                    }
                });

                validTranches.sort((a, b) => (parseDateDMY(a.date) || 0) - (parseDateDMY(b.date) || 0));
            } else {
                // Esercizio futuro YYYY (2027 e successivi)
                // 1. Capitale iniziale riportato dagli esercizi precedenti (al 31/12/(targetYear-1))
                let carriedCapital = 0;
                const priorTxs = allTxs.filter(t => {
                    const cat = (t.category || '').toLowerCase();
                    if (!cat.includes('capital contribution') && cat !== 'capitale versato') return false;
                    const pNorm = normalizeLPName(t.partner);
                    if (!normMatches.some(m => pNorm.includes(m))) return false;
                    const d = parseDateDMY(t.date);
                    return d && d.getFullYear() < targetYear;
                });
                priorTxs.forEach(tr => {
                    carriedCapital += tr.amount;
                });

                if (carriedCapital > 0) {
                    netCap += carriedCapital;
                    const days = daysInTargetYear;
                    capDays += carriedCapital * days;
                    validTranches.push({
                        date: '01/01/' + targetYear,
                        amount: carriedCapital,
                        days: days,
                        note: t('label_carry_over_capital', 'Capitale iniziale al 01/01')
                    });
                }

                // 2. Eventuali nuovi apporti versati durante l'anno targetYear
                const currentYearTxs = allTxs.filter(t => {
                    const cat = (t.category || '').toLowerCase();
                    if (!cat.includes('capital contribution') && cat !== 'capitale versato') return false;
                    const pNorm = normalizeLPName(t.partner);
                    if (!normMatches.some(m => pNorm.includes(m))) return false;
                    const d = parseDateDMY(t.date);
                    return d && d.getFullYear() === targetYear;
                });
                currentYearTxs.forEach(tr => {
                    const amt = tr.amount;
                    netCap += amt;
                    if (amt > 0) {
                        const d = parseDateDMY(tr.date);
                        const days = d ? Math.max(1, Math.round((refEndDate - d) / (1000 * 60 * 60 * 24))) : daysInTargetYear;
                        capDays += amt * days;
                        validTranches.push({
                            date: tr.date,
                            amount: amt,
                            days: days,
                            note: ''
                        });
                    }
                });

                validTranches.sort((a, b) => (parseDateDMY(a.date) || 0) - (parseDateDMY(b.date) || 0));
            }
        } else {
            // Elisa Zaniboni a ZERO come da richiesta esplicita
            netCap = 0;
            capDays = 0;
        }

        totalAllLpCapDays += capDays;
        totalAllLpCapital += netCap;
        totalAllLpRimborsi += rimborsiTot;
        totalAllLpDividendi += dividendiTot;

        return {
            name: def.name,
            role: def.role,
            isZero: !!def.isZero,
            initialDetention: def.initialDetention,
            netCapital: netCap,
            capDays: capDays,
            tranches: validTranches,
            rimborsi: rimborsiTot,
            dividendi: dividendiTot
        };
    });

    // 4. Calcola ripartizione peso temporale e risultato economico netto
    let totalAllLpNetResult = 0;

    partnerResults.forEach(p => {
        if (p.isZero || p.netCapital <= 0 || totalAllLpCapDays <= 0) {
            p.weightPct = 0;
            p.risultatoNetto = 0;
            p.risultatoPct = 0;
            p.detentionPct = 0;
        } else {
            p.weightPct = (p.capDays / totalAllLpCapDays) * 100;
            p.detentionPct = (p.netCapital / 261000) * 100; // Quota nominale su totale capitale sociale 261k
            // Risultato economico netto della gestione attribuibile al partner
            p.risultatoNetto = (companyNet * (p.weightPct / 100)) + p.dividendi;
            p.risultatoPct = (p.risultatoNetto / p.netCapital) * 100;
        }
        totalAllLpNetResult += p.risultatoNetto;
    });

    // 5. Aggiorna KPI in cima al tab
    const kpiCap = document.getElementById('kpi-lp-capitale');
    if (kpiCap) kpiCap.textContent = formatEur(totalAllLpCapital);
    const kpiRimb = document.getElementById('kpi-lp-rimborsi');
    if (kpiRimb) kpiRimb.textContent = formatEur(totalAllLpRimborsi);
    const kpiDiv = document.getElementById('kpi-lp-dividendi');
    if (kpiDiv) kpiDiv.textContent = formatEur(totalAllLpDividendi);
    const kpiNet = document.getElementById('kpi-lp-risultato-netto');
    if (kpiNet) {
        kpiNet.textContent = formatEur(totalAllLpNetResult);
        kpiNet.style.color = totalAllLpNetResult >= 0 ? '#10b981' : '#ef4444';
    }

    // 6. Render righe tabella
    partnerResults.forEach((p, idx) => {
        const rowId = 'detail-lp-' + idx;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
        tr.style.cursor = p.tranches.length > 0 ? 'pointer' : 'default';
        if (p.tranches.length > 0) {
            tr.onclick = () => toggleRowDetail(rowId);
        }

        // Determina stringa data
        let dateStr = '-';
        if (p.isZero) {
            dateStr = `<span style="color:var(--text-muted, #94a3b8); font-size:0.85rem;">${t('label_cessione_date', 'Cessione 19/11/2026')}</span>`;
        } else if (p.tranches.length === 1) {
            dateStr = `<span style="background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.82rem; font-weight: 600;"><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i>${p.tranches[0].date}</span>`;
        } else if (p.tranches.length > 1) {
            dateStr = `<span style="background: rgba(59,130,246,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.82rem; font-weight: 600;" title="Clicca per visualizzare le ${p.tranches.length} tranches"><i class="fa-solid fa-layer-group" style="margin-right: 4px;"></i>${p.tranches[0].date} (${p.tranches.length} ${t('label_deposits_count', 'vers.')})</span>`;
        }

        // Badge Elisa Zaniboni o Quota
        let nameHtml = `<strong style="color: var(--text-main, #fff); font-size: 0.95rem;">${p.name}</strong>`;
        if (p.isZero) {
            nameHtml += ` <span style="background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.4); font-size: 0.72rem; padding: 0.15rem 0.45rem; border-radius: 4px; margin-left: 6px; font-weight: 700;">${t('badge_quota_ceduta', 'Quota ceduta')}</span>`;
        }

        const netClass = p.isZero ? 'text-muted' : (p.risultatoNetto >= 0 ? 'text-green' : 'text-red');
        const pctClass = p.isZero ? 'text-muted' : (p.risultatoPct >= 0 ? 'text-green' : 'text-red');
        const chevron = p.tranches.length > 0 ? `<i class="fa-solid fa-chevron-down" style="font-size: 0.75em; margin-right: 8px; color: var(--text-muted, #94a3b8);"></i>` : '';

        tr.innerHTML = `
            <td style="padding: 0.85rem 0.5rem; text-align: center; color: var(--text-muted, #94a3b8); font-size: 0.85rem; font-weight: 700; white-space: nowrap !important;">${idx + 1}</td>
            <td style="padding: 0.85rem 1rem; white-space: nowrap !important;">${chevron}${nameHtml}</td>
            <td style="padding: 0.85rem 1rem; text-align: center; white-space: nowrap !important;">${dateStr}</td>
            <td style="padding: 0.85rem 1rem; text-align: right; font-weight: 700; white-space: nowrap !important;"><span class="${p.netCapital > 0 ? 'text-green' : 'text-muted'}" style="white-space: nowrap !important;">${formatEur(p.netCapital)}</span></td>
            <td style="padding: 0.85rem 1rem; text-align: right; font-weight: 600; white-space: nowrap !important;" title="Ponderata giorni: ${p.weightPct.toFixed(2)}%"><span class="text-amber" style="white-space: nowrap !important;">${p.detentionPct.toFixed(2)}%</span></td>
            <td style="padding: 0.85rem 1rem; text-align: right; color: var(--text-muted, #94a3b8); white-space: nowrap !important;"><span style="white-space: nowrap !important;">${formatEur(p.rimborsi)}</span></td>
            <td style="padding: 0.85rem 1rem; text-align: right; color: var(--text-muted, #94a3b8); white-space: nowrap !important;"><span style="white-space: nowrap !important;">${formatEur(p.dividendi)}</span></td>
            <td style="padding: 0.85rem 1rem; text-align: right; font-weight: 700; font-size: 0.98rem; white-space: nowrap !important;"><span class="${netClass}" style="white-space: nowrap !important;">${formatEur(p.risultatoNetto)}</span></td>
            <td style="padding: 0.85rem 1rem; text-align: right; font-weight: 700; font-size: 0.98rem; white-space: nowrap !important;"><span class="${pctClass}" style="white-space: nowrap !important;">${p.isZero ? '0,00%' : (p.risultatoPct >= 0 ? '+' : '') + p.risultatoPct.toFixed(2) + '%'}</span></td>
        `;
        tbody.appendChild(tr);

        // Riga dettaglio espandibile
        if (p.tranches.length > 0) {
            const detailTr = document.createElement('tr');
            detailTr.id = rowId;
            detailTr.style.display = 'none';
            detailTr.style.background = 'rgba(0,0,0,0.2)';
            
            let detailHtml = `<td colspan="9" style="padding: 0.5rem 1rem 0.75rem 2.5rem;">
                <div style="font-size: 0.78rem; font-weight: 700; color: #60a5fa; margin-bottom: 0.4rem; text-transform: uppercase;">
                    <i class="fa-solid fa-list-check" style="margin-right: 5px;"></i> ${t('label_subtable_tranches', 'Tranches di Apporto e Ponderazione Temporale (Capital-Days)')}
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.83rem;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-muted, #94a3b8);">
                            <th style="padding: 0.35rem 0.5rem; text-align: left; white-space: nowrap !important;">${t('col_subtable_date', 'Data Versamento')}</th>
                            <th style="padding: 0.35rem 0.5rem; text-align: right; white-space: nowrap !important;">${t('col_subtable_amount', 'Importo Tranche')}</th>
                            <th style="padding: 0.35rem 0.5rem; text-align: right; white-space: nowrap !important;">${t('col_subtable_days', 'Giorni di Permanenza')}</th>
                            <th style="padding: 0.35rem 0.5rem; text-align: right; white-space: nowrap !important;">${t('col_subtable_capdays', 'Ponderazione (Cap-Days)')}</th>
                        </tr>
                    </thead>
                    <tbody>`;
            p.tranches.forEach(trItem => {
                const capDaysTranche = trItem.amount * (trItem.days || 0);
                const noteHtml = trItem.note ? ` <span style="font-size: 0.76rem; color: #94a3b8; font-style: italic; margin-left: 6px; font-weight: normal;">(${trItem.note})</span>` : '';
                detailHtml += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                    <td style="padding: 0.35rem 0.5rem; color: var(--text-main, #fff); white-space: nowrap !important;">${trItem.date}${noteHtml}</td>
                    <td style="padding: 0.35rem 0.5rem; text-align: right; white-space: nowrap !important;"><span class="${trItem.amount >= 0 ? 'text-green' : 'text-red'}" style="font-weight: 600; white-space: nowrap !important;">${formatEur(trItem.amount)}</span></td>
                    <td style="padding: 0.35rem 0.5rem; text-align: right; color: var(--text-muted, #94a3b8); white-space: nowrap !important;">${trItem.days || 0} ${t('unit_days', 'gg')}</td>
                    <td style="padding: 0.35rem 0.5rem; text-align: right; white-space: nowrap !important;"><span class="text-amber" style="font-weight: 600; white-space: nowrap !important;">${capDaysTranche.toLocaleString('de-DE')}\u00A0€·gg</span></td>
                </tr>`;
            });
            detailHtml += `</tbody></table></td>`;
            detailTr.innerHTML = detailHtml;
            tbody.appendChild(detailTr);
        }
    });

    // 7. Riga Totale nel tfoot
    if (tfoot) {
        const totalNominalDetention = (totalAllLpCapital / 261000) * 100;
        const totalAvgPct = totalAllLpCapital > 0 ? (totalAllLpNetResult / totalAllLpCapital) * 100 : 0;
        const netColClass = totalAllLpNetResult >= 0 ? 'text-green' : 'text-red';

        const trFoot = document.createElement('tr');
        trFoot.innerHTML = `
            <td colspan="3" class="tfoot-title" style="padding: 1rem; text-align: right; font-weight: 800; font-size: 1.05rem; white-space: nowrap !important;">${t('total_lp_label', 'TOTALE LIMITED PARTNERS:')}</td>
            <td style="padding: 1rem; text-align: right; font-weight: 800; font-size: 1.05rem; white-space: nowrap !important;"><span class="text-green" style="white-space: nowrap !important;">${formatEur(totalAllLpCapital)}</span></td>
            <td style="padding: 1rem; text-align: right; font-weight: 800; font-size: 1.05rem; white-space: nowrap !important;"><span class="text-amber" style="white-space: nowrap !important;">${totalNominalDetention.toFixed(2)}%</span></td>
            <td style="padding: 1rem; text-align: right; font-weight: 700; color: var(--text-muted, #94a3b8); white-space: nowrap !important;"><span style="white-space: nowrap !important;">${formatEur(totalAllLpRimborsi)}</span></td>
            <td style="padding: 1rem; text-align: right; font-weight: 700; color: var(--text-muted, #94a3b8); white-space: nowrap !important;"><span style="white-space: nowrap !important;">${formatEur(totalAllLpDividendi)}</span></td>
            <td style="padding: 1rem; text-align: right; font-weight: 800; font-size: 1.1rem; white-space: nowrap !important;"><span class="${netColClass}" style="white-space: nowrap !important;">${formatEur(totalAllLpNetResult)}</span></td>
            <td style="padding: 1rem; text-align: right; font-weight: 800; font-size: 1.1rem; white-space: nowrap !important;"><span class="${netColClass}" style="white-space: nowrap !important;">${(totalAvgPct >= 0 ? '+' : '') + totalAvgPct.toFixed(2)}%</span></td>
        `;
        tfoot.appendChild(trFoot);
    }

    // Salva riferimenti per esportazione
    window._lastLpResults = partnerResults;
    window._lastLpTotals = {
        capital: totalAllLpCapital,
        rimborsi: totalAllLpRimborsi,
        dividendi: totalAllLpDividendi,
        netResult: totalAllLpNetResult,
        companyNet: companyNet
    };
}

// =========================================================================
// 4. FUNZIONI DI ESPORTAZIONE EXCEL E PDF
// =========================================================================
window.exportLpResultsExcel = function() {
    if (!window._lastLpResults || typeof XLSX === 'undefined') {
        alert("Dati non disponibili o libreria XLSX non caricata.");
        return;
    }
    const isAcc = (currentLpPeriod === '2025-2026' || currentLpPeriod === '2025/2026' || currentLpPeriod === 'all');
    const periodTitle = isAcc 
        ? t('badge_accorpato', 'Esercizio Contabile: 2025 / 2026 (Accorpato)') 
        : `${t('badge_esercizio_ordinario', 'Esercizio Contabile:')} ${currentLpPeriod}`;
    const fileSuffix = isAcc ? '2025_2026' : currentLpPeriod;

    const headers = [
        "#",
        t('col_lp_name', 'Limited Partner'),
        t('col_lp_date', 'Data Apporto'),
        t('col_lp_capital', 'Capitale Versato (€)'),
        t('col_lp_detention', 'Quota SCSp (%)'),
        t('col_lp_repayments', 'Rimborsi Capitale (€)'),
        t('col_lp_dividends', 'Dividendi (€)'),
        t('col_lp_net_result', 'Risultato Netto (€)'),
        t('col_lp_yield', 'Risultato %')
    ];

    const rows = [
        ["GREEN ENERBRAS ONE SCSp - " + t('title_risultato_lp', 'Ripartizione Risultato Economico Limited Partners')],
        [periodTitle + " - Pro-Rata Temporis"],
        [],
        headers
    ];

    window._lastLpResults.forEach((p, idx) => {
        const dStr = p.isZero ? t('badge_quota_ceduta', 'Cessione') : (p.tranches.map(tItem => tItem.date).join(', '));
        rows.push([
            idx + 1,
            p.name,
            dStr,
            p.netCapital,
            Number(p.detentionPct.toFixed(2)),
            p.rimborsi,
            p.dividendi,
            Number(p.risultatoNetto.toFixed(2)),
            Number(p.risultatoPct.toFixed(2))
        ]);
    });

    if (window._lastLpTotals) {
        const tot = window._lastLpTotals;
        const totPct = tot.capital > 0 ? (tot.netResult / tot.capital) * 100 : 0;
        rows.push([]);
        rows.push([
            "",
            t('total_lp_label', 'TOTALE LIMITED PARTNERS:'),
            "",
            tot.capital,
            99.62,
            tot.rimborsi,
            tot.dividendi,
            Number(tot.netResult.toFixed(2)),
            Number(totPct.toFixed(2))
        ]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Risultati_LP");
    XLSX.writeFile(wb, `GREEN_ENERBRAS_Risultato_LP_${fileSuffix}.xlsx`);
};

window.exportLpResultsPDF = function() {
    if (!window._lastLpResults || !window.jspdf) {
        alert("Libreria PDF non disponibile.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const isAcc = (currentLpPeriod === '2025-2026' || currentLpPeriod === '2025/2026' || currentLpPeriod === 'all');
    const periodTitle = isAcc 
        ? t('badge_accorpato', 'Esercizio 2025 / 2026 (Accorpato)') 
        : `${t('badge_esercizio_ordinario', 'Esercizio')} ${currentLpPeriod}`;
    const fileSuffix = isAcc ? '2025_2026' : currentLpPeriod;

    doc.setFontSize(16);
    doc.setTextColor(16, 185, 129);
    doc.text("GREEN ENERBRAS ONE SCSp", 14, 15);

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(t('title_risultato_lp', 'Ripartizione Risultato Economico Limited Partners') + " - " + periodTitle, 14, 22);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(t('desc_risultato_lp', 'Criterio: Pro-Rata Temporis (Capital-Days dalla data del versamento) | Rimborsi: 0 € | Dividendi: 0 €'), 14, 28);

    const headers = [[
        "#",
        t('col_lp_name', 'Limited Partner'),
        t('col_lp_date', 'Data Apporto'),
        t('col_lp_capital', 'Capitale Versato'),
        t('col_lp_detention', 'Quota SCSp'),
        t('col_lp_repayments', 'Rimborsi'),
        t('col_lp_dividends', 'Dividendi'),
        t('col_lp_net_result', 'Risultato Netto'),
        t('col_lp_yield', 'Risultato %')
    ]];

    const data = window._lastLpResults.map((p, idx) => [
        idx + 1,
        p.name,
        p.isZero ? t('badge_quota_ceduta', 'Cessione') : p.tranches.map(tItem => tItem.date).join(', '),
        formatEur(p.netCapital),
        p.detentionPct.toFixed(2) + "%",
        formatEur(p.rimborsi),
        formatEur(p.dividendi),
        formatEur(p.risultatoNetto),
        (p.isZero ? "0,00%" : (p.risultatoPct >= 0 ? "+" : "") + p.risultatoPct.toFixed(2) + "%")
    ]);

    if (window._lastLpTotals) {
        const tot = window._lastLpTotals;
        const totPct = tot.capital > 0 ? (tot.netResult / tot.capital) * 100 : 0;
        data.push([
            "",
            t('total_lp_label', 'TOTALE LIMITED PARTNERS:'),
            "",
            formatEur(tot.capital),
            "99.62%",
            formatEur(tot.rimborsi),
            formatEur(tot.dividendi),
            formatEur(tot.netResult),
            (totPct >= 0 ? "+" : "") + totPct.toFixed(2) + "%"
        ]);
    }

    doc.autoTable({
        head: headers,
        body: data,
        startY: 33,
        theme: 'striped',
        styles: { fontSize: 8.5, cellPadding: 2.5 },
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 50, fontStyle: 'bold' },
            2: { halign: 'center', cellWidth: 35 },
            3: { halign: 'right' },
            4: { halign: 'right' },
            5: { halign: 'right' },
            6: { halign: 'right' },
            7: { halign: 'right', fontStyle: 'bold' },
            8: { halign: 'right', fontStyle: 'bold' }
        }
    });

    doc.save(`GREEN_ENERBRAS_Risultato_LP_${fileSuffix}.pdf`);
};
