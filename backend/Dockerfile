FROM python:3.11-slim
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy application code
COPY src/ ./src/
COPY migrations/ ./migrations/
COPY alembic.ini ./
COPY scripts/ ./scripts/
COPY db/ ./db/

# Make scripts executable
RUN chmod +x ./scripts/db.sh

# Expose port
EXPOSE 8000

# Start application
CMD ["./scripts/db.sh", "dev"]