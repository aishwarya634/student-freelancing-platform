const API_BASE_URL = "http://localhost:5000/api";

// Set up standard authorization header for all Axios requests if a token exists
function setupAxiosAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
}

// Redirect to login page if unauthorized
function checkAuth() {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }
}

// Global logout action
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Run authorization setup immediately when loaded
setupAxiosAuth();