const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const FALLBACK_BASE_URLS = (import.meta.env.VITE_API_FALLBACK_URLS || 'http://localhost:3001/api,http://localhost:5000/api,http://localhost:3002/api')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

let activeBaseUrl = DEFAULT_BASE_URL;

function getCandidateBaseUrls() {
  const seen = new Set();
  const candidates = [activeBaseUrl, DEFAULT_BASE_URL, ...FALLBACK_BASE_URLS];

  return candidates.filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function requestWithFormData(path, formData) {
  const candidates = getCandidateBaseUrls();
  let lastError = null;

  for (const baseUrl of candidates) {
    const token = getToken();

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      const data = await parseResponseBody(response);

      if (response.ok) {
        activeBaseUrl = baseUrl;
        return data;
      }

      const error = new Error(data.message || `Request failed: ${response.status}`);
      error.status = response.status;
      error.data = data;

      if (response.status === 404 && baseUrl !== candidates[candidates.length - 1]) {
        lastError = error;
        continue;
      }

      throw error;
    } catch (error) {
      lastError = error;
      if (baseUrl === candidates[candidates.length - 1]) {
        throw error;
      }
    }
  }

  throw lastError || new Error('Request failed');
}

function getToken() {
  return localStorage.getItem('evichain_token');
}

function setToken(token) {
  localStorage.setItem('evichain_token', token);
}

function clearToken() {
  localStorage.removeItem('evichain_token');
}

async function request(path, options = {}) {
  const candidates = getCandidateBaseUrls();
  let lastError = null;

  for (const baseUrl of candidates) {
    const token = getToken();
    const headers = {
      ...(options.json ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(typeof window !== 'undefined' && window.ethereum?.isMockMetaMask ? { 'x-mock-metamask': 'true' } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
        body: options.json ? JSON.stringify(options.json) : options.body,
      });

      const data = await parseResponseBody(response);

      if (response.ok) {
        activeBaseUrl = baseUrl;
        return data;
      }

      const error = new Error(data.message || `Request failed: ${response.status}`);
      error.status = response.status;
      error.data = data;

      // 404 often means wrong backend port/path; try next candidate if available.
      const canRetryOnThisStatus = response.status === 404;
      if (canRetryOnThisStatus && baseUrl !== candidates[candidates.length - 1]) {
        lastError = error;
        continue;
      }

      throw error;
    } catch (error) {
      lastError = error;
      if (baseUrl === candidates[candidates.length - 1]) {
        throw error;
      }
    }
  }

  throw lastError || new Error('Request failed');
}

const auth = {
  async getNonce() {
    const res = await request('/auth/nonce');
    return res.data;
  },

  async login(walletAddress, signature, message, authMeta = {}) {
    const res = await request('/auth/login', {
      method: 'POST',
      json: { walletAddress, signature, message, ...authMeta },
    });

    if (res.data?.token) {
      setToken(res.data.token);
    }

    return res.data;
  },

  async getMe() {
    const res = await request('/auth/me');
    return res.data;
  },

  async getProfile() {
    const res = await request('/auth/profile');
    return res.data;
  },

  logout() {
    clearToken();
  },

  isLoggedIn() {
    return !!getToken();
  },
};

const evidence = {
  async submit(file, caseId, description = '', reuseExisting = false, existingCid = '', evidenceType = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    formData.append('description', description);
    if (evidenceType) {
      formData.append('evidenceType', evidenceType);
    }
    formData.append('reuseExisting', String(reuseExisting));
    if (existingCid) {
      formData.append('existingCid', existingCid);
    }
    const data = await requestWithFormData('/evidence/submit', formData);
    return data.data;
  },

  async duplicate(sha256Hash) {
    const res = await request('/evidence/duplicate', {
      method: 'POST',
      json: { sha256Hash },
    });
    return res.data;
  },

  async getAll(offset = 0, limit = 100) {
    const res = await request(`/evidence?offset=${offset}&limit=${limit}`);
    return res.data;
  },

  async getById(evidenceId) {
    const res = await request(`/evidence/${evidenceId}`);
    return res.data;
  },
  async getMetadata(evidenceId) {
    const res = await request(`/evidence/${evidenceId}/metadata`);
    return res.data;
  },

  async getByCase(caseId) {
    const res = await request(`/evidence/case/${encodeURIComponent(caseId)}`);
    return res.data.records;
  },

  async getCustody(evidenceId) {
    const res = await request(`/evidence/${evidenceId}/custody`);
    return res.data.entries;
  },
};

const verify = {
  async byHash(evidenceId, sha256Hash) {
    const res = await request('/verify/hash', {
      method: 'POST',
      json: { evidenceId, sha256Hash },
    });
    return res.data;
  },

  async byFile(file, evidenceId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('evidenceId', evidenceId);
    const data = await requestWithFormData('/verify/file', formData);
    return data.data;
  },

  async computeFileHash(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },
};

const cases = {
  async getEvidence(caseId) {
    const res = await request(`/cases/${encodeURIComponent(caseId)}`);
    return res.data;
  },

  async getSummary(caseId) {
    const res = await request(`/cases/${encodeURIComponent(caseId)}/summary`);
    return res.data;
  },
};

const system = {
  async getHealth() {
    return request('/health');
  },
};

const wallet = {
  async connect() {
    console.log('  [wallet.connect] Checking for MetaMask...');
    if (!window.ethereum) {
      console.error('  [wallet.connect] ❌ MetaMask NOT found in window.ethereum');
      throw new Error('MetaMask not installed');
    }
    console.log('  [wallet.connect] ✅ MetaMask detected');

    console.log('  [wallet.connect] Requesting accounts...');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('  [wallet.connect] Accounts returned:', accounts);
    const walletAddress = Array.isArray(accounts) ? accounts[0] : null;

    if (!walletAddress) {
      console.error('  [wallet.connect] ❌ No wallet address found in:', accounts);
      throw new Error('No wallet account was returned by MetaMask');
    }
    console.log('  [wallet.connect] ✅ Got wallet address:', walletAddress);

    return walletAddress;
  },

  async confirmUploadTransaction() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    const walletAddress = Array.isArray(accounts) && accounts[0] ? accounts[0] : await wallet.connect();

    return window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: walletAddress,
          to: walletAddress,
          value: '0x0',
          data: '0x',
        },
      ],
    });
  },

  async sign(walletAddress, message) {
    console.log('  [wallet.sign] Checking for MetaMask...');
    if (!window.ethereum) {
      console.error('  [wallet.sign] ❌ MetaMask NOT found');
      throw new Error('MetaMask not installed');
    }
    console.log('  [wallet.sign] ✅ MetaMask found');

    console.log('  [wallet.sign] Requesting signature for:', walletAddress);
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });
      console.log('  [wallet.sign] ✅ Got signature');
      return signature;
    } catch (error) {
      console.error('  [wallet.sign] ❌ Signature request failed:', error);
      throw error;
    }
  },

  async loginWithMetaMask(authMeta = {}) {
    console.log('🔵 Starting MetaMask login flow...');
    try {
      console.log('  Step 1: Connecting wallet...');
      const walletAddress = await wallet.connect();
      console.log('  ✅ Connected wallet:', walletAddress);
      
      console.log('  Step 2: Getting nonce...');
      const { message } = await auth.getNonce();
      console.log('  ✅ Got nonce message');
      
      console.log('  Step 3: Signing message...');
      const signature = await wallet.sign(walletAddress, message);
      console.log('  ✅ Got signature:', signature.substring(0, 20) + '...');
      
      console.log('  Step 4: Sending login request with authMeta:', authMeta);
      const result = await auth.login(walletAddress, signature, message, authMeta);
      console.log('  ✅ Login successful:', result);
      return result;
    } catch (error) {
      console.error('  ❌ Login failed at step:', error.message);
      throw error;
    }
  },

  async getChainId() {
    if (!window.ethereum) {
      return null;
    }

    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return parseInt(chainId, 16);
  },

  async switchToSepolia() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
  },
};

const api = {
  get baseUrl() {
    return activeBaseUrl;
  },
  auth,
  evidence,
  verify,
  cases,
  wallet,
  system,
};

export default api;
