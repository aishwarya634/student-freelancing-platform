document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const user = getUser();
  const role = user?.role;

  // Show correct section based on role
  const browseSection = document.getElementById('browseSection');
  const postSection = document.getElementById('postSection');

  if (role === 'client' || role === 'company') {
    if (browseSection) browseSection.style.display = 'none';
    if (postSection) postSection.style.display = 'block';
    setupPostForm();
  } else {
    if (browseSection) browseSection.style.display = 'block';
    if (postSection) postSection.style.display = 'none';
    loadProjects();
  }
});

async function loadProjects() {
  const container = document.getElementById('projectsList');
  const recContainer = document.getElementById('recommendedList');

  if (container) container.innerHTML = '<p>Loading projects...</p>';

  try {
    // Load recommended first
    try {
      const recData = await apiFetch('/projects/recommended');
      if (recContainer && recData.length > 0) {
        recContainer.innerHTML = recData.map(p => projectCard(p, true)).join('');
      } else if (recContainer) {
        recContainer.innerHTML = '<p style="color:#888;padding:10px 0">No matching projects found for your skills yet.</p>';
      }
    } catch (e) {
      if (recContainer) recContainer.innerHTML = '';
    }

    // Load all projects
    const category = document.getElementById('categoryFilter')?.value || '';
    const url = category ? `/projects/?category=${encodeURIComponent(category)}` : '/projects/';
    const projects = await apiFetch(url);

    if (container && projects.length > 0) {
      container.innerHTML = projects.map(p => projectCard(p, false)).join('');
      // Add apply button listeners
      document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.addEventListener('click', () => applyProject(btn.dataset.id));
      });
    } else if (container) {
      container.innerHTML = '<p style="color:#888;padding:16px 0">No projects available right now. Check back soon!</p>';
    }

  } catch (err) {
    if (container) container.innerHTML = `<p style="color:red">Error loading projects: ${err.message}</p>`;
  }
}

function projectCard(p, isRecommended) {
  const matchBadge = p.match_percentage
    ? `<span class="match-badge ${matchClass(p.match_percentage)}">${p.match_percentage}% match</span>`
    : '';
  const recBadge = isRecommended ? '<span class="rec-badge">Recommended</span>' : '';
  return `
    <div class="project-card ${isRecommended ? 'recommended' : ''}">
      <div class="card-header">
        <h3>${p.title || 'Untitled'}</h3>
        <div class="badges">${recBadge}${matchBadge}<span class="tag tag-${p.status}">${p.status}</span></div>
      </div>
      <p class="category"><i>Domain: ${p.category || 'General'}</i></p>
      <p class="outcome"><strong>Outcome:</strong> ${p.outcome || p.description || ''}</p>
      <div class="skills">${(p.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
      <div class="card-footer">
        <span class="type-tag">${p.type === 'team' ? 'Team project' : 'Solo project'}</span>
        <span class="stipend">Stipend ₹${p.stipend || 0}</span>
        <span class="deadline">Due ${formatDate(p.deadline)}</span>
        <button class="apply-btn btn-teal" data-id="${p._id}">Apply</button>
      </div>
    </div>
  `;
}

function matchClass(pct) {
  if (pct >= 80) return 'match-high';
  if (pct >= 50) return 'match-mid';
  return 'match-low';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function applyProject(projectId) {
  const message = prompt('Why are you the right fit for this project?');
  if (!message) return;
  try {
    await apiFetch(`/projects/${projectId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    showToast('Application submitted successfully!');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function setupPostForm() {
  const form = document.getElementById('postProjectForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      outcome: document.getElementById('outcome').value,
      category: document.getElementById('category').value,
      skills: document.getElementById('skills').value.split(',').map(s => s.trim()),
      stipend: parseInt(document.getElementById('stipend').value),
      type: document.getElementById('type').value,
      deadline: document.getElementById('deadline').value,
      milestones: document.getElementById('milestones').value
    };
    try {
      await apiFetch('/projects/', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      showToast('Project posted successfully!');
      form.reset();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// Category filter
document.getElementById('categoryFilter')?.addEventListener('change', loadProjects);