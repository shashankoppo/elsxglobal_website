# VaultHost Self-Hosted Backend Deployment Guide

## Prerequisites
- Proxmox VE 8+ server
- Domain pointed to Proxmox server (vaulthost.cloud)
- Ubuntu 22.04 LXC template downloaded on Proxmox

## Quick Start (Docker Compose on existing server)

### 1. Clone config
```bash
git clone ...
cd deploy
cp .env.example .env
nano .env  # Fill in your values
```

### 2. Start all services
```bash
docker compose -f docker-compose.dns.yml up -d
docker compose -f docker-compose.storage.yml up -d
docker compose -f docker-compose.ai-gateway.yml up -d
docker compose -f docker-compose.tunnel.yml up -d
docker compose -f docker-compose.rabbitmq.yml up -d
```

### 3. Configure DNS nameservers
Point your domain registrar to:
- ns1.vaulthost.cloud → YOUR_SERVER_IP
- ns2.vaulthost.cloud → YOUR_SERVER_IP (or secondary)

### 4. Update Admin provisioning settings
Go to /admin → Provisioning Settings and enter:
- PowerDNS URL: http://YOUR_SERVER_IP:8081
- PowerDNS API Key: (from .env PDNS_API_KEY)
- MinIO Endpoint: http://YOUR_SERVER_IP:9000
- MinIO Access Key: (from .env MINIO_ACCESS_KEY)
- MinIO Secret Key: (from .env MINIO_SECRET_KEY)
- LiteLLM Base URL: http://YOUR_SERVER_IP:4000
- LiteLLM Master Key: (from .env LITELLM_MASTER_KEY)
- frp Server URL: http://YOUR_SERVER_IP:7400
- frp Server Token: (from frps.toml auth.token)
- RabbitMQ URL: amqp://user:pass@YOUR_SERVER_IP:5672
- RabbitMQ Management URL: http://YOUR_SERVER_IP:15672

## Proxmox LXC Deployment (Recommended for Production)
```bash
cd deploy/ansible
pip install ansible
ansible-galaxy install geerlingguy.docker community.general community.docker
ansible-playbook -i inventory.yml create-lxcs.yml
ansible-playbook -i inventory.yml deploy-services.yml
```

## Service Ports Reference
| Service | Port | Purpose |
|---|---|---|
| PowerDNS | 53 | DNS queries |
| PowerDNS API | 8081 | Management API |
| MinIO | 9000 | S3 API |
| MinIO Console | 9001 | Web UI |
| LiteLLM | 4000 | AI proxy |
| frp Server | 7000 | Client connections |
| frp Admin | 7400 | Management API |
| frp Dashboard | 7500 | Web UI |
| RabbitMQ AMQP | 5672 | Queue protocol |
| RabbitMQ Mgmt | 15672 | Management API |
| Coolify | 8000 | Pages/CI-CD |
