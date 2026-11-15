const search = document.querySelector('#search');
const agendaPanel = document.querySelector('#agenda-panel');
const moduleGrid = document.querySelector('#modules');
const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav-links');
const announcement = document.querySelector('#announcement');
const storageKey = 'pbk-ai-praktis-kesiapan-v1';
const openGemini = `<a class="button secondary copy-button" href="${geminiUrl}" target="_blank" rel="noopener">Buka Gemini <span aria-hidden="true">↗</span></a>`;

function downloadMaterial(file, label) {
  return `<a class="button secondary copy-button" href="bahan/${file}" download>Unduh ${label} ↓</a>`;
}

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

function materials(module, forExample = false) {
  if (module.dataset) {
    if (forExample) return `<a class="button secondary copy-button" href="dataset/latihan-akademik.xlsx" download>Unduh dataset literasi media (XLSX) ↓</a>`;
    return `
      <label for="dataset-case">Pilih kasus</label>
      <select id="dataset-case">${datasetCases.map(([id, title]) => `<option value="${id}">${title}</option>`).join('')}</select>
      <a id="dataset-download" class="button secondary copy-button" href="dataset/latihan-${datasetCases[0][0]}.xlsx" download>Unduh dataset (XLSX) ↓</a>`;
  }
  return module.files.map(([file, label]) => downloadMaterial(file, label)).join('');
}

function textBox(id, title, copyLabel) {
  return `<div class="text-box">
    <div class="text-box-header">
      <h4>${title}</h4>
      <div class="text-box-actions">
        <button class="copy-button" type="button" data-copy="${id}">${copyLabel}</button>
      </div>
    </div>
    <pre id="${id}"></pre>
  </div>`;
}

const datasetKit = `<div class="dataset-kit">
  <p class="eyebrow">BAHAN LATIHAN</p>
  <h3>Paket dataset untuk dosen</h3>
  <p>Buku kerja sudah berisi contoh validasi dan audit untuk kasus evaluasi literasi media. Simpan salinannya, periksa contoh, lalu sesuaikan sel kuning dengan kasus dan hasil uji Anda.</p>
  <div class="practice-actions">
    <a class="button primary" href="dataset/paket-dataset-pbk-fdk.zip" download>Unduh paket lengkap ZIP ↓</a>
    ${downloadMaterial('buku-kerja-pbk-fdk.xlsx', 'buku kerja Excel dengan contoh')}
    ${downloadMaterial('panduan-dataset-fdk.pdf', 'panduan PDF')}
    ${downloadMaterial('kalkulator-biaya-ai.xlsx', 'kalkulator biaya opsional')}
  </div>
  <a class="text-link" href="#data-klien">Panduan jika memakai data klien <span aria-hidden="true">↓</span></a>
</div>`;

const extractionPractice = (id, heading) => `<div class="dataset-task">
  <h4>${heading}</h4>
  <p>Unggah formulir PDF di Gemini dan jalankan prompt. Cocokkan tanggal, kategori, skor, dan status AK-001 dengan baris pertama di tab Data mentah file Excel. Catat rujukan BUK-AK-01 di tab Log audit pada buku kerja.</p>
  <div class="practice-actions">
    ${openGemini}
    ${downloadMaterial('formulir-umpan-balik.pdf', 'formulir PDF')}
    <a class="button secondary copy-button" href="dataset/latihan-akademik.xlsx" download>Unduh dataset literasi media (XLSX) ↓</a>
  </div>
  ${textBox(id, 'Prompt ekstraksi formulir', 'Salin prompt')}
  <p class="dataset-result"><strong>Contoh hasil.</strong> AK-001 tercatat 2026-10-01 pada kategori Materi, berskor 1, dan berstatus Terbuka. Rujukan BUK-AK-01.</p>
</div>`;

const sopPractice = (id, isPractice = false) => `<div class="dataset-task"${isPractice ? ' id="uji-sop"' : ''}>
  <h4>Uji perubahan SOP tindak lanjut</h4>
  <p>Unggah dua versi SOP di Gemini, lalu jalankan prompt. Cocokkan tanggal berlaku dengan Pasal 1 dan batas tindak lanjut dengan Pasal 2. Simpan hasil aktual dan rujukan di sheet Perawatan.</p>
  <div class="practice-actions">
    ${openGemini}
    ${downloadMaterial('sop-tindak-lanjut-v1.pdf', 'SOP v1 PDF')}
    ${downloadMaterial('sop-tindak-lanjut-v2.pdf', 'SOP v2 PDF')}
  </div>
  ${textBox(id, 'Prompt uji perubahan SOP', 'Salin prompt')}
  <p class="dataset-result"><strong>Contoh hasil.</strong> Catatan 28 Oktober mengikuti SOP v1 dengan batas 14 hari. Catatan 2 November mengikuti SOP v2 dengan batas 7 hari. Jika tanggal kosong, minta konfirmasi.</p>
</div>`;

const stageNames = ['Kenali', 'Lihat Contoh', 'Coba Sendiri', 'Cek Pemahaman'];
function renderReview(module) {
  const mapping = `<p><strong>Pemetaan latihan</strong> · ${module.unit}</p>`;
  if (!module.review) {
    const [question, answer] = module.check;
    return `<h3>${question}</h3>
      <details class="answer"><summary>Lihat pembahasan</summary><p>${answer}</p></details>
      ${mapping}`;
  }
  return `<section id="cek-validasi-data" aria-labelledby="judul-cek-validasi">
    <h3 id="judul-cek-validasi" tabindex="-1">Cek pemahaman validasi data</h3>
    <p>Buka tab Data mentah pada dataset akademik. Untuk tiap soal, tentukan temuan, keputusan, dan catatan audit sebelum membuka pembahasan. Nomor baris data mengikuti kolom Baris di Excel.</p>
    <div class="practice-actions">
      ${materials(module, true)}
      ${downloadMaterial('formulir-umpan-balik.pdf', 'formulir sumber (PDF)')}
      ${downloadMaterial('buku-kerja-pbk-fdk.xlsx', 'buku kerja Excel dengan contoh')}
    </div>
    <ol class="review-list">
      ${module.review.map(({topic, question, answer}) => `<li>
        <h4>${topic}</h4>
        <p>${question}</p>
        <details class="answer"><summary>Lihat pembahasan: ${topic}</summary><p>${answer}</p></details>
      </li>`).join('')}
    </ol>
    ${mapping}
  </section>`;
}

const aiModelGuide = `<section class="model-guide" id="pilihan-model-ai" aria-labelledby="model-guide-title">
  <h3 id="model-guide-title" tabindex="-1">ChatGPT, Claude, dan Gemini</h3>
  <p>Bandingkan kelebihan model dan contoh tugasnya. Pilihan ini dapat berubah mengikuti paket dan pengaturan akun.</p>
  <div class="model-grid">
    ${aiPlatforms.map(({ name, provider, source, access, models }) => `
      <article class="model-card">
        <h4>${name} <span>· ${provider}</span></h4>
        <dl>${models.map(([model, strength, task]) => `
          <div><dt>${model}</dt><dd>${strength} <span>Contoh: ${task}</span></dd></div>`).join('')}</dl>
        <p>${access}</p>
        <a class="text-link" href="${source}" target="_blank" rel="noopener">Panduan model ${name} ↗</a>
      </article>`).join('')}
  </div>
  <p>Rujukan model diperiksa 15 November 2026. <a class="text-link" href="${geminiLimitsHelp}" target="_blank" rel="noopener">Batas pemakaian Gemini ↗</a></p>
</section>`;
moduleGrid.innerHTML = modules.map((module, index) => {
  const id = module.id;
  const promptId = 'prompt-' + id;
  const hasPrompt = module.prompt || module.dataset;
  const stages = [
    () => `<dl class="concepts">${module.concepts.map(([term, definition]) => `<div><dt>${term}</dt><dd>${definition}</dd></div>`).join('')}</dl>
     ${id === 'orientasi' ? `<p><a class="text-link" href="${agentHelp}" target="_blank" rel="noopener">Penjelasan AI agent ↗</a></p>${aiModelGuide}` : ''}
     ${id === 'skill' ? `<a class="text-link" href="${skillHelp}" target="_blank" rel="noopener">Panduan resmi Keahlian Gemini ↗</a>` : ''}`,
    () => `<h3>Contoh dan hasil yang diharapkan</h3>
      <p>${module.example.note}</p>
      <div class="practice-actions">${openGemini}${materials(module, true)}</div>
      ${module.example.starter ? textBox('example-starter-' + id, 'Prompt awal', 'Salin prompt') : ''}
      ${hasPrompt ? textBox('example-prompt-' + id, 'Prompt contoh', 'Salin prompt') : ''}
      ${module.example.input ? textBox('example-input-' + id, 'Cuplikan bahan', 'Salin bahan') : ''}
      <h4 class="example-output-title">Contoh hasil</h4>
      <pre class="example-output" id="example-output-${id}"></pre>
      ${module.dataset ? extractionPractice('example-prompt-ekstraksi', 'Contoh ekstraksi dari formulir PDF') : ''}
      ${id === 'perawatan' ? sopPractice('example-prompt-sop') : ''}`,
    () => `<div class="practice" ${module.dataset ? 'id="dataset"' : ''}>
      ${module.dataset ? `${datasetKit}${extractionPractice('prompt-ekstraksi', '1. Cocokkan formulir dengan Excel')}<h4 class="dataset-task-title">2. Audit data dan simpan hasil</h4>` : '<h3>Langkah praktik</h3>'}
      <ol class="practice-steps">${module.steps.map(step => `<li>${step}</li>`).join('')}</ol>
      <div class="practice-actions">
        ${openGemini}
        ${materials(module)}
        ${module.dataset || ['verifikasi', 'pemasangan', 'uji', 'perawatan', 'demonstrasi'].includes(id) ? downloadMaterial('buku-kerja-pbk-fdk.xlsx', 'buku kerja Excel dengan contoh') : ''}
      </div>
      ${hasPrompt ? textBox(promptId, 'Prompt siap pakai', module.dataset ? 'Salin prompt audit' : 'Salin prompt') : ''}
      ${module.dataset ? `
        <details class="client-practice" id="data-klien">
          <summary>Praktik dengan data klien jika disetujui</summary>
          <div class="guidance-body">
            <ol class="practice-steps">
              <li>Pastikan klien menyetujui penggunaan data untuk PBK. Konfirmasi kolom, hak akses, dan platform dengan instruktur.</li>
              <li>Buat salinan dengan kolom seperlunya. Hapus nama, NIM, kontak, dan informasi sensitif, termasuk yang tertulis di catatan. Gunakan kode latihan.</li>
              <li>Isi kamus pemetaan sesuai kolom dan aturan data Anda. Gunakan salinan XLSX yang sudah disamarkan. Unggah salinan dan kamus lewat platform yang disetujui, lalu jalankan prompt.</li>
              <li>Periksa temuan secara manual. Catat kode baris, keputusan, dan rujukan pada Log audit di salinan buku kerja. Gunakan paket sintetis jika izin atau platform belum tersedia.</li>
            </ol>
            ${downloadMaterial('kamus-pemetaan-kolom.xlsx', 'kamus pemetaan kolom (XLSX)')}
            ${textBox('prompt-data-klien', 'Prompt audit data klien', 'Salin prompt')}
          </div>
        </details>` : ''}
      ${id === 'perawatan' ? sopPractice('prompt-sop', true) : ''}
      <p><strong>Jika AI belum bisa diakses.</strong> ${module.offline}</p>
      <p><strong>Bukti yang disimpan.</strong> ${module.output}</p>
    </div>`,
    () => renderReview(module)
  ];
  const activeStages = [0];
  if (module.example) activeStages.push(1);
  if (module.steps) activeStages.push(2);
  if (module.check || module.review) activeStages.push(3);
  const body = activeStages.length === 1
    ? `<div class="lesson-panel">${stages[0]()}</div>`
    : `<div class="lesson-tabs" role="tablist" aria-label="Tahap ${module.title}">
        ${activeStages.map((stage, position) => `<button type="button" role="tab" id="${id}-tab-${stage}" aria-controls="${id}-stage-${stage}" aria-selected="${position === 0}" tabindex="${position === 0 ? 0 : -1}">${position + 1}. ${stageNames[stage]}</button>`).join('')}
      </div>
      ${activeStages.map((stage, position) => `<div class="lesson-panel" role="tabpanel" id="${id}-stage-${stage}" aria-labelledby="${id}-tab-${stage}" tabindex="0"${position ? ' hidden' : ''}>${stages[stage]()}</div>`).join('')}`;
  return `<details class="module" id="blok-${id}">
    <summary><span class="module-index">${String(index + 1).padStart(2, '0')}</span><span>${module.title}</span></summary>
    <div class="module-body">${body}</div>
  </details>`;
}).join('');

for (const module of modules) {
  const id = module.id;
  if (module.prompt || module.dataset) {
    const prompt = module.dataset ? datasetPrompt : module.prompt;
    document.getElementById('prompt-' + id).textContent = prompt;
    document.getElementById('example-prompt-' + id).textContent = prompt;
  }
  if (module.example) {
    if (module.example.starter) document.getElementById('example-starter-' + id).textContent = module.example.starter;
    if (module.example.input) document.getElementById('example-input-' + id).textContent = module.example.input;
    document.getElementById('example-output-' + id).textContent = module.example.output;
  }
}
document.querySelector('#master-prompt').textContent = masterPrompt;
document.querySelector('#prompt-data-klien').textContent = clientDataPrompt;
document.querySelector('#prompt-ekstraksi').textContent = extractionPrompt;
document.querySelector('#example-prompt-ekstraksi').textContent = extractionPrompt;
document.querySelector('#prompt-sop').textContent = sopPrompt;
document.querySelector('#example-prompt-sop').textContent = sopPrompt;

const caseSelect = document.querySelector('#dataset-case');
const datasetDownload = document.querySelector('#dataset-download');
function updateDatasetDownload() {
  datasetDownload.href = `dataset/latihan-${caseSelect.value}.xlsx`;
  datasetDownload.setAttribute('aria-label', 'Unduh dataset XLSX ' + caseSelect.selectedOptions[0].textContent);
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
  const clientLink = location.hash === '#data-klien';
  const sopLink = location.hash === '#uji-sop';
  const datasetLink = clientLink || location.hash === '#dataset';
  const reviewLink = location.hash === '#cek-validasi-data';
  const modelsLink = location.hash === '#pilihan-model-ai';
  let moduleHash = location.hash;
  if (modelsLink || moduleHash === '#blok-agent') moduleHash = '#blok-orientasi';
  if (reviewLink) moduleHash = '#blok-data';
  const target = modules.find(module => datasetLink ? module.dataset : sopLink ? module.id === 'perawatan' : moduleHash === '#blok-' + module.id);
  if (!target) return;
  search.value = '';
  filterModules();
  const detail = document.getElementById('blok-' + target.id);
  detail.open = true;
  if (datasetLink || sopLink) showStage(document.getElementById(target.id + '-tab-2'));
  if (modelsLink) showStage(document.getElementById('orientasi-tab-0'));
  if (reviewLink) showStage(document.getElementById('data-tab-3'));
  const section = datasetLink || sopLink || modelsLink || reviewLink ? document.querySelector(location.hash) : detail;
  if (clientLink) section.open = true;
  const focus = modelsLink || reviewLink ? section.querySelector('h3')
    : datasetLink || sopLink ? section.querySelector('summary, a') : detail.querySelector('summary');
  focus.focus({ preventScroll: true });
  section.scrollIntoView();
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

document.querySelector('#units').innerHTML = units.map(([code, title, activity]) => `
  <article class="unit-card"><span class="unit-code">${code}</span><h3>${title}</h3><p>${activity}</p></article>`).join('');

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
