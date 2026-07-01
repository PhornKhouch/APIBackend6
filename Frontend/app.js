/* ─────────────────────────────────────────────────────────────
   KHQR Payment Tester — talks to the node-api Bakong endpoints:
     POST /api/khqr/generate       { amount, currency, billNumber }
     POST /api/khqr/verify         { qrString }
     POST /api/khqr/check-payment  { md5 }
   Flow: generate → auto verify → poll check-payment until paid.
   ───────────────────────────────────────────────────────────── */

// ── Element refs ──
const el = (id) => document.getElementById(id);
const apiBaseInput = el('apiBase');
const genForm       = el('genForm');
const genBtn        = el('genBtn');
const qrWrap        = el('qrWrap');
const qrcodeEl      = el('qrcode');
const qrMeta        = el('qrMeta');
const metaAmount    = el('metaAmount');
const metaMerchant  = el('metaMerchant');
const metaMd5       = el('metaMd5');
const paidOverlay   = el('paidOverlay');
const statusBox     = el('statusBox');
const statusText    = el('statusText');
const verifyResult  = el('verifyResult');
const startPollBtn  = el('startPollBtn');
const stopPollBtn   = el('stopPollBtn');
const checkOnceBtn  = el('checkOnceBtn');
const logEl         = el('log');

// ── State ──
let currentMd5 = null;
let qrInstance = null;
let pollTimer = null;
let pollAttempts = 0;
const POLL_INTERVAL_MS = 5000;   // check every 5s
const MAX_POLL_ATTEMPTS = 60;    // ~5 minutes (matches QR expiry)

// ── Helpers ──
function apiBase() {
    return apiBaseInput.value.trim().replace(/\/+$/, '');
}

function log(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = 'line';
    line.innerHTML = `<span class="t">[${time}]</span> <span class="${type}">${msg}</span>`;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
}

function setStatus(state, text) {
    statusBox.className = `status-box ${state}`;
    statusText.textContent = text;
}

async function apiPost(path, body) {
    const url = `${apiBase()}${path}`;
    log(`POST ${path} → ${JSON.stringify(body)}`, 'info');
    let res, data;
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    } catch (networkErr) {
        throw new Error(`Network error: ${networkErr.message}. Is the API running at ${apiBase()}?`);
    }
    try {
        data = await res.json();
    } catch {
        data = { success: false, message: `Non-JSON response (HTTP ${res.status})` };
    }
    return { status: res.status, data };
}

// ── QR rendering ──
function renderQR(qrString) {
    qrcodeEl.innerHTML = '';
    qrInstance = new QRCode(qrcodeEl, {
        text: qrString,
        width: 220,
        height: 220,
        correctLevel: QRCode.CorrectLevel.M,
    });
    qrWrap.classList.remove('empty');
}

function resetPaymentUI() {
    stopPolling();
    currentMd5 = null;
    paidOverlay.classList.add('hidden');
    verifyResult.textContent = 'Not checked';
    verifyResult.className = 'muted';
    startPollBtn.disabled = true;
    stopPollBtn.disabled = true;
    checkOnceBtn.disabled = true;
}

// ── 1. Generate KHQR ──
genForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetPaymentUI();

    const amount = parseFloat(el('amount').value);
    const currency = el('currency').value;
    const billNumber = el('billNumber').value.trim();

    if (!amount || amount <= 0) {
        setStatus('error', 'Enter a valid amount.');
        return;
    }

    genBtn.disabled = true;
    genBtn.textContent = 'Generating…';
    setStatus('pending', 'Generating KHQR…');

    try {
        const body = { amount, currency };
        if (billNumber) body.billNumber = billNumber;

        const { status, data } = await apiPost('/api/khqr/generate', body);

        if (status === 200 && data.success && data.data?.qr) {
            const d = data.data;
            currentMd5 = d.md5;

            renderQR(d.qr);
            metaAmount.textContent = `${d.amount} ${d.currency}`;
            metaMerchant.textContent = d.merchantName || '-';
            metaMd5.textContent = d.md5 || '-';
            metaMd5.title = d.md5 || '';
            qrMeta.classList.remove('hidden');

            log(`KHQR generated. md5=${d.md5}`, 'ok');
            setStatus('pending', 'QR ready — scan with a Bakong app to pay.');

            checkOnceBtn.disabled = false;

            // 2. Auto-verify the generated QR string
            await verifyQR(d.qr);

            // 3. Auto-start polling for payment
            startPolling();
        } else {
            log(`Generate failed: ${data.message || 'Unknown error'}`, 'err');
            setStatus('error', data.message || 'Failed to generate KHQR.');
        }
    } catch (err) {
        log(err.message, 'err');
        setStatus('error', err.message);
    } finally {
        genBtn.disabled = false;
        genBtn.textContent = 'Generate KHQR';
    }
});

// ── 2. Verify QR string ──
async function verifyQR(qrString) {
    try {
        const { data } = await apiPost('/api/khqr/verify', { qrString });
        if (data.success && data.data) {
            const valid = data.data.isValid;
            verifyResult.textContent = valid ? '✓ Valid' : '✗ Invalid';
            verifyResult.className = valid ? 'ok' : 'err';
            log(`Verify: isValid=${valid}`, valid ? 'ok' : 'warn');
        } else {
            verifyResult.textContent = 'Verify failed';
            verifyResult.className = 'warn';
            log(`Verify failed: ${data.message || 'Unknown'}`, 'warn');
        }
    } catch (err) {
        verifyResult.textContent = 'Verify error';
        verifyResult.className = 'err';
        log(`Verify error: ${err.message}`, 'err');
    }
}

// ── 3. Check payment (single) ──
async function checkPaymentOnce() {
    if (!currentMd5) return false;
    try {
        const { status, data } = await apiPost('/api/khqr/check-payment', { md5: currentMd5 });

        if (data.success && data.isCompleted) {
            onPaymentSuccess(data);
            return true;
        }

        // Not paid yet, or API disabled / error
        if (status === 400 && /not enabled/i.test(data.message || '')) {
            log('check-payment: Bakong API is not enabled on the server.', 'warn');
            setStatus('error', 'Bakong API disabled — set BAKONG_API_ENABLED=true.');
            stopPolling();
        } else {
            log(`Not paid yet: ${data.message || 'PENDING'}`, 'warn');
        }
        return false;
    } catch (err) {
        log(`Check error: ${err.message}`, 'err');
        return false;
    }
}

function onPaymentSuccess(data) {
    stopPolling();
    paidOverlay.classList.remove('hidden');
    setStatus('success', 'Payment received & confirmed!');
    const info = data.data || {};
    log(`PAYMENT COMPLETED ✓ amount=${info.amount ?? '?'} ${info.currency ?? ''} from=${info.fromAccountId ?? '?'}`, 'ok');
}

// ── Polling control ──
function startPolling() {
    stopPolling();
    pollAttempts = 0;
    startPollBtn.disabled = true;
    stopPollBtn.disabled = false;
    checkOnceBtn.disabled = false;
    setStatus('pending', 'Waiting for payment… (auto-checking)');
    log(`Auto-check started — every ${POLL_INTERVAL_MS / 1000}s.`, 'info');

    pollTimer = setInterval(async () => {
        pollAttempts++;
        log(`Checking payment… (attempt ${pollAttempts}/${MAX_POLL_ATTEMPTS})`, 'info');
        const done = await checkPaymentOnce();
        if (done) return;
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
            stopPolling();
            setStatus('error', 'Timed out waiting for payment.');
            log('Auto-check timed out.', 'warn');
        }
    }, POLL_INTERVAL_MS);
}

function stopPolling() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
        log('Auto-check stopped.', 'info');
    }
    startPollBtn.disabled = !currentMd5;
    stopPollBtn.disabled = true;
}

// ── Button wiring ──
startPollBtn.addEventListener('click', startPolling);
stopPollBtn.addEventListener('click', () => {
    stopPolling();
    setStatus('pending', 'Auto-check paused.');
});
checkOnceBtn.addEventListener('click', async () => {
    log('Manual check requested.', 'info');
    await checkPaymentOnce();
});

// ── Init ──
setStatus('idle', 'Idle — generate a QR to begin.');
log('Ready. Set your API base URL and generate a KHQR.', 'info');
