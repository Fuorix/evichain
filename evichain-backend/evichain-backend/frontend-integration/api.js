/**
 * EviChain Frontend API Service
 * ─────────────────────────────
 * Drop this file into your React project at:
 *   evichain-react/src/services/api.js
 *
 * All backend communication goes through this module.
 * Import and use in your React components like:
 *
 *   import api from '../services/api';
 *   const result = await api.evidence.submit(formData);
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ─── Token Storage ────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('evichain_token');
}

function setToken(token) {
  localStorage.setItem('evichain_token', token);
}

function clearToken() {
  localStorage.removeItem('evichain_token');
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.json
      ? JSON.stringify(options.json)
      : options.body,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data   = data;
    throw error;
  }

  return data;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

const auth = {
  /**
   * Get a nonce/challenge message to sign with MetaMask.
   * @returns {Promise<{ message: string }>}
   */
  async getNonce() {
    const res = await request('/auth/nonce');
    return res.data;
  },

  /**
   * Login with wallet signature.
   * @param {string} walletAddress
   * @param {string} signature     Result of eth_sign / personal_sign
   * @param {string} message       The message that was signed
   * @returns {Promise<{ token: string, walletAddress: string }>}
   */
  async login(walletAddress, signature, message) {
    const res = await request('/auth/login', {
      method: 'POST',
      json: { walletAddress, signature, message },
    });
    if (res.data?.token) setToken(res.data.token);
    return res.data;
  },

  /**
   * Get the currently authenticated user.
   * @returns {Promise<{ walletAddress: string }>}
   */
  async getMe() {
    const res = await request('/auth/me');
    return res.data;
  },

  logout() {
    clearToken();
  },

  isLoggedIn() {
    return !!getToken();
  },
};

// ─── Evidence API ─────────────────────────────────────────────────────────────

const evidence = {
  /**
   * Upload a file as evidence and anchor it on the blockchain.
   * @param {File}   file
   * @param {string} caseId
   * @param {string} description
   * @returns {Promise<EvidenceRecord>}
   */
  async submit(file, caseId, description = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    formData.append('description', description);

    const token = getToken();
    const response = await fetch(`${BASE_URL}/evidence/submit`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || 'Upload failed');
      error.status = response.status;
      throw error;
    }
    return data.data;
  },

  /**
   * Get all evidence (paginated).
   * @param {number} offset
   * @param {number} limit
   * @returns {Promise<{ records: EvidenceRecord[], pagination: object }>}
   */
  async getAll(offset = 0, limit = 20) {
    const res = await request(`/evidence?offset=${offset}&limit=${limit}`);
    return res.data;
  },

  /**
   * Get a single evidence record by ID.
   * Also logs an on-chain ACCESS event.
   * @param {string} evidenceId
   * @returns {Promise<EvidenceRecord>}
   */
  async getById(evidenceId) {
    const res = await request(`/evidence/${evidenceId}`);
    return res.data;
  },

  /**
   * Get all evidence for a specific case.
   * @param {string} caseId
   * @returns {Promise<EvidenceRecord[]>}
   */
  async getByCase(caseId) {
    const res = await request(`/evidence/case/${encodeURIComponent(caseId)}`);
    return res.data.records;
  },

  /**
   * Get the full chain-of-custody log for a piece of evidence.
   * @param {string} evidenceId
   * @returns {Promise<CustodyEntry[]>}
   */
  async getCustody(evidenceId) {
    const res = await request(`/evidence/${evidenceId}/custody`);
    return res.data.entries;
  },
};

// ─── Verification API ─────────────────────────────────────────────────────────

const verify = {
  /**
   * Verify evidence by providing its ID and expected SHA-256 hash.
   * Fast check — does not require re-uploading the file.
   * @param {string} evidenceId
   * @param {string} sha256Hash  64-char hex string
   * @returns {Promise<VerifyResult>}
   */
  async byHash(evidenceId, sha256Hash) {
    const res = await request('/verify/hash', {
      method: 'POST',
      json: { evidenceId, sha256Hash },
    });
    return res.data;
  },

  /**
   * Verify evidence by re-uploading the original file.
   * Performs both blockchain AND IPFS integrity check.
   * @param {File}   file
   * @param {string} evidenceId
   * @returns {Promise<VerifyResult>}
   */
  async byFile(file, evidenceId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('evidenceId', evidenceId);

    const token = getToken();
    const response = await fetch(`${BASE_URL}/verify/file`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || 'Verification failed');
      error.status = response.status;
      throw error;
    }
    return data.data;
  },

  /**
   * Compute SHA-256 hash of a file in the browser.
   * Uses the native Web Crypto API — no library needed.
   * @param {File} file
   * @returns {Promise<string>}  64-char lowercase hex string
   */
  async computeFileHash(file) {
    const buffer     = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray  = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
};

// ─── Cases API ────────────────────────────────────────────────────────────────

const cases = {
  /**
   * Get all evidence for a case (with full metadata).
   * @param {string} caseId
   * @returns {Promise<{ caseId: string, totalEvidence: number, records: EvidenceRecord[] }>}
   */
  async getEvidence(caseId) {
    const res = await request(`/cases/${encodeURIComponent(caseId)}`);
    return res.data;
  },

  /**
   * Get a compact summary (just the IDs and count).
   * @param {string} caseId
   * @returns {Promise<{ caseId: string, evidenceCount: number, evidenceIds: string[] }>}
   */
  async getSummary(caseId) {
    const res = await request(`/cases/${encodeURIComponent(caseId)}/summary`);
    return res.data;
  },
};

// ─── MetaMask Helper ──────────────────────────────────────────────────────────

const wallet = {
  /**
   * Request MetaMask to connect and return the first account address.
   * @returns {Promise<string>} wallet address
   */
  async connect() {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0];
  },

  /**
   * Sign the EviChain challenge message with MetaMask.
   * @param {string} walletAddress
   * @param {string} message
   * @returns {Promise<string>} signature hex string
   */
  async sign(walletAddress, message) {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    return window.ethereum.request({
      method: 'personal_sign',
      params: [message, walletAddress],
    });
  },

  /**
   * Full login flow: connect wallet → get nonce → sign → authenticate.
   * @returns {Promise<{ token: string, walletAddress: string }>}
   */
  async loginWithMetaMask() {
    const walletAddress = await wallet.connect();
    const { message }   = await auth.getNonce();
    const signature     = await wallet.sign(walletAddress, message);
    return auth.login(walletAddress, signature, message);
  },

  /**
   * Check which network MetaMask is on.
   * Returns the chainId as a decimal number.
   * @returns {Promise<number>}
   */
  async getChainId() {
    if (!window.ethereum) return null;
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  },

  /**
   * Prompt MetaMask to switch to Sepolia testnet (chainId 11155111).
   */
  async switchToSepolia() {
    if (!window.ethereum) throw new Error('MetaMask not installed');
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
    });
  },
};

// ─── Default Export ───────────────────────────────────────────────────────────

const api = { auth, evidence, verify, cases, wallet };
export default api;

/**
 * @typedef {Object} EvidenceRecord
 * @property {string} evidenceId
 * @property {string} sha256Hash
 * @property {string} ipfsCid
 * @property {string} ipfsUrl
 * @property {string} caseId
 * @property {string} description
 * @property {string} submittedBy
 * @property {number} timestamp
 * @property {string} date
 */

/**
 * @typedef {Object} CustodyEntry
 * @property {string} actor
 * @property {string} action
 * @property {string} notes
 * @property {number} timestamp
 * @property {string} date
 */

/**
 * @typedef {Object} VerifyResult
 * @property {string}  evidenceId
 * @property {boolean} isValid
 * @property {boolean} fullyIntact
 * @property {string}  ipfsCid
 * @property {number}  timestamp
 * @property {string}  message
 */
