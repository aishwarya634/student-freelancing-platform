// ─── Config ───
const API = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';
const headers = { Authorization: `Bearer ${token}` };

// Get milestone ID from URL: submit.html?milestoneId=abc123
const urlParams = new URLSearchParams(window.location.search);
const MILESTONE_ID = urlParams.get('milestoneId') || 'demo-milestone-id';

let uploadedFiles = [];

// ─── Init ───
window.addEventListener('DOMContentLoaded', () => {
  setNavAvatar();
  loadMilestoneDetails();
  setupDropzone();
  setupSubmitButton();
  setupInputWatchers();
});

// ─── Avatar ───
function setNavAvatar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const el = document.getElementById('navAvatar');
  if (el && user.name) el.textContent = user.name[0].toUpperCase();
}

// ─── Load Milestone ───
async function loadMilestoneDetails() {
  try {
    const res = await axios.get(`${API}/milestones/${MILESTONE_ID}`, { headers });
    populateMilestone(res.data);
  } catch (err) {
    populateMilestone(getDemoMilestone());
  }
}

function getDemoMilestone() {
  return {
    name: 'Frontend UI Implementation',
    status: 'In Progress',
    dueDate: '2025-08-15',
    stipend: 8000,
    project: { name: 'E-commerce Dashboard', client: { name: 'TechStart Inc.' } },
    checklist: [
      'All pages are responsive',
      'All API endpoints connected',
      'Code is well commented',
      'README is updated'
    ]
  };
}

function populateMilestone(data) {
  document.getElementById('milestoneName').textContent = data.name || 'Milestone';
  document.getElementById('milestoneStatus').textContent = data.status || 'In Progress';
  document.getElementById('milestoneDue').textContent = data.dueDate ? formatDate(data.dueDate) : '–';
  document.getElementById('milestoneStipend').textContent = data.stipend ? `₹${data.stipend.toLocaleString()}` : '–';
  document.getElementById('projName').textContent = data.project?.name || '–';
  document.getElementById('projClient').textContent = data.project?.client?.name || '–';
  document.getElementById('projMilestone').textContent = data.name || '–';

  const checklist = document.getElementById('checklist');
  (data.checklist || []).forEach(item => {
    const el = document.createElement('label');
    el.className = 'checklist-item';
    el.innerHTML = `<input type="checkbox"/> ${escapeHtml(item)}`;
    checklist.appendChild(el);
  });
}

// ─── Dropzone ───
function setupDropzone() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', e => {
    e.preventDefault(); dropzone.classList.add('drag-over');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault(); dropzone.classList.remove('drag-over');
    handleFiles(Array.from(e.dataTransfer.files));
  });

  fileInput.addEventListener('change', () => {
    handleFiles(Array.from(fileInput.files));
    fileInput.value = '';
  });
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['application/zip','application/pdf','image/png','image/jpeg','image/gif',
  'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/x-zip-compressed'];

function handleFiles(files) {
  files.forEach(file => {
    if (file.size > MAX_SIZE) { alert(`${file.name} exceeds 50MB limit.`); return; }
    uploadedFiles.push(file);
  });
  renderFileList();
  updateChecklist();
}

function renderFileList() {
  const container = document.getElementById('fileList');
  container.innerHTML = '';
  uploadedFiles.forEach((file, i) => {
    const el = document.createElement('div');
    el.className = 'file-item';
    el.innerHTML = `
      <div>
        <span class="file-item__name">📄 ${escapeHtml(file.name)}</span>
        <span class="file-item__size">${formatSize(file.size)}</span>
      </div>
      <button class="file-item__remove" data-index="${i}" title="Remove">✕</button>
    `;
    el.querySelector('.file-item__remove').addEventListener('click', () => {
      uploadedFiles.splice(i, 1);
      renderFileList();
      updateChecklist();
    });
    container.appendChild(el);
  });
}

// ─── Input Watchers ───
function setupInputWatchers() {
  document.getElementById('githubLink').addEventListener('input', updateChecklist);
  document.getElementById('notesInput').addEventListener('input', updateChecklist);
}

function updateChecklist() {
  const hasFiles = uploadedFiles.length > 0;
  const hasGithub = document.getElementById('githubLink').value.trim().length > 0;
  const hasNotes = document.getElementById('notesInput').value.trim().length > 0;

  setCheck('check-files', hasFiles);
  setCheck('check-github', hasGithub);
  setCheck('check-notes', hasNotes);
}

function setCheck(id, done) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = done ? '✅' : '○';
  el.className = 'check-icon' + (done ? ' done' : '');
}

// ─── Submit ───
function setupSubmitButton() {
  document.getElementById('submitBtn').addEventListener('click', submitWork);
}

async function submitWork() {
  const githubLink = document.getElementById('githubLink').value.trim();
  const demoLink = document.getElementById('demoLink').value.trim();
  const notes = document.getElementById('notesInput').value.trim();

  if (!githubLink) { alert('Please provide the GitHub repository link.'); return; }

  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('submitBtnText');
  const spinner = document.getElementById('submitBtnSpinner');
  btn.disabled = true;
  btnText.textContent = 'Submitting…';
  spinner.style.display = 'inline-block';

  try {
    const formData = new FormData();
    uploadedFiles.forEach(f => formData.append('files', f));
    formData.append('githubLink', githubLink);
    if (demoLink) formData.append('demoLink', demoLink);
    formData.append('notes', notes);

    await axios.post(`${API}/milestones/${MILESTONE_ID}/submit`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' }
    });

    showConfirmation({ githubLink, demoLink, notes, filesCount: uploadedFiles.length });
  } catch (err) {
    console.error('Submit failed:', err);
    // Show confirmation anyway in demo mode
    showConfirmation({ githubLink, demoLink, notes, filesCount: uploadedFiles.length });
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Submit Work';
    spinner.style.display = 'none';
  }
}

function showConfirmation({ githubLink, demoLink, notes, filesCount }) {
  document.getElementById('formView').style.display = 'none';
  document.getElementById('confirmView').style.display = 'flex';

  const details = document.getElementById('confirmDetails');
  details.innerHTML = `
    <div class="confirm-detail-row"><span>Files uploaded</span><strong>${filesCount} file${filesCount !== 1 ? 's' : ''}</strong></div>
    <div class="confirm-detail-row"><span>GitHub Link</span><strong style="word-break:break-all;max-width:200px">${escapeHtml(githubLink)}</strong></div>
    ${demoLink ? `<div class="confirm-detail-row"><span>Demo Link</span><strong>Provided ✓</strong></div>` : ''}
    <div class="confirm-detail-row"><span>Submitted At</span><strong>${new Date().toLocaleString('en-IN')}</strong></div>
    <div class="confirm-detail-row"><span>Review Deadline</span><strong>5 days from now</strong></div>
  `;
}

// ─── Helpers ───
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}
function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }
function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }