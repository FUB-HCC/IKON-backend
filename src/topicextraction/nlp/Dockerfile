FROM jupyter/scipy-notebook:latest

# Create app directory
WORKDIR /home/jovyan/work

USER root
RUN apt-get update && apt-get -y install postgresql libpq-dev
USER jovyan

# We copy just the requirements.txt first to leverage Docker cache
COPY ./src/topicextraction/requirements.txt ./requirements.txt

ENV PATH="/home/jovyan/.local/bin:${PATH}"
RUN pip install --user -r requirements.txt
RUN python -m spacy download xx

# Bundle data
COPY /assets/data/nlp/ ./data/
