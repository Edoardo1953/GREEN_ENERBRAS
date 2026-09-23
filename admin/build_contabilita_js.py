import json
import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CLEAN_RECORDS_PATH = os.path.join(SCRIPT_DIR, 'clean_records.json')
OUTPUT_JS_PATH = os.path.join(SCRIPT_DIR, 'contabilita_app.js')

with open(CLEAN_RECORDS_PATH, encoding='utf-8') as f:
    records = json.load(f)

# Filtra eventuali record vuoti
valid_records = [r for r in records if r.get('data') and r.get('anno')]
records_js = json.dumps(valid_records, ensure_ascii=False, indent=2)

if os.path.exists(OUTPUT_JS_PATH):
    with open(OUTPUT_JS_PATH, encoding='utf-8') as f:
        existing_code = f.read()
    # Replace CONTABILITA_RECORDS array
    pattern = r'(const CONTABILITA_RECORDS\s*=\s*)\[.*?\];'
    replacement = r'\g<1>' + records_js.replace('\\', '\\\\') + ';'
    new_code = re.sub(pattern, replacement, existing_code, flags=re.DOTALL)
    with open(OUTPUT_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(new_code)
    print(f"Successfully updated CONTABILITA_RECORDS in {OUTPUT_JS_PATH} from {CLEAN_RECORDS_PATH}!")
