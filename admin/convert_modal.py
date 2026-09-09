import re

def process_file(html_file, js_file):
    # 1. Modify HTML
    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()

    # Wrap main content
    html = html.replace('<!-- KPIs -->', '<div id="dashboard-content">\n            <!-- KPIs -->')
    
    # We need to close dashboard-content right before the modal
    modal_start = '<!-- Modal Comparatore'
    html = html.replace(modal_start, '</div>\n\n    ' + modal_start)
    
    # Now modify the modal to be a standard block, not an overlay
    # Find the modal overlay div
    modal_regex = re.compile(r'<div id="comparatoreModal"[^>]*>')
    
    # Replace with a standard div
    html = re.sub(modal_regex, '<div id="comparatore-content" style="display: none;">', html)
    
    # Remove the glass-panel wrapper of the modal to make it flat, or keep it but remove max-height
    glass_regex = re.compile(r'<div class="glass-panel" style="width: 95%; max-width: 1200px; padding: 2rem; position: relative; max-height: 90vh; overflow-y: auto;">')
    html = re.sub(glass_regex, '<div class="glass-panel" style="padding: 2rem; position: relative; margin-bottom: 2rem;">', html)
    
    # Replace the close button (the X) with a header and a "Back" button
    close_btn_regex = re.compile(r'<button onclick="closeComparatoreModal\(\)"[^>]*><i class="fa-solid fa-xmark"></i></button>')
    
    header_html = '''
    <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
        <button onclick="closeComparatoreModal()" class="btn-back" style="display: inline-flex; align-items: center; gap: 0.5rem; border: none; padding: 0.5rem 0.9rem; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: var(--text-main); font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background=\\'rgba(255,255,255,0.18)\\'" onmouseout="this.style.background=\\'rgba(255,255,255,0.08)\\'">
            <i class="fa-solid fa-arrow-left"></i> <span data-i18n="btn_back">Torna Indietro</span>
        </button>
    </div>
    '''
    html = re.sub(close_btn_regex, header_html, html)

    # In vendite.html there is a slightly different title span, we can keep the existing h2, just insert the back button above it.
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html)

    # 2. Modify JS
    with open(js_file, 'r', encoding='utf-8') as f:
        js = f.read()
        
    # In JS, change openComparatoreModal to hide dashboard and show comparatore
    open_repl = '''
    const dash = document.getElementById('dashboard-content');
    const comp = document.getElementById('comparatore-content');
    if(dash) dash.style.display = 'none';
    if(comp) comp.style.display = 'block';
    window.scrollTo(0,0);
    '''
    js = js.replace("document.getElementById('comparatoreModal').style.display = 'flex';", open_repl)
    
    # If the app used block instead of flex:
    js = js.replace("document.getElementById('comparatoreModal').style.display = 'block';", open_repl)

    # Change closeComparatoreModal
    close_repl = '''
    const dash = document.getElementById('dashboard-content');
    const comp = document.getElementById('comparatore-content');
    if(dash) dash.style.display = 'block';
    if(comp) comp.style.display = 'none';
    window.scrollTo(0,0);
    '''
    js = js.replace("document.getElementById('comparatoreModal').style.display = 'none';", close_repl)
    
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(js)

process_file('produzione.html', 'prod_app.js')
process_file('vendite.html', 'vendite_app.js')
print("Done!")
