document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const user = getUser();
  if (user?.role !== 'client') {
    showToast('Client access only', 'error');
    setTimeout(() => window.location.href = '/dashboard.html', 1500);
    return;
  }

  loadPendingMilestones();
});

async function loadPendingMilestones() {
  const container = document.getElementById('reviewList');
  if (container) container.innerHTML = '<p>Loading submissions...</p>';

  try {
    const agreements = await apiFetch('/agreements/my');
    const activeAgreements = agreements.filter(a => a.status === 'active');

    if (activeAgreements.length === 0) {
      if (container) container.innerHTML = '<p style="color:#888;padding:16px 0">No active projects yet.</p>';
      return;
    }

    let html = '';
    for (const agreement of activeAgreements) {
      const milestones = await apiFetch(`/milestones/project/${agreement.project_id}`);
      const submitted = milestones.filter(m => m.status === 'submitted' || m.status === 'changes-requested');

      if (submitted.length > 0) {
        html += submitted.map(m => reviewCard(m)).join('');
      }
    }

    if (container) {
      container.innerHTML = html || '<p style="color:#888;padding:16px 0">No submissions to review yet.</p>';
    }

  } catch (err) {
    if (container) container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
}

function reviewCard(m) {
  return `
    <div class="review-card" id="review-${m._id}">
      <div class="review-header">
        <h3>${m.name || 'Milestone'}</h3>
        <span class="tag tag-warn">${m.status}</span>
      </div>
      <div class="submission-details">
        ${m.github_link ? `
          <div class="link-row">
            <span>GitHub:</span>
            <a href="${m.github_link}" target="_blank">${m.github_link}</a>
          </div>
        ` : ''}
        ${m.video_link ? `
          <div class="link-row">
            <span>Demo video:</span>
            <a href="${m.video_link}" target="_blank">${m.video_link}</a>
          </div>
        ` : ''}
        ${m.submitted_files?.length > 0 ? `
          <div class="files-row">
            <span>Files:</span>
            ${m.submitted_files.map(f => `<span class="file-badge">${f}</span>`).join('')}
          </div>
        ` : ''}
        ${m.student_notes ? `
          <div class="notes-box">
            <strong>Student notes:</strong>
            <p>${m.student_notes}</p>
          </div>
        ` : ''}
      </div>
      <div class="review-actions">
        <div class="approve-section">
          <button class="btn-teal" onclick="approveMilestone('${m._id}')">
            Approve and release ₹${m.stipend || 0}
          </button>
        </div>
        <div class="changes-section">
          <textarea id="feedback-${m._id}" placeholder="What needs to be changed? Be specific..."></textarea>
          <button class="btn-red" onclick="requestChanges('${m._id}')">
            Request changes
          </button>
        </div>
      </div>
    </div>
  `;
}

async function approveMilestone(id) {
  if (!confirm('Approve this milestone and release payment?')) return;
  try {
    await apiFetch(`/milestones/${id}/approve`, { method: 'POST' });
    showToast('Milestone approved! Payment released.');
    loadPendingMilestones();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function requestChanges(id) {
  const feedback = document.getElementById(`feedback-${id}`)?.value.trim();
  if (!feedback) {
    showToast('Please enter feedback before requesting changes', 'error');
    return;
  }
  try {
    await apiFetch(`/milestones/${id}/request-changes`, {
      method: 'POST',
      body: JSON.stringify({ feedback })
    });
    showToast('Change request sent to student');
    loadPendingMilestones();
  } catch (err) {
    showToast(err.message, 'error');
  }
}