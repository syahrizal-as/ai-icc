const search = document.querySelector('#search');
const agendaPanel = document.querySelector('#agenda-panel');
const moduleGrid = document.querySelector('#modules');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav-links');
const announcement = document.querySelector('#announcement');
const storageKey = 'pbk-ai-praktis-kesiapan-v1';


agendaPanel.innerHTML = agenda.map(([title, sessions]) => `
  <div class="agenda-group">
    <h3>${title}</h3>
    <ol class="agenda-list">${sessions.map(module => `
      <li class="agenda-item">
        <div><strong>${module.title}</strong><p>${module.output}</p></div>
        <a href="#blok-${module.id}">Buka materi ↗</a>
      </li>`).join('')}
    </ol>
  </div>`).join('');

function materials(module) {
  if (module.dataset) {
    return `
      <label for="dataset-case">Pilih kasus</label>
      <select id="dataset-case">${datasetCases.map(([id, title]) => `<option value="${id}">${title}</option>`).join('')}</select>
      <a id="dataset-download" class="button secondary copy-button" href="dataset/latihan-${datasetCases[0][0]}.csv" download>Unduh CSV ↓</a>`;
  }
  return module.files.map(([file, label]) => `<a class="button secondary copy-button" href="bahan/${file}" download>Unduh ${label} ↓</a>`).join('');
}

const stageNames = ['Kenali', 'Lihat Contoh', 'Coba Sendiri', 'Cek Pemahaman'];
moduleGrid.innerHTML = modules.map((module, index) => {
  const id = module.id;
  const promptId = 'prompt-' + id;
  const hasPrompt = module.prompt || module.dataset;
  const stages = [
    `<dl class="concepts">${module.concepts.map(([term, definition]) => `<div><dt>${term}</dt><dd>${definition}</dd></div>`).join('')}</dl>
     ${id === 'orientasi' ? '<p>Model bisa keliru. Cocokkan fakta dan angka dengan sumber. <a href="https://openai.com/index/introducing-gpt-5/" target="_blank" rel="noopener">Rujukan model GPT ↗</a></p>' : ''}`,
    `<h3>Contoh dan hasil yang diharapkan</h3><p>${module.example}</p>`,
    `<div class="practice" ${module.dataset ? 'id="dataset"' : ''}>
      <h3>${module.dataset ? 'Dataset dan prompt audit' : 'Langkah praktik'}</h3>
      <div class="practice-actions">
        ${materials(module)}
        ${hasPrompt ? `<button class="button primary copy-button" type="button" data-copy="${promptId}">Salin ${module.dataset ? 'prompt audit' : 'prompt'}</button><a class="button secondary copy-button" data-prompt-file="${promptId}" download="prompt-${id}.txt">Unduh prompt TXT ↓</a>` : ''}
      </div>
      <ol class="practice-steps">${module.steps.map(step => `<li>${step}</li>`).join('')}</ol>
      ${hasPrompt ? `<h4>Prompt siap pakai</h4><pre id="${promptId}"></pre>` : ''}
      <p><strong>Jika AI belum bisa diakses.</strong> ${module.offline}</p>
      <p><strong>Bukti yang disimpan.</strong> ${module.output}</p>
    </div>`,
    `<h3>${module.check[0]}</h3>
     <details class="answer"><summary>Lihat pembahasan</summary><p>${module.check[1]}</p></details>
     <p><strong>Pemetaan latihan</strong> · ${module.unit}</p>`
  ];
  return `<details class="module" id="blok-${id}">
    <summary><span class="module-index">${String(index + 1).padStart(2, '0')}</span><span>${module.title}</span></summary>
    <div class="module-body">
      <div class="lesson-tabs" role="tablist" aria-label="Tahap ${module.title}">
        ${stageNames.map((name, stage) => `<button type="button" role="tab" id="${id}-tab-${stage}" aria-controls="${id}-stage-${stage}" aria-selected="${stage === 0}" tabindex="${stage === 0 ? 0 : -1}" data-stage="${stage}">${stage + 1}. ${name}</button>`).join('')}
      </div>
      ${stages.map((body, stage) => `<div class="lesson-panel" role="tabpanel" id="${id}-stage-${stage}" aria-labelledby="${id}-tab-${stage}" tabindex="0"${stage ? ' hidden' : ''}>${body}</div>`).join('')}
    </div>
  </details>`;
}).join('');

for (const module of modules) {
  if (module.prompt || module.dataset) {
    document.getElementById('prompt-' + module.id).textContent = module.dataset ? datasetPrompt : module.prompt;
  }
}
document.querySelector('#master-prompt').textContent = masterPrompt;
document.querySelectorAll('[data-prompt-file]').forEach(link => {
  const content = document.getElementById(link.dataset.promptFile).textContent;
  link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content + '\n');
});

const caseSelect = document.querySelector('#dataset-case');
const datasetDownload = document.querySelector('#dataset-download');
function updateDatasetDownload() {
  datasetDownload.href = `dataset/latihan-${caseSelect.value}.csv`;
  datasetDownload.setAttribute('aria-label', 'Unduh CSV ' + caseSelect.selectedOptions[0].textContent);
}
caseSelect.addEventListener('change', updateDatasetDownload);
window.addEventListener('pageshow', updateDatasetDownload);
updateDatasetDownload();

function showStage(tab) {
  for (const item of tab.parentElement.querySelectorAll('[role="tab"]')) {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  }
}

moduleGrid.addEventListener('click', event => {
  const tab = event.target.closest('[role="tab"]');
  if (tab) showStage(tab);
});

moduleGrid.addEventListener('keydown', event => {
  const tab = event.target.closest('[role="tab"]');
  if (!tab) return;
  const tabs = [...tab.parentElement.querySelectorAll('[role="tab"]')];
  const current = tabs.indexOf(tab);
  const next = {
    ArrowLeft: (current - 1 + tabs.length) % tabs.length,
    ArrowRight: (current + 1) % tabs.length,
    Home: 0,
    End: tabs.length - 1
  }[event.key];
  if (next === undefined) return;
  event.preventDefault();
  showStage(tabs[next]);
  tabs[next].focus();
});

function filterModules() {
  const query = search.value.trim().toLocaleLowerCase('id');
  let count = 0;
  for (const module of modules) {
    const detail = document.getElementById('blok-' + module.id);
    const visible = detail.textContent.toLocaleLowerCase('id').includes(query);
    detail.hidden = !visible;
    if (visible) count += 1;
  }
  document.querySelector('#module-count').textContent = count ? `${count} blok materi` : 'Tidak ada blok yang cocok. Coba kata kunci lain.';
}
search.addEventListener('input', filterModules);

function openHashModule() {
  const datasetLink = location.hash === '#dataset';
  const target = modules.find(module => datasetLink ? module.dataset : location.hash === '#blok-' + module.id);
  if (!target) return;
  search.value = '';
  filterModules();
  const detail = document.getElementById('blok-' + target.id);
  detail.open = true;
  if (datasetLink) showStage(document.getElementById(target.id + '-tab-2'));
  const focus = datasetLink ? caseSelect : detail.querySelector('summary');
  focus.focus({ preventScroll: true });
  (datasetLink ? document.querySelector('#dataset') : detail).scrollIntoView();
}
window.addEventListener('hashchange', openHashModule);
document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || link.hasAttribute('download') || !link.getAttribute('href')?.startsWith('#')) return;
  if (link.hash === location.hash) openHashModule();
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

filterModules();
showProgress();
openHashModule();
