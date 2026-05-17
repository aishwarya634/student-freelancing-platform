document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const user = getUser();
  if (user?.role !== 'admin') {
    showToast('Admin access only', 'error');
    setTimeout(() => window.location.href = '/dashboard.html', 1500);
    return;
  }

  loadStats();
  loadUsers();
  loadProjects();
  loadCompanies();
  loadDisputes();
});

async function loadStats() {
  try {
    const data = await apiFetch('/admin/stats');
    document.getElementById('statUsers').textContent = data.total_users ?? 0;
    document.getElementById('statProjects').textContent = data.total_projects ?? 0;
    document.getElementById('statActive').textContent = data.active_projects ?? 0;
    document.getElementById('statDisputes').textContent = data.disputes ?? 0;
  } catch (err) {
    showToast('Could not load stats', 'error');
  }
}

async function loadUsers() {
  const container = document.getElementById('usersList');
  if (!container) return;
  try {
    const users = await apiFetch('/admin/users');
    if (users.length === 0) {
      container.innerHTML = '<tr><td colspan="5">No users yet</td></tr>';
      return;
    }
    container.innerHTML = users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><span class="tag tag-${u.role}">${u.role}</span></td>
        <td>${u.score ?? 0}</td>
        <td><span class="tag tag-${u.status === 'banned' ? 'warn' : 'done'}">${u.status || 'active'}</span></td>
        <td>
          ${u.status === 'banned'
            ? `<button class="btn-small btn-teal" onclick="unbanUser('${u._id}')">Unban</button>`
            : `<button class="btn-small btn-red" onclick="banUser('${u._id}')">Ban</button>`
          }
        </td>
      </tr>
    `).join('');
  } catch (err) {
    if (container) container.innerHTML = `<tr><td colspan="5">Error: ${err.message}</td></tr>`;
  }
}

async function loadProjects() {
  const container = document.getElementById('projectsList');
  if (!container) return;
  try {
    const projects = await apiFetch('/admin/projects');
    if (projects.length === 0) {
      container.innerHTML = '<tr><td colspan="4">No projects yet</td></tr>';
      return;
    }
    container.innerHTML = projects.map(p => `
      <tr>
        <td>${p.title}</td>
        <td>${p.category || 'General'}</td>
        <td><span class="tag tag-${p.status}">${p.status}</span></td>
        <td><button class="btn-small btn-red" onclick="deleteProject('${p._id}')">Delete</button></td>
      </tr>
    `).join('');
  } catch (err) {
    if (container) container.innerHTML = `<tr><td colspan="4">Error: ${err.message}</td></tr>`;
  }
}

async function loadCompanies() {
  const container = document.getElementById('companiesList');
  if (!container) return;
  try {
    const users = await apiFetch('/admin/users');
    const companies = users.filter(u => u.role === 'company');
    if (companies.length === 0) {
      container.innerHTML = '<tr><td colspan="4">No companies yet</td></tr>';
      return;
    }
    container.innerHTML = companies.map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.email}</td>
        <td><span class="tag tag-${c.verified ? 'done' : 'warn'}">${c.verified ? 'Verified' : 'Pending'}</span></td>
        <td>
          ${!c.verified
            ? `<button class="btn-small btn-teal" onclick="verifyCompany('${c._id}')">Verify</button>`
            : '<span style="color:#888">Verified</span>'
          }
        </td>
      </tr>
    `).join('');
  } catch (err) {
    if (container) container.innerHTML = `<tr><td colspan="4">Error: ${err.message}</td></tr>`;
  }
}

async function loadDisputes() {
  const container = document.getElementById('disputesList');
  if (!container) return;
  try {
    const agreements = await apiFetch('/agreements/my');
    const disputes = agreements.filter(a => a.status === 'violated');
    if (disputes.length === 0) {
      container.innerHTML = '<tr><td colspan="4">No disputes</td></tr>';
      return;
    }
    container.innerHTML = disputes.map(d => `
      <tr>
        <td>${d.project_id}</td>
        <td>${d.student_id}</td>
        <td>${d.client_id}</td>
        <td><button class="btn-small btn-red" onclick="refund('${d._id}')">Refund client</button></td>
      </tr>
    `).join('');
  } catch (err) {
    if (container) container.innerHTML = `<tr><td colspan="4">Error: ${err.message}</td></tr>`;
  }
}

async function banUser(id) {
  if (!confirm('Are you sure you want to ban this user?')) return;
  try {
    await apiFetch(`/admin/users/${id}/ban`, { method: 'POST' });
    showToast('User banned successfully');
    loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function unbanUser(id) {
  try {
    await apiFetch(`/admin/users/${id}/unban`, { method: 'POST' });
    showToast('User unbanned successfully');
    loadUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  try {
    await apiFetch(`/admin/projects/${id}`, { method: 'DELETE' });
    showToast('Project deleted');
    loadProjects();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function verifyCompany(id) {
  try {
    await apiFetch(`/admin/companies/${id}/verify`, { method: 'POST' });
    showToast('Company verified!');
    loadCompanies();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function refund(id) {
  if (!confirm('Process refund for this dispute?')) return;
  try {
    await apiFetch(`/admin/disputes/${id}/refund`, { method: 'POST' });
    showToast('Refund processed');
    loadDisputes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}