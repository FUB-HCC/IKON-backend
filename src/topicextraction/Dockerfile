FROM tiangolo/uwsgi-nginx-flask:python3.6

# Create app directory
WORKDIR /app

#ENV PIPENV_VENV_IN_PROJECT="enabled"
ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/.local/bin:${HOME}/.local/bin:/root/.local/bin:${PATH}"

# We copy just the requirements.txt first to leverage Docker cache
# COPY ./requirements.txt ./requirements.txt

RUN pip install --user pipenv

# We copy just the requirements.txt first to leverage Docker cache
COPY ./Pipfile ./Pipfile
COPY ./Pipfile.lock ./Pipfile.lock
COPY ./nlp/dumps/ /data/

RUN pipenv install --system
RUN python -m spacy download de

# Bundle app source
COPY ./src/ /app

EXPOSE 80
