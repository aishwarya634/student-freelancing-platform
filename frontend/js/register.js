// js/register.js
document.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    window.location.href = '/dashboard.html';
    return;
  }

  let selectedRole = '';

  // Role card selection
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedRole = card.dataset.role;

      // Show skills field only for students
      const skillsGroup = document.getElementById('skillsGroup');
      if (skillsGroup) {
        skillsGroup.style.display = selectedRole === 'student' ? 'flex' : 'none';
      }
    });
  });

  const form    = document.getElementById('registerForm');
  const errorEl = document.getElementById('registerError');
  const btn     = document.getElementById('registerBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';

    const name     = document.getElementById('regName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const skills   = document.getElementById('regSkills')?.value.trim() || '';

    if (!selectedRole) {
      errorEl.textContent = 'Please select a role first.';
      errorEl.style.display = 'block';
      return;
    }
    if (!name || !email || !password) {
      errorEl.textContent = 'Please fill in all required fields.';
      errorEl.style.display = 'block';
      return;
    }
    if (password.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters.';
      errorEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Creating account…';

    const payload = { name, email, password, role: selectedRole };
    if (selectedRole === 'student' && skills) {
      payload.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setToken(data.token);
      if (data.user) setUser(data.user);
      showToast('Account created! Welcome 🎉');
      setTimeout(() => { window.location.href = '/dashboard.html'; }, 700);
    } catch (err) {
      errorEl.textContent = err.message || 'Registration failed. Try again.';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = 'Create Account';
    }
  });
});