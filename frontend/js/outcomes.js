// js/outcomes.js
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  // Get project id from URL ?id=xxx
  const params    = new URLSearchParams(window.location.search);
  const projectId = params.get('id') || 'demo';

  let milestones = [];

  try {
    const data = await apiFetch(`/projects/${projectId}/milestones`);
    milestones = data.milestones || [];
    renderCountdown(data.deadline);
    renderMilestones(milestones);
  } catch {
    milestones = getDemoMilestones();
    renderCountdown('2025-06-25T23:59:00');
    renderMilestones(milestones);
  }

  // ── Countdown ──
  function renderCountdown(deadlineStr) {
    const box = document.getElementById('countdownBox');
    if (!box || !deadlineStr) return;

    function update() {
      const now  = new Date();
      const end  = new Date(deadlineStr);
      const diff = end - now;

      if (diff <= 0) {
        box.className = 'countdown-box urgent';
        box.querySelector('h4').textContent = '⛔ Deadline has passed!';
        box.querySelector('p').textContent  = 'Please contact your client immediately.';
        document.getElementById('overdueBanner')?.style.setProperty('display', 'flex');
        return;
      }

      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000) / 60000);

      if (days < 2) box.classList.add('urgent');
      else box.classList.remove('urgent');

      box.querySelector('h4').textContent = `${days}d ${hours}h ${mins}m remaining`;
      box.querySelector('p').textContent  =
        `Deadline: ${new Date(deadlineStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
    update();
    setInterval(update, 60000);
  }

  // ── Milestones ──
  function renderMilestones(milestones) {
    const container = document.getElementById('milestonesContainer');
    if (!container) return;

    container.innerHTML = milestones.map((m, mi) => `
      <div class="milestone-card" id="milestone-${mi}">
        <div class="milestone-header">
          <h3>📌 ${m.title}</h3>
          <div style="display:flex;align-items:center;gap:12px">
            <span id="pct-${mi}" class="badge badge-teal">0%</span>
            <button class="btn btn-primary btn-sm" onclick="openSubmit(${mi})">Submit</button>
          </div>
        </div>
        <div class="progress-wrap" style="margin-bottom:16px">
          <div class="progress-bar" id="bar-${mi}" style="width:0%"></div>
        </div>
        <div id="checklist-${mi}">
          ${m.items.map((item, ii) => `
            <label class="checklist-item" id="item-${mi}-${ii}">
              <input type="checkbox" ${item.done ? 'checked' : ''}
                onchange="toggleItem(${mi}, ${ii}, this.checked)">
              <span>${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Compute initial progress for each milestone
    milestones.forEach((_, mi) => updateProgress(mi));
  }

  // ── Toggle checklist item ──
  window.toggleItem = async function(mi, ii, checked) {
    milestones[mi].items[ii].done = checked;
    const itemEl = document.getElementById(`item-${mi}-${ii}`);
    if (itemEl) itemEl.classList.toggle('done', checked);
    updateProgress(mi);

    // Persist to API
    try {
      await apiFetch(`/projects/${projectId}/milestones/${mi}/items/${ii}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: checked })
      });
    } catch { /* optimistic UI, ignore */ }
  };

  function updateProgress(mi) {
    const items = milestones[mi]?.items || [];
    if (!items.length) return;
    const done = items.filter(i => i.done).length;
    const pct  = Math.round((done / items.length) * 100);
    const bar  = document.getElementById(`bar-${mi}`);
    const pctEl = document.getElementById(`pct-${mi}`);
    if (bar)  bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
  }

  // ── Submit modal ──
  window.openSubmit = function(mi) {
    const title = milestones[mi]?.title || 'Milestone';
    const modal = document.getElementById('submitModal');
    document.getElementById('submitModalTitle').textContent = `Submit: ${title}`;
    document.getElementById('submitMilestoneIdx').value = mi;
    modal.style.display = 'flex';
  };

  window.closeSubmit = function() {
    document.getElementById('submitModal').style.display = 'none';
  };

  document.getElementById('submitForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mi    = document.getElementById('submitMilestoneIdx').value;
    const notes = document.getElementById('submitNotes').value;
    const link  = document.getElementById('submitLink').value;
    const btn   = e.target.querySelector('button[type="submit"]');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Submitting…';

    try {
      await apiFetch(`/projects/${projectId}/milestones/${mi}/submit`, {
        method: 'POST',
        body: JSON.stringify({ notes, submissionLink: link })
      });
      showToast('Milestone submitted successfully!');
      closeSubmit();
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Submit Milestone';
    }
  });

  // ── Demo data ──
  function getDemoMilestones() {
    return [
      {
        title: 'Design Phase',
        items: [
          { label: 'Create wireframes in Figma', done: true },
          { label: 'Get client approval on wireframes', done: true },
          { label: 'Design high-fidelity mockups', done: false },
        ]
      },
      {
        title: 'Development Phase',
        items: [
          { label: 'Set up project repository', done: false },
          { label: 'Build homepage layout', done: false },
          { label: 'Integrate contact form', done: false },
          { label: 'Mobile responsive testing', done: false },
        ]
      },
      {
        title: 'Final Delivery',
        items: [
          { label: 'Upload code to GitHub', done: false },
          { label: 'Deploy to hosting', done: false },
          { label: 'Send final report to client', done: false },
        ]
      }
    ];
  }
});