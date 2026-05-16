// ─── Config ───
const API = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
if (!token) window.location.href = 'login.html';

const headers = { Authorization: `Bearer ${token}` };

// ─── State ───
let activeUserId = null;
let allConversations = [];

// ─── Init ───
window.addEventListener('DOMContentLoaded', () => {
  setNavAvatar();
  loadConversations();
  setupSearch();
  setupSendButton();
  setupAutoResize();
});

// ─── Nav avatar ───
function setNavAvatar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const el = document.getElementById('navAvatar');
  if (el && user.name) el.textContent = user.name[0].toUpperCase();
}

// ─── Load Conversations ───
async function loadConversations() {
  try {
    const me = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = me._id || me.id || 'me';
    const res = await axios.get(`${API}/chat/${userId}`, { headers });
    allConversations = res.data.conversations || res.data || [];
    renderConversations(allConversations);
  } catch (err) {
    console.error('Failed to load conversations:', err);
    // Show demo data if API not connected yet
    renderConversations(getDemoConversations());
  }
}

function getDemoConversations() {
  return [
    { userId: '1', name: 'Priya Sharma', role: 'Client', lastMessage: 'Can you send the updated design?', time: '10:32 AM', unread: 2, avatar: 'P' },
    { userId: '2', name: 'Rohan Mehta', role: 'Student', lastMessage: 'I submitted the milestone!', time: 'Yesterday', unread: 0, avatar: 'R' },
    { userId: '3', name: 'TechStart Inc.', role: 'Company', lastMessage: 'Review approved ✓', time: 'Mon', unread: 0, avatar: 'T' },
  ];
}

function renderConversations(list) {
  const container = document.getElementById('conversationList');
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = '<p style="text-align:center;color:#a0a0b0;padding:2rem 1rem;font-size:0.85rem;">No conversations yet</p>';
    return;
  }
  list.forEach(conv => {
    const el = document.createElement('div');
    el.className = 'conv-item';
    el.dataset.userId = conv.userId || conv._id;
    el.innerHTML = `
      <div class="avatar">${(conv.avatar || conv.name?.[0] || '?').toUpperCase()}</div>
      <div class="conv-item__info">
        <div class="conv-item__name">${escapeHtml(conv.name || 'Unknown')}</div>
        <div class="conv-item__preview">${escapeHtml(conv.lastMessage || '')}</div>
      </div>
      <div class="conv-item__meta">
        <span class="conv-item__time">${conv.time || ''}</span>
        ${conv.unread ? `<span class="conv-item__badge">${conv.unread}</span>` : ''}
      </div>
    `;
    el.addEventListener('click', () => openChat(conv));
    container.appendChild(el);
  });
}

// ─── Open Chat ───
async function openChat(conv) {
  activeUserId = conv.userId || conv._id;

  // Update sidebar active state
  document.querySelectorAll('.conv-item').forEach(el => el.classList.remove('active'));
  const activeEl = document.querySelector(`.conv-item[data-user-id="${activeUserId}"]`);
  if (activeEl) activeEl.classList.add('active');

  // Update header
  document.getElementById('chatAvatar').textContent = (conv.avatar || conv.name?.[0] || '?').toUpperCase();
  document.getElementById('chatName').textContent = conv.name || 'Unknown';
  document.getElementById('chatRole').textContent = conv.role || '';

  // Show chat window
  document.getElementById('chatEmpty').style.display = 'none';
  document.getElementById('chatWindow').style.display = 'flex';

  // Update milestone panel
  updateMilestonePanel(conv);

  // Load messages
  await loadMessages(activeUserId);
}

async function loadMessages(userId) {
  const area = document.getElementById('messagesArea');
  area.innerHTML = '<p style="text-align:center;color:#a0a0b0;font-size:0.85rem;">Loading messages…</p>';
  try {
    const res = await axios.get(`${API}/chat/${userId}`, { headers });
    const messages = res.data.messages || res.data || [];
    renderMessages(messages);
  } catch (err) {
    renderMessages(getDemoMessages());
  }
}

function getDemoMessages() {
  const me = JSON.parse(localStorage.getItem('user') || '{}');
  const myId = me._id || me.id || 'me';
  return [
    { senderId: 'other', text: 'Hi! Just checking in on the project.', time: '10:00 AM' },
    { senderId: myId, text: 'Hey! Going well. I\'ll submit the milestone by EOD.', time: '10:15 AM' },
    { senderId: 'other', text: 'Great! Can you also share the GitHub link?', time: '10:20 AM' },
    { senderId: myId, text: 'Sure, I\'ll add it to the submission.', time: '10:32 AM' },
  ];
}

function renderMessages(messages) {
  const area = document.getElementById('messagesArea');
  area.innerHTML = '';
  const me = JSON.parse(localStorage.getItem('user') || '{}');
  const myId = me._id || me.id || 'me';

  messages.forEach((msg, i) => {
    const isSent = (msg.senderId === myId) || msg.isSent;
    const row = document.createElement('div');
    row.className = `msg-row ${isSent ? 'sent' : ''}`;
    row.innerHTML = `
      ${!isSent ? `<div class="avatar" style="width:28px;height:28px;font-size:0.75rem;">U</div>` : ''}
      <div class="bubble bubble--${isSent ? 'sent' : 'received'}">
        ${escapeHtml(msg.text || msg.content || msg.message || '')}
        <span class="bubble__time">${msg.time || formatTime(msg.createdAt) || ''}</span>
      </div>
    `;
    area.appendChild(row);
  });
  area.scrollTop = area.scrollHeight;
}

// ─── Send Message ───
function setupSendButton() {
  const btn = document.getElementById('sendBtn');
  const input = document.getElementById('messageInput');

  btn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
}

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text || !activeUserId) return;

  input.value = '';
  autoResize(input);

  // Optimistic UI
  const area = document.getElementById('messagesArea');
  const row = document.createElement('div');
  row.className = 'msg-row sent';
  row.innerHTML = `
    <div class="bubble bubble--sent">
      ${escapeHtml(text)}
      <span class="bubble__time">Sending…</span>
    </div>
  `;
  area.appendChild(row);
  area.scrollTop = area.scrollHeight;

  try {
    await axios.post(`${API}/chat/send`, {
      receiverId: activeUserId,
      message: text
    }, { headers });
    row.querySelector('.bubble__time').textContent = formatTime(new Date());
  } catch (err) {
    row.querySelector('.bubble__time').textContent = '⚠ Failed';
    console.error('Send failed:', err);
  }
}

// ─── Milestone Panel ───
function updateMilestonePanel(conv) {
  const milestone = conv.milestone || {};
  document.getElementById('milestoneName').textContent = milestone.name || 'No active milestone';
  document.getElementById('milestoneStatus').textContent = milestone.status || '–';
  document.getElementById('milestoneDue').textContent = milestone.dueDate ? formatDate(milestone.dueDate) : '–';
  document.getElementById('escrowAmount').textContent = milestone.escrow ? `₹ ${milestone.escrow.toLocaleString()}` : '₹ –';
}

// ─── Search ───
function setupSearch() {
  document.getElementById('searchInput').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    const filtered = allConversations.filter(c => (c.name || '').toLowerCase().includes(q));
    renderConversations(filtered);
  });
}

// ─── Auto-resize textarea ───
function setupAutoResize() {
  const input = document.getElementById('messageInput');
  input.addEventListener('input', () => autoResize(input));
}
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// ─── Helpers ───
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}