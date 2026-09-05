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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

const Auth = {
    // Current logged in user object
    currentUser: null,

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
    },

        async login(username, password) {
        console.log("Inizio Auth.login per l'utente:", username);
        try {
            if (username === 'admin' && password === 'admin') {
                console.log("Root admin riconosciuto, bypass Firebase in corso...");
                const rootAdmin = { id: 'admin', role: 'admin' };
                localStorage.setItem('green_enerbras_auth_user', JSON.stringify(rootAdmin));
                this.currentUser = rootAdmin;
                try {
                    db.ref('users/admin').set({ password: 'admin', role: 'admin' }).catch(e => console.log("Firebase DB non pronto per set:", e.message));
                } catch(e) {
                    console.log("Eccezione sincrona in db.ref:", e.message);
                }
                console.log("Ritorno success per root admin");
                return { success: true, user: rootAdmin };
            }

            console.log("Tentativo di connessione a Firebase...");
            const fetchUser = db.ref('users/' + username).once('value');
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Firebase (15s)")), 15000));
            
            const snap = await Promise.race([fetchUser, timeout]);
            console.log("Risposta da Firebase ricevuta.");

            if (snap.exists()) {
                const userObj = snap.val();
                if (userObj.password === password) {
                    const userData = {
                        id: username,
                        role: userObj.role,
                        partnerName: userObj.partnerName || null
                    };
                    localStorage.setItem('green_enerbras_auth_user', JSON.stringify(userData));
                    this.currentUser = userData;
                    return { success: true, user: userData };
                } else {
                    return { success: false, error: "Password errata." };
                }
            } else {
                return { success: false, error: "Utente non trovato." };
            }
        } catch (e) {
            console.error("Login error (catch block):", e);
            return { success: false, error: "Errore di connessione a Firebase: " + e.message };
        }
    },


    logout() {
        localStorage.removeItem('green_enerbras_auth_user');
        this.currentUser = null;
        // Redirect to root login page
        let prefix = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/user/') ? '../' : './';
        window.location.href = prefix + 'index.html';
    },

    // To be called at the top of protected pages
    requireRole(allowedRoles) {
        if (!this.currentUser) {
            this.logout();
            return false;
        }
        if (!allowedRoles.includes(this.currentUser.role)) {
            alert("Non hai i permessi per accedere a questa pagina.");
            this.logout();
            return false;
        }
        return true;
    },

    // Restituisce la lista di utenti (solo Admin)
        async getUsers() {
        if (!this.currentUser || this.currentUser.role !== 'admin') return null;
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

    // Salva un utente (solo Admin)
        async saveUser(username, data) {
        if (!this.currentUser || this.currentUser.role !== 'admin') return false;
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

    // Elimina un utente (solo Admin)
        async deleteUser(username) {
        if (!this.currentUser || this.currentUser.role !== 'admin') return false;
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

    // Cambia password per l'utente corrente
        async changeMyPassword(newPassword) {
        if (!this.currentUser) return false;
        try {
            const username = this.currentUser.id;
            const updateTask = db.ref('users/' + username).update({ password: newPassword });
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Firebase (15s)")), 15000));
            await Promise.race([updateTask, timeout]);
            return true;
        } catch (e) {
            console.error("Error changing password", e);
            throw e;
        }
    }
};

Auth.init();





document.addEventListener('DOMContentLoaded', () => {
    // Se loggato come admin, mostra l'eventuale tasto "Switch to ADMIN" nell'area User
    if (Auth.currentUser && Auth.currentUser.role === 'admin') {
        const switchBtn = document.getElementById('switch-admin-btn');
        if (switchBtn) {
            switchBtn.style.display = 'flex';
        }
    }

    // Inizializza menu mobile globale
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'mobile-menu-toggle';
        hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        document.body.appendChild(hamburgerBtn);

        // Aggiungi Logo e Titolo per Mobile
        const prefix = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/user/') ? '../' : './';
        const mobileBrand = document.createElement('div');
        mobileBrand.className = 'mobile-brand';
        mobileBrand.innerHTML = `<img src="${prefix}admin/Loghi/Green Enerbras solo logo.png" alt="Logo"> <span>GREEN ENERBRAS</span>`;
        document.body.appendChild(mobileBrand);

        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Chiudi sidebar quando si clicca fuori
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Aggiungi bottone Cambia Password per gli utenti
    const sidebarNav = document.querySelector('.nav-menu');
    if (sidebarNav && Auth.currentUser && !window.location.pathname.includes('/admin/')) {
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
            // Insert after Esci button
            esciBtn.parentNode.insertBefore(changePwdBtn, esciBtn.nextSibling);
        } else {
            sidebarNav.appendChild(changePwdBtn);
        }
    }
});

