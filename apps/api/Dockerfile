FROM python:3.10-slim

WORKDIR /app

COPY apps/api/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire api application
COPY apps/api /app/apps/api

# Set Python path to include the root so imports work correctly if needed
ENV PYTHONPATH=/app

# Default command, overridden in docker-compose for worker
CMD ["uvicorn", "apps.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
