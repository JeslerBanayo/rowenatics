(function(){
    const KEY = 'ecollect_session';

    function getSession(){
        try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(_) { return null; }
    }

    function setSession(s){
        localStorage.setItem(KEY, JSON.stringify(s));
    }

    function clearSession(){
        localStorage.removeItem(KEY);
    }

    function showToast(msg){
        try {
            const c = document.getElementById('notificationContainer') || document.body;
            const d = document.createElement('div');
            d.className = 'notification success';
            d.innerHTML = '<div class="notification-content"><div class="notification-title">Auth</div><div class="notification-message">'+msg+'</div></div>';
            c.appendChild(d);
            setTimeout(()=>d.remove(),3000);
        } catch(_) {}
    }

    window.Auth = {
        getSession,
        isLoggedIn: () => !!getSession(),
        isAdmin: () => (getSession()?.role === 'admin'),
        login: ({username, role}) => {
            setSession({ username, role, loginAt: new Date().toISOString() });
            showToast('Logged in as ' + role);
            if (role === 'admin') {
                location.href = 'admin-dashboard.html';
            } else {
                location.href = 'index.html';
            }
        },
        logout: () => {
            clearSession();
            showToast('Logged out');
            location.href = 'login.html';
        },
        guardAdmin: () => {
            if (!window.Auth.isAdmin()) {
                location.href = 'login.html';
            }
        }
    };
})();


