// js/projects.js
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  let allProjects = [];
  let activeCategory = '';

  // ── Load projects ──
  try {
    const data = await apiFetch('/projects');
    allProjects = data.projects || data || [];
  } catch {
    // Demo data
    allProjects = getDemoProjects();
  }

  renderProjects(allProjects);

  // ── Category cards ──
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.cat;
      if (activeCategory === cat) {
        activeCategory = '';
        card.classList.remove('active');
        renderProjects(filterProjects());
        return;
      }
      document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeCategory = cat;
      renderProjects(filterProjects());
    });
  });

  // ── Recommended category click ──
  document.querySelectorAll('.rec-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.cat;
      activeCategory = cat;
      document.querySelectorAll('.cat-card').forEach(c => {
        c.classList.toggle('active', c.dataset.cat === cat);
      });
      renderProjects(filterProjects());
      document.getElementById('projectsGrid')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ── Search + filters ──
  let searchTimer;
  document.getElementById('searchInput')?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderProjects(filterProjects()), 300);
  });
  document.getElementById('typeFilter')?.addEventListener('change', () => renderProjects(filterProjects()));
  document.getElementById('stipendFilter')?.addEventListener('change', () => renderProjects(filterProjects()));

  // ── Chip filters ──
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('chip-active'));
      chip.classList.add('chip-active');
      renderProjects(filterProjects());
    });
  });

  // ── Helpers ──
  function filterProjects() {
    const search  = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const type    = document.getElementById('typeFilter')?.value || '';
    const stipend = document.getElementById('stipendFilter')?.value || '';
    const chip    = document.querySelector('.chip.chip-active')?.dataset.filter || '';

    return allProjects.filter(p => {
      const matchSearch  = !search  || p.title.toLowerCase().includes(search) || (p.skills || []).some(s => s.toLowerCase().includes(search));
      const matchType    = !type    || p.type === type;
      const matchStipend = !stipend || checkStipend(p.stipend, stipend);
      const matchCat     = !activeCategory || p.category === activeCategory;
      const matchChip    = !chip    || p.type === chip;
      return matchSearch && matchType && matchStipend && matchCat && matchChip;
    });
  }

  function checkStipend(stipend, filter) {
    if (!stipend && stipend !== 0) return true;
    if (filter === 'free') return stipend === 0;
    if (filter === 'paid') return stipend > 0;
    if (filter === '5000') return stipend >= 5000;
    return true;
  }

  function renderProjects(list) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '<p style="color:var(--text-muted);padding:20px 0;grid-column:1/-1">No projects match your filters.</p>';
      return;
    }
    grid.innerHTML = list.map(p => `
      <div class="project-card">
        <div class="project-card-top">
          <div>
            <span class="badge badge-blue" style="margin-bottom:8px">${p.category || 'General'}</span>
            <h3>${p.title}</h3>
            <p class="outcome">${p.outcome || 'Deliverable defined by client'}</p>
          </div>
          <span class="badge ${p.type === 'paid' ? 'badge-teal' : 'badge-amber'}">${p.type || 'paid'}</span>
        </div>
        <div class="skill-tags">
          ${(p.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
        <div class="project-card-footer">
          <span class="stipend">${p.stipend ? '₹' + p.stipend.toLocaleString() : 'Free'}</span>
          <span class="deadline">📅 ${p.deadline ? formatDate(p.deadline) : 'Open deadline'}</span>
          <a href="agreements.html?id=${p._id || p.id}" class="btn btn-primary btn-sm">Apply</a>
        </div>
      </div>
    `).join('');
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function getDemoProjects() {
    return [
      { _id:'1', title:'Build a Portfolio Website', category:'Web Dev', type:'paid', stipend:4000, skills:['HTML','CSS','JS'], outcome:'Fully functional portfolio site', deadline:'2025-07-15' },
      { _id:'2', title:'Design a Logo for Startup', category:'Design', type:'paid', stipend:2500, skills:['Figma','Branding'], outcome:'Logo + brand guide', deadline:'2025-07-01' },
      { _id:'3', title:'Write SEO Blog Articles', category:'Content', type:'paid', stipend:1500, skills:['Writing','SEO'], outcome:'5 articles, 800 words each', deadline:'2025-06-25' },
      { _id:'4', title:'Automate Excel Reports', category:'Data', type:'paid', stipend:3000, skills:['Python','Excel'], outcome:'Python script + documentation', deadline:'2025-07-10' },
      { _id:'5', title:'Social Media Content Plan', category:'Marketing', type:'free', stipend:0, skills:['Canva','Social Media'], outcome:'30-day content calendar', deadline:'2025-06-30' },
      { _id:'6', title:'React Dashboard UI', category:'Web Dev', type:'paid', stipend:8000, skills:['React','Tailwind'], outcome:'Responsive dashboard component', deadline:'2025-07-20' },
    ];
  }
});