FROM tensorflow/tensorflow:latest-py3-jupyter

RUN pip install --user pipenv
ENV PATH="/root/.local/bin:/.local/bin:${PATH}"
ENV PYTHONPATH="/usr/lib/python35.zip:/usr/lib/python3.5:/usr/lib/python3.5/plat-x86_64-linux-gnu:/usr/lib/python3.5/lib-dynload:/.local/lib/python3.5/site-packages:/usr/local/lib/python3.5/dist-packages:/usr/lib/python3/dist-packages:${PYTHONPATH}"

RUN apt-get update
RUN apt-get install -y libsm6 libxext6 libxrender-dev libglib2.0-0 postgresql libpq-dev

# We copy just the requirements.txt first to leverage Docker cache
COPY ./src/topicextraction/Pipfile ./Pipfile
COPY ./src/topicextraction/Pipfile.lock ./Pipfile.lock

RUN pipenv install --deploy --system --ignore-pipfile
RUN python -m spacy download xx

# Bundle data
COPY /assets/data/nlp/ ./data/
