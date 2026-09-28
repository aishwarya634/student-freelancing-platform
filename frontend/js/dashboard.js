<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

=======
// js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  // Show user name immediately from localStorage while data loads
>>>>>>> aaaa567 (Clean up project files and environment)
  const user = getUser();
  if (user?.name) {
    const nameEl = document.getElementById('welcomeName');
    if (nameEl) nameEl.textContent = user.name;
  }

  try {
<<<<<<< HEAD
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
=======
    const data = await apiFetch('/dashboard');

    // ── Welcome banner ──
    if (data.user) {
      document.getElementById('welcomeName').textContent = data.user.name || 'Student';
      document.getElementById('welcomeScore').textContent = data.user.score ?? '—';
      document.getElementById('welcomeEarned').textContent =
        data.user.totalEarned != null ? `₹${data.user.totalEarned.toLocaleString()}` : '₹0';
    }

    // ── Stat cards ──
    document.getElementById('statProjects').textContent   = data.stats?.projects ?? 0;
    document.getElementById('statInternships').textContent = data.stats?.internships ?? 0;
    document.getElementById('statAgreements').textContent  = data.stats?.agreements ?? 0;
    document.getElementById('statEscrow').textContent      =
      data.stats?.escrow != null ? `₹${data.stats.escrow.toLocaleString()}` : '₹0';

    // ── Active projects ──
    const projList = document.getElementById('activeProjects');
    if (projList && data.activeProjects?.length) {
      projList.innerHTML = data.activeProjects.map(p => `
        <div class="project-row">
          <div class="project-row-icon">📁</div>
          <div class="project-row-info">
            <h4>${p.title}</h4>
            <p>${p.client || 'Client'} · Due ${formatDate(p.deadline)}</p>
            <div class="progress-wrap">
              <div class="progress-bar" style="width:${p.progress || 0}%"></div>
            </div>
          </div>
          <span class="project-pct">${p.progress || 0}%</span>
        </div>
      `).join('');
    } else if (projList) {
      projList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;padding:16px 0;">No active projects yet. <a href="projects.html" style="color:var(--teal)">Browse projects →</a></p>';
    }
  } catch (err) {
    console.warn('Dashboard API not available:', err.message);
    // Show demo data so the page still looks good
    renderDemoData();
>>>>>>> aaaa567 (Clean up project files and environment)
  }
});

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
<<<<<<< HEAD
=======
}

function renderDemoData() {
  const user = getUser();
  document.getElementById('welcomeName').textContent = user?.name || 'Student';
  document.getElementById('welcomeScore').textContent = '820';
  document.getElementById('welcomeEarned').textContent = '₹12,000';
  document.getElementById('statProjects').textContent = '3';
  document.getElementById('statInternships').textContent = '1';
  document.getElementById('statAgreements').textContent = '2';
  document.getElementById('statEscrow').textContent = '₹5,000';

  const projList = document.getElementById('activeProjects');
  if (projList) {
    projList.innerHTML = `
      <div class="project-row">
        <div class="project-row-icon">🎨</div>
        <div class="project-row-info">
          <h4>E-commerce UI Redesign</h4>
          <p>Ravi Stores · Due 20 Jun</p>
          <div class="progress-wrap"><div class="progress-bar" style="width:65%"></div></div>
        </div>
        <span class="project-pct">65%</span>
      </div>
      <div class="project-row">
        <div class="project-row-icon">💻</div>
        <div class="project-row-info">
          <h4>REST API Integration</h4>
          <p>TechMart · Due 28 Jun</p>
          <div class="progress-wrap"><div class="progress-bar" style="width:30%"></div></div>
        </div>
        <span class="project-pct">30%</span>
      </div>
    `;
  }
>>>>>>> aaaa567 (Clean up project files and environment)
}