# Backend Dockerfile — FastAPI + ML models
# Build for ARM64 (Oracle VPS)
FROM python:3.12-slim

WORKDIR /app

# Install system deps for LightGBM/scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 curl && rm -rf /var/lib/apt/lists/*

# Install dependencies first (cached layer)
COPY requirements-backend.txt .
RUN pip install --no-cache-dir --no-deps xgboost lightgbm && \
    pip install --no-cache-dir -r requirements-backend.txt

# Copy backend code + models
COPY backend/ ./backend/
COPY models/ ./models/

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
