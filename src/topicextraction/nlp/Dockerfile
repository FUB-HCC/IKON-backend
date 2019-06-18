FROM tensorflow/tensorflow:nightly-py3-jupyter

WORKDIR /tf

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/.local/bin:${HOME}/.local/bin:/root/.local/bin:${PATH}"
#ENV PYTHONUSERBASE="/tf/.local"

RUN apt-get update 
RUN apt-get install -y libsm6 libxext6 libxrender-dev libglib2.0-0 postgresql libpq-dev python3-dev
RUN pip install --user pipenv

# We copy just the requirements.txt first to leverage Docker cache
COPY ./src/topicextraction/Pipfile ./Pipfile
COPY ./src/topicextraction/Pipfile.lock ./Pipfile.lock

RUN pipenv install
RUN python -m ipykernel install --user --name=ikon
#RUN pipenv lock -r > req.txt
#RUN pip3 install --user -r req.txt
#RUN pip3 install --user spacy
#RUN python3 tf/.local/lib/python3.6/site-packages/spacy download xx
#RUN pip3 install --user certifi

