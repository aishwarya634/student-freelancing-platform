// js/login.js
document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, go to dashboard
  if (getToken()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      errorEl.textContent = 'Please fill in all fields.';
      errorEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Signing in…';

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      setToken(data.token);
      if (data.user) setUser(data.user);
      showToast('Welcome back!');
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 600);
    } catch (err) {
      errorEl.textContent = err.message || 'Invalid email or password.';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
  });
});