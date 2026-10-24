// Tapan CSC — interactive local service demos.
// These examples run in the browser only. They do not submit forms, make payments, or upload files.

const $ = (selector, root = document) => root.querySelector(selector);
const demoPanel = $('#serviceDemo');
const demoContent = $('#demoContent');
const demoTitle = $('#serviceDemoTitle');
const menuToggle = $('#menuToggle');
const mainNav = $('.main-nav');
let currentObjectUrl = null;

const demoTitles = {
  printing: 'Printing & photocopy estimate',
  forms: 'Online form preparation checklist',
  bills: 'Bill payment support preview',
  scanning: 'Document scanning preview'
};

function formatRupees(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2
  }).format(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function resetObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function showDemo(type) {
  const renderers = {
    printing: renderPrintingDemo,
    forms: renderFormsDemo,
    bills: renderBillsDemo,
    scanning: renderScanningDemo
  };
  if (!renderers[type]) return;
  resetObjectUrl();
  demoTitle.textContent = demoTitles[type];
  demoContent.innerHTML = renderers[type]();
  demoPanel.classList.remove('hidden');
  demoPanel.dataset.activeDemo = type;
  demoPanel.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  const firstControl = $('input, select, button', demoContent);
  if (firstControl) window.setTimeout(() => firstControl.focus({ preventScroll: true }), 150);
}

function renderPrintingDemo() {
  return `
    <form class="demo-form" id="printingForm">
      <div class="demo-grid">
        <div class="demo-field">
          <label for="printType">Print type</label>
          <select id="printType" name="printType">
            <option value="3">Black &amp; white — sample ₹3/page</option>
            <option value="10">Colour — sample ₹10/page</option>
          </select>
        </div>
        <div class="demo-field">
          <label for="printPages">Number of pages</label>
          <input id="printPages" name="printPages" type="number" min="1" max="500" value="10" required inputmode="numeric">
          <span class="demo-hint">Enter between 1 and 500 pages.</span>
        </div>
      </div>
      <div class="demo-actions"><button class="btn btn-primary" type="submit">Calculate estimate <span aria-hidden="true">→</span></button><button class="btn btn-secondary" type="reset">Reset</button></div>
      <div class="demo-result hidden" id="printResult" aria-live="polite"></div>
    </form>`;
}

function renderFormsDemo() {
  return `
    <form class="demo-form" id="formsDemoForm">
      <div class="demo-grid">
        <div class="demo-field">
          <label for="formCategory">What kind of form do you need?</label>
          <select id="formCategory" name="formCategory">
            <option value="education">Education / admission</option>
            <option value="job">Job application</option>
            <option value="certificate">Certificate application</option>
            <option value="pension">Pension / benefit enquiry</option>
          </select>
        </div>
        <div class="demo-field">
          <label for="formLanguage">Preferred language</label>
          <select id="formLanguage" name="formLanguage">
            <option>Odia</option><option>English</option><option>Hindi</option>
          </select>
        </div>
      </div>
      <div class="demo-actions"><button class="btn btn-primary" type="submit">Show sample checklist <span aria-hidden="true">→</span></button></div>
      <div class="demo-result hidden" id="formResult" aria-live="polite"></div>
    </form>`;
}

function renderBillsDemo() {
  return `
    <form class="demo-form" id="billsDemoForm">
      <div class="demo-grid">
        <div class="demo-field">
          <label for="billCategory">Bill category</label>
          <select id="billCategory" name="billCategory">
            <option>Electricity</option><option>Water</option><option>Mobile recharge</option><option>DTH / TV</option><option>Other bill</option>
          </select>
        </div>
        <div class="demo-field">
          <label for="billAmount">Example bill amount (₹)</label>
          <input id="billAmount" name="billAmount" type="number" min="1" max="1000000" value="500" step="0.01" required inputmode="decimal">
        </div>
      </div>
      <div class="demo-field" style="margin-top:17px">
        <label for="billReference">Reference / consumer number <span style="font-weight:500;color:#7b8c82">(optional)</span></label>
        <input id="billReference" name="billReference" type="text" maxlength="40" placeholder="Use a sample reference only">
        <span class="demo-hint">Do not enter OTPs, passwords, card details or other confidential information.</span>
      </div>
      <div class="demo-actions"><button class="btn btn-primary" type="submit">Preview bill summary <span aria-hidden="true">→</span></button></div>
      <div class="demo-result hidden" id="billResult" aria-live="polite"></div>
    </form>`;
}

function renderScanningDemo() {
  return `
    <div class="demo-form">
      <div class="file-drop">
        <div class="file-symbol" aria-hidden="true">↥</div>
        <strong>Choose a sample document</strong>
        <p>Select a PDF or image from your device to preview its details.</p>
        <input id="scanFile" type="file" accept="image/*,.pdf,application/pdf" aria-label="Choose a document to preview">
        <div class="demo-hint" style="margin-top:10px">Your file stays in this browser and is not uploaded.</div>
      </div>
      <div id="scanResult" class="demo-result hidden" aria-live="polite"></div>
      <div id="scanPreview" class="file-preview"></div>
    </div>`;
}

function updatePrintEstimate(result) {
  const pagesInput = $('#printPages');
  const typeInput = $('#printType');
  const pages = Number(pagesInput.value);
  if (!pagesInput.checkValidity() || !Number.isInteger(pages) || pages < 1 || pages > 500) {
    pagesInput.reportValidity();
    return;
  }
  const rate = Number(typeInput.value);
  const mode = rate === 3 ? 'Black & white' : 'Colour';
  result.innerHTML = `
    <h4>Sample estimate</h4>
    <p><strong>Print type:</strong> ${mode}</p>
    <p><strong>Pages:</strong> ${pages}</p>
    <p><strong>Example rate:</strong> ${formatRupees(rate)} per page</p>
    <div class="result-total"><span>Estimated total</span><strong>${formatRupees(pages * rate)}</strong></div>
    <p>This is an example calculation. Confirm actual rates and print settings before placing an order.</p>`;
  result.classList.remove('hidden');
}

const checklistByType = {
  education: ['Recent passport-size photo (if required)', 'School / college details', 'Previous marksheet or certificate', 'Identity and address proof, if required', 'Active mobile number or email'],
  job: ['Updated resume or application details', 'Education certificates and marksheets', 'Photo and signature, if required', 'Identity proof, if required', 'Review eligibility and application deadline'],
  certificate: ['Confirm the exact certificate type', 'Identity and address documents as applicable', 'Supporting records for the application', 'Mobile number for status updates', 'Check the official portal for current requirements'],
  pension: ['Confirm the scheme and eligibility', 'Identity and age proof, where applicable', 'Bank details only through the official process', 'Relevant income / residence documents, if required', 'Check current scheme guidelines with the authorised office']
};

function createFormsChecklist(result) {
  const category = $('#formCategory').value;
  const language = $('#formLanguage').value;
  const label = $('#formCategory').selectedOptions[0].textContent;
  const items = checklistByType[category] || checklistByType.education;
  result.innerHTML = `
    <h4>Sample preparation checklist</h4>
    <p><strong>Category:</strong> ${escapeHtml(label)}</p>
    <p><strong>Preferred language:</strong> ${escapeHtml(language)}</p>
    <div class="checklist">${items.map((item, index) => `<label class="check-item"><input type="checkbox" name="checkItem${index}"><span>${escapeHtml(item)}</span></label>`).join('')}</div>
    <p style="margin-top:13px">Requirements vary by scheme, department and application. Verify the official checklist before applying.</p>`;
  result.classList.remove('hidden');
}

function previewBill(result) {
  const amountInput = $('#billAmount');
  const amount = Number(amountInput.value);
  if (!amountInput.checkValidity() || !Number.isFinite(amount) || amount < 1 || amount > 1000000) {
    amountInput.reportValidity();
    return;
  }
  const category = $('#billCategory').value;
  const reference = $('#billReference').value.trim();
  result.innerHTML = `
    <h4>Example bill summary</h4>
    <p><strong>Category:</strong> ${escapeHtml(category)}</p>
    <p><strong>Example amount:</strong> ${formatRupees(amount)}</p>
    ${reference ? `<p><strong>Sample reference:</strong> ${escapeHtml(reference)}</p>` : ''}
    <div class="result-total"><span>Amount entered for preview</span><strong>${formatRupees(amount)}</strong></div>
    <p>No payment has been made. This preview is not connected to a biller, payment gateway or government system.</p>`;
  result.classList.remove('hidden');
}

function previewFile(file) {
  const result = $('#scanResult');
  const preview = $('#scanPreview');
  resetObjectUrl();
  preview.innerHTML = '';
  if (!file) {
    result.classList.add('hidden');
    result.innerHTML = '';
    return;
  }
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/');
  if (!isPdf && !isImage) {
    result.innerHTML = '<h4>Unsupported file</h4><p>Please choose a PDF or image file.</p>';
    result.classList.remove('hidden');
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    result.innerHTML = '<h4>File is too large for this demo</h4><p>Choose a file smaller than 15 MB.</p>';
    result.classList.remove('hidden');
    return;
  }
  const size = file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  const kind = isPdf ? 'PDF document' : `Image${file.type ? ` (${file.type})` : ''}`;
  currentObjectUrl = URL.createObjectURL(file);
  result.innerHTML = `<h4>Selected document</h4><p><strong>Filename:</strong> ${escapeHtml(file.name)}</p><p><strong>Type:</strong> ${escapeHtml(kind)}</p><p><strong>Size:</strong> ${size}</p><p>The file has not been uploaded or shared.</p>`;
  result.classList.remove('hidden');
  if (isImage) {
    preview.innerHTML = `<img src="${currentObjectUrl}" alt="Local preview of selected document image">`;
  } else {
    preview.innerHTML = `<iframe src="${currentObjectUrl}" title="Local PDF preview"></iframe>`;
  }
}

// Demo buttons in each service card.
document.querySelectorAll('.demo-trigger').forEach((button) => {
  button.addEventListener('click', () => showDemo(button.dataset.demo));
});

$('#closeServiceDemo').addEventListener('click', () => {
  resetObjectUrl();
  demoPanel.classList.add('hidden');
  demoPanel.removeAttribute('data-active-demo');
  demoContent.innerHTML = '';
});

// Delegated form events are rebound after each demo panel is rendered.
demoContent.addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.target.id === 'printingForm') updatePrintEstimate($('#printResult'));
  if (event.target.id === 'formsDemoForm') createFormsChecklist($('#formResult'));
  if (event.target.id === 'billsDemoForm') previewBill($('#billResult'));
});

demoContent.addEventListener('reset', () => {
  window.setTimeout(() => {
    const result = $('#printResult');
    if (result) { result.classList.add('hidden'); result.innerHTML = ''; }
  }, 0);
});

demoContent.addEventListener('change', (event) => {
  if (event.target.id === 'scanFile') previewFile(event.target.files && event.target.files[0]);
});

// Mobile navigation.
menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? '×' : '☰';
});
document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = '☰';
}));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  }
});

$('#year').textContent = new Date().getFullYear();
