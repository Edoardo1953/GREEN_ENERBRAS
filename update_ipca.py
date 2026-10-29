import re

with open('data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Pattern to update 09/2026
pattern = r'("period":\s*"09/2026",\s*"periodCode":\s*"Sep-26",\s*"tariff":\s*1\.04487662,\s*"inflation":\s*)[^,\s]+(,\s*"tariffIndex":\s*110\.73,\s*"inflationIndex":\s*)[^}\s]+'
def repl(m):
    return m.group(1) + '0.82' + m.group(2) + '110.47'

text, n = re.subn(pattern, repl, text)
if n > 0:
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Updated 09/2026 successfully in data.js.")
else:
    print("Pattern for 09/2026 not found.")
