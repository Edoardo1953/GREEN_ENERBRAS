import re

def process_file(html_file, page_type):
    with open(html_file, 'r', encoding='utf-8') as f:
        html = f.read()

    # Move dashboard-content up to wrap the main topbar
    # Look for: <main class="main-content">\n            <header class="topbar">
    main_start = '<main class="main-content">'
    if '<div id="dashboard-content">' in html:
        # First remove the old <div id="dashboard-content"> which was added AFTER the topbar
        html = html.replace('<div id="dashboard-content">\n', '', 1)
        # Now add it right after main-content
        html = html.replace(main_start, main_start + '\n            <div id="dashboard-content">', 1)

    # Now, find the comparatore-content block
    comp_start = html.find('<div id="comparatore-content"')
    if comp_start == -1:
        return # Skip if not found
        
    comp_inner_start = html.find('>', comp_start) + 1
    # We need to rewrite everything inside comparatore-content until the first original <div style="display: flex; gap: 1rem; ...>
    
    # Let's find the original title line which was: <h2 style="margin-bottom: 1.5rem;"><span data-i18n=...
    h2_regex = re.compile(r'<h2 style="margin-bottom: 1.5rem;">.*?</h2>', re.DOTALL)
    
    # Find the old back button block
    btn_back_regex = re.compile(r'<div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">\s*<button onclick="closeComparatoreModal\(\)" class="btn-back".*?</button>\s*</div>', re.DOTALL)
    
    # We will slice out everything in comp_inner up to the controls div
    controls_regex = re.compile(r'<div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center;">')
    controls_match = controls_regex.search(html, comp_inner_start)
    
    if not controls_match:
        return
        
    controls_idx = controls_match.start()
    
    # Extract the rest of the HTML
    top_html = html[:comp_inner_start]
    bottom_html = html[controls_idx:]
    
    # Generate the new topbar and banner
    title = "Comparatore Produzione" if page_type == 'prod' else "Comparatore Vendite e Ricavi"
    title_key = "title_comparatore_impianto" if page_type == 'prod' else "title_comparatore_vendite"
    color = "#3b82f6" if page_type == 'prod' else "#10b981"
    banner_desc = "Strumento per confrontare i dati di produzione di energia tra diversi anni o mesi." if page_type == 'prod' else "Strumento per confrontare i dati di vendita e fatturato tra diversi anni o mesi, suddivisi per impianto o cliente."
    icon = "fa-solar-panel" if page_type == 'prod' else "fa-money-bill-wave"

    new_header = f'''
            <header class="topbar">
                <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
                    <h1 style="margin: 0; font-size: 1.5rem;"><span data-i18n="{title_key}">{title}</span></h1>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <div class="lang-tools-wrapper">
                        <div class="lang-selector" style="display: flex; gap: 0.5rem; align-items: center;">
                            <img src="https://flagcdn.com/w40/it.png" alt="IT" data-lang="it" class="lang-flag" style="width: 24px; height: 24px; border-radius: 50%; cursor: pointer; object-fit: cover;">
                            <img src="https://flagcdn.com/w40/gb.png" alt="EN" data-lang="en" class="lang-flag" style="width: 24px; height: 24px; border-radius: 50%; cursor: pointer; object-fit: cover;">
                            <img src="https://flagcdn.com/w40/fr.png" alt="FR" data-lang="fr" class="lang-flag" style="width: 24px; height: 24px; border-radius: 50%; cursor: pointer; object-fit: cover;">
                        </div>
                        <button type="button" class="btn-theme-toggle" onclick="ThemeManager.toggle()" title="Cambia tema: Scuro / Grigio chiaro">
                            <i class="fa-solid fa-wrench"></i> <span class="theme-toggle-text">TOOLS</span>
                        </button>
                    </div>
                    <div class="user-profile">
                        <img src="https://ui-avatars.com/api/?name=Edoardo+Tubia&background=3b82f6&color=fff" alt="Admin" class="avatar">
                        <span>Edoardo Tubia (Admin)</span>
                    </div>
                    <a href="#" onclick="closeComparatoreModal(); return false;" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #ef4444; text-decoration: none; transition: all 0.2s; border: 1px solid rgba(239, 68, 68, 0.3); margin-left: 0.5rem;" onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.transform='scale(1)';" title="Chiudi">
                        <i class="fa-solid fa-xmark" style="font-size: 1.25rem;"></i>
                    </a>
                </div>
            </header>

            <section class="glass-panel" style="margin-bottom: 1.5rem; padding: 1.2rem 1.5rem; border-left: 4px solid {color}; background: linear-gradient(90deg, {color}14 0%, rgba(15, 23, 42, 0.4) 100%);">
                <div style="display: flex; align-items: flex-start; gap: 1rem;">
                    <div style="font-size: 1.8rem; color: {color}; margin-top: 0.1rem;">
                        <i class="fa-solid {icon}"></i>
                    </div>
                    <div>
                        <h3 style="margin: 0 0 0.4rem 0; font-size: 1.05rem; color: var(--text-main); font-weight: 700;">{title}</h3>
                        <p style="margin: 0; font-size: 0.92rem; line-height: 1.55; color: var(--text-muted);">
                            {banner_desc}
                        </p>
                    </div>
                </div>
            </section>
            
            <div class="glass-panel" style="padding: 2rem; position: relative; margin-bottom: 2rem;">
    '''
    
    html = top_html + new_header + bottom_html
    
    # We must also make sure the padding of comparatore-content is 0 so the topbar spans full width
    html = html.replace('<div id="comparatore-content" style="display: none; padding: 1.5rem;">', '<div id="comparatore-content" style="display: none; padding: 0;">')
    html = html.replace('<div id="comparatore-content" style="display: none;">', '<div id="comparatore-content" style="display: none; padding: 0;">')

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html)
        
process_file('produzione.html', 'prod')
process_file('vendite.html', 'vendite')
print("Layouts updated successfully")
