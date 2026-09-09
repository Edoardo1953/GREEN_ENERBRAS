import re

def process_file(html_file, js_file):
    # 1. Modify HTML
    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()

    # Wrap main content starting after topbar
    topbar_end = '</header>'
    
    # We want to wrap from right after topbar to right before </main>
    # Find </header>
    if topbar_end in html:
        parts = html.split(topbar_end, 1)
        # Find </main> in the second part
        main_end = '</main>'
        if main_end in parts[1]:
            subparts = parts[1].split(main_end, 1)
            dashboard_content = '<div id="dashboard-content">' + subparts[0] + '</div>\n\n            <!-- COMPARATORE CONTENT PLACEHOLDER -->\n        </main>' + subparts[1]
            html = parts[0] + topbar_end + dashboard_content
    
    # Extract the modal
    modal_regex = re.compile(r'<!-- Modal Comparatore.*?<div id="comparatoreModal".*?>(.*)</body>\s*</html>', re.DOTALL)
    
    modal_match = modal_regex.search(html)
    if modal_match:
        # The entire modal HTML to replace the placeholder
        modal_inner = modal_match.group(1)
        
        # Remove the closing tags from modal_inner since we grabbed up to </body>
        # Actually it's better to just extract the `<div class="glass-panel"...>...</div></div>`
        pass
    
    # Let's do it with string replacement to be safer
    # 1. Strip the modal from the end of the file
    modal_start_idx = html.find('<!-- Modal Comparatore')
    if modal_start_idx != -1:
        modal_full = html[modal_start_idx:]
        html = html[:modal_start_idx] # Remove modal from bottom
        
        # Now find the glass-panel inside modal_full
        glass_start = modal_full.find('<div class="glass-panel"')
        
        # We need to extract just the inner content, skipping the wrapper overlay
        # Since we just want the inside:
        inner_content = modal_full[glass_start:]
        # Remove </body> and </html>
        inner_content = inner_content.replace('</body>', '').replace('</html>', '').strip()
        
        # Remove the closing </div> of the overlay
        # It should be the very last </div>
        if inner_content.endswith('</div>'):
            inner_content = inner_content[:-6]
            
        # Replace glass-panel styles
        inner_content = inner_content.replace('width: 95%; max-width: 1200px; padding: 2rem; position: relative; max-height: 90vh; overflow-y: auto;', 'padding: 0; position: relative; background: transparent; border: none; box-shadow: none;')
        
        # Replace the close button (the X) with a header and a "Back" button
        close_btn_regex = re.compile(r'<button onclick="closeComparatoreModal\(\)"[^>]*><i class="fa-solid fa-xmark"></i></button>')
        
        btn_text = "Torna a Produzione" if "produzione" in html_file else "Torna a Vendite"
        
        header_html = f'''
        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
            <button onclick="closeComparatoreModal()" class="btn-back" style="display: inline-flex; align-items: center; gap: 0.5rem; border: none; padding: 0.5rem 0.9rem; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: var(--text-main); font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background=\\'rgba(255,255,255,0.18)\\'" onmouseout="this.style.background=\\'rgba(255,255,255,0.08)\\'">
                <i class="fa-solid fa-arrow-left"></i> <span>{btn_text}</span>
            </button>
        </div>
        '''
        inner_content = re.sub(close_btn_regex, header_html, inner_content)
        
        # Wrap in comparatore-content
        comparatore_div = f'<div id="comparatore-content" style="display: none; padding: 1.5rem;">\n{inner_content}\n</div>'
        
        # Insert into placeholder
        html = html.replace('<!-- COMPARATORE CONTENT PLACEHOLDER -->', comparatore_div)
        
        # Finally re-append </body></html>
        html += '\n</body>\n</html>\n'

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html)

    # 2. Modify JS
    with open(js_file, 'r', encoding='utf-8') as f:
        js = f.read()
        
    open_repl = '''
    const dash = document.getElementById('dashboard-content');
    const comp = document.getElementById('comparatore-content');
    if(dash) dash.style.display = 'none';
    if(comp) comp.style.display = 'block';
    window.scrollTo(0,0);
    '''
    js = js.replace("document.getElementById('comparatoreModal').style.display = 'flex';", open_repl)
    js = js.replace("document.getElementById('comparatoreModal').style.display = 'block';", open_repl)

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
print("Done v2!")
