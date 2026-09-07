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
    if (typeof Auth !== 'undefined' && typeof Auth.updateUserProfileUI === 'function') {
        Auth.updateUserProfileUI();
    }

    const formatNumber = (num) => new Intl.NumberFormat('it-IT').format(num);
    const formatBRL = (num) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(num);
    const formatEUR = (num) => {
        let parts = num.toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return '€ ' + parts.join(',');
    };
    
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl && APP_DATA.lastUpdated) {
        lastUpdatedEl.textContent = APP_DATA.lastUpdated;
    }

    window.currentExchangeRate = 5.50; // Fallback default
    
    // Fetch real time exchange rate EUR/BRL
    fetch('https://economia.awesomeapi.com.br/last/EUR-BRL')
        .then(res => res.json())
        .then(data => {
            if (data && data.EURBRL && data.EURBRL.bid) {
                window.currentExchangeRate = parseFloat(data.EURBRL.bid);
                const displayElem = document.getElementById('exchange-rate-display');
                if (displayElem) {
                    displayElem.textContent = window.currentExchangeRate.toLocaleString('it-IT', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
                }
                if (window.renderTable) window.renderTable();
            }
        })
        .catch(err => {
            console.error("Errore nel caricamento del cambio:", err);
            const displayElem = document.getElementById('exchange-rate-display');
            if (displayElem) {
                displayElem.textContent = "Errore (" + window.currentExchangeRate.toLocaleString('it-IT', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + ")";
            }
        });

    // 2. Populate Modules Table
    const plantsTableBody = document.getElementById('plants-table-body');
    let activeCount = 0;
    if (APP_DATA.modules) {
        APP_DATA.modules.forEach(m => {
            activeCount++;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-bold">${m.impianto}</td>
                <td>${m.nome}</td>
                <td style="color: #3b82f6;">${formatBRL(m.investimento)}</td>
                <td style="color: #10b981; font-weight: 600;">${m.stato}</td>
            `;
            if (plantsTableBody) plantsTableBody.appendChild(tr);
        });
        if (document.getElementById('kpi-active-plants')) document.getElementById('kpi-active-plants').textContent = `${activeCount} / 20`;
        const wipElem = document.getElementById('kpi-wip-plants');
        if (wipElem) {
            wipElem.innerHTML = `${20 - activeCount} <span data-i18n="wip_plants">impianti in corso di realizzazione</span> (20 <span data-i18n="wip_expected">previsti</span> - ${activeCount} <span data-i18n="wip_active">attivi</span>)`;
            if(typeof applyTranslations === 'function') applyTranslations();
        }
    }

    // 3. Aggregate Production Data for Chart and KPIs
    let totalKwh = 0;
    let totalRev = 0;
    const monthlyData = {}; 
    const clientData = {};
    
    APP_DATA.production.forEach(row => {
        totalKwh += row.kwh;
        totalRev += row.revenues;

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

    function updateKpiSalesBanner(selectedYear) {
        const kpiRevElem = document.getElementById('kpi-total-rev');
        const kpiRevYearElem = document.getElementById('kpi-total-rev-year');
        const kpiClientsYearElem = document.getElementById('kpi-clients-sales-year');
        const kpiClientsList = document.getElementById('kpi-clients-sales-list');
        
        let filteredRev = 0;
        const clientTotalsYear = {};
        
        APP_DATA.production.forEach(row => {
            const periodStr = String(row.period || '');
            const parts = periodStr.split('/');
            const rowYear = parts.length > 1 ? parts[1] : '';
            
            if (selectedYear === 'all' || rowYear === selectedYear) {
                const revVal = Number(row.revenues) || 0;
                filteredRev += revVal;
                const clientName = row.client || 'Altro';
                if (!clientTotalsYear[clientName]) clientTotalsYear[clientName] = 0;
                clientTotalsYear[clientName] += revVal;
            }
        });
        
        if (kpiRevElem) {
            kpiRevElem.textContent = formatBRL(filteredRev);
        }
        
        const currentLang = localStorage.getItem('app_lang') || 'it';
        let yearLabel = '';
        if (selectedYear === 'all') {
            if (currentLang === 'en') yearLabel = 'All years';
            else if (currentLang === 'fr') yearLabel = 'Toutes les années';
            else yearLabel = 'Tutti gli anni';
        } else {
            if (currentLang === 'en') yearLabel = 'in ' + selectedYear;
            else if (currentLang === 'fr') yearLabel = 'en ' + selectedYear;
            else yearLabel = 'nel ' + selectedYear;
        }
        
        if (kpiRevYearElem) kpiRevYearElem.textContent = yearLabel;
        if (kpiClientsYearElem) kpiClientsYearElem.textContent = yearLabel;
        
        if (kpiClientsList) {
            let listHtml = '';
            const sortedClients = Object.keys(clientTotalsYear).sort((a,b) => clientTotalsYear[b] - clientTotalsYear[a]);
            sortedClients.forEach(client => {
                listHtml += `<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 0.8rem; margin-bottom: 0.2rem; white-space: nowrap;"><span style="overflow: hidden; text-overflow: ellipsis;">${client}</span> <span style="color: var(--text-main); font-weight: 600; flex-shrink: 0; font-family: monospace;">${formatBRL(clientTotalsYear[client])}</span></div>`;
            });
            kpiClientsList.innerHTML = listHtml;
        }
    }
    window.updateKpiSalesBanner = updateKpiSalesBanner;

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
    populateDropdown('dropdown-cliente', uniqueClient, 'chk-cliente');
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
        const checkedClient = Array.from(document.querySelectorAll('.chk-cliente:checked')).map(cb => cb.value);
        const checkedImp = Array.from(document.querySelectorAll('.chk-impianto:checked')).map(cb => cb.value);

        let subKwh = 0;
        let subRev = 0;
        let subRevEur = 0;
        const currentEurBrlRate = window.currentExchangeRate || 5.50;
        prodTableBody.innerHTML = '';

        APP_DATA.production.forEach(row => {
            const rowMese = String(row.period);
            const rowClient = String(row.client);
            const rowImp = String(row.id);

            if (
                checkedMese.includes(rowMese) &&
                checkedClient.includes(rowClient) &&
                checkedImp.includes(rowImp)
            ) {
                subKwh += row.kwh;
                subRev += row.revenues;
                let eurValue = row.revenues / currentEurBrlRate;
                subRevEur += eurValue;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.period}</td>
                    <td class="text-bold">Impianto ${row.id}</td>
                    <td><span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.3); padding: 4px 8px; border-radius: 4px;">${row.client}</span></td>
                    
                    <td style="text-align: right; color: #10b981;" class="text-bold">${formatBRL(row.revenues)}</td>
                    <td style="text-align: right; color: #3b82f6;" class="text-bold">${formatEUR(eurValue)}</td>
                `;
                prodTableBody.appendChild(tr);
            }
        });

        if (subtotalKwhElem) subtotalKwhElem.textContent = formatNumber(subKwh);
        if (subtotalRevElem) subtotalRevElem.textContent = formatBRL(subRev);
        const subtotalRevEurElem = document.getElementById('subtotal-rev-eur');
        if (subtotalRevEurElem) subtotalRevEurElem.textContent = formatEUR(subRevEur);
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
        updateKpiSalesBanner(year);
        window.renderChart(false);
    };

    // Initial update of the top KPI banner with the selected year
    updateKpiSalesBanner(currentChartYear);

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
        
        const hasImp = window.chartFilters.impianti.length > 0;
        const hasCli = window.chartFilters.clienti.length > 0;
        
        // Modalita' raggruppamento:
        // Se seleziono solo Impianti (e NESSUN Cliente) -> Raggruppa e mostra per USINA
        // Se seleziono solo Clienti (e NESSUN Impianto) -> Raggruppa e mostra per CLIENTE (tutte le usine)
        // Se seleziono entrambi -> Mostra per CLIENTE filtrato per gli impianti selezionati
        // Se nessuno selezionato -> Grafico vuoto
        const groupBy = (hasImp && !hasCli) ? 'usina' : 'cliente';
        
        const monthlyData = {};
        
        APP_DATA.production.forEach(row => {
            const rowImp = String(row.id);
            const rowCli = String(row.client);
            const rowYear = String(row.period).split('/')[1];
            
            if (currentChartYear !== 'all' && rowYear !== currentChartYear) return;
            
            if (hasImp && hasCli) {
                if (!window.chartFilters.impianti.includes(rowImp)) return;
                if (!window.chartFilters.clienti.includes(rowCli)) return;
            } else if (hasImp && !hasCli) {
                if (!window.chartFilters.impianti.includes(rowImp)) return;
            } else if (!hasImp && hasCli) {
                if (!window.chartFilters.clienti.includes(rowCli)) return;
            } else {
                return;
            }
            
            const periodKey = currentChartYear === 'all' ? rowYear : row.period;
            if (!periodKey) return;
            
            if (!monthlyData[periodKey]) {
                monthlyData[periodKey] = { items: {} };
            }
            
            const itemKey = (groupBy === 'usina') ? rowImp : rowCli;
            if (!monthlyData[periodKey].items[itemKey]) {
                monthlyData[periodKey].items[itemKey] = 0;
            }
            monthlyData[periodKey].items[itemKey] += (row.revenues || 0);
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

        const usinaColors = ['#3b82f6', '#06b6d4', '#10b981', '#14b8a6', '#6366f1', '#0ea5e9', '#2dd4bf', '#2563eb', '#059669', '#4f46e5', '#0891b2', '#15803d'];
        const clientColors = ['#f59e0b', '#ec4899', '#8b5cf6', '#f97316', '#d946ef', '#ef4444', '#e11d48', '#a855f7', '#fb923c', '#f43f5e', '#c026d3', '#ea580c'];
        if (window.myChart) {
            window.myChart.destroy();
        }

        if (currentChartType === 'pie') {
            const activeItems = (groupBy === 'usina') ? window.chartFilters.impianti : window.chartFilters.clienti;
            const pieLabels = (groupBy === 'usina') 
                ? activeItems.map(imp => `USINA ${imp.padStart(3, '0')}`)
                : activeItems.map(cli => (cli === 'JM Empreendimento' || cli === 'JM Empreendimentos') ? 'JM Empreend' : cli);

            const pieData = activeItems.map(item => {
                let sum = 0;
                labels.forEach(l => {
                    const monthPart = l.includes('/') ? l.split('/')[0] : '';
                    if (!monthPart || window.chartFilters.mesi.includes(monthPart)) {
                        if (monthlyData[l] && monthlyData[l].items[item]) {
                            sum += monthlyData[l].items[item];
                        }
                    }
                });
                return Math.round(sum * 100) / 100;
            });

            const pieColors = (groupBy === 'usina')
                ? activeItems.map(imp => window.getUsinaColor ? window.getUsinaColor(imp, allImp.indexOf(imp)) : '#3b82f6')
                : activeItems.map(cli => window.getClientColor ? window.getClientColor(cli, allCli.indexOf(cli), allCli) : '#f59e0b');

            const totalRev = pieData.reduce((a, b) => a + b, 0);

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
                                    const pct = totalRev > 0 ? ((val / totalRev) * 100).toFixed(1) + '%' : '0%';
                                    return ` ${context.label}: ${formatBRL(val)} (${pct})`;
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
                                const pct = totalRev > 0 ? ((value / totalRev) * 100).toFixed(1) + '%' : '';
                                return `${context.chart.data.labels[context.dataIndex]}\n${formatBRL(value)}\n(${pct})`;
                            }
                        }
                    }
                }
            });
        } else {
            const datasets = [];
            
            if (groupBy === 'usina') {
                window.chartFilters.impianti.forEach(imp => {
                    const color = window.getUsinaColor ? window.getUsinaColor(imp, allImp.indexOf(imp)) : '#3b82f6';
                    datasets.push({
                        label: `USINA ${imp.padStart(3, '0')}`,
                        data: labels.map(l => window.chartFilters.mesi.includes(l.split('/')[0]) ? (monthlyData[l] && monthlyData[l].items[imp] ? monthlyData[l].items[imp] : 0) : null),
                        backgroundColor: color,
                        borderColor: color,
                        type: 'bar',
                        borderWidth: 1,
                        stack: 'Stack 0'
                    });
                });
            } else {
                window.chartFilters.clienti.forEach(cli => {
                    const color = window.getClientColor ? window.getClientColor(cli, allCli.indexOf(cli), allCli) : '#f59e0b';
                    datasets.push({
                        label: `${cli}`,
                        data: labels.map(l => window.chartFilters.mesi.includes(l.split('/')[0]) ? (monthlyData[l] && monthlyData[l].items[cli] ? monthlyData[l].items[cli] : 0) : null),
                        backgroundColor: color,
                        borderColor: color,
                        type: 'bar',
                        borderWidth: 1,
                        stack: 'Stack 0'
                    });
                });
            }
            
            window.myChart = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        x: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { display: true, stacked: true, title: { display: true, text: 'R$', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    },
                    plugins: {
                        legend: { display: false },
                        datalabels: {
                            display: function(context) { 
                                const activeCount = (groupBy === 'usina') ? window.chartFilters.impianti.length : window.chartFilters.clienti.length;
                                return activeCount === 1; 
                            },
                            align: 'bottom',
                            anchor: 'end',
                            formatter: function(value) {
                                if (value === null || value === 0) return '';
                                return formatBRL(value);
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
                let html = '<div style="display:flex; gap:1rem; height:100%;">';
                
                // Impianti Scrollable List
                let impList = `<div style="flex: 1; max-height: 200px; overflow-y: auto; padding-right: 10px; border-right: 1px solid var(--border-color);">
                    <div class="filter-header-sticky" style="display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; padding: 4px 6px; margin-bottom: 8px; border-radius: 6px; z-index: 10;">
                        <span style="font-weight: 700; font-size: 0.8rem; letter-spacing: 0.5px;"><span data-i18n="word_impianti">IMPIANTI</span></span>
                        <div style="display: flex; gap: 4px;">
                            <span onclick="window.toggleAllChart('impianti', true)" class="filter-toggle-btn filter-toggle-all"><span data-i18n="filter_tutti">+ Tutti</span></span>
                            <span onclick="window.toggleAllChart('impianti', false)" class="filter-toggle-btn filter-toggle-none"><span data-i18n="filter_nessuno">- Nessuno</span></span>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">`;
                
                allImp.forEach(imp => {
                    const color = window.getUsinaColor ? window.getUsinaColor(imp, allImp.indexOf(imp)) : '#3b82f6';
                    const isChecked = window.chartFilters.impianti.includes(imp) ? 'checked' : '';
                    impList += `
                        <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; font-size:0.9rem; color:var(--text-main);">
                            <input type="checkbox" class="chart-filter-impianti" value="${imp}" ${isChecked} onchange="window.updateChartFilters()">
                            <span style="display:inline-block; width:14px; height:14px; min-width:14px; min-height:14px; flex-shrink:0; background-color:${color}; border-radius:3px;"></span>
                            USINA ${imp.padStart(3, '0')}
                        </label>
                    `;
                });
                impList += `</div></div>`;
                html += impList;

                // Clienti Scrollable List
                let cliList = `<div style="flex: 1; max-height: 200px; overflow-y: auto; padding-left: 10px;">
                    <div class="filter-header-sticky" style="display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; padding: 4px 6px; margin-bottom: 8px; border-radius: 6px; z-index: 10;">
                        <span style="font-weight: 700; font-size: 0.8rem; letter-spacing: 0.5px;"><span data-i18n="word_clienti">CLIENTI</span></span>
                        <div style="display: flex; gap: 4px;">
                            <span onclick="window.toggleAllChart('clienti', true)" class="filter-toggle-btn filter-toggle-all"><span data-i18n="filter_tutti">+ Tutti</span></span>
                            <span onclick="window.toggleAllChart('clienti', false)" class="filter-toggle-btn filter-toggle-none"><span data-i18n="filter_nessuno">- Nessuno</span></span>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">`;
                
                allCli.forEach(cli => {
                    const color = window.getClientColor ? window.getClientColor(cli, allCli.indexOf(cli), allCli) : '#f59e0b';
                    const isChecked = window.chartFilters.clienti.includes(cli) ? 'checked' : '';
                    let displayName = cli;
                    if (displayName === 'JM Empreendimento' || displayName === 'JM Empreendimentos') {
                        displayName = 'JM Empreend';
                    }
                    cliList += `
                        <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; font-size:0.9rem; color:var(--text-main);">
                            <input type="checkbox" class="chart-filter-clienti" value="${cli}" ${isChecked} onchange="window.updateChartFilters()">
                            <span style="display:inline-block; width:14px; height:14px; min-width:14px; min-height:14px; flex-shrink:0; background-color:${color}; border-radius:3px;"></span>
                            ${displayName}
                        </label>
                    `;
                });
                cliList += `</div></div>`;
                html += cliList;
                
                html += '</div>';
                legendContainer.innerHTML = html;
                if(typeof applyTranslations === 'function') applyTranslations();
            }
        }
    };

    window.renderChart();
    document.querySelectorAll('.lang-flag').forEach(flag => {
        flag.addEventListener('click', () => {
            setTimeout(() => {
                if (typeof updateKpiSalesBanner === 'function') {
                    updateKpiSalesBanner(currentChartYear);
                }
            }, 50);
        });
    });
});






    window.exportData = function(type) {
        const period = document.getElementById('export-period').value;
        let dataToExport = [];
        const today = new Date();
        const currentYear = today.getFullYear().toString();
        let currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
        
        if (period === 'filtered') {
            const checkedMese = Array.from(document.querySelectorAll('.chk-mese:checked')).map(cb => cb.value);
            const checkedImp = Array.from(document.querySelectorAll('.chk-impianto:checked')).map(cb => cb.value);
            const checkedCli = Array.from(document.querySelectorAll('.chk-client:checked')).map(cb => cb.value);
            dataToExport = APP_DATA.production.filter(row => checkedMese.includes(String(row.period)) && checkedImp.includes(String(row.id)) && checkedCli.includes(String(row.client)));
        } else if (period === 'global') {
            dataToExport = APP_DATA.production;
        } else if (period === 'current_year') {
            dataToExport = APP_DATA.production.filter(t => String(t.period).endsWith('/' + currentYear));
        } else if (period === 'current_month') {
            dataToExport = APP_DATA.production.filter(t => String(t.period) === (currentMonth + '/' + currentYear));
        }

        if (dataToExport.length === 0) {
            alert("Nessun dato da esportare.");
            return;
        }

        const prefix = "Registro_Vendite";
        const exportRows = dataToExport.map(t => [
            t.period,
            `Impianto ${t.id}`,
            t.client,
            t.kwh.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            t.revenues.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
        ]);
        const headers = ["Periodo", "Impianto", "Cliente", "Energia (KWh)", "Ricavo (R$)"];
        const filename = `${prefix}_${period}_${new Date().toISOString().slice(0,10)}`;

        if (type === 'excel') {
            if (typeof XLSX === 'undefined') { alert("Libreria XLSX non caricata."); return; }
            const ws = XLSX.utils.aoa_to_sheet([headers, ...exportRows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Dati");
            XLSX.writeFile(wb, `${filename}.xlsx`);
        } else if (type === 'pdf') {
            if (typeof window.jspdf === 'undefined') { alert("Libreria jsPDF non caricata."); return; }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(`${prefix.replace('_', ' ')} - ${period}`, 14, 15);
            doc.autoTable({ head: [headers], body: exportRows, startY: 20, styles: { fontSize: 8 }, headStyles: { fillColor: [16, 185, 129] } });
            doc.save(`${filename}.pdf`);
        }
    };

    // ==========================================
    // 5. COMPARATORE VENDITE LOGIC
    // ==========================================
    if (typeof db !== 'undefined') {
        db.ref('settings/comparatoreVendite').on('value', snap => {
            const isVisible = !!snap.val();
            const icon = document.getElementById('comparatore-vendite-eye-icon');
            const toggleBtn = document.getElementById('toggle-comparatore-vendite-btn');
            const card = document.getElementById('comparatore-vendite-kpi-card');
            const isUser = (typeof Auth !== 'undefined' && typeof Auth.isUserView === 'function') ? Auth.isUserView() : (typeof Auth !== 'undefined' && Auth.currentUser && Auth.currentUser.role !== 'admin');

            if (icon) {
                icon.className = isVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
                icon.style.color = isVisible ? '#10b981' : '#ef4444';
            }
            if (toggleBtn) {
                toggleBtn.style.display = isUser ? 'none' : 'block';
            }
            if (card) {
                card.style.display = (isUser && !isVisible) ? 'none' : 'flex';
            }
        });
    }

    window.toggleComparatoreVenditeVisibility = function() {
        if (typeof db === 'undefined') return;
        db.ref('settings/comparatoreVendite').once('value').then(snap => {
            const current = !!snap.val();
            db.ref('settings/comparatoreVendite').set(!current);
        });
    };
    window.openComparatoreModal = function() {
        const modal = document.getElementById('comparatoreModal');
        if (modal) {
            modal.style.display = 'flex';
            updateComparatorePeriodValues();
            if (window.renderComparatoreTable) window.renderComparatoreTable();
        }
    };

    window.closeComparatoreModal = function() {
        const modal = document.getElementById('comparatoreModal');
        if (modal) modal.style.display = 'none';
    };

    window.updateComparatorePeriodValues = function() {
        const typeSelect = document.getElementById('comparatore-period-type');
        if (!typeSelect) return;
        const type = typeSelect.value;
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
        if (window.renderComparatoreTable) window.renderComparatoreTable();
    };

    let comparatoreChartInstance = null;
    window.updateComparatoreChart = function() {
        const typeSelect = document.getElementById('comparatore-period-type');
        if (!typeSelect) return;
        const type = typeSelect.value;
        const entityType = (document.getElementById('comparatore-entity-type') || {}).value || 'usina';

        const allPlants = [...new Set(APP_DATA.production.map(r => String(r.id)))].sort((a,b) => Number(a) - Number(b));
        const allClients = [...new Set(APP_DATA.production.map(r => String(r.client)))].sort();

        const entityKeys = (entityType === 'usina') ? allPlants : allClients;
        const entityLabels = (entityType === 'usina')
            ? allPlants.map(id => 'USINA ' + String(id).padStart(3, '0'))
            : allClients.map(cli => (cli === 'JM Empreendimento' || cli === 'JM Empreendimentos') ? 'JM Empreend' : cli);

        const getEntityColor = (key, idx) => {
            if (entityType === 'usina') {
                return window.getUsinaColor ? window.getUsinaColor(key, idx) : '#3b82f6';
            } else {
                return window.getClientColor ? window.getClientColor(key, idx, allClients) : '#f59e0b';
            }
        };

        const ctx = document.getElementById('comparatoreChartCanvas');
        const summaryKpi = document.getElementById('comparatore-summary-kpi');
        if (!ctx) return;

        if (comparatoreChartInstance) {
            comparatoreChartInstance.destroy();
        }

        const formatBrlVal = (num) => 'R$ ' + (num || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        if (type === 'two_years') {
            const y1 = document.getElementById('comparatore-year-1').value;
            const y2 = document.getElementById('comparatore-year-2').value;
            const viewMode = (document.getElementById('comparatore-two-years-view') || {}).value || 'by_entity';

            const totalY1 = APP_DATA.production
                .filter(r => String(r.period).endsWith('/' + y1))
                .reduce((sum, r) => sum + (r.revenues || 0), 0);
            const totalY2 = APP_DATA.production
                .filter(r => String(r.period).endsWith('/' + y2))
                .reduce((sum, r) => sum + (r.revenues || 0), 0);

            const diffRev = totalY2 - totalY1;
            let diffPctStr = '0.0%';
            if (totalY1 > 0) {
                const pct = ((diffRev / totalY1) * 100);
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
                document.getElementById('kpi-y1-val').textContent = formatBrlVal(totalY1);
                document.getElementById('kpi-y2-label').textContent = `Anno ${y2}:`;
                document.getElementById('kpi-y2-val').textContent = formatBrlVal(totalY2);

                const badge = document.getElementById('kpi-diff-badge');
                badge.textContent = `${diffRev >= 0 ? '+' : ''}${formatBrlVal(diffRev)} (${diffPctStr})`;
                if (diffRev > 0) {
                    badge.style.background = 'rgba(16, 185, 129, 0.2)';
                    badge.style.color = '#34d399';
                    badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                } else if (diffRev < 0) {
                    badge.style.background = 'rgba(239, 68, 68, 0.2)';
                    badge.style.color = '#f87171';
                    badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                } else {
                    badge.style.background = 'rgba(148, 163, 184, 0.2)';
                    badge.style.color = '#94a3b8';
                    badge.style.borderColor = 'rgba(148, 163, 184, 0.4)';
                }
            }

            if (viewMode === 'by_entity') {
                const dataY1 = entityKeys.map(key => {
                    return APP_DATA.production
                        .filter(r => (entityType === 'usina' ? String(r.id) === key : String(r.client) === key) && String(r.period).endsWith('/' + y1))
                        .reduce((sum, r) => sum + (r.revenues || 0), 0);
                });

                const dataY2 = entityKeys.map(key => {
                    return APP_DATA.production
                        .filter(r => (entityType === 'usina' ? String(r.id) === key : String(r.client) === key) && String(r.period).endsWith('/' + y2))
                        .reduce((sum, r) => sum + (r.revenues || 0), 0);
                });

                comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: entityLabels,
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
                                        return formatBrlVal(value);
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
                                        return `${formatBrlVal(v2)}${pctText}`;
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
                                title: { display: true, text: 'R$', color: '#94a3b8' }
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
                                        return ` ${context.dataset.label}: ${formatBrlVal(val)}`;
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
                                            return [`Variazione: ${sign}${formatBrlVal(diff)} (${sign}${pct})`];
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
                        .reduce((sum, r) => sum + (r.revenues || 0), 0);
                });

                const dataY2 = monthNums.map(m => {
                    const pKey = `${m}/${y2}`;
                    return APP_DATA.production
                        .filter(r => String(r.period) === pKey)
                        .reduce((sum, r) => sum + (r.revenues || 0), 0);
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
                                        return formatBrlVal(value);
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
                                        return `${formatBrlVal(v2)}${pctText}`;
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
                                title: { display: true, text: 'R$', color: '#94a3b8' }
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
                                        return ` ${context.dataset.label}: ${formatBrlVal(val)}`;
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
                                            return [`Variazione: ${sign}${formatBrlVal(diff)} (${sign}${pct})`];
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

            const totalM1 = APP_DATA.production
                .filter(r => String(r.period) === m1)
                .reduce((sum, r) => sum + (r.revenues || 0), 0);
            const totalM2 = APP_DATA.production
                .filter(r => String(r.period) === m2)
                .reduce((sum, r) => sum + (r.revenues || 0), 0);

            const diffRev = totalM2 - totalM1;
            let diffPctStr = '0.0%';
            if (totalM1 > 0) {
                const pct = ((diffRev / totalM1) * 100);
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
                document.getElementById('kpi-y1-val').textContent = formatBrlVal(totalM1);
                document.getElementById('kpi-y2-label').textContent = `Mese ${m2}:`;
                document.getElementById('kpi-y2-val').textContent = formatBrlVal(totalM2);

                const badge = document.getElementById('kpi-diff-badge');
                badge.textContent = `${diffRev >= 0 ? '+' : ''}${formatBrlVal(diffRev)} (${diffPctStr})`;
                if (diffRev > 0) {
                    badge.style.background = 'rgba(16, 185, 129, 0.2)';
                    badge.style.color = '#34d399';
                    badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                } else if (diffRev < 0) {
                    badge.style.background = 'rgba(239, 68, 68, 0.2)';
                    badge.style.color = '#f87171';
                    badge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                } else {
                    badge.style.background = 'rgba(148, 163, 184, 0.2)';
                    badge.style.color = '#94a3b8';
                    badge.style.borderColor = 'rgba(148, 163, 184, 0.4)';
                }
            }

            const dataM1 = entityKeys.map(key => {
                return APP_DATA.production
                    .filter(r => (entityType === 'usina' ? String(r.id) === key : String(r.client) === key) && String(r.period) === m1)
                    .reduce((sum, r) => sum + (r.revenues || 0), 0);
            });

            const dataM2 = entityKeys.map(key => {
                return APP_DATA.production
                    .filter(r => (entityType === 'usina' ? String(r.id) === key : String(r.client) === key) && String(r.period) === m2)
                    .reduce((sum, r) => sum + (r.revenues || 0), 0);
            });

            comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: entityLabels,
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
                                    return formatBrlVal(value);
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
                                    return `${formatBrlVal(v2)}${pctText}`;
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
                            title: { display: true, text: 'R$', color: '#94a3b8' }
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
                                    return ` ${context.dataset.label}: ${formatBrlVal(val)}`;
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
                                        return [`Variazione: ${sign}${formatBrlVal(diff)} (${sign}${pct})`];
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

        const entityData = {};
        APP_DATA.production.forEach(row => {
            const key = (entityType === 'usina') ? String(row.id) : String(row.client);
            let matches = false;
            if (type === 'year') {
                matches = String(row.period).endsWith('/' + periodVal);
            } else {
                matches = String(row.period) === periodVal;
            }
            if (matches) {
                if (!entityData[key]) entityData[key] = 0;
                entityData[key] += (row.revenues || 0);
            }
        });

        const dataPoints = entityKeys.map(k => entityData[k] || 0);
        const colors = entityKeys.map((k, idx) => getEntityColor(k, idx));

        comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: entityLabels,
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
                        title: { display: true, text: 'R$', color: '#94a3b8' }
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
                            return formatBrlVal(value);
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

        const entityType = (document.getElementById('comparatore-entity-type') || {}).value || 'usina';
        const allPlants = [...new Set(APP_DATA.production.map(r => String(r.id)))].sort((a,b) => Number(a) - Number(b));
        const allClients = [...new Set(APP_DATA.production.map(r => String(r.client)))].sort();

        const entityKeys = (entityType === 'usina') ? allPlants : allClients;
        const entityLabels = (entityType === 'usina')
            ? allPlants.map(id => 'USINA ' + String(id).padStart(3, '0'))
            : allClients.map(cli => (cli === 'JM Empreendimento' || cli === 'JM Empreendimentos') ? 'JM Empreend' : cli);

        const getEntityColor = (key, idx) => {
            if (entityType === 'usina') {
                return window.getUsinaColor ? window.getUsinaColor(key, idx) : '#3b82f6';
            } else {
                return window.getClientColor ? window.getClientColor(key, idx, allClients) : '#f59e0b';
            }
        };

        const tAnnoMese = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang] && translations[currentLang]['comp_anno_mese']) || 'Anno / Mese';
        const tTotale = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang] && translations[currentLang]['comp_totale']) || 'Totale';
        const tVarYoY = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang] && translations[currentLang]['comp_var_yoy']) || 'Var. YoY';

        let thHtml = `<tr><th style="text-align: left; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2);">${tAnnoMese}</th>`;
        entityKeys.forEach((k, idx) => {
            const uColor = getEntityColor(k, idx);
            const label = entityLabels[idx];
            thHtml += `<th style="text-align: right; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2);"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${uColor}; margin-right:5px;"></span>${label}</th>`;
        });
        thHtml += `<th style="text-align: right; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2); color: #10b981;">${tTotale} (R$)</th>`;
        thHtml += `<th style="text-align: right; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2); color: #3b82f6;">${tVarYoY}</th></tr>`;
        thead.innerHTML = thHtml;

        const dataByYear = {};
        ['2027', '2026', '2025'].forEach(y => {
            dataByYear[y] = { total: {}, months: {} };
        });

        APP_DATA.production.forEach(row => {
            const key = (entityType === 'usina') ? String(row.id) : String(row.client);
            const period = String(row.period);
            const parts = period.split('/');
            if (parts.length < 2) return;
            const year = parts[1];

            if (!dataByYear[year]) {
                dataByYear[year] = { total: {}, months: {} };
            }
            if (!dataByYear[year].months[period]) {
                dataByYear[year].months[period] = {};
            }

            if (!dataByYear[year].total[key]) dataByYear[year].total[key] = 0;
            dataByYear[year].total[key] += (row.revenues || 0);

            if (!dataByYear[year].months[period][key]) dataByYear[year].months[period][key] = 0;
            dataByYear[year].months[period][key] += (row.revenues || 0);
        });

        const formatBrlSimple = (val) => val ? val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
        let tbHtml = '';

        const years = Object.keys(dataByYear).sort((a,b) => Number(b) - Number(a));
        const yearTotals = {};
        years.forEach(yr => {
            yearTotals[yr] = entityKeys.reduce((sum, k) => sum + (dataByYear[yr].total[k] || 0), 0);
        });

        years.forEach(year => {
            let yearTotalRow = yearTotals[year] || 0;
            let yearCells = '';

            const yearVals = entityKeys.map(k => dataByYear[year].total[k] || 0);
            const activeYearVals = yearVals.filter(v => v > 0);
            const yearMax = activeYearVals.length > 0 ? Math.max(...activeYearVals) : -1;
            const yearMin = activeYearVals.length > 1 ? Math.min(...activeYearVals) : -1;

            entityKeys.forEach((k, i) => {
                const val = yearVals[i];
                let colorStyle = '';
                if (val > 0) {
                    if (val === yearMax && yearMax !== yearMin) colorStyle = 'color: #10b981;';
                    else if (val === yearMin && yearMax !== yearMin) colorStyle = 'color: #ef4444;';
                }
                yearCells += `<td style="padding: 10px; text-align: right; ${colorStyle}">${formatBrlSimple(val)}</td>`;
            });

            // YoY variation
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
                    <td style="padding: 10px; text-align: right; color: #10b981;">${formatBrlSimple(yearTotalRow)}</td>
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

                const monthVals = entityKeys.map(k => dataByYear[year].months[month][k] || 0);
                const activeMonthVals = monthVals.filter(v => v > 0);
                const monthMax = activeMonthVals.length > 0 ? Math.max(...activeMonthVals) : -1;
                const monthMin = activeMonthVals.length > 1 ? Math.min(...activeMonthVals) : -1;

                entityKeys.forEach((k, i) => {
                    const val = monthVals[i];
                    monthTotalRow += val;
                    let colorStyle = 'color: #cbd5e1;';
                    if (val > 0) {
                        if (val === monthMax && monthMax !== monthMin) colorStyle = 'color: #10b981; font-weight: bold;';
                        else if (val === monthMin && monthMax !== monthMin) colorStyle = 'color: #ef4444; font-weight: bold;';
                    }
                    monthCells += `<td style="padding: 8px; text-align: right; ${colorStyle}">${formatBrlSimple(val)}</td>`;
                });

                tbHtml += `
                    <tr class="month-row-${year}" style="display: none; border-bottom: 1px solid rgba(255,255,255,0.02); font-size: 0.9em; background: rgba(0,0,0,0.15);">
                        <td style="text-align: left; padding: 8px; padding-left: 30px; color: #cbd5e1;">${month}</td>
                        ${monthCells}
                        <td style="padding: 8px; text-align: right; color: #34d399; font-weight: bold;">${formatBrlSimple(monthTotalRow)}</td>
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
        if (rows.length === 0) return;

        const isHidden = rows[0].style.display === 'none';
        rows.forEach(r => {
            r.style.display = isHidden ? 'table-row' : 'none';
        });

        if (icon) {
            icon.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
        }
    };


