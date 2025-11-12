// Authentication System
const AUTH_KEY = 'money_lending_auth';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

// Check if user is logged in
function isLoggedIn() {
    const auth = localStorage.getItem(AUTH_KEY);
    if (!auth) return false;
    
    try {
        const authData = JSON.parse(auth);
        // Check if session is still valid (24 hours)
        const now = new Date().getTime();
        if (authData.expiresAt && now > authData.expiresAt) {
            logout();
            return false;
        }
        return authData.loggedIn === true;
    } catch (error) {
        return false;
    }
}

// Login function
function login(username, password) {
    // Default credentials (you can change these)
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
        const authData = {
            loggedIn: true,
            username: username,
            loginTime: new Date().toISOString(),
            expiresAt: new Date().getTime() + (24 * 60 * 60 * 1000) // 24 hours
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        return true;
    }
    return false;
}

// Logout function
function logout() {
    localStorage.removeItem(AUTH_KEY);
    showLoginPage();
}

// Show login page
function showLoginPage() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

// Show main app
function showMainApp() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
}

// Handle login form submission
function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'warning');
        return;
    }
    
    if (login(username, password)) {
        showNotification('Login successful!', 'success');
        showMainApp();
    } else {
        showNotification('Invalid username or password', 'error');
        document.getElementById('loginPassword').value = '';
    }
}

// Check authentication on page load
function initAuth() {
    if (isLoggedIn()) {
        showMainApp();
    } else {
        showLoginPage();
    }
    
    // Allow Enter key to submit login form (after elements are loaded)
    setTimeout(function() {
        const passwordField = document.getElementById('loginPassword');
        const usernameField = document.getElementById('loginUsername');
        
        if (passwordField) {
            passwordField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
        
        if (usernameField) {
            usernameField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleLogin();
                }
            });
        }
    }, 100);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

