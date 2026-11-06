// ===== NAVEGACIÓN (SPA por hash) =====
function handleRouting() {
  const hash = window.location.hash || '#inicio';
  const sections = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const navMenu = document.getElementById('nav-menu');
  const hamburgerBtn = document.getElementById('hamburger-btn');

  sections.forEach(sec => sec.classList.toggle('active', '#' + sec.id === hash));
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === hash));

  if (navMenu && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    hamburgerBtn.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);

// ===== CALENDARIO =====
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const today = new Date();
today.setHours(0, 0, 0, 0);

let viewYear = today.getFullYear();
let viewMonth = today.getMonth();
let selectedDate = null; // { day, month, year }
let selectedTime = null;

function renderCalendar() {
  const daysContainer = document.getElementById('calendar-days');
  const title = document.getElementById('calendar-month-year');
  const prev = document.getElementById('cal-prev');
  if (!daysContainer) return;

  title.textContent = `${MESES[viewMonth]} ${viewYear}`;
  prev.disabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  daysContainer.innerHTML = '';

  // Lunes = 0 ... Domingo = 6
  const offset = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

  for (let i = 0; i < offset; i++) {
    const empty = document.createElement('span');
    empty.className = 'day-empty';
    daysContainer.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(viewYear, viewMonth, day);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day-btn';
    btn.textContent = day;

    if (date < today) btn.disabled = true;
    if (date.getTime() === today.getTime()) btn.classList.add('today');
    if (selectedDate && selectedDate.day === day && selectedDate.month === viewMonth && selectedDate.year === viewYear) {
      btn.classList.add('selected');
    }

    btn.addEventListener('click', () => {
      document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDate = { day, month: viewMonth, year: viewYear };
      document.getElementById('display-selected-date').textContent = formatSelectedDate();
    });

    daysContainer.appendChild(btn);
  }
}

function formatSelectedDate() {
  return `${selectedDate.day} de ${MESES[selectedDate.month]}, ${selectedDate.year}`;
}

function changeMonth(delta) {
  viewMonth += delta;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderCalendar();
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const navbar = document.getElementById('navbar');

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const open = hamburgerBtn.classList.toggle('open');
      navMenu.classList.toggle('open', open);
      hamburgerBtn.setAttribute('aria-expanded', String(open));
    });
  }

  // Sombra/borde del menú al hacer scroll
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.getElementById('cal-prev').addEventListener('click', () => changeMonth(-1));
  document.getElementById('cal-next').addEventListener('click', () => changeMonth(1));
  renderCalendar();

  const timeButtons = document.querySelectorAll('.time-btn');
  timeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      timeButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTime = btn.textContent;
    });
  });

  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
});

// ===== CONFIRMAR RESERVA =====
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!selectedDate) { alert('Por favor selecciona una fecha en el calendario.'); return; }
    if (!selectedTime) { alert('Por favor selecciona un horario.'); return; }

    const name = document.getElementById('user-name').value;
    const sport = document.getElementById('sport-select').value;

    alert(`¡Reserva confirmada!\n\nCliente: ${name}\nCancha: ${sport}\nFecha: ${formatSelectedDate()}\nHorario: ${selectedTime}`);

    this.reset();
    document.querySelectorAll('.day-btn, .time-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('display-selected-date').textContent = 'Ninguna';
    selectedDate = null;
    selectedTime = null;
  });
}

// ===== CHATBOT =====
function toggleChat() {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.style.display = chatWindow.style.display === 'block' ? 'none' : 'block';
}

function addMessage(text, cls) {
  const chatBody = document.getElementById('chat-body');
  const div = document.createElement('div');
  div.className = cls;
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function openChatbot(topic) {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.style.display = 'block';
  addMessage(`Asunto: ${topic}. Indícanos tu nombre y número para responderte.`, 'bot-msg');
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user-msg');
  input.value = '';

  setTimeout(() => {
    addMessage('Un representante del complejo te contactará enseguida.', 'bot-msg');
  }, 1000);
}
// ===== APARICIÓN SUAVE AL HACER SCROLL (solo visual, no cambia contenido) =====
(function () {
  const targets = document.querySelectorAll(
    '.section-header, .grid-2 > *, .bento-card, .reservation-layout > *, .content-card, .stats-strip, .map-box'
  );
  targets.forEach(el => el.classList.add('reveal'));

  const show = el => el.classList.add('visible');

  // Respaldo: si el navegador no soporta IntersectionObserver, mostrar todo
  if (!('IntersectionObserver' in window)) {
    targets.forEach(show);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        show(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });

  targets.forEach(el => io.observe(el));

  // Respaldo de seguridad: nada queda oculto más de 2.5s tras cargar
  setTimeout(() => targets.forEach(el => {
    if (el.closest('.page-section.active')) show(el);
  }), 2500);
})();

// ===== MODO CLARO / OSCURO =====
(function () {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;

  const apply = light => {
    document.body.classList.toggle('light', light);
    btn.textContent = light ? '🌙' : '☀️';
    try { localStorage.setItem('cantera-theme', light ? 'light' : 'dark'); } catch (e) {}
  };

  let saved = null;
  try { saved = localStorage.getItem('cantera-theme'); } catch (e) {}
  apply(saved === 'light');

  btn.addEventListener('click', () => {
    apply(!document.body.classList.contains('light'));
  });
})();

// ===== SPOTLIGHT que sigue el cursor en las tarjetas =====
(function () {
  const cards = document.querySelectorAll('.bento-card, .content-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
