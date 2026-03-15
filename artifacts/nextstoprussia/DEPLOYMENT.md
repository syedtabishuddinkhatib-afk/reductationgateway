# NextStopRussia — AWS EC2 Deployment Guide

## Prerequisites

- AWS EC2 Ubuntu 22.04 LTS instance (t2.micro or larger)
- Domain name pointing to your EC2 IP (optional but recommended)
- Ports 22, 80, and 443 open in EC2 Security Group

---

## Step 1 — Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 22.04 LTS**
3. Instance type: **t2.micro** (free tier) or **t2.small** for better performance
4. In **Security Group**, allow inbound:
   - SSH (port 22) — your IP
   - HTTP (port 80) — Anywhere
   - HTTPS (port 443) — Anywhere
   - Custom TCP 3000 — Anywhere (for Node.js direct access)
5. Create or select a key pair (.pem file)
6. Launch the instance

---

## Step 2 — Connect to Your EC2 Instance

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@<your-ec2-public-ip>
```

---

## Step 3 — Install Node.js and PM2

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 globally (process manager)
sudo npm install -g pm2
```

---

## Step 4 — Upload Project Files

### Option A: Using SCP (from your local machine)

```bash
# From your LOCAL machine, upload the project folder
scp -i your-key.pem -r ./nextstoprussia ubuntu@<your-ec2-ip>:/home/ubuntu/
```

### Option B: Using Git

```bash
# On EC2 server
sudo apt install -y git
git clone https://github.com/yourusername/nextstoprussia.git /home/ubuntu/nextstoprussia
```

---

## Step 5 — Build and Run the Application

```bash
# Navigate to project directory
cd /home/ubuntu/nextstoprussia

# Install dependencies
npm install

# Build the React frontend
npm run build

# Set environment variables (edit as needed)
export PORT=3000
export WHATSAPP_NUMBER=79001234567
export TELEGRAM_BOT_TOKEN=your_bot_token_here
export TELEGRAM_CHAT_ID=your_chat_id_here

# Start the server
node server.js
```

---

## Step 6 — Set Up PM2 for Auto-Restart

```bash
# Start with PM2
pm2 start server.js --name nextstoprussia \
  --env production \
  -e PORT=3000 \
  -e WHATSAPP_NUMBER=79001234567 \
  -e TELEGRAM_BOT_TOKEN=your_bot_token \
  -e TELEGRAM_CHAT_ID=your_chat_id

# Save PM2 process list
pm2 save

# Enable PM2 on system startup
pm2 startup
# (copy and run the command PM2 gives you)

# Monitor your application
pm2 status
pm2 logs nextstoprussia
```

---

## Step 7 — Install and Configure NGINX

```bash
# Install NGINX
sudo apt install -y nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/nextstoprussia
```

Paste this NGINX configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded files directly
    location /data/ {
        alias /home/ubuntu/nextstoprussia/data/;
        deny all;  # Block direct access to CSV files
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/nextstoprussia /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test NGINX configuration
sudo nginx -t

# Start/reload NGINX
sudo systemctl enable nginx
sudo systemctl restart nginx
```

---

## Step 8 — Enable HTTPS with Let's Encrypt (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your actual domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## Step 9 — Configure Environment Variables Permanently

Create a `.env` file in your project directory:

```bash
nano /home/ubuntu/nextstoprussia/.env
```

```env
PORT=3000
NODE_ENV=production
WHATSAPP_NUMBER=79001234567
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

Update PM2 to use the env file:

```bash
pm2 delete nextstoprussia
pm2 start server.js --name nextstoprussia --env-file .env
pm2 save
```

---

## Setting Up Telegram Bot Notifications

1. Open Telegram and message **@BotFather**
2. Send `/newbot` and follow the steps to create a bot
3. Copy the **Bot Token** provided
4. Add your bot to a Telegram group or channel
5. Send a message in the group
6. Open this URL in browser to get the Chat ID:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
7. Find `"chat": {"id": -1234567890}` — that's your Chat ID
8. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in your environment

---

## Accessing Leads (CSV File)

All form submissions are saved to:
```
/home/ubuntu/nextstoprussia/data/leads.csv
```

View leads on server:
```bash
cat /home/ubuntu/nextstoprussia/data/leads.csv
```

Download leads to your local machine:
```bash
scp -i your-key.pem ubuntu@<ec2-ip>:/home/ubuntu/nextstoprussia/data/leads.csv ./leads.csv
```

---

## Useful PM2 Commands

```bash
pm2 status                    # Check app status
pm2 logs nextstoprussia       # View logs
pm2 restart nextstoprussia    # Restart app
pm2 stop nextstoprussia       # Stop app
pm2 delete nextstoprussia     # Remove from PM2
pm2 monit                     # Real-time monitoring
```

---

## Project Structure on Server

```
/home/ubuntu/nextstoprussia/
├── server.js           # Main Express server
├── package.json
├── public/             # Built React frontend
│   ├── index.html
│   ├── assets/
│   └── images/
├── data/               # Data files
│   ├── leads.csv       # Form submissions
│   ├── services.json
│   ├── universities.json
│   ├── universityFees.json
│   ├── consultancyFees.json
│   ├── testimonials.json
│   └── gallery.json
```

---

## Firewall (UFW) Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

© 2024 NextStopRussia | Founded by Dr. Jabroot Khatib
