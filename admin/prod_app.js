Chart.register(ChartDataLabels);

window.formatNumber = function(num) {
    return Math.round(Number(num || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const formatNumber = window.formatNumber;

window.isPeriodValid = function(p) {
    if (!p) return false;
    const parts = String(p).split('/');
    if (parts.length < 2) return false;
    const m = Number(parts[0]);
    const y = Number(parts[1]);
    return y > 2026 || (y === 2026 && m >= 6);
};
const isPeriodValid = window.isPeriodValid;

window.formatBRL = function(num) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(num || 0);
};
const formatBRL = window.formatBRL;

// Mapping plants according to Excel Faturamento (Não Editar)
// Col B: 7030102643 -> TRI007 e TRI007bis
// Col C: 7031754431 -> TRI003
// Col D: 7030869049 -> TRI008 e TRI008bis
// Col E: 7030869065 -> TRI002 e TRI002bis
// Col F: 7030869294 -> TRI001 e TRI001bis
window.PLANT_ORDER = [
    'TRI007 e TRI007bis',
    'TRI003',
    'TRI008 e TRI008bis',
    'TRI002 e TRI002bis',
    'TRI001 e TRI001bis'
];

window.PLANT_METERS = {
    'TRI007 e TRI007bis': '7030102643',
    'TRI003': '7031754431',
    'TRI008 e TRI008bis': '7030869049',
    'TRI002 e TRI002bis': '7030869065',
    'TRI001 e TRI001bis': '7030869294'
};

window.getPlantDisplay = function(row) {
    if (!row) return '';
    if (typeof row === 'string') return row;
    if (row.plant) return row.plant;
    const m = String(row.meter || '');
    if (m === '7030102643') return 'TRI007 e TRI007bis';
    if (m === '7031754431') return 'TRI003';
    if (m === '7030869049') return 'TRI008 e TRI008bis';
    if (m === '7030869065') return 'TRI002 e TRI002bis';
    if (m === '7030869294') return 'TRI001 e TRI001bis';
    const id = String(row.id || '');
    if (id === '1') return 'TRI007 e TRI007bis';
    if (id === '2') return 'TRI003';
    if (id === '3') return 'TRI008 e TRI008bis';
    if (id === '4') return 'TRI002 e TRI002bis';
    if (id === '5') return 'TRI001 e TRI001bis';
    return id ? 'USINA ' + id.padStart(3, '0') : '';
};
const getPlantDisplay = window.getPlantDisplay;

window.getPlantMeter = function(plantName) {
    if (window.PLANT_METERS[plantName]) return window.PLANT_METERS[plantName];
    if (typeof APP_DATA !== 'undefined' && APP_DATA.production) {
        const found = APP_DATA.production.find(r => getPlantDisplay(r) === plantName && r.meter);
        if (found) return found.meter;
    }
    return '';
};

const plantColorsList = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];
window.getUsinaColor = function(plantKey, idx) {
    if (typeof plantKey === 'string' && window.PLANT_ORDER.includes(plantKey)) {
        const i = window.PLANT_ORDER.indexOf(plantKey);
        return plantColorsList[i % plantColorsList.length];
    }
    const safeIdx = (idx != null && idx >= 0) ? idx : 0;
    return plantColorsList[safeIdx % plantColorsList.length];
};

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
        window.location.href = "login.html";
        return;
    }

    // Set User Profile UI
    if (typeof Auth !== 'undefined' && typeof Auth.updateUserProfileUI === 'function') {
        Auth.updateUserProfileUI();
    }

    if (APP_DATA.lastUpdated) {
        const lu = document.getElementById('last-updated');
        if (lu) lu.textContent = APP_DATA.lastUpdated;
    }

    // 2. Active modules status KPI
    if (APP_DATA.modules) {
        const statusCounts = {};
        APP_DATA.modules.forEach(m => {
            statusCounts[m.stato] = (statusCounts[m.stato] || 0) + 1;
        });
        const kpiList = document.getElementById('kpi-plants-list');
        if (kpiList) {
            let html = '';
            for (const [stato, count] of Object.entries(statusCounts)) {
                let statoLabel = stato;
                if (stato.toUpperCase() === 'ATTIVO') statoLabel = 'ATTIVI';
                let i18nStato = `stato_${stato.replace(/\s+/g, '_')}`;
                html += `<div><span style="color: var(--text-main); font-weight: bold; font-size: 1.1rem;">${count}</span> <span data-i18n="word_impianti">Impianti</span> <span data-i18n="${i18nStato}">${statoLabel}</span></div>`;
            }
            kpiList.innerHTML = html;
            if (typeof applyTranslations === 'function') applyTranslations();
        }
    }

    // 3. KPI Production Banner
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
                const pName = getPlantDisplay(row);
                if (!plantTotalsYear[pName]) plantTotalsYear[pName] = 0;
                plantTotalsYear[pName] += kwhVal;
            }
        });
        
        if (kpiKwhElem) {
            kpiKwhElem.innerHTML = formatNumber(filteredKwh) + ' <span style="font-size: 0.8em; color: #9ca3af;">kWh</span>';
        }
        
        if (kpiYearElem) {
            const currentLang = localStorage.getItem('appLang') || 'it';
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
            window.PLANT_ORDER.forEach((pName, idx) => {
                const pKwh = plantTotalsYear[pName] || 0;
                const color = window.getUsinaColor(pName, idx);
                listHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                        <span style="display: flex; align-items: center; gap: 6px;">
                            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${color}; flex-shrink:0;"></span>
                            <span>${pName}</span>
                        </span>
                        <span style="color: var(--text-main); font-weight: 600; margin-left: 0.5rem; font-family: monospace;">${formatNumber(pKwh)} kWh</span>
                    </div>
                `;
            });
            kpiPlantsList.innerHTML = listHtml;
        }
    }
    window.updateKpiProductionBanner = updateKpiProductionBanner;

    // 4. Matrix Table Setup (Plants in Horizontal Columns, Months in Vertical Rows)
    const prodTableHead = document.getElementById('production-table-head');
    const prodTableBody = document.getElementById('production-table-body');
    const prodTableFoot = document.getElementById('production-table-foot');

    const allTablePlants = window.PLANT_ORDER.slice();

    const allTablePeriods = [...new Set(APP_DATA.production.filter(r => isPeriodValid(r.period)).map(r => String(r.period)))].sort((a,b) => {
        const [m1, y1] = a.split('/').map(Number);
        const [m2, y2] = b.split('/').map(Number);
        return (y2 - y1) || (m2 - m1);
    });

    const allTableYears = [...new Set(allTablePeriods.map(p => p.split('/')[1]))].sort((a,b) => Number(b) - Number(a));

    // Populate Year Filter Dropdown
    const filterAnnoSelect = document.getElementById('filter-anno');
    if (filterAnnoSelect) {
        filterAnnoSelect.innerHTML = '<option value="all" data-i18n="filter_tutti_anni">Tutti gli anni</option>';
        allTableYears.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = 'Anno ' + y;
            filterAnnoSelect.appendChild(opt);
        });
    }

    // Populate Month Multi-Select Dropdown
    const dropdownMese = document.getElementById('dropdown-mese');
    if (dropdownMese) {
        let meseHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.4rem;">
                <span style="font-weight: bold; font-size: 0.8rem; color: #94a3b8;" data-i18n="filter_mesi">MESI</span>
                <div style="display: flex; gap: 4px;">
                    <span onclick="window.toggleAllFilter('chk-mese', true)" class="filter-toggle-btn filter-toggle-all" data-i18n="filter_tutti">+ Tutti</span>
                    <span onclick="window.toggleAllFilter('chk-mese', false)" class="filter-toggle-btn filter-toggle-none" data-i18n="filter_nessuno">- Nessuno</span>
                </div>
            </div>
        `;
        allTablePeriods.forEach(p => {
            meseHtml += `
                <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; cursor: pointer; font-size: 0.85rem;">
                    <input type="checkbox" class="chk-mese" value="${p}" checked onchange="window.renderTable()">
                    <span>${p}</span>
                </label>
            `;
        });
        dropdownMese.innerHTML = meseHtml;
    }

    // Populate Plant Multi-Select Dropdown
    const dropdownImpianto = document.getElementById('dropdown-impianto');
    if (dropdownImpianto) {
        let impHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.4rem;">
                <span style="font-weight: bold; font-size: 0.8rem; color: #94a3b8;" data-i18n="filter_impianto">IMPIANTI</span>
                <div style="display: flex; gap: 4px;">
                    <span onclick="window.toggleAllFilter('chk-impianto', true)" class="filter-toggle-btn filter-toggle-all" data-i18n="filter_tutti">+ Tutti</span>
                    <span onclick="window.toggleAllFilter('chk-impianto', false)" class="filter-toggle-btn filter-toggle-none" data-i18n="filter_nessuno">- Nessuno</span>
                </div>
            </div>
        `;
        allTablePlants.forEach((pName, idx) => {
            const meter = window.getPlantMeter(pName);
            const color = window.getUsinaColor(pName, idx);
            impHtml += `
                <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.45rem; cursor: pointer; font-size: 0.85rem;">
                    <input type="checkbox" class="chk-impianto" value="${pName}" checked onchange="window.renderTable()">
                    <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${color}; flex-shrink:0;"></span>
                    <span style="display: flex; flex-direction: column;">
                        <span style="font-weight: 600;">${pName}</span>
                        ${meter ? `<span style="font-family: monospace; font-size: 0.72rem; color: #94a3b8;">${meter}</span>` : ''}
                    </span>
                </label>
            `;
        });
        dropdownImpianto.innerHTML = impHtml;
    }

    window.toggleAllFilter = (className, selectAll) => {
        document.querySelectorAll('.' + className).forEach(cb => cb.checked = selectAll);
        window.renderTable();
    };

    window.toggleDropdown = (id) => {
        document.querySelectorAll('.multi-select-dropdown').forEach(el => {
            if (el.id !== id) el.style.display = 'none';
        });
        const el = document.getElementById(id);
        if (el) el.style.display = (el.style.display === 'none' || !el.style.display) ? 'block' : 'none';
    };

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.multi-select-container')) {
            document.querySelectorAll('.multi-select-dropdown').forEach(el => el.style.display = 'none');
        }
    });

    window.onYearFilterChange = (selectedYear) => {
        document.querySelectorAll('.chk-mese').forEach(cb => {
            if (selectedYear === 'all') {
                cb.checked = true;
            } else {
                cb.checked = cb.value.endsWith('/' + selectedYear);
            }
        });
        window.renderTable();
    };

    window.renderTable = () => {
        if (!prodTableHead || !prodTableBody || !prodTableFoot) return;

        const checkedMese = Array.from(document.querySelectorAll('.chk-mese:checked')).map(cb => cb.value);
        const checkedPlants = Array.from(document.querySelectorAll('.chk-impianto:checked')).map(cb => cb.value);

        const displayPlants = allTablePlants.filter(p => checkedPlants.includes(p));

        // 1. Render Table Head (Dynamic Horizontal Plant Columns)
        let thHtml = `<tr>
            <th style="position: sticky; left: 0; z-index: 60; background: var(--bg-dark); min-width: 110px; padding: 12px 14px; text-align: left; border-bottom: 2px solid rgba(255,255,255,0.15);" data-i18n="table_mese_anno">Mese/Anno</th>`;

        displayPlants.forEach((pName, idx) => {
            const meter = window.getPlantMeter(pName);
            const color = window.getUsinaColor(pName, allTablePlants.indexOf(pName));
            thHtml += `
                <th style="text-align: right; min-width: 155px; padding: 10px 14px; border-bottom: 2px solid rgba(255,255,255,0.15);">
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                        <span style="display: flex; align-items: center; gap: 5px; font-weight: 600; color: var(--text-main);">
                            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${color}; flex-shrink:0;"></span>
                            <span>${pName}</span>
                        </span>
                        ${meter ? `<span style="font-family: monospace; font-size: 0.74rem; color: #94a3b8; font-weight: normal; letter-spacing: 0.5px;">${meter}</span>` : ''}
                    </div>
                </th>
            `;
        });

        thHtml += `
            <th style="text-align: right; min-width: 140px; padding: 12px 14px; color: #10b981; font-weight: bold; border-bottom: 2px solid rgba(255,255,255,0.15);" data-i18n="table_totale_kwh">TOTALE (kWh)</th>
        </tr>`;
        prodTableHead.innerHTML = thHtml;

        // 2. Render Table Body (Months in Vertical Rows)
        prodTableBody.innerHTML = '';
        const matrixData = {};
        allTablePeriods.forEach(p => {
            matrixData[p] = {};
            displayPlants.forEach(pName => { matrixData[p][pName] = 0; });
        });

        APP_DATA.production.forEach(row => {
            const p = String(row.period);
            const pName = getPlantDisplay(row);
            if (matrixData[p] && matrixData[p].hasOwnProperty(pName)) {
                matrixData[p][pName] += (row.kwh || 0);
            }
        });

        const plantColSums = {};
        displayPlants.forEach(pName => { plantColSums[pName] = 0; });
        let grandTotalKwh = 0;

        allTablePeriods.forEach(period => {
            if (!checkedMese.includes(period)) return;

            let monthKwh = 0;
            const plantMonthVals = matrixData[period] || {};

            displayPlants.forEach(pName => {
                const val = plantMonthVals[pName] || 0;
                monthKwh += val;
                plantColSums[pName] += val;
            });

            grandTotalKwh += monthKwh;

            const tr = document.createElement('tr');
            let trHtml = `<td style="position: sticky; left: 0; background: var(--bg-dark); font-weight: 600; padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06);">${period}</td>`;

            displayPlants.forEach(pName => {
                const v = plantMonthVals[pName] || 0;
                const formatted = v > 0 ? formatNumber(v) : '<span style="color: rgba(255,255,255,0.2);">-</span>';
                trHtml += `<td style="text-align: right; font-family: monospace; font-size: 0.9rem; padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06);">${formatted}</td>`;
            });

            trHtml += `
                <td style="text-align: right; font-weight: 700; color: #10b981; font-family: monospace; font-size: 0.95rem; padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06);">${formatNumber(monthKwh)}</td>
            `;
            tr.innerHTML = trHtml;
            prodTableBody.appendChild(tr);
        });

        // 3. Render Table Foot (Totals per plant and grand total)
        let tfootHtml = `<tr>
            <td class="total-label" style="position: sticky; left: 0; padding: 12px 14px;" data-i18n="table_subtotali">TOTALI:</td>`;

        displayPlants.forEach(pName => {
            const sumVal = plantColSums[pName] || 0;
            tfootHtml += `<td class="total-client-val" style="text-align: right; font-family: monospace; font-size: 0.95rem; padding: 12px 14px;">${formatNumber(sumVal)}</td>`;
        });

        tfootHtml += `
            <td class="total-val-brl" style="text-align: right; font-size: 1.05rem; font-family: monospace; padding: 12px 14px; color: #10b981;">${formatNumber(grandTotalKwh)}</td>
        </tr>`;
        prodTableFoot.innerHTML = tfootHtml;

        if (typeof applyTranslations === 'function') applyTranslations();
    };

    window.renderTable();

    // 5. Main Chart Logic
    let currentChartType = 'bar';
    let currentChartYear = '2026';
    window.myChart = null;

    const allImp = window.PLANT_ORDER.slice();
    const allYears = (typeof window.getAvailableYears === 'function') ? window.getAvailableYears() : ['2028', '2027', '2026'];

    const yearSelect = document.getElementById('chart-year-select');
    if (yearSelect) {
        yearSelect.innerHTML = '<option value="all" style="color: #000;" data-i18n="filter_tutti_anni">Tutti gli anni</option>';
        allYears.forEach(y => {
            if (!y || Number(y) < 2026) return;
            const opt = document.createElement('option');
            opt.value = y; opt.textContent = 'Anno ' + y;
            opt.style.color = '#000';
            yearSelect.appendChild(opt);
        });
        if (allYears.includes('2026')) {
            yearSelect.value = '2026';
        }
    }

    const dropdownChartMese = document.getElementById('dropdown-chart-mese');
    const allMesi = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const activeMesiInitial = (currentChartYear === '2026') ? ['06', '07', '08', '09', '10', '11', '12'] : allMesi;

    window.chartFilters = {
        mesi: [...activeMesiInitial],
        impianti: [...allImp]
    };

    const updateMonthDropdownUI = () => {
        if (!dropdownChartMese) return;
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.4rem;">
                <span style="font-weight: bold; font-size: 0.8rem; color: #94a3b8;" data-i18n="filter_mesi">MESI</span>
                <div style="display: flex; gap: 4px;">
                    <span onclick="window.toggleAllChart('mesi', true)" class="filter-toggle-btn filter-toggle-all" data-i18n="filter_tutti">+ Tutti</span>
                    <span onclick="window.toggleAllChart('mesi', false)" class="filter-toggle-btn filter-toggle-none" data-i18n="filter_nessuno">- Nessuno</span>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem;">
        `;
        const mesiList = (currentChartYear === '2026') ? ['06', '07', '08', '09', '10', '11', '12'] : allMesi;
        mesiList.forEach(m => {
            const isChecked = window.chartFilters.mesi.includes(m) ? 'checked' : '';
            html += `
                <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; font-size: 0.85rem;">
                    <input type="checkbox" class="chart-filter-mesi" value="${m}" ${isChecked} onchange="window.updateChartFilters()">
                    <span>${m}</span>
                </label>
            `;
        });
        html += `</div>`;
        dropdownChartMese.innerHTML = html;
        if (typeof applyTranslations === 'function') applyTranslations();
    };
    updateMonthDropdownUI();

    window.toggleAllChart = (group, selectAll) => {
        if (group === 'mesi') {
            const currentList = (currentChartYear === '2026') ? ['06', '07', '08', '09', '10', '11', '12'] : allMesi;
            window.chartFilters.mesi = selectAll ? [...currentList] : [];
            document.querySelectorAll('.chart-filter-mesi').forEach(cb => cb.checked = selectAll);
        } else if (group === 'impianti') {
            window.chartFilters.impianti = selectAll ? [...allImp] : [];
            document.querySelectorAll('.chart-filter-impianti').forEach(cb => cb.checked = selectAll);
        }
        window.renderChart(false);
    };

    window.updateChartFilters = () => {
        window.chartFilters.mesi = Array.from(document.querySelectorAll('.chart-filter-mesi:checked')).map(cb => cb.value);
        window.chartFilters.impianti = Array.from(document.querySelectorAll('.chart-filter-impianti:checked')).map(cb => cb.value);
        window.renderChart(false);
    };

    window.changeChartType = (type) => {
        currentChartType = type;
        window.renderChart(false);
    };

    window.changeChartYear = (year) => {
        currentChartYear = year;
        if (year === '2026') {
            window.chartFilters.mesi = ['06', '07', '08', '09', '10', '11', '12'];
        } else {
            window.chartFilters.mesi = [...allMesi];
        }
        updateMonthDropdownUI();
        window.renderChart(false);
        updateKpiProductionBanner(year);
    };

    window.renderChart = (rebuildLegend = true) => {
        const ctx = document.getElementById('prodChart');
        if (!ctx) return;

        const monthlyData = {};
        APP_DATA.production.forEach(row => {
            const periodStr = String(row.period);
            if (!isPeriodValid(periodStr)) return;
            const parts = periodStr.split('/');
            if (parts.length < 2) return;
            const month = parts[0];
            const year = parts[1];

            if (currentChartYear !== 'all' && year !== currentChartYear) return;

            const periodKey = (currentChartYear === 'all') ? year : periodStr;
            const pName = getPlantDisplay(row);

            if (!monthlyData[periodKey]) {
                monthlyData[periodKey] = { total: 0, items: {} };
                allImp.forEach(imp => monthlyData[periodKey].items[imp] = 0);
            }
            monthlyData[periodKey].items[pName] = (monthlyData[periodKey].items[pName] || 0) + (row.kwh || 0);
            monthlyData[periodKey].total += (row.kwh || 0);
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
            const pieLabels = activePlants.slice();
            const pieData = activePlants.map(imp => {
                let sum = 0;
                labels.forEach(l => {
                    const monthPart = l.includes('/') ? l.split('/')[0] : '';
                    if (!monthPart || window.chartFilters.mesi.includes(monthPart)) {
                        if (monthlyData[l] && monthlyData[l].items[imp]) {
                            sum += monthlyData[l].items[imp];
                        }
                    }
                });
                return Math.round(sum);
            });

            const pieColors = activePlants.map(imp => window.getUsinaColor(imp, allImp.indexOf(imp)));
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
                const color = window.getUsinaColor(imp, allImp.indexOf(imp));
                datasets.push({
                    label: imp,
                    data: labels.map(l => {
                        const monthPart = l.includes('/') ? l.split('/')[0] : '';
                        if (monthPart && !window.chartFilters.mesi.includes(monthPart)) return null;
                        return monthlyData[l] && monthlyData[l].items[imp] ? monthlyData[l].items[imp] : 0;
                    }),
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
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    layout: { padding: { top: 25 } },
                    scales: {
                        x: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                        y: { 
                            display: true, 
                            stacked: true, 
                            title: { display: true, text: 'kWh', color: '#94a3b8' }, 
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            grace: '10%'
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        datalabels: { display: false }
                    }
                }
            });
        }

        if (rebuildLegend) {
            const legendContainer = document.getElementById('custom-chart-legend');
            if (legendContainer) {
                let html = `
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <div class="filter-header-sticky" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; margin-bottom: 10px; border-radius: 6px;">
                            <span style="font-weight: 700; font-size: 0.82rem; letter-spacing: 0.5px;" data-i18n="filter_impianto">IMPIANTI</span>
                            <div style="display: flex; gap: 4px;">
                                <span onclick="window.toggleAllChart('impianti', true)" class="filter-toggle-btn filter-toggle-all" data-i18n="filter_tutti">+ Tutti</span>
                                <span onclick="window.toggleAllChart('impianti', false)" class="filter-toggle-btn filter-toggle-none" data-i18n="filter_nessuno">- Nessuno</span>
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                `;

                allImp.forEach(imp => {
                    const color = window.getUsinaColor(imp, allImp.indexOf(imp));
                    const isChecked = window.chartFilters.impianti.includes(imp) ? 'checked' : '';
                    const meter = window.getPlantMeter(imp);
                    html += `
                        <label style="display:flex; align-items:center; gap:0.6rem; cursor:pointer; font-size:0.9rem; color:var(--text-main);">
                            <input type="checkbox" class="chart-filter-impianti" value="${imp}" ${isChecked} onchange="window.updateChartFilters()">
                            <span style="display:inline-block; width:12px; height:12px; background-color:${color}; border-radius:3px; flex-shrink:0;"></span>
                            <span style="display:flex; flex-direction:column; line-height: 1.25;">
                                <span style="font-weight: 600;">${imp}</span>
                                ${meter ? `<span style="font-family: monospace; font-size: 0.74rem; color: #94a3b8;">${meter}</span>` : ''}
                            </span>
                        </label>
                    `;
                });
                html += `</div></div>`;
                legendContainer.innerHTML = html;
                if (typeof applyTranslations === 'function') applyTranslations();
            }
        }
    };

    window.renderChart();
    updateKpiProductionBanner(currentChartYear);

    // 6. Export Data Function
    window.exportData = function(type) {
        const periodExportMode = document.getElementById('export-period').value;
        const today = new Date();
        const currentYear = today.getFullYear().toString();
        let currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
        
        let periodsToExport = [];
        if (periodExportMode === 'current_year') {
            periodsToExport = allTablePeriods.filter(p => p.endsWith('/' + currentYear));
        } else if (periodExportMode === 'global') {
            periodsToExport = allTablePeriods.slice();
        } else {
            const checkedMese = Array.from(document.querySelectorAll('.chk-mese:checked')).map(cb => cb.value);
            periodsToExport = allTablePeriods.filter(p => checkedMese.includes(p));
        }

        const checkedPlants = Array.from(document.querySelectorAll('.chk-impianto:checked')).map(cb => cb.value);
        const exportPlants = allTablePlants.filter(p => checkedPlants.includes(p));

        const matrixData = {};
        periodsToExport.forEach(p => {
            matrixData[p] = {};
            exportPlants.forEach(pName => { matrixData[p][pName] = 0; });
        });

        APP_DATA.production.forEach(row => {
            const p = String(row.period);
            const pName = getPlantDisplay(row);
            if (matrixData[p] && matrixData[p].hasOwnProperty(pName)) {
                matrixData[p][pName] += (row.kwh || 0);
            }
        });

        const headers = ['Mese/Anno', ...exportPlants.map(p => `${p} (${window.getPlantMeter(p) || ''})`), 'Totale (kWh)'];
        const exportRows = [];
        const colSums = {};
        exportPlants.forEach(p => colSums[p] = 0);
        let grandTotal = 0;

        periodsToExport.forEach(period => {
            let rowKwh = 0;
            const rowData = [period];
            exportPlants.forEach(pName => {
                const val = matrixData[period][pName] || 0;
                rowKwh += val;
                colSums[pName] += val;
                rowData.push(Math.round(val));
            });
            grandTotal += rowKwh;
            rowData.push(Math.round(rowKwh));
            exportRows.push(rowData);
        });

        exportRows.push(['TOTALI', ...exportPlants.map(p => Math.round(colSums[p])), Math.round(grandTotal)]);

        const filename = `Energia_Iniettata_${periodExportMode}_${currentYear}${currentMonth}`;
        if (type === 'excel') {
            const ws = XLSX.utils.aoa_to_sheet([headers, ...exportRows]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Energia Iniettata");
            XLSX.writeFile(wb, `${filename}.xlsx`);
        } else if (type === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('landscape');
            doc.text(`Energia Iniettata (Cosern/Neoenergia) - ${periodExportMode}`, 14, 15);
            doc.autoTable({ 
                head: [headers], 
                body: exportRows, 
                startY: 20, 
                styles: { fontSize: 8 }, 
                headStyles: { fillColor: [59, 130, 246] } 
            });
            doc.save(`${filename}.pdf`);
        }
    };
});

// ==========================================
// 7. COMPARATORE ENERGIA INIETTATA LOGIC
// ==========================================
if (typeof db !== 'undefined') {
    db.ref('settings/comparatoreProduzione').on('value', snap => {
        const isVisible = !!snap.val();
        const icon = document.getElementById('comparatore-eye-icon');
        const toggleBtn = document.getElementById('toggle-comparatore-btn');
        const card = document.getElementById('comparatore-kpi-card');
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

window.toggleComparatoreVisibility = function() {
    if (typeof db === 'undefined') return;
    db.ref('settings/comparatoreProduzione').once('value').then(snap => {
        const current = !!snap.val();
        db.ref('settings/comparatoreProduzione').set(!current);
    });
};

window.openComparatoreModal = function() {
    const dash = document.getElementById('dashboard-content');
    const comp = document.getElementById('comparatore-content');
    if (dash) dash.style.display = 'none';
    if (comp) comp.style.display = 'block';
    window.scrollTo(0, 0);
    setTimeout(() => {
        try {
            updateComparatorePeriodValues();
            if (window.renderComparatoreTable) window.renderComparatoreTable();
        } catch (err) {
            console.error("Errore comparatore:", err);
        }
    }, 50);
};

window.closeComparatoreModal = function() {
    const dash = document.getElementById('dashboard-content');
    const comp = document.getElementById('comparatore-content');
    if (dash) dash.style.display = 'block';
    if (comp) comp.style.display = 'none';
    window.scrollTo(0, 0);
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

    const years = (typeof window.getAvailableYears === 'function') ? window.getAvailableYears().filter(y => Number(y) >= 2026) : ['2028', '2027', '2026'];
    const months = (typeof window.getAvailableMonths === 'function') ? window.getAvailableMonths() : ['08/2026', '07/2026', '06/2026'];

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

        if (years.includes('2026') && years.includes('2027')) {
            y1Select.value = '2026';
            y2Select.value = '2027';
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

        if (months.includes('06/2026') && months.includes('07/2026')) {
            m1Select.value = '06/2026';
            m2Select.value = '07/2026';
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
    const allPlants = window.PLANT_ORDER.slice();
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
        }

        if (summaryKpi) {
            summaryKpi.style.display = 'flex';
            document.getElementById('kpi-y1-label').textContent = `Anno ${y1}:`;
            document.getElementById('kpi-y1-val').textContent = formatNumber(totalY1) + ' kWh';
            document.getElementById('kpi-y2-label').textContent = `Anno ${y2}:`;
            document.getElementById('kpi-y2-val').textContent = formatNumber(totalY2) + ' kWh';

            const badge = document.getElementById('kpi-diff-badge');
            badge.textContent = `${diffKwh >= 0 ? '+' : ''}${formatNumber(diffKwh)} kWh (${diffPctStr})`;
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
            const labels = allPlants.slice();
            const dataY1 = allPlants.map(pName => {
                return APP_DATA.production
                    .filter(r => getPlantDisplay(r) === pName && String(r.period).endsWith('/' + y1))
                    .reduce((sum, r) => sum + (r.kwh || 0), 0);
            });
            const dataY2 = allPlants.map(pName => {
                return APP_DATA.production
                    .filter(r => getPlantDisplay(r) === pName && String(r.period).endsWith('/' + y2))
                    .reduce((sum, r) => sum + (r.kwh || 0), 0);
            });

            comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels,
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
                                offset: 4,
                                color: () => (document.body.classList.contains('theme-light') || document.documentElement.getAttribute('data-theme') === 'light') ? '#1d4ed8' : '#93c5fd',
                                font: { weight: 'bold', size: 11 },
                                formatter: function(value) {
                                    if (!value || value === 0) return '';
                                    return formatNumber(value) + ' kWh';
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
                                offset: 4,
                                color: () => (document.body.classList.contains('theme-light') || document.documentElement.getAttribute('data-theme') === 'light') ? '#047857' : '#6ee7b7',
                                font: { weight: 'bold', size: 11 },
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
                                    return `${formatNumber(v2)} kWh${pctText}`;
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
                            grace: '20%',
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            title: { display: true, text: 'kWh', color: '#94a3b8' }
                        },
                        x: { grid: { color: 'rgba(255,255,255,0.05)' } }
                    },
                    plugins: {
                        legend: { 
                            display: true,
                            labels: { color: () => (document.body.classList.contains('theme-light') || document.documentElement.getAttribute('data-theme') === 'light') ? '#0f172a' : '#fff', font: { weight: 'bold' } }
                        }
                    }
                }
            });
        } else {
            // viewMode === 'by_month'
            const is2026Involved = (y1 === '2026' || y2 === '2026');
            const monthLabels = is2026Involved 
                ? ['Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
                : ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
            const monthNums = is2026Involved
                ? ['06', '07', '08', '09', '10', '11', '12']
                : ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

            const dataY1 = monthNums.map(m => {
                const targetPeriod = `${m}/${y1}`;
                return APP_DATA.production
                    .filter(r => String(r.period) === targetPeriod)
                    .reduce((sum, r) => sum + (r.kwh || 0), 0);
            });
            const dataY2 = monthNums.map(m => {
                const targetPeriod = `${m}/${y2}`;
                return APP_DATA.production
                    .filter(r => String(r.period) === targetPeriod)
                    .reduce((sum, r) => sum + (r.kwh || 0), 0);
            });

            comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [
                        { label: `Anno ${y1}`, data: dataY1, backgroundColor: '#3b82f6', borderColor: '#2563eb', borderWidth: 1 },
                        { label: `Anno ${y2}`, data: dataY2, backgroundColor: '#10b981', borderColor: '#059669', borderWidth: 1 }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                        x: { grid: { color: 'rgba(255,255,255,0.05)' } }
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
        }

        if (summaryKpi) {
            summaryKpi.style.display = 'flex';
            document.getElementById('kpi-y1-label').textContent = `${m1}:`;
            document.getElementById('kpi-y1-val').textContent = formatNumber(totalM1) + ' kWh';
            document.getElementById('kpi-y2-label').textContent = `${m2}:`;
            document.getElementById('kpi-y2-val').textContent = formatNumber(totalM2) + ' kWh';

            const badge = document.getElementById('kpi-diff-badge');
            badge.textContent = `${diffKwh >= 0 ? '+' : ''}${formatNumber(diffKwh)} kWh (${diffPctStr})`;
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

        const labels = allPlants.slice();
        const dataM1 = allPlants.map(pName => {
            return APP_DATA.production
                .filter(r => getPlantDisplay(r) === pName && String(r.period) === m1)
                .reduce((sum, r) => sum + (r.kwh || 0), 0);
        });
        const dataM2 = allPlants.map(pName => {
            return APP_DATA.production
                .filter(r => getPlantDisplay(r) === pName && String(r.period) === m2)
                .reduce((sum, r) => sum + (r.kwh || 0), 0);
        });

        comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: `${m1}`, data: dataM1, backgroundColor: '#3b82f6', borderColor: '#2563eb', borderWidth: 1 },
                    { label: `${m2}`, data: dataM2, backgroundColor: '#10b981', borderColor: '#059669', borderWidth: 1 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { color: 'rgba(255,255,255,0.05)' } }
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
        let matches = false;
        if (type === 'year') {
            matches = String(row.period).endsWith('/' + periodVal);
        } else {
            matches = String(row.period) === periodVal;
        }
        if (matches) {
            const pName = getPlantDisplay(row);
            if (!impiantiData[pName]) impiantiData[pName] = 0;
            impiantiData[pName] += (row.kwh || 0);
        }
    });

    const labels = allPlants.slice();
    const dataPoints = allPlants.map(pName => impiantiData[pName] || 0);
    const colors = allPlants.map((pName, idx) => window.getUsinaColor(pName, idx));

    comparatoreChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels,
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
            layout: { padding: { top: 35 } },
            scales: {
                y: {
                    beginAtZero: true,
                    grace: '20%',
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: { display: true, text: 'kWh', color: '#94a3b8' }
                },
                x: { grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    offset: 4,
                    color: () => (document.body.classList.contains('theme-light') || document.documentElement.getAttribute('data-theme') === 'light') ? '#0f172a' : '#ffffff',
                    font: { weight: 'bold', size: 11 },
                    formatter: function(value) {
                        if (!value || value === 0) return '';
                        return formatNumber(value) + ' kWh';
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

    const allPlants = window.PLANT_ORDER.slice();

    const tAnnoMese = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang] && translations[currentLang]['comp_anno_mese']) || 'Anno / Mese';
    const tTotale = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang] && translations[currentLang]['comp_totale']) || 'Totale';
    const tVarYoY = (typeof translations !== 'undefined' && typeof currentLang !== 'undefined' && translations[currentLang] && translations[currentLang]['comp_var_yoy']) || 'Var. YoY';

    let thHtml = `<tr><th style="text-align: left; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2);">${tAnnoMese}</th>`;
    allPlants.forEach((p, idx) => {
        const uColor = window.getUsinaColor(p, idx);
        thHtml += `<th style="text-align: right; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2);"><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${uColor}; margin-right:5px;"></span>${p}</th>`;
    });
    thHtml += `<th style="text-align: right; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2); color: #3b82f6;">${tTotale}</th>`;
    thHtml += `<th style="text-align: right; padding: 10px; border-bottom: 2px solid rgba(255,255,255,0.2); color: #10b981;">${tVarYoY}</th></tr>`;
    thead.innerHTML = thHtml;

    const dataByYear = {};
    const availableYearsList = (typeof window.getAvailableYears === 'function') ? window.getAvailableYears() : ['2027', '2026'];
    availableYearsList.forEach(y => {
        dataByYear[y] = { total: {}, months: {} };
    });

    APP_DATA.production.forEach(row => {
        const p = getPlantDisplay(row);
        const period = String(row.period);
        if (!isPeriodValid(period)) return;
        const parts = period.split('/');
        if (parts.length < 2) return;
        const year = parts[1];

        if (!dataByYear[year]) {
            dataByYear[year] = { total: {}, months: {} };
        }
        if (!dataByYear[year].months[period]) {
            dataByYear[year].months[period] = {};
        }

        if (!dataByYear[year].total[p]) dataByYear[year].total[p] = 0;
        dataByYear[year].total[p] += (row.kwh || 0);

        if (!dataByYear[year].months[period][p]) dataByYear[year].months[period][p] = 0;
        dataByYear[year].months[period][p] += (row.kwh || 0);
    });

    const formatValue = (val) => val ? formatNumber(val) : '-';
    let tbHtml = '';

    const years = Object.keys(dataByYear).filter(y => Number(y) >= 2026).sort((a,b) => Number(b) - Number(a));

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

        const prevYear = String(Number(year) - 1);
        const prevTotal = yearTotals[prevYear] || 0;
        let yoyBadge = '<span style="color: #64748b;">-</span>';
        if (Number(year) > 2026 && prevTotal > 0 && yearTotalRow > 0) {
            const pct = ((yearTotalRow - prevTotal) / prevTotal) * 100;
            const sign = pct >= 0 ? '+' : '';
            const col = pct >= 0 ? '#10b981' : '#ef4444';
            yoyBadge = `<span style="color: ${col}; font-weight: bold;">${sign}${pct.toFixed(1)}%</span>`;
        } else if (Number(year) > 2026 && prevTotal === 0 && yearTotalRow > 0) {
            yoyBadge = `<span style="color: #10b981; font-weight: bold;">+100%</span>`;
        } else if (Number(year) > 2026 && prevTotal > 0 && yearTotalRow === 0) {
            yoyBadge = `<span style="color: #ef4444; font-weight: bold;">-100%</span>`;
        }

        tbHtml += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); font-weight: bold; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'" onclick="window.toggleYearRows('${year}')">
                <td style="text-align: left; padding: 10px; color: #3b82f6;"><i class="fa-solid fa-chevron-right" id="icon-year-${year}" style="margin-right: 8px; transition: transform 0.3s;"></i> ${year}</td>
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
    if (rows.length === 0) return;

    const isHidden = rows[0].style.display === 'none';
    rows.forEach(r => {
        r.style.display = isHidden ? 'table-row' : 'none';
    });

    if (icon) {
        icon.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
    }
};

window.addEventListener('themeChanged', () => {
    if (window.myChart) {
        window.myChart.update();
    }
    if (typeof updateComparatoreChart === 'function') {
        updateComparatoreChart();
    }
});

if (typeof MutationObserver !== 'undefined') {
    const themeObserver = new MutationObserver(() => {
        if (window.myChart) {
            window.myChart.update();
        }
        if (typeof updateComparatoreChart === 'function') {
            updateComparatoreChart();
        }
    });
    if (document.documentElement) {
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    }
    if (document.body) {
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
}
