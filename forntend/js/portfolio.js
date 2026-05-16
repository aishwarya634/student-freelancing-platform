const API = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';
const headers = { Authorization: `Bearer ${token}` };

window.addEventListener('DOMContentLoaded', () => {
  setNavAvatar();
  loadPortfolio();
  setupShareBtn();
});

function setNavAvatar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const el = document.getElementById('navAvatar');
  if (el && user.name) el.textContent = user.name[0].toUpperCase();
}

async function loadPortfolio() {
  try {
    const res = await axios.get(`${API}/portfolio/my`, { headers });
    render(res.data);
  } catch (err) {
    render(getDemoData());
  }
}

function getDemoData() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return {
    student: { name: user.name || 'Student Name', role: 'Full-Stack Developer', skills: ['React', 'Node.js', 'MongoDB', 'UI/UX'] },
    stats: { projects: 5, avgScore: 87, earned: 42000 },
    projects: [
      { _id:'1', name:'E-commerce Dashboard', client:'TechStart Inc.', tags:['React','Node.js','MongoDB'], rating:4.5, score:85, emoji:'🛒' },
      { _id:'2', name:'Hospital Management System', client:'MedCorp Solutions', tags:['Vue.js','Express','MySQL'], rating:5, score:92, emoji:'🏥' },
      { _id:'3', name:'Social Media App', client:'ConnectHub', tags:['React Native','Firebase'], rating:4, score:78, emoji:'📱' },
    ],
    internships: [
      { _id:'1', company:'InnovateTech', role:'Frontend Developer Intern', duration:'3 months', status:'Completed', emoji:'💻' },
      { _id:'2', company:'DataFlow Analytics', role:'Data Science Intern', duration:'2 months', status:'Completed', emoji:'📊' },
    ]
  };
}

function render(data) {
  // Profile card
  const student = data.student || {};
  const stats = data.stats || {};
  document.getElementById('profileAvatar').textContent = (student.name || 'S')[0].toUpperCase();
  document.getElementById('profileName').textContent = student.name || '–';
  document.getElementById('profileRole').textContent = student.role || 'Student';
  document.getElementById('statProjects').textContent = stats.projects || 0;
  document.getElementById('statScore').textContent = stats.avgScore ? stats.avgScore + '%' : '–';
  document.getElementById('statEarned').textContent = stats.earned ? '₹' + stats.earned.toLocaleString() : '–';

  const skillsEl = document.getElementById('profileSkills');
  (student.skills || []).forEach(skill => {
    const s = document.createElement('span');
    s.className = 'skill-tag';
    s.textContent = skill;
    skillsEl.appendChild(s);
  });

  // Projects
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  (data.projects || []).forEach(p => grid.appendChild(buildProjectCard(p)));

  // Internships
  const list = document.getElementById('internshipList');
  list.innerHTML = '';
  (data.internships || []).forEach(i => list.appendChild(buildInternshipCard(i)));
}

function buildProjectCard(p) {
  const el = document.createElement('div');
  el.className = 'project-card';
  const stars = renderStars(p.rating || 0);
  el.innerHTML = `
    <div class="project-card__banner">${p.emoji || '🚀'}</div>
    <div class="project-card__body">
      <div class="project-card__title">${escapeHtml(p.name)}</div>
      <div class="project-card__client">${escapeHtml(p.client || '–')}</div>
      <div class="project-card__tags">${(p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="project-card__footer">
        <span class="stars">${stars}</span>
        <span class="score-pill">${p.score || 0}%</span>
      </div>
    </div>
  `;
  return el;
}

function buildInternshipCard(i) {
  const el = document.createElement('div');
  el.className = 'internship-card';
  el.innerHTML = `
    <div class="internship-logo">${i.emoji || '🏢'}</div>
    <div class="internship-card__info">
      <div class="internship-card__company">${escapeHtml(i.company)}</div>
      <div class="internship-card__role">${escapeHtml(i.role || '')}</div>
    </div>
    <div class="internship-card__right">
      <span class="internship-duration">${escapeHtml(i.duration || '')}</span>
      <span class="internship-badge">${escapeHtml(i.status || 'Completed')}</span>
    </div>
  `;
  return el;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function setupShareBtn() {
  document.getElementById('shareBtn').addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const url = `${window.location.origin}/portfolio.html?user=${user._id || user.id || 'me'}`;
    navigator.clipboard.writeText(url).catch(() => {});
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  });
}

function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }