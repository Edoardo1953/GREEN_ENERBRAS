import openpyxl
import json
import re
import datetime
import os
import sys

def eval_excel_expr(expr, row_montant, row_tva, rate_tva=0.17):
    if expr is None:
        return 0.0
    if isinstance(expr, (int, float)):
        return float(expr)
    s = str(expr).strip()
    if not s:
        return 0.0
    if not s.startswith('='):
        try:
            return float(s.replace(',', '.'))
        except:
            return 0.0
            
    formula = s[1:].strip().upper()
    # Replace $P$5 or P5 with rate_tva
    formula = re.sub(r'\$?P\$?5\b', str(rate_tva), formula)
    
    # Replace SUM(Oxx:Oyy)
    def repl_sum_o(m):
        start = int(m.group(1))
        end = int(m.group(2))
        return '(' + str(sum(row_montant.get(i, 0.0) for i in range(start, end + 1))) + ')'
    formula = re.sub(r'SUM\(O(\d+):O(\d+)\)', repl_sum_o, formula)

    # Replace SUM(Pxx:Pyy)
    def repl_sum_p(m):
        start = int(m.group(1))
        end = int(m.group(2))
        return '(' + str(sum(row_tva.get(i, 0.0) for i in range(start, end + 1))) + ')'
    formula = re.sub(r'SUM\(P(\d+):P(\d+)\)', repl_sum_p, formula)

    # Replace Oxx
    def repl_o(m):
        idx = int(m.group(1))
        return '(' + str(row_montant.get(idx, 0.0)) + ')'
    formula = re.sub(r'O(\d+)', repl_o, formula)

    # Replace Pxx
    def repl_p(m):
        idx = int(m.group(1))
        return '(' + str(row_tva.get(idx, 0.0)) + ')'
    formula = re.sub(r'P(\d+)', repl_p, formula)

    try:
        if re.match(r'^[0-9\.\+\-\*\/\(\)\s]+$', formula):
            return float(eval(formula))
    except Exception:
        pass
    return 0.0

def extract_bank_transactions(project_dir):
    search_paths = [
        os.path.join(project_dir, 'uploads', 'CONTABILITA Green Enerbras One SCSp.xlsx'),
        os.path.join(project_dir, 'CONTABILITA Green Enerbras One SCSp.xlsx'),
        os.path.join(os.path.expanduser('~'), 'Desktop', 'CONTABILITA Green Enerbras One SCSp.xlsx'),
        os.path.join(os.path.expanduser('~'), 'OneDrive', 'Desktop', 'CONTABILITA Green Enerbras One SCSp.xlsx')
    ]

    xlsx_path = None
    for p in search_paths:
        if os.path.exists(p):
            xlsx_path = p
            break

    if not xlsx_path:
        print("File CONTABILITA non trovato.", file=sys.stderr)
        return None

    wb = openpyxl.load_workbook(xlsx_path, data_only=False)
    sheet_name = None
    for name in wb.sheetnames:
        if ('compte' in name.lower() and 'banque' in name.lower()) or 'banque' in name.lower():
            sheet_name = name
            break

    if not sheet_name:
        sheet_name = wb.sheetnames[0]

    ws = wb[sheet_name]

    # Read VAT rate from P5
    rate_tva = 0.17
    try:
        if ws['P5'].value is not None:
            rate_tva = float(ws['P5'].value)
    except:
        rate_tva = 0.17

    txs = []
    row_montant = {}
    row_tva = {}
    row_total = {}

    for r in range(7, ws.max_row + 1):
        raw_date = ws.cell(r, 3).value
        statut = ws.cell(r, 8).value
        cat = ws.cell(r, 9).value
        desc = ws.cell(r, 10).value
        ordinante = ws.cell(r, 11).value
        partner = ws.cell(r, 12).value
        beneficiario = ws.cell(r, 13).value
        m_val = ws.cell(r, 15).value
        p_val = ws.cell(r, 16).value

        # Parse Montant (Col O)
        m_num = eval_excel_expr(m_val, row_montant, row_tva, rate_tva)
        row_montant[r] = m_num

        # Parse TVA (Col P)
        p_num = eval_excel_expr(p_val, row_montant, row_tva, rate_tva)
        row_tva[r] = p_num

        # Total amount
        tot_num = m_num + p_num
        row_total[r] = tot_num

        # Format date
        formatted_date = ''
        if hasattr(raw_date, 'strftime'):
            formatted_date = raw_date.strftime('%d/%m/%Y')
        elif isinstance(raw_date, (int, float)):
            dt = datetime.datetime(1899, 12, 30) + datetime.timedelta(days=raw_date)
            formatted_date = dt.strftime('%d/%m/%Y')
        elif raw_date:
            formatted_date = str(raw_date).strip()

        if r == 7:
            cat = 'Saldo iniziale'
            formatted_date = ''
            desc = ''
            partner = ''
            tot_num = 0.0
        else:
            if not formatted_date:
                continue
            if str(statut).strip().upper() == 'NON':
                continue

        # Partner resolution: Partner -> Beneficiario -> Ordinante
        partner_final = partner if (partner and str(partner).strip()) else (
            beneficiario if (beneficiario and str(beneficiario).strip()) else (
                ordinante if (ordinante and str(ordinante).strip()) else ''
            )
        )

        txs.append({
            'date': formatted_date,
            'category': str(cat).strip() if cat else '',
            'description': str(desc).strip() if desc else '',
            'partner': str(partner_final).strip(),
            'amount': round(tot_num, 4)
        })

    try:
        sync_comptab_records(project_dir, wb)
    except Exception as e:
        print(f"Warning sync COMPTAB: {e}", file=sys.stderr)

    return txs

def format_iso_date(raw_date):
    if hasattr(raw_date, 'strftime'):
        return raw_date.strftime('%Y-%m-%d')
    elif isinstance(raw_date, (int, float)):
        dt = datetime.datetime(1899, 12, 30) + datetime.timedelta(days=raw_date)
        return dt.strftime('%Y-%m-%d')
    elif raw_date:
        s = str(raw_date).strip()
        if re.match(r'^\d{2}/\d{2}/\d{4}$', s):
            parts = s.split('/')
            return f"{parts[2]}-{parts[1]}-{parts[0]}"
        return s[:10]
    return ''

def eval_comptab_expr(expr, col_i, col_j, col_k):
    if expr is None:
        return 0.0
    if isinstance(expr, (int, float)):
        return float(expr)
    s = str(expr).strip()
    if not s:
        return 0.0
    if not s.startswith('='):
        try:
            return float(s.replace(',', '.'))
        except:
            return 0.0
    formula = s[1:].strip().upper()
    def repl_sum_i(m):
        start, end = int(m.group(1)), int(m.group(2))
        return '(' + str(sum(col_i.get(idx, 0.0) for idx in range(start, end + 1))) + ')'
    formula = re.sub(r'SUM\(I(\d+):I(\d+)\)', repl_sum_i, formula)
    formula = re.sub(r'I(\d+)', lambda m: '(' + str(col_i.get(int(m.group(1)), 0.0)) + ')', formula)
    formula = re.sub(r'J(\d+)', lambda m: '(' + str(col_j.get(int(m.group(1)), 0.0)) + ')', formula)
    formula = re.sub(r'K(\d+)', lambda m: '(' + str(col_k.get(int(m.group(1)), 0.0)) + ')', formula)
    try:
        if re.match(r'^[0-9\.\+\-\*\/\(\)\s]+$', formula):
            return float(eval(formula))
    except Exception:
        pass
    return 0.0

def sync_comptab_records(project_dir, wb):
    if 'COMPTAB' not in wb.sheetnames:
        return
    ws = wb['COMPTAB']
    admin_dir = os.path.join(project_dir, 'admin')
    clean_path = os.path.join(admin_dir, 'clean_records.json')
    data_json_path = os.path.join(admin_dir, 'contabilita_data.json')
    js_path = os.path.join(admin_dir, 'contabilita_app.js')
    if not os.path.exists(clean_path):
        return

    with open(clean_path, encoding='utf-8') as f:
        existing_records = json.load(f)

    # Keep the first 63 records (rows 2..66 of COMPTAB) and the 4 trailing accrual/TVA records
    base_records = existing_records[:63]
    trailing_records = [
        r for r in existing_records[63:]
        if r.get('pcnCode') == '4720000' or (r.get('pcnCode') == '6511200' and r.get('fattura') in ('013/2026', '014/2026'))
    ]

    col_i, col_j, col_k = {}, {}, {}
    for r in range(2, ws.max_row + 1):
        i_val = eval_comptab_expr(ws.cell(r, 9).value, col_i, col_j, col_k)
        col_i[r] = i_val
        j_val = eval_comptab_expr(ws.cell(r, 10).value, col_i, col_j, col_k)
        col_j[r] = j_val
        k_val = eval_comptab_expr(ws.cell(r, 11).value, col_i, col_j, col_k)
        col_k[r] = k_val

    extra_records = []
    for r in range(67, ws.max_row + 1):
        paye = str(ws.cell(r, 24).value or '').strip().upper()
        if paye != 'OUI':
            continue
        d_str = format_iso_date(ws.cell(r, 1).value)
        v_str = format_iso_date(ws.cell(r, 2).value) or d_str
        if not d_str:
            continue
        anno_val = int(v_str[:4]) if len(v_str) >= 4 and v_str[:4].isdigit() else 2026
        mese_val = int(v_str[5:7]) if len(v_str) >= 7 and v_str[5:7].isdigit() else 1
        comp_raw = ws.cell(r, 5).value
        try:
            comp_val = int(comp_raw) if comp_raw is not None else anno_val
        except:
            comp_val = anno_val

        imp_val = round(col_i.get(r, 0.0), 2)
        tva_perc = round(col_j.get(r, 0.0), 4)
        tva_val = round(col_k.get(r, 0.0), 2)
        tot_val = round(eval_comptab_expr(ws.cell(r, 12).value, col_i, col_j, col_k), 2)
        if tot_val == 0.0 and imp_val != 0.0:
            tot_val = imp_val

        tipo = str(ws.cell(r, 14).value or 'PP').strip()
        ap = str(ws.cell(r, 15).value or '').strip()
        classe = str(ws.cell(r, 16).value or '').strip()
        tipologia = str(ws.cell(r, 17).value or '').strip()
        pcn_code = tipologia.split(' - ')[0].strip() if ' - ' in tipologia else tipologia
        desc = str(ws.cell(r, 19).value or '').strip()
        fattura = str(ws.cell(r, 20).value or '-').strip() or '-'
        partner = str(ws.cell(r, 21).value or '').strip()
        is_offset = (desc.lower() == 'remboursement des frais') or (pcn_code == '6188000' and abs(tot_val) >= 1000.0)

        extra_records.append({
            "data": d_str,
            "valuta": v_str,
            "mese": mese_val,
            "anno": anno_val,
            "competenza": comp_val,
            "imp": imp_val,
            "tvaPerc": tva_perc,
            "tva": tva_val,
            "totale": tot_val,
            "tipo": tipo,
            "ap": ap,
            "classe": classe,
            "tipologia": tipologia,
            "pcnCode": pcn_code,
            "desc": desc,
            "partner": partner,
            "fattura": fattura,
            "paye": paye,
            "isInternalOffset": is_offset
        })

    updated_records = base_records + extra_records + trailing_records
    records_js = json.dumps(updated_records, ensure_ascii=False, indent=2)

    with open(clean_path, 'w', encoding='utf-8') as f:
        f.write(records_js)
    if os.path.exists(data_json_path):
        with open(data_json_path, 'w', encoding='utf-8') as f:
            f.write(records_js)

    if os.path.exists(js_path):
        with open(js_path, encoding='utf-8') as f:
            existing_code = f.read()
        pattern = r'(const CONTABILITA_RECORDS\s*=\s*)\[.*?\];'
        replacement = r'\g<1>' + records_js.replace('\\', '\\\\') + ';'
        new_code = re.sub(pattern, replacement, existing_code, flags=re.DOTALL)
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(new_code)

if __name__ == '__main__':
    project_dir = os.path.dirname(os.path.abspath(__file__))
    if len(sys.argv) > 1:
        project_dir = sys.argv[1]
    
    txs = extract_bank_transactions(project_dir)
    if txs is not None:
        print(json.dumps(txs, ensure_ascii=False, indent=2))

