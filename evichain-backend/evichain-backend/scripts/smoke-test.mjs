import { Wallet } from 'ethers';

const base = 'http://localhost:5000/api';
const results = [];

async function readJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function runStep(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail });
    return detail;
  } catch (error) {
    results.push({ name, ok: false, detail: error.message });
    return null;
  }
}

let token = '';
const wallet = Wallet.createRandom();

await runStep('health', async () => {
  const res = await fetch(`${base}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return `HTTP ${res.status}`;
});

const message = await runStep('auth_nonce', async () => {
  const res = await fetch(`${base}/auth/nonce`);
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  if (!json?.data?.message) throw new Error('Nonce message missing');
  return 'nonce issued';
});

await runStep('auth_login', async () => {
  if (!message) throw new Error('Skipped because nonce failed');
  const signature = await wallet.signMessage(message);
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress: wallet.address,
      signature,
      message,
    }),
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  token = json?.data?.token || '';
  if (!token) throw new Error('Token missing in login response');
  return `HTTP ${res.status}`;
});

await runStep('auth_me', async () => {
  if (!token) throw new Error('Skipped because login failed');
  const res = await fetch(`${base}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json?.data?.walletAddress || `HTTP ${res.status}`;
});

await runStep('evidence_list', async () => {
  if (!token) throw new Error('Skipped because login failed');
  const res = await fetch(`${base}/evidence?offset=0&limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return `records=${json?.data?.records?.length ?? 0}`;
});

await runStep('cases_summary', async () => {
  if (!token) throw new Error('Skipped because login failed');
  const res = await fetch(`${base}/cases/CASE-SMOKE-001/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return `count=${json?.data?.evidenceCount ?? 0}`;
});

await runStep('verify_hash', async () => {
  if (!token) throw new Error('Skipped because login failed');
  const res = await fetch(`${base}/verify/hash`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      evidenceId: 'EV-SMOKE-0001',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    }),
  });
  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return `isValid=${json?.data?.isValid}`;
});

await runStep('submit_evidence', async () => {
  if (!token) throw new Error('Skipped because login failed');
  const form = new FormData();
  form.append('file', new Blob(['smoke test evidence'], { type: 'text/plain' }), 'smoke.txt');
  form.append('caseId', 'CASE-SMOKE-001');
  form.append('description', 'smoke test submission');

  const res = await fetch(`${base}/evidence/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const json = await readJsonSafe(res);
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json?.data?.evidenceId || `HTTP ${res.status}`;
});

console.log(JSON.stringify(results, null, 2));
