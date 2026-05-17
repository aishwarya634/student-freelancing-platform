document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const container = document.getElementById('assessmentsList');
  if (container) container.innerHTML = '<p>Loading assessments...</p>';

  try {
    const assessments = await apiFetch('/assessments/my');

    if (container && assessments.length > 0) {
      container.innerHTML = assessments.map(a => `
        <div class="assessment-card">
          <div class="assessment-header">
            <h3>${a.project_title || 'Project'}</h3>
            <span class="tag tag-done">Completed</span>
          </div>
          <p style="font-size:12px;color:#888;margin-bottom:10px">
            Reviewed on ${formatDate(a.created_at)}
          </p>
          <div class="score-grid">
            <div class="score-box">
              <div class="score-label">Outcome</div>
              <div class="score-val">${a.outcome_score}/10</div>
            </div>
            <div class="score-box">
              <div class="score-label">Teamwork</div>
              <div class="score-val">${a.teamwork_score}/10</div>
            </div>
            <div class="score-box">
              <div class="score-label">On time</div>
              <div class="score-val">${a.time_score}/10</div>
            </div>
            <div class="score-box">
              <div class="score-label">Total</div>
              <div class="score-val highlight">${a.total_score}</div>
            </div>
          </div>
          ${a.certificate_issued ? `
            <div class="cert-row">
              <span>Certificate issued</span>
              <button class="btn-teal" onclick="downloadCert('${a._id}')">Download</button>
            </div>
          ` : ''}
        </div>
      `).join('');
    } else if (container) {
      container.innerHTML = '<p style="color:#888;padding:16px 0">No assessments yet. Complete a project to get scored by a client!</p>';
    }

  } catch (err) {
    if (container) container.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
});

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function downloadCert(id) {
  showToast('Certificate download coming soon!', 'warning');
}