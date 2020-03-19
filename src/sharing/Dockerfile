FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

RUN pip install poetry

# We copy just the requirements.txt first to leverage Docker cache
ADD ./pyproject.toml ./pyproject.toml
ADD ./poetry.lock ./poetry.lock

RUN poetry config virtualenvs.create false
RUN poetry install


# Create app directory
WORKDIR /app

ADD ./src ./

ENTRYPOINT /start-reload.sh
