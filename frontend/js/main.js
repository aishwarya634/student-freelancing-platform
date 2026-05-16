// js/main.js — shared utilities for SkillBridge

const API = 'http://localhost:5000/api';

// ── Token helpers ──────────────────────────────
function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  localStorage.setItem('token', token);
}

function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('sb_user');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('sb_user') || 'null');
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem('sb_user', JSON.stringify(user));
}

// ── Auth guard ─────────────────────────────────
// Call on protected pages to redirect if not logged in
function requireAuth() {
  if (!getToken()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// ── Auth headers ───────────────────────────────
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

// ── API wrapper (uses fetch, no Axios needed) ──
async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: authHeaders(),
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}

// ── Logout ─────────────────────────────────────
function logout() {
  removeToken();
  window.location.href = '/login.html';
}

// ── Toast notification ─────────────────────────
function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  el.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    padding:12px 20px; border-radius:10px; font-size:0.88rem;
    font-weight:600; box-shadow:0 4px 20px rgba(0,0,0,0.15);
    animation: slideUp 0.3s ease;
    background:${type === 'error' ? '#c53030' : type === 'warning' ? '#d97706' : '#1D9E75'};
    color:#fff;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ── Hamburger menu ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const ham = document.querySelector('.hamburger');
  const nav = document.querySelector('.navbar nav');
  if (ham && nav) {
    ham.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Logout button if present
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});