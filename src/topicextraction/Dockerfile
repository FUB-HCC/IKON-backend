FROM tiangolo/uvicorn-gunicorn-fastapi

# Create app directory
WORKDIR /app

# We copy just the requirements.txt first to leverage Docker cache
# COPY ./requirements.txt ./requirements.txt

# RUN pip install -r requirements.txt

# Bundle app source
COPY ./src/ .

EXPOSE 80
