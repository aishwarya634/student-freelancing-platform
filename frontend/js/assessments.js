const API = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';
const headers = { Authorization: `Bearer ${token}` };

window.addEventListener('DOMContentLoaded', () => {
  setNavAvatar();
  loadAssessments();
});

function setNavAvatar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const el = document.getElementById('navAvatar');
  if (el && user.name) el.textContent = user.name[0].toUpperCase();
}

async function loadAssessments() {
  try {
    const res = await axios.get(`${API}/assessments/my`, { headers });
    render(res.data);
  } catch (err) {
    render(getDemoData());
  }
}

function getDemoData() {
  return {
    completed: [
      {
        _id: '1', projectName: 'E-commerce Dashboard', clientName: 'TechStart Inc.',
        completedDate: '2025-06-01',
        scores: { outcomeQuality: 85, teamwork: 90, onTime: 75, total: 83 },
        certificateUrl: '#'
      },
      {
        _id: '2', projectName: 'Hospital Management System', clientName: 'MedCorp Solutions',
        completedDate: '2025-04-20',
        scores: { outcomeQuality: 92, teamwork: 88, onTime: 95, total: 91 },
        certificateUrl: '#'
      }
    ],
    pending: [
      { _id: '3', projectName: 'Mobile App Redesign', clientName: 'DesignHub Co.' },
      { _id: '4', projectName: 'API Integration Project', clientName: 'DataFlow Inc.' }
    ]
  };
}

function render(data) {
  const completed = data.completed || [];
  const pending = data.pending || [];

  // Summary
  const totalScore = completed.reduce((s, a) => s + (a.scores?.total || 0), 0);
  const avgScore = completed.length ? Math.round(totalScore / completed.length) : 0;
  document.getElementById('sumAvgScore').textContent = completed.length ? avgScore + '%' : '–';
  document.getElementById('sumCompleted').textContent = completed.length;
  document.getElementById('sumPending').textContent = pending.length;
  document.getElementById('sumCerts').textContent = completed.filter(a => a.certificateUrl).length;

  // Completed
  const completedGrid = document.getElementById('completedGrid');
  completedGrid.innerHTML = '';
  if (completed.length === 0) {
    completedGrid.innerHTML = '<p style="color:var(--gray-400);font-size:0.88rem">No completed assessments yet.</p>';
  } else {
    completed.forEach(a => completedGrid.appendChild(buildCompletedCard(a)));
  }

  // Pending
  const pendingGrid = document.getElementById('pendingGrid');
  pendingGrid.innerHTML = '';
  if (pending.length === 0) {
    pendingGrid.innerHTML = '<p style="color:var(--gray-400);font-size:0.88rem">No pending assessments.</p>';
  } else {
    pending.forEach(a => pendingGrid.appendChild(buildPendingCard(a)));
  }
}

function buildCompletedCard(a) {
  const s = a.scores || {};
  const total = s.total || 0;
  const badgeClass = total >= 80 ? 'high' : total >= 60 ? 'mid' : 'low';

  const el = document.createElement('div');
  el.className = 'assessment-card';
  el.innerHTML = `
    <div class="assessment-card__header">
      <div>
        <div class="assessment-card__project">${escapeHtml(a.projectName)}</div>
        <div class="assessment-card__client">${escapeHtml(a.clientName)}</div>
      </div>
      <div class="score-badge score-badge--${badgeClass}">${total}%</div>
    </div>
    <div class="score-breakdown">
      ${scoreItem('Outcome Quality', s.outcomeQuality)}
      ${scoreItem('Teamwork', s.teamwork)}
      ${scoreItem('On Time', s.onTime)}
      ${scoreItem('Total Score', s.total, true)}
    </div>
    ${a.certificateUrl
      ? `<a class="cert-btn" href="${escapeHtml(a.certificateUrl)}" download>🏆 Download Certificate</a>`
      : `<div style="font-size:0.8rem;color:var(--gray-400);text-align:center">Certificate not available</div>`
    }
  `;
  return el;
}

function scoreItem(label, value, bold = false) {
  const v = value || 0;
  return `
    <div class="score-item">
      <div class="score-item__label">${label}</div>
      <div class="score-item__value" ${bold ? 'style="color:var(--teal)"' : ''}>${v}%</div>
      <div class="score-bar"><div class="score-bar__fill" style="width:${v}%"></div></div>
    </div>
  `;
}

function buildPendingCard(a) {
  const el = document.createElement('div');
  el.className = 'pending-card';
  el.innerHTML = `
    <div class="pending-card__project">${escapeHtml(a.projectName)}</div>
    <div class="pending-card__client">${escapeHtml(a.clientName)} · Awaiting client review</div>
    <div class="pending-scores">
      ${pendingScore('Outcome Quality')}
      ${pendingScore('Teamwork')}
      ${pendingScore('On Time')}
      ${pendingScore('Total Score')}
    </div>
  `;
  return el;
}

function pendingScore(label) {
  return `
    <div class="pending-score-item">
      <div class="pending-score-item__label">${label}</div>
      <div class="pending-score-item__value">- - -</div>
    </div>
  `;
}

function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }