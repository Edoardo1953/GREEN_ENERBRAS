document.addEventListener('DOMContentLoaded', () => {
    initRisultati();
});

let currentTab = 'tab-ricavi-costi';

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
    return (isNeg ? '- ' : '') + parts.join(',') + " \u20AC";
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
            detailTr.style.background = 'rgba(0,0,0,0.2)';
            let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
            detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Data</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Importo</th></tr>';
            group.items.forEach(item => {
                detailHtml += `<tr>
                    <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.date || '-'}</td>
                    <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.partner || '-'}</td>
                    <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.description || '-'}</td>
                    <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#10b981; border-bottom:1px solid rgba(255,255,255,0.02);">${formatEur(item.amount)}</td>
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
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.style.cursor = 'pointer';
        tr.onclick = () => toggleRowDetail(rowId);
        tr.innerHTML = `
            <td style="padding: 1rem;"><i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-right: 5px;"></i> ${cat}</td>
            <td style="padding: 1rem; text-align: right; color: #ef4444; font-weight: 600;">${formatEur(group.total)}</td>
        `;
        tbody.appendChild(tr);

        // Detail row
        const detailTr = document.createElement('tr');
        detailTr.id = rowId;
        detailTr.style.display = 'none';
        detailTr.style.background = 'rgba(0,0,0,0.2)';
        let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
        detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Data</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Importo</th></tr>';
        group.items.forEach(item => {
            const amtColor = item.amount >= 0 ? '#10b981' : '#ef4444';
            detailHtml += `<tr>
                <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.date || '-'}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.partner || '-'}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.description || '-'}</td>
                <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:${amtColor}; border-bottom:1px solid rgba(255,255,255,0.02);">${formatEur(item.amount)}</td>
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

    // 1. CAPITAUX PROPRES ET PASSIF (Capitale Versato)
    const trC = document.createElement('tr');
    trC.style.background = 'rgba(59, 130, 246, 0.2)';
    trC.innerHTML = `<td colspan="2" style="padding: 1rem; font-weight: bold;" data-i18n="section_capitaux">CAPITAUX PROPRES ET PASSIF</td>`;
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

    Object.keys(capGroups).sort().forEach((partnerName, idx) => {
        const group = capGroups[partnerName];
        totalCap += group.total;
        const rowId = 'detail-cap-' + idx;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.style.cursor = 'pointer';
        tr.onclick = () => toggleRowDetail(rowId);
        tr.innerHTML = `
            <td style="padding: 1rem;"><i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-right: 5px;"></i> ${partnerName}</td>
            <td style="padding: 1rem; text-align: right; color: #3b82f6; font-weight: 600;">${formatEur(group.total)}</td>
        `;
        tbody.appendChild(tr);

        // Detail row
        const detailTr = document.createElement('tr');
        detailTr.id = rowId;
        detailTr.style.display = 'none';
        detailTr.style.background = 'rgba(0,0,0,0.2)';
        let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
        detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Data</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Importo</th></tr>';
        group.items.forEach(item => {
            detailHtml += `<tr>
                <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.date || '-'}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.partner || '-'}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.description || '-'}</td>
                <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#3b82f6; border-bottom:1px solid rgba(255,255,255,0.02);">${formatEur(item.amount)}</td>
            </tr>`;
        });
        detailHtml += '</table></td>';
        detailTr.innerHTML = detailHtml;
        tbody.appendChild(detailTr);
    });

    const trTotCap = document.createElement('tr');
    trTotCap.innerHTML = `
        <td style="padding: 1rem; text-align: right; font-weight: bold;" data-i18n="totale_capitaux">Totale Capitaux:</td>
        <td style="padding: 1rem; text-align: right; font-weight: bold; color: #3b82f6;">${formatEur(totalCap)}</td>
    `;
    tbody.appendChild(trTotCap);

    // 2. IMMOBILISATIONS (Investimenti)
    const trI = document.createElement('tr');
    trI.style.background = 'rgba(245, 158, 11, 0.2)';
    trI.innerHTML = `<td colspan="2" style="padding: 1rem; font-weight: bold;" data-i18n="section_immobili">IMMOBILISATIONS</td>`;
    tbody.appendChild(trI);

    const immTxs = txs.filter(t => t.category && t.category.toLowerCase().includes('immobilisat'));
    
    // Group immobilisations by Description / Entity
    const immGroups = {};
    immTxs.forEach(t => {
        const key = t.description ? t.description.trim() : 'Achat de participation';
        if (!immGroups[key]) immGroups[key] = { total: 0, items: [] };
        immGroups[key].total += Math.abs(t.amount);
        immGroups[key].items.push(t);
    });

    Object.keys(immGroups).sort().forEach((key, idx) => {
        const group = immGroups[key];
        totalImm += group.total;
        const rowId = 'detail-imm-' + idx;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.style.cursor = 'pointer';
        tr.onclick = () => toggleRowDetail(rowId);
        tr.innerHTML = `
            <td style="padding: 1rem;"><i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-right: 5px;"></i> ${key}</td>
            <td style="padding: 1rem; text-align: right; color: #f59e0b; font-weight: 600;">${formatEur(group.total)}</td>
        `;
        tbody.appendChild(tr);

        // Detail row
        const detailTr = document.createElement('tr');
        detailTr.id = rowId;
        detailTr.style.display = 'none';
        detailTr.style.background = 'rgba(0,0,0,0.2)';
        let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
        detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Data</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Destinatario / Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Importo</th></tr>';
        group.items.forEach(item => {
            detailHtml += `<tr>
                <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.date || '-'}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.partner || 'TRI STAR ENERBRAS ONE SCP'}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.description || '-'}</td>
                <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#f59e0b; border-bottom:1px solid rgba(255,255,255,0.02);">${formatEur(Math.abs(item.amount))}</td>
            </tr>`;
        });
        detailHtml += '</table></td>';
        detailTr.innerHTML = detailHtml;
        tbody.appendChild(detailTr);
    });

    const trTotImm = document.createElement('tr');
    trTotImm.innerHTML = `
        <td style="padding: 1rem; text-align: right; font-weight: bold;" data-i18n="totale_immobili">Totale Immobilisations:</td>
        <td style="padding: 1rem; text-align: right; font-weight: bold; color: #f59e0b;">${formatEur(totalImm)}</td>
    `;
    tbody.appendChild(trTotImm);
}
