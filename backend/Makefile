.PHONY: help install db-migrate db-create-migration db-reset db-seed db-setup db-clean dev

# Default target
help:
	@echo "Available commands:"
	@echo "  install             Install dependencies"
	@echo "  db-migrate          Run database migrations"
	@echo "  db-create-migration Create new migration (usage: make db-create-migration MSG='message')"
	@echo "  db-reset            Reset database (WARNING: deletes all data)"
	@echo "  db-seed             Seed database with initial data"
	@echo "  db-setup            Setup database (migrate + seed)"
	@echo "  db-clean            Clean database file"
	@echo "  dev                 Start development server"

# Install dependencies
install:
	@echo "Installing dependencies..."
	uv sync

# Run database migrations
db-migrate:
	@echo "Running database migrations..."
	alembic upgrade head
	@echo "Migrations completed successfully!"

# Create new migration
db-create-migration:
	@if [ -z "$(MSG)" ]; then \
		echo "Please provide a message: make db-create-migration MSG='your message'"; \
		exit 1; \
	fi
	@echo "Creating new migration: $(MSG)"
	alembic revision --autogenerate -m "$(MSG)"
	@echo "Migration created successfully!"

# Reset database
db-reset:
	@echo "WARNING: This will delete all data in the database!"
	@read -p "Are you sure you want to continue? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "Removing database file..."; \
		rm -f ./db/app.db; \
		echo "Running migrations..."; \
		make db-migrate; \
		echo "Database reset completed!"; \
	else \
		echo "Operation cancelled."; \
	fi

# Seed database
db-seed:
	@echo "Seeding database with initial data..."
	python src/scripts/seed.py
	@echo "Seeding completed successfully!"

# Setup database (migrate + seed)
db-setup:
	@echo "Setting up database..."
	make db-migrate
	make db-seed
	@echo "Database setup completed!"

# Clean database file
db-clean:
	@echo "Cleaning database file..."
	rm -f ./db/app.db
	@echo "Database file removed!"

# Start development server
dev:
	@echo "Starting development server..."
	uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000