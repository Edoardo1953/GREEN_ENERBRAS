import re

with open('data.js', 'r', encoding='utf-8') as f:
    text = f.read()

# We need to replace:
# "period":  "08/2026",
# "periodCode":  "Aug-26",
# "tariff":  1.0347311,
# "inflation":  null,
# "tariffIndex":  109.65,
# "inflationIndex":  null

target_block = '''"period":  "08/2026",
                                "periodCode":  "Aug-26",
                                "tariff":  1.0347311,
                                "inflation":  null,
                                "tariffIndex":  109.65,
                                "inflationIndex":  null'''

new_block = '''"period":  "08/2026",
                                "periodCode":  "Aug-26",
                                "tariff":  1.0347311,
                                "inflation":  -0.40,
                                "tariffIndex":  109.65,
                                "inflationIndex":  109.48'''

if target_block in text:
    text = text.replace(target_block, new_block)
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Updated successfully via exact match.")
else:
    print("Target block not found exactly. Trying regex.")
    # Fallback to regex
    pattern = r'("period":\s*"08/2026",\s*"periodCode":\s*"Aug-26",\s*"tariff":\s*1\.0347311,\s*"inflation":\s*)null(,\s*"tariffIndex":\s*109\.65,\s*"inflationIndex":\s*)null'
    def repl(m):
        return m.group(1) + '-0.40' + m.group(2) + '109.48'
    text, n = re.subn(pattern, repl, text)
    if n > 0:
        with open('data.js', 'w', encoding='utf-8') as f:
            f.write(text)
        print("Updated successfully via regex.")
    else:
        print("Failed to find and replace.")
