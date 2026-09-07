document.addEventListener('DOMContentLoaded', () => {
    if (typeof APP_DATA === 'undefined' || !APP_DATA.cosernInflation) {
        console.error("Dati Cosern & Inflazione non trovati in APP_DATA.");
        return;
    }

    const data = APP_DATA.cosernInflation;
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl && APP_DATA.lastUpdated) {
        lastUpdatedEl.textContent = APP_DATA.lastUpdated;
    }

    // 1. Calculate & Populate KPIs
    if (data && data.length > 0) {
        const baseRow = data[0]; // Ago 2024
        const lastRow = data[data.length - 1]; // Latest available month

        // Find latest row with valid inflation data
        const latestInflationRow = [...data].reverse().find(r => r.inflationIndex !== null && r.inflationIndex !== undefined && !isNaN(r.inflationIndex)) || lastRow;

        const baseTariffEl = document.getElementById('kpi-base-tariff');
        if (baseTariffEl && baseRow.tariff !== null && baseRow.tariff !== undefined) {
            baseTariffEl.textContent = 'R$ ' + Number(baseRow.tariff).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        }

        const latestTariffValEl = document.getElementById('kpi-latest-tariff-val');
        const latestTariffPeriodEl = document.getElementById('kpi-latest-tariff-period');
        if (latestTariffValEl && lastRow.tariff !== null && lastRow.tariff !== undefined) {
            latestTariffValEl.textContent = 'R$ ' + Number(lastRow.tariff).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        }
        if (latestTariffPeriodEl && lastRow.period) {
            latestTariffPeriodEl.textContent = '(' + lastRow.period + ')';
        }

        // Cumulative Tariff Variation
        const tariffCumulIdxEl = document.getElementById('kpi-tariff-cumul-idx');
        const tariffCumulPctEl = document.getElementById('kpi-tariff-cumul-pct');
        if (lastRow.tariffIndex !== null && lastRow.tariffIndex !== undefined) {
            const tariffPctVar = Number(lastRow.tariffIndex) - 100;
            if (tariffCumulIdxEl) {
                tariffCumulIdxEl.textContent = Number(lastRow.tariffIndex).toFixed(2);
            }
            if (tariffCumulPctEl) {
                tariffCumulPctEl.textContent = (tariffPctVar >= 0 ? '+' : '') + tariffPctVar.toFixed(2) + '%';
            }
        }

        // Cumulative Inflation Variation (using latest available inflation data point)
        const inflCumulIdxEl = document.getElementById('kpi-infl-cumul-idx');
        const inflCumulPctEl = document.getElementById('kpi-infl-cumul-pct');
        if (latestInflationRow && latestInflationRow.inflationIndex !== null && latestInflationRow.inflationIndex !== undefined) {
            const inflPctVar = Number(latestInflationRow.inflationIndex) - 100;
            if (inflCumulIdxEl) {
                inflCumulIdxEl.textContent = Number(latestInflationRow.inflationIndex).toFixed(2);
            }
            if (inflCumulPctEl) {
                inflCumulPctEl.textContent = (inflPctVar >= 0 ? '+' : '') + inflPctVar.toFixed(2) + '%';
            }
        }
    }

    // 2. Populate Data Table
    const tbody = document.getElementById('cosern-table-body');
    if (tbody && data && data.length > 0) {
        tbody.innerHTML = '';
        data.forEach((row, idx) => {
            const tr = document.createElement('tr');
            
            let inflFormatted = '<span style="color:var(--text-muted);">-</span>';
            let inflColor = 'var(--text-muted)';
            if (row.inflation !== null && row.inflation !== undefined && !isNaN(row.inflation)) {
                const inflNum = Number(row.inflation);
                inflFormatted = (inflNum >= 0 ? '+' : '') + inflNum.toFixed(2) + '%';
                inflColor = inflNum > 0 ? '#38bdf8' : (inflNum < 0 ? '#10b981' : 'var(--text-muted)');
            }

            const tariffFormatted = (row.tariff !== null && row.tariff !== undefined && !isNaN(row.tariff))
                ? ('R$ ' + Number(row.tariff).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 6 }))
                : '-';

            const tariffIdxBadge = (row.tariffIndex !== null && row.tariffIndex !== undefined && !isNaN(row.tariffIndex))
                ? `<span class="cosern-badge-tariff">${Number(row.tariffIndex).toFixed(2)}</span>`
                : '<span style="color:var(--text-muted);">-</span>';

            const inflIdxBadge = (row.inflationIndex !== null && row.inflationIndex !== undefined && !isNaN(row.inflationIndex))
                ? `<span class="cosern-badge-infl">${Number(row.inflationIndex).toFixed(2)}</span>`
                : '<span style="color:var(--text-muted);">-</span>';
            
            tr.innerHTML = `
                <td style="text-align: left; font-weight: 600; color: var(--text-main); font-size: 0.8rem;">
                    ${idx === 0 ? '<span style="color:#f59e0b; margin-right:2px;">★</span>' : ''}${row.period || ''}
                </td>
                <td style="font-family: monospace; font-size: 0.82rem;" title="${row.tariff !== null ? row.tariff : ''}">
                    ${tariffFormatted}
                </td>
                <td style="font-weight: 600; font-size: 0.8rem; color: ${inflColor};">
                    ${inflFormatted}
                </td>
                <td>
                    ${tariffIdxBadge}
                </td>
                <td>
                    ${inflIdxBadge}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 3. Render Chart
    const ctx = document.getElementById('cosernInflationChart');
    if (ctx && data && data.length > 0) {
        const labels = data.map(d => d.period);
        const tariffIndices = data.map(d => d.tariffIndex !== null && d.tariffIndex !== undefined ? Number(d.tariffIndex) : null);
        const inflationIndices = data.map(d => d.inflationIndex !== null && d.inflationIndex !== undefined ? Number(d.inflationIndex) : null);

        window.cosernChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Indice Tariffa Cosern',
                        data: tariffIndices,
                        borderColor: '#f43f5e',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#f43f5e',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 1.5,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        tension: 0.2,
                        spanGaps: true,
                        fill: false
                    },
                    {
                        label: 'Indice Inflazione (IPCA)',
                        data: inflationIndices,
                        borderColor: '#0284c7',
                        backgroundColor: 'rgba(2, 132, 199, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#38bdf8',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 1.5,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        tension: 0.2,
                        spanGaps: true,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    datalabels: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f8fafc',
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 1,
                        callbacks: {
                            title: function(tooltipItems) {
                                if (!tooltipItems || tooltipItems.length === 0) return '';
                                const idx = tooltipItems[0].dataIndex;
                                return 'Periodo: ' + (data[idx] ? data[idx].period : '');
                            },
                            afterTitle: function(tooltipItems) {
                                if (!tooltipItems || tooltipItems.length === 0) return [];
                                const idx = tooltipItems[0].dataIndex;
                                const row = data[idx];
                                const details = [];
                                if (row && row.tariff !== null && row.tariff !== undefined) {
                                    details.push('Tariffa Cosern: R$ ' + Number(row.tariff).toFixed(4) + '/kWh');
                                }
                                if (row && row.inflation !== null && row.inflation !== undefined) {
                                    const inf = Number(row.inflation);
                                    details.push('Inflazione Mensile IPCA: ' + (inf >= 0 ? '+' : '') + inf.toFixed(2) + '%');
                                }
                                return details;
                            },
                            label: function(context) {
                                if (context.parsed.y === null || context.parsed.y === undefined) return '';
                                return context.dataset.label + ': ' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.06)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        min: 98,
                        max: 112,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.08)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            stepSize: 2,
                            callback: function(value) {
                                return value.toFixed(1);
                            }
                        },
                        title: {
                            display: true,
                            text: 'Indice (Base 100 = Ago 2024)',
                            color: '#94a3b8',
                            font: { size: 12, weight: '600' }
                        }
                    }
                }
            }
        });
    }
});

// Export Excel Function
function exportCosernExcel() {
    if (typeof APP_DATA === 'undefined' || !APP_DATA.cosernInflation) return;
    
    const rows = APP_DATA.cosernInflation.map(r => ({
        'Mese / Anno': r.period,
        'Tariffa Cosern (R$/kWh)': r.tariff !== null ? r.tariff : '',
        'Inflazione Mensile % (IPCA)': r.inflation !== null ? (r.inflation / 100) : '',
        'Indice Tariffa Cosern (Base 100 Ago 24)': r.tariffIndex !== null ? r.tariffIndex : '',
        'Indice Inflazione (Base 100 Ago 24)': r.inflationIndex !== null ? r.inflationIndex : ''
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    
    // Auto column widths
    ws['!cols'] = [
        { wch: 14 },
        { wch: 22 },
        { wch: 24 },
        { wch: 28 },
        { wch: 28 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cosern_vs_Inflazione");
    XLSX.writeFile(wb, "Cosern_Prezzi_Energia_Inflazione.xlsx");
}

// Export PDF Function
function exportCosernPDF() {
    if (typeof APP_DATA === 'undefined' || !APP_DATA.cosernInflation) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');

    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("GREEN ENERBRAS ONE - Prezzi Energia e Inflazione", 40, 40);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Rapporto dinamico: Tariffa Cosern vs Indice Inflazione (IPCA) | Base 100 = Ago 2024", 40, 58);

    const headers = [["Mese / Anno", "Tariffa (R$/kWh)", "Inflazione % (IPCA)", "Indice Tariffa", "Indice Inflazione"]];
    const tableData = APP_DATA.cosernInflation.map(r => [
        r.period,
        r.tariff !== null ? r.tariff.toFixed(6) : '-',
        r.inflation !== null ? ((r.inflation >= 0 ? '+' : '') + r.inflation.toFixed(2) + '%') : '-',
        r.tariffIndex !== null ? r.tariffIndex.toFixed(2) : '-',
        r.inflationIndex !== null ? r.inflationIndex.toFixed(2) : '-'
    ]);

    doc.autoTable({
        head: headers,
        body: tableData,
        startY: 75,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
        styles: { fontSize: 8, cellPadding: 4, halign: 'right' },
        columnStyles: {
            0: { halign: 'left', fontStyle: 'bold' },
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right', fontStyle: 'bold', textColor: [244, 63, 94] },
            4: { halign: 'right', fontStyle: 'bold', textColor: [2, 132, 199] }
        }
    });

    doc.save("Cosern_Prezzi_Energia_Inflazione.pdf");
}

// Export Chart Image
function exportChartImage() {
    const canvas = document.getElementById('cosernInflationChart');
    if (!canvas) return;
    const imageURI = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'Grafico_Cosern_vs_Inflazione.png';
    link.href = imageURI;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
