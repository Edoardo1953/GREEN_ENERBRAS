import json, re

with open('data.js', 'r', encoding='utf-8') as f:
    text = f.read()

m = re.search(r'"cosernInflation":\s*(\[\s*\{.*?\}\s*\])', text, re.DOTALL)
if m:
    data = json.loads(m.group(1))
    print("Total rows:", len(data))
    print("First 3:", data[:3])
    print("Last 5:", data[-5:])
