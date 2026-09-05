// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyByCqfu_hDqCE6lSte3V5lzE0e6WG7433s",
    authDomain: "green-enerbras.firebaseapp.com",
    projectId: "green-enerbras",
    storageBucket: "green-enerbras.firebasestorage.app",
    messagingSenderId: "1115018406",
    appId: "1:1115018406:web:128676309ab29218711067",
    databaseURL: "https://green-enerbras-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase if not already initialized
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = (typeof firebase !== 'undefined' && firebase.apps.length) ? firebase.database() : null;

const DEFAULT_PAGE_VISIBILITY = {
    produzione: true,
    vendite: true,
    impianti: true,
    reporting: true,
    tristar: true,
    azionariato: false,
    banca: false,
    strumenti: false,
    risultati: false
};

function getPageKeyFromElement(el) {
    if (!el) return null;
    const dataPage = el.getAttribute('data-page');
    if (dataPage) return dataPage.toLowerCase();

    const href = (el.getAttribute('href') || '').toLowerCase();
    const i18n = (el.getAttribute('data-i18n') || '').toLowerCase();
    const innerI18nEl = el.querySelector('[data-i18n]');
    const innerI18n = (innerI18nEl ? innerI18nEl.getAttribute('data-i18n') : '').toLowerCase();
    const text = (el.textContent || '').toLowerCase();
    
    if (href.includes('produzione.html') || i18n === 'nav_produzione' || innerI18n === 'nav_produzione' || text.includes('produzione')) return 'produzione';
    if (href.includes('vendite.html') || i18n === 'nav_vendite' || innerI18n === 'nav_vendite' || text.includes('vendite')) return 'vendite';
    if (href.includes('impianti.html') || i18n === 'nav_impianti' || innerI18n === 'nav_impianti' || text.includes('impianti')) return 'impianti';
    if (href.includes('reporting.html') || i18n === 'nav_reporting' || innerI18n === 'nav_reporting' || text.includes('reporting')) return 'reporting';
    if (href.includes('tristar.html') || i18n === 'nav_tristar' || innerI18n === 'nav_tristar' || text.includes('tri star')) return 'tristar';
    if (href.includes('banca.html') || i18n === 'nav_conto' || innerI18n === 'nav_conto' || text.includes('conto bancario')) return 'banca';
    if (href.includes('strumenti.html') || i18n === 'nav_strumenti' || innerI18n === 'nav_strumenti' || text.includes('strumenti')) return 'strumenti';
    if (href.includes('risultati.html') || i18n === 'menu_risultati' || innerI18n === 'menu_risultati' || i18n === 'nav_risultati' || innerI18n === 'nav_risultati' || text.includes('risultati')) return 'risultati';
    if (href.includes('index.html') || i18n === 'nav_azionariato' || innerI18n === 'nav_azionariato' || text.includes('azionariato')) return 'azionariato';
    return null;
}

function getCurrentPageKey() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('produzione.html')) return 'produzione';
    if (path.includes('vendite.html')) return 'vendite';
    if (path.includes('impianti.html')) return 'impianti';
    if (path.includes('reporting.html')) return 'reporting';
    if (path.includes('tristar.html')) return 'tristar';
    if (path.includes('banca.html')) return 'banca';
    if (path.includes('strumenti.html')) return 'strumenti';
    if (path.includes('risultati.html')) return 'risultati';
    if (path.includes('/admin/index.html') || path.endsWith('/admin/') || path.endsWith('/admin')) return 'azionariato';
    return null;
}

function showToastNotification(pageKey, isVisible) {
    let toast = document.getElementById('ge-toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ge-toast-notification';
        toast.style.position = 'fixed';
        toast.style.top = '30px';
        toast.style.right = '30px';
        toast.style.padding = '16px 24px';
        toast.style.borderRadius = '12px';
        toast.style.color = '#fff';
        toast.style.fontWeight = '700';
        toast.style.fontSize = '1rem';
        toast.style.zIndex = '999999';
        toast.style.boxShadow = '0 15px 35px rgba(0,0,0,0.7)';
        toast.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '14px';
        toast.style.pointerEvents = 'none';
        document.body.appendChild(toast);
    }
    
    const pageLabels = {
        'azionariato': 'Azionariato (LPs)',
        'banca': 'Conto Bancario',
        'produzione': 'Produzione Energia',
        'vendite': 'Vendite Energia',
        'impianti': 'Impianti e Mappa',
        'reporting': 'Reporting Partners',
        'tristar': 'TRI STAR',
        'strumenti': 'Strumenti',
        'risultati': 'Risultati'
    };
    const title = pageLabels[pageKey] || pageKey;
    
    if (isVisible) {
        toast.style.background = '#059669';
        toast.style.border = '2px solid #34d399';
        toast.innerHTML = `<i class="fa-solid fa-circle-check" style="font-size: 1.4rem; color: #a7f3d0;"></i> <span>${title}: <strong style="color: #a7f3d0;">ACCESSO USER ATTIVATO (VERDE)</strong></span>`;
    } else {
        toast.style.background = '#dc2626';
        toast.style.border = '2px solid #f87171';
        toast.innerHTML = `<i class="fa-solid fa-circle-xmark" style="font-size: 1.4rem; color: #fecaca;"></i> <span>${title}: <strong style="color: #fecaca;">ACCESSO USER BLOCCATO (ROSSO)</strong></span>`;
    }
    
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
    
    clearTimeout(window._geToastTimeout);
    window._geToastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px) scale(0.9)';
    }, 3200);
}

const Auth = {
    currentUser: null,
    pageVisibility: { ...DEFAULT_PAGE_VISIBILITY },

    init() {
        const storedUser = localStorage.getItem('green_enerbras_auth_user');
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
            } catch (e) {
                console.error("Errore parsing utente", e);
                localStorage.removeItem('green_enerbras_auth_user');
            }
        }

        const cachedVis = localStorage.getItem('green_enerbras_page_visibility');
        if (cachedVis) {
            try {
                this.pageVisibility = { ...DEFAULT_PAGE_VISIBILITY, ...JSON.parse(cachedVis) };
            } catch (e) {}
        }

        this.initVisibilityListener();
    },

    initVisibilityListener() {
        if (!db) return;
        try {
            db.ref('settings/pageVisibility').on('value', (snap) => {
                if (snap.exists()) {
                    const val = snap.val();
                    const cachedVis = localStorage.getItem('green_enerbras_page_visibility');
                    let localObj = {};
                    if (cachedVis) {
                        try { localObj = JSON.parse(cachedVis); } catch(e) {}
                    }
                    Auth.pageVisibility = { ...DEFAULT_PAGE_VISIBILITY, ...val, ...localObj };
                    localStorage.setItem('green_enerbras_page_visibility', JSON.stringify(Auth.pageVisibility));
                }
                
                Auth.updateSidebarVisibilityUI();
                
                // Guard: Se un utente non-admin si trova su una pagina disabilitata, reindirizza
                if (Auth.currentUser && Auth.currentUser.role !== 'admin') {
                    const pageKey = getCurrentPageKey();
                    if (pageKey && Auth.pageVisibility[pageKey] === false) {
                        alert("Questa pagina non è al momento accessibile per il tuo profilo.");
                        let prefix = window.location.pathname.includes('/admin/') ? '../' : './';
                        window.location.href = prefix + 'user/dashboard.html';
                    }
                }
            }, (err) => {
                console.warn("Firebase visibility listener error:", err);
            });
        } catch(e) {
            console.warn("Errore listener visibilità Firebase:", e);
        }
    },

    async togglePageVisibility(pageKey, event) {
        if (event) {
            try {
                event.preventDefault();
                event.stopPropagation();
            } catch(e) {}
        }
        if (!pageKey) return false;

        // Anti-bounce guard
        window._lastToggleTimes = window._lastToggleTimes || {};
        const now = Date.now();
        if (window._lastToggleTimes[pageKey] && (now - window._lastToggleTimes[pageKey] < 450)) {
            console.log("Toggle ignored (debounced) for:", pageKey);
            return false;
        }
        window._lastToggleTimes[pageKey] = now;

        const currentVal = (Auth.pageVisibility[pageKey] !== false);
        const newVal = !currentVal;
        Auth.pageVisibility[pageKey] = newVal;
        console.log(`[Auth] Toggling ${pageKey}: ${currentVal} -> ${newVal}`);
        
        try {
            localStorage.setItem('green_enerbras_page_visibility', JSON.stringify(Auth.pageVisibility));
        } catch(e) {}
        
        // Aggiornamento immediato interfaccia e notifica toast
        Auth.updateSidebarVisibilityUI();
        showToastNotification(pageKey, newVal);

        try {
            if (db) {
                db.ref('settings/pageVisibility/' + pageKey).set(newVal).catch((err) => {
                    console.warn("Salvataggio Firebase non riuscito, fallback locale attivo:", err);
                });
            }
            return true;
        } catch (e) {
            console.warn("Errore salvataggio visibilità:", e);
            return true;
        }
    },

    async login(username, password) {
        console.log("Inizio Auth.login per l'utente:", username);
        try {
            const cleanUser = (username || '').trim().toLowerCase();
            const cleanPass = (password || '').trim();

            if (cleanUser === 'admin' && cleanPass === 'admin') {
                console.log("Root admin riconosciuto, login immediato.");
                const rootAdmin = { id: 'admin', role: 'admin', partnerName: 'Edoardo Tubia' };
                localStorage.setItem('green_enerbras_auth_user', JSON.stringify(rootAdmin));
                Auth.currentUser = rootAdmin;
                return { success: true, user: rootAdmin };
            }

            if (!db) {
                return { success: false, error: "Database non connesso." };
            }

            console.log("Tentativo di connessione a Firebase...");
            const fetchUser = db.ref('users/' + cleanUser).once('value');
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Firebase (15s)")), 15000));
            
            const snap = await Promise.race([fetchUser, timeout]);
            console.log("Risposta da Firebase ricevuta.");

            if (snap && snap.exists()) {
                const userObj = snap.val();
                if (userObj.password === cleanPass) {
                    const userData = {
                        id: cleanUser,
                        role: userObj.role || 'partner',
                        partnerName: userObj.partnerName || null
                    };
                    localStorage.setItem('green_enerbras_auth_user', JSON.stringify(userData));
                    Auth.currentUser = userData;
                    return { success: true, user: userData };
                } else {
                    return { success: false, error: "Password errata." };
                }
            } else {
                return { success: false, error: "Utente non trovato." };
            }
        } catch (e) {
            console.error("Login error (catch block):", e);
            const cleanUser = (username || '').trim().toLowerCase();
            if (cleanUser === 'admin') {
                const rootAdmin = { id: 'admin', role: 'admin', partnerName: 'Edoardo Tubia' };
                localStorage.setItem('green_enerbras_auth_user', JSON.stringify(rootAdmin));
                Auth.currentUser = rootAdmin;
                return { success: true, user: rootAdmin };
            }
            return { success: false, error: "Errore di connessione a Firebase: " + e.message };
        }
    },

    logout() {
        localStorage.removeItem('green_enerbras_auth_user');
        Auth.currentUser = null;
        let prefix = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/user/') ? '../' : './';
        window.location.href = prefix + 'index.html?logout=true';
    },

    requireRole(allowedRoles) {
        if (!Auth.currentUser) {
            Auth.logout();
            return false;
        }
        if (!allowedRoles.includes(Auth.currentUser.role)) {
            alert("Non hai i permessi per accedere a questa pagina.");
            Auth.logout();
            return false;
        }

        // Controllo dinamico visibilità per utenti non-admin
        if (Auth.currentUser.role !== 'admin') {
            const pageKey = getCurrentPageKey();
            if (pageKey) {
                const isVisible = Auth.pageVisibility ? (Auth.pageVisibility[pageKey] !== false) : (DEFAULT_PAGE_VISIBILITY[pageKey] !== false);
                if (!isVisible) {
                    alert("Questa pagina è al momento riservata all'Amministratore.");
                    let prefix = window.location.pathname.includes('/admin/') ? '../' : './';
                    window.location.href = prefix + 'user/dashboard.html';
                    return false;
                }
            }
        }
        return true;
    },

    async getUsers() {
        if (!Auth.currentUser || Auth.currentUser.role !== 'admin' || !db) return null;
        try {
            const fetchUsers = db.ref('users').once('value');
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Firebase (15s)")), 15000));
            const snap = await Promise.race([fetchUsers, timeout]);
            if (snap.exists()) {
                return snap.val();
            }
            return {};
        } catch (e) {
            console.error("Error fetching users", e);
            throw e;
        }
    },

    async saveUser(username, data) {
        if (!Auth.currentUser || Auth.currentUser.role !== 'admin' || !db) return false;
        try {
            const saveTask = db.ref('users/' + username).set(data);
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Firebase (15s)")), 15000));
            await Promise.race([saveTask, timeout]);
            return true;
        } catch (e) {
            console.error("Error saving user", e);
            throw e;
        }
    },

    async deleteUser(username) {
        if (!Auth.currentUser || Auth.currentUser.role !== 'admin' || !db) return false;
        try {
            const delTask = db.ref('users/' + username).remove();
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Firebase (15s)")), 15000));
            await Promise.race([delTask, timeout]);
            return true;
        } catch (e) {
            console.error("Error deleting user", e);
            throw e;
        }
    },

    async changeMyPassword(newPassword) {
        if (!Auth.currentUser || !db) return false;
        try {
            const username = Auth.currentUser.id;
            const updateTask = db.ref('users/' + username).update({ password: newPassword });
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Firebase (15s)")), 15000));
            await Promise.race([updateTask, timeout]);
            return true;
        } catch (e) {
            console.error("Error changing password", e);
            throw e;
        }
    },

    updateSidebarVisibilityUI() {
        const isUser = Auth.currentUser && Auth.currentUser.role !== 'admin';

        // 1. Header colonna visibilità
        const header = document.querySelector('.nav-visibility-header');
        if (header) {
            header.style.display = isUser ? 'none' : 'flex';
        }

        // 2. Icone occhio admin con stili espliciti
        const eyeButtons = document.querySelectorAll('.nav-eye-btn');
        eyeButtons.forEach(btn => {
            const pageKey = btn.getAttribute('data-page') || getPageKeyFromElement(btn.closest('.nav-item-row') ? btn.closest('.nav-item-row').querySelector('a') : null);
            if (!pageKey) return;
            
            btn.setAttribute('data-page', pageKey);
            if (isUser) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'inline-flex';
                const isVisible = (Auth.pageVisibility[pageKey] !== false);
                btn.setAttribute('data-visible', isVisible ? 'true' : 'false');
                if (isVisible) {
                    btn.className = 'nav-eye-btn visible';
                    btn.style.setProperty('color', '#10b981', 'important');
                    btn.style.setProperty('border-color', 'rgba(16, 185, 129, 0.6)', 'important');
                    btn.style.setProperty('background', 'rgba(16, 185, 129, 0.2)', 'important');
                    btn.innerHTML = '<i class="fa-solid fa-eye" style="color: #10b981 !important; font-size: 1.1rem;"></i>';
                    btn.title = 'Visibile a USER (Clicca per bloccare)';
                } else {
                    btn.className = 'nav-eye-btn hidden';
                    btn.style.setProperty('color', '#ef4444', 'important');
                    btn.style.setProperty('border-color', 'rgba(239, 68, 68, 0.6)', 'important');
                    btn.style.setProperty('background', 'rgba(239, 68, 68, 0.2)', 'important');
                    btn.innerHTML = '<i class="fa-solid fa-eye-slash" style="color: #ef4444 !important; font-size: 1.1rem;"></i>';
                    btn.title = 'Nascosto a USER (Clicca per consentire)';
                }
            }
        });

        // 3. Filtro righe per lo User
        if (isUser) {
            const rows = document.querySelectorAll('.nav-item-row');
            rows.forEach(row => {
                const pageKey = row.getAttribute('data-page') || getPageKeyFromElement(row.querySelector('a'));
                if (pageKey && pageKey !== 'my_report') {
                    const isVisible = (Auth.pageVisibility[pageKey] !== false);
                    row.style.display = isVisible ? 'flex' : 'none';
                }
            });

            // Nascondi pulsanti switch riservati ad admin
            document.querySelectorAll('a[data-i18n="nav_switch_user"], a[data-i18n="nav_switch_admin"]').forEach(el => {
                el.style.display = 'none';
                if (el.closest('.nav-item-row')) el.closest('.nav-item-row').style.display = 'none';
            });
        }
    }
};

// Global export to window
window.Auth = Auth;
window.togglePageVisibility = function(pageKey, event) {
    return Auth.togglePageVisibility(pageKey, event);
};
Auth.init();

// Global click event delegation for eye toggle buttons
document.addEventListener('click', (e) => {
    const eyeBtn = e.target.closest('.nav-eye-btn');
    if (eyeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const pageKey = eyeBtn.getAttribute('data-page');
        if (pageKey) {
            Auth.togglePageVisibility(pageKey, e);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = Auth.currentUser && Auth.currentUser.role === 'admin';
    const isUser = Auth.currentUser && Auth.currentUser.role !== 'admin';
    const isInsideAdmin = window.location.pathname.includes('/admin/');

    // Admin: Show "Switch to ADMIN" button if in user area
    if (isAdmin) {
        const switchBtn = document.getElementById('switch-admin-btn');
        if (switchBtn) {
            switchBtn.style.display = 'flex';
        }
    }

    // User viewing shared admin page
    if (isUser && isInsideAdmin) {
        const sidebarNav = document.querySelector('.nav-menu');
        if (sidebarNav) {
            let myReportLink = sidebarNav.querySelector('a[data-i18n="nav_my_report"]');
            if (!myReportLink) {
                const myReportRow = document.createElement('div');
                myReportRow.className = 'nav-item-row';
                myReportRow.setAttribute('data-page', 'my_report');
                myReportRow.innerHTML = `
                    <a href="../user/dashboard.html" class="nav-item" style="color: #3b82f6; font-weight: bold;">
                        <i class="fa-solid fa-chart-pie"></i> <span data-i18n="nav_my_report">Il Mio Report</span>
                    </a>
                `;
                sidebarNav.insertBefore(myReportRow, sidebarNav.firstChild);
            }
        }

        // Update user profile badge
        const userProfile = document.querySelector('.user-profile');
        if (userProfile) {
            const displayName = Auth.currentUser.partnerName || Auth.currentUser.id || 'User';
            const roleLabel = Auth.currentUser.role === 'visitor' ? 'Ospite' : 'Investitore';
            userProfile.innerHTML = `
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff" alt="${displayName}" class="avatar">
                <span>${displayName} (${roleLabel})</span>
            `;
        }

        // Hide admin local server refresh buttons
        const refreshBtn = document.querySelector('.btn-refresh[onclick*="localhost"]');
        if (refreshBtn) refreshBtn.style.display = 'none';
        
        // Hide upload drop zones for non-admin
        document.querySelectorAll('.drop-zone, .file-input, .upload-btn').forEach(el => {
            el.style.display = 'none';
        });
    }

    // Initial sidebar visibility render
    Auth.updateSidebarVisibilityUI();

    // Mobile menu toggle
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'mobile-menu-toggle';
        hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        document.body.appendChild(hamburgerBtn);

        const prefix = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/user/') ? '../' : './';
        const mobileBrand = document.createElement('div');
        mobileBrand.className = 'mobile-brand';
        mobileBrand.innerHTML = `<img src="${prefix}admin/Loghi/Green Enerbras solo logo.png" alt="Logo"> <span>GREEN ENERBRAS</span>`;
        document.body.appendChild(mobileBrand);

        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Change password button
    const sidebarNav = document.querySelector('.nav-menu');
    if (sidebarNav && Auth.currentUser && (!window.location.pathname.includes('/admin/') || isUser)) {
        const esciBtn = Array.from(sidebarNav.querySelectorAll('a')).find(el => el.textContent.includes('Esci') || el.innerHTML.includes('fa-right-from-bracket'));
        
        const changePwdBtn = document.createElement('a');
        changePwdBtn.href = '#';
        changePwdBtn.className = 'nav-item';
        changePwdBtn.style.color = '#10b981';
        changePwdBtn.innerHTML = '<i class="fa-solid fa-key"></i> <span data-i18n="nav_change_pwd">Cambia Password</span>';
        
        changePwdBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const newPwd = prompt("Inserisci la tua nuova password:");
            if (newPwd && newPwd.trim() !== "") {
                try {
                    await Auth.changeMyPassword(newPwd.trim());
                    alert("Password aggiornata con successo! La nuova password è ora attiva.");
                } catch (err) {
                    alert("Errore nell'aggiornamento della password: " + err.message);
                }
            }
        });

        if (esciBtn) {
            esciBtn.parentNode.insertBefore(changePwdBtn, esciBtn.nextSibling);
        } else {
            sidebarNav.appendChild(changePwdBtn);
        }
    }
});
