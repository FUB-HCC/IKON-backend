FROM tiangolo/uvicorn-gunicorn:python3.7

# Create app directory
WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/.local/bin:${HOME}/.local/bin:/root/.local/bin:${PATH}"

# We copy just the requirements.txt first to leverage Docker cache

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/.local/bin:${HOME}/.local/bin:/root/.local/bin:${PATH}"

RUN apt-get update
RUN apt-get install --fix-missing -y postgresql libpq-dev

RUN pip install --user poetry

# We copy just the requirements.txt first to leverage Docker cache
COPY ./pyproject.toml ./pyproject.toml
COPY ./poetry.lock ./poetry.lock

RUN poetry config virtualenvs.create false
RUN poetry install
RUN poetry run pip3 install torch==1.3.0+cpu torchvision==0.4.1+cpu -f https://download.pytorch.org/whl/torch_stable.html
RUN poetry run python -m spacy download de

ENTRYPOINT /start-reload.sh
