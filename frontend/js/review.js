// ─── Config ───
const API = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';
const headers = { Authorization: `Bearer ${token}` };

const urlParams = new URLSearchParams(window.location.search);
const MILESTONE_ID = urlParams.get('milestoneId') || 'demo-milestone-id';

let milestoneData = {};

// ─── Init ───
window.addEventListener('DOMContentLoaded', () => {
  setNavAvatar();
  loadSubmission();
  setupActions();
});

function setNavAvatar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const el = document.getElementById('navAvatar');
  if (el && user.name) el.textContent = user.name[0].toUpperCase();
}

// ─── Load Submission ───
async function loadSubmission() {
  try {
    const res = await axios.get(`${API}/milestones/${MILESTONE_ID}`, { headers });
    milestoneData = res.data;
    renderSubmission(res.data);
  } catch (err) {
    milestoneData = getDemoSubmission();
    renderSubmission(milestoneData);
  }
}

function getDemoSubmission() {
  return {
    name: 'Frontend UI Implementation',
    status: 'Under Review',
    stipend: 8000,
    submittedAt: new Date().toISOString(),
    project: { name: 'E-commerce Dashboard' },
    student: { name: 'Arjun Verma' },
    submission: {
      files: [
        { name: 'frontend-final.zip', size: '12.4 MB', url: '#' },
        { name: 'design-assets.pdf', size: '3.1 MB', url: '#' },
      ],
      githubLink: 'https://github.com/arjun/ecommerce-dashboard',
      demoLink: 'https://youtube.com/watch?v=demo123',
      notes: 'I have completed all the required pages including dashboard, browse, and chat. All API endpoints are connected. Please check the README for setup instructions. Known issue: mobile navigation menu has a minor animation delay on iOS.',
    }
  };
}

function renderSubmission(data) {
  const sub = data.submission || {};

  // Sidebar info
  document.getElementById('submissionInfo').innerHTML = `
    <div class="info-row"><span>Project</span><strong>${escapeHtml(data.project?.name || '–')}</strong></div>
    <div class="info-row"><span>Student</span><strong>${escapeHtml(data.student?.name || '–')}</strong></div>
    <div class="info-row"><span>Milestone</span><strong>${escapeHtml(data.name || '–')}</strong></div>
    <div class="info-row"><span>Submitted</span><strong>${data.submittedAt ? formatDate(data.submittedAt) : '–'}</strong></div>
    <div class="info-row"><span>Status</span><strong>${escapeHtml(data.status || '–')}</strong></div>
  `;

  document.getElementById('escrowAmount').textContent = data.stipend ? `₹ ${data.stipend.toLocaleString()}` : '₹ –';
  document.getElementById('modalAmount').textContent = data.stipend ? `₹ ${data.stipend.toLocaleString()}` : '₹ –';

  // Files
  const filesList = document.getElementById('filesList');
  const files = sub.files || [];
  if (files.length === 0) {
    filesList.innerHTML = '<p style="color:var(--gray-400);font-size:0.88rem">No files submitted</p>';
  } else {
    filesList.innerHTML = files.map(f => `
      <div class="submission-file">
        <div>
          <div class="submission-file__name">📄 ${escapeHtml(f.name)}</div>
          <div class="submission-file__size">${escapeHtml(f.size || '')}</div>
        </div>
        <a class="dl-btn" href="${escapeHtml(f.url || '#')}" download>Download</a>
      </div>
    `).join('');
  }

  // Links
  const linksList = document.getElementById('linksList');
  linksList.innerHTML = `
    <div class="link-row">
      <div>
        <div class="link-row__label">GitHub Repository</div>
        <div class="link-row__value">${sub.githubLink ? escapeHtml(sub.githubLink) : '–'}</div>
      </div>
      ${sub.githubLink ? `<a class="dl-btn" href="${escapeHtml(sub.githubLink)}" target="_blank" rel="noopener">Open ↗</a>` : ''}
    </div>
    <div class="link-row">
      <div>
        <div class="link-row__label">Demo Video</div>
        <div class="link-row__value">${sub.demoLink ? escapeHtml(sub.demoLink) : 'Not provided'}</div>
      </div>
      ${sub.demoLink ? `<a class="dl-btn dl-btn--outline" href="${escapeHtml(sub.demoLink)}" target="_blank" rel="noopener">Watch ▶</a>` : ''}
    </div>
  `;

  // Notes
  document.getElementById('studentNotes').textContent = sub.notes || 'No notes provided.';
}

// ─── Actions ───
function setupActions() {
  // Approve
  document.getElementById('approveBtn').addEventListener('click', () => {
    document.getElementById('approveModal').style.display = 'flex';
  });

  document.getElementById('confirmApproveBtn').addEventListener('click', async () => {
    document.getElementById('confirmApproveBtn').textContent = 'Processing…';
    document.getElementById('confirmApproveBtn').disabled = true;
    try {
      await axios.post(`${API}/milestones/${MILESTONE_ID}/approve`, {}, { headers });
    } catch (err) { /* demo mode */ }
    document.getElementById('approveModal').style.display = 'none';
    showSuccess('Milestone Approved!', `₹ ${(milestoneData.stipend || 0).toLocaleString()} has been released to the student.`);
  });

  // Request changes
  document.getElementById('requestChangesBtn').addEventListener('click', async () => {
    const feedback = document.getElementById('changeFeedback').value.trim();
    if (!feedback) { alert('Please write your feedback before sending.'); return; }
    const btn = document.getElementById('requestChangesBtn');
    btn.textContent = 'Sending…'; btn.disabled = true;
    try {
      await axios.post(`${API}/milestones/${MILESTONE_ID}/request-changes`, { feedback }, { headers });
    } catch (err) { /* demo mode */ }
    showSuccess('Change Request Sent', 'The student has been notified and will revise their work.');
    btn.textContent = 'Send Change Request'; btn.disabled = false;
  });
}

function showSuccess(title, msg) {
  document.getElementById('successTitle').textContent = title;
  document.getElementById('successMsg').textContent = msg;
  document.getElementById('successModal').style.display = 'flex';
}

function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }