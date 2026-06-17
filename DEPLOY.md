# EviChain — DigitalOcean Droplet Deployment Guide

## Architecture

```
Internet
   |
   v
[Nginx :80/:443]
   |
   |--- static files (/dist)  -->  React SPA
   |--- /api/*                 -->  reverse proxy to Node.js :3001
   |
[PM2 → node server.js :3001]
   |
   |--- Firebase/Firestore  (metadata DB)
   |--- Pinata/IPFS          (file storage)
   |--- Alchemy RPC          (Ethereum Sepolia)
```

---

## 1. Create the Droplet

1. Log in to [DigitalOcean](https://cloud.digitalocean.com)
2. **Create Droplet**:
   - **Image:** Ubuntu 24.04 LTS
   - **Plan:** Basic — 2 GB RAM / 1 vCPU / 50 GB SSD ($12/mo) minimum
   - **Region:** Pick the closest to your users
   - **Authentication:** SSH key (recommended) or password
3. Note the droplet's **public IP address** (e.g. `164.90.xxx.xxx`)

---

## 2. Point Your Domain (Optional but Recommended)

In your domain registrar's DNS settings, add:

```
A    @              164.90.xxx.xxx
A    www            164.90.xxx.xxx
```

Replace with your actual droplet IP. If you don't have a domain, you can use the IP directly (skip SSL steps later).

---

## 3. Initial Server Setup

SSH into the droplet:

```bash
ssh root@164.90.xxx.xxx
```

### 3a. Create a deploy user (don't run the app as root)

```bash
adduser evichain
usermod -aG sudo evichain
```

### 3b. Update packages

```bash
apt update && apt upgrade -y
```

### 3c. Install required software

```bash
# Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Nginx
apt install -y nginx

# PM2 (process manager)
npm install -g pm2

# Git
apt install -y git

# Verify
node -v    # v20.x
npm -v     # 10.x
nginx -v   # 1.x
pm2 -v     # 5.x
```

### 3d. Configure firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## 4. Deploy the Code

### 4a. Transfer the project to the server

**Option A — Git (recommended):**

Push your code to a private GitHub/GitLab repo, then on the server:

```bash
su - evichain
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/YOUR_USER/evichain.git
cd evichain
```

**Option B — SCP (direct upload):**

From your **local machine** (Windows):

```bash
scp -r "D:\Fuorix\Reference\Tamoor\Bilal FYP Final YEAR CODE\Bilal FYP Final YEAR CODE" evichain@164.90.xxx.xxx:~/apps/evichain
```

### 4b. Install dependencies & build frontend

```bash
cd ~/apps/evichain

# Install frontend dependencies and build
npm install
npm run build     # Creates /dist folder

# Install backend dependencies
cd evichain-backend/evichain-backend
npm install
```

---

## 5. Configure Environment Variables

### 5a. Frontend env

Create the production frontend `.env`:

```bash
cd ~/apps/evichain
nano .env
```

```env
# Replace YOUR_DOMAIN with your actual domain or IP
VITE_API_URL=https://YOUR_DOMAIN/api
VITE_API_FALLBACK_URLS=https://YOUR_DOMAIN/api
```

> After changing frontend env vars, you must rebuild: `npm run build`

### 5b. Backend env

```bash
cd ~/apps/evichain/evichain-backend/evichain-backend
nano .env
```

```env
# ─── Server ───────────────────────────────────────────────────────────────
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://YOUR_DOMAIN
FRONTEND_URLS=https://YOUR_DOMAIN,https://www.YOUR_DOMAIN

# ─── JWT ──────────────────────────────────────────────────────────────────
# Generate a strong random secret:  openssl rand -hex 64
JWT_SECRET=PASTE_YOUR_RANDOM_SECRET_HERE
JWT_EXPIRES_IN=7d

# ─── Ethereum / Blockchain ───────────────────────────────────────────────
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY_WITHOUT_0x
CONTRACT_ADDRESS=0x1b71BF4dA2d4d19eB42263e82D7AFAFd20a489FB

# ─── Firebase / Firestore ───────────────────────────────────────────────
FIREBASE_PROJECT_ID=bilal-evichain
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@bilal-evichain.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=YOUR_FIREBASE_SERVICE_ACCOUNT_JSON
FIREBASE_DATABASE_URL=
FIREBASE_COLLECTION=evidence_metadata

# ─── IPFS / Pinata ──────────────────────────────────────────────────────
PINATA_API_KEY=YOUR_PINATA_API_KEY
PINATA_SECRET_KEY=YOUR_PINATA_SECRET_KEY
PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs

# ─── Rate Limiting ──────────────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

> Copy the actual secret values from your local `.env` files. Never commit these to git.

### 5c. Rebuild frontend with production API URL

```bash
cd ~/apps/evichain
npm run build
```

---

## 6. Start the Backend with PM2

```bash
cd ~/apps/evichain/evichain-backend/evichain-backend

# Start the backend
pm2 start server.js --name evichain-api

# Verify it's running
pm2 status
pm2 logs evichain-api --lines 20

# Save PM2 process list and set to auto-start on reboot
pm2 save
pm2 startup
# (Copy and run the command PM2 prints out)
```

Test the backend is responding:

```bash
curl http://localhost:3001/api/health
```

---

## 7. Configure Nginx

### 7a. Create the Nginx config

```bash
sudo nano /etc/nginx/sites-available/evichain
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN www.YOUR_DOMAIN;
    # If using IP only:  server_name 164.90.xxx.xxx;

    # Frontend — serve the built React SPA
    root /home/evichain/apps/evichain/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
    gzip_min_length 256;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API reverse proxy → Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # File uploads can be large (evidence files up to 100MB)
        client_max_body_size 110M;
    }

    # SPA fallback — all non-file routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 7b. Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/evichain /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default    # Remove default site
sudo nginx -t                                # Test config
sudo systemctl restart nginx
```

### 7c. Test

Open `http://YOUR_DOMAIN` (or `http://164.90.xxx.xxx`) in your browser. You should see the EviChain landing page.

---

## 8. Enable SSL with Let's Encrypt (Free HTTPS)

> Skip this if you're using just an IP address with no domain.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

Follow the prompts. Certbot will:
- Obtain SSL certificates
- Automatically update your Nginx config for HTTPS
- Set up auto-renewal

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

After SSL is set up, update the backend `.env`:

```bash
cd ~/apps/evichain/evichain-backend/evichain-backend
nano .env
# Change FRONTEND_URL and FRONTEND_URLS to use https://
```

Then restart the backend:

```bash
pm2 restart evichain-api
```

---

## 9. Verify Everything Works

| Check | Command / URL |
|-------|---------------|
| Frontend loads | `https://YOUR_DOMAIN` |
| API health | `curl https://YOUR_DOMAIN/api/health` |
| Backend logs | `pm2 logs evichain-api` |
| Nginx logs | `sudo tail -f /var/log/nginx/error.log` |
| PM2 status | `pm2 status` |
| MetaMask login | Connect wallet from the browser |

---

## 10. Updating the App

When you push new code:

```bash
cd ~/apps/evichain

# Pull latest code
git pull origin main

# Rebuild frontend
npm install
npm run build

# Update backend deps if changed
cd evichain-backend/evichain-backend
npm install

# Restart backend
pm2 restart evichain-api

# Nginx auto-serves new frontend files (no restart needed)
```

---

## Quick Reference — Common Commands

```bash
# Backend
pm2 status                      # Check if running
pm2 restart evichain-api        # Restart backend
pm2 logs evichain-api           # View logs
pm2 logs evichain-api --err     # View error logs only

# Nginx
sudo nginx -t                   # Test config syntax
sudo systemctl restart nginx    # Restart Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Firewall
sudo ufw status

# SSL
sudo certbot renew --dry-run    # Test renewal
sudo certbot certificates       # View cert status
```

---

## Troubleshooting

### "502 Bad Gateway"
Backend isn't running. Check:
```bash
pm2 status
pm2 logs evichain-api --lines 50
```

### "CORS errors in browser"
Update `FRONTEND_URL` and `FRONTEND_URLS` in the backend `.env` to match your actual domain (with `https://`), then `pm2 restart evichain-api`.

### "MetaMask won't connect"
MetaMask requires HTTPS. Make sure SSL is configured (Step 8) and you're accessing via `https://`.

### "Evidence upload fails"
1. Check Nginx allows large uploads: `client_max_body_size 110M;` in the `/api/` location block
2. Check Pinata API keys are correct in backend `.env`
3. Check backend logs: `pm2 logs evichain-api --err`

### "Firebase connection fails"
The `FIREBASE_PRIVATE_KEY` must be the entire service account JSON string (single line, with escaped newlines in the private key). Copy it exactly from your local `.env`.

### Frontend env changes not reflected
Frontend env vars are baked into the build. After changing `.env` at the root, you must rebuild:
```bash
npm run build
```

---

## Security Checklist

- [ ] SSH key auth only (disable password login)
- [ ] UFW firewall enabled (only 22, 80, 443 open)
- [ ] SSL/HTTPS enabled via Certbot
- [ ] Backend `.env` file is `chmod 600` (readable only by owner)
- [ ] `NODE_ENV=production` in backend `.env`
- [ ] Strong `JWT_SECRET` (use `openssl rand -hex 64`)
- [ ] Private key (`PRIVATE_KEY`) is for a **dedicated** wallet, not your main one
- [ ] Rate limiting enabled in backend
- [ ] Regular `apt update && apt upgrade`
