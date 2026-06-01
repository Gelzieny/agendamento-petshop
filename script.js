/* ===================================================
   MUNDO PET – Application Logic
   =================================================== */

'use strict';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const PERIODS = {
  manha: { label: 'Manhã', start: 9,  end: 11, key: 'manha' },
  tarde: { label: 'Tarde', start: 13, end: 17, key: 'tarde' },
  noite: { label: 'Noite', start: 19, end: 20, key: 'noite' },
};

// Valid hours per period (inclusive)
const VALID_HOURS = [
  ...Array.from({ length: 3  }, (_, i) => 9  + i),  // 09, 10, 11
  ...Array.from({ length: 5  }, (_, i) => 13 + i),  // 13, 14, 15, 16, 17
  ...Array.from({ length: 2  }, (_, i) => 19 + i),  // 19, 20
];

const STORAGE_KEY = 'mundopet_appointments';

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────

/** @type {Record<string, Appointment[]>}
 *  Keys are ISO date strings (YYYY-MM-DD), values are arrays of appointments */
let appointments = {};

/** Currently viewed date as ISO string */
let currentDate = todayISO();

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Format ISO date string to DD/MM/YYYY */
function formatDateBR(isoDate) {
  if (!isoDate) return '--/--/----';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

/** Parse "HH:MM" to total minutes from midnight */
function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Return period key for a given hour (0–23) */
function getPeriod(hour) {
  if (hour >= 9  && hour <= 11) return 'manha';
  if (hour >= 13 && hour <= 17) return 'tarde';
  if (hour >= 19 && hour <= 20) return 'noite';
  return null;
}

/** Generate a simple unique ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    appointments = raw ? JSON.parse(raw) : {};
  } catch {
    appointments = {};
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

// ─────────────────────────────────────────────────────────────
// SEED DATA (shown on first load for demo)
// ─────────────────────────────────────────────────────────────

function seedDemoData() {
  if (Object.keys(appointments).length > 0) return; // already has data
  const today = todayISO();
  appointments[today] = [
    { id: uid(), tutor: 'Fernanda Costa',  pet: 'Thor',  phone: '(11) 9 9999-0001', service: 'Vacinação',                  time: '09:00' },
    { id: uid(), tutor: 'João Souza',      pet: 'Mel',   phone: '(11) 9 9999-0002', service: 'Corte de Unhas',             time: '13:00' },
    { id: uid(), tutor: 'Pedro Martins',   pet: 'Bella', phone: '(11) 9 9999-0003', service: 'Aplicação de Anti-pulgas',   time: '14:00' },
    { id: uid(), tutor: 'Juliana Rocha',   pet: 'Simba', phone: '(11) 9 9999-0004', service: 'Tosa Higiênica',             time: '15:00' },
    { id: uid(), tutor: 'Camila Santos',   pet: 'Max',   phone: '(11) 9 9999-0005', service: 'Limpeza de Dentes',          time: '20:00' },
  ];
  saveToStorage();
}

// ─────────────────────────────────────────────────────────────
// DOM REFERENCES
// ─────────────────────────────────────────────────────────────

const displayDateEl     = document.getElementById('display-date');
const nativeDateInput   = document.getElementById('native-date-input');
const btnDatePicker     = document.getElementById('btn-date-picker');

const modalOverlay      = document.getElementById('modal-overlay');
const btnNewAppt        = document.getElementById('btn-new-appointment');
const btnCloseModal     = document.getElementById('btn-close-modal');
const formAppt          = document.getElementById('form-appointment');

const inputTutor        = document.getElementById('input-tutor');
const inputPet          = document.getElementById('input-pet');
const inputPhone        = document.getElementById('input-phone');
const inputService      = document.getElementById('input-service');
const inputDate         = document.getElementById('input-date');
const inputTime         = document.getElementById('input-time');

const toastEl           = document.getElementById('toast');

// Period list elements
const lists = {
  manha: document.getElementById('list-manha'),
  tarde: document.getElementById('list-tarde'),
  noite: document.getElementById('list-noite'),
};
const empties = {
  manha: document.getElementById('empty-manha'),
  tarde: document.getElementById('empty-tarde'),
  noite: document.getElementById('empty-noite'),
};

// ─────────────────────────────────────────────────────────────
// DATE NAVIGATION
// ─────────────────────────────────────────────────────────────

function setCurrentDate(isoDate) {
  currentDate = isoDate;
  displayDateEl.textContent = formatDateBR(isoDate);
  nativeDateInput.value = isoDate;
  renderSchedule();
}

// Clicking the styled button triggers the hidden native date input
btnDatePicker.addEventListener('click', () => {
  nativeDateInput.showPicker ? nativeDateInput.showPicker() : nativeDateInput.click();
});

nativeDateInput.addEventListener('change', (e) => {
  if (e.target.value) setCurrentDate(e.target.value);
});

// ─────────────────────────────────────────────────────────────
// RENDER SCHEDULE
// ─────────────────────────────────────────────────────────────

function renderSchedule() {
  // Clear all lists
  Object.values(lists).forEach(ul => (ul.innerHTML = ''));

  const daily = (appointments[currentDate] || []).slice();

  // Sort by time
  daily.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  // Group by period
  const grouped = { manha: [], tarde: [], noite: [] };
  daily.forEach(appt => {
    const hour = parseInt(appt.time.split(':')[0], 10);
    const period = getPeriod(hour);
    if (period) grouped[period].push(appt);
  });

  // Render each group
  Object.keys(grouped).forEach(periodKey => {
    const items = grouped[periodKey];
    const ul = lists[periodKey];
    const empty = empties[periodKey];

    if (items.length === 0) {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      items.forEach(appt => ul.appendChild(createAppointmentItem(appt)));
    }
  });
}

// ─────────────────────────────────────────────────────────────
// CREATE APPOINTMENT ITEM (DOM)
// ─────────────────────────────────────────────────────────────

function createAppointmentItem(appt) {
  const li = document.createElement('li');
  li.className = 'appointment-item';
  li.dataset.id = appt.id;
  li.setAttribute('role', 'listitem');

  li.innerHTML = `
    <span class="appt-time">${escapeHtml(appt.time)}</span>
    <div class="appt-info">
      <span class="appt-names">
        ${escapeHtml(appt.pet)} <span class="tutor">/ ${escapeHtml(appt.tutor)}</span>
      </span>
      <span class="appt-service">${escapeHtml(appt.service)}</span>
    </div>
    <span class="appt-service-desktop">${escapeHtml(appt.service)}</span>
    <button
      class="appt-remove"
      aria-label="Remover agendamento de ${escapeHtml(appt.pet)} às ${escapeHtml(appt.time)}"
      data-id="${appt.id}"
    >Remover agendamento</button>
  `;

  li.querySelector('.appt-remove').addEventListener('click', () => {
    removeAppointment(appt.id, li);
  });

  return li;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─────────────────────────────────────────────────────────────
// REMOVE APPOINTMENT
// ─────────────────────────────────────────────────────────────

function removeAppointment(id, li) {
  li.classList.add('removing');
  li.addEventListener('animationend', () => {
    // Remove from state
    if (appointments[currentDate]) {
      appointments[currentDate] = appointments[currentDate].filter(a => a.id !== id);
      if (appointments[currentDate].length === 0) delete appointments[currentDate];
      saveToStorage();
    }
    renderSchedule();
  }, { once: true });
}

// ─────────────────────────────────────────────────────────────
// TIME OPTIONS
// ─────────────────────────────────────────────────────────────

function buildTimeOptions() {
  inputTime.innerHTML = '<option value="">Selecione</option>';
  VALID_HOURS.forEach(h => {
    const label = `${String(h).padStart(2, '0')}:00`;
    const opt = document.createElement('option');
    opt.value = label;
    opt.textContent = label;
    inputTime.appendChild(opt);
  });
}

// ─────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────

function openModal() {
  // Pre-fill date with current viewed date
  inputDate.value = currentDate;
  formAppt.reset();
  inputDate.value = currentDate; // reset() clears it, restore
  clearErrors();

  modalOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
  btnDatePicker.setAttribute('aria-expanded', 'true');

  // Focus first field
  setTimeout(() => inputTutor.focus(), 50);
}

function closeModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = '';
  btnDatePicker.setAttribute('aria-expanded', 'false');
  btnNewAppt.focus();
}

btnNewAppt.addEventListener('click', openModal);
btnCloseModal.addEventListener('click', closeModal);

// Close on overlay click (outside modal box)
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalOverlay.hidden) closeModal();
});

// Trap focus inside modal
modalOverlay.addEventListener('keydown', trapFocus);

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const focusableSelectors = 'button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusables = Array.from(modalOverlay.querySelectorAll(focusableSelectors))
    .filter(el => !el.disabled && el.offsetParent !== null);
  if (focusables.length === 0) return;

  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

// ─────────────────────────────────────────────────────────────
// PHONE MASK
// ─────────────────────────────────────────────────────────────

inputPhone.addEventListener('input', () => {
  let v = inputPhone.value.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 2) {
    v = v.replace(/^(\d{0,2})/, '($1');
  } else if (v.length <= 7) {
    v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  } else {
    v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
  inputPhone.value = v;
});

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────

function setError(fieldId, message) {
  const el = document.getElementById(`error-${fieldId}`);
  const input = document.getElementById(`input-${fieldId}`);
  if (el) el.textContent = message;
  if (input) input.classList.toggle('is-invalid', !!message);
}

function clearErrors() {
  ['tutor','pet','phone','service','date','time'].forEach(f => setError(f, ''));
}

function validateForm() {
  clearErrors();
  let valid = true;

  const tutor   = inputTutor.value.trim();
  const pet     = inputPet.value.trim();
  const phone   = inputPhone.value.trim();
  const service = inputService.value.trim();
  const date    = inputDate.value;
  const time    = inputTime.value;

  if (!tutor) {
    setError('tutor', 'O nome do tutor é obrigatório.');
    valid = false;
  }

  if (!pet) {
    setError('pet', 'O nome do pet é obrigatório.');
    valid = false;
  }

  if (!phone || phone.replace(/\D/g, '').length < 10) {
    setError('phone', 'Informe um telefone válido com DDD.');
    valid = false;
  }

  if (!service) {
    setError('service', 'A descrição do serviço é obrigatória.');
    valid = false;
  }

  if (!date) {
    setError('date', 'Selecione uma data.');
    valid = false;
  }

  if (!time) {
    setError('time', 'Selecione um horário válido.');
    valid = false;
  } else {
    const hour = parseInt(time.split(':')[0], 10);
    if (!getPeriod(hour)) {
      setError('time', 'Horário fora das janelas permitidas (09–11h, 13–17h, 19–20h).');
      valid = false;
    }
  }

  // Conflict check
  if (valid) {
    const existing = appointments[date] || [];
    const conflict = existing.find(a => a.time === time);
    if (conflict) {
      setError('time', `Já existe um agendamento para ${time}. Escolha outro horário.`);
      valid = false;
    }
  }

  return valid;
}

// ─────────────────────────────────────────────────────────────
// FORM SUBMIT
// ─────────────────────────────────────────────────────────────

formAppt.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const newAppt = {
    id:      uid(),
    tutor:   inputTutor.value.trim(),
    pet:     inputPet.value.trim(),
    phone:   inputPhone.value.trim(),
    service: inputService.value.trim(),
    date:    inputDate.value,
    time:    inputTime.value,
  };

  if (!appointments[newAppt.date]) appointments[newAppt.date] = [];
  appointments[newAppt.date].push(newAppt);
  saveToStorage();

  // If the new appointment is for the currently viewed date, re-render
  if (newAppt.date === currentDate) renderSchedule();

  closeModal();
  showToast(`✅ Agendamento de ${newAppt.pet} adicionado com sucesso!`, 'success');
});

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────

let toastTimer = null;

function showToast(message, type = 'success') {
  toastEl.textContent = message;
  toastEl.className = `toast toast--${type} toast--visible`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('toast--visible');
  }, 3500);
}

// ─────────────────────────────────────────────────────────────
// LIVE VALIDATION (inline, on blur)
// ─────────────────────────────────────────────────────────────

inputTutor.addEventListener('blur', () => {
  if (!inputTutor.value.trim()) setError('tutor', 'O nome do tutor é obrigatório.');
  else setError('tutor', '');
});

inputPet.addEventListener('blur', () => {
  if (!inputPet.value.trim()) setError('pet', 'O nome do pet é obrigatório.');
  else setError('pet', '');
});

inputPhone.addEventListener('blur', () => {
  if (inputPhone.value.replace(/\D/g, '').length < 10)
    setError('phone', 'Informe um telefone válido com DDD.');
  else setError('phone', '');
});

inputService.addEventListener('blur', () => {
  if (!inputService.value.trim()) setError('service', 'A descrição do serviço é obrigatória.');
  else setError('service', '');
});

// When date changes in modal, also update the visible date label (UX)
inputDate.addEventListener('change', () => {
  setError('date', inputDate.value ? '' : 'Selecione uma data.');
});

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────

function init() {
  loadFromStorage();
  seedDemoData();
  buildTimeOptions();
  setCurrentDate(todayISO());
}

init();
