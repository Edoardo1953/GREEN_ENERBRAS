Chart.register(ChartDataLabels);
document.addEventListener('DOMContentLoaded', () => {
    if (typeof APP_DATA === 'undefined' || !APP_DATA.production) {
        console.error("Dati di produzione non trovati.");
        return;
    }

    // 1. Check Login
        if (!Auth || !Auth.currentUser) {
        window.location.href = "../index.html";
        return;
    }
    let currentUserName = "Investitore Anonimo";
    if (Auth.currentUser.role === 'partner' && Auth.currentUser.partnerName) {
        currentUserName = Auth.currentUser.partnerName;
    }
    if (!currentUserName) {
        window.location.href = "login.html"; // Not logged in
        return;
    }

    // Set User Profile UI
    const navNameElem = document.getElementById('user-name-nav');
    if (navNameElem) navNameElem.textContent = currentUserName;
    
    const avatarElem = document.getElementById('user-avatar');
    if (avatarElem) avatarElem.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=10b981&color=fff`;

    const formatNumber = (num) => Math.round(Number(num)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formatBRL = (num) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(num);
    
    if (APP_DATA.lastUpdated) {
        const lu = document.getElementById('last-updated');
        if(lu) lu.textContent = APP_DATA.lastUpdated;
    }

    const plantsTableBody = document.getElementById('plants-table-body');
    if (APP_DATA.modules) {
        const statusCounts = {};
        APP_DATA.modules.forEach(m => {
            statusCounts[m.stato] = (statusCounts[m.stato] || 0) + 1;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="text-bold">${m.impianto}</td><td>${m.nome}</td><td style="color: #3b82f6;">${formatBRL(m.investimento)}</td><td style="color: #10b981; font-weight: 600;">${m.stato}</td>`;
            if (plantsTableBody) plantsTableBody.appendChild(tr);
        });
        const kpiList = document.getElementById('kpi-plants-list');
        if (kpiList) {
            let html = '';
            for (const [stato, count] of Object.entries(statusCounts)) {
                let statoLabel = stato;
                if (stato.toUpperCase() === 'ATTIVO') statoLabel = 'ATTIVI';
                let i18nStato = `stato_${stato.replace(/\s+/g, '_')}`;
                html += `<div><span style="color: white; font-weight: bold; font-size: 1.1rem;">${count}</span> <span data-i18n="word_impianti">Impianti</span> <span data-i18n="${i18nStato}">${statoLabel}</span></div>`;
            }
            kpiList.innerHTML = html;
            if(typeof applyTranslations === 'function') applyTranslations();
        }
    }

    let totalKwh = 0;
    let totalRev = 0;
    const monthlyData = {}; 
    const clientData = {};
    const plantTotals = {};
    
    APP_DATA.production.forEach(row => {
        totalKwh += row.kwh;
        totalRev += row.revenues;

        if (!plantTotals[row.id]) plantTotals[row.id] = 0;
        plantTotals[row.id] += row.kwh;

        if (!monthlyData[row.period]) {
            monthlyData[row.period] = { kwh: 0, rev: 0, clients: {} };
        }
        monthlyData[row.period].kwh += row.kwh;
        monthlyData[row.period].rev += row.revenues;
        
        if (!monthlyData[row.period].clients[row.client]) {
            monthlyData[row.period].clients[row.client] = { kwh: 0, rev: 0 };
        }
        monthlyData[row.period].clients[row.client].kwh += row.kwh;
        monthlyData[row.period].clients[row.client].rev += row.revenues;

        if (!clientData[row.client]) clientData[row.client] = 0;
        clientData[row.client] += row.revenues;
    });

    function updateKpiProductionBanner(selectedYear) {
        const kpiKwhElem = document.getElementById('kpi-total-kwh');
        const kpiYearElem = document.getElementById('kpi-total-kwh-year');
        const kpiPlantsList = document.getElementById('kpi-plants-production-list');
        
        let filteredKwh = 0;
        const plantTotalsYear = {};
        
        APP_DATA.production.forEach(row => {
            const periodStr = String(row.period || '');
            const parts = periodStr.split('/');
            const rowYear = parts.length > 1 ? parts[1] : '';
            
            if (selectedYear === 'all' || rowYear === selectedYear) {
                const kwhVal = Number(row.kwh) || 0;
                filteredKwh += kwhVal;
                const impId = String(row.id);
                if (!plantTotalsYear[impId]) plantTotalsYear[impId] = 0;
                plantTotalsYear[impId] += kwhVal;
            }
        });
        
        if (kpiKwhElem) {
            kpiKwhElem.innerHTML = formatNumber(filteredKwh) + ' <span style="font-size: 0.8em; color: #9ca3af;">kWh</span>';
        }
        
        if (kpiYearElem) {
            const currentLang = localStorage.getItem('app_lang') || 'it';
            if (selectedYear === 'all') {
                if (currentLang === 'en') kpiYearElem.textContent = 'All years';
                else if (currentLang === 'fr') kpiYearElem.textContent = 'Toutes les années';
                else kpiYearElem.textContent = 'Tutti gli anni';
            } else {
                if (currentLang === 'en') kpiYearElem.textContent = 'in ' + selectedYear;
                else if (currentLang === 'fr') kpiYearElem.textContent = 'en ' + selectedYear;
                else kpiYearElem.textContent = 'nel ' + selectedYear;
            }
        }
        
        if (kpiPlantsList) {
            let listHtml = '';
            const sortedPlantIds = Object.keys(plantTotalsYear).sort((a,b) => Number(a) - Number(b));
            sortedPlantIds.forEach(id => {
                listHtml += `<div style="display: flex; justify-content: space-between;"><span>USINA ${String(id).padStart(3, '0')}</span> <span style="color: white; font-weight: 600; margin-left: 0.5rem;">${formatNumber(plantTotalsYear[id])} kWh</span></div>`;
            });
            kpiPlantsList.innerHTML = listHtml;
        }
    }
    window.updateKpiProductionBanner = updateKpiProductionBanner;

    // 3.5 Table Rendering with Filters
    const prodTableBody = document.getElementById('production-table-body');
    const subtotalKwhElem = document.getElementById('subtotal-kwh');
    const subtotalRevElem = document.getElementById('subtotal-rev');

    // Populate dropdowns
    const uniqueMese = [...new Set(APP_DATA.production.map(r => String(r.period)))].sort();
    const uniqueImp = [...new Set(APP_DATA.production.map(r => String(r.id)))].sort((a,b) => Number(a) - Number(b));
    const uniqueClient = [...new Set(APP_DATA.production.map(r => String(r.client)))].sort();

    window.toggleAll = function(id, filterClass, isChecked) {
        document.querySelectorAll('.' + filterClass).forEach(cb => cb.checked = isChecked);
        window.renderTable();
    };

    window.updateAllCheck = function(id, filterClass) {
        const allCb = document.getElementById('all-' + id);
        if(!allCb) return;
        const total = document.querySelectorAll('.' + filterClass).length;
        const checked = document.querySelectorAll('.' + filterClass + ':checked').length;
        allCb.checked = (total === checked);
    };

    function populateDropdown(id, values, filterClass) {
        const container = document.getElementById(id);
        if(!container) return;
        
        let html = `<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; padding-bottom:0.4rem; border-bottom:1px solid rgba(255,255,255,0.1);">
            <span onclick="window.toggleAll('${id}', '${filterClass}', true)" style="font-size:0.8rem; font-weight:bold; color:#3b82f6; cursor:pointer; padding: 2px 5px; border-radius: 3px;"><span data-i18n="filter_tutti">+ Tutti</span></span>
            <span onclick="window.toggleAll('${id}', '${filterClass}', false)" style="font-size:0.8rem; font-weight:bold; color:#ef4444; cursor:pointer; padding: 2px 5px; border-radius: 3px;"><span data-i18n="filter_nessuno">- Nessuno</span></span>
        </div>`;
        
        values.forEach(val => {
            html += `<label style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem; font-size:0.85rem; font-weight:normal; text-transform:none; cursor:pointer;">
                <input type="checkbox" class="${filterClass}" value="${val}" checked onchange="window.renderTable()">
                ${val}
            </label>`;
        });
        container.innerHTML = html;
    }

    populateDropdown('dropdown-mese', uniqueMese, 'chk-mese');
    populateDropdown('dropdown-impianto', uniqueImp, 'chk-impianto');

    window.toggleDropdown = function(id) {
        document.querySelectorAll('.multi-select-dropdown').forEach(el => {
            if(el.id !== id) el.style.display = 'none';
        });
        const el = document.getElementById(id);
        el.style.display = el.style.display === 'none' ? 'block' : 'none';
    };

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.multi-select-container')) {
            document.querySelectorAll('.multi-select-dropdown').forEach(el => el.style.display = 'none');
        }
    });

    window.renderTable = () => {
        const checkedMese = Array.from(document.querySelectorAll('.chk-mese:checked')).map(cb => cb.value);
        const checkedImp = Array.from(document.querySelectorAll('.chk-impianto:checked')).map(cb => cb.value);

        let subKwh = 0;
        let subRev = 0;
        prodTableBody.innerHTML = '';

        APP_DATA.production.forEach(row => {
            const rowMese = String(row.period);
            const rowImp = String(row.id);

            if (
                checkedMese.includes(rowMese) &&
                checkedImp.includes(rowImp)
            ) {
                subKwh += row.kwh;
                subRev += row.revenues;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.period}</td>
                    <td class="text-bold">Impianto ${row.id}</td>
                    <td style="text-align: right; color: #3b82f6;">${formatNumber(row.kwh)}</td>
                    
                `;
                prodTableBody.appendChild(tr);
            }
        });

        if (subtotalKwhElem) subtotalKwhElem.textContent = formatNumber(subKwh);
        if (subtotalRevElem) subtotalRevElem.textContent = formatBRL(subRev);
    };

    window.renderTable();

    // 4. Create Chart Logic
    
    let currentChartType = 'bar';
    let currentChartYear = '2026';
    window.myChart = null;

    // Setup initial filters
    const allImp = [...new Set(APP_DATA.production.map(r => String(r.id)))].sort((a,b) => Number(a) - Number(b));
    const allCli = [...new Set(APP_DATA.production.map(r => String(r.client)))].sort();
    const allYears = (typeof window.getAvailableYears === 'function') ? window.getAvailableYears() : ['2028', '2027', '2026', '2025', '2024'];
    
    const yearSelect = document.getElementById('chart-year-select');
    if (yearSelect) {
        allYears.forEach(y => {
            if (!y) return;
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            opt.style.color = '#000';
            yearSelect.appendChild(opt);
        });
        yearSelect.value = '2026';
    }
    
            const cmeseContainer = document.getElementById('dropdown-chart-mese');
    if(cmeseContainer) {
        let chtml = `<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; padding-bottom:0.4rem; border-bottom:1px solid rgba(255,255,255,0.1);">
            <span onclick="window.toggleAllChart('mesi', true)" style="font-size:0.8rem; font-weight:bold; color:#3b82f6; cursor:pointer; padding: 2px 5px; border-radius: 3px;"><span data-i18n="filter_tutti">+ Tutti</span></span>
            <span onclick="window.toggleAllChart('mesi', false)" style="font-size:0.8rem; font-weight:bold; color:#ef4444; cursor:pointer; padding: 2px 5px; border-radius: 3px;"><span data-i18n="filter_nessuno">- Nessuno</span></span>
        </div>`;
        ['01','02','03','04','05','06','07','08','09','10','11','12'].forEach(val => {
            chtml += `<label style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem; font-size:0.85rem; font-weight:normal; text-transform:none; cursor:pointer;">
                <input type="checkbox" class="chart-filter-mesi" value="${val}" checked onchange="window.updateChartFilters()">
                ${val}
            </label>`;
        });
        cmeseContainer.innerHTML = chtml;
    }

    window.changeChartYear = function(year) {
        currentChartYear = year;
        updateKpiProductionBanner(year);
        window.renderChart(false);
    };

    // Initial update of the top KPI banner with the selected year
    updateKpiProductionBanner(currentChartYear);

    window.chartFilters = {
        impianti: [...allImp],
        clienti: [...allCli],
          mesi: ['01','02','03','04','05','06','07','08','09','10','11','12']
      };

    window.toggleAllChart = function(type, isChecked) {
        document.querySelectorAll(`.chart-filter-${type}`).forEach(cb => cb.checked = isChecked);
        window.updateChartFilters();
    };

    window.updateChartFilters = function() {
        window.chartFilters.impianti = Array.from(document.querySelectorAll('.chart-filter-impianti')).filter(cb => cb.checked).map(cb => cb.value);
        window.chartFilters.clienti = Array.from(document.querySelectorAll('.chart-filter-clienti')).filter(cb => cb.checked).map(cb => cb.value);
          window.chartFilters.mesi = Array.from(document.querySelectorAll('.chart-filter-mesi')).filter(cb => cb.checked).map(cb => cb.value);
        window.renderChart(false);
    };

    window.changeChartType = function(type) {
        currentChartType = type;
        window.renderChart(false);
    };

    window.renderChart = function(rebuildLegend = true) {
        const ctx = document.getElementById('prodChart');
        if (!ctx) return;
        
        const monthlyData = {};
        
        APP_DATA.production.forEach(row => {
            const rowImp = String(row.id);
            const rowYear = String(row.period).split('/')[1];
            
            if (!window.chartFilters.impianti.includes(rowImp)) return;
            if (currentChartYear !== 'all' && rowYear !== currentChartYear) return;
            
            const periodKey = currentChartYear === 'all' ? rowYear : row.period;
            
            if (!periodKey) return;
            if (!monthlyData[periodKey]) monthlyData[periodKey] = { impianti: {} };
            
            if (!monthlyData[periodKey].impianti[rowImp]) monthlyData[periodKey].impianti[rowImp] = 0;
            monthlyData[periodKey].impianti[rowImp] += row.kwh;
        });

        const labels = Object.keys(monthlyData).sort((a,b) => {
            if (currentChartYear === 'all') {
                return Number(a) - Number(b);
            } else {
                const [m1,y1] = a.split('/');
                const [m2,y2] = b.split('/');
                return new Date(`${y1}-${m1}-01`) - new Date(`${y2}-${m2}-01`);
            }
        });

        if (window.myChart) {
            window.myChart.destroy();
        }

        if (currentChartType === 'pie') {
            const activePlants = window.chartFilters.impianti;
            const pieLabels = activePlants.map(imp => `USINA ${imp.padStart(3, '0')}`);
            const pieData = activePlants.map(imp => {
                let sum = 0;
                labels.forEach(l => {
                    const monthPart = l.includes('/') ? l.split('/')[0] : '';
                    if (!monthPart || window.chartFilters.mesi.includes(monthPart)) {
                        if (monthlyData[l] && monthlyData[l].impianti[imp]) {
                            sum += monthlyData[l].impianti[imp];
                        }
                    }
                });
                return Math.round(sum);
            });

            const pieColors = activePlants.map(imp => window.getUsinaColor ? window.getUsinaColor(imp, allImp.indexOf(imp)) : '#3b82f6');
            const totalKwh = pieData.reduce((a, b) => a + b, 0);

            window.myChart = new Chart(ctx.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: pieLabels,
                    datasets: [{
                        data: pieData,
                        backgroundColor: pieColors,
                        borderColor: '#1e293b',
                        borderWidth: 2,
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: 15 },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const val = context.raw || 0;
                                    const pct = totalKwh > 0 ? ((val / totalKwh) * 100).toFixed(1) + '%' : '0%';
                                    return ` ${context.label}: ${formatNumber(val)} kWh (${pct})`;
                                }
                            }
                        },
                        datalabels: {
                            display: function(context) {
                                return (context.dataset.data[context.dataIndex] || 0) > 0;
                            },
                            color: '#fff',
                            font: { weight: 'bold', size: 11 },
                            formatter: function(value, context) {
                                if (!value || value === 0) return '';
                                const pct = totalKwh > 0 ? ((value / totalKwh) * 100).toFixed(1) + '%' : '';
                                return `${context.chart.data.labels[context.dataIndex]}\n${formatNumber(value)} kWh\n(${pct})`;
                            }
                        }
                    }
                }
            });
        } else {
            const datasets = [];
            
            window.chartFilters.impianti.forEach(imp => {
                const color = window.getUsinaColor ? window.getUsinaColor(imp, allImp.indexOf(imp)) : '#3b82f6';
                datasets.push({
                    label: `USINA ${imp.padStart(3, '0')}`,
                    data: labels.map(l => window.chartFilters.mesi.includes(l.split('/')[0]) ? (monthlyData[l] && monthlyData[l].impianti[imp] ? monthlyData[l].impianti[imp] : 0) : null),
                    backgroundColor: color,
                    borderColor: color,
                    type: 'bar',
                    borderWidth: 1,
                    stack: 'Stack 0'
                });
            });

            window.myChart = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        x: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { display: true, stacked: true, title: { display: true, text: 'kWh', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    },
                    plugins: {
                        legend: { display: false },
                        datalabels: {
                            display: function(context) { return window.chartFilters.impianti && window.chartFilters.impianti.length === 1; },
                            align: 'bottom',
                            anchor: 'end',
                            formatter: function(value) {
                                if (value === null || value === 0) return '';
                                return formatNumber(value);
                            },
                            color: '#fff',
                            font: { weight: 'bold', size: 10 }
                        }
                    }
                }
            });
        }
        
        if (rebuildLegend) {
            const legendContainer = document.getElementById('custom-chart-legend');
            if (legendContainer) {
                let html = '';
                
                // Impianti Scrollable List
                let impList = `<div style="flex: 1; max-height: 200px; overflow-y: auto; padding-right: 10px;">
                    <div style="display: flex; justify-content: space-between; position: sticky; top: 0; background: #1e293b; padding-bottom: 5px; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 10;">
                        <span data-i18n="word_impianti" style="font-weight: bold; font-size: 0.85rem; color: #94a3b8;"><span data-i18n="word_impianti">IMPIANTI</span></span>
                        <div>
                            <span onclick="window.toggleAllChart('impianti', true)" style="cursor:pointer; font-size: 0.8rem; color:#3b82f6; margin-right: 8px;"><span data-i18n="filter_tutti">+ Tutti</span></span>
                            <span onclick="window.toggleAllChart('impianti', false)" style="cursor:pointer; font-size: 0.8rem; color:#ef4444;"><span data-i18n="filter_nessuno">- Nessuno</span></span>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">`;
                
                allImp.forEach(imp => {
                    const color = window.getUsinaColor ? window.getUsinaColor(imp, allImp.indexOf(imp)) : '#3b82f6';
                    const isChecked = window.chartFilters.impianti.includes(imp) ? 'checked' : '';
                    impList += `
                        <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; font-size:0.9rem; color:var(--text-main);">
                            <input type="checkbox" class="chart-filter-impianti" value="${imp}" ${isChecked} onchange="window.updateChartFilters()">
                            <span style="display:inline-block; width:14px; height:14px; background-color:${color}; border-radius:3px; opacity: 1"></span>
                            USINA ${imp.padStart(3, '0')}
                        </label>
                    `;
                });
                impList += `</div></div>`;
                html += impList;
                
                legendContainer.innerHTML = html;
                if(typeof applyTranslations === 'function') applyTranslations();
            }
        }
    };

    window.renderChart();
});


// --- Comparatore Produzione Logic ---
if (typeof db !== 'undefined') {
    db.ref('settings/comparatoreProduzione').on('value', snap => {
        const isVisible = !!snap.val();
        const icon = document.getElementById('comparatore-eye-icon');
        if (icon) {
            icon.className = isVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
            icon.style.color = isVisible ? '#10b981' : '#ef4444';
        }
    });
}

window.toggleComparatoreVisibility = function() {
    if (typeof db === 'undefined') return;
    db.ref('settings/comparatoreProduzione').once('value').then(snap => {
        const current = !!snap.val();
        db.ref('settings/comparatoreProduzione').set(!current);
    });
};

window.openComparatoreModal = function() {
    document.getElementById('comparatoreModal').style.display = 'flex';
    updateComparatorePeriodValues();
    if(window.renderComparatoreTable) window.renderComparatoreTable();
};

window.closeComparatoreModal = function() {
    document.getElementById('comparatoreModal').style.display = 'none';
};

window.updateComparatorePeriodValues = function() {
    const type = document.getElementById('comparatore-period-type').value;
    const valueSelect = document.getElementById('comparatore-period-value');
    const twoYearsContainer = document.getElementById('comparatore-two-years-container');
    const twoMonthsContainer = document.getElementById('comparatore-two-months-container');
    const y1Select = document.getElementById('comparatore-year-1');
    const y2Select = document.getElementById('comparatore-year-2');
    const m1Select = document.getElementById('comparatore-month-1');
    const m2Select = document.getElementById('comparatore-month-2');
    
    const years = (typeof window.getAvailableYears === 'function') ? window.getAvailableYears() : ['2028', '2027', '2026', '2025', '2024'];
    const months = (typeof window.getAvailableMonths === 'function') ? window.getAvailableMonths() : ['08/2026', '07/2026'];

    if (type === 'two_years') {
        valueSelect.style.display = 'none';
        if (twoMonthsContainer) twoMonthsContainer.style.display = 'none';
        if (twoYearsContainer) twoYearsContainer.style.display = 'flex';
        
        y1Select.innerHTML = '';
        y2Select.innerHTML = '';
        years.forEach(y => {
            const opt1 = document.createElement('option');
            opt1.value = y; opt1.textContent = 'Anno ' + y;
            y1Select.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = y; opt2.textContent = 'Anno ' + y;
            y2Select.appendChild(opt2);
        });
        
        // Imposta di default Anno 1 = 2025 e Anno 2 = 2026 (o i due anni più recenti)
        if (years.includes('2025') && years.includes('2026')) {
            y1Select.value = '2025';
            y2Select.value = '2026';
        } else if (years.length >= 2) {
            y1Select.value = years[1];
            y2Select.value = years[0];
        } else if (years.length === 1) {
            y1Select.value = years[0];
            y2Select.value = years[0];
        }
    } else if (type === 'two_months') {
        valueSelect.style.display = 'none';
        if (twoYearsContainer) twoYearsContainer.style.display = 'none';
        if (twoMonthsContainer) twoMonthsContainer.style.display = 'flex';

        m1Select.innerHTML = '';
        m2Select.innerHTML = '';
        months.forEach(m => {
            const opt1 = document.createElement('option');
            opt1.value = m; opt1.textContent = m;
            m1Select.appendChild(opt1);

            const opt2 = document.createElement('option');
            opt2.value = m; opt2.textContent = m;
            m2Select.appendChild(opt2);
        });

        // Imposta di default i due mesi più recenti con dati (es. 07/2026 e 08/2026)
        if (months.includes('07/2026') && months.includes('08/2026')) {
            m1Select.value = '07/2026';
            m2Select.value = '08/2026';
        } else if (months.length >= 2) {
            m1Select.value = months[1];
            m2Select.value = months[0];
        }
    } else {
        if (twoYearsContainer) twoYearsContainer.style.display = 'none';
        if (twoMonthsContainer) twoMonthsContainer.style.display = 'none';
        valueSelect.style.display = 'inline-block';
        valueSelect.innerHTML = '';
        
        if (type === 'year') {
            years.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y; opt.textContent = 'Anno ' + y;
                valueSelect.appendChild(opt);
            });
            if (years.includes('2026')) {
                valueSelect.value = '2026';
            }
        } else {
            months.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m; opt.textContent = m;
                valueSelect.appendChild(opt);
            });
            if (months.includes('08/2026')) {
                valueSelect.value = '08/2026';
            }
        }
    }
    updateComparatoreChart();
};

let comparatoreChartInstance = null;
window.updateComparatoreChart = function() {
    const type = document.getElementById('comparatore-period-type').value;
    const allPlants = [...new Set(APP_DATA.production.map(r => String(r.id)))].sort((a,b) => Number(a) - Number(b));
    const ctx = document.getElementById('comparatoreChartCanvas');
    const summaryKpi = document.getElementById('comparatore-summary-kpi');
    if (!ctx) return;

    if (comparatoreChartInstance) {
        comparatoreChartInstance.destroy();
    }

    if (type === 'two_years') {
        const y1 = document.getElementById('comparatore-year-1').value;
        const y2 = document.getElementById('comparatore-year-2').value;
        const viewMode = (document.getElementById('comparatore-two-years-view') || {}).value || 'by_usina';

        // Calculate total production for Year 1 and Year 2
        const totalY1 = APP_DATA.production
            .filter(r => String(r.period).endsWith('/' + y1))
            .reduce((sum, r) => sum + (r.kwh || 0), 0);
        const totalY2 = APP_DATA.production
            .filter(r => String(r.period).endsWith('/' + y2))
            .reduce((sum, r) => sum + (r.kwh || 0), 0);

        const diffKwh = totalY2 - totalY1;
        let diffPctStr = '0.0%';
        if (totalY1 > 0) {
            const pct = ((diffKwh / totalY1) * 100);
            diffPctStr = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
        } else if (totalY2 > 0) {
            diffPctStr = '+100.0%';
        } else if (totalY1 > 0 && totalY2 === 0) {
            diffPctStr = '-100.0%';
        } else {
            diffPctStr = '0.0%';
        }

        if (summaryKpi) {
            summaryKpi.style.display = 'flex';
            document.getElementById('kpi-y1-label').textContent = `Anno ${y1}:`;
            document.getElementById('kpi-y1-val').textContent = new Intl.NumberFormat('it-IT').format(Math.round(totalY1)) + ' kWh';
            document.getElementById('kpi-y2-label').textContent = `Anno ${y2}:`;
            document.getElementById('kpi-y2-val').textContent = new Intl.NumberFormat('it-IT').format(Math.round(totalY2)) + ' kWh';
            
            const badge = document.getElementById('kpi-diff-badge');
            badge.textContent = `${diffKwh >= 0 ? '+' : ''}${new Intl.NumberFormat('it-IT').format(Math.round(diffKwh))} kWh (${diffPctStr})`;
            if (diffKwh > 0) {
                badge.style.background = 'rgba(16, 185, 129, 0.2)';
                badge.style.color = '#34d399';
                badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            } else if (diffKwh < 0) {
                badge.style.background = 'rgba(239, 68, 68, 0.2)';
                badge.style.color = '#f87171';
                badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            } else {
                badge.style.background = 'rgba(148, 163, 184, 0.2)';
                badge.style.color = '#94a3b8';
                badge.style.borderColor = 'rgba(148, 163, 184, 0.4)';
            }
        }

        if (viewMode === 'by_usina') {
            const labels = allPlants.map(id => 'USINA ' + String(id).padStart(3, '0'));
            
            const dataY1 = allPlants.map(id => {
                return APP_DATA.production
                    .filter(r => String(r.id) === id && String(r.period).endsWith('/' + y1))
                    .reduce((sum, r) => sum + (r.kwh || 0), 0);
            });

            const dataY2 = allPlants.map(id => {
                return APP_DATA.production
                    .filter(r => String(r.id) === id && String(r.period).endsWith('/' + y2))
                    .reduce((sum, r) => sum + (r.kwh || 0), 0);
            });

            comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: `Anno ${y1}`,
                            data: dataY1,
                            backgroundColor: '#3b82f6',
                            borderColor: '#2563eb',
                            borderWidth: 1,
                            datalabels: {
                                anchor: 'end',
                                align: 'top',
                                color: '#93c5fd',
                                font: { weight: 'bold', size: 10 },
                                formatter: function(value) {
                                    if (!value || value === 0) return '';
                                    return new Intl.NumberFormat('it-IT').format(Math.round(value));
                                }
                            }
                        },
                        {
                            label: `Anno ${y2}`,
                            data: dataY2,
                            backgroundColor: '#10b981',
                            borderColor: '#059669',
                            borderWidth: 1,
                            datalabels: {
                                anchor: 'end',
                                align: 'top',
                                color: '#6ee7b7',
                                font: { weight: 'bold', size: 10 },
                                formatter: function(value, context) {
                                    const v1 = dataY1[context.dataIndex] || 0;
                                    const v2 = value || 0;
                                    if (v1 === 0 && v2 === 0) return '';
                                    let pctText = '';
                                    if (v1 > 0) {
                                        const p = ((v2 - v1) / v1) * 100;
                                        pctText = ` (${p >= 0 ? '+' : ''}${p.toFixed(0)}%)`;
                                    } else if (v2 > 0) {
                                        pctText = ' (+100%)';
                                    }
                                    return `${new Intl.NumberFormat('it-IT').format(Math.round(v2))}${pctText}`;
                                }
                            }
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { top: 35 } },
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grace: '18%',
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            title: { display: true, text: 'kWh', color: '#94a3b8' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' }
                        }
                    },
                    plugins: {
                        legend: { 
                            display: true,
                            labels: { color: '#fff', font: { weight: 'bold' } }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const val = context.raw || 0;
                                    return ` ${context.dataset.label}: ${new Intl.NumberFormat('it-IT').format(Math.round(val))} kWh`;
                                },
                                afterBody: function(contexts) {
                                    if (contexts.length === 2) {
                                        const v1 = contexts[0].raw || 0;
                                        const v2 = contexts[1].raw || 0;
                                        const diff = v2 - v1;
                                        let pct = '0.0%';
                                        if (v1 > 0) {
                                            pct = ((diff / v1) * 100).toFixed(1) + '%';
                                        } else if (v2 > 0) {
                                            pct = '+100.0%';
                                        }
                                        const sign = diff >= 0 ? '+' : '';
                                        return [`Variazione: ${sign}${new Intl.NumberFormat('it-IT').format(Math.round(diff))} kWh (${sign}${pct})`];
                                    }
                                    return [];
                                }
                            }
                        }
                    }
                }
            });
        } else {
            // viewMode === 'by_month'
            const monthLabels = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
            const monthNums = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
            
            const dataY1 = monthNums.map(m => {
                const pKey = `${m}/${y1}`;
                return APP_DATA.production
                    .filter(r => String(r.period) === pKey)
                    .reduce((sum, r) => sum + (r.kwh || 0), 0);
            });

            const dataY2 = monthNums.map(m => {
                const pKey = `${m}/${y2}`;
                return APP_DATA.production
                    .filter(r => String(r.period) === pKey)
                    .reduce((sum, r) => sum + (r.kwh || 0), 0);
            });

            comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        {
                            label: `Anno ${y1}`,
                            data: dataY1,
                            backgroundColor: '#3b82f6',
                            borderColor: '#2563eb',
                            borderWidth: 1,
                            datalabels: {
                                anchor: 'end',
                                align: 'top',
                                color: '#93c5fd',
                                font: { weight: 'bold', size: 10 },
                                formatter: function(value) {
                                    if (!value || value === 0) return '';
                                    return new Intl.NumberFormat('it-IT').format(Math.round(value));
                                }
                            }
                        },
                        {
                            label: `Anno ${y2}`,
                            data: dataY2,
                            backgroundColor: '#10b981',
                            borderColor: '#059669',
                            borderWidth: 1,
                            datalabels: {
                                anchor: 'end',
                                align: 'top',
                                color: '#6ee7b7',
                                font: { weight: 'bold', size: 10 },
                                formatter: function(value, context) {
                                    const v1 = dataY1[context.dataIndex] || 0;
                                    const v2 = value || 0;
                                    if (v1 === 0 && v2 === 0) return '';
                                    let pctText = '';
                                    if (v1 > 0) {
                                        const p = ((v2 - v1) / v1) * 100;
                                        pctText = ` (${p >= 0 ? '+' : ''}${p.toFixed(0)}%)`;
                                    } else if (v2 > 0) {
                                        pctText = ' (+100%)';
                                    }
                                    return `${new Intl.NumberFormat('it-IT').format(Math.round(v2))}${pctText}`;
                                }
                            }
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { top: 35 } },
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grace: '18%',
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            title: { display: true, text: 'kWh', color: '#94a3b8' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' }
                        }
                    },
                    plugins: {
                        legend: { 
                            display: true,
                            labels: { color: '#fff', font: { weight: 'bold' } }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const val = context.raw || 0;
                                    return ` ${context.dataset.label}: ${new Intl.NumberFormat('it-IT').format(Math.round(val))} kWh`;
                                },
                                afterBody: function(contexts) {
                                    if (contexts.length === 2) {
                                        const v1 = contexts[0].raw || 0;
                                        const v2 = contexts[1].raw || 0;
                                        const diff = v2 - v1;
                                        let pct = '0.0%';
                                        if (v1 > 0) {
                                            pct = ((diff / v1) * 100).toFixed(1) + '%';
                                        } else if (v2 > 0) {
                                            pct = '+100.0%';
                                        }
                                        const sign = diff >= 0 ? '+' : '';
                                        return [`Variazione: ${sign}${new Intl.NumberFormat('it-IT').format(Math.round(diff))} kWh (${sign}${pct})`];
                                    }
                                    return [];
                                }
                            }
                        }
                    }
                }
            });
        }
        return;
    }

    if (type === 'two_months') {
        const m1 = document.getElementById('comparatore-month-1').value;
        const m2 = document.getElementById('comparatore-month-2').value;

        // Calculate total production for Month 1 and Month 2
        const totalM1 = APP_DATA.production
            .filter(r => String(r.period) === m1)
            .reduce((sum, r) => sum + (r.kwh || 0), 0);
        const totalM2 = APP_DATA.production
            .filter(r => String(r.period) === m2)
            .reduce((sum, r) => sum + (r.kwh || 0), 0);

        const diffKwh = totalM2 - totalM1;
        let diffPctStr = '0.0%';
        if (totalM1 > 0) {
            const pct = ((diffKwh / totalM1) * 100);
            diffPctStr = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
        } else if (totalM2 > 0) {
            diffPctStr = '+100.0%';
        } else if (totalM1 > 0 && totalM2 === 0) {
            diffPctStr = '-100.0%';
        } else {
            diffPctStr = '0.0%';
        }

        if (summaryKpi) {
            summaryKpi.style.display = 'flex';
            document.getElementById('kpi-y1-label').textContent = `Mese ${m1}:`;
            document.getElementById('kpi-y1-val').textContent = new Intl.NumberFormat('it-IT').format(Math.round(totalM1)) + ' kWh';
            document.getElementById('kpi-y2-label').textContent = `Mese ${m2}:`;
            document.getElementById('kpi-y2-val').textContent = new Intl.NumberFormat('it-IT').format(Math.round(totalM2)) + ' kWh';
            
            const badge = document.getElementById('kpi-diff-badge');
            badge.textContent = `${diffKwh >= 0 ? '+' : ''}${new Intl.NumberFormat('it-IT').format(Math.round(diffKwh))} kWh (${diffPctStr})`;
            if (diffKwh > 0) {
                badge.style.background = 'rgba(16, 185, 129, 0.2)';
                badge.style.color = '#34d399';
                badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            } else if (diffKwh < 0) {
                badge.style.background = 'rgba(239, 68, 68, 0.2)';
                badge.style.color = '#f87171';
                badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            } else {
                badge.style.background = 'rgba(148, 163, 184, 0.2)';
                badge.style.color = '#94a3b8';
                badge.style.borderColor = 'rgba(148, 163, 184, 0.4)';
            }
        }

        const labels = allPlants.map(id => 'USINA ' + String(id).padStart(3, '0'));
        
        const dataM1 = allPlants.map(id => {
            return APP_DATA.production
                .filter(r => String(r.id) === id && String(r.period) === m1)
                .reduce((sum, r) => sum + (r.kwh || 0), 0);
        });

        const dataM2 = allPlants.map(id => {
            return APP_DATA.production
                .filter(r => String(r.id) === id && String(r.period) === m2)
                .reduce((sum, r) => sum + (r.kwh || 0), 0);
        });

        comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `Mese ${m1}`,
                        data: dataM1,
                        backgroundColor: '#3b82f6',
                        borderColor: '#2563eb',
                        borderWidth: 1,
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            color: '#93c5fd',
                            font: { weight: 'bold', size: 10 },
                            formatter: function(value) {
                                if (!value || value === 0) return '';
                                return new Intl.NumberFormat('it-IT').format(Math.round(value));
                            }
                        }
                    },
                    {
                        label: `Mese ${m2}`,
                        data: dataM2,
                        backgroundColor: '#10b981',
                        borderColor: '#059669',
                        borderWidth: 1,
                        datalabels: {
                            anchor: 'end',
                            align: 'top',
                            color: '#6ee7b7',
                            font: { weight: 'bold', size: 10 },
                            formatter: function(value, context) {
                                const v1 = dataM1[context.dataIndex] || 0;
                                const v2 = value || 0;
                                if (v1 === 0 && v2 === 0) return '';
                                let pctText = '';
                                if (v1 > 0) {
                                    const p = ((v2 - v1) / v1) * 100;
                                    pctText = ` (${p >= 0 ? '+' : ''}${p.toFixed(0)}%)`;
                                } else if (v2 > 0) {
                                    pctText = ' (+100%)';
                                }
                                return `${new Intl.NumberFormat('it-IT').format(Math.round(v2))}${pctText}`;
                            }
                        }
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { top: 35 } },
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: {
                        beginAtZero: true,
                        grace: '18%',
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        title: { display: true, text: 'kWh', color: '#94a3b8' }
                    },
                    x: {
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                },
                plugins: {
                    legend: { 
                        display: true,
                        labels: { color: '#fff', font: { weight: 'bold' } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.raw || 0;
                                return ` ${context.dataset.label}: ${new Intl.NumberFormat('it-IT').format(Math.round(val))} kWh`;
                            },
                            afterBody: function(contexts) {
                                if (contexts.length === 2) {
                                    const v1 = contexts[0].raw || 0;
                                    const v2 = contexts[1].raw || 0;
                                    const diff = v2 - v1;
                                    let pct = '0.0%';
                                    if (v1 > 0) {
                                        pct = ((diff / v1) * 100).toFixed(1) + '%';
                                    } else if (v2 > 0) {
                                        pct = '+100.0%';
                                    }
                                    const sign = diff >= 0 ? '+' : '';
                                    return [`Variazione: ${sign}${new Intl.NumberFormat('it-IT').format(Math.round(diff))} kWh (${sign}${pct})`];
                                }
                                return [];
                            }
                        }
                    }
                }
            }
        });
        return;
    }

    if (summaryKpi) {
        summaryKpi.style.display = 'none';
    }

    // Single Period (Year or Month)
    const periodVal = document.getElementById('comparatore-period-value').value;
    if (!periodVal) return;

    const impiantiData = {};
    APP_DATA.production.forEach(row => {
        const rowImp = String(row.id);
        let matches = false;
        if (type === 'year') {
            matches = String(row.period).endsWith('/' + periodVal);
        } else {
            matches = String(row.period) === periodVal;
        }
        if (matches) {
            if (!impiantiData[rowImp]) impiantiData[rowImp] = 0;
            impiantiData[rowImp] += row.kwh;
        }
    });

    const labels = allPlants.map(id => 'USINA ' + String(id).padStart(3, '0'));
    const dataPoints = allPlants.map(id => impiantiData[id] || 0);
    const colors = allPlants.map((id, idx) => window.getUsinaColor ? window.getUsinaColor(id, idx) : '#3b82f6');

    comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: type === 'year' ? `Anno ${periodVal}` : `${periodVal}`,
                data: dataPoints,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 30 } },
            scales: {
                y: {
                    beginAtZero: true,
                    grace: '15%',
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: { display: true, text: 'kWh', color: '#94a3b8' }
                },
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#fff',
                    font: { weight: 'bold', size: 10 },
                    formatter: function(value) {
                        if (!value || value === 0) return '';
                        return new Intl.NumberFormat('it-IT').format(Math.round(value));
                    }
                }
            }
        }
    });
};

window.renderComparatoreTable = function() {
    const thead = document.getElementById('comparatore-table-head');
    const tbody = document.getElementById('comparatore-table-body');
    if (!thead || !tbody) return;

    const allPlants = [...new Set(APP_DATA.production.map(r => String(r.id)))].sort((a,b) => Number(a) - Number(b));
    
    const tAnnoMese = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang] && translations[currentLang]['comp_anno_mese']) || 'Anno / Mese';
    const tTotale = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang] && translations[currentLang]['comp_totale']) || 'Totale';
    const tVarYoY = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang] && translations[currentLang]['comp_var_yoy']) || 'Var. YoY';

    let thHtml = `<tr><th style="text-align: left; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2);">${tAnnoMese}</th>`;
    allPlants.forEach((p, idx) => {
        const uColor = window.getUsinaColor ? window.getUsinaColor(p, idx) : '#3b82f6';
        thHtml += `<th style="text-align: right; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2);"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${uColor}; margin-right:5px;"></span>USINA ${p.padStart(3, '0')}</th>`;
    });
    thHtml += `<th style="text-align: right; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2); color: #3b82f6;">${tTotale}</th>`;
    thHtml += `<th style="text-align: right; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2); color: #10b981;">${tVarYoY}</th></tr>`;
    thead.innerHTML = thHtml;

    const dataByYear = {};
    
    // Assicura che 2027, 2026 e 2025 siano sempre presenti nella tabella
    ['2027', '2026', '2025'].forEach(y => {
        dataByYear[y] = { total: {}, months: {} };
    });
    
    APP_DATA.production.forEach(row => {
        const p = String(row.id);
        const period = String(row.period);
        const parts = period.split('/');
        if (parts.length < 2) return;
        const month = parts[0];
        const year = parts[1];
        
        if (!dataByYear[year]) {
            dataByYear[year] = { total: {}, months: {} };
        }
        if (!dataByYear[year].months[period]) {
            dataByYear[year].months[period] = {};
        }
        
        if (!dataByYear[year].total[p]) dataByYear[year].total[p] = 0;
        dataByYear[year].total[p] += row.kwh;
        
        if (!dataByYear[year].months[period][p]) dataByYear[year].months[period][p] = 0;
        dataByYear[year].months[period][p] += row.kwh;
    });

    const formatValue = (val) => val ? Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '-';
    let tbHtml = '';
    
    const years = Object.keys(dataByYear).sort((a,b) => Number(b) - Number(a));
    
    // Precalculate totals per year for YoY comparison
    const yearTotals = {};
    years.forEach(yr => {
        yearTotals[yr] = allPlants.reduce((sum, p) => sum + (dataByYear[yr].total[p] || 0), 0);
    });

    years.forEach(year => {
        let yearTotalRow = yearTotals[year] || 0;
        let yearCells = '';
        
        const yearVals = allPlants.map(p => dataByYear[year].total[p] || 0);
        const activeYearVals = yearVals.filter(v => v > 0);
        const yearMax = activeYearVals.length > 0 ? Math.max(...activeYearVals) : -1;
        const yearMin = activeYearVals.length > 1 ? Math.min(...activeYearVals) : -1;

        allPlants.forEach((p, i) => {
            const val = yearVals[i];
            let colorStyle = '';
            if (val > 0) {
                if (val === yearMax && yearMax !== yearMin) colorStyle = 'color: #10b981;';
                else if (val === yearMin && yearMax !== yearMin) colorStyle = 'color: #ef4444;';
            }
            yearCells += `<td style="padding: 10px; text-align: right; ${colorStyle}">${formatValue(val)}</td>`;
        });

        // Compute YoY variation
        const prevYear = String(Number(year) - 1);
        const prevTotal = yearTotals[prevYear] || 0;
        let yoyBadge = '<span style="color: #64748b;">-</span>';
        if (prevTotal > 0 && yearTotalRow > 0) {
            const pct = ((yearTotalRow - prevTotal) / prevTotal) * 100;
            const sign = pct >= 0 ? '+' : '';
            const col = pct >= 0 ? '#10b981' : '#ef4444';
            yoyBadge = `<span style="color: ${col}; font-weight: bold;">${sign}${pct.toFixed(1)}%</span>`;
        } else if (prevTotal === 0 && yearTotalRow > 0) {
            yoyBadge = `<span style="color: #10b981; font-weight: bold;">+100%</span>`;
        } else if (prevTotal > 0 && yearTotalRow === 0) {
            yoyBadge = `<span style="color: #ef4444; font-weight: bold;">-100%</span>`;
        }
        
        tbHtml += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); font-weight: bold; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'" onclick="window.toggleYearRows('${year}')">
                <td style="text-align: left; padding: 10px; color: #f59e0b;"><i class="fa-solid fa-chevron-right" id="icon-year-${year}" style="margin-right: 8px; transition: transform 0.3s;"></i> ${year}</td>
                ${yearCells}
                <td style="padding: 10px; text-align: right; color: #3b82f6;">${formatValue(yearTotalRow)}</td>
                <td style="padding: 10px; text-align: right;">${yoyBadge}</td>
            </tr>
        `;
        
        const months = Object.keys(dataByYear[year].months).sort((a,b) => {
            const m1 = Number(a.split('/')[0]);
            const m2 = Number(b.split('/')[0]);
            return m2 - m1;
        });
        
        months.forEach(month => {
            let monthTotalRow = 0;
            let monthCells = '';
            
            const monthVals = allPlants.map(p => dataByYear[year].months[month][p] || 0);
            const activeMonthVals = monthVals.filter(v => v > 0);
            const monthMax = activeMonthVals.length > 0 ? Math.max(...activeMonthVals) : -1;
            const monthMin = activeMonthVals.length > 1 ? Math.min(...activeMonthVals) : -1;
            
            allPlants.forEach((p, i) => {
                const val = monthVals[i];
                monthTotalRow += val;
                let colorStyle = 'color: #cbd5e1;';
                if (val > 0) {
                    if (val === monthMax && monthMax !== monthMin) colorStyle = 'color: #10b981; font-weight: bold;';
                    else if (val === monthMin && monthMax !== monthMin) colorStyle = 'color: #ef4444; font-weight: bold;';
                }
                monthCells += `<td style="padding: 8px; text-align: right; ${colorStyle}">${formatValue(val)}</td>`;
            });
            
            tbHtml += `
                <tr class="month-row-${year}" style="display: none; border-bottom: 1px solid rgba(255,255,255,0.02); font-size: 0.9em; background: rgba(0,0,0,0.15);">
                    <td style="text-align: left; padding: 8px; padding-left: 30px; color: #cbd5e1;">${month}</td>
                    ${monthCells}
                    <td style="padding: 8px; text-align: right; color: #60a5fa; font-weight: bold;">${formatValue(monthTotalRow)}</td>
                    <td style="padding: 8px; text-align: right; color: #64748b;">-</td>
                </tr>
            `;
        });
    });
    
    tbody.innerHTML = tbHtml;
};

window.toggleYearRows = function(year) {
    const rows = document.querySelectorAll('.month-row-' + year);
    const icon = document.getElementById('icon-year-' + year);
    if(rows.length === 0) return;
    
    const isHidden = rows[0].style.display === 'none';
    rows.forEach(r => {
        r.style.display = isHidden ? 'table-row' : 'none';
    });
    
    if (icon) {
        icon.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
    }
};
