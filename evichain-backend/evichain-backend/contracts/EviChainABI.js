/**
 * EviChain Smart Contract ABI
 * Generated to match contracts/EviChain.sol
 */
export const EviChainABI = [

  // ── Events ─────────────────────────────────────────────────────────────────

  {
    type: "event", name: "EvidenceSubmitted",
    inputs: [
      { name: "evidenceId",  type: "string",  indexed: true  },
      { name: "caseId",      type: "string",  indexed: true  },
      { name: "sha256Hash",  type: "string",  indexed: false },
      { name: "ipfsCid",     type: "string",  indexed: false },
      { name: "submittedBy", type: "address", indexed: false },
      { name: "timestamp",   type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "CustodyEvent",
    inputs: [
      { name: "evidenceId", type: "string",  indexed: true  },
      { name: "actor",      type: "address", indexed: true  },
      { name: "action",     type: "string",  indexed: false },
      { name: "timestamp",  type: "uint256", indexed: false },
    ],
  },

  // ── Write Functions ────────────────────────────────────────────────────────

  {
    type: "function", name: "submitEvidence",
    stateMutability: "nonpayable",
    inputs: [
      { name: "evidenceId",  type: "string" },
      { name: "sha256Hash",  type: "string" },
      { name: "ipfsCid",     type: "string" },
      { name: "caseId",      type: "string" },
      { name: "description", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "logCustodyEvent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "evidenceId", type: "string" },
      { name: "action",     type: "string" },
      { name: "notes",      type: "string" },
    ],
    outputs: [],
  },

  // ── Read Functions ─────────────────────────────────────────────────────────

  {
    type: "function", name: "getEvidence",
    stateMutability: "view",
    inputs:  [{ name: "evidenceId", type: "string" }],
    outputs: [{
      name: "", type: "tuple",
      components: [
        { name: "evidenceId",  type: "string"  },
        { name: "sha256Hash",  type: "string"  },
        { name: "ipfsCid",     type: "string"  },
        { name: "caseId",      type: "string"  },
        { name: "description", type: "string"  },
        { name: "submittedBy", type: "address" },
        { name: "timestamp",   type: "uint256" },
        { name: "exists",      type: "bool"    },
      ],
    }],
  },
  {
    type: "function", name: "getCustodyLog",
    stateMutability: "view",
    inputs:  [{ name: "evidenceId", type: "string" }],
    outputs: [{
      name: "", type: "tuple[]",
      components: [
        { name: "actor",     type: "address" },
        { name: "action",    type: "string"  },
        { name: "timestamp", type: "uint256" },
        { name: "notes",     type: "string"  },
      ],
    }],
  },
  {
    type: "function", name: "getEvidenceByCase",
    stateMutability: "view",
    inputs:  [{ name: "caseId", type: "string" }],
    outputs: [{ name: "", type: "string[]" }],
  },
  {
    type: "function", name: "verifyEvidence",
    stateMutability: "view",
    inputs: [
      { name: "evidenceId",       type: "string" },
      { name: "sha256HashToTest", type: "string" },
    ],
    outputs: [
      { name: "isValid",   type: "bool"    },
      { name: "ipfsCid",   type: "string"  },
      { name: "timestamp", type: "uint256" },
    ],
  },
  {
    type: "function", name: "evidenceExists",
    stateMutability: "view",
    inputs:  [{ name: "evidenceId", type: "string" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "getTotalEvidence",
    stateMutability: "view",
    inputs:  [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "getAllEvidenceIds",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit",  type: "uint256" },
    ],
    outputs: [{ name: "result", type: "string[]" }],
  },
];
