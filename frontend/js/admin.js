// ─── Config ───
const API = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// ─── Admin Guard ───
if (!token) { window.location.href = 'login.html'; }
if (user.role !== 'admin') {
  document.getElementById('accessDenied').style.display = 'flex';
  document.getElementById('adminContent').style.display = 'none';
}
const headers = { Authorization: `Bearer ${token}` };

// ─── Init ───
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adminName').textContent = user.name || 'Admin';
  if (user.role === 'admin') {
    loadStats();
    loadUsers();
    loadProjects();
    loadCompanies();
    loadDisputes();
    setupTabs();
    setupSearch();
  }
});

// ─── Tabs ───
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });
}

// ─── Stats ───
async function loadStats() {
  try {
    const res = await axios.get(`${API}/admin/stats`, { headers });
    setStats(res.data);
  } catch { setStats({ users: 248, activeProjects: 34, stipendPaid: 520000, disputes: 3 }); }
}
function setStats(d) {
  document.getElementById('statUsers').textContent = d.users || 0;
  document.getElementById('statProjects').textContent = d.activeProjects || 0;
  document.getElementById('statStipend').textContent = d.stipendPaid ? '₹' + Number(d.stipendPaid).toLocaleString() : '₹0';
  document.getElementById('statDisputes').textContent = d.disputes || 0;
}

// ─── Users ───
let allUsers = [];
async function loadUsers() {
  try {
    const res = await axios.get(`${API}/admin/users`, { headers });
    allUsers = res.data.users || res.data || [];
  } catch {
    allUsers = getDemoUsers();
  }
  renderUsers(allUsers);
}
function getDemoUsers() {
  return [
    { _id:'1', name:'Arjun Verma', email:'arjun@example.com', role:'student', score:87, status:'active' },
    { _id:'2', name:'Priya Sharma', email:'priya@techstart.com', role:'client', score:null, status:'active' },
    { _id:'3', name:'Rohan Mehta', email:'rohan@example.com', role:'student', score:72, status:'banned' },
    { _id:'4', name:'Admin User', email:'admin@skillbridge.com', role:'admin', score:null, status:'active' },
  ];
}
function renderUsers(list) {
  const tbody = document.getElementById('usersBody');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="5" class="loading-row">No users found</td></tr>'; return; }
  tbody.innerHTML = list.map(u => `
    <tr>
      <td><div class="user-name">${escapeHtml(u.name || '–')}</div><div class="user-email">${escapeHtml(u.email || '')}</div></td>
      <td><span class="badge badge--${u.role}">${u.role || '–'}</span></td>
      <td>${u.score != null ? u.score + '%' : '–'}</td>
      <td><span class="badge badge--${u.status === 'active' ? 'active' : 'banned'}">${u.status || 'active'}</span></td>
      <td>
        ${u.role !== 'admin'
          ? u.status === 'banned'
            ? `<button class="btn btn--unban" onclick="toggleBan('${u._id}', 'unban', '${escapeHtml(u.name)}')">Unban</button>`
            : `<button class="btn btn--ban" onclick="toggleBan('${u._id}', 'ban', '${escapeHtml(u.name)}')">Ban</button>`
          : '<span style="color:var(--gray-400);font-size:0.8rem">–</span>'
        }
      </td>
    </tr>
  `).join('');
}

function setupSearch() {
  document.getElementById('userSearch').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    renderUsers(allUsers.filter(u => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)));
  });
}

function toggleBan(userId, action, name) {
  showConfirm(
    action === 'ban' ? '🚫' : '✅',
    action === 'ban' ? `Ban ${name}?` : `Unban ${name}?`,
    action === 'ban' ? 'This user will lose access to the platform.' : 'This user will regain access.',
    async () => {
      try { await axios.post(`${API}/admin/users/${userId}/ban`, { action }, { headers }); }
      catch { /* demo */ }
      await loadUsers();
    }
  );
}

// ─── Projects ───
async function loadProjects() {
  try {
    const res = await axios.get(`${API}/admin/projects`, { headers });
    renderProjects(res.data.projects || res.data || []);
  } catch { renderProjects(getDemoProjects()); }
}
function getDemoProjects() {
  return [
    { _id:'1', title:'E-commerce Dashboard', client:'TechStart Inc.', status:'in_progress' },
    { _id:'2', title:'Hospital System', client:'MedCorp Solutions', status:'open' },
    { _id:'3', title:'Mobile App', client:'ConnectHub', status:'completed' },
  ];
}
function renderProjects(list) {
  const tbody = document.getElementById('projectsBody');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="4" class="loading-row">No projects found</td></tr>'; return; }
  const statusMap = { open:'open', in_progress:'progress', completed:'completed' };
  tbody.innerHTML = list.map(p => `
    <tr>
      <td><strong>${escapeHtml(p.title || p.name || '–')}</strong></td>
      <td>${escapeHtml(p.client || '–')}</td>
      <td><span class="badge badge--${statusMap[p.status] || 'open'}">${(p.status || 'open').replace('_', ' ')}</span></td>
      <td><button class="btn btn--delete" onclick="deleteProject('${p._id}', '${escapeHtml(p.title || p.name)}')">Delete</button></td>
    </tr>
  `).join('');
}
function deleteProject(id, name) {
  showConfirm('🗑️', `Delete "${name}"?`, 'This project will be permanently removed.', async () => {
    try { await axios.delete(`${API}/admin/projects/${id}`, { headers }); }
    catch { /* demo */ }
    await loadProjects();
  });
}

// ─── Companies ───
async function loadCompanies() {
  try {
    const res = await axios.get(`${API}/admin/companies`, { headers });
    renderCompanies(res.data.companies || res.data || []);
  } catch { renderCompanies(getDemoCompanies()); }
}
function getDemoCompanies() {
  return [
    { _id:'1', name:'TechStart Inc.', email:'hr@techstart.com', verified: true },
    { _id:'2', name:'DataFlow Analytics', email:'contact@dataflow.com', verified: false },
    { _id:'3', name:'MedCorp Solutions', email:'jobs@medcorp.com', verified: true },
  ];
}
function renderCompanies(list) {
  const tbody = document.getElementById('companiesBody');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="4" class="loading-row">No companies found</td></tr>'; return; }
  tbody.innerHTML = list.map(c => `
    <tr>
      <td><strong>${escapeHtml(c.name || '–')}</strong></td>
      <td>${escapeHtml(c.email || '–')}</td>
      <td><span class="badge badge--${c.verified ? 'verified' : 'unverified'}">${c.verified ? '✓ Verified' : 'Unverified'}</span></td>
      <td>${!c.verified ? `<button class="btn btn--verify" onclick="verifyCompany('${c._id}', '${escapeHtml(c.name)}')">Verify</button>` : '<span style="color:var(--gray-400);font-size:0.8rem">–</span>'}</td>
    </tr>
  `).join('');
}
function verifyCompany(id, name) {
  showConfirm('🏢', `Verify "${name}"?`, 'This company will be marked as verified on the platform.', async () => {
    try { await axios.post(`${API}/admin/companies/${id}/verify`, {}, { headers }); }
    catch { /* demo */ }
    await loadCompanies();
  });
}

// ─── Disputes ───
async function loadDisputes() {
  try {
    const res = await axios.get(`${API}/admin/disputes`, { headers });
    renderDisputes(res.data.disputes || res.data || []);
  } catch { renderDisputes(getDemoDisputes()); }
}
function getDemoDisputes() {
  return [
    { _id:'1', project:'Mobile App Redesign', student:'Rohan Mehta', client:'DesignHub Co.', amount:5000 },
    { _id:'2', project:'API Integration', student:'Kavya Nair', client:'DataFlow Inc.', amount:8000 },
  ];
}
function renderDisputes(list) {
  const tbody = document.getElementById('disputesBody');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="5" class="loading-row">No active disputes</td></tr>'; return; }
  tbody.innerHTML = list.map(d => `
    <tr>
      <td><strong>${escapeHtml(d.project || '–')}</strong></td>
      <td>${escapeHtml(d.student || '–')}</td>
      <td>${escapeHtml(d.client || '–')}</td>
      <td>₹${Number(d.amount || 0).toLocaleString()}</td>
      <td><button class="btn btn--refund" onclick="issueRefund('${d._id}', '${escapeHtml(d.project)}', ${d.amount || 0})">Issue Refund</button></td>
    </tr>
  `).join('');
}
function issueRefund(id, project, amount) {
  showConfirm('💸', `Refund for "${project}"?`, `₹${Number(amount).toLocaleString()} will be refunded to the client.`, async () => {
    try { await axios.post(`${API}/admin/disputes/${id}/refund`, {}, { headers }); }
    catch { /* demo */ }
    await loadDisputes();
  });
}

// ─── Confirm Modal ───
function showConfirm(icon, title, msg, onConfirm) {
  document.getElementById('modalIcon').textContent = icon;
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalMsg').textContent = msg;
  document.getElementById('confirmModal').style.display = 'flex';

  const btn = document.getElementById('modalConfirmBtn');
  const newBtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(newBtn, btn);
  newBtn.addEventListener('click', async () => {
    newBtn.textContent = 'Processing…'; newBtn.disabled = true;
    await onConfirm();
    document.getElementById('confirmModal').style.display = 'none';
    newBtn.textContent = 'Confirm'; newBtn.disabled = false;
  });
}

function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }