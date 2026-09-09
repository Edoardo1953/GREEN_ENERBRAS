import re

with open('vendite_app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace open
open_pattern = re.compile(r'const modal = document.getElementById\(\'comparatoreModal\'\);\s*if \(modal\) \{\s*modal.style.display = \'flex\';')
open_repl = '''const dash = document.getElementById('dashboard-content');
        const comp = document.getElementById('comparatore-content');
        if (dash) dash.style.display = 'none';
        if (comp) comp.style.display = 'block';
        window.scrollTo(0,0);'''
js = open_pattern.sub(open_repl, js)

# Replace close
close_pattern = re.compile(r'const modal = document.getElementById\(\'comparatoreModal\'\);\s*if \(modal\) modal.style.display = \'none\';')
close_repl = '''const dash = document.getElementById('dashboard-content');
        const comp = document.getElementById('comparatore-content');
        if (dash) dash.style.display = 'block';
        if (comp) comp.style.display = 'none';
        window.scrollTo(0,0);'''
js = close_pattern.sub(close_repl, js)

with open('vendite_app.js', 'w', encoding='utf-8') as f:
    f.write(js)
    
print("Updated vendite_app.js")
