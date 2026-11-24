.PHONY: help dev dev-all dev-api dev-admin dev-storefront dev-mobile api admin storefront mobile setup install db-migrate db-seed docker-up docker-down docker-logs clean-ports

help:
	@echo "Available shortcut commands:"
	@echo "  make dev             - Run API & Admin concurrently"
	@echo "  make dev-all         - Run API, SuperAdmin, Admin, & Storefront"
	@echo "  make dev-api         - Run Laravel API (port 8001)"
	@echo "  make dev-admin       - Run Admin Web / POS (port 5171)"
	@echo "  make dev-storefront  - Run Customer Storefront Web (port 5172)"
	@echo "  make clean-ports     - Kill any lingering processes on ports 8001, 8010, 5171-5174"
	@echo "  make dev-mobile      - Run Flutter Mobile POS"
	@echo "  make setup           - Setup dependencies & API environment"
	@echo "  make db-migrate      - Run Database Migrations"
	@echo "  make db-seed         - Seed Database"
	@echo "  make docker-up       - Start Docker Containers"
	@echo "  make docker-down     - Stop Docker Containers"

dev:
	npm run dev

dev-all:
	npm run dev:all

dev-api:
	npm run dev:api

api:
	npm run dev:api

dev-admin:
	npm run dev:admin

admin:
	npm run dev:admin

dev-storefront:
	npm run dev:storefront

storefront:
	npm run dev:storefront

dev-mobile:
	npm run dev:mobile

mobile:
	npm run dev:mobile

setup:
	npm run setup

install:
	npm install

db-migrate:
	npm run db:migrate

db-seed:
	npm run db:seed

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

clean-ports:
	lsof -ti:8001 -ti:8010 -ti:5171 -ti:5172 -ti:5173 -ti:5174 | xargs kill -9 2>/dev/null || true
