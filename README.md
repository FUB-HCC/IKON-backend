![Build images and push to registry](https://github.com/FUB-HCC/IKON-backend/workflows/Build%20images%20and%20push%20to%20registry/badge.svg)

![IKON logo](https://www.mi.fu-berlin.de/en/inf/groups/hcc/research/projects/ikon/IKON-Logo.png?width=500)

## Installation Guide

This guide will lead you through the process of building the IKON prototype (backend and frontend) for development and testing purposes. The deployment is done via [Docker](https://docs.docker.com/install/).

The guide is tailored to Linux systems. It is explicitly tested on [Ubuntu](https://ubuntu.com/) 16 but will work on most other distributions as well.

### Prerequisites
In the current form this software needs internet access to retrieve data from https://via.museumfuernaturkunde.berlin and http://nominatim.openstreetmap.org. In addition, you need a user account for https://via.museumfuernaturkunde.berlin to access the data. 

You will need [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed in order to run the backend.

### Installing

#### Running all containers

Important note: 
The project generates SSL/TLS certificates and passwords if none are found in the subrepo containing the secrets. For data retrieval from the VIA Wiki insert your password into the ```ikoncode_secrets``` file. If you change the port mapping in the docker compose file, you have to adjust the urls in the following installation guide.

Step by step installation guide:

1. First you need to clone the repository.
In order to do that navigate to the folder where you want to install the project and execute:

```
git clone --recurse-submodules -j8 https://github.com/FUB-HCC/IKON-backend.git
```
2. Generate the necessary configs and build the containers:
```
cd IKON-backend/
bash ./start.sh
```
3. Once everything is built and all services are running, exit the process by pressing Ctrl+C.

4. Insert the VIA password into the secrets fileand change the ```protocol``` attribute to http:
```
vi ./assets/secrets/ikoncode_secrets
```

5. Then proceed running the containers:
```
bash ./start.sh
```
In order to display all possible options of the start script, run:
```
bash ./start.sh -h
```

6. Insert data from MfN VIA (see [API documentation](https://fub-hcc.github.io/IKON/docs/dal.html#doc-general-notes)):
```
curl -X PATCH "https://localhost/api/projects" -k
curl -X PATCH "https://localhost/api/knowledgeTransferActivities" -k
```
7. Insert geolocations of institutions from [nominatim.openstreetmap.org](http://nominatim.openstreetmap.org):
```
curl -X PATCH "https://localhost/api/institutions" -k
```

8. First check of installation: 
Run queries from [API documentation](https://fub-hcc.github.io/IKON/docs/dal.html)
```
curl -X GET "https://localhost/api/projects" -k
curl -X GET "https://localhost/api/institutions" -k
curl -X GET "https://localhost/api/knowledgeTransferActivities" -k
```

9. Start the frontend: [https://localhost](https://localhost)

#### Updating the data

In order to update the data, delete and rebuild the database by executing:
```
docker-compose down
docker volume rm ikon-backend_ikon_database
bash start.sh
```

### Coding style

This project uses ESLint and (Pylint) for code-style checking. 
To run the linter execute the following line in the root folder of this repository:

```
npx eslint .
```

### FAQ

#### Q: My GET requests return an error after starting the application. What could it be?

Check if the database is ready by inspecting the logs via ```docker logs Postgres```.


## Authors
* [Tim Korjakow](https://github.com/wittenator)
* [Lilli Joppien](https://github.com/lillijo)
* [Christoph Kinkeldey](https://github.com/ckinkeldey)

## License

This project is licensed under the APGL 3 License - see the [LICENSE](LICENSE) file for detail
