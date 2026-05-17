document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const user = getUser();
  const container = document.getElementById('portfolioList');
  const profileCard = document.getElementById('profileCard');

  if (container) container.innerHTML = '<p>Loading portfolio...</p>';

  try {
    const data = await apiFetch('/portfolio/my');

    // Profile card
    if (profileCard) {
      profileCard.innerHTML = `
        <div class="profile-avatar">${(data.name || 'U').charAt(0).toUpperCase()}</div>
        <div class="profile-info">
          <h2>${data.name || user?.name || 'Student'}</h2>
          <p>${data.projects?.length || 0} projects · ${data.internships?.length || 0} internships · ${data.certificates || 0} certificates · Avg score ${data.score || 0}</p>
        </div>
        <button class="btn-teal" onclick="shareProfile()">Share profile</button>
      `;
    }

    // Projects
    if (container) {
      const projects = data.projects || [];
      const internships = data.internships || [];

      if (projects.length === 0 && internships.length === 0) {
        container.innerHTML = '<p style="color:#888;padding:16px 0">No completed work yet. Complete a project to build your portfolio!</p>';
      } else {
        container.innerHTML = [
          ...projects.map(p => `
            <div class="port-card">
              <div class="port-header">
                <h3>${p.title}</h3>
                <span class="tag tag-done">Completed</span>
              </div>
              <p class="category">Domain: ${p.category || 'General'}</p>
              <div class="skills">${(p.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
              <div class="port-footer">
                <span class="score">Score: ${p.total_score || 0}</span>
                ${p.certificate_issued ? '<span class="cert-badge">Certified</span>' : ''}
              </div>
            </div>
          `),
          ...internships.map(i => `
            <div class="port-card internship">
              <div class="port-header">
                <h3>${i.title}</h3>
                <span class="tag tag-int">Internship</span>
              </div>
              <p class="category">${i.company_name} · ${i.duration_months} months</p>
              <div class="skills">${(i.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
              <div class="port-footer">
                <span class="cert-badge">Completed</span>
              </div>
            </div>
          `)
        ].join('');
      }
    }

  } catch (err) {
    if (container) container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
});

function shareProfile() {
  navigator.clipboard?.writeText(window.location.href);
  showToast('Profile link copied!');
}