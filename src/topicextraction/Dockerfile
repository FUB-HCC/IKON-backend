FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

RUN pip install poetry

# We copy just the requirements.txt first to leverage Docker cache
ADD ./pyproject.toml ./pyproject.toml
ADD ./poetry.lock ./poetry.lock

RUN poetry config virtualenvs.create false
RUN poetry install --no-dev

RUN python -m spacy download de_core_news_sm


# Create app directory
WORKDIR /app

ADD ./src ./
ADD ./models /models

#ENTRYPOINT /start-reload.sh
