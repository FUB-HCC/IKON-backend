![Build images and push to registry](https://github.com/FUB-HCC/IKON-backend/workflows/Build%20images%20and%20push%20to%20registry/badge.svg)

![IKON logo](https://www.mi.fu-berlin.de/en/inf/groups/hcc/research/projects/ikon/IKON-Logo.png?width=500)

## Installation Guide

This guide will lead you through the process of building the IKON prototype (backend and frontend) for development and testing purposes. The deployment is done with [Docker](https://docs.docker.com/install/).

The guide is tailored to Linux systems. It is explicitly tested on [Ubuntu](https://ubuntu.com/) 18 but will work on most other distributions as well.

### Prerequisites
In the current form this prototype needs internet access to retrieve data from https://via.museumfuernaturkunde.berlin (VIA-Wiki, Museum für Naturkunde Berlin) and http://nominatim.openstreetmap.org (Geocoder, OpenStreetMap). In addition, you need a user account for the VIA-Wiki to access the data. 

You need [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed in order to run the backend.

### Installing

#### Running all containers

Important note: 
The project generates SSL/TLS certificates and passwords if none are found in the subrepo containing the secrets. If you change the port mapping in the docker compose file, you have to adjust the urls in the following installation guide.

Step by step installation guide:

1. First you need to clone the repository. Navigate to the installation folder and execute:

```
git clone --recurse-submodules -j8 https://github.com/FUB-HCC/IKON-backend.git
```
2. Start the shell script to generate the necessary configuration files and pull the containers:
```
cd IKON-backend/
bash ./start.sh pull
```
3. Insert your credentials for the VIA-Wiki into the ```ikoncode_secrets``` file. Change the ```protocol``` attribute to http: if your environment does not suport https:
```
vi ./assets/secrets/ikoncode_secrets
```

4. Run the script again:
```
bash ./start.sh up
```
In order to display all possible options of the start script, run:
```
bash ./start.sh -h
```

8. First check of installation: 
Run queries from the [API documentation](https://fub-hcc.github.io/IKON/docs/dal.html)
```
curl -X GET "https://localhost/api/graph" -k
```

9. Start the frontend:

Desktop version: [https://localhost](https://localhost)

Touchscreen version: [https://localhost/touch](https://localhost/touch)

#### Updating the data

The data automatically updates, because once the cache expires new data from the VIA is pulled and processed.

### Coding style

This project uses ESLint and (Pylint) for code-style checking. 
To run the linter execute the following line in the root folder of this repository:

```
npx eslint .
```

### FAQ

## Authors
* [Tim Korjakow](https://github.com/wittenator)
* [Lilli Joppien](https://github.com/lillijo)
* [Christoph Kinkeldey](https://github.com/ckinkeldey)

## License

This project is licensed under the APGL 3 License - see the [LICENSE](LICENSE) file for detail
