document.addEventListener('DOMContentLoaded', () => {
    if (typeof APP_DATA === 'undefined') {
        console.error("Dati non trovati. Esegui update_data.ps1 per generare data.js");
        return;
    }

    const formatCurrency = (num) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(num);
    const formatBRL = (num) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(num);
    
    // 1. Calculate Bank Balances
    let currentBalance = 0;
    let totalExpenses = 0;
    
    if (APP_DATA.transactions && APP_DATA.transactions.length > 0) {
        APP_DATA.transactions.forEach(t => {
            currentBalance += t.amount;
            if (t.amount < 0 && t.category.includes('Frais')) {
                totalExpenses += Math.abs(t.amount);
            }
        });
    }

    // 2. Popola KPIs
    document.getElementById('kpi-target').textContent = formatCurrency(401000);
    document.getElementById('kpi-collected').textContent = formatCurrency(APP_DATA.totalCollected);
    
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

    // 3. Sort Partners (GP first, then LPs by detention DESC)
    const validPartners = APP_DATA.partners ? APP_DATA.partners : [];
    
    validPartners.sort((a, b) => {
        if (a.type === 'General Partner' && b.type !== 'General Partner') return -1;
        if (b.type === 'General Partner' && a.type !== 'General Partner') return 1;
        return b.detention - a.detention;
    });

    const baseColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#84cc16', '#64748b', '#ef4444', '#a855f7'];

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
        tr.innerHTML = `
            <td><div style="width: 16px; height: 16px; border-radius: 4px; background-color: ${color};"></div></td>
            <td class="text-bold"><span style="color:var(--text-muted); margin-right: 8px;">${indexStr}</span>${p.name}</td>
            <td><span class="badge ${badgeClass}">${p.type}</span></td>
            <td class="text-bold">${p.detention.toFixed(2)}%</td>
            <td>${formatCurrency(p.contribution)}</td>
            <td class="text-green">${formatCurrency(p.paid)}</td>
        `;
        tableBody.appendChild(tr);
    });

    // Add Total Row
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
    
    const tableFoot = document.getElementById('partners-table-foot');
    if (tableFoot) {
        tableFoot.appendChild(trTotal);
    } else {
        tableBody.appendChild(trTotal);
    }

    // 5. Crea Grafico (Chart.js)
    let detentionChartInstance = null;
    const ctx = document.getElementById('detentionChart');
    const chartTypeSelector = document.getElementById('chartType');

    function renderChart(type) {
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

        detentionChartInstance = new Chart(ctx.getContext('2d'), {
            type: type,
            plugins: [ChartDataLabels],
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

    if (ctx) {
        renderChart('pie');
    }

    if (chartTypeSelector) {
        chartTypeSelector.addEventListener('change', (e) => {
            renderChart(e.target.value);
        });
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

