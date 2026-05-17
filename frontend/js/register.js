document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const roleInputs = document.querySelectorAll('input[name="role"]');
  const skillsField = document.getElementById('skillsField');

  // Show/hide skills field based on role
  roleInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (skillsField) {
        skillsField.style.display = input.value === 'student' ? 'block' : 'none';
      }
    });
  });

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked')?.value || 'student';
    const skillsRaw = document.getElementById('skills')?.value || '';
    const skills = skillsRaw.split(',').map(s => s.trim()).filter(s => s);

    if (!name || !email || !password) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';
    }

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, skills })
      });

      setToken(data.token);
      setUser(data.user);
      showToast('Account created successfully!');
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);

    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create account';
      }
    }
  });
});