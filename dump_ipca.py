import re

with open('data.js', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'"cosernInflation":\s*(\[.*?\])', text, re.DOTALL)
if m:
    array_str = m.group(1)
    print(array_str[-1000:])
else:
    print("Not found")
