# Backend Dockerfile — FastAPI + ML models
# Build for ARM64 (Oracle VPS)
FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code + models
COPY backend/ ./backend/
COPY models/ ./models/

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
