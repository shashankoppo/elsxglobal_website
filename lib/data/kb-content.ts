/**
 * Knowledge Base Content — Centralized article data.
 * Used by the dynamic KB route at /vaulthost/kb/[slug].
 * Add new articles here; the route auto-generates pages for each entry.
 */

export interface KBArticle {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const kbArticles: KBArticle[] = [
  {
    slug: 'dns-propagation-explained',
    title: 'DNS Propagation Explained: Why Your Domain Takes Time to Go Live',
    category: 'dns',
    excerpt: 'Understand DNS propagation, TTL settings, and how to speed up domain changes across global resolvers.',
    seoMeta: {
      title: 'DNS Propagation Explained — Complete Guide | VaultHost KB',
      description: 'Learn how DNS propagation works, why TTL matters, and how to speed up domain DNS changes across global resolvers.',
      keywords: ['dns propagation', 'dns ttl', 'domain dns setup', 'dns resolution time'],
    },
    content: `## What Is DNS Propagation?

DNS propagation is the time it takes for DNS record changes to spread across the global network of DNS resolvers. When you update your domain's nameservers or DNS records, the change is not instantaneous — it must be picked up by recursive DNS servers worldwide.

### How Long Does Propagation Take?

- **Typical:** 1-6 hours for most ISPs in India
- **Global:** Up to 48 hours for all global resolvers
- **With low TTL:** 5-30 minutes if you pre-lowered TTL before the change

### What Is TTL?

TTL (Time To Live) is the number of seconds a DNS resolver caches your record before checking for updates. A TTL of 3600 means resolvers cache your record for 1 hour.

### How to Speed Up Propagation

1. Lower your TTL to 300 (5 minutes) 24 hours before making changes
2. Make your DNS change
3. Wait for the old TTL to expire
4. Verify with dig or online DNS checkers
5. Restore TTL to 3600 after propagation completes

### Checking Propagation Status

Use these tools to verify global propagation:
- dig yourdomain.com @8.8.8.8 (Google DNS)
- dig yourdomain.com @1.1.1.1 (Cloudflare DNS)
- Online tools like whatsmydns.net

### VaultHost DNS

All VaultHost DNS zones use anycast routing with nodes in Pune, Delhi NCR, and Mumbai. Changes to DNS records within the VaultHost portal propagate to our edge nodes within 60 seconds.`,
  },
  {
    slug: 'ddos-mitigation-strategies',
    title: 'DDoS Mitigation Strategies: How VaultHost Protects Your Infrastructure',
    category: 'security',
    excerpt: 'A deep dive into DDoS attack types, mitigation techniques, and how VaultHost enterprise protection works.',
    seoMeta: {
      title: 'DDoS Mitigation Strategies — Enterprise Protection Guide | VaultHost KB',
      description: 'Learn about DDoS attack types, mitigation techniques, and how VaultHost enterprise DDoS protection keeps your infrastructure online.',
      keywords: ['ddos protection', 'ddos mitigation', 'ddos attack types', 'volumetric attack protection'],
    },
    content: `## Understanding DDoS Attacks

A Distributed Denial of Service (DDoS) attack attempts to overwhelm your server with traffic from multiple sources, making it unavailable to legitimate users.

### Types of DDoS Attacks

#### Volumetric Attacks
Flood the network with massive bandwidth (UDP floods, ICMP floods, amplification attacks). Measured in Gbps.

#### Protocol Attacks
Exploit weaknesses in network protocols (SYN floods, Ping of Death, Smurf attacks). Target network layers 3 and 4.

#### Application Layer Attacks
Target the application itself (HTTP floods, Slowloris, hash collision attacks). Harder to detect because traffic appears legitimate.

### VaultHost DDoS Protection Architecture

#### Layer 1: Traffic Monitoring
All incoming traffic is continuously analyzed at our edge nodes. Baseline traffic patterns are established per-customer using machine learning.

#### Layer 2: Attack Detection
Anomalous traffic patterns are detected within 3-5 seconds. Detection uses signature-based and behavior-based analysis.

#### Layer 3: Traffic Scrubbing
Malicious traffic is diverted to scrubbing centers in Mumbai and Pune. Clean traffic is forwarded to your origin server.

#### Layer 4: Rate Limiting
Application-layer attacks are mitigated via WAF rules and rate limiting at the edge.

### What to Do During an Attack

1. Do not panic — our system detects and mitigates automatically
2. Check the status page at /vaulthost/status for active incidents
3. If your site is still affected, open a priority support ticket
4. For sustained attacks above 10Gbps, contact our NOC directly

### Protection Tiers

- **Standard (Included):** Up to 2Gbps mitigation, L3/L4 protection
- **Enhanced (VPS+ plans):** Up to 10Gbps mitigation, L3/L4/L7 protection
- **Enterprise (Dedicated+ plans):** Up to 100Gbps mitigation, custom WAF rules, dedicated scrubbing`,
  },
  {
    slug: 'cpanel-complete-setup-guide',
    title: 'Complete cPanel Setup Guide: From Zero to Production in 30 Minutes',
    category: 'shared-hosting',
    excerpt: 'Step-by-step cPanel configuration: email setup, database creation, SSL installation, and file management.',
    seoMeta: {
      title: 'Complete cPanel Setup Guide — Zero to Production | VaultHost KB',
      description: 'Master cPanel in 30 minutes: email setup, MySQL databases, SSL certificates, file manager, and cron jobs with this complete guide.',
      keywords: ['cpanel setup', 'cpanel guide', 'cpanel email setup', 'cpanel database', 'cpanel ssl'],
    },
    content: `## Accessing cPanel

### Method 1: Via Portal
1. Log in to your VaultHost client portal at /portal
2. Navigate to My Hosting
3. Click Manage on your shared hosting service
4. Click Open Control Panel

### Method 2: Direct URL
Visit https://yourdomain.com:2083 and log in with your cPanel credentials.

## Section 1: Email Setup

### Creating an Email Account
1. Navigate to Email > Email Accounts
2. Click Create
3. Enter the email name (e.g., info)
4. Select your domain from the dropdown
5. Set a strong password or use the generator
6. Set storage quota (default: 1GB)
7. Click Create Account

### Accessing Webmail
Visit https://webmail.yourdomain.com and log in with your full email address and password.

### Setting Up Email Forwarders
1. Navigate to Email > Forwarders
2. Click Add Forwarder
3. Enter the source address
4. Enter the destination address
5. Click Add Forwarder

## Section 2: Database Management

### Creating a MySQL Database
1. Navigate to Databases > MySQL Databases
2. Create New Database — enter a name
3. Click Create Database
4. Scroll to MySQL Users — add a new user with a strong password
5. Add User to Database — select both and click Add
6. Check ALL PRIVILEGES for full access

### Accessing phpMyAdmin
Navigate to Databases > phpMyAdmin and select your database from the left sidebar.

## Section 3: SSL Certificate Installation

### Automatic SSL (Let's Encrypt)
1. Navigate to Security > SSL/TLS Status
2. Click Run AutoSSL for all domains
3. Wait 2-5 minutes for provisioning
4. Enable Force HTTPS Redirect under Domains

### Manual SSL Installation
1. Navigate to Security > SSL/TLS > Install and Manage SSL
2. Paste your certificate, private key, and CA bundle
3. Click Install Certificate

## Section 4: File Management

### Using File Manager
1. Navigate to Files > File Manager
2. Navigate to public_html (your web root)
3. Upload files via the Upload button
4. Set correct permissions (755 for dirs, 644 for files)

### FTP Access Setup
1. Navigate to Files > FTP Accounts
2. Create a new FTP account
3. Use host: yourdomain.com, port: 21
4. Connect with FileZilla or WinSCP`,
  },
  {
    slug: 'vps-hardening-checklist',
    title: 'VPS Hardening Checklist: 15 Steps to Secure Your Server',
    category: 'vps-dedicated',
    excerpt: 'A comprehensive security hardening checklist for new VPS deployments: SSH, firewall, fail2ban, and more.',
    seoMeta: {
      title: 'VPS Hardening Checklist — 15 Security Steps | VaultHost KB',
      description: 'Secure your VPS with this 15-step hardening checklist: SSH key auth, UFW firewall, fail2ban, automatic updates, and intrusion detection.',
      keywords: ['vps security', 'server hardening', 'ssh security', 'linux firewall', 'fail2ban setup'],
    },
    content: `## Why Hardening Matters

A fresh VPS install is vulnerable by default. This checklist covers the 15 most critical steps to secure your server before going to production.

### Step 1: Update All Packages

\`\`\`bash
apt update && apt upgrade -y
apt autoremove -y
\`\`\`

### Step 2: Create a Non-Root User

\`\`\`bash
adduser deploy
usermod -aG sudo deploy
\`\`\`

### Step 3: Set Up SSH Key Authentication

On your local machine:
\`\`\`bash
ssh-keygen -t ed25519 -C "your@email.com"
ssh-copy-id deploy@your-server-ip
\`\`\`

### Step 4: Disable Root Login and Password Auth

Edit /etc/ssh/sshd_config:
\`\`\`
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222
\`\`\`
Then: systemctl restart sshd

### Step 5: Configure UFW Firewall

\`\`\`bash
ufw allow 2222/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
\`\`\`

### Step 6: Install fail2ban

\`\`\`bash
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban
\`\`\`

### Step 7: Enable Automatic Security Updates

\`\`\`bash
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades
\`\`\`

### Step 8: Install and Configure AIDE (Intrusion Detection)

\`\`\`bash
apt install aide -y
aideinit
cp /var/lib/aide/aide.db.new /var/lib/aide/aide.db
\`\`\`

### Step 9: Secure Shared Memory

Edit /etc/fstab and add:
\`\`\`
tmpfs /run/shm tmpfs defaults,noexec,nosuid 0 0
\`\`\`
Then: mount -o remount /run/shm

### Step 10: Disable Unused Services

\`\`\`bash
systemctl disable --now avahi-daemon cups bluetooth
\`\`\`

### Step 11: Set Up Logwatch

\`\`\`bash
apt install logwatch -y
\`\`\`

### Step 12: Configure Time Synchronization

\`\`\`bash
timedatectl set-ntp true
\`\`\`

### Step 13: Install and Configure rkhunter

\`\`\`bash
apt install rkhunter -y
rkhunter --update
rkhunter --propupd
\`\`\`

### Step 14: Secure Sysctl Settings

Edit /etc/sysctl.conf:
\`\`\`
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
\`\`\`
Then: sysctl -p

### Step 15: Set Up Regular Backups

Use VaultHost's built-in backup system or configure rsync to a remote server:
\`\`\`bash
rsync -avz --delete /var/www/ backup@remote:/backups/$(date +%Y%m%d)/
\`\`\`

## Verification

After completing all 15 steps, run:
\`\`\`bash
ss -tlnp  # Check listening ports
ufw status verbose  # Verify firewall
systemctl list-units --type=service --state=running  # Check running services
\`\`\``,
  },
  {
    slug: 'backup-and-disaster-recovery',
    title: 'Backup and Disaster Recovery: Ensuring Business Continuity',
    category: 'getting-started',
    excerpt: 'Understand VaultHost backup architecture, retention policies, and how to build a disaster recovery plan.',
    seoMeta: {
      title: 'Backup and Disaster Recovery Guide | VaultHost KB',
      description: 'Learn about VaultHost backup architecture, retention policies, restore procedures, and how to build a complete disaster recovery plan.',
      keywords: ['backup strategy', 'disaster recovery', 'backup retention', 'restore from backup', 'business continuity'],
    },
    content: `## Backup Architecture

VaultHost provides multi-tier backup protection across all hosting plans.

### Backup Tiers by Plan

| Plan | Backup Frequency | Retention | Storage |
|------|-----------------|-----------|--------|
| Shared | Daily | 7 days | Local + Remote |
| WordPress | Daily + Hourly snapshots | 30 days | Local + Remote |
| VPS | Daily | 14 days | Local + Remote |
| Cloud | Daily + Real-time snapshots | 30 days | Multi-region |
| Dedicated | Daily + Custom schedules | 30 days | Multi-region |

### What Is Backed Up

- Website files (public_html, configs)
- Databases (MySQL, PostgreSQL)
- Email accounts and data
- DNS zone records
- SSL certificate data
- Control panel settings

### What Is NOT Backed Up

- Temporary files (/tmp)
- Log files (configurable)
- Cache directories
- Custom off-server backups (you manage these)

## Restore Procedures

### Full Restore via Portal
1. Log in to your client portal
2. Navigate to My Hosting > select service
3. Click Restore Backup
4. Select the backup date from the calendar
5. Choose what to restore (files, database, email, all)
6. Click Restore
7. Wait for confirmation email (5-15 minutes)

### Partial Restore via cPanel
1. Navigate to Files > Backup
2. Download a Backup Section
3. Select the section to restore
4. Upload the backup file

## Disaster Recovery Planning

### RTO and RPO

- **RTO (Recovery Time Objective):** How fast you need to be back online
- **RPO (Recovery Point Objective):** How much data loss is acceptable

### Recommended DR Plan

1. **Identify critical systems** — which services must be online first
2. **Set RTO/RPO targets** — e.g., RTO 4 hours, RPO 1 hour
3. **Configure backup frequency** — match to RPO
4. **Test restores monthly** — verify backups work
5. **Document the runbook** — step-by-step recovery procedures
6. **Assign roles** — who does what during recovery
7. **Off-site backups** — keep a copy outside VaultHost for worst case

### Multi-Region Replication

Cloud and Dedicated plan customers can enable multi-region replication:
1. Navigate to portal > service > Replication
2. Select secondary region (e.g., Pune to Delhi NCR)
3. Choose replication mode (async or sync)
4. Enable replication

In a regional outage, failover to the secondary region via:
1. Portal > Disaster Recovery > Initiate Failover
2. Confirm the failover
3. DNS automatically updates to secondary region
4. Service is back online within minutes`,
  },
  {
    slug: 'getting-started-guide',
    title: 'Getting Started with VaultHost',
    category: 'getting-started',
    excerpt: 'Everything you need to know to set up your first hosting account.',
    seoMeta: {
      title: 'Getting Started with VaultHost — Quick Start Guide | VaultHost KB',
      description: 'Learn how to create your VaultHost account, deploy your first server, point your domain, and launch your website in under 10 minutes.',
      keywords: ['getting started hosting', 'vaulthost setup', 'first hosting account', 'deploy website'],
    },
    content: `## Welcome to VaultHost

VaultHost is ELSxGlobal's infinite-scale cloud infrastructure platform. This guide walks you through your first deployment.

### Step 1: Create an Account

1. Visit /vaulthost/signup
2. Enter your email and create a password
3. Verify your email address
4. Complete your profile

### Step 2: Choose a Plan

1. Browse plans at /vaulthost/pricing
2. Select the plan that fits your needs
3. Choose your billing cycle (monthly, semi-annual, or annual)
4. Add any optional add-ons (SSL, backups, managed support)

### Step 3: Configure Your Server

During checkout you can select:
- **Operating System:** Ubuntu 22.04, Debian 12, AlmaLinux 9, or Windows Server 2022
- **Control Panel:** cPanel, Plesk, DirectAdmin, or none (raw server)
- **Server Location:** Pune, Delhi NCR, or Mumbai (India); Eindhoven (EU); Chicago (US)

### Step 4: Point Your Domain

1. Update your domain's nameservers to the ones provided in your welcome email
2. Or add an A record pointing to your server IP
3. Wait for DNS propagation (see our DNS Propagation guide)

### Step 5: Launch Your Site

1. Access your control panel via the portal
2. Upload your website files
3. Configure your database if needed
4. Enable SSL via AutoSSL
5. Your site is now live!

### Need Help?

- Open a support ticket from your portal
- Browse our knowledge base for detailed guides
- Chat with us on WhatsApp at +91-72475-58873`,
  },
  {
    slug: 'vps-setup-guide',
    title: 'Setting Up Your VPS',
    category: 'vps-dedicated',
    excerpt: 'A step-by-step guide to configuring your new VPS from scratch.',
    seoMeta: {
      title: 'Setting Up Your VPS — Complete Configuration Guide | VaultHost KB',
      description: 'Step-by-step VPS setup: OS selection, SSH configuration, firewall, web server installation, and first website deployment.',
      keywords: ['vps setup', 'vps configuration', 'linux vps guide', 'server setup tutorial'],
    },
    content: `## Getting Started with Your VPS

Your new VPS gives you full root access to a dedicated virtual machine. Here's how to set it up from scratch.

### Step 1: Access Your VPS

\`\`\`bash
ssh root@your-server-ip
\`\`\`

Use the root password from your welcome email. For security, change it immediately:

\`\`\`bash
passwd
\`\`\`

### Step 2: Update the System

\`\`\`bash
apt update && apt upgrade -y   # Debian/Ubuntu
dnf update -y                   # AlmaLinux
\`\`\`

### Step 3: Create a Non-Root User

\`\`\`bash
adduser deploy
usermod -aG sudo deploy   # Ubuntu/Debian
usermod -aG wheel deploy  # AlmaLinux
\`\`\`

### Step 4: Configure SSH Key Authentication

On your local machine:

\`\`\`bash
ssh-keygen -t ed25519
ssh-copy-id deploy@your-server-ip
\`\`\`

Then disable root login and password auth in /etc/ssh/sshd_config:

\`\`\`
PermitRootLogin no
PasswordAuthentication no
\`\`\`

Restart SSH: \`systemctl restart sshd\`

### Step 5: Configure Firewall

\`\`\`bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
\`\`\`

### Step 6: Install a Web Server

**Nginx:**
\`\`\`bash
apt install nginx -y
systemctl enable nginx
\`\`\`

**Apache:**
\`\`\`bash
apt install apache2 -y
systemctl enable apache2
\`\`\`

### Step 7: Install PHP and MySQL (LEMP/LAMP)

\`\`\`bash
apt install php-fpm php-mysql mysql-server -y
mysql_secure_installation
\`\`\`

### Step 8: Deploy Your First Site

1. Create a web root: \`mkdir -p /var/www/mydomain.com\`
2. Upload your files
3. Configure your web server virtual host
4. Install SSL with Certbot: \`apt install certbot python3-certbot-nginx\`

### Next Steps

- Read our VPS Hardening Checklist for 15 security steps
- Set up automatic backups from the portal
- Configure monitoring alerts`,
  },
  {
    slug: 'wordpress-installation',
    title: 'Installing WordPress on VaultHost',
    category: 'wordpress',
    excerpt: 'One-click WordPress installation and manual setup methods.',
    seoMeta: {
      title: 'Installing WordPress on VaultHost — 1-Click & Manual Guide | VaultHost KB',
      description: 'Install WordPress on VaultHost via 1-click installer, Softaculous, or manual installation. Includes WP-CLI setup and configuration tips.',
      keywords: ['wordpress installation', 'install wordpress', 'vaulthost wordpress', '1-click wordpress', 'wp-cli'],
    },
    content: `## Installing WordPress on VaultHost

VaultHost supports three methods for installing WordPress.

### Method 1: One-Click Installer (Recommended)

1. Log in to your client portal
2. Navigate to My Services > Manage
3. Click "1-Click Apps"
4. Select WordPress
5. Choose your domain
6. Enter your site name and admin credentials
7. Click Install
8. WordPress is ready in 30 seconds

### Method 2: Via cPanel / Softaculous

1. Open cPanel from the portal
2. Navigate to Software > Softaculous
3. Find WordPress
4. Click Install
5. Choose protocol (https://)
6. Select your domain
7. Set admin username and password
8. Click Install

### Method 3: Manual Installation

1. Download WordPress from wordpress.org
2. Upload via File Manager or FTP to public_html
3. Create a MySQL database and user in cPanel
4. Rename wp-config-sample.php to wp-config.php
5. Add your database credentials
6. Visit yourdomain.com/wp-admin/install.php
7. Follow the setup wizard

### Method 4: WP-CLI (VPS/Cloud)

\`\`\`bash
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp
cd /var/www/mydomain.com
wp core download
wp config create --dbname=mydb --dbuser=myuser --dbpass=mypassword
wp core install --url=mydomain.com --title="My Site" --admin_user=admin --admin_password=secret --admin_email=me@example.com
\`\`\`

### Post-Installation Checklist

- Set permalinks to Post Name (Settings > Permalinks)
- Install an SSL certificate
- Configure automatic backups
- Install a caching plugin (WP Super Cache or W3 Total Cache)
- Remove default plugins and themes
- Set up a security plugin (Wordfence or Sucuri)`,
  },
  {
    slug: 'ssl-setup',
    title: 'SSL Certificate Setup',
    category: 'security',
    excerpt: 'How to install and manage free SSL certificates on your hosting.',
    seoMeta: {
      title: 'SSL Certificate Setup — Free Lets Encrypt SSL Guide | VaultHost KB',
      description: 'Install free SSL certificates on VaultHost via AutoSSL, cPanel, or Certbot. Includes wildcard SSL and force HTTPS redirect setup.',
      keywords: ['ssl setup', 'free ssl certificate', 'lets encrypt ssl', 'https setup', 'ssl installation'],
    },
    content: `## SSL Certificate Setup

All VaultHost plans include free SSL certificates via Let's Encrypt.

### Method 1: AutoSSL via cPanel (Shared Hosting)

1. Log in to cPanel
2. Navigate to Security > SSL/TLS Status
3. Click "Run AutoSSL for all domains"
4. Wait 2-5 minutes for provisioning
5. Enable "Force HTTPS Redirect" under Domains

### Method 2: Via Portal

1. Log in to your client portal
2. Navigate to My Services > Manage
3. Click "SSL Certificates"
4. Click "Issue Free SSL"
5. Select your domain
6. Click Install

### Method 3: Certbot on VPS/Cloud

\`\`\`bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com -d www.yourdomain.com
\`\`\`

For Apache:
\`\`\`bash
apt install certbot python3-certbot-apache -y
certbot --apache -d yourdomain.com -d www.yourdomain.com
\`\`\`

### Wildcard SSL

For wildcard certificates (*.yourdomain.com):

\`\`\`bash
certbot certonly --manual --preferred-challenges dns -d *.yourdomain.com -d yourdomain.com
\`\`\`

You'll need to add a DNS TXT record as prompted.

### Force HTTPS Redirect

**Nginx:**
\`\`\`
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
\`\`\`

**Apache (.htaccess):**
\`\`\`
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
\`\`\`

### Auto-Renewal

Let's Encrypt certificates expire every 90 days. VaultHost auto-renews them 30 days before expiry. On VPS, Certbot sets up a cron job automatically.

### Premium SSL

For EV (Extended Validation) or OV (Organization Validation) certificates, browse our SSL add-ons at /vaulthost/ssl.`,
  },
  {
    slug: 'payment-methods',
    title: 'Payment Methods and Billing',
    category: 'billing',
    excerpt: 'Understanding your billing cycle, payment options, and invoices.',
    seoMeta: {
      title: 'Payment Methods and Billing — Complete Guide | VaultHost KB',
      description: 'Learn about VaultHost payment methods (Razorpay, UPI/QR, bank transfer), billing cycles, invoices, refunds, and how manual payment verification works.',
      keywords: ['payment methods', 'billing guide', 'upi payment', 'razorpay', 'invoice', 'hosting payment'],
    },
    content: `## Payment Methods

VaultHost supports multiple payment methods for your convenience.

### Available Payment Methods

#### 1. Razorpay (Instant)
- Credit/Debit cards (Visa, Mastercard, RuPay, Amex)
- Net banking (50+ banks)
- UPI via Razorpay
- Wallets (Paytm, Mobikwik, Freecharge)
- **Activation:** Instant after payment

#### 2. UPI / QR Code (Manual Verification)
- Scan QR with any UPI app (GPay, PhonePe, Paytm, BHIM)
- Upload payment screenshot/proof
- **Activation:** Within 2-4 hours after verification
- Admin can configure custom UPI ID and QR image

#### 3. Bank Transfer (Manual Verification)
- NEFT/IMPS/RTGS transfer
- Upload transaction reference or screenshot
- **Activation:** Within 2-4 hours after verification

### Billing Cycles

| Cycle | Duration | Discount |
|------|----------|----------|
| Monthly | 1 month | — |
| Semi-Annual | 6 months | 5% off |
| Annual | 12 months | 16.7% off (2 months free) |

### Invoices

- Invoices are generated automatically at the start of each billing cycle
- View and download invoices from Portal > Billing & Profile
- Unpaid invoices are due within 7 days
- Overdue invoices may result in service suspension

### Manual Payment Verification

For UPI and bank transfer payments:

1. Make your payment via UPI or bank transfer
2. Upload proof (screenshot, reference number, or UTR)
3. Our team verifies the payment within 2-4 hours
4. You receive an email confirmation once verified
5. Your service is activated immediately after verification

### Refunds

- 30-day money-back guarantee on all shared and WordPress hosting
- Refunds processed within 5-7 business days
- Domain registrations and SSL certificates are non-refundable

### Auto-Renewal

- Enable auto-renewal from Portal > Billing & Profile
- We'll automatically charge your saved payment method
- Disable auto-renewal anytime; service continues until the end of the current cycle`,
  },
  {
    slug: 'ssh-access-vps',
    title: 'SSH Access on VPS',
    category: 'vps-dedicated',
    excerpt: 'How to connect to your VPS via SSH and set up key-based authentication.',
    seoMeta: {
      title: 'SSH Access on VPS — Secure Connection Guide | VaultHost KB',
      description: 'Connect to your VaultHost VPS via SSH. Set up key-based authentication, change SSH port, and secure your server with fail2ban.',
      keywords: ['ssh access', 'vps ssh', 'ssh key authentication', 'ssh setup', 'secure ssh'],
    },
    content: `## Connecting to Your VPS via SSH

### Prerequisites

- Your server IP (from the welcome email or portal)
- Your root password or SSH key
- An SSH client (Terminal on Mac/Linux, PuTTY on Windows, or Windows Terminal)

### Basic SSH Connection

\`\`\`bash
ssh root@your-server-ip
\`\`\`

Enter your root password when prompted. Characters won't appear as you type — this is normal.

### Setting Up SSH Key Authentication

#### Step 1: Generate an SSH Key

On your local machine:

\`\`\`bash
ssh-keygen -t ed25519 -C "your@email.com"
\`\`\`

Press Enter to accept the default location. Set a passphrase for extra security (optional but recommended).

#### Step 2: Copy the Key to Your Server

\`\`\`bash
ssh-copy-id root@your-server-ip
\`\`\`

Or manually:

\`\`\`bash
cat ~/.ssh/id_ed25519.pub | ssh root@your-server-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
\`\`\`

#### Step 3: Disable Password Authentication

Edit /etc/ssh/sshd_config:

\`\`\`
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin prohibit-password
\`\`\`

Restart SSH: \`systemctl restart sshd\`

### Changing the SSH Port

For additional security, change the default port from 22:

1. Edit /etc/ssh/sshd_config
2. Change \`Port 22\` to \`Port 2222\` (or any unused port)
3. Update your firewall: \`ufw allow 2222/tcp\`
4. Restart SSH: \`systemctl restart sshd\`
5. Connect with: \`ssh -p 2222 root@your-server-ip\`

### Using SSH Config File

Simplify connections by adding to ~/.ssh/config on your local machine:

\`\`\`
Host myserver
    HostName your-server-ip
    User deploy
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
\`\`\`

Then just: \`ssh myserver\`

### SSH Tunneling

Forward a local port to access remote services:

\`\`\`bash
ssh -L 8080:localhost:80 myserver
\`\`\`

Now access the remote web server at localhost:8080 locally.

### Troubleshooting

- **Permission denied:** Check file permissions: \`chmod 700 ~/.ssh\` and \`chmod 600 ~/.ssh/authorized_keys\`
- **Connection refused:** Check if SSH is running: \`systemctl status sshd\`
- **Key rejected:** Ensure the key is in authorized_keys and has correct permissions`,
  },
  {
    slug: 'email-setup',
    title: 'Email Account Setup',
    category: 'shared-hosting',
    excerpt: 'Create and configure email accounts for your domain.',
    seoMeta: {
      title: 'Email Account Setup — cPanel & Webmail Guide | VaultHost KB',
      description: 'Create email accounts, set up forwarders, configure email clients (Outlook, Thunderbird), and access webmail on VaultHost shared hosting.',
      keywords: ['email setup', 'cpanel email', 'webmail access', 'email forwarding', 'email client setup'],
    },
    content: `## Email Account Setup

### Creating an Email Account via cPanel

1. Log in to cPanel (via portal or yourdomain.com:2083)
2. Navigate to Email > Email Accounts
3. Click "Create"
4. Enter the email name (e.g., info, support, admin)
5. Select your domain from the dropdown
6. Set a strong password (or use the generator)
7. Set storage quota (default: 1 GB, or unlimited)
8. Click "Create Account"

### Accessing Webmail

Visit \`https://yourdomain.com:2096\` or \`https://webmail.yourdomain.com\`

Log in with your full email address and password.

Three webmail clients are available:
- **Roundcube** (recommended — full-featured)
- **Horde** (calendar and task support)
- **SquirrelMail** (lightweight)

### Setting Up Email Forwarders

1. Navigate to Email > Forwarders
2. Click "Add Forwarder"
3. Enter the source address (e.g., info@yourdomain.com)
4. Choose destination:
   - Forward to email address
   - Forward to a system account
   - Discard with error to sender
5. Click "Add Forwarder"

### Configuring Email Clients

#### Outlook / Thunderbird / Apple Mail

| Setting | Value |
|---------|-------|
| Incoming Server | mail.yourdomain.com |
| IMAP Port | 993 (SSL) |
| POP3 Port | 995 (SSL) |
| Outgoing Server | mail.yourdomain.com |
| SMTP Port | 465 (SSL) |
| Username | Full email address |
| Password | Your email password |

#### Gmail (Fetch via POP3)

1. Gmail Settings > Accounts > Add a mail account
2. Enter your email address
3. Choose "Import emails from my other account (POP3)"
4. Enter server: mail.yourdomain.com, port 995, SSL
5. Enter username (full email) and password
6. Check "Always use SSL"

### Auto-Responders (Vacation Replies)

1. Navigate to Email > Autoresponders
2. Click "Add Autoresponder"
3. Select the email address
4. Set start and stop dates
5. Write your message
6. Click "Create"

### Spam Filtering

- **SpamAssassin** is enabled by default on all accounts
- Configure spam threshold in cPanel > Email > Spam Filters
- Whitelist/blacklist addresses as needed
- Enable "Spam Box" to route spam to a separate folder

### Email Authentication

Enable these in cPanel > Email > Authentication:
- **SPF:** Prevents sender spoofing
- **DKIM:** Signs outgoing emails digitally
- **DMARC:** Reports email authentication status

All three are recommended for reliable email delivery.`,
  },
  {
    slug: 'wordpress-staging',
    title: 'Using WordPress Staging Sites',
    category: 'wordpress',
    excerpt: 'Test changes on a staging copy before going live.',
    seoMeta: {
      title: 'Using WordPress Staging Sites — Test Before Launch | VaultHost KB',
      description: 'Create and manage WordPress staging sites on VaultHost. Clone your live site, test changes, and push to production safely.',
      keywords: ['wordpress staging', 'staging site', 'wordpress clone', 'test wordpress', 'staging environment'],
    },
    content: `## WordPress Staging Sites

Staging sites let you test changes (plugins, themes, code) on a copy of your live site before pushing to production.

### Creating a Staging Site via cPanel

1. Open cPanel from your portal
2. Navigate to Software > WordPress Manager
3. Find your WordPress installation
4. Click "Create Staging Copy"
5. Choose a subdomain or subdirectory (e.g., staging.yourdomain.com)
6. Click "Create"

The staging site is a complete clone of your live site, including:
- All files and themes
- Database content
- Plugin configurations

### Making Changes on Staging

1. Access your staging site at the staging URL
2. Log in to wp-admin
3. Make your changes:
   - Install/test new plugins
   - Update themes
   - Modify code
   - Test new content
4. Test thoroughly

### Pushing Staging to Production

#### Via WordPress Manager

1. Go to cPanel > WordPress Manager
2. Find your staging installation
3. Click "Copy to Production"
4. Choose what to copy:
   - Files only
   - Database only
   - Both (full clone)
5. Click "Copy"
6. Your live site is now updated

#### Manual Method

1. Export the staging database via phpMyAdmin
2. Download staging files via FTP
3. Upload files to the live site
4. Import the database to the live site
5. Update wp_options siteurl and home fields
6. Run a search-replace if the staging URL differs:

\`\`\`bash
wp search-replace 'https://staging.yourdomain.com' 'https://yourdomain.com' --path=/var/www/yourdomain.com
\`\`\`

### Best Practices

- Always backup your live site before pushing staging changes
- Use a different database prefix for staging (wp_staging_)
- Password-protect your staging site (cPanel > Privacy > Directory Privacy)
- Don't index staging sites in search engines (add noindex meta tag)
- Test on mobile devices before pushing to production

### WP Staging Plugin (Alternative)

If your plan doesn't include cPanel staging, use the free WP Staging plugin:

1. Install "WP Staging" from the plugin directory
2. Navigate to WP Staging > Create Staging Site
3. Wait for the clone to complete
4. Access your staging site at /staging1/
5. Make changes and test
6. Use WP Staging Pro to push changes back to live`,
  },
  {
    slug: 'ddos-protection',
    title: 'Understanding DDoS Protection',
    category: 'security',
    excerpt: 'How our DDoS mitigation works and what it protects against.',
    seoMeta: {
      title: 'Understanding DDoS Protection — VaultHost Shield Guide | VaultHost KB',
      description: 'Learn how VaultHost DDoS protection works, what attack types are mitigated, and how to respond during an active attack.',
      keywords: ['ddos protection', 'ddos mitigation', 'ddos attack', 'vaulthost shield', 'attack protection'],
    },
    content: `## DDoS Protection at VaultHost

All VaultHost plans include DDoS protection at no additional cost.

### What Is a DDoS Attack?

A Distributed Denial of Service (DDoS) attack floods your server with traffic from multiple sources, making it unavailable to legitimate users.

### Attack Types We Mitigate

#### Volumetric Attacks
UDP floods, ICMP floods, amplification attacks. Mitigated at the network edge by absorbing bandwidth.

#### Protocol Attacks
SYN floods, Ping of Death, Smurf attacks. Mitigated by rate limiting and protocol validation at layers 3-4.

#### Application Layer Attacks
HTTP floods, Slowloris, hash collision attacks. Mitigated by our Web Application Firewall (WAF) at layer 7.

### How Our Protection Works

#### Layer 1: Traffic Monitoring
All incoming traffic is continuously analyzed at our edge nodes. Baseline patterns are established per-customer.

#### Layer 2: Attack Detection
Anomalous traffic detected within 3-5 seconds using signature-based and behavioral analysis.

#### Layer 3: Traffic Scrubbing
Malicious traffic diverted to scrubbing centers in Mumbai and Pune. Clean traffic forwarded to your server.

#### Layer 4: Rate Limiting
Application-layer attacks mitigated via WAF rules and rate limiting at the edge.

### Protection Tiers

| Plan | Mitigation Capacity | Layers Protected |
|------|-------------------|-----------------|
| Shared | 2 Gbps | L3/L4 |
| VPS | 10 Gbps | L3/L4/L7 |
| Cloud | 50 Gbps | L3/L4/L7 + Custom WAF |
| Dedicated | 100 Gbps | L3/L4/L7 + Dedicated Scrubbing |

### During an Attack

1. Don't panic — our system detects and mitigates automatically
2. Check /vaulthost/status for active incidents
3. If your site is still affected, open a priority support ticket
4. For sustained attacks above 10 Gbps, contact our NOC directly

### Additional Protection

- Enable rate limiting in your .htaccess or nginx config
- Use Cloudflare in front of your site for additional CDN/WAF protection
- Keep your applications and plugins updated
- Use strong passwords and enable 2FA`,
  },
  {
    slug: 'backup-restore',
    title: 'Backup and Restore Guide',
    category: 'getting-started',
    excerpt: 'How to create, manage, and restore from backups.',
    seoMeta: {
      title: 'Backup and Restore Guide — VaultHost Data Protection | VaultHost KB',
      description: 'Learn about VaultHost backup tiers, how to restore from backup, and how to build a disaster recovery plan for your hosting.',
      keywords: ['backup guide', 'restore backup', 'hosting backup', 'disaster recovery', 'data protection'],
    },
    content: `## Backup and Restore

VaultHost provides multi-tier backup protection across all hosting plans.

### Backup Tiers by Plan

| Plan | Frequency | Retention | Storage |
|------|-----------|-----------|---------|
| Shared | Daily | 7 days | Local + Remote |
| WordPress | Daily + Hourly | 30 days | Local + Remote |
| VPS | Daily | 14 days | Local + Remote |
| Cloud | Daily + Real-time | 30 days | Multi-region |
| Dedicated | Daily + Custom | 30 days | Multi-region |

### What Is Backed Up

- Website files (public_html, configs)
- Databases (MySQL, PostgreSQL)
- Email accounts and data
- DNS zone records
- SSL certificate data
- Control panel settings

### Restoring from Backup

#### Full Restore via Portal

1. Log in to your client portal
2. Navigate to My Hosting > select service
3. Click "Restore Backup"
4. Select the backup date from the calendar
5. Choose what to restore (files, database, email, all)
6. Click "Restore"
7. Wait for confirmation email (5-15 minutes)

#### Partial Restore via cPanel

1. Navigate to Files > Backup
2. Download a Backup Section
3. Select the section to restore
4. Upload the backup file

### Manual Backups (VPS/Cloud)

\`\`\`bash
# Full server backup
rsync -avz --delete /var/www/ backup@remote:/backups/$(date +%Y%m%d)/

# Database backup
mysqldump -u root -p --all-databases > alldb_$(date +%Y%m%d).sql

# Compressed file backup
tar -czf www_backup_$(date +%Y%m%d).tar.gz /var/www/
\`\`\`

### Disaster Recovery

- **RTO (Recovery Time Objective):** How fast you need to be back online
- **RPO (Recovery Point Objective):** How much data loss is acceptable

### Recommended DR Plan

1. Identify critical systems
2. Set RTO/RPO targets (e.g., RTO 4h, RPO 1h)
3. Configure backup frequency to match RPO
4. Test restores monthly
5. Document recovery procedures
6. Keep off-site backups for worst-case scenarios

### Multi-Region Replication

Cloud and Dedicated customers can enable multi-region replication:

1. Portal > Service > Replication
2. Select secondary region (e.g., Pune to Delhi NCR)
3. Choose replication mode (async or sync)
4. Enable replication

During a regional outage, failover via Portal > Disaster Recovery > Initiate Failover.`,
  },
  {
    slug: 'upgrade-plan',
    title: 'Upgrading Your Hosting Plan',
    category: 'billing',
    excerpt: 'How to upgrade to a higher tier plan without downtime.',
    seoMeta: {
      title: 'Upgrading Your Hosting Plan — Zero Downtime Guide | VaultHost KB',
      description: 'Upgrade your VaultHost hosting plan with zero downtime. Learn about prorated billing, data migration, and what happens during an upgrade.',
      keywords: ['upgrade plan', 'hosting upgrade', 'plan migration', 'upgrade hosting', 'zero downtime upgrade'],
    },
    content: `## Upgrading Your Hosting Plan

VaultHost allows seamless upgrades between plans with zero downtime.

### When to Upgrade

Consider upgrading when:
- Your site traffic exceeds current resource limits
- You need more storage or bandwidth
- You require additional features (staging, CDN, dedicated IP)
- You need better performance (more CPU/RAM)

### How to Upgrade

#### Step 1: Browse Plans

1. Visit /vaulthost/pricing
2. Compare plans and features
3. Select your desired plan

#### Step 2: Initiate Upgrade

1. Log in to your client portal
2. Navigate to My Services > Manage
3. Click "Upgrade Plan"
4. Select the new plan
5. Choose billing cycle
6. Review prorated charges

#### Step 3: Complete Payment

- Pay the prorated difference via your preferred method
- If you have an active subscription, the new rate applies from the next cycle

#### Step 4: Migration

For shared/WordPress hosting:
- Migration is automatic and takes 5-10 minutes
- No downtime — your site stays online
- You'll receive an email confirmation

For VPS/Cloud/Dedicated:
- New resources are allocated within 2-5 minutes
- A reboot may be required for RAM/CPU changes
- Data is preserved — no migration needed

### Prorated Billing

When you upgrade mid-cycle:
- You only pay the difference for the remaining period
- Example: If you paid Rs 500/mo and upgrade to Rs 1000/mo on day 15:
  - Credit for unused days: Rs 250
  - New plan for remaining 15 days: Rs 500
  - Net charge: Rs 250

### What Happens During Upgrade

- Your website stays online (zero downtime)
- Files and databases are preserved
- Email accounts continue working
- SSL certificates remain active
- DNS records are unchanged
- Only server resources (CPU, RAM, storage, bandwidth) change

### Downgrading

To downgrade to a lower plan:
1. Ensure your usage fits within the lower plan's limits
2. Initiate downgrade from the portal
3. Excess data may need to be cleaned up first
4. Prorated credit is applied to your account

### FAQ

**Will my IP address change?**
No, your IP address stays the same during upgrades.

**Can I keep my billing cycle?**
Yes, your billing cycle is preserved. You only pay the prorated difference.

**What about add-ons?**
Add-ons remain active during upgrades. You can add or remove them anytime.`,
  },
];

export const kbCategories = [
  'getting-started',
  'shared-hosting',
  'vps-dedicated',
  'wordpress',
  'dns',
  'security',
  'billing',
];

export function getArticleBySlug(slug: string): KBArticle | undefined {
  return kbArticles.find((a) => a.slug === slug);
}

export function getAdjacentArticles(slug: string): { prev: KBArticle | null; next: KBArticle | null } {
  const idx = kbArticles.findIndex((a) => a.slug === slug);
  return {
    prev: idx > 0 ? kbArticles[idx - 1] : null,
    next: idx < kbArticles.length - 1 ? kbArticles[idx + 1] : null,
  };
}

export function getArticlesByCategory(category: string): KBArticle[] {
  return kbArticles.filter((a) => a.category === category);
}
