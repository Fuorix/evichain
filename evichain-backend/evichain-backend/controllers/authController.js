import { ethers }    from 'ethers';
import { signToken } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { saveAuthEvent, saveAuthProfile, getAuthProfile } from '../database/authStore.js';

// ─── GET /api/auth/nonce ──────────────────────────────────────────────────────
/**
 * Returns a unique challenge message for the frontend to sign with MetaMask.
 * The frontend signs this exact string, then sends it back with /login.
 */
export async function getNonce(_req, res) {
  const nonce   = Math.floor(Math.random() * 1_000_000);
  const time    = new Date().toISOString();
  const message = `Welcome to EviChain!\n\nSign this message to verify your wallet.\n\nNonce: ${nonce}\nTimestamp: ${time}`;
  res.json({ success: true, data: { message } });
}

// ─── POST /api/auth/login ────────────────────────────────────────────────────
/**
 * Verify a MetaMask signature and issue a JWT.
 *
 * Body: { walletAddress, signature, message }
 *   - walletAddress : the Ethereum address claiming to be the user
 *   - message       : the exact nonce message returned by /nonce
 *   - signature     : the hex signature from MetaMask
 */
export async function login(req, res, next) {
  try {
    const {
      walletAddress,
      signature,
      message,
      mode = 'signin',
      role,
      fullName,
    } = req.body;

    if (!walletAddress || !signature || !message) {
      throw createError('walletAddress, signature, and message are all required', 400);
    }

    // Recover the signer from the signature
    // In development mode with mock MetaMask, skip signature verification
    let recovered = null;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isMockMetaMask = req.headers['x-mock-metamask'] === 'true' || process.env.ALLOW_MOCK_SIGNATURES === 'true';

    if (isDevelopment && isMockMetaMask) {
      console.log(`[Auth] Development mode: accepting mock signature from ${walletAddress}`);
      recovered = walletAddress; // In dev mode with mock MetaMask, trust the address
    } else {
      try {
        console.log(`[Auth] Verifying signature for ${walletAddress}`);
        console.log(`[Auth] Message length: ${message.length}, Signature length: ${signature.length}`);
        recovered = ethers.verifyMessage(message, signature);
        console.log(`[Auth] Recovered address: ${recovered}`);
      } catch (verifyError) {
        console.error(`[Auth] Signature verification failed:`, verifyError.message);
        console.error(`[Auth] Wallet: ${walletAddress}`);
        console.error(`[Auth] Signature: ${signature}`);
        console.error(`[Auth] Message: ${message}`);
        throw createError('Invalid signature — please try signing again', 401);
      }
    }

    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      throw createError('Signature does not match the wallet address', 401);
    }

    const normalizedWallet = walletAddress.toLowerCase();
    const normalizedMode = String(mode || 'signin').toLowerCase();

    let resolvedRole = role || null;
    let resolvedFullName = fullName || null;
    const authMetadata = {
      ip: req.ip || req.connection.remoteAddress || null,
      userAgent: req.get('user-agent') || null,
      timestamp: Math.floor(Date.now() / 1000),
      mode: normalizedMode,
      role: resolvedRole,
      fullName: resolvedFullName,
    };

    const readableRoles = ['police_officer', 'forensic_officer', 'judge', 'lawyer'];

    const existing = await getAuthProfile(normalizedWallet);

    if (normalizedMode === 'signup') {
      if (!resolvedRole || !readableRoles.includes(resolvedRole)) {
        throw createError('Signup requires role (police_officer, forensic_officer, judge, or lawyer)', 400);
      }

      if (existing?.found) {
        throw createError('Wallet already registered. Please sign in with this wallet.', 409);
      }

      const profileSave = await saveAuthProfile({
        walletAddress: normalizedWallet,
        fullName: resolvedFullName,
        role: resolvedRole,
        mode: normalizedMode,
        metadata: authMetadata,
      });

      if (!profileSave.saved) {
        if (profileSave.exists) {
          throw createError(profileSave.reason || 'Wallet already registered. Please sign in with this wallet.', 409);
        }
        throw createError(profileSave.reason || 'Unable to save wallet profile', 500);
      }
    } else {
      if (!existing?.found || !existing.profile) {
        throw createError('No account found for this wallet. Please sign up first.', 404);
      }

      resolvedRole = existing.profile.role || resolvedRole;
      resolvedFullName = existing.profile.fullName || resolvedFullName;

      const profileSave = await saveAuthProfile({
        walletAddress: normalizedWallet,
        fullName: resolvedFullName,
        role: resolvedRole,
        mode: normalizedMode,
        metadata: authMetadata,
      });

      if (!profileSave.saved) {
        throw createError(profileSave.reason || 'Unable to update wallet profile', 500);
      }
    }

    const token = signToken({
      id: normalizedWallet,
      walletAddress: normalizedWallet,
      role: resolvedRole,
      fullName: resolvedFullName,
    });

    // Persist an auth event (non-fatal)
    try {
      void saveAuthEvent({
        walletAddress: normalizedWallet,
        ip: req.ip || req.connection.remoteAddress || null,
        userAgent: req.get('user-agent') || null,
        method: 'metamask',
        verified: true,
        metadata: {
          timestamp: Math.floor(Date.now() / 1000),
          mode: normalizedMode,
          role: resolvedRole,
          fullName: resolvedFullName,
          accountPrimaryKey: normalizedWallet,
        },
      });
    } catch (e) {
      console.warn('[EviChain] Failed to save auth event:', e?.message || e);
    }

    res.json({
      success: true,
      message: 'Authenticated successfully',
      data: {
        token,
        walletAddress: normalizedWallet,
        role: resolvedRole,
        fullName: resolvedFullName,
        mode: normalizedMode,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
/**
 * Returns the authenticated user's wallet address (decoded from the JWT).
 */
export async function getMe(req, res) {
  res.json({
    success: true,
    data: {
      walletAddress: req.user.walletAddress,
      role: req.user.role || null,
      fullName: req.user.fullName || null,
    },
  });
}

// ─── GET /api/auth/profile ───────────────────────────────────────────────────
export async function getProfile(req, res, next) {
  try {
    const walletAddress = req.user.walletAddress;
    const existing = await getAuthProfile(walletAddress);

    if (!existing?.found || !existing.profile) {
      throw createError('Profile not found for this wallet', 404);
    }

    res.json({
      success: true,
      data: existing.profile,
    });
  } catch (error) {
    next(error);
  }
}
