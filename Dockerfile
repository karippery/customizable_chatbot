FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install latest poetry
RUN pip install --upgrade pip
RUN pip install poetry

# Configure poetry to not create virtual environment
RUN poetry config virtualenvs.create false

# Copy poetry files
COPY pyproject.toml poetry.lock* ./

# Install dependencies (without dev dependencies)
RUN poetry install --no-root --no-interaction --no-ansi

# Copy project
COPY . .

# Create static files directory
RUN mkdir -p static

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]