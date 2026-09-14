document.addEventListener('DOMContentLoaded', () => {
    if (typeof APP_DATA === 'undefined') {
        console.error("Dati non trovati.");
        return;
    }

    // 1. Check Login via Auth object
    if (!Auth || !Auth.currentUser) {
        window.location.href = "../index.html"; // Not logged in
        return;
    }
    
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

    // 2. Formatters
    const formatCurrency = (num) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(num);

    const bankCapByPartner = {};
    if (APP_DATA.transactions && APP_DATA.transactions.length > 0) {
        APP_DATA.transactions.forEach(t => {
            const cat = (t.category || '').toLowerCase();
            if (cat.includes('capital contribution') || cat.includes('capital')) {
                const pNorm = normalizeName(t.partner);
                if (pNorm) {
                    bankCapByPartner[pNorm] = (bankCapByPartner[pNorm] || 0) + t.amount;
                }
            }
        });
    }

    // 3. Robust Partner Matching for Current User
    function findUserPartner(partners, currentUser) {
        if (!partners || !Array.isArray(partners) || !currentUser) return null;
        
        const candidateNames = [
            currentUser.partnerName,
            currentUser.name,
            currentUser.id,
            currentUser.username
        ].filter(Boolean);

        if (currentUser.role === 'admin') {
            candidateNames.push('Edoardo Tubia', 'Edoardo TUBIA', 'Tubia Edoardo');
        }

        // 1. Exact or normalized match
        for (const cName of candidateNames) {
            const cNorm = normalizeName(cName);
            if (!cNorm) continue;
            const found = partners.find(p => {
                const pNorm = normalizeName(p.name);
                return pNorm === cNorm || p.name.toLowerCase() === cName.toLowerCase();
            });
            if (found) return found;
        }

        // 2. Substring / Token matching (e.g. username "silvia" matches "Silvia TUBIA")
        for (const cName of candidateNames) {
            const cleanToken = cName.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanToken.length >= 3 && cleanToken !== 'user' && cleanToken !== 'admin' && cleanToken !== 'partner' && cleanToken !== 'visitor' && cleanToken !== 'ospite') {
                const found = partners.find(p => {
                    const pClean = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return pClean.includes(cleanToken) || cleanToken.includes(pClean);
                });
                if (found) return found;
            }
        }

        return null;
    }

    const userData = findUserPartner(APP_DATA.partners, Auth.currentUser);

    // Determine current user display name
    let currentUserName = "Investitore";
    if (userData && userData.name) {
        currentUserName = userData.name;
    } else if (Auth.currentUser.partnerName) {
        currentUserName = Auth.currentUser.partnerName;
    } else if (Auth.currentUser.role === 'admin') {
        currentUserName = "Edoardo Tubia";
    } else if (Auth.currentUser.role === 'visitor' || Auth.currentUser.role === 'ospite') {
        currentUserName = "Investitore Anonimo";
    } else if (Auth.currentUser.id && Auth.currentUser.id.toLowerCase() !== 'user') {
        currentUserName = Auth.currentUser.id;
    }

    // 4. Populate Topbar
    const userNameTitle = document.getElementById('user-name-title');
    if (userNameTitle) userNameTitle.textContent = currentUserName;

    const userNameNav = document.getElementById('user-name-nav');
    if (userNameNav) userNameNav.textContent = currentUserName;

    const cleanAvatarName = currentUserName.replace(/[()\[\]{}]/g, '').trim() || "User";
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) {
        userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanAvatarName)}&background=10b981&color=fff`;
    }
    
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl && APP_DATA.lastUpdated) {
        lastUpdatedEl.textContent = APP_DATA.lastUpdated;
    }

    // 5. Populate Personal KPIs
    const elPaid = document.getElementById('kpi-personal-paid');
    const elDetention = document.getElementById('kpi-personal-detention');

    if (userData) {
        const uNorm = normalizeName(userData.name);
        const userPaid = (bankCapByPartner[uNorm] !== undefined) ? bankCapByPartner[uNorm] : (userData.paid || userData.contribution || 0);
        if (elPaid) elPaid.textContent = formatCurrency(userPaid);
        if (elDetention) elDetention.textContent = (userData.detention ? userData.detention.toFixed(2) : "0.00") + "%";
    } else {
        if (elPaid) elPaid.textContent = "€ 0";
        if (elDetention) elDetention.textContent = "0.00%";
    }

    // 6. Exchange Rate & FX Performance
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

    setInterval(() => {
        fetchLiveEurBrlRate().then(liveRate => {
            if (liveRate && !isNaN(liveRate)) {
                currentExchangeRate = liveRate;
                updateExchangeDisplay(avgExchangeRate, currentExchangeRate);
            }
        });
    }, 60000);

    // 7. Global Project Status
    let activePlantsCount = 0;
    let waitingPlantsCount = 0;
    let wipPlantsCount = 0;

    if (APP_DATA.modules) {
        APP_DATA.modules.forEach(m => {
            const stato = (m.stato || '').toUpperCase();
            if (stato === 'ATTIVO' || stato === 'ATTIVI' || stato === 'IN PRODUZIONE') {
                activePlantsCount++;
            } else if (stato.includes('ATTESA') || stato.includes('FINITO') || stato.includes('COMPLETATO')) {
                waitingPlantsCount++;
            } else if (stato.includes('COSTRUZIONE') || stato.includes('IN CORSO') || stato.includes('PIANIFICATO')) {
                wipPlantsCount++;
            }
        });
    } else {
        activePlantsCount = 6;
        waitingPlantsCount = 4;
        wipPlantsCount = 2;
    }

    const globalPlantsElem = document.getElementById('kpi-global-plants');
    if (globalPlantsElem) globalPlantsElem.textContent = activePlantsCount;

    const globalWaitingElem = document.getElementById('kpi-global-waiting');
    if (globalWaitingElem) globalWaitingElem.textContent = waitingPlantsCount;

    const globalWipElem = document.getElementById('kpi-global-wip');
    if (globalWipElem) globalWipElem.textContent = wipPlantsCount;

    // Total Production (MWh)
    let totalKwh = 0;
    if (APP_DATA.production) {
        totalKwh = APP_DATA.production.reduce((sum, row) => sum + row.kwh, 0);
    }
    const totalMwh = Math.round(totalKwh / 1000);
    const globalKwhElem = document.getElementById('kpi-global-kwh');
    if (globalKwhElem) globalKwhElem.textContent = new Intl.NumberFormat('it-IT').format(totalMwh);

    // Target ROI
    const defaultROI = "12.5%";
    const roiKpiUserCurrent = document.getElementById('kpi-roi-user-current');
    const roiKpiUserFuture = document.getElementById('kpi-roi-user-future');

    if (typeof db !== 'undefined' && db) {
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

    // 8. Anonymous Shareholder Table & Pie Chart
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
        return (b.detention || 0) - (a.detention || 0);
    });

    const baseColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#84cc16', '#64748b', '#ef4444', '#a855f7'];

    const anonTableBody = document.getElementById('anon-partners-table-body');
    const anonTableFoot = document.getElementById('anon-partners-table-foot');
    let sumContribution = 0;
    let sumPaid = 0;
    let sumDetention = 0;

    if (anonTableBody) {
        anonTableBody.innerHTML = '';
        if (anonTableFoot) anonTableFoot.innerHTML = '';

        let gpCount = 0;
        let lpCount = 0;

        validPartners.forEach((p, index) => {
            const color = baseColors[index % baseColors.length];
            const tr = document.createElement('tr');
            const badgeClass = p.type === 'General Partner' ? 'badge-gp' : 'badge-lp';
            
            sumContribution += (p.contribution || 0);
            sumPaid += (p.paid || 0);
            sumDetention += (p.detention || 0);

            const isGP = p.type === 'General Partner';
            if (isGP) gpCount++; else lpCount++;
            const seqNum = isGP ? gpCount : lpCount;
            const seqStr = String(seqNum).padStart(2, '0');
            const indexStr = String(index + 1).padStart(2, '0');

            const isCurrentUser = Boolean(userData && (
                p.name === userData.name || 
                normalizeName(p.name) === normalizeName(userData.name)
            ));
            
            let refName = isGP ? ("General Partner " + seqStr) : ("Investitore " + seqStr);
            if (isCurrentUser) {
                tr.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                tr.style.borderLeft = '3px solid #10b981';
                refName += ' <span style="background: #10b981; color: #fff; padding: 2px 7px; border-radius: 10px; font-size: 0.75rem; margin-left: 6px; font-weight: 700;">TU</span>';
            }

            tr.innerHTML = `
                <td><div style="width: 16px; height: 16px; border-radius: 4px; background-color: ${color};"></div></td>
                <td class="text-bold"><span style="color:var(--text-muted); margin-right: 8px;">${indexStr}</span>${refName}</td>
                <td><span class="badge ${badgeClass}">${p.type}</span></td>
                <td class="text-bold">${(p.detention || 0).toFixed(2)}%</td>
                <td>${formatCurrency(p.contribution || 0)}</td>
                <td class="text-green">${formatCurrency(p.paid || 0)}</td>
            `;
            anonTableBody.appendChild(tr);
        });

        const trTotal = document.createElement('tr');
        trTotal.style.backgroundColor = 'rgba(255,255,255,0.05)';
        trTotal.innerHTML = `
            <td></td>
            <td class="text-bold" style="font-size: 1.05rem; color: #f8fafc !important;">TOTALE</td>
            <td></td>
            <td class="text-bold" style="font-size: 1.05rem; color: #f59e0b !important;">${Math.round(sumDetention)}%</td>
            <td class="text-bold" style="font-size: 1.05rem; color: #f8fafc !important;">${formatCurrency(sumContribution)}</td>
            <td class="text-bold text-green" style="font-size: 1.05rem; color: #10b981 !important;">${formatCurrency(sumPaid)}</td>
        `;
        
        if (anonTableFoot) {
            anonTableFoot.appendChild(trTotal);
        } else {
            anonTableBody.appendChild(trTotal);
        }
    }

    let anonChartInstance = null;
    const anonCtx = document.getElementById('anonDetentionChart');

    function renderAnonChart() {
        if (!anonCtx || validPartners.length === 0) return;
        
        if (anonChartInstance) {
            anonChartInstance.destroy();
        }

        let gpChartCount = 0;
        let lpChartCount = 0;

        const chartLabels = validPartners.map((p, index) => {
            const isGP = p.type === 'General Partner';
            if (isGP) gpChartCount++; else lpChartCount++;
            const seqStr = String(isGP ? gpChartCount : lpChartCount).padStart(2, '0');

            const isCurrentUser = Boolean(userData && (
                p.name === userData.name || 
                normalizeName(p.name) === normalizeName(userData.name)
            ));
            let l = (isGP ? 'GP ' : 'Inv. ') + seqStr;
            if (isCurrentUser) l += " (Tu)";
            return l;
        });
        const chartData = validPartners.map(p => p.detention || 0);

        let options = {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { 
                    callbacks: { 
                        label: function(context) { 
                            return ` ${context.label || ''}: ${(context.raw || 0).toFixed(2)}%`; 
                        } 
                    } 
                },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 11 },
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

        if (typeof ChartDataLabels !== 'undefined' && typeof Chart !== 'undefined' && Chart.register) {
            try {
                Chart.register(ChartDataLabels);
            } catch(e) {}
        }

        anonChartInstance = new Chart(anonCtx.getContext('2d'), {
            type: 'pie',
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

    if (anonCtx) {
        renderAnonChart();
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

