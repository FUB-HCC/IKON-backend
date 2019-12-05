![IKON logo](https://www.mi.fu-berlin.de/en/inf/groups/hcc/research/projects/ikon/IKON-Logo.png?width=500)

## Getting Started

This installation guide will lead you through the process of building the IKON prototype (backend and frontend) on your local machine for development and testing purposes. The deployment is done via [Docker](https://docs.docker.com/install/).

This installation guide is tailored to Linux systems. It is explicitly tested on [Ubuntu](https://ubuntu.com/) 16 but will work on most other distributions as well.

### Prerequisites
In the current form this software is tailored to retrieve data from the API at https://via.museumfuernaturkunde.berlin. You need a user account to get access to the data.

You will need [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed in order to run the backend.

### Installing

#### Running all containers

Important note: 
The project generates SSL/TLS certificates and passwords if none are found in the subrepo containing the secrets. If the VIA Wiki is going to be accessed, insert the real password into ```ikoncode_secrets```.

Step by step installation guide:

1. First you need to clone the repository.
In order to do that navigate to the folder where you want to save the project and execute:

```
git clone --recurse-submodules -j8 https://github.com/FUB-HCC/IKON-backend.git
```
2. Then proceed by building and running the containers:
```
cd IKON-backend/
bash ./start.sh
```
In order to display all possible options of the start script, run:
```
bash ./start.sh -h
```

3. Insert data from MfN VIA (see [API documentation](https://fub-hcc.github.io/IKON/docs/dal.html#doc-general-notes)):
```
curl -X PATCH "https://localhost:5433/projects" -k
curl -X PATCH "https://localhost:5433/knowledgeTransferActivities" -k
```
4. Insert geolocations of institutions from [nominatim.openstreetmap.org](http://nominatim.openstreetmap.org) (can take hours until completion):
```
curl -X PATCH "https://localhost:5433/institutions" -k
```

5. First check of installation: 
Run queries from [API documentation](https://fub-hcc.github.io/IKON/docs/dal.html)
```
curl -X GET "https://localhost:5433/projects" -k
curl -X GET "https://localhost:5433/institutions" -k
curl -X GET "https://localhost:5433/knowledgeTransferActivities" -k
```
#### Updating the data

If new data is available in any datasource, delete and rebuild the database by executing:
```
docker-compose down
docker volume rm ikon-backend_ikon_database
bash start.sh
```

#### Running the notebook

If you want to explore the topic extraction pipeline you can execute the bash script  in the root folder with or without the ```--gpu``` flag. If you want to use the GPU, you have to install [Nvidia-Docker2](https://github.com/nvidia/nvidia-docker/wiki/Installation-(version-2.0)) as well and set the nvidia runtime as your default in your docker daemon config. (See [this](https://stackoverflow.com/questions/47465696/how-do-i-specify-nvidia-runtime-from-docker-compose-yml)).
```
bash ./start.sh --notebook [--gpu]
```

### Coding style

This project uses ESLint and (Pylint) for code-style checking. 
To run the linter execute the following line in the root folder of this repository:

```
npx eslint .
```

## Authors
* [Tim Korjakow](https://github.com/wittenator)
* [Christoph Kinkeldey](https://github.com/ckinkeldey)
* [Lilli Joppien](https://github.com/lillijo)

## Built With

* [Express](http://expressjs.com/de/) - The web framework used
* [Scikit-Learn](http://scikit-learn.org/stable/index.html) - The framework for the NLP 
* [Spacy](https://spacy.io/) - Used for text pre-processing

## License

This project is licensed under the APGL 3 License - see the [LICENSE.md](LICENSE.md) file for detail
