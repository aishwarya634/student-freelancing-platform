// Toggle active CSS layouts inside the custom Radio selection matrix
const subRoles = document.querySelectorAll('input[name="role"]');
subRoles.forEach(element => {
    element.addEventListener('change', (e) => {
        document.querySelectorAll('.role-box').forEach(box => box.classList.remove('active'));
        e.target.parentElement.classList.add('active');
        
        // Hide structural skills entry field array if registration is not a Student layout
        const skillsWrapper = document.getElementById('skillsWrapper');
        if (e.target.value !== 'Student') {
            skillsWrapper.style.display = 'none';
        } else {
            skillsWrapper.style.display = 'block';
        }
    });
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const role = document.querySelector('input[name="role"]:checked').value;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const skillsVal = document.getElementById('skills').value;
    
    let skills = [];
    if (role === 'Student' && skillsVal.trim() !== "") {
        skills = skillsVal.split(',').map(item => item.trim());
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
            role,
            name,
            email,
            password,
            ...(role === 'Student' && { skills })
        });

        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            window.location.href = 'dashboard.html';
        } else {
            alert('Registration completed but no authorization payload was returned.');
        }
    } catch (error) {
        console.error(error);
        alert('Registration execution fault: ' + (error.response?.data?.message || 'Check connection parameters.'));
    }
});