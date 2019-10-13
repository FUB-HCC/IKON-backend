[![CircleCI](https://circleci.com/gh/FUB-HCC/IKON-backend/tree/master.svg?style=svg)](https://circleci.com/gh/FUB-HCC/IKON-backend/tree/master)

![IKON logo](https://www.mi.fu-berlin.de/en/inf/groups/hcc/research/projects/ikon/IKON-Logo.png?width=500)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You will need [Docker](https://docs.docker.com/install/), [Docker Compose](https://docs.docker.com/compose/install/) and [Git LFS](https://git-lfs.github.com/) installed in order to run the backend. 


### Installing

#### Running all containers

Important note: 
The project generates SSL/TLS certificates and passwords if none are found in the subrepo containing the secrets. If the VIA is going to accessed, insert the real password into ```ikoncode_secrets```.

A step by step series of examples that tell you how to get a development env running

First you need to clone the repository.
In order to do that navigate to the folder where you want to save the project and execute:

```
git clone --recurse-submodules -j8 https://github.com/FUB-HCC/IKON-backend.git
```
Then proceed by building and running the containers:
```
cd IKON-backend/
bash ./start.sh
```
Important note: 
The project generates SSL/TLS certificates and passwords if none are found in the subrepo containing the secrets. If the VIA is going to accessed, insert the real password into ```ikoncode-secrets```.

In order to discover all possible options run
```
bash ./start.sh -h
```

Insert data from MfN VIA (see [API documentation](https://fub-hcc.github.io/IKON/docs/dal.html#doc-general-notes)):
```
curl -X PATCH "https://localhost:5433/projects -k"
curl -X PATCH "https://localhost:5433/knowledgeTransferActivities -k"
```
Insert geolocations of institutions from [nominatim.openstreetmap.org](http://nominatim.openstreetmap.org) (can take hours until completion):
```
curl -X PATCH "https://localhost:5433/institutions -k"
```

First check: 
Run queries from [API documentation](https://fub-hcc.github.io/IKON/docs/dal.html)

#### Running the notebook

If you want to explore the topic extraction pipeline, you can execute the bash script in the root folder with or without the ```--gpu``` flag. If you want to use the GPU, you have to install [Nvidia-Docker2](https://github.com/nvidia/nvidia-docker/wiki/Installation-(version-2.0)) as well and set the nvidia runtime as your default in your docker daemon config. (See [this](https://stackoverflow.com/questions/47465696/how-do-i-specify-nvidia-runtime-from-docker-compose-yml)).
```
bash ./start --notebook [--gpu]
```

### Coding style

This project uses ESLint and (Pylint) for code-style checking. 
To run the linter execute the following line in the root folder of this repository:

```
npx eslint .
```

## Built With

* [Express](http://expressjs.com/de/) - The web framework used
* [Scikit-Learn](http://scikit-learn.org/stable/index.html) - The framework for the NLP 
* [Spacy](https://spacy.io/) - Used for text pre-processing


## Authors
* [Tim Korjakow](https://github.com/wittenator)


## License

This project is licensed under the APGL 3 License - see the [LICENSE.md](LICENSE.md) file for details
