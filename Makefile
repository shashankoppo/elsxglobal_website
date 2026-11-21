# =================================================================
# ELSxGlobal + VaultHost — Command Center
# =================================================================
# Usage: make <target>
# Run 'make help' for all available commands
#
# NOTES:
#   - Most targets invoke Docker Compose (works on dev machine too)
#   - Server-side operations use ./scripts/manage.sh
#   - Windows: Use Git Bash, WSL2, or PowerShell with Docker Desktop
# =================================================================

.PHONY: help dev build up down restart deploy logs logs-app logs-db logs-auth \
        status health backup restore migrate shell psql studio typecheck lint \
        install clean setup env pull top version

COMPOSE   := docker compose
PROJECT   := elsxglobal
APP_URL   := http://localhost
MANAGE    := bash ./scripts/manage.sh

# =================================================================
# HELP
# =================================================================
help:
	@echo ""
	@echo "\033[1m\033[36mELSxGlobal + VaultHost — Command Center\033[0m"
	@echo "\033[36mUsage:\033[0m make <target>"
	@echo ""
	@echo "\033[1mDEVELOPMENT\033[0m"
	@echo "  \033[32minstall\033[0m          Install npm dependencies"
	@echo "  \033[32mdev\033[0m              Start Next.js dev server (port 3000)"
	@echo "  \033[32mbuild\033[0m            Build the Docker image"
	@echo "  \033[32mtypecheck\033[0m        Run TypeScript type check (npx tsc --noEmit)"
	@echo "  \033[32mlint\033[0m             Run ESLint"
	@echo "  \033[32menv\033[0m              Copy .env.example to .env (safe, no overwrite)"
	@echo ""
	@echo "\033[1mDOCKER LIFECYCLE\033[0m"
	@echo "  \033[32msetup\033[0m            First-time: pull images + start all services"
	@echo "  \033[32mup\033[0m               Start all services (docker compose up -d)"
	@echo "  \033[32mdown\033[0m             Stop all services"
	@echo "  \033[32mrestart\033[0m          Restart all services"
	@echo "  \033[32mpull\033[0m             Pull latest Docker images"
	@echo "  \033[32mdeploy\033[0m           git pull + build + up (full redeploy)"
	@echo "  \033[32mclean\033[0m            Remove dangling Docker images and cache"
	@echo ""
	@echo "\033[1mOBSERVABILITY\033[0m"
	@echo "  \033[32mstatus\033[0m           Show all container status"
	@echo "  \033[32mhealth\033[0m           Full health check (app + DB + disk + memory)"
	@echo "  \033[32mlogs\033[0m             Stream all service logs"
	@echo "  \033[32mlogs-app\033[0m         Stream app logs only"
	@echo "  \033[32mlogs-db\033[0m          Stream database logs only"
	@echo "  \033[32mlogs-auth\033[0m        Stream auth (GoTrue) logs"
	@echo "  \033[32mtop\033[0m              Live Docker resource monitor"
	@echo "  \033[32mversion\033[0m          Show versions of all components"
	@echo ""
	@echo "\033[1mDATABASE\033[0m"
	@echo "  \033[32mbackup\033[0m           Create DB backup"
	@echo "  \033[32mrestore\033[0m          Interactive restore from backup"
	@echo "  \033[32mmigrate\033[0m          Run pending database migrations"
	@echo "  \033[32mpsql\033[0m             Open psql console"
	@echo ""
	@echo "\033[1mSHELL ACCESS\033[0m"
	@echo "  \033[32mshell\033[0m            Shell into app container"
	@echo "  \033[32mstudio\033[0m           Print Supabase Studio URL"
	@echo ""

# =================================================================
# DEVELOPMENT
# =================================================================
install:
	npm install

dev:
	npm run dev

build:
	$(COMPOSE) build app

typecheck:
	npx tsc --noEmit

lint:
	npm run lint

env:
	@[ -f .env ] && echo ".env already exists (not overwriting)" || (cp .env.example .env && echo ".env created from .env.example")

# =================================================================
# DOCKER LIFECYCLE
# =================================================================
setup:
	@echo "→ Pulling all Docker images..."
	$(COMPOSE) pull
	@echo "→ Starting all services..."
	$(COMPOSE) up -d
	@echo "→ Waiting 15 seconds for services to initialize..."
	@sleep 15
	$(COMPOSE) ps

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

pull:
	$(COMPOSE) pull

deploy:
	git pull origin main
	$(COMPOSE) pull --ignore-buildable
	$(COMPOSE) up -d --build

clean:
	docker system prune -f

# =================================================================
# OBSERVABILITY
# =================================================================
status:
	$(COMPOSE) ps

health:
	@curl -sf $(APP_URL)/api/health | python3 -m json.tool 2>/dev/null || \
	 curl -sf $(APP_URL)/api/health || echo "App health endpoint unreachable"

logs:
	$(COMPOSE) logs -f --tail=100

logs-app:
	$(COMPOSE) logs -f --tail=200 app

logs-db:
	$(COMPOSE) logs -f --tail=100 db

logs-auth:
	$(COMPOSE) logs -f --tail=100 auth

top:
	docker stats

version:
	@echo "App:         $$(cat package.json | python3 -c "import sys,json; print(json.load(sys.stdin)['version'])" 2>/dev/null || echo N/A)"
	@echo "Node.js:     $$(docker exec elsxglobal-app node --version 2>/dev/null || echo N/A)"
	@echo "PostgreSQL:  $$(docker exec supabase-db psql -U postgres -tAc 'SELECT version()' 2>/dev/null | head -c 60 || echo N/A)"
	@echo "Docker:      $$(docker version --format '{{.Server.Version}}' 2>/dev/null)"
	@echo "Compose:     $$(docker compose version --short 2>/dev/null)"

# =================================================================
# DATABASE
# =================================================================
backup:
	$(MANAGE) backup

restore:
	$(MANAGE) restore

migrate:
	$(MANAGE) migrate

psql:
	docker exec -it supabase-db psql -U postgres -d postgres

# =================================================================
# SHELL ACCESS
# =================================================================
shell:
	docker exec -it elsxglobal-app /bin/bash

studio:
	$(MANAGE) studio-url
