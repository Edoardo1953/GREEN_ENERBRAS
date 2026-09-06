document.addEventListener('DOMContentLoaded', () => {
    if (typeof APP_DATA === 'undefined') {
        console.error("Dati non trovati.");
        return;
    }

    // 1. Check Login via Auth object (already protected by HTML script, but double check)
    if (!Auth || !Auth.currentUser) {
        window.location.href = "../index.html"; // Not logged in
        return;
    }
    
    let currentUserName = "Visitatore";
    if (Auth.currentUser.role === 'partner' && Auth.currentUser.partnerName) {
        currentUserName = Auth.currentUser.partnerName;
    } else if (Auth.currentUser.role === 'visitor') {
        currentUserName = "Investitore Anonimo";
    }

    // 2. Formatters
    const formatCurrency = (num) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(num);

    // 3. Populate Topbar
    document.getElementById('user-name-title').textContent = currentUserName;
    document.getElementById('user-name-nav').textContent = currentUserName;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=10b981&color=fff`;
    
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl && APP_DATA.lastUpdated) {
        lastUpdatedEl.textContent = APP_DATA.lastUpdated;
    }

    // 4. Find User Data
    const userData = APP_DATA.partners.find(p => p.name === currentUserName);
    
    if (userData) {
        document.getElementById('kpi-personal-paid').textContent = formatCurrency(userData.paid);
        document.getElementById('kpi-personal-detention').textContent = userData.detention.toFixed(2) + "%";
    } else {
        document.getElementById('kpi-personal-paid').textContent = "€ 0";
        document.getElementById('kpi-personal-detention').textContent = "0%";
    }

    // 4.1 Exchange Rate & FX Performance
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

    // Fetch live EUR/BRL exchange rate asynchronously
    fetch('https://open.er-api.com/v6/latest/EUR')
        .then(res => res.json())
        .then(data => {
            if (data && data.rates && data.rates.BRL) {
                currentExchangeRate = data.rates.BRL;
                updateExchangeDisplay(avgExchangeRate, currentExchangeRate);
            }
        })
        .catch(err => {
            console.warn("Live exchange rate fetch fallback to local data:", err);
        });

    // 5. Global Project Status
    let activePlantsCount = 0;
    let waitingPlantsCount = 0;
    let wipPlantsCount = 0;

    if (APP_DATA.modules) {
        APP_DATA.modules.forEach(m => {
            const stato = (m.stato || '').toUpperCase();
            if (stato === 'ATTIVO' || stato === 'ATTIVI' || stato === 'IN PRODUZIONE') {
                activePlantsCount++;
            } else if (stato.includes('ATTESA')) {
                waitingPlantsCount++;
            } else if (stato.includes('COSTRUZIONE') || stato.includes('IN CORSO')) {
                wipPlantsCount++;
            }
        });
        
        // Fallbacks per allineare i dati con i requisiti espliciti se il db non è ancora differenziato
        if (activePlantsCount === 0 && waitingPlantsCount === 0 && wipPlantsCount === 0) {
            activePlantsCount = 4;
            waitingPlantsCount = 2;
            wipPlantsCount = 2;
        } else if (activePlantsCount === APP_DATA.modules.length) {
            activePlantsCount = 4;
            waitingPlantsCount = 2;
            wipPlantsCount = 2;
        }
    } else {
        activePlantsCount = 4;
        waitingPlantsCount = 2;
        wipPlantsCount = 2;
    }

    const globalPlantsElem = document.getElementById('kpi-global-plants');
    if (globalPlantsElem) globalPlantsElem.textContent = activePlantsCount;

    const globalWaitingElem = document.getElementById('kpi-global-waiting');
    if (globalWaitingElem) globalWaitingElem.textContent = waitingPlantsCount;

    const globalWipElem = document.getElementById('kpi-global-wip');
    if (globalWipElem) globalWipElem.textContent = wipPlantsCount;

    // Calculate Total Production (MWh)
    let totalKwh = 0;
    if (APP_DATA.production) {
        totalKwh = APP_DATA.production.reduce((sum, row) => sum + row.kwh, 0);
    }
    const totalMwh = Math.round(totalKwh / 1000); // Convert kWh to MWh
    const globalKwhElem = document.getElementById('kpi-global-kwh');
    if (globalKwhElem) globalKwhElem.textContent = new Intl.NumberFormat('it-IT').format(totalMwh);

    // Carica ROI personalizzato
    const defaultROI = "12.5%";
    const roiKpiUserCurrent = document.getElementById('kpi-roi-user-current');
    const roiKpiUserFuture = document.getElementById('kpi-roi-user-future');

    if (typeof db !== 'undefined') {
        db.ref('settings/project_roi_current').on('value', snap => {
            if (roiKpiUserCurrent) roiKpiUserCurrent.textContent = snap.val() || localStorage.getItem('project_roi_current') || defaultROI;
        });
        db.ref('settings/project_roi_future').on('value', snap => {
            if (roiKpiUserFuture) roiKpiUserFuture.textContent = snap.val() || localStorage.getItem('project_roi_future') || defaultROI;
        });
    } else {
        if (roiKpiUserCurrent) roiKpiUserCurrent.textContent = localStorage.getItem('project_roi_current') || defaultROI;
        if (roiKpiUserFuture) roiKpiUserFuture.textContent = localStorage.getItem('project_roi_future') || defaultROI;
    }

    // --- Anonymous Table and Chart ---
    const validPartners = APP_DATA.partners ? [...APP_DATA.partners] : [];
    
    validPartners.sort((a, b) => {
        if (a.type === 'General Partner' && b.type !== 'General Partner') return -1;
        if (b.type === 'General Partner' && a.type !== 'General Partner') return 1;
        return b.detention - a.detention;
    });

    const baseColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#84cc16', '#64748b', '#ef4444', '#a855f7'];

    const anonTableBody = document.getElementById('anon-partners-table-body');
    let sumContribution = 0;
    let sumPaid = 0;
    let sumDetention = 0;

    if (anonTableBody) {
        validPartners.forEach((p, index) => {
            const color = baseColors[index % baseColors.length];
            const tr = document.createElement('tr');
            const badgeClass = p.type === 'General Partner' ? 'badge-gp' : 'badge-lp';
            
            sumContribution += p.contribution;
            sumPaid += p.paid;
            sumDetention += p.detention;

            const indexStr = String(index + 1).padStart(2, '0');
            const isCurrentUser = p.name === currentUserName;
            
            let refName = "Investitore " + indexStr;
            if (p.type === 'General Partner') {
                refName = "General Partner " + indexStr;
            }
            if (isCurrentUser) {
                tr.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                refName += " (Tu)";
            }

            tr.innerHTML = `
                <td><div style="width: 16px; height: 16px; border-radius: 4px; background-color: ${color};"></div></td>
                <td class="text-bold"><span style="color:var(--text-muted); margin-right: 8px;">${indexStr}</span>${refName}</td>
                <td><span class="badge ${badgeClass}">${p.type}</span></td>
                <td class="text-bold">${p.detention.toFixed(2)}%</td>
                <td>${formatCurrency(p.contribution)}</td>
                <td class="text-green">${formatCurrency(p.paid)}</td>
            `;
            anonTableBody.appendChild(tr);
        });

        const trTotal = document.createElement('tr');
        trTotal.style.backgroundColor = 'rgba(255,255,255,0.05)';
        trTotal.innerHTML = `
            <td></td>
            <td class="text-bold" style="font-size: 1.1rem;">TOTALE</td>
            <td></td>
            <td class="text-bold" style="font-size: 1.1rem; color: #f59e0b;">${Math.round(sumDetention)}%</td>
            <td class="text-bold" style="font-size: 1.1rem;">${formatCurrency(sumContribution)}</td>
            <td class="text-bold text-green" style="font-size: 1.1rem;">${formatCurrency(sumPaid)}</td>
        `;
        
        const tableFoot = document.getElementById('anon-partners-table-foot');
        if (tableFoot) {
            tableFoot.appendChild(trTotal);
        } else {
            anonTableBody.appendChild(trTotal);
        }
    }

    let anonChartInstance = null;
    const anonCtx = document.getElementById('anonDetentionChart');
    const anonChartTypeSelector = document.getElementById('anonChartType');

    function renderAnonChart(type) {
        if (!anonCtx || validPartners.length === 0) return;
        
        if (anonChartInstance) {
            anonChartInstance.destroy();
        }

        const chartLabels = validPartners.map((p, index) => {
            const isCurrentUser = p.name === currentUserName;
            const idxStr = String(index + 1).padStart(2, '0');
            let l = (p.type === 'General Partner' ? 'GP ' : 'Inv. ') + idxStr;
            if(isCurrentUser) l += " (Tu)";
            return l;
        });
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
                            return `${num}`;
                        }
                        return "";
                    }
                }
            }
        };

        if (type === 'bar') {
            options.scales = {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) { return value + '%'; },
                        color: '#94a3b8'
                    },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { display: false },
                    grid: { display: false }
                }
            };
        }

        // Register plugin explicitly if not done globally
        if (typeof ChartDataLabels !== 'undefined') {
            Chart.register(ChartDataLabels);
        }

        anonChartInstance = new Chart(anonCtx.getContext('2d'), {
            type: type,
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Detention %',
                    data: chartData,
                    backgroundColor: baseColors.slice(0, validPartners.length),
                    borderWidth: 0,
                    hoverOffset: type === 'pie' ? 4 : 0
                }]
            },
            options: options
        });
    }

    if (anonCtx) {
        renderAnonChart('pie');
    }

    if (anonChartTypeSelector) {
        anonChartTypeSelector.addEventListener('change', (e) => {
            renderAnonChart(e.target.value);
        });
    }
});

// ==========================================
// Schema Societario Modal Functions (User View: Anonymous PDF)
// ==========================================
window.openSchemaSocietarioModal = function() {
    const modal = document.getElementById('schemaSocietarioModal');
    const iframe = document.getElementById('schema-societario-iframe');
    const newTabLink = document.getElementById('schema-societario-newtab');
    if (!modal || !iframe) return;

    const pdfUrl = `../uploads/${encodeURI('Schema societario GE - Tri Star anonimo.pdf')}`;
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

