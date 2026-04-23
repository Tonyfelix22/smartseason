FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirement.txt .
RUN pip install --no-cache-dir -r requirement.txt

COPY . .

# Create staticfiles directory
RUN mkdir -p staticfiles

# Run collectstatic during build
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "smartseason.wsgi:application", "--bind", "0.0.0.0:8000"]