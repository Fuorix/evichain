# EviChain Backend

**Blockchain-Based Digital Evidence Assurance**
BS-DFCS Final Year Project — Lahore Garrison University (2025)
Muhammad Bilal Mukhtar | Supervised by Dr Fahad

---

## What This Does

EviChain is a digital evidence management system that anchors evidence metadata permanently on the Ethereum blockchain. Every uploaded file receives a SHA-256 fingerprint, is stored on IPFS (via Pinata), and its hash + CID + metadata are written to a Solidity smart contract on the Sepolia testnet. This makes evidence tamper-evident and independently verifiable by any party (judge, defence counsel, forensic expert).

---

## Architecture

```
React Frontend (Vite)
       │
       ▼  REST API
Node.js + Express Backend  ──► Ethereum Sepolia (ethers.js v6)
       │                             EviChain.sol
       ▼
  Pinata (IPFS)
```

---

## Project Structure

```
evichain-backend/
├── server.js                    # Express app entry point
├── package.json
├── .env.example                 # Copy to .env and fill in your keys
├── hardhat.config.cjs           # Hardhat configuration (for contract deployment)
│
├── contracts/
│   ├── EviChain.sol             # Solidity smart contract
│   └── EviChainABI.js           # ABI for ethers.js
│
├── config/
│   └── blockchain.js            # ethers.js provider / signer / contract instances
│
├── routes/
│   ├── auth.js                  # /api/auth/*
│   ├── evidence.js              # /api/evidence/*
│   ├── cases.js                 # /api/cases/*
│   └── verify.js                # /api/verify/*
│
├── controllers/
│   ├── authController.js        # Wallet-signature login + JWT
│   ├── evidenceController.js    # Submit, list, get, custody log
│   ├── casesController.js       # Case-scoped evidence queries
│   └── verifyController.js      # Hash + file verification
│
├── middleware/
│   ├── auth.js                  # JWT authenticate middleware
│   ├── upload.js                # Multer (memory storage, 100 MB limit)
│   ├── rateLimiter.js           # express-rate-limit
│   └── errorHandler.js         # Central error handler
│
├── utils/
│   └── ipfs.js                  # Pinata upload, SHA-256, IPFS fetch, ID generator
│
├── scripts/
│   ├── deploy.js                # Ethers.js deploy (paste bytecode from Remix)
│   └── hardhat-deploy.cjs       # Hardhat deploy script
│
└── frontend-integration/
    ├── api.js                   # Drop into evichain-react/src/services/api.js
    └── react-env-addition.txt   # VITE_API_URL to add to React .env
```

---

## Quick Start

### 1. Install dependencies

```bash
cd evichain-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then edit `.env` with:

| Variable | Where to get it |
|---|---|
| `RPC_URL` | [Infura](https://app.infura.io) or [Alchemy](https://alchemy.com) — create a project, copy Sepolia HTTPS URL |
| `PRIVATE_KEY` | MetaMask → Account Details → Export Private Key |
| `CONTRACT_ADDRESS` | After deploying the smart contract (Step 3) |
| `PINATA_API_KEY` | [Pinata](https://pinata.cloud) → API Keys → New Key |
| `PINATA_SECRET_KEY` | Same page as above |
| `JWT_SECRET` | Any long random string |

### 3. Deploy the Smart Contract

**Option A — Remix IDE (recommended for students):**
1. Open [https://remix.ethereum.org](https://remix.ethereum.org)
2. Create new file → paste `contracts/EviChain.sol`
3. Solidity Compiler tab → Compile `EviChain.sol`
4. Deploy & Run tab → Environment: **Injected Provider - MetaMask**
5. Make sure MetaMask is on **Sepolia** testnet
6. Click **Deploy** → confirm in MetaMask
7. Copy the deployed contract address → paste into `.env` as `CONTRACT_ADDRESS`

**Option B — Hardhat:**
```bash
npx hardhat compile
npx hardhat run scripts/hardhat-deploy.cjs --network sepolia
```
Copy the printed `CONTRACT_ADDRESS` into your `.env`.

Get free Sepolia ETH: [https://sepoliafaucet.com](https://sepoliafaucet.com)

### 4. Run the backend

```bash
npm run dev        # Development (nodemon auto-restart)
npm start          # Production
```

Server starts at `http://localhost:3001`

### 5. Connect the React frontend

Copy `frontend-integration/api.js` into your React project:
```bash
cp frontend-integration/api.js ../evichain-react/src/services/api.js
```

Add to `evichain-react/.env`:
```
VITE_API_URL=http://localhost:3001/api
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/nonce` | Get a challenge message to sign |
| POST | `/api/auth/login` | Login with wallet signature → returns JWT |
| GET | `/api/auth/me` | Get current user (requires JWT) |

**Login flow:**
```js
// 1. Get nonce
GET /api/auth/nonce
→ { data: { message: "Sign in to EviChain\nTimestamp: ...\nNonce: ..." } }

// 2. Sign with MetaMask (frontend)
const signature = await ethereum.request({
  method: 'personal_sign',
  params: [message, walletAddress]
});

// 3. Login
POST /api/auth/login
Body: { walletAddress, signature, message }
→ { data: { token, walletAddress } }
```

### Evidence

All evidence routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/evidence/submit` | Upload file → IPFS → blockchain |
| GET | `/api/evidence` | List all evidence (paginated) |
| GET | `/api/evidence/:evidenceId` | Get single record |
| GET | `/api/evidence/:evidenceId/custody` | Chain-of-custody log |
| GET | `/api/evidence/case/:caseId` | All evidence for a case |

**Submit evidence:**
```
POST /api/evidence/submit
Content-Type: multipart/form-data

file        (required) — the evidence file
caseId      (required) — e.g. "CASE-2025-001"
description (optional) — free text
```

Response:
```json
{
  "success": true,
  "data": {
    "evidenceId": "EV-2025-0001",
    "sha256Hash": "e3b0c44298fc1c149afb...",
    "ipfsCid":    "bafybeig...",
    "ipfsUrl":    "https://gateway.pinata.cloud/ipfs/bafybeig...",
    "caseId":     "CASE-2025-001",
    "txHash":     "0xabc123...",
    "blockNumber": 7654321
  }
}
```

### Verification

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/verify/hash` | Verify by evidenceId + sha256Hash string |
| POST | `/api/verify/file` | Verify by re-uploading the file |

**Verify by hash:**
```json
POST /api/verify/hash
{ "evidenceId": "EV-2025-0001", "sha256Hash": "e3b0c44298fc..." }
→ { "isValid": true, "message": "✅ Evidence integrity verified" }
```

**Verify by file:**
```
POST /api/verify/file
multipart: file + evidenceId
→ { "chainVerified": true, "ipfsVerified": true, "fullyIntact": true }
```

### Cases

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cases/:caseId` | All evidence for a case |
| GET | `/api/cases/:caseId/summary` | Just IDs + count |

---

## Smart Contract

`contracts/EviChain.sol` is deployed to Sepolia. Key functions:

```solidity
// Write
submitEvidence(evidenceId, sha256Hash, ipfsCid, caseId, description)
logCustodyEvent(evidenceId, action, notes)

// Read
getEvidence(evidenceId) → Evidence struct
getCustodyLog(evidenceId) → ChainOfCustody[]
verifyEvidence(evidenceId, sha256HashToCheck) → (isValid, cid, timestamp)
getEvidenceByCase(caseId) → string[]
getTotalEvidence() → uint256
```

Every record is **append-only**. No update or delete functions exist — this guarantees immutability.

---

## Using the Frontend API Service

```js
import api from './services/api';

// ── Login with MetaMask ──────────────────────────────────
const { token, walletAddress } = await api.wallet.loginWithMetaMask();

// ── Submit evidence ──────────────────────────────────────
const record = await api.evidence.submit(file, 'CASE-2025-001', 'Photo from scene');
console.log(record.evidenceId);   // EV-2025-0001
console.log(record.sha256Hash);   // e3b0c...
console.log(record.txHash);       // 0xabc...

// ── Verify by file ───────────────────────────────────────
const result = await api.verify.byFile(file, 'EV-2025-0001');
console.log(result.fullyIntact);  // true / false
console.log(result.message);      // ✅ Evidence is fully intact

// ── Get chain of custody ─────────────────────────────────
const log = await api.evidence.getCustody('EV-2025-0001');
log.forEach(e => console.log(e.action, e.date));

// ── Compute file hash in browser ─────────────────────────
const hash = await api.verify.computeFileHash(file);
```

---

## Security Notes

- **Never commit `.env`** — it contains your private key
- `PRIVATE_KEY` is the backend wallet that pays gas for writes
- Keep this wallet funded with Sepolia ETH from [sepoliafaucet.com](https://sepoliafaucet.com)
- In production, use a hardware wallet or KMS instead of a raw private key
- JWT tokens expire after 7 days by default

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Blockchain | Ethereum Sepolia (ethers.js v6) |
| Smart Contract | Solidity 0.8.20 |
| File Storage | IPFS via Pinata |
| Authentication | JWT + MetaMask signatures |
| File Upload | Multer (memory storage) |
| Hash Algorithm | SHA-256 (Node.js crypto) |

---

*EviChain — Building trust through mathematics, not institutions.*
