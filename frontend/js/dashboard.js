checkAuth();

async function renderDashboardMetrics() {
    try {
        // Parallelized network request implementation utilizing existing headers
        const [profileRes, metricsRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/user/profile`),
            axios.get(`${API_BASE_URL}/dashboard/metrics`).catch(() => ({ data: null }))
        ]);

        const profile = profileRes.data;
        document.getElementById('welcomeName').innerText = `Welcome Back, ${profile.name}`;
        document.getElementById('userScore').innerText = profile.score || '100';
        document.getElementById('userEarned').innerText = `$${profile.earnedAmount || '0.00'}`;

        // Fallback default mock logic block to render layout structure in setup configuration phase
        const metrics = metricsRes?.data || {
            activeProjects: 2,
            internships: 1,
            pendingAgreements: 1,
            escrowLocked: 450,
            trackers: [
                { id: "101", title: "E-Commerce State Store Optimization", category: "Projects", progress: 65, type: "soft-blue" },
                { id: "202", title: "Full-Stack Node.js System Intern", category: "Internships", progress: 40, type: "soft-amber" }
            ]
        };

        document.getElementById('countProjects').innerText = metrics.activeProjects;
        document.getElementById('countInternships').innerText = metrics.internships;
        document.getElementById('countAgreements').innerText = metrics.pendingAgreements;
        document.getElementById('countEscrow').innerText = `$${metrics.escrowLocked}`;

        const container = document.getElementById('activeTrackersList');
        if (metrics.trackers.length === 0) {
            container.innerHTML = `<p style="color:#666;">No active items logged inside your workspace pipeline.</p>`;
            return;
        }

        container.innerHTML = metrics.trackers.map(item => `
            <div class="sb-card tracker-card" style="border-left: 6px solid var(--primary);">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4>${item.title}</h4>
                <span style="font-size:0.8rem; font-weight:bold; padding:4px 8px; border-radius:4px; background:var(--${item.type});">
                  ${item.category}
                </span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${item.progress}%;"></div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:#666; margin-top:8px;">
                <span>Completion Status Vector</span>
                <strong>${item.progress}%</strong>
              </div>
              <a href="outcomes.html?id=${item.id}" class="btn-primary" style="display:inline-block; font-size:0.85rem; padding:6px 12px; border-radius:4px; text-decoration:none; margin-top:12px;">Launch Tracker</a>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error fetching dashboard structural contexts:', err);
        // Error visual injection template
        document.getElementById('activeTrackersList').innerHTML = `<p style="color:red;">Failed to correctly connect to active tracker services.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", renderDashboardMetrics);