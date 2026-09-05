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

function initRisultati() {
    if (!APP_DATA || !APP_DATA.risultati) return;

    // Populate years
    const years = [...new Set(APP_DATA.risultati.map(r => r.anno))].filter(y => y).sort((a,b) => b - a);
    const yearSelect = document.getElementById('filter-year');
    
    // Check if we already have the years populated (to avoid duplicates on re-init)
    if (yearSelect.options.length <= 1) {
        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        });
    }

    yearSelect.addEventListener('change', renderTables);

    renderTables();
}

function renderTables() {
    const year = document.getElementById('filter-year').value;
    let data = APP_DATA.risultati;
    
    if (year !== 'all') {
        data = data.filter(r => String(r.anno) === year);
    }

    renderRicaviCosti(data);
    renderCapitaleImmobilizzazioni(data);
    
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
}

function formatEur(num) {
    let val = parseFloat(num) || 0;
    let isNeg = val < 0;
    val = Math.abs(val);
    let parts = val.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (isNeg ? '-' : '') + parts.join(',') + " \u20AC";
}

function groupByCategoryAndTipologia(data, categoryFilters) {
    const filtered = data.filter(r => categoryFilters.includes(r.categoria));
    const groups = {};
    categoryFilters.forEach(c => groups[c] = {});
    
    filtered.forEach(r => {
        if (!groups[r.categoria][r.tipologia]) {
            groups[r.categoria][r.tipologia] = { total: 0, partners: {}, items: [] };
        }
        groups[r.categoria][r.tipologia].total += r.importo;
        
        if (!groups[r.categoria][r.tipologia].partners[r.partner]) {
            groups[r.categoria][r.tipologia].partners[r.partner] = 0;
        }
        groups[r.categoria][r.tipologia].partners[r.partner] += r.importo;
        
        groups[r.categoria][r.tipologia].items.push(r);
    });
    
    return groups;
}

window.toggleRowDetail = function(id) {
    const el = document.getElementById(id);
    if (el.style.display === 'none') {
        el.style.display = '';
    } else {
        el.style.display = 'none';
    }
};

function renderRicaviCosti(data) {
    const tbody = document.getElementById('table-body-ricavi-costi');
    tbody.innerHTML = '';
    const groups = groupByCategoryAndTipologia(data, ['REVENUES', 'COSTS']);
    
    let totalRevenues = 0; let totalCosts = 0;

    const trR = document.createElement('tr');
    trR.style.background = 'rgba(16, 185, 129, 0.2)';
    trR.innerHTML = `<td colspan="2" style="padding: 1rem; font-weight: bold;" data-i18n="section_ricavi">RICAVI</td>`;
    tbody.appendChild(trR);

    const revenues = groups['REVENUES'] || {};
    Object.keys(revenues).sort().forEach((tip, idx) => {
        const val = revenues[tip].total;
        totalRevenues += val;
        const rowId = 'detail-r-' + idx;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.style.cursor = 'pointer';
        tr.onclick = () => toggleRowDetail(rowId);
        tr.innerHTML = `
            <td style="padding: 1rem;"><i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-right: 5px;"></i> ${tip}</td>
            <td style="padding: 1rem; text-align: right; color: #10b981;">${formatEur(val)}</td>
        `;
        tbody.appendChild(tr);

        // Detail row
        const detailTr = document.createElement('tr');
        detailTr.id = rowId;
        detailTr.style.display = 'none';
        detailTr.style.background = 'rgba(0,0,0,0.2)';
        let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
        detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Importo</th></tr>';
        revenues[tip].items.forEach(item => {
            detailHtml += `<tr>
                <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.partner}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.descrizione}</td>
                <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#10b981; border-bottom:1px solid rgba(255,255,255,0.02);">${formatEur(item.importo)}</td>
            </tr>`;
        });
        detailHtml += '</table></td>';
        detailTr.innerHTML = detailHtml;
        tbody.appendChild(detailTr);
    });

    const trTotR = document.createElement('tr');
    trTotR.innerHTML = `
        <td style="padding: 1rem; text-align: right; font-weight: bold;" data-i18n="totale_ricavi">Totale Ricavi:</td>
        <td style="padding: 1rem; text-align: right; font-weight: bold; color: #10b981;">${formatEur(totalRevenues)}</td>
    `;
    tbody.appendChild(trTotR);

    const trC = document.createElement('tr');
    trC.style.background = 'rgba(239, 68, 68, 0.2)';
    trC.innerHTML = `<td colspan="2" style="padding: 1rem; font-weight: bold;" data-i18n="section_costi">COSTI</td>`;
    tbody.appendChild(trC);

    const costs = groups['COSTS'] || {};
    Object.keys(costs).sort().forEach((tip, idx) => {
        const val = costs[tip].total;
        totalCosts += val;
        const rowId = 'detail-c-' + idx;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.style.cursor = 'pointer';
        tr.onclick = () => toggleRowDetail(rowId);
        tr.innerHTML = `
            <td style="padding: 1rem;"><i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-right: 5px;"></i> ${tip}</td>
            <td style="padding: 1rem; text-align: right; color: #ef4444;">${formatEur(val)}</td>
        `;
        tbody.appendChild(tr);

        // Detail row
        const detailTr = document.createElement('tr');
        detailTr.id = rowId;
        detailTr.style.display = 'none';
        detailTr.style.background = 'rgba(0,0,0,0.2)';
        let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
        detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Importo</th></tr>';
        costs[tip].items.forEach(item => {
            detailHtml += `<tr>
                <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.partner}</td>
                <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.descrizione}</td>
                <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#ef4444; border-bottom:1px solid rgba(255,255,255,0.02);">${formatEur(item.importo)}</td>
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

function renderCapitaleImmobilizzazioni(data) {
    const tbody = document.getElementById('table-body-capitale');
    tbody.innerHTML = '';
    const groups = groupByCategoryAndTipologia(data, ['CAPITAUX PROPRES ET PASSIF', 'IMMOBILISATIONS']);
    
    let totalCap = 0; let totalImm = 0;

    const trC = document.createElement('tr');
    trC.style.background = 'rgba(59, 130, 246, 0.2)';
    trC.innerHTML = `<td colspan="2" style="padding: 1rem; font-weight: bold;" data-i18n="section_capitaux">CAPITAUX PROPRES ET PASSIF</td>`;
    tbody.appendChild(trC);

    const cap = groups['CAPITAUX PROPRES ET PASSIF'] || {};
    Object.keys(cap).sort().forEach((tip, idx) => {
        const val = cap[tip].total;
        totalCap += val;
        const rowId = 'detail-cap-' + idx;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.style.cursor = 'pointer';
        tr.onclick = () => toggleRowDetail(rowId);
        tr.innerHTML = `
            <td style="padding: 1rem;"><i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-right: 5px;"></i> ${tip}</td>
            <td style="padding: 1rem; text-align: right; color: #3b82f6;">${formatEur(val)}</td>
        `;
        tbody.appendChild(tr);

        // Detail row
        const detailTr = document.createElement('tr');
        detailTr.id = rowId;
        detailTr.style.display = 'none';
        detailTr.style.background = 'rgba(0,0,0,0.2)';
        let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
        detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Importo</th></tr>';
        if(cap[tip].items) {
            cap[tip].items.forEach(item => {
                detailHtml += `<tr>
                    <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.partner}</td>
                    <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.descrizione}</td>
                    <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#3b82f6; border-bottom:1px solid rgba(255,255,255,0.02);">${formatEur(item.importo)}</td>
                </tr>`;
            });
        }
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

    const trI = document.createElement('tr');
    trI.style.background = 'rgba(245, 158, 11, 0.2)';
    trI.innerHTML = `<td colspan="2" style="padding: 1rem; font-weight: bold;" data-i18n="section_immobili">IMMOBILISATIONS</td>`;
    tbody.appendChild(trI);

    const imm = groups['IMMOBILISATIONS'] || {};
    Object.keys(imm).sort().forEach((tip, idx) => {
        const val = imm[tip].total;
        totalImm += val;
        const rowId = 'detail-imm-' + idx;
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        tr.style.cursor = 'pointer';
        tr.onclick = () => toggleRowDetail(rowId);
        tr.innerHTML = `
            <td style="padding: 1rem;"><i class="fa-solid fa-chevron-down" style="font-size: 0.8em; margin-right: 5px;"></i> ${tip}</td>
            <td style="padding: 1rem; text-align: right; color: #f59e0b;">${formatEur(val)}</td>
        `;
        tbody.appendChild(tr);

        // Detail row
        const detailTr = document.createElement('tr');
        detailTr.id = rowId;
        detailTr.style.display = 'none';
        detailTr.style.background = 'rgba(0,0,0,0.2)';
        let detailHtml = '<td colspan="2" style="padding: 0;"><table style="width:100%; border-collapse:collapse; margin-bottom:1rem;">';
        detailHtml += '<tr><th style="padding:0.5rem 1rem 0.5rem 2rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Partner</th><th style="padding:0.5rem 1rem; text-align:left; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Descrizione</th><th style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#9ca3af; border-bottom:1px solid rgba(255,255,255,0.05);">Importo</th></tr>';
        if (imm[tip].items) {
            imm[tip].items.forEach(item => {
                detailHtml += `<tr>
                    <td style="padding:0.5rem 1rem 0.5rem 2rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.partner}</td>
                    <td style="padding:0.5rem 1rem; font-size:0.85rem; color:#d1d5db; border-bottom:1px solid rgba(255,255,255,0.02);">${item.descrizione}</td>
                    <td style="padding:0.5rem 1rem; text-align:right; font-size:0.85rem; color:#f59e0b; border-bottom:1px solid rgba(255,255,255,0.02);">${formatEur(item.importo)}</td>
                </tr>`;
            });
        }
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
