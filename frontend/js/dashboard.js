document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const user = getUser();
  if (user?.name) {
    const nameEl = document.getElementById('welcomeName');
    if (nameEl) nameEl.textContent = user.name;
  }

  try {
    const data = await apiFetch('/dashboard/');

    if (data.user) {
      const nameEl = document.getElementById('welcomeName');
      const scoreEl = document.getElementById('welcomeScore');
      const earnedEl = document.getElementById('welcomeEarned');
      if (nameEl) nameEl.textContent = data.user.name || user?.name || 'User';
      if (scoreEl) scoreEl.textContent = data.user.score ?? 0;
      if (earnedEl) earnedEl.textContent = data.user.totalEarned != null
        ? `₹${data.user.totalEarned.toLocaleString()}` : '₹0';
    }

    const statProjects = document.getElementById('statProjects');
    const statInternships = document.getElementById('statInternships');
    const statAgreements = document.getElementById('statAgreements');
    const statEscrow = document.getElementById('statEscrow');

    if (statProjects) statProjects.textContent = data.stats?.projects ?? 0;
    if (statInternships) statInternships.textContent = data.stats?.internships ?? 0;
    if (statAgreements) statAgreements.textContent = data.stats?.agreements ?? 0;
    if (statEscrow) statEscrow.textContent = data.stats?.escrow != null
      ? `₹${data.stats.escrow.toLocaleString()}` : '₹0';

    const projList = document.getElementById('activeProjects');
    const role = data.user?.role;

    if (role === 'student') {
      if (projList && data.activeProjects?.length) {
        projList.innerHTML = data.activeProjects.map(p => `
          <div class="project-row">
            <div class="project-row-info">
              <h4>${p.title}</h4>
              <p>Due ${formatDate(p.deadline)}</p>
              <div class="progress-wrap">
                <div class="progress-bar" style="width:${p.progress || 0}%"></div>
              </div>
            </div>
            <span class="project-pct">${p.progress || 0}%</span>
          </div>
        `).join('');
      } else if (projList) {
        projList.innerHTML = '<p style="padding:16px 0;color:#888">No active projects yet. <a href="projects.html">Browse projects</a></p>';
      }
    } else if (role === 'client') {
      if (projList && data.myProjects?.length) {
        projList.innerHTML = data.myProjects.map(p => `
          <div class="project-row">
            <div class="project-row-info">
              <h4>${p.title}</h4>
              <p>Status: ${p.status} · Due ${formatDate(p.deadline)}</p>
            </div>
            <span class="tag">${p.status}</span>
          </div>
        `).join('');
      } else if (projList) {
        projList.innerHTML = '<p style="padding:16px 0;color:#888">No projects posted yet. <a href="post-project.html">Post a project</a></p>';
      }
    } else if (role === 'admin') {
      if (projList) {
        projList.innerHTML = `
          <div class="project-row">
            <div class="project-row-info">
              <h4>Total Users: ${data.stats?.totalUsers ?? 0}</h4>
              <p>Active Projects: ${data.stats?.activeProjects ?? 0}</p>
            </div>
            <a href="admin.html">Manage</a>
          </div>
        `;
      }
    }

  } catch (err) {
    console.error('Dashboard error:', err.message);
    const projList = document.getElementById('activeProjects');
    if (projList) {
      projList.innerHTML = '<p style="padding:16px 0;color:#888">Could not load data. Please check your connection.</p>';
    }
  }
});

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}