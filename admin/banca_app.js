document.addEventListener('DOMContentLoaded', () => {
    if (typeof APP_DATA === 'undefined') {
        console.error("Dati non trovati. Esegui update_data.ps1 per generare data.js");
        return;
    }

    const formatCurrency = (num) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(num);

    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl && APP_DATA.lastUpdated) {
        lastUpdatedEl.textContent = APP_DATA.lastUpdated;
    }

    // 1. Calculate Bank Balances
    let currentBalance = 0;
    let generalExpenses = 0;
    let participationFees = 0;
    let lastDate = '';
    
    if (APP_DATA.transactions && APP_DATA.transactions.length > 0) {
        const lastTx = APP_DATA.transactions[APP_DATA.transactions.length - 1];
        if (lastTx && lastTx.date) lastDate = lastTx.date;

        APP_DATA.transactions.forEach(t => {
            currentBalance += t.amount;
            
            const catLower = (t.category || '').toLowerCase();
            const isExpense = ['frais', 'fee', 'cost', 'spes', 'altro', 'other', 'tax', 'impost', 'commission'].some(k => catLower.includes(k));
            
            if (isExpense) {
                if (catLower.includes('entry fee') || catLower.includes('participation fee')) {
                    participationFees += t.amount;
                } else {
                    generalExpenses += t.amount;
                }
            }
        });
    }

    // 2. Popola KPIs
    const balanceKpi = document.getElementById('kpi-balance');
    if(balanceKpi) {
        balanceKpi.textContent = formatCurrency(currentBalance);
        if(currentBalance < 0) {
            balanceKpi.classList.remove('text-green');
            balanceKpi.style.color = '#ef4444';
        }
    }

    const lastDateKpi = document.getElementById('kpi-last-date');
    if (lastDateKpi && lastDate) lastDateKpi.innerHTML = `<span data-i18n="text_al">al:</span> ${lastDate}`;
    
    const generalExpensesKpi = document.getElementById('kpi-general-expenses');
    if(generalExpensesKpi) generalExpensesKpi.textContent = formatCurrency(generalExpenses);

    const participationFeesKpi = document.getElementById('kpi-participation-fees');
    if(participationFeesKpi) participationFeesKpi.textContent = formatCurrency(participationFees);

    // 3. Popola Tabella Bank Movements
    const bankTableBody = document.getElementById('bank-table-body');
    if (bankTableBody && APP_DATA.transactions) {
        
        // Pre-calculate progressive
        let runningBalance = 0;
        APP_DATA.transactions.forEach(t => {
            runningBalance += t.amount;
            t.actualProgressive = runningBalance;
        });

        const renderTable = () => {
            bankTableBody.innerHTML = '';
            
            const filterYear = document.getElementById('filter-year')?.value || '';
            const filterMonth = document.getElementById('filter-month')?.value || '';
            const filterCat = Array.from(document.querySelectorAll('#ms-category .multiselect-checkbox:checked')).map(cb => cb.value.toLowerCase());
            const filterDesc = (document.getElementById('filter-desc')?.value || '').toLowerCase();
            const filterPartner = Array.from(document.querySelectorAll('#ms-partner .multiselect-checkbox:checked')).map(cb => cb.value.toLowerCase());
            
            const isFiltered = filterYear !== '' || filterMonth !== '' || filterCat.length > 0 || filterDesc !== '' || filterPartner.length > 0;
            const colProgressivo = document.getElementById('col-progressivo');
            if (colProgressivo) {
                colProgressivo.style.display = isFiltered ? 'none' : 'table-cell';
            }
            
            let subtotal = 0;
            window.currentFilteredData = []; // Store filtered data for export
            const filteredTransactions = window.currentFilteredData;
            
            APP_DATA.transactions.forEach(t => {
                if (filterYear || filterMonth) {
                    if (!t.date) return;
                    const parts = t.date.split('/');
                    if (parts.length === 3) {
                        if (filterYear && parts[2] !== filterYear) return;
                        if (filterMonth && parts[1] !== filterMonth) return;
                    } else {
                        return;
                    }
                }
                if (filterCat.length > 0 && !filterCat.includes(t.category.toLowerCase())) return;
                if (filterDesc && !t.description.toLowerCase().includes(filterDesc)) return;
                const p = (t.partner || '').toLowerCase();
                if (filterPartner.length > 0 && !filterPartner.includes(p)) return;
                
                filteredTransactions.push(t);
                subtotal += t.amount;
                
                const tr = document.createElement('tr');
                const isNegative = t.amount < 0;
                const amountColor = isNegative ? '#ef4444' : '#10b981';
                const progressiveColor = t.actualProgressive < 0 ? '#ef4444' : '#3b82f6';
                const relatedEntity = t.partner;
                
                tr.innerHTML = `
                    <td style="white-space: nowrap;">${t.date}</td>
                    <td><span class="badge" style="background: rgba(255,255,255,0.1);">${t.category}</span></td>
                    <td>${t.description}</td>
                    <td>${relatedEntity || '-'}</td>
                    <td class="text-bold" style="text-align: right; color: ${amountColor};">${formatCurrency(t.amount)}</td>
                    ${isFiltered ? '' : `<td class="text-bold" style="text-align: right; color: ${progressiveColor};">${formatCurrency(t.actualProgressive)}</td>`}
                `;
                bankTableBody.appendChild(tr);
            });

            const subtotalEl = document.getElementById('subtotal-amount');
            if (subtotalEl) {
                subtotalEl.textContent = formatCurrency(subtotal);
                subtotalEl.style.color = subtotal < 0 ? '#ef4444' : '#10b981';
            }
        };

        // Populate custom multiselects
        const catSet = new Set();
        const partnerSet = new Set();
        APP_DATA.transactions.forEach(t => {
            if (t.category) catSet.add(t.category);
            if (t.partner) partnerSet.add(t.partner);
        });
        
        const populateDropdown = (id, values) => {
            const dropdown = document.querySelector(`#${id} .multiselect-dropdown`);
            if (!dropdown) return;
            dropdown.innerHTML = '';
            values.forEach(v => {
                const label = document.createElement('label');
                label.style.display = 'flex';
                label.style.justifyContent = 'space-between';
                label.style.alignItems = 'center';
                label.style.padding = '0.3rem 0.5rem';
                label.style.cursor = 'pointer';
                label.style.borderRadius = '3px';
                label.innerHTML = `
                    <span style="flex:1;">${v}</span>
                    <input type="checkbox" class="multiselect-checkbox" value="${v}" style="margin-left: 10px; cursor: pointer;">
                `;
                label.addEventListener('mouseenter', () => label.style.background = 'rgba(255,255,255,0.05)');
                label.addEventListener('mouseleave', () => label.style.background = 'transparent');
                dropdown.appendChild(label);
            });
        };
        
        populateDropdown('ms-category', Array.from(catSet).sort());
        populateDropdown('ms-partner', Array.from(partnerSet).sort());
        
        // Setup dropdown toggles and listeners
        document.querySelectorAll('.custom-multiselect').forEach(ms => {
            const btn = ms.querySelector('.multiselect-btn');
            const dropdown = ms.querySelector('.multiselect-dropdown');
            const label = ms.querySelector('.multiselect-label');
            const defaultTextHTML = ms.id === 'ms-category' ? '<span data-i18n="filter_tutte">Tutte</span>' : '<span data-i18n="filter_tutti">Tutti</span>';
            
            // Insert clear button at the top of dropdown
            const resetBtn = document.createElement('div');
            resetBtn.style.padding = '0.5rem';
            resetBtn.style.cursor = 'pointer';
            resetBtn.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
            resetBtn.style.marginBottom = '0.5rem';
            resetBtn.style.color = '#9ca3af';
            resetBtn.style.textAlign = 'center';
            resetBtn.style.fontSize = '0.9rem';
            resetBtn.innerHTML = `<i class="fa-solid fa-filter-circle-xmark"></i> <span data-i18n="filter_rimuovi">Rimuovi Filtri</span>`;
            resetBtn.addEventListener('mouseenter', () => resetBtn.style.color = '#fff');
            resetBtn.addEventListener('mouseleave', () => resetBtn.style.color = '#9ca3af');
            resetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                ms.querySelectorAll('.multiselect-checkbox').forEach(cb => cb.checked = false);
                label.innerHTML = defaultTextHTML; if (typeof applyTranslations === "function") applyTranslations();
                renderTable();
                dropdown.style.display = 'none';
            });
            dropdown.insertBefore(resetBtn, dropdown.firstChild);
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close others
                document.querySelectorAll('.multiselect-dropdown').forEach(d => {
                    if(d !== dropdown) d.style.display = 'none';
                });
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });
            
            dropdown.addEventListener('click', (e) => e.stopPropagation());
            
            ms.querySelectorAll('.multiselect-checkbox').forEach(cb => {
                cb.addEventListener('change', () => {
                    const checked = ms.querySelectorAll('.multiselect-checkbox:checked');
                    if (checked.length === 0) {
                        label.innerHTML = defaultTextHTML; if (typeof applyTranslations === "function") applyTranslations();
                    } else if (checked.length === 1) {
                        label.textContent = checked[0].value;
                    } else {
                        label.innerHTML = `${checked.length} <span data-i18n="filter_selezionati">selezionati</span>`; if (typeof applyTranslations === "function") applyTranslations();
                    }
                    renderTable();
                });
            });
        });
        
        document.addEventListener('click', () => {
            document.querySelectorAll('.multiselect-dropdown').forEach(d => d.style.display = 'none');
        });

        // Add listeners to text inputs
        document.querySelectorAll('input.filter-input[type="text"]').forEach(input => {
            input.addEventListener('input', renderTable);
        });

        const yearSelect = document.getElementById('filter-year');
        if (yearSelect) {
            const yearSet = new Set();
            APP_DATA.transactions.forEach(t => {
                if (t.date) {
                    const parts = t.date.split('/');
                    if (parts.length === 3) yearSet.add(parts[2]);
                }
            });
            Array.from(yearSet).sort().forEach(y => {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                yearSelect.appendChild(opt);
            });
            yearSelect.addEventListener('change', renderTable);
        }
        
        const monthSelect = document.getElementById('filter-month');
        if (monthSelect) monthSelect.addEventListener('change', renderTable);

        renderTable();
        
        // --- LOGICA ESPORTAZIONE (EXCEL / PDF) ---
        window.exportData = function(type) {
            const period = document.getElementById('export-period').value;
            let dataToExport = [];
            
            // Determina mese/anno attuali (usiamo la data di oggi o l'ultima transazione)
            const today = new Date();
            const currentYear = today.getFullYear().toString();
            let currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
            
            if (period === 'filtered') {
                dataToExport = window.currentFilteredData || [];
            } else if (period === 'global') {
                dataToExport = APP_DATA.transactions;
            } else if (period === 'current_year') {
                dataToExport = APP_DATA.transactions.filter(t => t.date && t.date.endsWith('/' + currentYear));
            } else if (period === 'current_month') {
                dataToExport = APP_DATA.transactions.filter(t => t.date && t.date.includes('/' + currentMonth + '/' + currentYear));
                // Fallback logico: se non ci sono dati questo mese, potremmo avvisare l'utente o usare l'ultimo mese disponibile
                if (dataToExport.length === 0) {
                    alert("Nessun dato trovato per il mese in corso (" + currentMonth + "/" + currentYear + "). L'esportazione sarà vuota.");
                }
            }

            if (dataToExport.length === 0) {
                alert("Nessun dato da esportare con i filtri selezionati.");
                return;
            }

            // Prepara i dati in un formato piatto per le tabelle
            const exportRows = dataToExport.map(t => [
                t.date || '',
                t.category || '',
                t.description || '',
                t.partner || '',
                t.amount !== undefined ? t.amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
                t.actualProgressive !== undefined ? t.actualProgressive.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
            ]);

            const headers = ["Data", "Categoria", "Descrizione", "Partner", "Importo (€)", "Progressivo (€)"];
            
            const filename = `EstrattoConto_GreenEnerbras_${period}_${new Date().toISOString().slice(0,10)}`;

            if (type === 'excel') {
                // Generazione EXCEL tramite SheetJS
                if (typeof XLSX === 'undefined') {
                    alert("Libreria XLSX non caricata."); return;
                }
                const wsData = [headers, ...exportRows];
                const ws = XLSX.utils.aoa_to_sheet(wsData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Estratto Conto");
                XLSX.writeFile(wb, `${filename}.xlsx`);

            } else if (type === 'pdf') {
                // Generazione PDF tramite jsPDF e autotable
                if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
                    alert("Libreria jsPDF non caricata."); return;
                }
                const jsPDF = window.jspdf.jsPDF;
                const doc = new jsPDF({ orientation: 'landscape' });
                
                doc.setFontSize(18);
                doc.text("Estratto Conto - GREEN ENERBRAS ONE", 14, 20);
                doc.setFontSize(11);
                doc.setTextColor(100);
                doc.text(`Periodo: ${period.replace('_', ' ').toUpperCase()} | Generato il: ${new Date().toLocaleDateString('it-IT')}`, 14, 28);
                
                doc.autoTable({
                    startY: 35,
                    head: [headers],
                    body: exportRows,
                    theme: 'striped',
                    styles: { fontSize: 9 },
                    headStyles: { fillColor: [16, 185, 129] }, // text-green
                    columnStyles: {
                        4: { halign: 'right' },
                        5: { halign: 'right' }
                    }
                });

                doc.save(`${filename}.pdf`);
            }
        };
    }
});

