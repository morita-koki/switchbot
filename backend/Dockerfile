FROM python:3.11-slim
WORKDIR /app
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
COPY pyproject.toml .
# 仮のpyproject.tomlがない場合のためにエラー回避
RUN touch pyproject.toml
# 基本ライブラリを一気に入れる
RUN uv pip install --system fastapi uvicorn requests python-dotenv apscheduler openai
# COPY . .
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]