let userId = null;
const byId = (id) => document.getElementById(id);
const showMessage = (id, message, success = false) => {
  const element = byId(id); element.textContent = message || ''; element.classList.toggle('success', success);
};
async function requestJSON(url, options = {}) {
  let response;
  try {
    response = await fetch(url, { ...options, headers: { ...(options.headers || {}), ...(options.body ? { 'Content-Type': 'application/json' } : {}) } });
  } catch (error) {
    throw new Error('Cannot reach the application server. Stop Live Server, run "npm start" in the project folder, then open http://localhost:5050.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}
function showLogin() {
  byId('login-section').hidden = false; byId('registration-section').hidden = true; byId('dashboard-section').hidden = true;
  showMessage('registration-response', ''); showMessage('response-message', '');
}
function showRegistration() {
  byId('login-section').hidden = true; byId('registration-section').hidden = false; byId('dashboard-section').hidden = true;
  showMessage('registration-response', ''); showMessage('response-message', '');
}
function showDashboard(data) {
  userId = data.userId; byId('username-display').textContent = data.username; byId('roll-number-display').textContent = data.rollNumber;
  byId('casual-leave-display').textContent = data.casualLeave; byId('medical-leave-display').textContent = data.medicalLeave;
  byId('login-section').hidden = true; byId('registration-section').hidden = true; byId('dashboard-section').hidden = false;
  showMessage('response-message', ''); showMessage('registration-response', '');
}
async function registerUser(event) {
  event.preventDefault(); const button = event.submitter || byId('registration-form').querySelector('[type=submit]'); button.disabled = true;
  showMessage('registration-response', 'Creating your account…');
  const payload = { username: byId('username').value.trim(), email: byId('reg-email').value.trim(), rollNumber: byId('roll-number').value.trim(), casualLeave: Number(byId('casual-leave').value), medicalLeave: Number(byId('medical-leave').value) };
  if (!payload.username || !payload.email || !payload.rollNumber) { showMessage('registration-response', 'Please complete all required fields.'); button.disabled = false; return; }
  if (!Number.isInteger(payload.casualLeave) || payload.casualLeave < 0 || !Number.isInteger(payload.medicalLeave) || payload.medicalLeave < 0) { showMessage('registration-response', 'Leave balances must be whole numbers and cannot be negative.'); button.disabled = false; return; }
  try {
    const data = await requestJSON('/api/register', { method: 'POST', body: JSON.stringify(payload) });
    byId('registration-form').reset(); byId('casual-leave').value = 10; byId('medical-leave').value = 10; showLogin();
    showMessage('response-message', `${data.message} You can now sign in.`, true); byId('email').value = payload.email;
  } catch (error) { showMessage('registration-response', error.message); } finally { button.disabled = false; }
}
async function loginUser(event) {
  event.preventDefault(); const button = event.submitter || byId('login-form').querySelector('[type=submit]'); button.disabled = true;
  showMessage('response-message', 'Signing you in…');
  try { const data = await requestJSON('/api/login', { method: 'POST', body: JSON.stringify({ email: byId('email').value.trim() }) }); showDashboard(data); }
  catch (error) { showMessage('response-message', error.message); } finally { button.disabled = false; }
}
async function refreshLeaveBalance() {
  if (!userId) return showMessage('response-message', 'Please sign in again.');
  try { const data = await requestJSON(`/api/leave-balance/${encodeURIComponent(userId)}`); byId('casual-leave-display').textContent = data.casualLeave; byId('medical-leave-display').textContent = data.medicalLeave; showMessage('response-message', 'Your leave balance is up to date.', true); }
  catch (error) { showMessage('response-message', error.message); }
}
async function applyLeave(event) {
  event.preventDefault(); if (!userId) return showMessage('response-message', 'Please sign in again.');
  const button = event.submitter || byId('leave-form').querySelector('[type=submit]'); button.disabled = true;
  try {
    const data = await requestJSON(`/api/apply-leave/${encodeURIComponent(userId)}`, { method: 'POST', body: JSON.stringify({ type: byId('leave-type').value, days: Number(byId('leave-days').value) }) });
    byId('casual-leave-display').textContent = data.casualLeave; byId('medical-leave-display').textContent = data.medicalLeave; byId('leave-form').reset(); showMessage('response-message', data.message, true);
  } catch (error) { showMessage('response-message', error.message); } finally { button.disabled = false; }
}
function logoutUser() {
  userId = null; byId('login-form').reset(); byId('leave-form').reset(); byId('username-display').textContent = ''; byId('roll-number-display').textContent = '';
  byId('casual-leave-display').textContent = '—'; byId('medical-leave-display').textContent = '—'; showLogin();
}
byId('registration-form').addEventListener('submit', registerUser); byId('login-form').addEventListener('submit', loginUser); byId('leave-form').addEventListener('submit', applyLeave);
byId('refresh-balance').addEventListener('click', refreshLeaveBalance); byId('logout-button').addEventListener('click', logoutUser);
byId('show-login').addEventListener('click', showLogin); byId('show-registration').addEventListener('click', showRegistration);
byId('current-year').textContent = new Date().getFullYear();
