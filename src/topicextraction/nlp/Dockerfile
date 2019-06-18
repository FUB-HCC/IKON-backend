FROM tensorflow/tensorflow:nightly-py3-jupyter

WORKDIR /tf

ENV PATH="/.local/bin:/root/.local/bin:${PATH}"
ENV PYTHONPATH="/usr/lib/python35.zip:/usr/lib/python3.5:/usr/lib/python3.5/plat-x86_64-linux-gnu:/usr/lib/python3.5/lib-dynload:/.local/lib/python3.5/site-packages:/root/.local/lib/python3.5/site-packages:/.local/lib/python3.5/dist-packages:/usr/local/lib/python3.5/dist-packages:/usr/lib/python3/dist-packages:${PYTHONPATH}"
RUN pip3 install --user pipenv
RUN apt-get install -y libsm6 libxext6 libxrender-dev libglib2.0-0 postgresql libpq-dev pipenv

# We copy just the requirements.txt first to leverage Docker cache
COPY ./src/topicextraction/Pipfile ./Pipfile
COPY ./src/topicextraction/Pipfile.lock ./Pipfile.lock

RUN pipenv install --deploy --system --ignore-pipfile
#RUN pipenv lock -r > req.txt
#RUN pip3 install --user -r req.txt
RUN python3 -m spacy download xx

