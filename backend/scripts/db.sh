#!/bin/bash

# Database management scripts for SwitchBot backend

set -e

show_help() {
    echo "Available commands:"
    echo "  install             Install dependencies"
    echo "  db-migrate          Run database migrations"
    echo "  db-create-migration Create new migration (usage: ./scripts/db.sh db-create-migration 'message')"
    echo "  db-reset            Reset database (WARNING: deletes all data)"
    echo "  db-seed             Seed database with initial data"
    echo "  db-setup            Setup database (migrate + seed)"
    echo "  db-clean            Clean database file"
    echo "  dev                 Start development server"
}

install() {
    echo "Installing dependencies..."
    uv sync
}

db_migrate() {
    echo "Running database migrations..."
    alembic upgrade head
    echo "Migrations completed successfully!"
}

db_create_migration() {
    if [ -z "$1" ]; then
        echo "Please provide a message: ./scripts/db.sh db-create-migration 'your message'"
        exit 1
    fi
    echo "Creating new migration: $1"
    alembic revision --autogenerate -m "$1"
    echo "Migration created successfully!"
}

db_reset() {
    echo "WARNING: This will delete all data in the database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo "Removing database file..."
        rm -f ./db/app.db
        echo "Running migrations..."
        db_migrate
        echo "Database reset completed!"
    else
        echo "Operation cancelled."
    fi
}

db_seed() {
    echo "Seeding database with initial data..."
    python src/scripts/seed.py
    echo "Seeding completed successfully!"
}

db_setup() {
    echo "Setting up database..."
    db_migrate
    db_seed
    echo "Database setup completed!"
}

db_clean() {
    echo "Cleaning database file..."
    rm -f ./db/app.db
    echo "Database file removed!"
}

dev() {
    echo "Starting development server..."
    uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000
}

# Main script logic
case "$1" in
    install)
        install
        ;;
    db-migrate)
        db_migrate
        ;;
    db-create-migration)
        db_create_migration "$2"
        ;;
    db-reset)
        db_reset
        ;;
    db-seed)
        db_seed
        ;;
    db-setup)
        db_setup
        ;;
    db-clean)
        db_clean
        ;;
    dev)
        dev
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac