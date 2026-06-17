import express  from 'express';
import cors     from 'cors';
import helmet   from 'helmet';
import morgan   from 'morgan';
import dotenv   from 'dotenv';

import authRoutes     from './routes/auth.js';
import evidenceRoutes from './routes/evidence.js';
import caseRoutes     from './routes/cases.js';
import verifyRoutes   from './routes/verify.js';

import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter  } from './middleware/rateLimiter.js';
import { getFirebaseStatus } from './config/firebase.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;
const MAX_PORT_ATTEMPTS = 10;

function getAllowedOrigins() {
  const configured = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  const defaults = ['http://localhost:5173', 'http://localhost:5174'];
  return Array.from(new Set([...configured, ...defaults]));
}

function isLoopbackOrigin(origin) {
  try {
    const { protocol, hostname } = new URL(origin);
    return (protocol === 'http:' || protocol === 'https:') && ['localhost', '127.0.0.1', '::1'].includes(hostname);
  } catch {
    return false;
  }
}

const allowedOrigins = getAllowedOrigins();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || isLoopbackOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/cases',    caseRoutes);
app.use('/api/verify',   verifyRoutes);

// ─── Health ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const firebase = getFirebaseStatus();
  res.json({
    status:    'ok',
    project:   'EviChain',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
    port:      Number(PORT),
    firebase,
  });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

function startServer(port, attempt = 0) {
  const server = app.listen(port, '0.0.0.0', () => {
    process.env.PORT = String(port);

    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║         EviChain Backend  v1.0.0         ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log(`\n🚀  Server   : http://localhost:${port}`);
    console.log(`📡  Network  : Ethereum Sepolia Testnet`);
    console.log(`📦  Env      : ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n📋  Endpoints:`);
    console.log(`    POST  /api/auth/login`);
    console.log(`    GET   /api/auth/nonce`);
    console.log(`    POST  /api/evidence/submit`);
    console.log(`    GET   /api/evidence`);
    console.log(`    GET   /api/evidence/:id`);
    console.log(`    GET   /api/evidence/:id/custody`);
    console.log(`    GET   /api/evidence/case/:caseId`);
    console.log(`    POST  /api/verify/hash`);
    console.log(`    POST  /api/verify/file`);
    console.log(`    GET   /api/cases/:caseId\n`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Retrying on ${nextPort}...`);
      startServer(nextPort, attempt + 1);
      return;
    }

    throw error;
  });
}

// ─── Start ───────────────────────────────────────────────────────────────────
startServer(Number(PORT));

export default app;
