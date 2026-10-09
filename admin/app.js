document.addEventListener('DOMContentLoaded', () => {
    if (typeof APP_DATA === 'undefined') {
        console.error("Dati non trovati. Esegui update_data.ps1 per generare data.js");
        return;
    }

    const formatCurrency = (num) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(num);
    const formatBRL = (num) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(num);
    
    // Helper to normalize names for matching
    function normalizeName(name) {
        if (!name) return '';
        return name.toLowerCase()
            .replace(/[^a-z0-9]/g, ' ')
            .split(/\s+/)
            .filter(w => w && w !== 'sarl' && w !== 'luxembourg' && w !== 'scp')
            .sort()
            .join(' ');
    }

    // 1. Calculate Bank Balances, Immobilisations & Capital Contributions from Bank Transactions
    let currentBalance = 0;
    let totalExpenses = 0;
    let totalInvestments = 0;
    let totalCapitaleVersato = 0;
    const bankCapByPartner = {};
    
    if (APP_DATA.transactions && APP_DATA.transactions.length > 0) {
        APP_DATA.transactions.forEach(t => {
            currentBalance += t.amount;
            const cat = (t.category || '').toLowerCase();
            const desc = (t.description || '').toLowerCase();

            if (t.amount < 0 && cat.includes('frais')) {
                totalExpenses += Math.abs(t.amount);
            }
            if (cat.includes('immobilisat') || desc.includes('participation')) {
                totalInvestments += Math.abs(t.amount);
            }
            if (cat.includes('capital contribution') || cat.includes('capital')) {
                totalCapitaleVersato += t.amount;
                const pNorm = normalizeName(t.partner);
                if (pNorm) {
                    bankCapByPartner[pNorm] = (bankCapByPartner[pNorm] || 0) + t.amount;
                }
            }
        });
    }

    // 2. Popola KPIs
    const kpiTargetEl = document.getElementById('kpi-target');
    if (kpiTargetEl) kpiTargetEl.textContent = formatCurrency(401000);
    const kpiCollectedEl = document.getElementById('kpi-collected');
    if (kpiCollectedEl) {
        const valCapitale = totalCapitaleVersato > 0 ? totalCapitaleVersato : (APP_DATA.totalCollected || 261000);
        kpiCollectedEl.textContent = formatCurrency(valCapitale);
    }
    
    const kpiInvestmentsEl = document.getElementById('kpi-investments');
    if (kpiInvestmentsEl) {
        const valToDisplay = totalInvestments > 0 ? totalInvestments : 240000;
        kpiInvestmentsEl.textContent = formatCurrency(valToDisplay);
    }
    
    const balanceKpi = document.getElementById('kpi-balance');
    if(balanceKpi) {
        balanceKpi.textContent = formatCurrency(currentBalance);
        if(currentBalance < 0) {
            balanceKpi.classList.remove('text-green');
            balanceKpi.style.color = '#ef4444';
        }
    }
    
    const expensesKpi = document.getElementById('kpi-expenses');
    if(expensesKpi) expensesKpi.textContent = formatCurrency(totalExpenses);

    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl && APP_DATA.lastUpdated) {
        lastUpdatedEl.textContent = APP_DATA.lastUpdated;
    }

    // 2.1 Exchange Rate & FX Performance
    const avgExchangeRate = (APP_DATA && APP_DATA.avgExchangeRate) ? APP_DATA.avgExchangeRate : 6.0164;
    let currentExchangeRate = (APP_DATA && APP_DATA.currentExchangeRate) ? APP_DATA.currentExchangeRate : 5.8823;

    const elExchangeAvg = document.getElementById('kpi-exchange-avg');
    const elExchangeCurrent = document.getElementById('kpi-exchange-current');
    const elExchangePerf = document.getElementById('kpi-exchange-perf');

    function updateExchangeDisplay(avgRate, currRate) {
        if (elExchangeAvg) {
            elExchangeAvg.textContent = `R$ ${avgRate.toFixed(2).replace('.', ',')}`;
            elExchangeAvg.title = `Cambio esatto: ${avgRate.toFixed(4)}`;
        }
        if (elExchangeCurrent) {
            elExchangeCurrent.textContent = currRate.toFixed(2).replace('.', ',');
            elExchangeCurrent.title = `Cambio esatto: ${currRate.toFixed(4)}`;
        }
        if (elExchangePerf && avgRate > 0 && currRate > 0) {
            const perfPct = ((avgRate / currRate) - 1) * 100;
            const sign = perfPct >= 0 ? '+' : '';
            elExchangePerf.textContent = `${sign}${perfPct.toFixed(2)}%`;
            if (perfPct >= 0) {
                elExchangePerf.style.color = '#10b981';
            } else {
                elExchangePerf.style.color = '#ef4444';
            }
        }
    }

    updateExchangeDisplay(avgExchangeRate, currentExchangeRate);

    async function fetchLiveEurBrlRate() {
        // 1. AwesomeAPI (Real-time live quotation from financial markets)
        try {
            const res = await fetch('https://economia.awesomeapi.com.br/last/EUR-BRL');
            if (res.ok) {
                const data = await res.json();
                if (data && data.EURBRL) {
                    const bid = parseFloat(data.EURBRL.bid);
                    const ask = parseFloat(data.EURBRL.ask);
                    const rate = (bid && ask) ? ((bid + ask) / 2) : (bid || ask);
                    if (rate && !isNaN(rate) && rate > 0) return rate;
                }
            }
        } catch (e) {
            console.warn("AwesomeAPI fallback:", e);
        }

        // 2. Frankfurter (European Central Bank reference rates)
        try {
            const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=BRL');
            if (res.ok) {
                const data = await res.json();
                if (data && data.rates && data.rates.BRL) return parseFloat(data.rates.BRL);
            }
        } catch (e) {
            console.warn("Frankfurter fallback:", e);
        }

        // 3. Open Exchange Rates
        try {
            const res = await fetch('https://open.er-api.com/v6/latest/EUR');
            if (res.ok) {
                const data = await res.json();
                if (data && data.rates && data.rates.BRL) return parseFloat(data.rates.BRL);
            }
        } catch (e) {
            console.warn("Open.er-api fallback:", e);
        }

        return currentExchangeRate;
    }

    fetchLiveEurBrlRate().then(liveRate => {
        if (liveRate && !isNaN(liveRate)) {
            currentExchangeRate = liveRate;
            updateExchangeDisplay(avgExchangeRate, currentExchangeRate);
        }
    });

    // Aggiornamento periodico ogni 60 secondi
    setInterval(() => {
        fetchLiveEurBrlRate().then(liveRate => {
            if (liveRate && !isNaN(liveRate)) {
                currentExchangeRate = liveRate;
                updateExchangeDisplay(avgExchangeRate, currentExchangeRate);
            }
        });
    }, 60000);

    // 3. Sort Partners (GP first, then LPs by detention DESC)
    const validPartners = APP_DATA.partners ? JSON.parse(JSON.stringify(APP_DATA.partners)) : [];
    
    // Sync partner paid amounts directly with bank transactions if recorded
    validPartners.forEach(p => {
        const pNorm = normalizeName(p.name);
        if (pNorm && bankCapByPartner[pNorm] !== undefined) {
            p.paid = bankCapByPartner[pNorm];
        }
    });

    validPartners.sort((a, b) => {
        if (a.type === 'General Partner' && b.type !== 'General Partner') return -1;
        if (b.type === 'General Partner' && a.type !== 'General Partner') return 1;
        return b.detention - a.detention;
    });

    const baseColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#84cc16', '#64748b', '#ef4444', '#a855f7'];

    // Helper escapeHtml
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Helper per recuperare la residenza fiscale da AML Custom o AML Partners
    function getPartnerFiscalResidence(partnerName) {
        if (!partnerName) return 'Italia';
        
        // 1. Controlla custom storage AML (localStorage)
        try {
            const rawCustom = localStorage.getItem('green_enerbras_aml_custom_partners');
            if (rawCustom) {
                const customPartners = JSON.parse(rawCustom);
                for (const k in customPartners) {
                    if (k.toLowerCase().includes(partnerName.toLowerCase()) || partnerName.toLowerCase().includes(k.toLowerCase())) {
                        if (customPartners[k].country) return customPartners[k].country;
                    }
                }
            }
        } catch (e) {}

        // 2. Controlla registry statico AML (window.GREEN_ENERBRAS_AML_PARTNERS)
        if (typeof window.GREEN_ENERBRAS_AML_PARTNERS !== 'undefined') {
            const defaultReg = window.GREEN_ENERBRAS_AML_PARTNERS;
            for (const k in defaultReg) {
                if (k.toLowerCase().includes(partnerName.toLowerCase()) || partnerName.toLowerCase().includes(k.toLowerCase())) {
                    if (defaultReg[k].country) return defaultReg[k].country;
                }
            }
        }

        // 3. Fallback intelligente per nome
        const pLower = partnerName.toLowerCase();
        if (pLower.includes('enrico tubia') || pLower.includes('tubia enrico')) {
            return 'Hong Kong';
        }
        if (pLower.includes('new life') || pLower.includes('tubia edoardo') || pLower.includes('edoardo tubia')) {
            return 'Luxembourg';
        }
        if (pLower.includes('miguel')) {
            return 'Espagne';
        }
        if (pLower.includes('tri star')) {
            return 'Brésil';
        }
        return 'Italie';
    }

    // Helper per determinare il codice bandiera del paese
    function getCountryFlagCode(countryStr) {
        if (!countryStr) return 'it';
        const c = countryStr.toLowerCase();
        if (c.includes('hong') || c.includes('hk')) return 'hk';
        if (c.includes('lux') || c.includes('lussemb')) return 'lu';
        if (c.includes('ita') || c.includes('italy')) return 'it';
        if (c.includes('esp') || c.includes('spa') || c.includes('spag')) return 'es';
        if (c.includes('br') || c.includes('bra')) return 'br';
        if (c.includes('ch') || c.includes('sviz') || c.includes('swit') || c.includes('suis')) return 'ch';
        if (c.includes('fr') || c.includes('fran')) return 'fr';
        if (c.includes('de') || c.includes('germ') || c.includes('alle')) return 'de';
        if (c.includes('gb') || c.includes('uk') || c.includes('unit')) return 'gb';
        if (c.includes('us') || c.includes('stat') || c.includes('amer')) return 'us';
        return 'it';
    }

    function getCountryFlagHtml(countryStr) {
        const code = getCountryFlagCode(countryStr);
        return `<img src="https://flagcdn.com/w40/${code}.png" alt="${code.toUpperCase()}" style="width: 17px; height: 12px; object-fit: cover; border-radius: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); vertical-align: middle; display: inline-block;">`;
    }

    // 4. Popola Tabella Partner con Colori
    const tableBody = document.getElementById('partners-table-body');
    let sumContribution = 0;
    let sumPaid = 0;
    let sumDetention = 0;

    validPartners.forEach((p, index) => {
        const color = baseColors[index % baseColors.length];
        const tr = document.createElement('tr');
        const badgeClass = p.type === 'General Partner' ? 'badge-gp' : 'badge-lp';
        
        sumContribution += p.contribution;
        sumPaid += p.paid;
        sumDetention += p.detention;

        const indexStr = String(index + 1).padStart(2, '0');
        const residenceRaw = getPartnerFiscalResidence(p.name);
        const localizedResidence = (typeof getLocalizedCountry === 'function') ? getLocalizedCountry(residenceRaw) : residenceRaw;
        const resLabel = (typeof t === 'function') ? t('label_fiscal_residence', 'Residenza Fiscale') : 'Residenza Fiscale';
        const flagHtml = getCountryFlagHtml(residenceRaw);

        tr.innerHTML = `
            <td style="vertical-align: middle;"><div style="width: 16px; height: 16px; border-radius: 4px; background-color: ${color};"></div></td>
            <td>
                <div class="text-bold" style="font-size: 0.95rem;"><span style="color:var(--text-muted); margin-right: 8px;">${indexStr}</span>${escapeHtml(p.name)}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem; padding-left: 1.6rem; display: flex; align-items: center; gap: 0.4rem;">
                    <i class="fa-solid fa-location-dot" style="font-size: 0.72rem; color: #10b981;"></i>
                    <span>${resLabel}: <strong style="color: var(--text-main); font-weight: 600;">${escapeHtml(localizedResidence)}</strong></span>
                    ${flagHtml}
                </div>
            </td>
            <td style="vertical-align: middle;"><span class="badge ${badgeClass}">${p.type}</span></td>
            <td class="text-bold" style="vertical-align: middle;">${p.detention.toFixed(2)}%</td>
            <td style="vertical-align: middle;">${formatCurrency(p.contribution)}</td>
            <td class="text-green" style="vertical-align: middle;">${formatCurrency(p.paid)}</td>
        `;
        tableBody.appendChild(tr);
    });

    // Add Total Row
    const trTotal = document.createElement('tr');
    trTotal.style.backgroundColor = 'rgba(255,255,255,0.05)';
    trTotal.innerHTML = `
        <td></td>
        <td class="text-bold" style="font-size: 1.1rem; color: #f8fafc !important;">TOTALE</td>
        <td></td>
        <td class="text-bold" style="font-size: 1.1rem; color: #f59e0b !important;">${Math.round(sumDetention)}%</td>
        <td class="text-bold" style="font-size: 1.1rem; color: #f8fafc !important;">${formatCurrency(sumContribution)}</td>
        <td class="text-bold text-green" style="font-size: 1.1rem; color: #10b981 !important;">${formatCurrency(sumPaid)}</td>
    `;
    
    const tableFoot = document.getElementById('partners-table-foot');
    if (tableFoot) {
        tableFoot.appendChild(trTotal);
    } else {
        tableBody.appendChild(trTotal);
    }

    // 5. Crea Grafico (Chart.js - Torta)
    let detentionChartInstance = null;
    const ctx = document.getElementById('detentionChart');

    function renderChart() {
        if (!ctx || validPartners.length === 0) return;
        
        if (detentionChartInstance) {
            detentionChartInstance.destroy();
        }

        const chartLabels = validPartners.map(p => p.name);
        const chartData = validPartners.map(p => p.detention);

        let options = {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: function(context) { return ` ${context.label || ''}: ${context.raw.toFixed(2)}%`; } } },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold' },
                    formatter: function(value, context) {
                        if (value >= 5) {
                            const num = String(context.dataIndex + 1).padStart(2, '0');
                            const name = context.chart.data.labels[context.dataIndex];
                            return `${num} - ${name}`;
                        }
                        return "";
                    }
                }
            }
        };

        detentionChartInstance = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            plugins: [ChartDataLabels],
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Detention %',
                    data: chartData,
                    backgroundColor: baseColors.slice(0, validPartners.length),
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: options
        });
    }

    if (ctx) {
        renderChart();
    }

    // Gestione Modifica ROI (In corso e A regime)
    const defaultROI = "12.5%";
    const roiKpiCurrent = document.getElementById('kpi-roi-current');
    const roiKpiFuture = document.getElementById('kpi-roi-future');
    const editRoiCurrentBtn = document.getElementById('edit-roi-current-btn');
    const editRoiFutureBtn = document.getElementById('edit-roi-future-btn');

    if (typeof db !== 'undefined') {
        db.ref('settings/project_roi_current').on('value', snap => {
            if (roiKpiCurrent) roiKpiCurrent.textContent = snap.val() || localStorage.getItem('project_roi_current') || defaultROI;
        });
        db.ref('settings/project_roi_future').on('value', snap => {
            if (roiKpiFuture) roiKpiFuture.textContent = snap.val() || localStorage.getItem('project_roi_future') || defaultROI;
        });
    } else {
        if (roiKpiCurrent) roiKpiCurrent.textContent = localStorage.getItem('project_roi_current') || defaultROI;
        if (roiKpiFuture) roiKpiFuture.textContent = localStorage.getItem('project_roi_future') || defaultROI;
    }

    if (editRoiCurrentBtn) {
        editRoiCurrentBtn.addEventListener('click', () => {
            const currentVal = roiKpiCurrent.textContent.replace('%', '');
            const newVal = prompt("Inserisci il ROI per l'esercizio in corso (es. 12.5):", currentVal);
            if (newVal !== null && newVal.trim() !== '') {
                const formattedVal = newVal.replace(',', '.') + (newVal.includes('%') ? '' : '%');
                if (typeof db !== 'undefined') {
                    db.ref('settings/project_roi_current').set(formattedVal);
                }
                localStorage.setItem('project_roi_current', formattedVal);
                roiKpiCurrent.textContent = formattedVal;
            }
        });
    }

    if (editRoiFutureBtn) {
        editRoiFutureBtn.addEventListener('click', () => {
            const currentVal = roiKpiFuture.textContent.replace('%', '');
            const newVal = prompt("Inserisci il ROI a regime per gli anni seguenti (es. 12.5):", currentVal);
            if (newVal !== null && newVal.trim() !== '') {
                const formattedVal = newVal.replace(',', '.') + (newVal.includes('%') ? '' : '%');
                if (typeof db !== 'undefined') {
                    db.ref('settings/project_roi_future').set(formattedVal);
                }
                localStorage.setItem('project_roi_future', formattedVal);
                roiKpiFuture.textContent = formattedVal;
            }
        });
    }
});

// ==========================================
// Schema Societario Modal Functions
// ==========================================
window.openSchemaSocietarioModal = function() {
    const modal = document.getElementById('schemaSocietarioModal');
    const iframe = document.getElementById('schema-societario-iframe');
    const newTabLink = document.getElementById('schema-societario-newtab');
    if (!modal || !iframe) return;

    const isUser = (typeof Auth !== 'undefined' && Auth.currentUser) ? 
        (Auth.currentUser.role !== 'admin' || (typeof Auth.isUserView === 'function' && Auth.isUserView())) : 
        false;

    const pdfFilename = isUser ? 'Schema societario GE - Tri Star anonimo.pdf' : 'Schema societario GE - Tri Star.pdf';
    const pdfUrl = `../uploads/${encodeURI(pdfFilename)}`;

    iframe.src = pdfUrl;
    if (newTabLink) newTabLink.href = pdfUrl;
    modal.style.display = 'flex';
};

window.closeSchemaSocietarioModal = function() {
    const modal = document.getElementById('schemaSocietarioModal');
    const iframe = document.getElementById('schema-societario-iframe');
    if (iframe) iframe.src = '';
    if (modal) modal.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('schemaSocietarioModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeSchemaSocietarioModal();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSchemaSocietarioModal();
    });
});

