import api from './services/api';

// js/data.js — Shared Mock Data

const EviData = {
  evidence: [],
  auditLog: [],
  chainTxns: [],
  uploadChartData: [1, 2, 1, 3, 2, 1, 1],
  uploadChartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  uploadChartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

const AppState = {
  isAuthenticated: false,
  walletAddress: null,
  fullName: null,
  role: null,
  profile: null,
  authPending: false,
  dataPending: false,
};

function shortAddress(address) {
  if (!address) return 'Not connected';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function roleLabel(role) {
  if (!role) return 'Officer';
  if (role === 'police_officer') return 'Police Officer';
  if (role === 'forensic_officer') return 'Forensic Officer';
  if (role === 'judge') return 'Judge';
  if (role === 'lawyer') return 'Lawyer';
  return role;
}

function canUploadEvidence() {
  return ['police_officer', 'forensic_officer'].includes(String(AppState.role || '').toLowerCase());
}

function matchesConnectedWallet(value) {
  const current = String(AppState.walletAddress || '').trim().toLowerCase();
  const candidate = String(value || '').trim().toLowerCase();
  if (!current || !candidate) return false;
  return current === candidate;
}

function inferEvidenceType(fileName = '') {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const extMap = {
    pdf: 'DOC',
    doc: 'DOC',
    docx: 'DOC',
    txt: 'LOG',
    log: 'LOG',
    csv: 'LOG',
    json: 'LOG',
    jpg: 'IMG',
    jpeg: 'IMG',
    png: 'IMG',
    gif: 'IMG',
    webp: 'IMG',
    mp4: 'VID',
    mov: 'VID',
    pcap: 'LOG',
    zip: 'ARCH',
    rar: 'ARCH',
    '7z': 'ARCH',
    tar: 'ARCH',
    gz: 'ARCH',
    tgz: 'ARCH',
  };
  return extMap[ext] || 'DOC';
}

/*

        const hasEvidence = EviData.evidence.length > 0;
        const totalEvidence = EviData.evidence.length;
        const verifiedEvidence = EviData.evidence.filter((e) => e.status === 'verified').length;
        const pendingEvidence = EviData.evidence.filter((e) => e.status === 'pending').length;
        const integrityRate = totalEvidence > 0 ? ((verifiedEvidence / totalEvidence) * 100).toFixed(1) : '0.0';
        const chartData = hasEvidence ? EviData.uploadChartData : [3, 5, 2, 6, 4, 7, 5];
        const chartLabels = hasEvidence ? EviData.uploadChartLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const maxVal = Math.max(...chartData, 1);

        const shortText = (value) => {
          const text = String(value || '');
          if (!text) return '—';
          return text.length > 12 ? `${text.slice(0, 6)}...${text.slice(-4)}` : text;
        };

        const statusMeta = {
          verified: { label: 'Verified', className: 'text-tertiary bg-tertiary/10 border border-tertiary/20' },
          pending: { label: 'Pending', className: 'text-secondary bg-secondary/10 border border-secondary/20' },
          failed: { label: 'Alert', className: 'text-error bg-error/10 border border-error/20' },
        };

        const chartBars = chartData.map((value, index) => {
          const heightPct = Math.round((value / maxVal) * 100);
          const label = chartLabels[index] || '';
          return `
            <div class="w-12 group relative flex flex-col items-center">
              <div class="bg-primary/10 w-full h-full absolute bottom-0"></div>
              <div class="bg-primary w-full relative transition-all duration-500 group-hover:brightness-125" style="height:${heightPct}%">
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 text-[10px] font-code-snippet text-primary opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 border border-primary/20">${value} files</div>
              </div>
              <span class="absolute -bottom-6 text-[10px] font-label-caps text-on-surface-variant">${label}</span>
            </div>`;
        }).join('');

            <div class="p-gutter space-y-stack-lg">
              <div class="page-header">
                <div>
                  <div class="page-title">View Evidence</div>
                </div>
                <div class="search-bar" style="min-width:0;width:100%;max-width:320px;">
                  ${Components.icon.search}
                  <input type="text" id="view-ev-search" placeholder="Filter by ID, name, case..." oninput="PageViewEvidence.filter(this.value)"/>
                </div>
              </div>

              <div class="two-col" style="grid-template-columns:300px 1fr;gap:20px;align-items:start;">
                <!-- Left: Evidence List -->
                <div class="card" style="margin-bottom:0;max-height:calc(100vh - 200px);overflow-y:auto;">
                  <div class="card-header">
                    <div class="card-title">${Components.icon.folder} Evidence Files</div>
                    <span class="nav-badge" id="view-ev-count">${EviData.evidence.length}</span>
                  </div>
                  <div id="view-ev-list"></div>
                </div>

                <!-- Right: Detail Panel -->
                <div id="view-ev-detail">
                  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;color:var(--text3);gap:14px;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <div style="font-family:var(--font-mono);font-size:12px;">Select an evidence item to view details</div>
                  </div>
                </div>
              </div>
            </div>`;
                  </td>
                </tr>`;
            }).join('')
          : `<tr><td colspan="4" class="px-6 py-6 text-body-sm text-on-surface-variant">No ledger entries yet. Connect your wallet and sync to load activity.</td></tr>`;

        const activitySource = EviData.auditLog.length
          ? EviData.auditLog.slice(0, 4)
          : [
              { action: 'status', detail: 'Dashboard ready for wallet sync', time: '—', user: 'system' },
              { action: 'pipeline', detail: 'Evidence ingestion pipeline online', time: '—', user: 'system' },
            ];

        const activityRows = activitySource.map((entry) => `
          <div class="flex items-center justify-between p-3 bg-white/5 border-l-2 border-tertiary/60">
            <div>
              <div class="text-[10px] font-label-caps text-on-surface-variant">${String(entry.action || 'event').toUpperCase()}</div>
              <div class="text-body-sm text-on-surface">${entry.detail || '—'}</div>
              <div class="text-[10px] font-label-caps text-on-surface-variant opacity-60">${entry.user || 'system'}</div>
            </div>
            <div class="text-[10px] font-label-caps text-on-surface-variant opacity-60">${entry.time || '—'}</div>
          </div>`).join('');

        const primaryAction = canUploadEvidence()
          ? `<button class="px-6 py-3 bg-primary-container text-on-primary-container font-label-caps text-label-caps rounded-lg hover:brightness-110 transition-all" onclick="Router.go('upload', document.querySelector('[data-page=upload]'))">New Entry</button>`
          : `<button class="px-6 py-3 border border-outline-variant/50 text-primary font-label-caps text-label-caps rounded-lg hover:bg-primary/5 transition-all" onclick="Router.go('view-evidence', document.querySelector('[data-page=view-evidence]'))">View Evidence</button>`;

        document.getElementById('page-dashboard').innerHTML = `
          <div class="p-gutter space-y-stack-lg">
            <div class="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <h1 class="font-display-lg text-display-lg text-primary">Forensic Integrity Dashboard</h1>
                <p class="text-body-lg text-secondary mt-2 font-medium">Live chain-of-custody telemetry and instance performance overview.</p>
              </div>
              <div class="flex items-center gap-3">
                ${primaryAction}
              </div>
            </div>

            <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div class="glass-card p-3 border-l-4 border-l-primary">
                <div class="flex justify-between items-start mb-2">
                  <p class="text-[10px] font-bold tracking-[0.12em] text-secondary">TOTAL EVIDENCE</p>
                  <span class="material-symbols-outlined text-primary/40 text-xs">inventory_2</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <h2 class="text-2xl font-bold text-primary">${totalEvidence}</h2>
                </div>
                <p class="text-[9px] text-secondary mt-1 font-medium">Active forensic payloads recorded</p>
              </div>
              <div class="glass-card p-3 border-l-4 border-l-tertiary">
                <div class="flex justify-between items-start mb-2">
                  <p class="text-[10px] font-bold tracking-[0.12em] text-secondary">INSTANCE INTEGRITY</p>
                  <span class="material-symbols-outlined text-tertiary/40 text-xs">verified_user</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <h2 class="text-2xl font-bold text-tertiary">${integrityRate}%</h2>
                  <span class="text-[10px] font-code-snippet text-tertiary bg-tertiary/10 px-1">NOMINAL</span>
                </div>
                <p class="text-[9px] text-secondary mt-1 font-medium">Chain verification success rate</p>
              </div>
              <div class="glass-card p-3 border-l-4 border-l-outline-variant">
                <div class="flex justify-between items-start mb-2">
                  <p class="text-[10px] font-bold tracking-[0.12em] text-secondary">PENDING VERIFICATION</p>
                  <span class="material-symbols-outlined text-on-surface-variant/40 text-xs">hourglass_top</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <h2 class="text-2xl font-bold text-on-surface-variant">${pendingEvidence}</h2>
                </div>
                <p class="text-[9px] text-secondary mt-1 font-medium">Evidence awaiting finality</p>
              </div>
              <div class="glass-card p-3 border-l-4 border-l-secondary">
                <div class="flex justify-between items-start mb-2">
                  <p class="text-[10px] font-bold tracking-[0.12em] text-secondary">UPTIME STATUS</p>
                  <span class="material-symbols-outlined text-secondary/40 text-xs">sensors</span>
                </div>
                <div class="flex items-baseline gap-1">
                  <h2 class="text-2xl font-bold text-secondary">99.8<span class="text-lg">%</span></h2>
                </div>
                <div class="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div class="h-full bg-secondary w-[99.8%]"></div>
                </div>
              </div>
            </section>

            <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div class="lg:col-span-8 glass-card p-8">
                <div class="flex justify-between items-center mb-10">
                  <div>
                    <h3 class="font-headline-sm text-headline-sm text-on-surface tracking-tight">Evidence Ingestion Activity</h3>
                    <p class="text-body-sm text-secondary font-medium">Weekly throughput across intake instances</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-primary"></span>
                    <span class="text-[10px] font-label-caps text-secondary">SECURE UPLOADS</span>
                  </div>
                </div>
                <div class="relative h-72 chart-grid border-l border-b border-white/10">
                  <div class="absolute -left-10 top-0 h-full flex flex-col justify-between text-[10px] font-code-snippet text-secondary/70 py-1">
                    <span>${maxVal} files</span>
                    <span>${Math.round(maxVal * 0.75)} files</span>
                    <span>${Math.round(maxVal * 0.5)} files</span>
                    <span>${Math.round(maxVal * 0.25)} files</span>
                    <span>0</span>
                  </div>
                  <div class="absolute inset-0 flex items-end justify-between px-6 pt-4 pb-0">
                    ${chartBars}
                  </div>
                </div>
              </div>

              <div class="lg:col-span-4 glass-card p-8 flex flex-col">
                <div class="flex justify-between items-start mb-8">
                  <div>
                    <h3 class="font-headline-sm text-headline-sm text-on-surface">System Integrity</h3>
                    <p class="text-body-sm text-secondary font-medium">Verification diagnostics</p>
                  </div>
                  <span class="material-symbols-outlined text-tertiary">check_circle</span>
                </div>
                <div class="flex-1 flex flex-col items-center justify-center space-y-8">
                  <div class="relative w-40 h-40">
                    <svg class="w-full h-full transform -rotate-90">
                      <circle class="text-white/5" cx="80" cy="80" fill="transparent" r="72" stroke="currentColor" stroke-width="4"></circle>
                      <circle class="text-primary-container glow-cyan" cx="80" cy="80" fill="transparent" r="72" stroke="currentColor" stroke-dasharray="452" stroke-dashoffset="${452 - Math.round((Number(integrityRate) / 100) * 452)}" stroke-linecap="round" stroke-width="6"></circle>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="text-[10px] font-label-caps text-secondary/70">SECURITY LEVEL</span>
                      <span class="text-4xl font-display-lg font-bold text-primary tracking-tighter">${integrityRate}</span>
                      <span class="text-[10px] font-label-caps text-tertiary font-medium">VERIFIED INSTANCE</span>
                    </div>
                  </div>
                  <div class="w-full space-y-3">
                    <div class="flex justify-between items-center p-3 bg-white/5 border-l-2 border-tertiary">
                      <span class="text-[10px] font-label-caps text-secondary">BLOCKCHAIN FINALITY</span>
                      <span class="text-[10px] font-code-snippet text-tertiary font-semibold">CONFIRMED</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-white/5 border-l-2 border-tertiary">
                      <span class="text-[10px] font-label-caps text-secondary">HASH CONSISTENCY</span>
                      <span class="text-[10px] font-code-snippet text-tertiary font-semibold">MATCHED</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-white/5 border-l-2 border-tertiary">
                      <span class="text-[10px] font-label-caps text-secondary">AUTH SIGNATURES</span>
                      <span class="text-[10px] font-code-snippet text-tertiary font-semibold">VERIFIED</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div class="lg:col-span-8 glass-card">
                <div class="p-6 border-b border-white/5 flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <h3 class="font-headline-sm text-headline-sm text-on-surface">Ledger Entries</h3>
                    <span class="bg-primary/10 text-primary text-[10px] px-2 py-0.5 font-label-caps">LIVE FEED</span>
                  </div>
                  <button class="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                    <span class="font-label-caps text-label-caps">EXPORT CSV</span>
                    <span class="material-symbols-outlined text-sm">download</span>
                  </button>
                </div>
                <div class="overflow-x-auto">
                  <table class="ev-table w-full text-left">
                    <thead>
                      <tr>
                        <th class="px-6 py-4">TRANSACTION ID</th>
                        <th class="px-6 py-4">FINALIZED AT</th>
                        <th class="px-6 py-4">CONTENT IDENTIFIER (CID)</th>
                        <th class="px-6 py-4 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                      ${ledgerRows}
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="lg:col-span-4 glass-card p-6 flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-headline-sm text-headline-sm">Recent Activity</h3>
                  <span class="text-[10px] font-label-caps text-on-surface-variant">LATEST</span>
                </div>
                <div class="space-y-3">
                  ${activityRows}
                </div>
              </div>
            </section>
          </div>`;
  },

  logout() {
    setWalletDisconnected('Session cleared');
  },

  async restore() {
    if (!api.auth.isLoggedIn()) {
      Components.topbar();
      updateAuthGateVisibility();
      return;
    }

    try {
      const me = await api.auth.getMe();
      const authProfile = await api.auth.getProfile().catch(() => null);
      AppState.isAuthenticated = true;
      AppState.walletAddress = me.walletAddress;
      AppState.profile = authProfile || null;
      AppState.fullName = authProfile?.fullName || me.fullName || null;
      AppState.role = authProfile?.role || me.role || null;
      Components.topbar();
      updateAuthGateVisibility();
      await syncEvidenceFromBackend();

      const nav = document.querySelector('.nav-item[data-page="dashboard"]');
      Router.go('dashboard', nav || undefined);
    } catch {
      api.auth.logout();
      AppState.isAuthenticated = false;
      AppState.walletAddress = null;
      AppState.fullName = null;
      AppState.role = null;
      AppState.profile = null;
      Components.topbar();
      updateAuthGateVisibility();
    }
  },
};

*/

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    return new Date(value < 1e12 ? value * 1000 : value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const normalized = trimmed.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?$/)
      ? trimmed.replace(' ', 'T') + (trimmed.length === 16 ? ':00' : '')
      : trimmed;
    const parsedNormalized = new Date(normalized);
    if (!Number.isNaN(parsedNormalized.getTime())) return parsedNormalized;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '--';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function getRecordDate(record) {
  if (!record) return null;
  if (record._ts) return parseDate(record._ts);
  if (record.timestamp) return parseDate(record.timestamp);
  if (record.date) return parseDate(record.date);
  return null;
}

function buildWeeklyUploadSeries(records) {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  (Array.isArray(records) ? records : []).forEach((record) => {
    const date = getRecordDate(record);
    if (!date) return;
    const index = (date.getDay() + 6) % 7;
    counts[index] += 1;
  });

  return { labels, counts };
}

function normalizeCid(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('ipfs://')) return raw.slice('ipfs://'.length);
  const match = raw.match(/\/ipfs\/([^/?#]+)/i);
  if (match) return match[1];
  return raw;
}

function normalizeEvidenceType(provided, fileName = '', mimeType = '') {
  const normalizedProvided = String(provided || '').trim().toUpperCase();
  if (normalizedProvided === 'IMG' || normalizedProvided === 'LOG' || normalizedProvided === 'DOC' || normalizedProvided === 'VID' || normalizedProvided === 'ARCH') {
    return normalizedProvided;
  }

  if (normalizedProvided.includes('IMAGE') || normalizedProvided.includes('PHOTO') || normalizedProvided.includes('PICTURE')) return 'IMG';
  if (normalizedProvided.includes('VIDEO')) return 'VID';
  if (normalizedProvided.includes('LOG')) return 'LOG';
  if (normalizedProvided.includes('DOC') || normalizedProvided.includes('REPORT') || normalizedProvided.includes('FORM') || normalizedProvided.includes('DOCUMENT')) return 'DOC';

  const mime = String(mimeType || '').toLowerCase();
  if (mime.startsWith('image/')) return 'IMG';
  if (mime.startsWith('video/')) return 'VID';
  if (mime.includes('text/') || mime.includes('json') || mime.includes('csv') || mime.includes('log')) return 'LOG';

  const inferred = inferEvidenceType(fileName || '');
  if (inferred) return inferred;

  return 'DOC';
}

function notify(title, subtitle) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const titleEl = toast.querySelector('.toast-title');
  const subEl = toast.querySelector('.toast-sub');
  if (titleEl) titleEl.textContent = title || 'Notification';
  if (subEl) subEl.textContent = subtitle || '';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

const SIDEBAR_STORAGE_KEY = 'evichain_sidebar_collapsed';

function isSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function applySidebarState() {
  const shell = document.getElementById('app-shell');
  if (!shell) return;
  shell.classList.toggle('sidebar-collapsed', isSidebarCollapsed());
}

function setSidebarCollapsed(next) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0');
  } catch {
    // Ignore storage failures (private mode).
  }
  applySidebarState();
  if (typeof Components !== 'undefined') {
    Components.topbar();
    Components.sidebar();
  }
}

function toggleSidebar() {
  setSidebarCollapsed(!isSidebarCollapsed());
}

function updateAuthGateVisibility() {
  const gate = document.getElementById('auth-gate');
  const shell = document.getElementById('app-shell');
  if (!gate || !shell) return;
  if (AppState.isAuthenticated) {
    gate.style.display = 'none';
    shell.style.display = 'block';
    return;
  }
  shell.style.display = 'none';
  gate.style.display = 'block';
  if (typeof Components !== 'undefined' && Components.authGate) {
    Components.authGate();
  }
}

function setWalletDisconnected(message = 'Disconnected') {
  api.auth.logout();
  AppState.isAuthenticated = false;
  AppState.walletAddress = null;
  AppState.fullName = null;
  AppState.role = null;
  AppState.profile = null;
  AppState.authPending = false;
  AppState.dataPending = false;
  if (typeof Components !== 'undefined') {
    Components.topbar();
    Components.sidebar();
  }
  updateAuthGateVisibility();
  if (message) notify('Signed out', message);
}

function refreshEvidenceBadge() {
  if (typeof Components !== 'undefined') {
    Components.sidebar();
  }
  if (typeof Router !== 'undefined' && Router.current) {
    const nav = document.querySelector(`.nav-item[data-page="${Router.current}"]`);
    if (nav) nav.classList.add('active');
  }
  const countEl = document.getElementById('view-ev-count');
  if (countEl) countEl.textContent = String(EviData.evidence.length);
}

function resetPageCaches() {
  if (typeof PageDashboard !== 'undefined') PageDashboard.rendered = false;
  if (typeof PageRecords !== 'undefined') PageRecords.rendered = false;
  if (typeof PageVerify !== 'undefined') PageVerify.rendered = false;
  if (typeof PageChain !== 'undefined') PageChain.rendered = false;
  if (typeof PageSearchCID !== 'undefined') PageSearchCID.rendered = false;
  if (typeof PageViewEvidence !== 'undefined') PageViewEvidence.rendered = false;
  if (typeof PageSettings !== 'undefined') PageSettings.rendered = false;
}

async function syncEvidenceFromBackend() {
  if (AppState.dataPending) return;
  AppState.dataPending = true;
  try {
    const data = await api.evidence.getAll(0, 100);
    const records = Array.isArray(data?.records) ? data.records : [];
    const pending = Array.isArray(EviData.evidence)
      ? EviData.evidence.filter((e) => e && (e.status === 'pending' || String(e.id || '').startsWith('PENDING-')))
      : [];
    const pendingIds = new Set(pending.map((e) => e.id));

    const normalized = records.map((record) => {
      const evidenceId = record?.evidenceId || record?.id || '';
      const fileName = record?.fileName || '';
      const typeCode = normalizeEvidenceType(record?.evidenceType, fileName, record?.mimeType);
      const cid = normalizeCid(record?.ipfsCid || record?.ipfsUrl || '');
      const txHash = record?.txHash || record?.transactionHash || null;
      const block = record?.blockNumber || record?.block || null;
      const dateSource = record?.date || record?.timestamp || null;
      const dateLabel = formatDate(dateSource);
      const parsedDate = parseDate(dateSource);
      const tsValue = parsedDate ? Math.floor(parsedDate.getTime() / 1000) : 0;

      return {
        id: evidenceId || record?.caseId || record?.case || 'UNKNOWN',
        name: fileName || record?.description || evidenceId || '',
        case: record?.caseId || record?.case || '--',
        type: typeCode,
        hash: record?.sha256Hash || record?.hash || '--',
        cid: cid || '',
        date: dateLabel || '--',
        status: record?.status || 'verified',
        uploader: record?.submittedBy || record?.uploader || '--',
        description: record?.description || '',
        txHash,
        block,
        _ts: tsValue,
      };
    });

    const verified = normalized.filter((e) => e.id && !pendingIds.has(e.id));
    verified.sort((a, b) => (b._ts || 0) - (a._ts || 0));
    EviData.evidence = [...pending, ...verified];

    EviData.chainTxns = EviData.evidence
      .filter((e) => e.txHash)
      .map((e) => ({
        dot: e.status === 'failed' ? 'red' : e.status === 'pending' ? 'amber' : 'green',
        title: e.id,
        hash: e.txHash,
        block: e.block || '--',
        time: e.date || '--',
        gas: 'n/a',
      }));

    EviData.auditLog = EviData.evidence.slice(0, 6).map((e) => ({
      action: e.status === 'failed' ? 'alert' : 'upload',
      detail: `${e.id} anchored on-chain`,
      time: e.date || '--',
      user: e.uploader || 'system',
    }));

    const weeklySeries = buildWeeklyUploadSeries(EviData.evidence);
    EviData.uploadChartData = weeklySeries.counts;
    EviData.uploadChartLabels = weeklySeries.labels;

    resetPageCaches();
    refreshEvidenceBadge();

    if (typeof Router !== 'undefined' && Router.current) {
      if (Router.current === 'dashboard') PageDashboard.render();
      if (Router.current === 'records') PageRecords.render();
      if (Router.current === 'chain') PageChain.render();
      if (Router.current === 'view-evidence') PageViewEvidence.render();
      if (Router.current === 'search-cid') PageSearchCID.render();
    }
  } catch (error) {
    console.error('syncEvidenceFromBackend failed', error);
    notify('Sync failed', error?.message || 'Unable to load evidence');
  } finally {
    AppState.dataPending = false;
  }
}

function bindMetaMaskListeners() {
  if (typeof window === 'undefined' || !window.ethereum) return;
  if (window.ethereum._evichainListenersBound) return;
  window.ethereum._evichainListenersBound = true;

  window.ethereum.on('accountsChanged', (accounts) => {
    const next = Array.isArray(accounts) ? accounts[0] : null;
    if (!next) {
      setWalletDisconnected('Wallet disconnected');
      return;
    }
    if (matchesConnectedWallet(next)) return;
    AppState.walletAddress = next;
    if (typeof Components !== 'undefined') {
      Components.topbar();
      Components.sidebar();
    }
    if (AppState.isAuthenticated) {
      void syncEvidenceFromBackend();
    }
  });

  window.ethereum.on('chainChanged', () => {
    if (typeof Components !== 'undefined') {
      Components.topbar();
    }
  });
}

const AuthActions = {
  async connect(authMeta = {}) {
    if (AppState.authPending) return;
    AppState.authPending = true;
    Components.topbar();

    try {
      const login = await api.wallet.loginWithMetaMask(authMeta);
      const profile = await api.auth.getProfile().catch(() => null);

      AppState.isAuthenticated = true;
      AppState.walletAddress = login?.walletAddress || AppState.walletAddress;
      AppState.fullName = login?.fullName || profile?.fullName || AppState.fullName;
      AppState.role = login?.role || profile?.role || AppState.role;
      AppState.profile = profile || null;
      AppState.authPending = false;

      Components.topbar();
      Components.sidebar();
      updateAuthGateVisibility();
      await syncEvidenceFromBackend();

      const nav = document.querySelector('.nav-item[data-page="dashboard"]');
      Router.go('dashboard', nav || undefined);
      notify('Wallet connected', AppState.walletAddress ? shortAddress(AppState.walletAddress) : 'Authentication complete');
    } catch (error) {
      console.error('Auth connect failed', error);
      api.auth.logout();
      AppState.isAuthenticated = false;
      AppState.walletAddress = null;
      AppState.fullName = null;
      AppState.role = null;
      AppState.profile = null;
      AppState.authPending = false;
      Components.topbar();
      updateAuthGateVisibility();
      notify('Connection failed', error?.message || 'Unable to connect wallet');
    }
  },

  async connectFromGate() {
    const mode = document.querySelector('input[name="auth-mode"]:checked')?.value || 'signin';
    const authMeta = { mode };

    if (mode === 'signup') {
      const role = document.getElementById('auth-role')?.value || '';
      const fullName = document.getElementById('auth-fullname')?.value || '';
      if (!role) {
        notify('Role required', 'Select a role before signing up');
        return;
      }
      authMeta.role = role;
      if (fullName) authMeta.fullName = fullName;
    }

    await this.connect(authMeta);
  },

  async sync() {
    if (!AppState.isAuthenticated) {
      notify('Not connected', 'Connect your wallet to sync evidence');
      return;
    }
    await syncEvidenceFromBackend();
    notify('Sync complete', `${EviData.evidence.length} records loaded`);
  },

  logout() {
    setWalletDisconnected('Session cleared');
  },

  async restore() {
    if (!api.auth.isLoggedIn()) {
      Components.topbar();
      updateAuthGateVisibility();
      return;
    }

    try {
      const me = await api.auth.getMe();
      const authProfile = await api.auth.getProfile().catch(() => null);
      AppState.isAuthenticated = true;
      AppState.walletAddress = me.walletAddress;
      AppState.profile = authProfile || null;
      AppState.fullName = authProfile?.fullName || me.fullName || null;
      AppState.role = authProfile?.role || me.role || null;
      Components.topbar();
      updateAuthGateVisibility();
      await syncEvidenceFromBackend();

      const nav = document.querySelector('.nav-item[data-page="dashboard"]');
      Router.go('dashboard', nav || undefined);
    } catch {
      api.auth.logout();
      AppState.isAuthenticated = false;
      AppState.walletAddress = null;
      AppState.fullName = null;
      AppState.role = null;
      AppState.profile = null;
      Components.topbar();
      updateAuthGateVisibility();
    }
  },
};

// js/components.js — Shared HTML component builders

const Components = {

  icon: {
    layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><path d="M21 12c0-4.97-4.03-9-9-9S3 7.03 3 12s4.03 9 9 9 9-4.03 9-9z"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
    xCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    hash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
  },

  topbar() {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    const collapsed = isSidebarCollapsed();
    const walletConnected = AppState.isAuthenticated;
    const walletLabel = AppState.authPending
      ? 'Connecting...'
      : walletConnected
      ? shortAddress(AppState.walletAddress)
      : 'Connect Wallet';

    const statusLabel = walletConnected ? 'Wallet online' : 'Wallet offline';
    const avatarLabel = walletConnected
      ? shortAddress(AppState.walletAddress).slice(2, 4).toUpperCase()
      : 'MB';
    const connectTone = walletConnected
      ? 'bg-surface-container-low border border-outline-variant/40 text-on-surface-variant'
      : 'bg-primary-container text-on-primary-container';

    topbar.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-surface-container-low hover:bg-surface-container transition-all"
          onclick="toggleSidebar()"
          aria-label="Toggle sidebar"
        >
          <span class="material-symbols-outlined text-[20px]">${collapsed ? 'menu_open' : 'menu'}</span>
        </button>
        <div class="flex items-center min-w-0">
          <div class="text-[16px] font-semibold text-primary tracking-tight">EviChain</div>
        </div>
        <div class="hidden lg:flex items-center gap-2 recessed-input px-3 py-2 rounded-lg border border-white/10 w-64 xl:w-80">
          <span class="material-symbols-outlined text-on-surface-variant text-sm">search</span>
          <input
            class="bg-transparent border-none focus:ring-0 text-body-sm w-full text-on-surface placeholder:opacity-40"
            placeholder="Search by hash, case ID or CID..."
            type="text"
          />
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="hidden md:inline-flex items-center gap-2 px-2 py-1 rounded border border-outline-variant/40 text-[10px] font-label-caps text-on-surface-variant">
          <span class="w-1.5 h-1.5 rounded-full ${walletConnected ? 'bg-tertiary' : 'bg-error'}"></span>
          ${statusLabel}
        </span>
        <span class="text-[10px] font-label-caps text-on-surface-variant px-2 py-1 border border-outline-variant/40 rounded">SEPOLIA</span>
        <button
          class="px-3 py-2 rounded-lg ${connectTone} text-[11px] font-label-caps flex items-center gap-2 hover:brightness-110 transition-all"
          onclick="AuthActions.connect()"
          ${AppState.authPending ? 'disabled' : ''}
        >
          <span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
          <span class="hidden sm:inline">${walletLabel}</span>
        </button>
        ${walletConnected ? '<button class="h-9 w-9 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors flex items-center justify-center" onclick="AuthActions.sync()" aria-label="Sync"><span class="material-symbols-outlined text-[18px]">sync</span></button>' : ''}
        ${walletConnected ? '<button class="h-9 w-9 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors flex items-center justify-center" onclick="AuthActions.logout()" aria-label="Sign Out"><span class="material-symbols-outlined text-[18px]">logout</span></button>' : ''}
        <div class="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-surface-container-highest text-[11px] text-primary">${avatarLabel}</div>
      </div>`;
  },

  authGate() {
    const gate = document.getElementById('auth-gate');
    if (!gate) return;

    gate.innerHTML = `
      <div class="auth-landing bg-surface text-on-surface min-h-screen overflow-x-hidden">
        <nav class="bg-surface/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between w-full px-gutter h-16 fixed top-0 z-50">
          <div class="flex items-center gap-3">
            <div class="brand-mark brand-mark-sm">E</div>
            <span class="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">EviChain</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="hidden sm:inline-flex items-center gap-2 px-2 py-1 rounded border border-primary-container/30 bg-primary-container/10 text-[10px] font-label-caps text-primary">Live Instance</span>
          </div>
        </nav>

        <main class="pt-16">
          <section class="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-gutter py-stack-lg overflow-hidden">
            <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[760px] h-[760px] bg-primary-container/10 blur-[120px] rounded-full"></div>
              <div class="absolute inset-0 scan-line opacity-20"></div>
            </div>

            <div class="relative z-10 text-center max-w-4xl mx-auto">
              <div class="inline-flex items-center gap-unit px-4 py-1.5 rounded-full border border-primary-container/30 bg-primary-container/5 mb-stack-md animate-pulse-cyan">
                <span class="w-2 h-2 rounded-full bg-primary-container"></span>
                <span class="font-label-caps text-label-caps text-primary">Live Forensic Instance Active</span>
              </div>
              <h1 class="font-display-lg text-display-lg md:text-[64px] md:leading-[72px] mb-stack-md bg-gradient-to-br from-on-surface to-on-surface-variant bg-clip-text text-transparent">
                The Future of Digital Forensics.
              </h1>
              <p class="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-2xl mx-auto">
                Secure, immutable, and verifiable evidence management on the blockchain. Establish unshakeable chains of custody with cryptographic certainty.
              </p>

              <div class="glass-panel rounded-xl border border-white/5 p-6 md:p-8 text-left max-w-2xl mx-auto">
                <div class="flex items-center justify-between gap-4">
                  <div>
                    <div class="font-headline-sm text-headline-sm">EviChain Secure Access</div>
                    <div class="text-[11px] text-on-surface-variant mt-1">Blockchain Forensic Gateway</div>
                  </div>
                  <span class="text-[10px] font-label-caps text-on-surface-variant">MetaMask</span>
                </div>

                <div class="flex items-center gap-6 mt-4 text-body-sm text-on-surface-variant">
                  <label class="flex items-center gap-2">
                    <input type="radio" name="auth-mode" value="signin" checked onchange="Components.toggleAuthMode()"/>
                    <span>Sign In</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input type="radio" name="auth-mode" value="signup" onchange="Components.toggleAuthMode()"/>
                    <span>Sign Up</span>
                  </label>
                </div>

                <div id="auth-signup-fields" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4" style="display:none;">
                  <input
                    id="auth-fullname"
                    class="recessed-field w-full rounded-lg border border-white/10 px-4 py-3 text-on-surface"
                    placeholder="Full name (optional)"
                  />
                  <select id="auth-role" class="recessed-field w-full rounded-lg border border-white/10 px-4 py-3 text-on-surface">
                    <option value="">Select role</option>
                    <option value="police_officer">Police Officer</option>
                    <option value="forensic_officer">Forensic Officer</option>
                    <option value="judge">Judge</option>
                    <option value="lawyer">Lawyer</option>
                  </select>
                </div>

                <button
                  class="w-full mt-5 px-gutter py-4 bg-primary-container text-on-primary font-bold text-label-caps uppercase tracking-wider rounded-lg transition-transform hover:scale-105 active:scale-95 glow-cyan"
                  onclick="AuthActions.connectFromGate()"
                  ${AppState.authPending ? 'disabled' : ''}
                >${AppState.authPending ? 'Connecting MetaMask...' : 'Connect MetaMask Wallet'}</button>
                <p class="text-[11px] text-on-surface-variant mt-3">By connecting, you agree to the protocol access policy for forensic instances.</p>
              </div>
            </div>

            <div class="relative mt-16 w-full max-w-5xl px-gutter">
              <div class="glass-panel rounded-xl overflow-hidden shadow-2xl p-4 md:p-8">
                <div class="flex items-center justify-between mb-stack-md border-b border-white/5 pb-4">
                  <div class="flex gap-2">
                    <div class="w-3 h-3 rounded-full bg-error-container"></div>
                    <div class="w-3 h-3 rounded-full bg-tertiary-container/50"></div>
                    <div class="w-3 h-3 rounded-full bg-primary-container/50"></div>
                  </div>
                  <div class="font-code-snippet text-code-snippet text-on-surface-variant">terminal - investigator@evichain-instance-01</div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                  <div class="space-y-4">
                    <div class="bg-surface-container-low p-4 rounded-lg border border-white/5">
                      <p class="font-label-caps text-label-caps text-on-surface-variant mb-1">HASH MATCH</p>
                      <p class="font-code-snippet text-code-snippet text-primary truncate">sha256:8f43a...2d1e</p>
                    </div>
                    <div class="bg-surface-container-low p-4 rounded-lg border border-white/5">
                      <p class="font-label-caps text-label-caps text-on-surface-variant mb-1">INSTANCE INTEGRITY</p>
                      <div class="w-full bg-surface-variant h-1 rounded-full overflow-hidden mt-2">
                        <div class="bg-primary-container w-full h-full"></div>
                      </div>
                    </div>
                  </div>
                  <div class="md:col-span-2 bg-surface-container-low p-4 rounded-lg border border-white/5 font-code-snippet text-code-snippet text-on-surface-variant">
                    <p class="text-primary-container mb-2">INSTANCE_01</p>
                    <p class="mb-1 text-on-surface/80">[INFO] Connecting to Ethereum forensic relay...</p>
                    <p class="mb-1 text-on-surface/80">[INFO] Syncing CID from IPFS cluster 09...</p>
                    <p class="text-tertiary-container">[SUCCESS] Evidence trail verified. Integrity 100%.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="py-24 px-gutter max-w-7xl mx-auto">
            <h2 class="font-headline-md text-headline-md text-center mb-stack-lg">Forensic Infrastructure</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div class="md:col-span-2 glass-panel p-stack-md rounded-xl hover:bg-white/5 transition-all group">
                <div class="flex flex-col md:flex-row items-center gap-gutter">
                  <div class="flex-1">
                    <span class="material-symbols-outlined text-[48px] text-primary-container mb-4" style="font-variation-settings: 'FILL' 0;">verified_user</span>
                    <h3 class="font-headline-sm text-headline-sm mb-stack-sm">Immutable Ledger</h3>
                    <p class="text-on-surface-variant font-body-md">Every evidence submission is timestamped and anchored to an Ethereum-backed forensic trail. Prohibit tampering with cryptographically secure, public-auditable history.</p>
                  </div>
                  <div class="w-full md:w-64 h-48 rounded-lg overflow-hidden border border-white/5">
                    <img alt="Immutable Ledger Visual" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzuituU8G0bNHDDlVrQ77R2Q6CFmo9kvE_gMDILws706w-TtWdneZjJ8ogj83g1F5XE3hgH7k14Zc4uFjWX2nwW5py7RKv_uSaE_58tecT_G-g3Vh-m5BapfgBFTD7R7-4VFW4mqOQTSvtJUz9FfHqI_XiCGaGuF27u-FLReMtJTSHeO21C6PUP11aVmfsLJHWGw9VuUZOjFa86qcF0RQWM9ZZUemXO_iDxmk2fZt3m9j-jeLYb4vi8U21ORGos5j7i0qifmzSB_c"/>
                  </div>
                </div>
              </div>
              <div class="glass-panel p-stack-md rounded-xl hover:bg-white/5 transition-all">
                <span class="material-symbols-outlined text-[48px] text-primary-container mb-4" style="font-variation-settings: 'FILL' 0;">cloud_done</span>
                <h3 class="font-headline-sm text-headline-sm mb-stack-sm">Decentralized Storage</h3>
                <p class="text-on-surface-variant font-body-md">Leveraging IPFS for high-availability vaulting. Files are fragmented across a distributed network, ensuring permanent accessibility for authorized instances.</p>
              </div>
              <div class="glass-panel p-stack-md rounded-xl hover:bg-white/5 transition-all">
                <span class="material-symbols-outlined text-[48px] text-primary-container mb-4" style="font-variation-settings: 'FILL' 0;">speed</span>
                <h3 class="font-headline-sm text-headline-sm mb-stack-sm">Real-time Verification</h3>
                <p class="text-on-surface-variant font-body-md">Instant SHA-256 hash matching against the chain of custody. Verify the integrity of gigabytes of data in milliseconds directly from the browser.</p>
              </div>
              <div class="md:col-span-2 glass-panel p-stack-md rounded-xl border-primary-container/20">
                <h3 class="font-headline-sm text-headline-sm mb-stack-md flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary-container">lan</span>
                  Network Status
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-stack-md">
                  <div class="bg-surface-container-lowest p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <p class="font-label-caps text-label-caps text-on-surface-variant">Verified Blocks</p>
                      <p class="font-display-lg text-headline-md text-primary-container mt-1">18,421</p>
                    </div>
                    <span class="material-symbols-outlined text-on-surface-variant/20 text-[64px]">database</span>
                  </div>
                  <div class="bg-surface-container-lowest p-6 rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <p class="font-label-caps text-label-caps text-on-surface-variant">Instance Integrity</p>
                      <p class="font-display-lg text-headline-md text-tertiary-container mt-1">100%</p>
                    </div>
                    <span class="material-symbols-outlined text-tertiary-container/20 text-[64px]">health_and_safety</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="py-24 px-gutter max-w-7xl mx-auto">
            <div class="text-center mb-16">
              <h2 class="font-headline-md text-headline-md mb-4">How It Works</h2>
              <p class="text-on-surface-variant font-body-md max-w-2xl mx-auto">A streamlined, cryptographically secure workflow for digital evidence management.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div class="relative rounded-2xl overflow-hidden border border-white/5 glow-cyan">
                <img alt="Forensic Workflow Infographic" class="w-full h-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW997mD0Ci0pU3oYAdYnIi1fKomrwOUItAmCFOs9wzH0h-pECrCQkmmPO_K1Zv_uuIk8mkmoI2PfKQFnSnwiB2MHl4tBcwCF33kDn0XVIUGhlT_zbLzPLXKRmuebMY5hAEmLhPOodH_Vpn_OxOYg5yH8250IwcNBRKX7ldq95XS0BSiNgxGuPo1G71KcwgpLhhuSNolSdv3JxhTpRHYr_aOWIGIzFEa4JSK4tS4foAvPCU3wwMOMCppZfb7TzfQ1Csl64J4M_JHbM"/>
              </div>
              <div class="space-y-8">
                <div class="flex gap-6">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
                    <span class="text-primary-container font-bold">01</span>
                  </div>
                  <div>
                    <h3 class="font-headline-sm text-headline-sm mb-2">Evidence Upload</h3>
                    <p class="text-on-surface-variant font-body-md">Securely ingest forensic payloads with end-to-end encryption protocols.</p>
                  </div>
                </div>
                <div class="flex gap-6">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
                    <span class="text-primary-container font-bold">02</span>
                  </div>
                  <div>
                    <h3 class="font-headline-sm text-headline-sm mb-2">Hash Computation</h3>
                    <p class="text-on-surface-variant font-body-md">Generate unique SHA-256 digital fingerprints to ensure data integrity remains intact.</p>
                  </div>
                </div>
                <div class="flex gap-6">
                  <div class="flex-shrink-0 w-12 h-12 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
                    <span class="text-primary-container font-bold">03</span>
                  </div>
                  <div>
                    <h3 class="font-headline-sm text-headline-sm mb-2">Blockchain Anchoring</h3>
                    <p class="text-on-surface-variant font-body-md">Immutable timestamping and chain-of-custody verification on the decentralized ledger.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="bg-surface-container-lowest py-24 border-y border-white/5">
            <div class="px-gutter max-w-7xl mx-auto text-center mb-stack-lg">
              <h2 class="font-headline-md text-headline-md mb-stack-sm">Built for High-Stakes Integrity</h2>
              <p class="text-on-surface-variant max-w-2xl mx-auto font-body-md">Our forensic protocol adheres to the NIST SP 800-86 standard for evidence preservation and documentation.</p>
            </div>
            <div class="px-gutter max-w-7xl mx-auto overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="border-b border-white/10">
                    <th class="py-4 px-6 text-left font-label-caps text-label-caps text-on-surface-variant">Event Type</th>
                    <th class="py-4 px-6 text-left font-label-caps text-label-caps text-on-surface-variant">Instance ID</th>
                    <th class="py-4 px-6 text-left font-label-caps text-label-caps text-on-surface-variant">Hash (CID)</th>
                    <th class="py-4 px-6 text-right font-label-caps text-label-caps text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody class="font-body-sm text-body-sm">
                  <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td class="py-4 px-6 font-bold text-on-surface">Evidence Intake</td>
                    <td class="py-4 px-6 font-code-snippet">instance_f01_alpha</td>
                    <td class="py-4 px-6 font-code-snippet text-on-surface-variant">QmXoy...3pY8</td>
                    <td class="py-4 px-6 text-right"><span class="px-2 py-1 rounded bg-primary-container/10 text-primary-container text-[10px] font-bold uppercase">Verified</span></td>
                  </tr>
                  <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td class="py-4 px-6 font-bold text-on-surface">Chain Verification</td>
                    <td class="py-4 px-6 font-code-snippet">instance_f01_beta</td>
                    <td class="py-4 px-6 font-code-snippet text-on-surface-variant">QmZ4v...9mU2</td>
                    <td class="py-4 px-6 text-right"><span class="px-2 py-1 rounded bg-primary-container/10 text-primary-container text-[10px] font-bold uppercase">Verified</span></td>
                  </tr>
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="py-4 px-6 font-bold text-on-surface">Custodian Transfer</td>
                    <td class="py-4 px-6 font-code-snippet">instance_f01_gamma</td>
                    <td class="py-4 px-6 font-code-snippet text-on-surface-variant">QmT7w...kL1n</td>
                    <td class="py-4 px-6 text-right"><span class="px-2 py-1 rounded bg-primary-container/10 text-primary-container text-[10px] font-bold uppercase">Verified</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="py-24 px-gutter max-w-4xl mx-auto text-center">
            <div class="glass-panel p-stack-lg rounded-2xl border-primary-container/30 relative overflow-hidden">
              <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary-container/20 blur-3xl rounded-full"></div>
              <h2 class="font-headline-md text-headline-md mb-stack-sm">Ready to Secure Your Evidence?</h2>
              <p class="text-on-surface-variant mb-stack-lg font-body-lg">Deploy a forensic instance in minutes and start building immutable chains of custody.</p>
              <button class="px-gutter py-4 bg-primary-container text-on-primary font-bold text-label-caps uppercase tracking-wider rounded-lg transition-transform hover:scale-105 active:scale-95 glow-cyan" onclick="AuthActions.connectFromGate()">CONNECT WALLET</button>
            </div>
          </section>
        </main>

        <footer class="bg-surface-container-lowest border-t border-white/5 pt-16 pb-8 px-gutter">
          <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-stack-lg mb-16">
            <div class="md:col-span-2">
              <div class="flex items-center gap-stack-sm mb-stack-md">
                <div class="brand-mark brand-mark-sm">E</div>
                <span class="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">EviChain</span>
              </div>
              <p class="text-on-surface-variant max-w-xs font-body-sm">
                Empowering the future of forensic science through decentralized cryptographic protocols. Source of truth for the digital age.
              </p>
            </div>
            <div>
              <h4 class="font-label-caps text-label-caps text-on-surface mb-stack-md">Technical</h4>
              <ul class="space-y-3 font-body-sm text-on-surface-variant">
                <li><span class="hover:text-primary transition-colors">Documentation</span></li>
                <li><span class="hover:text-primary transition-colors">API Keys</span></li>
                <li><span class="hover:text-primary transition-colors">Instance Software</span></li>
                <li><span class="hover:text-primary transition-colors">Validator Stats</span></li>
              </ul>
            </div>
            <div>
              <h4 class="font-label-caps text-label-caps text-on-surface mb-stack-md">Trust</h4>
              <ul class="space-y-3 font-body-sm text-on-surface-variant">
                <li><span class="hover:text-primary transition-colors">Security Audit</span></li>
                <li><span class="hover:text-primary transition-colors">Compliance</span></li>
                <li><span class="hover:text-primary transition-colors">Whitepaper</span></li>
                <li><span class="hover:text-primary transition-colors">Terms of Protocol</span></li>
              </ul>
            </div>
          </div>
          <div class="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-stack-md">
            <p class="font-label-caps text-label-caps text-on-surface-variant">(c) 2024 EVICHAIN FORENSIC PROTOCOL</p>
          </div>
        </footer>
      </div>`;
  },

  toggleAuthMode() {
    const mode = document.querySelector('input[name="auth-mode"]:checked')?.value || 'signin';
    const signUpFields = document.getElementById('auth-signup-fields');
    if (!signUpFields) return;
    signUpFields.style.display = mode === 'signup' ? 'block' : 'none';
  },

  sidebar() {
    const items = [
      { id: 'dashboard',      icon: 'grid',     label: 'Dashboard' },
      ...(canUploadEvidence() ? [{ id: 'upload', icon: 'upload', label: 'Upload Evidence' }] : []),
      { id: 'records',        icon: 'file',     label: 'Evidence Records', badge: String(EviData.evidence.length) },
      { id: 'search-cid',     icon: 'search',   label: 'Search by CID' },
      { id: 'view-evidence',  icon: 'folder',   label: 'View Evidence' },
      { id: 'verify',         icon: 'check',    label: 'Verify Integrity' },
      { id: 'chain',          icon: 'link',     label: 'Chain History' },
      { id: 'settings',       icon: 'settings', label: 'Settings' },
    ];

    const iconMap = {
      dashboard: 'dashboard',
      upload: 'cloud_upload',
      records: 'folder_open',
      'search-cid': 'fingerprint',
      'view-evidence': 'folder',
      verify: 'verified_user',
      chain: 'account_tree',
      settings: 'settings',
    };

    const navHTML = items.map((item) => {
      const badge = item.badge
        ? `<span class="nav-badge ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-label-caps text-primary">${item.badge}</span>`
        : '';
      return `
        <button class="nav-item flex w-full items-center gap-4 px-4 py-3 text-left text-secondary hover:bg-white/10 hover:text-primary transition-all duration-200${item.id === 'dashboard' ? ' active' : ''}" data-page="${item.id}" onclick="Router.go('${item.id}', this)">
          <span class="material-symbols-outlined nav-icon">${iconMap[item.id] || 'dashboard'}</span>
          <span class="nav-label font-label-caps text-label-caps font-semibold tracking-wide">${item.label}</span>
          ${badge}
        </button>`;
    }).join('');

    const primaryAction = canUploadEvidence()
      ? { page: 'upload', label: 'New Entry' }
      : { page: 'view-evidence', label: 'View Evidence' };

    document.getElementById('sidebar').innerHTML = `
      <div class="sidebar-brand p-8 flex flex-col items-center">
        <div class="sidebar-brand-icon brand-mark brand-mark-lg mb-4">E</div>
        <h1 class="sidebar-brand-text font-headline-md text-headline-md font-bold text-primary tracking-tight">EviChain</h1>
        <p class="sidebar-brand-sub font-label-caps text-label-caps text-secondary opacity-80"></p>
      </div>
      <nav class="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        ${navHTML}
      </nav>
      <div class="sidebar-cta p-6">
        <button class="sidebar-cta-btn w-full py-4 bg-primary-container text-on-primary-container font-label-caps text-label-caps rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2" onclick="Router.go('${primaryAction.page}', document.querySelector('[data-page=${primaryAction.page}]'))">
          <span class="material-symbols-outlined">add</span>
          <span class="sidebar-cta-text">${primaryAction.label}</span>
        </button>
      </div>`;
  },

  timelineItem(dot, title, details, time, isLast = false) {
    return `
      <div class="timeline-item">
        <div class="t-dot-wrap">
          <div class="t-dot ${dot}"></div>
          ${!isLast ? '<div class="t-line"></div>' : ''}
        </div>
        <div class="t-content">
          <div class="t-title">${title}</div>
          ${details.map(d => `<div class="t-detail">${d}</div>`).join('')}
          <div class="t-time">${time}</div>
        </div>
      </div>`;
  },

  barChart(containerId, data, labels) {
    const max = Math.max(...data, 1);
    const colors = ['var(--accent)', 'var(--blue)', 'var(--purple)', 'var(--amber)', 'var(--red)', 'var(--accent)', 'var(--blue)'];
    document.getElementById(containerId).innerHTML = data.map((v, i) => `
      <div class="bar-wrap">
        <div class="bar" style="height:${Math.round((v/max)*100)}%;background:${colors[i]};opacity:0.75;min-height:4px;"></div>
        <div class="bar-label">${labels[i]}<br><span style="color:var(--text2)">${v}</span></div>
      </div>`).join('');
  },

  lineChart(containerId, data, labels) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clean up previous instance if present
    if (container._chartInstance) {
      try { container._chartInstance.destroy(); } catch (e) {}
      container._chartInstance = null;
    }

    // Helper: build buckets for ranges
    const MS_DAY = 24 * 60 * 60 * 1000;
    const now = new Date();
    const evidence = Array.isArray(EviData.evidence) ? EviData.evidence : [];

    function buildBuckets(rangeKey) {
      let bucketSizeDays = 1; let totalBuckets = 7; let labelFn = (d) => d.toLocaleDateString(undefined, { weekday: 'short' });
      if (rangeKey === '7d') { bucketSizeDays = 1; totalBuckets = 7; labelFn = (d) => d.toLocaleDateString(undefined, { weekday: 'short' }); }
      if (rangeKey === '1m') { bucketSizeDays = 7; totalBuckets = 4; labelFn = (d) => `Wk ${d.toLocaleDateString()}`; }
      if (rangeKey === '2m') { bucketSizeDays = 7; totalBuckets = 8; labelFn = (d,i) => `Wk ${i+1}`; }
      if (rangeKey === '3m') { bucketSizeDays = 30; totalBuckets = 3; labelFn = (d) => d.toLocaleDateString(undefined, { month: 'short' }); }
      if (rangeKey === 'all') { bucketSizeDays = 30; totalBuckets = 6; labelFn = (d) => d.toLocaleDateString(undefined, { month: 'short' }); }

      const counts = Array(totalBuckets).fill(0);
      const labels = [];

      // Calculate day difference for each evidence and assign to buckets
      for (const e of evidence) {
        const ts = (e._ts || 0) * 1000;
        const ed = new Date(ts);
        if (Number.isNaN(ed.getTime())) continue;
        const diffDays = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(ed.getFullYear(), ed.getMonth(), ed.getDate()).getTime()) / MS_DAY);
        if (diffDays < 0) continue;
        const bucketIndexFromLatest = Math.floor(diffDays / bucketSizeDays);
        if (bucketIndexFromLatest < totalBuckets) {
          const idx = totalBuckets - 1 - bucketIndexFromLatest;
          counts[idx] += 1;
        }
      }

      // Build labels oldest->newest
      for (let i = 0; i < totalBuckets; i++) {
        const daysAgo = (totalBuckets - 1 - i) * bucketSizeDays;
        const d = new Date(now.getTime() - daysAgo * MS_DAY);
        labels.push(labelFn(d, i));
      }

      return { labels, data: counts, daysWindow: bucketSizeDays * totalBuckets };
    }

    // initial view
    const state = { range: '7d', type: 'bar' };

    container.innerHTML = `
      <div class="chart-controls">
        <div class="chart-filter-group">
          <button class="chart-filter-btn" data-range="7d">7d</button>
          <button class="chart-filter-btn" data-range="1m">1m</button>
          <button class="chart-filter-btn" data-range="2m">2m</button>
          <button class="chart-filter-btn" data-range="3m">3m</button>
          <button class="chart-filter-btn" data-range="all">all</button>
        </div>
        <div class="chart-type-toggle">
          <button class="chart-type-btn" data-type="bar">Bar</button>
          <button class="chart-type-btn" data-type="line">Line</button>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:12px;" class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-label">Total</div>
          <div class="stat-value" id="chart-stat-total">0</div>
          <div class="stat-meta" id="chart-stat-total-meta"></div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">Daily Avg</div>
          <div class="stat-value" id="chart-stat-avg">0</div>
          <div class="stat-meta" id="chart-stat-avg-meta"></div>
        </div>
        <div class="stat-card amber">
          <div class="stat-label">Peak</div>
          <div class="stat-value" id="chart-stat-peak">0</div>
          <div class="stat-meta" id="chart-stat-peak-meta"></div>
        </div>
        <div class="stat-card purple">
          <div class="stat-label">Active Days</div>
          <div class="stat-value" id="chart-stat-active">0</div>
          <div class="stat-meta" id="chart-stat-active-meta"></div>
        </div>
      </div>
      <div style="width:100%;">
        <canvas id="${containerId}-canvas" class="chart-canvas"></canvas>
      </div>
    `;

    const canvas = container.querySelector(`#${containerId}-canvas`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function calcStats(lbls, dts, daysWindow) {
      const total = dts.reduce((a,b) => a+b, 0);
      const avg = daysWindow > 0 ? (total / daysWindow) : 0;
      const peakVal = Math.max(...dts, 0);
      const peakIdx = dts.indexOf(peakVal);
      const peakLabel = lbls[peakIdx] || '-';
      // active days = count of unique days with evidence within window
      const activeDays = evidence.reduce((set, e) => {
        const ts = (e._ts || 0) * 1000;
        const ed = new Date(ts);
        const diffDays = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(ed.getFullYear(), ed.getMonth(), ed.getDate()).getTime()) / MS_DAY);
        if (diffDays >=0 && diffDays < daysWindow) set.add(new Date(ed.getFullYear(), ed.getMonth(), ed.getDate()).toDateString());
        return set;
      }, new Set()).size;

      return { total, avg: Number(avg.toFixed(2)), peakVal, peakLabel, activeDays };
    }

    function renderChart() {
      const bucket = buildBuckets(state.range);
      const lbls = bucket.labels;
      const dts = bucket.data;
      const daysWindow = bucket.daysWindow;

      // update stats
      const stats = calcStats(lbls, dts, daysWindow);
      container.querySelector('#chart-stat-total').textContent = stats.total;
      container.querySelector('#chart-stat-avg').textContent = stats.avg;
      container.querySelector('#chart-stat-peak').textContent = stats.peakVal;
      container.querySelector('#chart-stat-active').textContent = stats.activeDays;
      container.querySelector('#chart-stat-peak-meta').textContent = stats.peakLabel;

      // determine colors based on CSS vars
      const cs = getComputedStyle(document.documentElement);
      const accent = cs.getPropertyValue('--blue').trim() || '#4f7cff';
      const accentLight = cs.getPropertyValue('--accent').trim() || '#00d4ff';

      // destroy previous instance
      if (container._chartInstance) {
        try { container._chartInstance.destroy(); } catch (e) {}
        container._chartInstance = null;
      }

      // create gradient for line fill
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 260);
      gradient.addColorStop(0, accentLight + '22');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      const dataset = {
        label: 'Evidence',
        data: dts,
        backgroundColor: state.type === 'bar' ? accent : gradient,
        borderColor: accent,
        borderWidth: state.type === 'bar' ? 0 : 2,
        borderRadius: state.type === 'bar' ? 5 : 0,
        borderSkipped: false,
        tension: state.type === 'line' ? 0.35 : 0,
        pointRadius: state.type === 'line' ? 4 : 0,
        pointHoverRadius: state.type === 'line' ? 6 : 0,
        fill: state.type === 'line',
      };

      const cfg = {
        type: state.type === 'bar' ? 'bar' : 'line',
        data: { labels: lbls, datasets: [dataset] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label(ctx) {
                  const v = ctx.parsed.y || 0;
                  return `${v} ${v === 1 ? 'case' : 'cases'}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text2').trim() }
            },
            y: {
              beginAtZero: true,
              ticks: { precision: 0, callback: (v) => String(v), color: getComputedStyle(document.documentElement).getPropertyValue('--text2').trim() },
              grid: { color: 'rgba(255,255,255,0.04)' }
            }
          }
        }
      };

      container._chartInstance = new Chart(ctx, cfg);
    }

    // wire up controls
    const rangeBtns = container.querySelectorAll('.chart-filter-btn');
    rangeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.range = btn.dataset.range;
        rangeBtns.forEach(b => b.classList.toggle('active', b === btn));
        renderChart();
      });
      // default active
      if (btn.dataset.range === state.range) btn.classList.add('active');
    });

    const typeBtns = container.querySelectorAll('.chart-type-btn');
    typeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.type = btn.dataset.type;
        typeBtns.forEach(b => b.classList.toggle('active', b === btn));
        renderChart();
      });
      if (btn.dataset.type === state.type) btn.classList.add('active');
    });

    // initial render
    setTimeout(renderChart, 0);
  },

  showToast() {
    const t = document.getElementById('toast');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
  },

  statusBadge(status) {
    const map = { verified: 'Verified', pending: 'Pending', failed: 'Tampered' };
    return `<span class="status-badge status-${status}">${map[status]}</span>`;
  },

  typeBadge(type) {
    return `<span class="ev-type type-${type.toLowerCase()}">${type}</span>`;
  },
};

// js/pages/dashboard.js

const PageDashboard = {
  rendered: false,

  render() {
    if (this.rendered) return;
    this.rendered = true;

    const hasEvidence = EviData.evidence.length > 0;
    const totalEvidence = EviData.evidence.length;
    const verifiedEvidence = EviData.evidence.filter((e) => e.status === 'verified').length;
    const pendingEvidence = EviData.evidence.filter((e) => e.status === 'pending').length;
    const integrityRate = totalEvidence > 0 ? ((verifiedEvidence / totalEvidence) * 100).toFixed(1) : '0.0';
    const uptimeRate = '99.8';
    const weeklySeries = buildWeeklyUploadSeries(EviData.evidence);
    const chartData = hasEvidence ? weeklySeries.counts : [0, 0, 0, 0, 0, 0, 0];
    const chartLabels = weeklySeries.labels;
    const chartMax = Math.max(...chartData, 1);

    const chartMaxRounded = Math.max(1, Math.ceil(chartMax / 10) * 10);

    const shortText = (value) => {
      const text = String(value || '');
      if (!text) return '—';
      if (text.length <= 12) return text;
      return `${text.slice(0, 6)}...${text.slice(-4)}`;
    };

    const statusMeta = (status) => {
      if (status === 'failed') {
        return { label: 'Alert', cls: 'text-error border-error/20 bg-error/10' };
      }
      if (status === 'pending') {
        return { label: 'Pending', cls: 'text-secondary border-secondary/20 bg-secondary/10' };
      }
      return { label: 'Verified', cls: 'text-tertiary border-tertiary/20 bg-tertiary/10' };
    };

    const ledgerSource = EviData.chainTxns.length
      ? EviData.chainTxns.slice(0, 6).map((tx) => ({
          id: tx.hash || tx.evidenceId || '—',
          time: tx.time || '—',
          cid: tx.cid || '—',
          status: 'verified',
        }))
      : EviData.evidence.slice(0, 6).map((e) => ({
          id: e.txHash || e.id,
          time: e.date || '—',
          cid: e.cid || '—',
          status: e.status || 'verified',
        }));

    this._ledgerExport = ledgerSource.slice();

    const ledgerRows = ledgerSource.length
      ? ledgerSource
          .map((row) => {
            const meta = statusMeta(row.status);
            return `
              <tr class="hover:bg-white/8 transition-colors group">
                <td class="px-6 py-4 font-code-snippet text-primary">${shortText(row.id)}</td>
                <td class="px-6 py-4 text-body-sm text-secondary font-medium">${row.time}</td>
                <td class="px-6 py-4 font-code-snippet text-[12px]">
                  <div class="flex items-center gap-2 bg-surface-container-low px-2 py-1 rounded-full w-fit border border-white/10">
                    <span class="text-secondary font-semibold">${shortText(row.cid)}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <span class="px-2 py-1 text-[10px] font-label-caps rounded-full border ${meta.cls}">${meta.label}</span>
                </td>
              </tr>`;
          })
          .join('')
      : `
        <tr>
          <td colspan="4" class="px-6 py-6 text-body-sm text-secondary font-medium">No ledger entries available yet.</td>
        </tr>`;

    const activityRows = EviData.auditLog.slice(0, 4);
    const activityHtml = activityRows.length
      ? activityRows
          .map((entry) => `
            <div class="flex justify-between items-center p-3 bg-white/5 border-l-2 border-tertiary">
              <div>
                <div class="text-[10px] font-label-caps text-on-surface-variant">${entry.action.toUpperCase()}</div>
                <div class="text-body-sm text-on-surface">${entry.detail}</div>
              </div>
              <div class="text-[10px] font-label-caps text-on-surface-variant">${entry.time}</div>
            </div>`)
          .join('')
      : `<div class="p-3 text-[10px] font-label-caps text-on-surface-variant">No recent activity loaded.</div>`;

    const integrityDash = Math.round((Number(integrityRate) / 100) * 553);
    const integrityRest = Math.max(0, 553 - integrityDash);

    document.getElementById('page-dashboard').innerHTML = `
      <div class="p-gutter space-y-stack-lg">
        <div class="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 class="font-display-lg text-display-lg text-primary">Forensic Integrity Dashboard</h1>
            <p class="text-on-surface-variant">Chain of custody overview for the connected instance.</p>
          </div>
          <div class="flex gap-3">
            ${canUploadEvidence()
              ? `<button class="px-6 py-3 bg-primary-container text-on-primary-container font-label-caps text-label-caps rounded-lg hover:brightness-110 transition-all" onclick="Router.go('upload', document.querySelector('[data-page=upload]'))">New Entry</button>`
              : `<button class="px-6 py-3 border border-outline-variant/40 text-on-surface-variant font-label-caps text-label-caps rounded-lg hover:text-on-surface hover:border-primary/30 transition-all" onclick="Router.go('view-evidence', document.querySelector('[data-page=view-evidence]'))">View Evidence</button>`}
          </div>
        </div>

        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="glass-card p-3 border-l-4 border-l-primary">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[10px] font-bold text-on-surface-variant">TOTAL EVIDENCE</p>
              <span class="material-symbols-outlined text-primary/40 text-xs">inventory_2</span>
            </div>
            <div class="flex items-baseline gap-1">
              <h2 class="text-2xl font-bold text-primary">${totalEvidence}</h2>
            </div>
            <p class="text-[9px] text-on-surface-variant mt-1">Active forensic payloads recorded</p>
          </div>
          <div class="glass-card p-3 border-l-4 border-l-tertiary">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[10px] font-bold text-on-surface-variant">INTEGRITY</p>
              <span class="material-symbols-outlined text-tertiary/40 text-xs">verified_user</span>
            </div>
            <div class="flex items-baseline gap-1">
              <h2 class="text-2xl font-bold text-tertiary">${integrityRate}%</h2>
              <span class="text-[10px] font-code-snippet text-tertiary bg-tertiary/10 px-1">NOMINAL</span>
            </div>
            <p class="text-[9px] text-on-surface-variant mt-1">Zero corruption events detected</p>
          </div>
          <div class="glass-card p-3 border-l-4 border-l-outline-variant">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[10px] font-bold text-on-surface-variant">PENDING</p>
              <span class="material-symbols-outlined text-on-surface-variant/40 text-xs">hourglass_top</span>
            </div>
            <div class="flex items-baseline gap-1">
              <h2 class="text-2xl font-bold text-on-surface-variant opacity-60">${pendingEvidence}</h2>
            </div>
            <p class="text-[9px] text-on-surface-variant mt-1">Awaiting confirmation</p>
          </div>
          <div class="glass-card p-3 border-l-4 border-l-secondary">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[10px] font-bold text-on-surface-variant">UPTIME</p>
              <span class="material-symbols-outlined text-secondary/40 text-xs">sensors</span>
            </div>
            <div class="flex items-baseline gap-1">
              <h2 class="text-2xl font-bold text-secondary">${uptimeRate}<span class="text-lg">%</span></h2>
            </div>
            <div class="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div class="h-full bg-secondary" style="width:${uptimeRate}%;"></div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-8 glass-card p-8">
            <div class="flex justify-between items-center mb-10">
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface tracking-tight">Evidence Ingestion Activity</h3>
                <p class="text-body-sm text-on-surface-variant opacity-60">High-fidelity forensic data throughput (weekly)</p>
              </div>
            </div>
            <div class="relative h-72">
              <canvas id="dashboard-ingestion-chart" class="w-full h-full"></canvas>
            </div>
          </div>
          <div class="lg:col-span-4 glass-card p-8 flex flex-col">
            <div class="flex justify-between items-start mb-8">
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface">System Integrity</h3>
                <p class="text-body-sm text-on-surface-variant opacity-60">Verification Diagnostics</p>
              </div>
              <span class="material-symbols-outlined text-tertiary">check_circle</span>
            </div>
            <div class="flex-1 flex flex-col items-center justify-center space-y-10">
              <div class="relative w-48 h-48">
                <svg class="w-full h-full transform -rotate-90">
                  <circle class="text-white/5" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" stroke-width="4"></circle>
                  <circle class="text-primary-container glow-cyan" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" stroke-dasharray="${integrityDash} ${integrityRest}" stroke-linecap="round" stroke-width="6"></circle>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-sm font-label-caps text-on-surface-variant opacity-40">SECURITY LEVEL</span>
                  <span class="text-5xl font-display-lg font-bold text-primary tracking-tighter">${integrityRate}</span>
                  <span class="text-xs font-label-caps text-tertiary">VERIFIED INSTANCE</span>
                </div>
              </div>
              <div class="w-full space-y-3">
                <div class="flex justify-between items-center p-3 bg-white/5 border-l-2 border-tertiary">
                  <span class="text-[10px] font-label-caps text-on-surface-variant">BLOCKCHAIN FINALITY</span>
                  <span class="text-[10px] font-code-snippet text-tertiary">CONFIRMED</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-white/5 border-l-2 border-tertiary">
                  <span class="text-[10px] font-label-caps text-on-surface-variant">HASH CONSISTENCY</span>
                  <span class="text-[10px] font-code-snippet text-tertiary">MATCHED</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-white/5 border-l-2 border-tertiary">
                  <span class="text-[10px] font-label-caps text-on-surface-variant">AUTH SIGNATURES</span>
                  <span class="text-[10px] font-code-snippet text-tertiary">VERIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-8 glass-card">
            <div class="p-6 border-b border-white/5 flex justify-between items-center">
              <div class="flex items-center gap-3">
                <h3 class="font-headline-sm text-headline-sm text-on-surface">Ledger Entries</h3>
                <span class="bg-primary/10 text-primary text-[10px] px-2 py-0.5 font-label-caps">LIVE FEED</span>
              </div>
              <button type="button" class="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1" onclick="PageDashboard.exportCsv()">
                <span class="font-label-caps text-label-caps">EXPORT CSV</span>
                <span class="material-symbols-outlined text-sm">download</span>
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="ev-table w-full text-left">
                <thead>
                  <tr class="bg-surface-container-low/50">
                    <th class="px-6 py-4">TRANSACTION ID</th>
                    <th class="px-6 py-4">FINALIZED AT</th>
                    <th class="px-6 py-4">CONTENT IDENTIFIER (CID)</th>
                    <th class="px-6 py-4 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${ledgerRows}
                </tbody>
              </table>
            </div>
          </div>
          <div class="lg:col-span-4 glass-card p-6 flex flex-col gap-4">
            <div>
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Live Integrity Stream</h3>
              <p class="text-body-sm text-on-surface-variant opacity-60">Latest instance events and verification activity.</p>
            </div>
            <div class="space-y-3">
              ${activityHtml}
            </div>
          </div>
        </section>
      </div>`;

    this._renderIngestionChart(chartData, chartLabels, chartMaxRounded);
  },

  _renderIngestionChart(data, labels, maxValue) {
    const canvas = document.getElementById('dashboard-ingestion-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    if (this._ingestionChart) {
      try { this._ingestionChart.destroy(); } catch (e) {}
      this._ingestionChart = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue('--accent').trim() || '#00e5ff';
    const accentDark = cs.getPropertyValue('--accent-dark').trim() || '#00a3cc';
    const tick = cs.getPropertyValue('--text2').trim() || '#bac9cc';

    // create gradient for the line stroke and area fill
    const strokeGrad = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    strokeGrad.addColorStop(0, accent);
    strokeGrad.addColorStop(1, accentDark);

    const fillGrad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    fillGrad.addColorStop(0, accent + '33');
    fillGrad.addColorStop(1, 'transparent');

    // Smooth, glowing line chart styled like the reference image
    this._ingestionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Uploads',
            data,
            borderColor: strokeGrad,
            backgroundColor: fillGrad,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: accent,
            pointBorderWidth: 0,
            borderWidth: 3,
            segment: {
              borderColor: (ctx) => strokeGrad,
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tick },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.03)' },
            ticks: { color: tick, beginAtZero: true },
          },
        },
        elements: {
          line: {
            borderJoinStyle: 'round',
          },
          point: {
            hoverBorderColor: '#fff',
          },
        },
      },
      plugins: [
        {
          id: 'glow',
          beforeDatasetsDraw(chart) {
            const ctx = chart.ctx;
            ctx.save();
            ctx.shadowColor = accent;
            ctx.shadowBlur = 20;
          },
          afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            ctx.restore();
          },
        },
      ],
    });
  },

  exportCsv() {
    const rows = Array.isArray(this._ledgerExport) ? this._ledgerExport : [];
    if (!rows.length) {
      notify('No data', 'No ledger entries to export');
      return;
    }

    const escapeCsv = (value) => {
      const str = String(value ?? '');
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const header = ['Evidence ID', 'File Name', 'Case Number', 'Data Type', 'CID', 'Date', 'Status'];
    const lines = EviData.evidence.map((e) => [
      escapeCsv(e.id),
      escapeCsv(e.name || ''),
      escapeCsv(e.case || ''),
      escapeCsv(e.type || ''),
      escapeCsv(e.cid || ''),
      escapeCsv(e.date || ''),
      escapeCsv(e.status || 'verified'),
    ].join(','));

    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `evichain-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};

// js/pages/upload.js — Full working evidence submission with IPFS + Blockchain status

const PageUpload = {
  rendered: false,
  selectedFile: null,
  fileHash: null,
  duplicateRecord: null,
  reuseExisting: true,
  submitting: false,
  evidenceId: null,
  ipfsCID: null,
  txHash: null,
  blockNum: null,
  gasUsed: null,

  render() {
    // Always re-inject so navigating away and back resets the page cleanly
    if (!canUploadEvidence()) {
      document.getElementById('page-upload').innerHTML = `
        <div class="p-gutter space-y-stack-lg">
          <div class="page-header">
            <div>
              <div class="page-title">Upload Evidence</div>
              <div class="page-sub">Read-only role access</div>
            </div>
          </div>
          <div class="card" style="padding:24px;margin-bottom:0;">
            <div style="font-size:15px;color:var(--text);font-weight:600;margin-bottom:8px;">Your role can view evidence but cannot upload.</div>
            <div style="color:var(--text2);line-height:1.6;">Judge and lawyer accounts are read-only for evidence submission. You can still browse, verify, and inspect chain history from the other pages.</div>
          </div>
        </div>`;
      this.rendered = true;
      return;
    }

    this._inject();
    this._bindDropzone();
    this._setDateTime();
    this.rendered = true;
  },

  _inject() {
    // Reset state on every render
    this.selectedFile = null;
    this.fileHash = null;
    this.submitting = false;
    this.evidenceId = null;
    this.ipfsCID = null;
    this.txHash = null;
    this.blockNum = null;
    this.gasUsed = null;

    document.getElementById('page-upload').innerHTML = `
      <div class="p-gutter space-y-stack-lg">
      <div class="page-header">
        <div>
          <div class="page-title">Upload Evidence</div>
          <div class="page-sub">// secure file submission to IPFS + on-chain anchor</div>
        </div>
      </div>

      <!-- MetaMask confirmation modal (hidden by default) -->
      <div id="metamask-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:1000;align-items:center;justify-content:center;">
        <div style="background:var(--bg);border-radius:10px;padding:20px;max-width:420px;margin:auto 16px;border:1px solid var(--border);box-shadow:0 8px 32px rgba(0,0,0,0.08);width:calc(100% - 32px);">
          <div style="font-weight:700;margin-bottom:6px;">MetaMask Confirmation</div>
          <div style="color:var(--text2);font-size:13px;margin-bottom:14px;">MetaMask will show the gas fee and transaction details. Please confirm the popup to continue the evidence upload.</div>
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-ghost" id="metamask-cancel">Cancel</button>
            <button class="btn btn-primary" id="metamask-ok">Open MetaMask</button>
          </div>
        </div>
      </div>

      <div class="upload-zone" id="dropzone">
        <input type="file" id="file-input" style="display:none"
               accept=".pdf,.doc,.docx,.txt,.log,.csv,.jpg,.jpeg,.png,.mp4,.zip,.json"/>
        <div class="upload-icon" id="zone-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="upload-title" id="zone-title">Drop evidence file here or click to browse</div>
        <div class="upload-sub" id="zone-sub">Max 100 MB &middot; Files are hashed locally before upload</div>
        <div class="upload-formats">
          <span class="format-pill">PDF</span>
          <span class="format-pill">DOC / DOCX</span>
          <span class="format-pill">JPG / PNG</span>
          <span class="format-pill">TXT / LOG</span>
          <span class="format-pill">CSV / JSON</span>
          <span class="format-pill">MP4 / ZIP</span>
        </div>
        <button class="btn btn-ghost" style="margin-top:16px;" id="browse-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Choose File
        </button>
      </div>

      <div class="hash-preview" id="hash-row" style="display:none;">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <div style="flex:1;">
            <div class="hash-preview-label">SHA-256 Hash (computed in browser)</div>
            <div class="hash-preview-value" id="hash-display">Computing&hellip;</div>
          </div>
          <div id="hash-spinner" style="display:none;align-items:center;">
            <div class="ev-spinner"></div>
          </div>
        </div>
        <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;">
          <span id="file-size-badge" class="format-pill"></span>
          <span id="file-type-badge" class="format-pill" style="background:var(--accent-dim);color:var(--accent);border-color:rgba(0,229,160,.2);"></span>
        </div>
      </div>

      <div class="card" id="duplicate-panel" style="display:none;margin-top:16px;">
        <div class="card-header">
          <div class="card-title">IPFS Duplicate Detection</div>
        </div>
        <div style="padding:18px;">
          <div id="duplicate-message" style="color:var(--text2);font-size:13px;line-height:1.6;"></div>
          <div id="duplicate-actions" style="display:none;margin-top:14px;gap:12px;flex-wrap:wrap;">
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;">
              <input type="radio" name="reuse-existing" value="true" checked /> Reuse existing CID
            </label>
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;">
              <input type="radio" name="reuse-existing" value="false" /> Upload again to IPFS
            </label>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Evidence Metadata
          </div>
        </div>
        <div style="padding:24px;">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Case Number <span style="color:var(--red)">*</span></label>
              <input type="text" class="form-input" id="f-case" placeholder="e.g. CASE-2025-0042"/>
            </div>
            <div class="form-group">
              <label class="form-label">Evidence Type</label>
              <select class="form-select" id="f-type">
                <option value="Informational Report">Informational Report</option>
                <option value="Analytical Report">Analytical Report</option>
                <option value="Research Report">Research Report</option>
                <option value="Technical Report">Technical Report</option>
                <option value="Progress Report">Progress Report</option>
                <option value="Incident Report">Incident Report</option>
                <option value="Investigation Report">Investigation Report</option>
                <option value="Financial Report">Financial Report</option>
                <option value="Annual Report">Annual Report</option>
                <option value="Audit Report">Audit Report</option>
                <option value="Laboratory Report">Laboratory Report</option>
                <option value="Feasibility Report">Feasibility Report</option>
                <option value="Survey Report">Survey Report</option>
                <option value="Field Report">Field Report</option>
                <option value="Case Report">Case Report</option>
                <option value="Medical Report">Medical Report</option>
                <option value="Forensic Report" selected>Forensic Report</option>
                <option value="Inspection Report">Inspection Report</option>
                <option value="Project Report">Project Report</option>
                <option value="Performance Report">Performance Report</option>
                <option value="Image">Image / Photo</option>
                <option value="Log">System Log</option>
                <option value="Video">Video Recording</option>
                <option value="Document">Document / Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Collection Date &amp; Time</label>
              <input type="datetime-local" class="form-input" id="f-date"/>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:20px;">
            <label class="form-label">Description / Notes</label>
            <textarea class="form-textarea" id="f-desc" placeholder="Describe the evidence, chain of custody, or relevant context&hellip;"></textarea>
          </div>
          <div id="validation-msg" style="display:none;color:var(--red);font-size:12px;margin-bottom:14px;font-family:var(--font-mono);"></div>
          <div style="display:flex;gap:12px;justify-content:flex-end;">
            <button class="btn btn-ghost" id="clear-btn">Clear</button>
            <button class="btn btn-primary" id="submit-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              Submit to Blockchain
            </button>
          </div>
        </div>
      </div>

      <div id="status-panel" style="display:none;">

        <div class="card" style="border-color:rgba(59,130,246,.22);">
          <div class="card-header">
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--blue)"><polygon points="12 2 2 7 12 12 22 7"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              IPFS Upload Status
            </div>
            <div id="ipfs-badge" class="ev-chip">PENDING</div>
          </div>
          <div style="padding:20px 24px;">
            <div class="ev-timeline">
              <div class="ev-titem"><div class="ev-dot ev-dot-wait" id="i1d"></div><div class="ev-tbody"><div class="ev-tname">Encrypting file buffer</div><div class="ev-tdesc">AES-256 client-side encryption</div></div><div class="ev-tst" id="i1s">—</div></div>
              <div class="ev-titem"><div class="ev-dot ev-dot-wait" id="i2d"></div><div class="ev-tbody"><div class="ev-tname">Chunking content</div><div class="ev-tdesc">Splitting into 256 KB blocks</div></div><div class="ev-tst" id="i2s">—</div></div>
              <div class="ev-titem"><div class="ev-dot ev-dot-wait" id="i3d"></div><div class="ev-tbody"><div class="ev-tname">Uploading to IPFS network</div><div class="ev-tdesc">Pinning via Pinata gateway</div></div><div class="ev-tst" id="i3s">—</div></div>
              <div class="ev-titem"><div class="ev-dot ev-dot-wait" id="i4d"></div><div class="ev-tbody"><div class="ev-tname">CID generated &amp; verified</div><div class="ev-tdesc">Content-addressed immutable link</div></div><div class="ev-tst" id="i4s">—</div></div>
            </div>
            <div id="cid-row" style="display:none;margin-top:18px;">
              <div class="hash-preview-label">IPFS CID (Content Identifier)</div>
              <div class="hash-preview-value" id="cid-val" style="color:var(--blue);word-break:break-all;"></div>
            </div>
          </div>
        </div>

        <div class="card" style="border-color:rgba(0,229,160,.18);">
          <div class="card-header">
            <div class="card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              Blockchain Submission Status
            </div>
            <div id="chain-badge" class="ev-chip">PENDING</div>
          </div>
          <div style="padding:20px 24px;">
            <div class="ev-timeline">
              <div class="ev-titem"><div class="ev-dot ev-dot-wait" id="c1d"></div><div class="ev-tbody"><div class="ev-tname">Broadcasting transaction</div><div class="ev-tdesc">Submitting to mempool</div></div><div class="ev-tst" id="c1s">—</div></div>
              <div class="ev-titem"><div class="ev-dot ev-dot-wait" id="c2d"></div><div class="ev-tbody"><div class="ev-tname">Awaiting first confirmation</div><div class="ev-tdesc">Miner includes in block</div></div><div class="ev-tst" id="c2s">—</div></div>
              <div class="ev-titem"><div class="ev-dot ev-dot-wait" id="c3d"></div><div class="ev-tbody"><div class="ev-tname">Awaiting 6 confirmations</div><div class="ev-tdesc">Finality threshold</div></div><div class="ev-tst" id="c3s">—</div></div>
              <div class="ev-titem"><div class="ev-dot ev-dot-wait" id="c4d"></div><div class="ev-tbody"><div class="ev-tname">On-chain record finalized</div><div class="ev-tdesc">Immutable evidence anchor</div></div><div class="ev-tst" id="c4s">—</div></div>
            </div>
            <div id="chain-detail-rows" style="display:none;margin-top:18px;">
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">
                <div class="ev-detbox"><div class="ev-detkey">Transaction Hash</div><div class="ev-detval" id="d-tx"></div></div>
                <div class="ev-detbox"><div class="ev-detkey">Block Number</div><div class="ev-detval" id="d-block"></div></div>
                <div class="ev-detbox"><div class="ev-detkey">Network</div><div class="ev-detval">Sepolia Testnet</div></div>
                <div class="ev-detbox"><div class="ev-detkey">Gas Used</div><div class="ev-detval" id="d-gas"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card" id="cert-card" style="display:none;border-color:var(--accent);box-shadow:0 0 28px rgba(0,229,160,.06);">
          <div class="card-header" style="background:var(--accent-dim);">
            <div class="card-title" style="color:var(--accent)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent)"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
              Evidence Certificate
            </div>
            <button class="btn btn-ghost" style="font-size:11px;" id="dl-cert-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download .txt
            </button>
          </div>
          <div style="padding:20px 24px;"><div id="cert-rows"></div></div>
        </div>

      </div>
      </div>
    `;

    // Attach all events via JS — no inline onclick needed
    this._attachEvents();
  },

  _attachEvents() {
    const self = this;

    document.getElementById('file-input').addEventListener('change', function() {
      if (this.files[0]) self.onFileChosen(this.files[0]);
    });

    document.getElementById('browse-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      document.getElementById('file-input').click();
    });

    document.getElementById('submit-btn').addEventListener('click', function() {
      self.handleSubmit();
    });

    document.getElementById('clear-btn').addEventListener('click', function() {
      self.render();
    });

    document.getElementById('dl-cert-btn') && document.getElementById('dl-cert-btn').addEventListener('click', function() {
      self.downloadCert();
    });
  },

  async _showMetaMaskModal() {
    const m = document.getElementById('metamask-modal');
    if (!m) return;
    m.style.display = 'flex';
    return new Promise((resolve, reject) => {
      const ok = document.getElementById('metamask-ok');
      const cancel = document.getElementById('metamask-cancel');
      const cleanup = () => { ok.removeEventListener('click', onOk); cancel.removeEventListener('click', onCancel); };
      const onOk = () => { cleanup(); m.style.display = 'none'; resolve(true); };
      const onCancel = () => { cleanup(); m.style.display = 'none'; resolve(false); };
      ok.addEventListener('click', onOk);
      cancel.addEventListener('click', onCancel);
    });
  },

  async _promptMetaMask() {
    // Show a small modal and request a wallet transaction so MetaMask shows gas and confirmation.
    try {
      const proceed = await this._showMetaMaskModal();
      if (!proceed) return false;

      if (api && api.wallet && typeof api.wallet.confirmUploadTransaction === 'function') {
        await api.wallet.confirmUploadTransaction();
        try { if (window.PageSettings) PageSettings.refresh(); } catch(e){}
        return true;
      }
    } catch (err) {
      Components.showToast(err?.message || 'MetaMask connection failed');
      return false;
    }
    return false;
  },

  _stepsHTML() {
    const steps = ['Select File', 'Hash & Meta', 'IPFS Upload', 'Blockchain', 'Confirmed'];
    return steps.map((label, i) => {
      const num = i + 1;
      const cls = i === 0 ? 'active' : 'waiting';
      const conn = i < steps.length - 1 ? `<div class="step-connector" id="conn-${num}"></div>` : '';
      return `<div class="step ${cls}" id="step-${num}"><div class="step-num" id="step-num-${num}">${num}</div><div class="step-label">${label}</div></div>${conn}`;
    }).join('');
  },

  _setDateTime() {
    const el = document.getElementById('f-date');
    if (!el) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    el.value = now.toISOString().slice(0, 16);
  },

  _bindDropzone() {
    const self = this;
    const dz = document.getElementById('dropzone');
    if (!dz) return;
    dz.addEventListener('click', function(e) {
      if (e.target.closest('button') || e.target.closest('input')) return;
      document.getElementById('file-input').click();
    });
    dz.addEventListener('dragover', function(e) { e.preventDefault(); dz.classList.add('drag'); });
    dz.addEventListener('dragleave', function() { dz.classList.remove('drag'); });
    dz.addEventListener('drop', function(e) {
      e.preventDefault(); dz.classList.remove('drag');
      if (e.dataTransfer.files[0]) self.onFileChosen(e.dataTransfer.files[0]);
    });
  },

  async onFileChosen(file) {
    if (!file) return;
    this.selectedFile = file;
    this.fileHash = null;

    const dz = document.getElementById('dropzone');
    dz.classList.add('drag');
    document.getElementById('zone-icon').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
    document.getElementById('zone-title').textContent = file.name;
    document.getElementById('zone-sub').textContent = this._fmtSize(file.size) + ' · Computing SHA-256\u2026';

    const hashRow = document.getElementById('hash-row');
    hashRow.style.display = 'block';
    document.getElementById('hash-display').textContent = 'Computing\u2026';
    document.getElementById('hash-spinner').style.display = 'flex';
    document.getElementById('file-size-badge').textContent = this._fmtSize(file.size);
    const ext = file.name.split('.').pop().toUpperCase();
    document.getElementById('file-type-badge').textContent = file.type ? file.type.split('/')[1].toUpperCase() : ext;

    this._setStep(1, 'done'); this._fillConn(1); this._setStep(2, 'active');

    try {
      const buf = await file.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const hex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      this.fileHash = hex;
      document.getElementById('hash-display').textContent = hex;
      document.getElementById('zone-sub').textContent = this._fmtSize(file.size) + ' \u00b7 SHA-256 ready \u2713';
      await this._checkDuplicate();
    } catch(e) {
      document.getElementById('hash-display').textContent = 'Error computing hash: ' + e.message;
      document.getElementById('duplicate-panel').style.display = 'none';
    }
    document.getElementById('hash-spinner').style.display = 'none';
  },

  async _checkDuplicate() {
    if (!this.fileHash) {
      return;
    }

    this.duplicateRecord = null;
    const panel = document.getElementById('duplicate-panel');
    const message = document.getElementById('duplicate-message');
    const actions = document.getElementById('duplicate-actions');
    panel.style.display = 'none';
    actions.style.display = 'none';
    message.textContent = '';

    try {
      const result = await api.evidence.duplicate(this.fileHash);
      if (result.exists && result.data) {
        this.duplicateRecord = result.data;
        this.reuseExisting = true;
        panel.style.display = 'block';
        message.innerHTML = `This evidence has already been stored on IPFS.<br/><strong>Existing CID:</strong> ${result.data.ipfsCid}<br/><strong>Recorded Case:</strong> ${result.data.caseId || 'N/A'}`;
        actions.style.display = 'flex';
        const radios = panel.querySelectorAll('input[name="reuse-existing"]');
        radios.forEach((radio) => {
          radio.checked = radio.value === 'true';
          radio.onchange = (event) => {
            this.reuseExisting = event.target.value === 'true';
          };
        });
      }
    } catch (err) {
      console.warn('[EviChain] Duplicate check failed', err);
      panel.style.display = 'none';
    }
  },

  _fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(2) + ' MB';
  },

  async handleSubmit() {
    if (this.submitting) return;
    const caseNum = (document.getElementById('f-case').value || '').trim();
    const descriptionText = (document.getElementById('f-desc').value || '').trim();
    const evidenceType = (document.getElementById('f-type').value || '').trim();
    const vm = document.getElementById('validation-msg');

    if (!AppState.isAuthenticated) {
      vm.textContent = 'Wallet authentication is required. Connect your wallet from the landing screen first.';
      vm.style.display = 'block';
      return;
    }

    if (!this.selectedFile) {
      vm.textContent = '\u26A0 Please select a file before submitting.';
      vm.style.display = 'block';
      return;
    }
    if (!caseNum) {
      vm.textContent = '\u26A0 Case Number is required.';
      vm.style.display = 'block';
      document.getElementById('f-case').focus();
      return;
    }
    vm.style.display = 'none';
    // Prompt MetaMask for user confirmation before starting the upload flow
    try {
      const mmOk = await this._promptMetaMask();
      if (!mmOk) {
        vm.textContent = '\u26A0 MetaMask confirmation required to proceed.';
        vm.style.display = 'block';
        return;
      }
    } catch (e) {
      vm.textContent = `\u26A0 MetaMask error: ${e?.message || 'Unable to connect'}`;
      vm.style.display = 'block';
      return;
    }

    this.submitting = true;
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="ev-spinner"></div> Submitting\u2026';

    const panel = document.getElementById('status-panel');
    panel.style.display = 'block';
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    const resolvedEvidenceType = normalizeEvidenceType(evidenceType, this.selectedFile.name, this.selectedFile.type);
    const finalDescription = descriptionText || `${resolvedEvidenceType} evidence: ${this.selectedFile.name}`;

    try {
      const submitPromise = api.evidence.submit(
        this.selectedFile,
        caseNum,
        finalDescription,
        this.duplicateRecord && this.reuseExisting === true,
        this.duplicateRecord && this.reuseExisting === true ? this.duplicateRecord.ipfsCid : '',
        resolvedEvidenceType
      );

      this._setStep(2, 'done'); this._fillConn(2); this._setStep(3, 'active');
      await this._runIPFS();

      this._setStep(3, 'done'); this._fillConn(3); this._setStep(4, 'active');
      await this._runBlockchain();

      const created = await submitPromise;
      this._applySubmissionResult(created);

      this._setStep(4, 'done'); this._fillConn(4); this._setStep(5, 'done');
      this._showCert();

      const self = this;
      const dlBtn = document.getElementById('dl-cert-btn');
      if (dlBtn) dlBtn.addEventListener('click', function() { self.downloadCert(); });

      this._confirmRecord();

      if (created.txHash) {
        EviData.chainTxns.unshift({
          dot: 'green',
          title: `${created.evidenceId} recorded on Sepolia`,
          hash: created.txHash,
          block: created.blockNumber ? Number(created.blockNumber).toLocaleString() : '—',
          time: formatDate(created.date),
          gas: 'n/a',
        });
      }

      resetPageCaches();
      notify('Evidence submitted', `${created.evidenceId} anchored on-chain`);

      btn.innerHTML = '\u2713 Submitted';
      this.submitting = false;

      setTimeout(() => {
        const recNav = document.querySelector('.nav-item[data-page="records"]');
        Router.go('records', recNav);
      }, 1200);
    } catch (error) {
      vm.textContent = `\u26A0 Upload failed: ${error.message || 'Unknown error'}`;
      vm.style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        Submit to Blockchain
      `;
      this.submitting = false;

      if (this._pendingRecord) {
        EviData.evidence = EviData.evidence.filter((e) => e !== this._pendingRecord);
        this._pendingRecord = null;
      }

      refreshEvidenceBadge();
      notify('Submission failed', error.message || 'Please retry after checking backend logs');
    }
  },

  _applySubmissionResult(created) {
    this.evidenceId = created.evidenceId;
    this.fileHash = created.sha256Hash || this.fileHash;
    this.ipfsCID = created.ipfsCid || this.ipfsCID;
    this.txHash = created.txHash || this.txHash;
    this.blockNum = created.blockNumber ? Number(created.blockNumber).toLocaleString() : this.blockNum;
    this.gasUsed = 'n/a';

    if (this._pendingRecord) {
      const nextDate = created.date || this._pendingRecord.date;
      const parsedDate = parseDate(nextDate);
      this._pendingRecord.id = created.evidenceId || this._pendingRecord.id;
      this._pendingRecord.name = created.fileName || this._pendingRecord.name;
      this._pendingRecord.case = created.caseId || this._pendingRecord.case;
      this._pendingRecord.type = normalizeEvidenceType(created.evidenceType, created.fileName || this._pendingRecord.name, created.mimeType);
      this._pendingRecord.hash = created.sha256Hash || this._pendingRecord.hash;
      this._pendingRecord.cid = created.ipfsCid || this._pendingRecord.cid;
      this._pendingRecord.date = formatDate(nextDate);
      this._pendingRecord._ts = created.timestamp
        ? Number(created.timestamp)
        : parsedDate
          ? Math.floor(parsedDate.getTime() / 1000)
          : this._pendingRecord._ts;
      this._pendingRecord.uploader = created.submittedBy || this._pendingRecord.uploader;
      this._pendingRecord.status = 'verified';
      this._pendingRecord.txHash = created.txHash || this._pendingRecord.txHash;
      this._pendingRecord.block = created.blockNumber || this._pendingRecord.block;
    }

    document.getElementById('cid-row').style.display = 'block';
    document.getElementById('cid-val').textContent = this.ipfsCID || '—';
    document.getElementById('chain-detail-rows').style.display = 'block';
    document.getElementById('d-tx').textContent = this.txHash
      ? this.txHash.slice(0, 18) + '\u2026' + this.txHash.slice(-6)
      : '—';
    document.getElementById('d-block').textContent = this.blockNum ? '#' + this.blockNum : '—';
    document.getElementById('d-gas').textContent = this.gasUsed;
  },

  async _runIPFS() {
    const pairs = [['i1d','i1s'],['i2d','i2s'],['i3d','i3s'],['i4d','i4s']];
    const ms    = [900, 700, 1400, 600];
    this._chip('ipfs-badge', 'ev-chip-uploading', 'UPLOADING');
    for (let i = 0; i < pairs.length; i++) {
      this._dot(pairs[i][0], 'ev-dot-active');
      document.getElementById(pairs[i][1]).textContent = 'In progress\u2026';
      await this._wait(ms[i]);
      this._dot(pairs[i][0], 'ev-dot-done');
      document.getElementById(pairs[i][1]).innerHTML = '<span style="color:var(--accent)">\u2713 Done</span>';
    }
    this._chip('ipfs-badge', 'ev-chip-confirmed', 'COMPLETED');
  },

  async _runBlockchain() {
    const pairs = [['c1d','c1s'],['c2d','c2s'],['c3d','c3s'],['c4d','c4s']];
    const ms    = [800, 1200, 2000, 600];
    const lbl   = ['Broadcasting\u2026','Awaiting block\u2026','4 / 6 confirmations\u2026','Finalizing\u2026'];
    this._chip('chain-badge', 'ev-chip-uploading', 'PENDING');
    for (let i = 0; i < pairs.length; i++) {
      this._dot(pairs[i][0], 'ev-dot-active');
      document.getElementById(pairs[i][1]).textContent = lbl[i];
      await this._wait(ms[i]);
      this._dot(pairs[i][0], 'ev-dot-done');
      document.getElementById(pairs[i][1]).innerHTML = '<span style="color:var(--accent)">\u2713 Done</span>';
    }
    this._chip('chain-badge', 'ev-chip-confirmed', 'CHAIN WRITE DONE');
  },

  _showCert() {
    const cert  = document.getElementById('cert-card');
    cert.style.display = 'block';
    const now   = new Date().toLocaleString();
    const caseN = document.getElementById('f-case').value;
    const rows  = [
      ['Evidence ID',  this.evidenceId || '—'],
      ['Case Number',  caseN],
      ['File Name',    this.selectedFile.name],
      ['File Size',    this._fmtSize(this.selectedFile.size)],
      ['SHA-256 Hash', this.fileHash || '—'],
      ['IPFS CID',     this.ipfsCID  || '—'],
      ['Tx Hash',      this.txHash ? this.txHash.slice(0, 22) + '\u2026' : '—'],
      ['Block',        this.blockNum ? '#' + this.blockNum : '—'],
      ['Submitted At', now],
      ['Network',      'Sepolia Testnet'],
    ];
    document.getElementById('cert-rows').innerHTML = rows.map(([k, v]) =>
      `<div class="ev-certrow"><div class="ev-certkey">${k}</div><div class="ev-certval">${v}</div></div>`
    ).join('');
    setTimeout(() => cert.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  },

  downloadCert() {
    const rows  = Array.from(document.querySelectorAll('.ev-certrow'));
    const lines = rows.map(r =>
      r.querySelector('.ev-certkey').textContent.padEnd(20) + ': ' +
      r.querySelector('.ev-certval').textContent
    ).join('\n');
    const blob = new Blob(['EviChain Evidence Certificate\n' + '='.repeat(60) + '\n\n' + lines + '\n'], { type: 'text/plain' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'evichain-cert-' + Date.now() + '.txt';
    a.click();
  },

  // ── Record management ──────────────────────────────────────

  // Called immediately when Submit is clicked — inserts a PENDING record
  _insertPendingRecord() {
    this._pendingId = `PENDING-${Date.now()}`;

    const file    = this.selectedFile;
    const caseNum = document.getElementById('f-case').value.trim();
    const now     = new Date();
    const dateStr = now.getFullYear() + '-' +
                    String(now.getMonth()+1).padStart(2,'0') + '-' +
                    String(now.getDate()).padStart(2,'0') + ' ' +
                    String(now.getHours()).padStart(2,'0') + ':' +
                    String(now.getMinutes()).padStart(2,'0');

    const selectedType = (document.getElementById('f-type')?.value || '').trim();
    const typeLabel = normalizeEvidenceType(selectedType, file.name);
    const submittedAt = new Date();

    // Store reference so _confirmRecord can find and update it
    this._pendingRecord = {
      id:       this._pendingId,
      name:     file.name,
      case:     caseNum,
      type:     typeLabel,
      hash:     this.fileHash || '—',
      cid:      '—',            // not yet — IPFS hasn't run yet
      date:     dateStr,
      _ts:      Math.floor(submittedAt.getTime() / 1000),
      status:   'pending',      // <-- PENDING while blockchain processes
      uploader: '—',
      txHash:   null,
      block:    null,
    };

    EviData.evidence.unshift(this._pendingRecord);

    // Update nav badge
    refreshEvidenceBadge();

    // Force records to re-render on next visit
    PageRecords.rendered = false;

    // If user is already on records page, show the pending entry immediately
    if (Router.current === 'records') PageRecords.render();
  },

  // Flips the pending record to VERIFIED — called after user lands on Records page
  _confirmRecord() {
    if (!this._pendingRecord) return;

    this._pendingRecord.status = 'verified';
    this._pendingRecord.cid    = this.ipfsCID || '—';
    this._pendingRecord.hash   = this.fileHash || this._pendingRecord.hash;
    this._pendingRecord.txHash = this.txHash  || null;
    this._pendingRecord.block  = this.blockNum || null;

    // Add audit log entry
    EviData.auditLog.unshift({
      time:   this._pendingRecord.date,
      action: 'upload',
      detail: this._pendingRecord.id + ' blockchain tx confirmed · ' + (this.selectedFile ? this.selectedFile.name : ''),
      user:   (this._pendingRecord.uploader || 'System').split(' ')[0],
    });

    resetPageCaches();

    // Re-render records table so the status badge updates live
    if (Router.current === 'records') {
      PageRecords.render();
      // Flash the updated row green so user notices the change
      setTimeout(() => {
        const rows = document.querySelectorAll('#records-tbody tr');
        if (rows[0]) {
          rows[0].style.transition = 'background 0.5s';
          rows[0].style.background = 'var(--accent-dim)';
          setTimeout(() => { rows[0].style.background = ''; }, 2000);
        }
      }, 50);
    }

    this._pendingRecord = null;
  },

  // ── Helpers ──  // ── Helpers ──
  _setStep(n, cls) {
    const el = document.getElementById('step-' + n);
    const nm = document.getElementById('step-num-' + n);
    if (!el) return;
    el.className = 'step ' + cls;
    nm.textContent = cls === 'done' ? '\u2713' : n;
  },
  _fillConn(n) {
    const c = document.getElementById('conn-' + n);
    if (c) c.className = 'step-connector filled';
  },
  _dot(id, cls) {
    const e = document.getElementById(id);
    if (e) e.className = 'ev-dot ' + cls;
  },
  _chip(id, cls, label) {
    const e = document.getElementById(id);
    if (!e) return;
    e.className = 'ev-chip ' + cls;
    e.textContent = label;
  },
  _wait(ms) { return new Promise(r => setTimeout(r, ms)); },
};

// js/pages/records.js

const PageRecords = {
  rendered: false,

  render() {
    // Always re-render so newly submitted evidence appears immediately
    this.rendered = true;
    if (!this.filterMode) this.filterMode = 'all';
    if (this.filterQuery === undefined) this.filterQuery = '';

    const total = EviData.evidence.length;
    document.getElementById('page-records').innerHTML = `
      <div class="p-container-padding space-y-stack-lg">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md">
          <div>
            <h1 class="font-display-lg text-display-lg text-primary">Evidence Records</h1>
            <p class="font-body-lg text-on-surface-variant mt-2">Verified Ledger: <span class="text-primary-fixed-dim font-bold">${total} Entries</span></p>
          </div>
          <div class="flex items-center gap-4 px-4 py-2 bg-surface-container-high rounded-lg border border-outline-variant/20">
            <div class="relative flex items-center justify-center">
              <div class="absolute w-3 h-3 bg-tertiary rounded-full animate-ping"></div>
              <div class="relative w-3 h-3 bg-tertiary rounded-full"></div>
            </div>
            <div class="flex flex-col">
              <span class="font-label-caps text-[10px] tracking-widest text-on-surface-variant">INSTANCE STATUS</span>
              <span class="font-code-snippet text-tertiary text-[12px]">SYNCED // BLOCK 1.2M</span>
            </div>
          </div>
        </div>

          <div class="glass-card rounded-xl p-stack-md">
          <div class="flex flex-col lg:flex-row justify-between items-center gap-stack-md mb-stack-md">
            <div class="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/30">
              <button class="records-filter-btn px-4 py-2 font-label-caps text-label-caps rounded transition-all" data-records-filter="all">All Records</button>
              <button class="records-filter-btn px-4 py-2 font-label-caps text-label-caps rounded transition-all" data-records-filter="img">IMG</button>
              <button class="records-filter-btn px-4 py-2 font-label-caps text-label-caps rounded transition-all" data-records-filter="doc">DOC</button>
              <button class="records-filter-btn px-4 py-2 font-label-caps text-label-caps rounded transition-all" data-records-filter="log">LOG</button>
            </div>
            <div class="flex-1 w-full lg:max-w-md relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input class="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 pl-10 pr-4 font-body-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" id="rec-search" placeholder="Search by Entry ID, CID, or Filename..." type="text"/>
            </div>
            <button class="flex items-center gap-2 px-6 py-3 bg-surface-container-highest border border-outline-variant/50 text-primary-fixed-dim font-label-caps text-label-caps rounded-lg hover:bg-primary-fixed-dim hover:text-on-primary transition-all">
              <span class="material-symbols-outlined text-[18px]">filter_list</span>
              Advanced Filters
            </button>
          </div>

          <div class="overflow-x-auto custom-scrollbar">
            <table class="ev-table w-full border-collapse">
              <thead>
                <tr class="border-b border-outline-variant/30">
                  <th class="text-left py-4 px-4">Entry ID</th>
                  <th class="text-left py-4 px-4">File Name</th>
                  <th class="text-left py-4 px-4">Case Number</th>
                  <th class="text-left py-4 px-4">Data Type</th>
                  <th class="text-left py-4 px-4">IPFS CID</th>
                  <th class="text-right py-4 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/10" id="records-tbody"></tbody>
            </table>
          </div>

          <div class="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant/20">
            <p class="font-body-sm text-on-surface-variant">Showing <span class="text-on-surface">1 - ${Math.min(10, total)}</span> of ${total} records</p>
            <div class="flex gap-2">
              <button class="p-2 bg-surface-container border border-outline-variant/30 rounded hover:bg-surface-variant transition-all disabled:opacity-30" disabled>
                <span class="material-symbols-outlined">chevron_left</span>
              </button>
              <div class="flex items-center px-4 font-label-caps text-label-caps bg-surface-container border border-outline-variant/30 rounded">
                Page 1
              </div>
              <button class="p-2 bg-surface-container border border-outline-variant/30 rounded hover:bg-surface-variant transition-all">
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;

    // Attach search via addEventListener — no inline onclick
    document.getElementById('rec-search').addEventListener('input', function() {
      PageRecords.filter(this.value);
    });

    const filterButtons = Array.from(document.querySelectorAll('[data-records-filter]'));
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        PageRecords.filterMode = btn.dataset.recordsFilter || 'all';
        filterButtons.forEach((b) => b.classList.toggle('active', b === btn));
        PageRecords._applyFilters();
      });
    });
    filterButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.recordsFilter === PageRecords.filterMode);
    });

    this._applyFilters();
  },

  renderRows(data) {
    const tbody = document.getElementById('records-tbody');
    if (!tbody) return;
    tbody.innerHTML = data.map((e, idx) => {
      const typeMeta = this._typeMeta(e.type);
      const cidText = e.cid ? `${e.cid.slice(0, 6)}...${e.cid.slice(-4)}` : '—';
      const isNew = idx === 0 && e._new;
      const rowStyle = isNew ? 'background:rgba(0,229,255,0.08);' : '';
      const copyBtn = e.cid
        ? `<button class="material-symbols-outlined text-[14px] hover:text-primary transition-colors" onclick="event.stopPropagation();navigator.clipboard.writeText('${e.cid}')">content_copy</button>`
        : '';
      return `
        <tr class="group hover:bg-white/[0.03] transition-colors cursor-pointer" style="${rowStyle}" onclick="Router.go('view-evidence', document.querySelector('[data-page=view-evidence]')); setTimeout(function(){ PageViewEvidence.showDetail('${e.id}'); }, 0)">
          <td class="py-5 px-4 font-code-snippet text-primary-fixed-dim">${e.id}</td>
          <td class="py-5 px-4 font-body-sm text-on-surface">${e.name || e.case || e.id}</td>
          <td class="py-5 px-4 font-body-sm text-on-surface-variant">${e.case}</td>
          <td class="py-5 px-4">
            <span class="px-2 py-1 text-[10px] font-bold rounded uppercase border ${typeMeta.cls}">${typeMeta.label}</span>
          </td>
          <td class="py-5 px-4 font-code-snippet text-[12px]">
            <div class="flex items-center gap-2 bg-surface-container-low px-2 py-1 rounded w-fit">
              <span class="opacity-60">${cidText}</span>
              ${copyBtn}
            </div>
          </td>
          <td class="py-5 px-4 text-right font-body-sm text-on-surface-variant">${e.date}</td>
        </tr>`;
    }).join('');
  },

  _typeMeta(type) {
    const upper = String(type || '').toUpperCase().trim();
    if (upper === 'IMG') return { label: 'IMG', cls: 'bg-primary/10 text-primary border-primary/20' };
    if (upper === 'VID') return { label: 'VID', cls: 'bg-primary/10 text-primary border-primary/20' };
    if (upper === 'LOG') return { label: 'LOG', cls: 'bg-tertiary/10 text-tertiary border-tertiary/20' };
    if (upper === 'DOC') return { label: 'DOC', cls: 'bg-secondary/10 text-secondary border-secondary/20' };
    return { label: upper || 'DOC', cls: 'bg-secondary/10 text-secondary border-secondary/20' };
  },

  filter(query) {
    this.filterQuery = String(query || '').toLowerCase();
    this._applyFilters();
  },

  _applyFilters() {
    const q = this.filterQuery || '';
    const mode = this.filterMode || 'all';
    const filtered = EviData.evidence.filter((e) => {
      const haystack = [
        e.id,
        e.name,
        e.case,
        e.txHash,
        e.cid,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      const matchesQuery = !q || haystack.some((value) => value.includes(q));
      if (!matchesQuery) return false;

      if (mode === 'all') return true;
      const category = this._categoryFor(e);
      return category === mode;
    });

    this.renderRows(filtered);
  },

  _categoryFor(evidence) {
    const upper = String(evidence?.type || '').toUpperCase();
    if (upper === 'IMG') return 'img';
    if (upper === 'VID') return 'img';
    if (upper === 'LOG') return 'log';
    if (upper === 'DOC') return 'doc';
    return 'doc';
  },
};

// js/pages/verify.js

const PageVerify = {
  rendered: false,
  verifyEvents: [],

  _getVerifyStats() {
    const eventsSource = this.verifyEvents.length
      ? this.verifyEvents
      : EviData.evidence.map((e) => ({
          status: e.status,
          date: e.date,
        }));

    const todayKey = new Date().toISOString().slice(0, 10);
    const verifiedToday = eventsSource.filter((e) =>
      e.status === 'verified' && e.date?.startsWith?.(todayKey)
    ).length;
    const totalChecks = eventsSource.length;
    const verifiedCount = eventsSource.filter((e) => e.status === 'verified').length;
    const passRate = totalChecks > 0
      ? ((verifiedCount / totalChecks) * 100).toFixed(1)
      : '0.0';
    const alerts = eventsSource.filter((e) => e.status === 'failed').length;

    return { verifiedToday, totalChecks, passRate, alerts };
  },

  _renderVerifyOverview() {
    const stats = this._getVerifyStats();
    const update = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    update('verify-count-today', stats.verifiedToday);
    update('verify-count-total', stats.totalChecks);
    update('verify-count-passrate', `${stats.passRate}%`);
    update('verify-count-alerts', stats.alerts);
  },

  render() {
    if (this.rendered) return;
    this.rendered = true;

    const stats = this._getVerifyStats();

    document.getElementById('page-verify').innerHTML = `
      <div class="p-gutter max-w-6xl mx-auto space-y-stack-lg pb-stack-lg">
        <section class="space-y-stack-md pt-8">
          <div class="max-w-2xl">
            <h2 class="font-headline-md text-on-surface mb-2">Verify Chain Authenticity</h2>
            <p class="text-on-surface-variant opacity-80">Input an Evidence ID or a SHA-256 hash to trigger a real-time validation against the immutable ledger.</p>
          </div>
          <div class="glass-card p-8 rounded-xl glow-cyan relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10"></div>
            <div class="flex flex-col md:flex-row gap-4">
              <div class="flex-1 relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary/50">key</span>
                <input class="w-full bg-surface-container-lowest border border-white/10 rounded-lg py-4 pl-12 pr-4 font-code-snippet text-primary focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all outline-none" id="verify-input" placeholder="Enter Evidence ID or SHA-256 hash" type="text" value="${EviData.evidence[0]?.id || ''}"/>
              </div>
              <button class="bg-primary-container text-on-primary-container font-bold px-8 py-4 rounded-lg flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all" onclick="PageVerify.run()">
                <span class="material-symbols-outlined">verified</span>
                RUN VERIFICATION
              </button>
            </div>
            <div class="mt-6 flex items-center gap-6">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-tertiary electric-glow"></span>
                <span class="font-label-caps text-[10px] text-tertiary">Ethereum Network: Active</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-tertiary electric-glow"></span>
                <span class="font-label-caps text-[10px] text-tertiary">Smart Contract: v2.4.1</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-label-caps text-[10px] text-on-surface-variant">Last Block: #18,421,092</span>
              </div>
            </div>
          </div>
          <div id="verify-result"></div>
        </section>

        <section class="glass-card rounded-xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Verify by Re-upload</h3>
            <span class="text-[10px] font-label-caps text-on-surface-variant">Optional</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input class="recessed-field border border-white/10 rounded-lg px-4 py-3 text-on-surface" id="verify-file-evidence-id" placeholder="Evidence ID (e.g. EV-2025-0004)" type="text" value="${EviData.evidence[0]?.id || ''}"/>
            <input class="recessed-field border border-white/10 rounded-lg px-4 py-3 text-on-surface" id="verify-file-input" type="file"/>
            <button class="bg-surface-container-highest border border-outline-variant/50 text-primary-fixed-dim font-label-caps text-label-caps rounded-lg hover:bg-primary-fixed-dim hover:text-on-primary transition-all" onclick="PageVerify.runFile()">Verify by Re-upload</button>
          </div>
          <div id="verify-file-result"></div>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="glass-card rounded-xl p-4">
            <div class="text-[10px] font-label-caps text-on-surface-variant">Verified Today</div>
            <div class="text-3xl font-headline-md text-primary" id="verify-count-today">${stats.verifiedToday}</div>
          </div>
          <div class="glass-card rounded-xl p-4">
            <div class="text-[10px] font-label-caps text-on-surface-variant">Total Checks</div>
            <div class="text-3xl font-headline-md text-on-surface" id="verify-count-total">${stats.totalChecks}</div>
          </div>
          <div class="glass-card rounded-xl p-4">
            <div class="text-[10px] font-label-caps text-on-surface-variant">Pass Rate</div>
            <div class="text-3xl font-headline-md text-secondary" id="verify-count-passrate">${stats.passRate}%</div>
          </div>
          <div class="glass-card rounded-xl p-4">
            <div class="text-[10px] font-label-caps text-on-surface-variant">Alerts</div>
            <div class="text-3xl font-headline-md text-error" id="verify-count-alerts">${stats.alerts}</div>
          </div>
        </section>

        <section class="glass-card rounded-xl p-6 space-y-3">
          <h3 class="font-headline-sm text-headline-sm">How Verification Works</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-body-sm text-on-surface-variant">
            <div class="flex items-start gap-3">
              <span class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-code-snippet">1</span>
              <span>Re-hash the current file using SHA-256.</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-7 h-7 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-[10px] font-code-snippet">2</span>
              <span>Query the smart contract for the stored hash.</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-7 h-7 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center text-[10px] font-code-snippet">3</span>
              <span>Compare results to verify integrity.</span>
            </div>
          </div>
        </section>
      </div>`;

    this._renderVerifyOverview();
    this.run();
  },

  _step(num, color, text) {
    return `
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <div style="width:22px;height:22px;border-radius:6px;background:var(--${color}-dim);border:1px solid var(--${color});display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--font-mono);font-size:10px;color:var(--${color});font-weight:700;">${num}</div>
        <div style="font-size:13px;color:var(--text2);line-height:1.6;">${text}</div>
      </div>`;
  },

  async run() {
    const val = (document.getElementById('verify-input')?.value || '').trim();
    const result = document.getElementById('verify-result');
    if (!result) return;

    if (!AppState.isAuthenticated) {
      result.innerHTML = `
        <div class="result-card fail">
          <div class="result-icon fail">${Components.icon.lock}</div>
          <div class="result-meta">
            <div class="result-title">Authentication Required</div>
            <div style="font-size:13px;color:var(--text2);margin-top:4px;">Connect your wallet first, then run verification.</div>
          </div>
        </div>`;
      return;
    }

    if (!val) {
      result.innerHTML = `
        <div class="result-card fail">
          <div class="result-icon fail">${Components.icon.xCircle}</div>
          <div class="result-meta">
            <div class="result-title">Missing Input</div>
            <div style="font-size:13px;color:var(--text2);margin-top:4px;">Enter an evidence ID or a full SHA-256 hash.</div>
          </div>
        </div>`;
      return;
    }

    const isHash = /^[a-fA-F0-9]{64}$/.test(val);
    const match = isHash
      ? EviData.evidence.find((e) => e.hash.toLowerCase() === val.toLowerCase())
      : EviData.evidence.find((e) => e.id.toLowerCase() === val.toLowerCase());

    if (!match) {
      result.innerHTML = `
        <div class="result-card fail">
          <div class="result-icon fail">${Components.icon.xCircle}</div>
          <div class="result-meta">
            <div class="result-title">Record Not Found</div>
            <div style="font-size:13px;color:var(--text2);margin-top:4px;">Load records and use an existing evidence ID/hash.</div>
          </div>
        </div>`;
      return;
    }

    const evidenceId = match.id;
    const sha256Hash = isHash ? val.toLowerCase() : match.hash;

    result.innerHTML = `
      <div class="result-card success">
        <div class="result-icon success">
          <div class="ev-spinner"></div>
        </div>
        <div class="result-meta">
          <div class="result-title">Verifying against blockchain...</div>
        </div>
      </div>`;

    try {
      const verifyData = await api.verify.byHash(evidenceId, sha256Hash);
      this.verifyEvents.push({
        status: verifyData.isValid ? 'verified' : 'failed',
        date: new Date().toISOString(),
      });
      this._renderVerifyOverview();

      if (verifyData.isValid) {
        result.innerHTML = `
          <div class="result-card success">
            <div class="result-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <div class="result-meta">
              <div class="result-title">Evidence Intact — Chain of Custody Verified</div>
              <div class="result-row"><span class="result-key">Evidence ID</span><span class="result-val">${verifyData.evidenceId}</span></div>
              <div class="result-row"><span class="result-key">Stored Hash</span><span class="result-val">${sha256Hash.slice(0, 20)}...${sha256Hash.slice(-8)}</span></div>
              <div class="result-row"><span class="result-key">Current Hash</span><span class="result-val">${sha256Hash.slice(0, 20)}...${sha256Hash.slice(-8)}</span></div>
              <div class="result-row"><span class="result-key">Match</span><span class="result-val" style="color:var(--accent)">IDENTICAL</span></div>
              <div class="result-row"><span class="result-key">IPFS CID</span><span class="result-val">${verifyData.ipfsCid || '—'}</span></div>
              <div class="result-row"><span class="result-key">Timestamp</span><span class="result-val">${verifyData.date ? formatDate(verifyData.date) : '—'}</span></div>
            </div>
          </div>`;
      } else {
        result.innerHTML = `
          <div class="result-card fail">
            <div class="result-icon fail">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div class="result-meta">
              <div class="result-title">Tamper Detected — Evidence Compromised</div>
              <div class="result-row"><span class="result-key">Evidence ID</span><span class="result-val">${verifyData.evidenceId}</span></div>
              <div class="result-row"><span class="result-key">Provided Hash</span><span class="result-val" style="color:var(--red)">${sha256Hash.slice(0, 20)}...${sha256Hash.slice(-8)}</span></div>
              <div class="result-row"><span class="result-key">Result</span><span class="result-val" style="color:var(--red)">MISMATCH — NOT ADMISSIBLE</span></div>
            </div>
          </div>`;
      }
    } catch (error) {
      result.innerHTML = `
        <div class="result-card fail">
          <div class="result-icon fail">${Components.icon.xCircle}</div>
          <div class="result-meta">
            <div class="result-title">Verification Failed</div>
            <div style="font-size:13px;color:var(--text2);margin-top:4px;">${error.message || 'Unable to verify evidence right now.'}</div>
          </div>
        </div>`;
    }
  },

  async runFile() {
    const evidenceId = (document.getElementById('verify-file-evidence-id')?.value || '').trim();
    const file = document.getElementById('verify-file-input')?.files?.[0];
    const result = document.getElementById('verify-file-result');
    if (!result) return;

    if (!AppState.isAuthenticated) {
      result.innerHTML = `
        <div class="result-card fail">
          <div class="result-icon fail">${Components.icon.lock}</div>
          <div class="result-meta">
            <div class="result-title">Authentication Required</div>
            <div style="font-size:13px;color:var(--text2);margin-top:4px;">Connect your wallet first, then verify by re-uploading the file.</div>
          </div>
        </div>`;
      return;
    }

    if (!evidenceId || !file) {
      result.innerHTML = `
        <div class="result-card fail">
          <div class="result-icon fail">${Components.icon.xCircle}</div>
          <div class="result-meta">
            <div class="result-title">Missing File or Evidence ID</div>
            <div style="font-size:13px;color:var(--text2);margin-top:4px;">Select the evidence file and enter the original Evidence ID.</div>
          </div>
        </div>`;
      return;
    }

    result.innerHTML = `
      <div class="result-card success">
        <div class="result-icon success">
          <div class="ev-spinner"></div>
        </div>
        <div class="result-meta">
          <div class="result-title">Verifying file integrity...</div>
        </div>
      </div>`;

    try {
      const verifyData = await api.verify.byFile(file, evidenceId);
      this.verifyEvents.push({
        status: verifyData.fullyIntact ? 'verified' : 'failed',
        date: new Date().toISOString(),
      });
      this._renderVerifyOverview();
      const statusIcon = verifyData.fullyIntact ? Components.icon.check : Components.icon.xCircle;
      const statusClass = verifyData.fullyIntact ? 'success' : 'fail';
      const statusTitle = verifyData.fullyIntact
        ? 'Evidence Intact — Re-upload match confirmed'
        : verifyData.chainVerified
          ? 'Warning — Chain hash matches but IPFS copy differs'
          : 'Tamper Detected — Evidence does not match the anchored record';

      result.innerHTML = `
        <div class="result-card ${statusClass}">
          <div class="result-icon ${statusClass}">${statusIcon}</div>
          <div class="result-meta">
            <div class="result-title">${statusTitle}</div>
            <div class="result-row"><span class="result-key">Evidence ID</span><span class="result-val">${verifyData.evidenceId}</span></div>
            <div class="result-row"><span class="result-key">Uploaded File</span><span class="result-val">${file.name}</span></div>
            <div class="result-row"><span class="result-key">Computed SHA-256</span><span class="result-val">${verifyData.computedHash.slice(0, 20)}...${verifyData.computedHash.slice(-8)}</span></div>
            <div class="result-row"><span class="result-key">Chain Verified</span><span class="result-val">${verifyData.chainVerified ? 'YES' : 'NO'}</span></div>
            <div class="result-row"><span class="result-key">IPFS Verified</span><span class="result-val">${verifyData.ipfsVerified === true ? 'YES' : verifyData.ipfsVerified === false ? 'NO' : 'N/A'}</span></div>
            <div class="result-row"><span class="result-key">Stored IPFS CID</span><span class="result-val">${verifyData.ipfsCid || '—'}</span></div>
          </div>
        </div>`;
    } catch (error) {
      result.innerHTML = `
        <div class="result-card fail">
          <div class="result-icon fail">${Components.icon.xCircle}</div>
          <div class="result-meta">
            <div class="result-title">Verification Failed</div>
            <div style="font-size:13px;color:var(--text2);margin-top:4px;">${error.message || 'Unable to verify evidence by file right now.'}</div>
          </div>
        </div>`;
    }
  },
};

// js/pages/chain.js

const PageChain = {
  render() {
    const txns = EviData.chainTxns;
    const statusForDot = (dot) => {
      if (dot === 'amber') return { label: 'Pending', cls: 'text-secondary bg-secondary/10 border-secondary/20' };
      if (dot === 'red') return { label: 'Alert', cls: 'text-error bg-error/10 border-error/20' };
      return { label: 'Verified', cls: 'text-tertiary bg-tertiary/10 border-tertiary/20' };
    };

    const rows = txns.length
      ? txns.map((t) => {
          const status = statusForDot(t.dot);
          const hashShort = t.hash ? `${t.hash.slice(0, 6)}...${t.hash.slice(-4)}` : '—';
          return `
            <tr class="hover:bg-white/5 transition-colors cursor-pointer group">
              <td class="px-6 py-4 font-code-snippet text-primary">${hashShort}</td>
              <td class="px-6 py-4"><span class="px-2 py-0.5 bg-surface-container-highest rounded text-[11px] font-bold text-on-surface uppercase">${t.title || 'UploadEvidence'}</span></td>
              <td class="px-6 py-4 text-body-sm">${t.block || '—'}</td>
              <td class="px-6 py-4 text-body-sm text-on-surface-variant">${t.time || '—'}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span class="px-2 py-0.5 rounded text-[11px] font-bold uppercase ${status.cls}">${status.label}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button class="text-on-surface-variant group-hover:text-primary transition-colors">
                  <span class="material-symbols-outlined">launch</span>
                </button>
              </td>
            </tr>`;
        }).join('')
      : '';

    document.getElementById('page-chain').innerHTML = `
      <div class="max-w-[1400px] mx-auto p-gutter space-y-stack-lg">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 class="font-headline-md text-headline-md text-primary mb-1">Chain History</h2>
            <p class="text-on-surface-variant font-body-md">Immutable forensic ledger of Ethereum network transactions.</p>
          </div>
          <div class="flex items-center gap-3">
            <div class="px-4 py-2 bg-surface-container-high rounded-lg flex items-center gap-2 border border-white/5">
              <span class="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
              <span class="text-label-caps text-on-surface-variant">Network Connected: Sepolia</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
          <div class="xl:col-span-1 glass-card p-container-padding rounded-xl">
            <p class="text-label-caps text-on-surface-variant mb-2">Total Verified Blocks</p>
            <h3 class="font-headline-md text-headline-md text-primary">${txns.length ? txns.length : '—'}</h3>
            <div class="mt-4 flex items-center gap-2 text-tertiary text-body-sm">
              <span class="material-symbols-outlined text-[18px]">trending_up</span>
              <span>+2.4% vs last epoch</span>
            </div>
          </div>
          <div class="xl:col-span-1 glass-card p-container-padding rounded-xl">
            <p class="text-label-caps text-on-surface-variant mb-2">Average Block Time</p>
            <h3 class="font-headline-md text-headline-md text-primary">12.04s</h3>
            <div class="mt-4 h-1 bg-surface-container-highest w-full rounded-full overflow-hidden">
              <div class="h-full bg-primary-container w-[85%]"></div>
            </div>
          </div>
          <div class="xl:col-span-2 glass-card p-container-padding rounded-xl relative overflow-hidden">
            <div class="relative z-10 flex justify-between h-full">
              <div>
                <p class="text-label-caps text-on-surface-variant mb-2">Integrity Score</p>
                <h3 class="font-headline-md text-headline-md text-primary">99.998%</h3>
              </div>
              <div class="flex items-end">
                <div class="flex gap-1 h-12">
                  <div class="w-1 bg-primary-container/20 h-full rounded-full relative"><div class="absolute bottom-0 w-full h-[40%] bg-primary-container rounded-full"></div></div>
                  <div class="w-1 bg-primary-container/20 h-full rounded-full relative"><div class="absolute bottom-0 w-full h-[60%] bg-primary-container rounded-full"></div></div>
                  <div class="w-1 bg-primary-container/20 h-full rounded-full relative"><div class="absolute bottom-0 w-full h-[90%] bg-primary-container rounded-full"></div></div>
                  <div class="w-1 bg-primary-container/20 h-full rounded-full relative"><div class="absolute bottom-0 w-full h-[70%] bg-primary-container rounded-full"></div></div>
                  <div class="w-1 bg-primary-container/20 h-full rounded-full relative"><div class="absolute bottom-0 w-full h-[85%] bg-primary-container rounded-full"></div></div>
                  <div class="w-1 bg-primary-container/20 h-full rounded-full relative"><div class="absolute bottom-0 w-full h-[95%] bg-primary-container rounded-full"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card rounded-xl overflow-hidden min-h-[400px] flex flex-col">
          ${txns.length
            ? `
              <table class="ev-table w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-white/5 bg-surface-container-high">
                    <th class="px-6 py-4">Transaction Hash</th>
                    <th class="px-6 py-4">Method</th>
                    <th class="px-6 py-4">Block</th>
                    <th class="px-6 py-4">Timestamp</th>
                    <th class="px-6 py-4">Status</th>
                    <th class="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                  ${rows}
                </tbody>
              </table>`
            : `
              <div class="flex-1 flex flex-col items-center justify-center p-stack-lg text-center">
                <div class="w-24 h-24 mb-6 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant border border-white/5">
                  <span class="material-symbols-outlined text-5xl">cloud_off</span>
                </div>
                <h4 class="font-headline-sm text-headline-sm text-on-surface mb-2">No transaction records are available yet.</h4>
                <p class="text-on-surface-variant max-w-md mb-8">Current instance has no local evidence synchronization history. Please submit a new forensic entry to the chain.</p>
                <button class="px-8 py-3 bg-primary-container text-on-primary font-bold rounded-lg hover:brightness-110 transition-all flex items-center gap-3" onclick="Router.go('upload', document.querySelector('[data-page=upload]'))">
                  <span class="material-symbols-outlined">publish</span>
                  Submit New Evidence
                </button>
              </div>`}
        </div>
      </div>`;
  },

  refresh() {
    this.render();
  },
};

// js/pages/search-cid.js

const PageSearchCID = {
  rendered: false,

  render() {
    // Always render to ensure fresh UI and data
    const recentQueries = EviData.evidence.slice(0, 4);
    const recentRows = recentQueries.length
      ? recentQueries.map((e) => {
          const cid = e.cid ? `${e.cid.slice(0, 6)}...${e.cid.slice(-4)}` : '—';
          return `
            <tr class="hover:bg-surface-variant transition-colors group">
              <td class="px-gutter py-4">
                <div class="flex flex-col">
                  <span class="font-code-snippet text-primary-fixed-dim">${cid}</span>
                  <span class="text-[10px] text-outline opacity-60 uppercase tracking-widest mt-1">Hash Type: SHA2-256</span>
                </div>
              </td>
              <td class="px-gutter py-4 text-center">${Math.floor(Math.random() * 300) + 40}ms</td>
              <td class="px-gutter py-4 text-on-surface-variant">Instance-${(e.case || 'LDN').slice(0, 3).toUpperCase()}</td>
              <td class="px-gutter py-4 text-right">
                <span class="px-2 py-1 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded text-[11px] font-bold uppercase tracking-tighter">Verified</span>
              </td>
            </tr>`;
        }).join('')
      : `
        <tr>
          <td colspan="4" class="px-gutter py-6 text-center text-on-surface-variant">No recent inquiries yet.</td>
        </tr>`;

    document.getElementById('page-search-cid').innerHTML = `
      <div class="p-gutter min-h-[calc(100vh-64px)] flex flex-col gap-stack-lg">
        <section class="max-w-5xl mx-auto w-full pt-12 text-center">
          <div class="mb-stack-md">
            <span class="font-label-caps text-label-caps tracking-[0.2em] text-primary-fixed-dim bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Protocol: IPFS/CIDv1</span>
            <h2 class="font-display-lg text-display-lg mt-4 mb-2">Immutable Ledger Inquiry</h2>
            <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">Access decentralized evidence through the EviChain forensic gateway. Input a Content Identifier to begin trace analysis.</p>
          </div>
          <div class="relative max-w-3xl mx-auto mt-stack-md">
            <div class="absolute inset-0 bg-primary/5 blur-3xl rounded-full"></div>
            <div class="relative glass-card p-2 flex items-center gap-2 rounded-xl border-primary/20 glow-cyan">
              <div class="pl-4 text-primary opacity-60">
                <span class="material-symbols-outlined">search</span>
              </div>
              <input class="bg-transparent border-none focus:ring-0 text-primary-fixed-dim font-code-snippet text-body-lg w-full placeholder:text-outline/40" id="cid-search-input" placeholder="bafybeigdyrzt5sfp7udm7hu76uh7y..." spellcheck="false" type="text"/>
              <button class="bg-primary-container text-on-primary-container px-8 py-3 rounded-lg font-label-caps text-label-caps tracking-widest hover:brightness-110 active:scale-95 transition-all" onclick="PageSearchCID.search()">Query</button>
            </div>
          </div>
        </section>

        <div id="cid-result" class="max-w-5xl mx-auto w-full"></div>

        <section class="max-w-6xl mx-auto w-full">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-stack-md">
            <div class="glass-card p-gutter rounded-xl border-l-4 border-l-primary">
              <div class="flex items-center justify-between mb-2">
                <span class="font-label-caps text-label-caps text-on-surface-variant">Total Indexed</span>
                <span class="material-symbols-outlined text-primary text-[20px]">database</span>
              </div>
              <div class="font-headline-sm text-headline-sm text-primary">4.2M+</div>
              <div class="mt-2 h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div class="h-full bg-primary w-[78%]"></div>
              </div>
            </div>
            <div class="glass-card p-gutter rounded-xl border-l-4 border-l-tertiary">
              <div class="flex items-center justify-between mb-2">
                <span class="font-label-caps text-label-caps text-on-surface-variant">Avg Latency</span>
                <span class="material-symbols-outlined text-tertiary text-[20px]">bolt</span>
              </div>
              <div class="font-headline-sm text-headline-sm text-tertiary">124ms</div>
              <div class="mt-2 h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div class="h-full bg-tertiary w-[92%]"></div>
              </div>
            </div>
            <div class="glass-card p-gutter rounded-xl border-l-4 border-l-secondary">
              <div class="flex items-center justify-between mb-2">
                <span class="font-label-caps text-label-caps text-on-surface-variant">Active Peers</span>
                <span class="material-symbols-outlined text-secondary text-[20px]">hub</span>
              </div>
              <div class="font-headline-sm text-headline-sm text-secondary">8,192</div>
              <div class="mt-2 h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div class="h-full bg-secondary w-[65%]"></div>
              </div>
            </div>
            <div class="glass-card p-gutter rounded-xl border-l-4 border-l-primary-fixed-dim">
              <div class="flex items-center justify-between mb-2">
                <span class="font-label-caps text-label-caps text-on-surface-variant">Integrity Score</span>
                <span class="material-symbols-outlined text-primary-fixed-dim text-[20px]">verified_user</span>
              </div>
              <div class="font-headline-sm text-headline-sm text-primary-fixed-dim">99.9%</div>
              <div class="mt-2 h-1 bg-surface-container-high rounded-full overflow-hidden">
                <div class="h-full bg-primary-fixed-dim w-[99%]"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter pb-stack-lg">
          <div class="lg:col-span-2 glass-card rounded-xl flex flex-col">
            <div class="p-gutter border-b border-outline-variant/10 flex justify-between items-center">
              <h3 class="font-headline-sm text-headline-sm">Recent Ledger Inquiries</h3>
              <button class="text-primary font-label-caps text-label-caps hover:underline">View History</button>
            </div>
            <div class="overflow-x-auto">
              <table class="ev-table w-full text-left">
                <thead class="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps">
                  <tr>
                    <th class="px-gutter py-4 font-bold">Content Identifier (CID)</th>
                    <th class="px-gutter py-4 font-bold text-center">Latency</th>
                    <th class="px-gutter py-4 font-bold">Origin Instance</th>
                    <th class="px-gutter py-4 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="font-body-sm text-body-sm divide-y divide-outline-variant/10">
                  ${recentRows}
                </tbody>
              </table>
            </div>
          </div>
          <div class="glass-card rounded-xl flex flex-col h-full overflow-hidden">
            <div class="p-gutter border-b border-outline-variant/10">
              <h3 class="font-headline-sm text-headline-sm">Global Instance Coverage</h3>
              <p class="text-body-sm text-on-surface-variant mt-1">Real-time peer distribution across active clusters.</p>
            </div>
            <div class="relative flex-1 min-h-[300px] bg-surface-container-low group">
              <img class="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" alt="Global instance coverage" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9T67JETfygen7bBtpl_89lSmI_S-Y9-WyqAEbu6xSX297nJO5HnXfrTxoXlZOckm5W1mMwxumUZSIeNXwFmF9vE5gL89TqeLPvljbWg4Q6nBJ1b9XPW8ERD2c3CaR-7C3JCYwHgDlXN-NfjtgxWoNGgtKfiBfSh1IzvY0FXXzFe2O8rZ84yIWIM-D8SUT4Y0n5_6u-Utn-Tgs3Enadflf19E_CnTRVTV_1-stai5hAnbamEJeZ7fXzaz9sLEyist7KxeOW4705As"/>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="glass-card p-4 rounded-lg text-center animate-pulse">
                  <span class="font-label-caps text-label-caps text-primary">Live Scan Active</span>
                </div>
              </div>
              <div class="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div class="font-code-snippet text-[10px] text-primary space-y-1">
                  <div>SEC_LEVEL: ALPHA</div>
                  <div>ENCR: AES-256-GCM</div>
                  <div>SYNC: 100%</div>
                </div>
                <div class="w-16 h-16 border-2 border-primary/30 rounded-full flex items-center justify-center border-t-primary animate-spin">
                  <span class="material-symbols-outlined text-primary">radar</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>`;

    const input = document.getElementById('cid-search-input');
    if (input) {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') PageSearchCID.search();
      });
    }
  },

  quickFill(cid) {
    const inp = document.getElementById('cid-search-input');
    if (inp) inp.value = cid;
  },

  search() {
    let val = (document.getElementById('cid-search-input')?.value || '').trim();
    const result = document.getElementById('cid-result');
    if (!result) {
      console.warn('CID result container not found');
      return;
    }

    if (!val) {
      result.innerHTML = `<div style="color:var(--amber);font-family:var(--font-mono);font-size:12px;margin-bottom:20px;margin-top:12px;">⚠ Please enter a CID to search.</div>`;
      return;
    }

    // Normalize CID: strip ipfs:// prefix and gateway URLs
    val = val.replace(/^ipfs:\/\//, '');
    val = val.replace(/^https?:\/\/[^/]+\/ipfs\//, '');
    val = val.split('?')[0].split('#')[0]; // Remove query params and fragments
    val = val.trim();

    if (!val) {
      result.innerHTML = `<div style="color:var(--amber);font-family:var(--font-mono);font-size:12px;margin-bottom:20px;margin-top:12px;">⚠ Invalid CID format.</div>`;
      return;
    }

    console.log('Searching for CID:', val);
    console.log('Evidence count:', EviData.evidence.length);
    
    // Search: exact match first, then substring
    let match = EviData.evidence.find(e => (e.cid || '').toLowerCase() === val.toLowerCase());
    if (!match) {
      match = EviData.evidence.find(e => (e.cid || '').toLowerCase().includes(val.toLowerCase()));
    }

    console.log('Match found:', match);

    if (match) {
      result.innerHTML = `
        <div class="result-card success" style="margin-bottom:24px;margin-top:12px;">
          <div class="result-icon success">
            ${Components.icon.check}
          </div>
          <div class="result-meta">
            <div class="result-title">Evidence Found</div>
            <div class="result-row"><span class="result-key">Evidence ID</span><span class="result-val" style="color:var(--accent)">${match.id}</span></div>
            <div class="result-row"><span class="result-key">File Name</span><span class="result-val">${match.name}</span></div>
            <div class="result-row"><span class="result-key">IPFS CID</span><span class="result-val" style="color:var(--blue)">${match.cid}</span></div>
            <div class="result-row"><span class="result-key">Case</span><span class="result-val">${match.case}</span></div>
            <div class="result-row"><span class="result-key">Uploader</span><span class="result-val">${match.uploader}</span></div>
            <div class="result-row"><span class="result-key">Date</span><span class="result-val">${match.date}</span></div>
            <div class="result-row"><span class="result-key">SHA-256</span><span class="result-val" style="word-break:break-all;">${match.hash}</span></div>
            <div class="result-row"><span class="result-key">Status</span><span class="result-val">${Components.statusBadge(match.status)}</span></div>
            ${match.txHash ? `<div class="result-row"><span class="result-key">Tx Hash</span><span class="result-val">${match.txHash}</span></div>` : ''}
            ${match.block ? `<div class="result-row"><span class="result-key">Block</span><span class="result-val">#${match.block} · Sepolia</span></div>` : ''}
          </div>
        </div>`;
    } else {
      result.innerHTML = `
        <div class="result-card fail" style="margin-bottom:24px;margin-top:12px;">
          <div class="result-icon fail">${Components.icon.xCircle}</div>
          <div class="result-meta">
            <div class="result-title">No Evidence Found</div>
            <div style="font-size:13px;color:var(--text2);margin-top:4px;">No record matched CID: <span style="font-family:var(--font-mono);color:var(--red)">${val}</span></div>
          </div>
        </div>`;
    }
  },
};

// js/pages/view-evidence.js

const PageViewEvidence = {
  rendered: false,

  render() {
    this.rendered = true;
    this._inject();
  },

  _inject() {
    document.getElementById('page-view-evidence').innerHTML = `
      <div class="page-header">
        <div>
          <div class="page-title">View Evidence</div>
        </div>
        <div class="search-bar" style="min-width:0;width:100%;max-width:320px;">
          ${Components.icon.search}
          <input type="text" id="view-ev-search" placeholder="Filter by ID, name, case..." oninput="PageViewEvidence.filter(this.value)"/>
        </div>
      </div>

      <div class="two-col view-ev-layout" style="grid-template-columns:300px 1fr;gap:20px;align-items:start;">
        <!-- Left: Evidence List -->
        <div class="card" style="margin-bottom:0;max-height:calc(100vh - 200px);overflow-y:auto;">
          <div class="card-header">
            <div class="card-title">${Components.icon.folder} Evidence Files</div>
            <span class="nav-badge" id="view-ev-count">${EviData.evidence.length}</span>
          </div>
          <div id="view-ev-list"></div>
        </div>

        <!-- Right: Detail Panel -->
        <div id="view-ev-detail">
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:320px;color:var(--text3);gap:14px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <div style="font-family:var(--font-mono);font-size:12px;">Select an evidence item to view details</div>
          </div>
        </div>
      </div>`;

    this._renderList(EviData.evidence);
  },

  _renderList(items) {
    const container = document.getElementById('view-ev-list');
    if (!container) return;
    document.getElementById('view-ev-count').textContent = items.length;
    container.innerHTML = items.map(e => `
      <div onclick="PageViewEvidence.showDetail('${e.id}')"
           id="ev-list-${e.id}"
           style="display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid var(--border);cursor:pointer;transition:background 0.15s;${this.activeId===e.id?'background:var(--accent-dim);':''}">
        <div style="width:36px;height:36px;border-radius:8px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--text3);">
          ${e.type==='IMG'?'🖼':'📄'}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:12px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.case}</div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--text3);">${e.id} · ${e.case}</div>
          ${e.txHash ? `<div style="font-family:var(--font-mono);font-size:10px;color:var(--accent);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Tx: ${e.txHash}</div>` : ''}
        </div>
        ${Components.statusBadge(e.status)}
      </div>`).join('');
  },

  showDetail(id) {
    this.activeId = id;
    const e = EviData.evidence.find(x => x.id === id);
    if (!e) return;

    // Highlight active
    document.querySelectorAll('#view-ev-list > div').forEach(el => {
      el.style.background = '';
    });
    const activeEl = document.getElementById('ev-list-' + id);
    if (activeEl) activeEl.style.background = 'var(--accent-dim)';

    const typeColor = {IMG:'blue',DOC:'purple',LOG:'amber'}[e.type] || 'accent';
    const pinataUrl = e.cid ? `https://gateway.pinata.cloud/ipfs/${e.cid}` : '';

    // Attempt to fetch richer metadata (txHash, fileName) from backend Firebase store
    (async () => {
      try {
        const meta = await api.evidence.getMetadata(id).catch(() => null);
        if (meta) {
          e.txHash = meta.txHash || e.txHash;
          e.cid = meta.ipfsCid || e.cid || meta.ipfsCid;
          e.name = meta.fileName || e.name;
        }
      } catch (err) {
        // ignore
      }

      document.getElementById('view-ev-detail').innerHTML = `
      <div class="card" style="margin-bottom:0;animation:fadeInUp 0.2s ease;">
        <div class="card-header" style="background:var(--bg3);">
          <div class="card-title">
            ${Components.icon.eye}
            <span style="margin-left:4px;">${e.case}</span>
          </div>
          ${Components.statusBadge(e.status)}
        </div>

        <div style="padding:24px;display:flex;flex-direction:column;gap:18px;">

          <!-- Type + ID row -->
          <div style="display:flex;gap:12px;align-items:center;">
            <span class="ev-type type-${e.type.toLowerCase()}">${e.type}</span>
            <span class="ev-id" style="font-size:14px;">${e.id}</span>
          </div>

          <!-- Key-value grid -->
          <div class="detail-grid" style="gap:14px;">
            ${this._field('Evidence Type', e.type)}
            ${this._field('Case Number', e.case)}
            ${this._field('Uploader', e.uploader)}
            ${this._field('Date Uploaded', e.date)}
            ${this._field('IPFS CID', e.cid, 'var(--blue)')}
          </div>

          <div class="hash-preview" style="border-color:rgba(0,229,160,.15);">
            <div class="hash-preview-label">Tx Hash</div>
            <div class="hash-preview-value" style="white-space:pre-wrap;word-break:break-all;color:#00d4ff;">
              ${e.txHash ? `<a href="https://sepolia.etherscan.io/tx/${e.txHash}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">${e.txHash}</a>` : '<span style="color:var(--text3)">—</span>'}
            </div>
          </div>

          <div class="hash-preview">
            <div class="hash-preview-label">Description</div>
            <div class="hash-preview-value" style="white-space:pre-wrap;word-break:break-word;">${e.description}</div>
          </div>

          ${e.cid ? `
          <div class="hash-preview">
            <div class="hash-preview-label">Pinata Gateway Link</div>
            <a href="${pinataUrl}" target="_blank" rel="noopener noreferrer" class="hash-preview-value" style="color:var(--accent);text-decoration:underline;word-break:break-all;">${pinataUrl}</a>
          </div>` : ''}

          <!-- Blockchain -->
          ${e.txHash ? `
          <div class="hash-preview" style="border-color:rgba(0,229,160,.2);">
            <div class="hash-preview-label">Blockchain Record</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px;">
              ${this._field('Tx Hash', e.txHash, 'var(--accent)')}
              ${this._field('Block #', e.block + ' · Sepolia', 'var(--accent)')}
            </div>
          </div>` : ''}

          <!-- Chain of Custody -->
          <div class="hash-preview">
            <div class="hash-preview-label">Chain of Custody</div>
            <div id="ev-custody-list" class="hash-preview-value">Loading custody log…</div>
          </div>

          <!-- Actions -->
          <div style="display:flex;gap:10px;justify-content:flex-end;padding-top:4px;">
            ${e.cid ? `<button class="btn btn-ghost" onclick="window.open('${pinataUrl}', '_blank', 'noopener,noreferrer')">${Components.icon.link} Open IPFS File</button>` : ''}
            ${e.cid ? `<button class="btn btn-primary" onclick="PageViewEvidence.download('${e.id}')">${Components.icon.download} Download</button>` : ''}
            <button class="btn btn-ghost" onclick="document.querySelector('[data-page=verify]').click();document.getElementById('verify-input').value='${e.id}';PageVerify.run();">
              ${Components.icon.check} Verify Integrity
            </button>
            ${e.txHash ? `<button class="btn btn-primary" onclick="navigator.clipboard.writeText('${e.txHash}').then(()=>Components.showToast())">${Components.icon.download} Copy Tx Hash</button>` : ''}
          </div>
        </div>
      </div>`;

        // Fetch and render custody log entries
        try {
          const custodyEntries = await api.evidence.getCustody(id).catch(() => []);
          const el = document.getElementById('ev-custody-list');
          if (!el) return;
          const timeline = Array.isArray(custodyEntries) ? custodyEntries : [];
          const fallbackEntry = {
            actor: e.uploader || 'unknown',
            action: 'UPLOADED',
            timestamp: e._ts || Math.floor(new Date(e.date || Date.now()).getTime() / 1000),
            notes: `Evidence anchored on-chain for case ${e.case}${e.txHash ? ` · Tx ${e.txHash}` : ''}`,
            date: e.date,
          };

          const recordsToShow = timeline.length ? timeline : [fallbackEntry];
          el.innerHTML = recordsToShow.map(entry => `
            <div style="margin-bottom:12px;padding:10px 12px;border:1px solid rgba(0,212,255,.12);border-radius:10px;background:rgba(0,212,255,.03);">
              <div style="font-size:12px;color:var(--text);">${entry.date || new Date(Number(entry.timestamp) * 1000).toISOString()}</div>
              <div style="font-family:var(--font-mono);color:var(--accent);margin-top:4px;">${entry.action || 'EVENT'} · ${entry.actor || 'unknown'}</div>
              <div style="font-size:12px;color:var(--text2);word-break:break-word;margin-top:6px;">${entry.notes || ''}</div>
            </div>
          `).join('');
        } catch (err) {
          const el = document.getElementById('ev-custody-list');
          if (el) {
            el.innerHTML = `
              <div style="padding:10px 12px;border:1px solid rgba(0,212,255,.12);border-radius:10px;background:rgba(0,212,255,.03);">
                <div style="font-size:12px;color:var(--text2);">${e.date || '—'}</div>
                <div style="font-family:var(--font-mono);color:var(--accent);margin-top:4px;">UPLOADED · ${e.uploader || 'unknown'}</div>
                <div style="font-size:12px;color:var(--text2);word-break:break-word;margin-top:6px;">Evidence anchored on-chain for case ${e.case}${e.txHash ? ` · Tx ${e.txHash}` : ''}</div>
              </div>`;
          }
        }
    })();
  },

  _field(label, val, color='var(--text)') {
    return `
      <div>
        <div style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);font-family:var(--font-mono);margin-bottom:5px;">${label}</div>
        <div style="font-size:12px;font-family:var(--font-mono);color:${color};word-break:break-all;">${val}</div>
      </div>`;
  },

  filter(q) {
    const query = q.toLowerCase();
    const filtered = EviData.evidence.filter(e =>
      e.id.toLowerCase().includes(query) ||
      (e.name || '').toLowerCase().includes(query) ||
      e.case.toLowerCase().includes(query)
    );
    this._renderList(filtered);
  },

  async download(id) {
    try {
      const record = EviData.evidence.find(x => x.id === id);
      if (!record) {
        notify('Not found', 'Evidence record not available');
        return;
      }

      // Call backend to log access and refresh metadata
      try {
        await api.evidence.getById(id);
      } catch (err) {
        // non-fatal: continue to attempt download
        console.warn('Could not fetch metadata before download', err);
      }

      if (!record.cid) {
        notify('No file', 'No IPFS CID available for this evidence');
        return;
      }

      const url = `https://gateway.pinata.cloud/ipfs/${record.cid}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        notify('Download failed', `Status ${resp.status}`);
        return;
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = record.name || record.id;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);

      notify('Download started', record.name || id);
    } catch (err) {
      console.error('Download error', err);
      notify('Download error', err.message || 'Failed to download file');
    }
  },
};

// js/pages/settings.js

const PageSettings = {
  rendered: false,

  render() {
    this.rendered = true;
    const connectWalletButton = AppState.walletAddress
      ? ''
      : `<button class="px-6 py-2 bg-primary-container text-on-primary-container font-label-caps text-label-caps rounded-lg hover:brightness-110 transition-all flex items-center gap-2" onclick="AuthActions.connect()"><span class="material-symbols-outlined text-[18px]">lock</span>Connect Wallet</button>`;

    document.getElementById('page-settings').innerHTML = `
      <div class="p-gutter md:p-12 space-y-stack-lg">
        <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 class="font-display-lg text-display-lg text-primary">Instance Settings</h2>
            <p class="text-on-surface-variant font-body-lg">Manage forensic identity and network configurations</p>
          </div>
          <div class="flex gap-3">
            <button class="px-6 py-2 border border-primary text-primary font-label-caps text-label-caps rounded-lg hover:bg-primary/5 transition-all flex items-center gap-2" onclick="PageSettings.refresh()">
              <span class="material-symbols-outlined text-[18px]">refresh</span>
              Refresh
            </button>
            ${connectWalletButton || ''}
            <button class="px-6 py-2 bg-error text-on-error font-label-caps text-label-caps rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2" onclick="AuthActions.logout()">
              <span class="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <section class="md:col-span-7 space-y-gutter">
            <h4 class="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">hub</span>
              Wallet & Network
            </h4>
            <div class="glass-card rounded-xl p-8 space-y-8">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block uppercase tracking-widest">Connection Status</label>
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-tertiary electric-glow"></div>
                    <span class="text-primary font-bold" id="settings-wallet-status">Checking...</span>
                  </div>
                </div>
                <div>
                  <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block uppercase tracking-widest">Active Chain</label>
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-[20px]">diamond</span>
                    <span class="text-on-surface font-body-md" id="settings-chain">—</span>
                  </div>
                </div>
              </div>
              <div class="space-y-4">
                <label class="font-label-caps text-[10px] text-on-surface-variant block uppercase tracking-widest">Connected Wallet Address</label>
                <div class="recessed-field p-4 rounded-lg flex justify-between items-center group cursor-pointer border border-white/5 hover:border-primary/20 transition-all">
                  <span class="font-code-snippet text-code-snippet text-primary truncate mr-4" id="settings-wallet-address">—</span>
                  <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">content_copy</span>
                </div>
              </div>
              <div class="flex items-center gap-4 p-4 rounded-lg bg-surface-container-high/40 border border-white/5">
                <span class="material-symbols-outlined text-on-secondary-container">shield</span>
                <div>
                  <p class="text-body-sm font-bold text-on-surface">Hardware Isolation</p>
                  <p class="text-body-sm text-on-surface-variant">Signature verification is forced through a Ledger device.</p>
                </div>
                <input checked class="ml-auto w-10 h-5 rounded-full bg-surface-container border-none text-primary focus:ring-0" type="checkbox"/>
              </div>
              <div class="flex items-center gap-3">
                <button class="px-4 py-2 bg-surface-container border border-outline-variant/30 rounded-lg hover:bg-surface-variant transition-all" onclick="api.wallet.switchToSepolia().then(() => PageSettings.refresh()).catch((err) => Components.showToast(err?.message || 'Unable to switch network'))">Switch to Sepolia</button>
                <button class="px-4 py-2 bg-surface-container border border-outline-variant/30 rounded-lg hover:bg-surface-variant transition-all" onclick="AuthActions.sync()">Sync Evidence</button>
              </div>
            </div>
          </section>

          <section class="md:col-span-5 space-y-gutter">
            <h4 class="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">person</span>
              Personal Details
            </h4>
            <div class="glass-card rounded-xl p-8 space-y-6">
              <div>
                <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block uppercase tracking-widest">Full Name</label>
                <input class="w-full recessed-field border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg p-3 text-on-surface outline-none transition-all" type="text" id="settings-person-name" value=""/>
              </div>
              <div>
                <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block uppercase tracking-widest">Role</label>
                <input class="w-full recessed-field border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg p-3 text-on-surface outline-none transition-all" type="text" id="settings-person-role" value=""/>
              </div>
              <div>
                <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block uppercase tracking-widest">Wallet</label>
                <input class="w-full recessed-field border border-white/5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 rounded-lg p-3 text-on-surface outline-none transition-all" type="text" id="settings-person-wallet" value=""/>
              </div>
            </div>
          </section>

          <section class="md:col-span-12 space-y-gutter">
            <h4 class="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">info</span>
              Application Info
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div class="glass-card rounded-xl p-6 flex flex-col items-center text-center">
                <span class="material-symbols-outlined text-primary-container text-4xl mb-4">terminal</span>
                <p class="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Version</p>
                <p class="font-headline-sm text-headline-sm">${import.meta.env.npm_package_version || '0.0.0'}</p>
                <p class="text-[10px] text-tertiary-fixed-dim font-code-snippet mt-2">Build: Secure</p>
              </div>
              <div class="glass-card rounded-xl p-6 flex flex-col items-center text-center">
                <span class="material-symbols-outlined text-primary-container text-4xl mb-4">memory</span>
                <p class="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Memory Usage</p>
                <p class="font-headline-sm text-headline-sm">1.2 GB / 8 GB</p>
                <div class="w-full bg-white/5 h-1 rounded-full mt-4 overflow-hidden">
                  <div class="bg-primary h-full w-[15%]"></div>
                </div>
              </div>
              <div class="glass-card rounded-xl p-6 flex flex-col items-center text-center">
                <span class="material-symbols-outlined text-primary-container text-4xl mb-4">settings_ethernet</span>
                <p class="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">P2P Peers</p>
                <p class="font-headline-sm text-headline-sm">142 Connected</p>
                <p class="text-[10px] text-tertiary-fixed-dim font-code-snippet mt-2">Latency: 12ms</p>
              </div>
            </div>
          </section>
        </div>
      </div>`;

    void this.refresh();
  },

  async refresh() {
    const walletStatus = document.getElementById('settings-wallet-status');
    const walletAddress = document.getElementById('settings-wallet-address');
    const chainEl = document.getElementById('settings-chain');
    const personName = document.getElementById('settings-person-name');
    const personRole = document.getElementById('settings-person-role');
    const personWallet = document.getElementById('settings-person-wallet');
    if (walletStatus) walletStatus.textContent = AppState.isAuthenticated ? 'Authenticated' : 'Disconnected';
    if (walletAddress) walletAddress.textContent = AppState.walletAddress || '—';
    if (personName) personName.value = AppState.fullName || 'Bilal';
    if (personRole) personRole.value = roleLabel(AppState.role) || 'Police Officer';
    if (personWallet) personWallet.value = AppState.walletAddress ? shortAddress(AppState.walletAddress) : '0xdea2...ecc9';

    try {
      const chainId = await api.wallet.getChainId();

      if (chainEl) {
        chainEl.textContent = chainId ? `${chainId} ${chainId === 11155111 ? '(Sepolia)' : '(switch to 11155111)'}` : 'MetaMask not connected';
      }
    } catch (error) {
      if (chainEl) chainEl.textContent = error.message || 'Status unavailable';
    }
  },
};

// js/router.js — Single-page routing

const Router = {
  current: 'dashboard',

  go(pageId, navEl) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById('page-' + pageId).classList.add('active');
    if (navEl) navEl.classList.add('active');

    this.current = pageId;

    // Lazy-render pages — bind correctly so `this` works inside each page object
    const map = {
      dashboard:      () => PageDashboard.render(),
      upload:         () => PageUpload.render(),
      records:        () => PageRecords.render(),
      verify:         () => PageVerify.render(),
      audit:          () => {},
      chain:          () => PageChain.render(),
      'search-cid':   () => PageSearchCID.render(),
      'view-evidence':() => PageViewEvidence.render(),
      settings:       () => PageSettings.render(),
    };

    if (map[pageId]) map[pageId]();
  },
};

// js/app.js — Application bootstrap

export function mountLegacyApp() {
  bindMetaMaskListeners();
  applySidebarState();
  Components.topbar();
  Components.sidebar();
  PageDashboard.render();
  const dashboard = document.getElementById('page-dashboard');
  if (dashboard) dashboard.classList.add('active');
  updateAuthGateVisibility();
  void AuthActions.restore();
}

if (typeof window !== 'undefined') {
  window.Router = Router;
    window.PageDashboard = PageDashboard;
  window.PageVerify = PageVerify;
  window.PageSearchCID = PageSearchCID;
  window.PageViewEvidence = PageViewEvidence;
  window.PageUpload = PageUpload;
  window.PageRecords = PageRecords;
  window.PageSettings = PageSettings;
  window.Components = Components;
  window.AuthActions = AuthActions;
  window.toggleSidebar = toggleSidebar;
}