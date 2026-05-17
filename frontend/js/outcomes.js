document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const container = document.getElementById('outcomesList');
  if (container) container.innerHTML = '<p>Loading milestones...</p>';

  try {
    const agreements = await apiFetch('/agreements/my');
    const user = getUser();
    const activeAgreements = agreements.filter(a => a.status === 'active');

    if (activeAgreements.length === 0) {
      if (container) container.innerHTML = '<p style="color:#888;padding:16px 0">No active projects yet. Accept an agreement to start working!</p>';
      return;
    }

    let html = '';
    for (const agreement of activeAgreements) {
      const milestones = await apiFetch(`/milestones/project/${agreement.project_id}`);
      const deadlinePassed = new Date(agreement.deadline) < new Date();

      html += `
        <div class="outcome-section">
          <div class="outcome-header">
            <h3>Project: ${agreement.project_id}</h3>
            <span>Deadline: ${formatDate(agreement.deadline)}</span>
            ${deadlinePassed ? '<span class="deadline-warn">DEADLINE PASSED — Penalty may apply!</span>' : ''}
          </div>
          ${milestones.length > 0 ? milestones.map((m, i) => milestoneCard(m, i)).join('') : '<p style="color:#888">No milestones defined yet.</p>'}
        </div>
      `;
    }

    if (container) container.innerHTML = html;

    document.querySelectorAll('.submit-milestone-btn').forEach(btn => {
      btn.addEventListener('click', () => openSubmitForm(btn.dataset.id));
    });

  } catch (err) {
    if (container) container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
});

function milestoneCard(m, index) {
  const statusClass = {
    'pending': 'tag-warn',
    'submitted': 'tag-blue',
    'changes-requested': 'tag-red',
    'approved': 'tag-done'
  }[m.status] || 'tag-warn';

  const checklist = m.outcome_checklist || [];
  const completed = checklist.filter(c => c.done).length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const deadlineWarn = m.deadline && new Date(m.deadline) < new Date() && m.status !== 'approved';

  return `
    <div class="milestone-card ${m.status === 'approved' ? 'approved' : ''}">
      <div class="milestone-header">
        <h4>Milestone ${index + 1}: ${m.name || 'Unnamed'}</h4>
        <span class="tag ${statusClass}">${m.status}</span>
      </div>
      <p class="outcome-desc">${m.description || ''}</p>
      ${checklist.length > 0 ? `
        <div class="checklist">
          ${checklist.map(c => `
            <div class="check-item">
              <input type="checkbox" ${c.done ? 'checked' : ''} disabled>
              <span class="${c.done ? 'done' : ''}">${c.item}</span>
            </div>
          `).join('')}
        </div>
        <div class="progress-wrap">
          <div class="progress-bar" style="width:${pct}%"></div>
        </div>
        <p style="font-size:11px;color:#888">${completed} of ${total} items done</p>
      ` : ''}
      <div class="milestone-footer">
        <span class="stipend">Stipend: ₹${m.stipend || 0}</span>
        <span>Due: ${formatDate(m.deadline)}</span>
        ${deadlineWarn ? '<span class="deadline-warn">Overdue!</span>' : ''}
        ${m.status === 'changes-requested' ? `<div class="feedback-box"><strong>Client feedback:</strong> ${m.client_feedback}</div>` : ''}
        ${m.status !== 'approved' ? `<button class="btn-teal submit-milestone-btn" data-id="${m._id}">Submit work</button>` : '<span class="approved-badge">Approved ✓</span>'}
      </div>
    </div>
  `;
}

function openSubmitForm(milestoneId) {
  window.location.href = `/submit.html?milestone=${milestoneId}`;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}