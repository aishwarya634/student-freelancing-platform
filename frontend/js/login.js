document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: email,
            password: password
        });

        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid auth data format received.');
        }
    } catch (error) {
        console.error('Login request failed context:', error);
        alert('Authentication failed: ' + (error.response?.data?.message || 'Check server connection status.'));
    }
});