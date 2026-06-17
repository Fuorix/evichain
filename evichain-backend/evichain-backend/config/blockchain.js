import { ethers } from 'ethers';
import { EviChainABI } from '../contracts/EviChainABI.js';

let _provider = null;
let _signer   = null;

function normalizedEnv(name) {
  const value = process.env[name];
  return value ? value.trim() : '';
}

function normalizePrivateKey(rawKey) {
  if (!rawKey) return '';
  return rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`;
}

/**
 * Lazy-initialise and return a JSON-RPC provider.
 */
export function getProvider() {
  if (!_provider) {
    const url = normalizedEnv('RPC_URL');
    if (!url) throw new Error('RPC_URL is missing from .env');
    _provider = new ethers.JsonRpcProvider(url);
  }
  return _provider;
}

/**
 * Lazy-initialise and return a wallet signer (used for write transactions).
 */
export function getSigner() {
  if (!_signer) {
    const pk = normalizePrivateKey(normalizedEnv('PRIVATE_KEY'));
    if (!pk) throw new Error('PRIVATE_KEY is missing from .env');
    _signer = new ethers.Wallet(pk, getProvider());
  }
  return _signer;
}

/**
 * Read-only contract — for getEvidence, verifyEvidence, getCustodyLog, etc.
 */
export function getReadContract() {
  const addr = normalizedEnv('CONTRACT_ADDRESS');
  if (!addr) throw new Error('CONTRACT_ADDRESS is missing from .env');
  return new ethers.Contract(addr, EviChainABI, getProvider());
}

/**
 * Write contract — for submitEvidence, logCustodyEvent.
 */
export function getWriteContract() {
  const addr = normalizedEnv('CONTRACT_ADDRESS');
  if (!addr) throw new Error('CONTRACT_ADDRESS is missing from .env');
  return new ethers.Contract(addr, EviChainABI, getSigner());
}

/**
 * Utility: reset cached instances (useful in tests).
 */
export function resetInstances() {
  _provider = null;
  _signer   = null;
}
