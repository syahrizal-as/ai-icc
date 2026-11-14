const search = document.querySelector('#search');
const filters = [...document.querySelectorAll('[data-day]')];
const tabs = [...document.querySelectorAll('[role="tab"]')];
const agendaPanel = document.querySelector('#agenda-panel');
const moduleGrid = document.querySelector('#modules');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav-links');
const announcement = document.querySelector('#announcement');
const storageKey = 'pbk-ai-praktis-kesiapan-v1';

function showAgenda(day) {
  const details = days[day];
  const sessions = [...modules.filter(module => module.day === day), details.closing];
  tabs.forEach((tab, index) => {
    tab.setAttribute('aria-selected', String(index + 1 === day));
    tab.tabIndex = index + 1 === day ? 0 : -1;
  });
  agendaPanel.setAttribute('aria-labelledby', tabs[day - 1].id);
  agendaPanel.innerHTML = `
    <div class="day-heading"><h3>${details.title}</h3></div>
    <ol class="agenda-list">${sessions.map(session => `
      <li class="agenda-item">
        <div><strong>${session.title}</strong><p>${session.output}</p></div>
        ${session.id ? `<a href="#blok-${session.id}">Buka materi ↗</a>` : ''}
      </li>`).join('')}
    </ol>`;
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showAgenda(index + 1));
  tab.addEventListener('keydown', event => {
    const destination = { ArrowLeft: 1 - index, ArrowRight: 1 - index, Home: 0, End: 1 }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    showAgenda(destination + 1);
    tabs[destination].focus();
  });
});

const datasetActions = `
  <div class="prompt" id="dataset">
    <h3>Dataset dan prompt audit</h3>
    <p>Pilih satu kasus, unduh CSV, lalu unggah ke platform AI yang disetujui. Setiap file berisi 25 baris data sintetis untuk latihan validasi.</p>
    <label for="dataset-case">Pilih kasus</label>
    <div class="dataset-actions">
      <select id="dataset-case">${datasetCases.map(([id, title]) => `<option value="${id}">${title}</option>`).join('')}</select>
      <a id="dataset-download" class="button secondary copy-button" href="dataset/latihan-${datasetCases[0][0]}.csv" download>Unduh CSV <span aria-hidden="true">↓</span></a>
      <button class="button primary copy-button" type="button" data-copy="dataset-prompt">Salin prompt audit</button>
    </div>
    <pre id="dataset-prompt"></pre>
  </div>`;

moduleGrid.innerHTML = modules.map((module, index) => {
  const prompt = module.prompt ? `<div class="prompt"><h3>Contoh prompt</h3><pre id="prompt-${module.id}"></pre><button class="button secondary copy-button" type="button" data-copy="prompt-${module.id}">Salin prompt</button></div>` : '';
  return `
  <details id="blok-${module.id}">
    <summary><span class="module-index">${String(index + 1).padStart(2, '0')}</span><span>${module.title}<span class="module-meta">Hari ${module.day}</span></span></summary>
    <div class="module-body">
      ${module.concepts ? `
        <div class="module-intro">
          <h3>AI generatif, model, dan aplikasi</h3>
          <dl>${module.concepts.map(([term, definition]) => `<div><dt>${term}</dt><dd>${definition}</dd></div>`).join('')}</dl>
          <p>Model bisa keliru meski jawabannya terdengar meyakinkan. Cocokkan fakta dan angka dengan sumber.</p>
          <a href="https://openai.com/index/introducing-gpt-5/" target="_blank" rel="noopener">Rujukan OpenAI tentang model GPT ↗</a>
          ${prompt}
        </div>` : ''}
      <div class="module-columns">
        <div><h3>Langkah praktik</h3><ol>${module.steps.map(step => `<li>${step}</li>`).join('')}</ol></div>
        <div><h3>Bukti kerja</h3><p>${module.output}</p><p><strong>Pemetaan</strong> · ${module.unit}</p></div>
      </div>
      ${module.id === 'data' ? datasetActions : ''}
      ${module.concepts ? '' : prompt}
    </div>
  </details>`;
}).join('');

modules.filter(module => module.prompt).forEach(module => {
  document.querySelector('#prompt-' + module.id).textContent = module.prompt;
});
document.querySelector('#master-prompt').textContent = masterPrompt;
document.querySelector('#dataset-prompt').textContent = datasetPrompt;
const caseSelect = document.querySelector('#dataset-case');
const datasetDownload = document.querySelector('#dataset-download');
function updateDatasetDownload() {
  datasetDownload.href = `dataset/latihan-${caseSelect.value}.csv`;
  datasetDownload.setAttribute('aria-label', 'Unduh CSV ' + caseSelect.selectedOptions[0].textContent);
}
caseSelect.addEventListener('change', updateDatasetDownload);
window.addEventListener('pageshow', updateDatasetDownload);
updateDatasetDownload();

function filterModules(day) {
  const query = search.value.trim().toLocaleLowerCase('id');
  filters.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.day) === day)));
  let count = 0;
  for (const module of modules) {
    const searchable = [module.title, module.output, module.unit, ...module.steps, ...(module.concepts?.flat() ?? [])].join(' ').toLocaleLowerCase('id');
    const visible = (day === 0 || module.day === day) && searchable.includes(query);
    document.getElementById('blok-' + module.id).hidden = !visible;
    if (visible) count += 1;
  }
  document.querySelector('#module-count').textContent = count ? `${count} blok materi` : 'Tidak ada blok yang cocok. Coba kata kunci lain atau pilih Semua.';
}

filters.forEach(button => button.addEventListener('click', () => filterModules(Number(button.dataset.day))));
search.addEventListener('input', () => filterModules(Number(filters.find(button => button.getAttribute('aria-pressed') === 'true').dataset.day)));

function openHashModule() {
  const datasetLink = location.hash === '#dataset';
  const target = modules.find(module => datasetLink ? module.id === 'data' : location.hash === '#blok-' + module.id);
  if (!target) return;
  search.value = '';
  filterModules(0);
  const detail = document.getElementById('blok-' + target.id);
  detail.open = true;
  const focus = datasetLink ? caseSelect : detail.querySelector('summary');
  focus.focus({ preventScroll: true });
  (datasetLink ? document.querySelector('#dataset') : detail).scrollIntoView();
}
window.addEventListener('hashchange', openHashModule);
document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (link?.hash && link.hash === location.hash) openHashModule();
});

function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    closeMenu();
    menu.focus();
  }
});

document.querySelector('#units').innerHTML = units.map(([code, title, activity, evidence]) => `
  <article class="unit-card"><span class="unit-code">${code}</span><h3>${title}</h3><p>${activity}</p><dl><dt>Bukti minimum</dt><dd>${evidence}</dd></dl></article>`).join('');

document.querySelector('#rubric-rows').innerHTML = rubric.map(([dimension, ...levels]) => `
  <tr><th scope="row">${dimension}</th>${levels.map(level => `<td>${level}</td>`).join('')}</tr>`).join('');

const checklist = document.querySelector('#checklist');
checklist.innerHTML = readiness.map(([id, label]) => `<label class="check"><input type="checkbox" value="${id}"><span>${label}</span></label>`).join('');
const checks = [...checklist.querySelectorAll('input')];

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) checks.forEach(check => { check.checked = saved.includes(check.value); });
} catch {
  // The checklist remains usable when storage is blocked.
}

function showProgress() {
  const selected = checks.filter(check => check.checked).map(check => check.value);
  const progress = document.querySelector('#readiness-progress');
  progress.max = checks.length;
  progress.value = selected.length;
  document.querySelector('#progress-label').textContent = `${selected.length} dari ${checks.length} selesai`;
  return selected;
}

checklist.addEventListener('change', () => {
  const selected = showProgress();
  try {
    localStorage.setItem(storageKey, JSON.stringify(selected));
  } catch {
    announcement.textContent = 'Checklist aktif. Browser ini tidak mengizinkan penyimpanan.';
  }
});

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  const source = document.getElementById(button.dataset.copy);
  try {
    await navigator.clipboard.writeText(source.textContent);
    announcement.textContent = 'Prompt disalin.';
    const original = button.dataset.label || button.textContent;
    button.dataset.label = original;
    button.textContent = 'Disalin';
    clearTimeout(button.copyTimeout);
    button.copyTimeout = setTimeout(() => { button.textContent = original; }, 1700);
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(source);
    selection.removeAllRanges();
    selection.addRange(range);
    announcement.textContent = 'Prompt dipilih. Gunakan perintah Salin pada perangkat Anda.';
  }
});

showAgenda(1);
filterModules(0);
showProgress();
openHashModule();
