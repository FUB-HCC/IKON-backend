[![CircleCI](https://circleci.com/gh/FUB-HCC/IKON-backend/tree/master.svg?style=svg)](https://circleci.com/gh/FUB-HCC/IKON-backend/tree/master)

![IKON logo](https://www.mi.fu-berlin.de/en/inf/groups/hcc/projects/ikon/ikon_350.png?width=1300&density=1)

The Natural History Museum in Berlin (Museum für Naturkunde - Leibniz Institute for Evolution and Biodiversity Science) is  among the top 10 world-wide and the largest of its kind in Germany. The museum is home to over 30 Mio. collection objects, more than 250 researchers and more than 400 research assistants as well as PhD students, from disciplines such as biology, paleontology, mineralogy and information science.

Behind the publicly accessible spaces, these researchers work on manyfold projects in a multidisciplinary research setting. To bolster the Natural History Museum's efforts at ensuring knowledge transfer throughout its organisation, the HCC collaborates with the museum in this BMBF-funded project to unveil the currently tacit knowledge, competencies, methods and research project information to the employees of the museum. A formal ontology is developed to support this endeavor.

We aim to provide the researchers at museum with (1) Wiki-based read and write access to research project information, (2) insights about potentials for knowledge transfer powered by linked data and (3) interactive visualisations of these networked sources of knowledge. Focussing on the seamless integration of these provisions, the HCC aims to set up an actionable and holistic system that visualises research project data and their potential for knowledge transfer in research museums like the Natural History Museum.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You will need [Docker](https://docs.docker.com/install/), [Docker Compose](https://docs.docker.com/compose/install/) and (Git LFS)[https://git-lfs.github.com/] installed in order to run the backend. 


### Installing

A step by step series of examples that tell you how to get a development env running

First you need to clone the repository.
In order to do that navigate to the folder where you want to save the project and execute:

```
git clone --recurse-submodules -j8 https://github.com/FUB-HCC/IKON-backend.git
```

Then proceed by building and running the containers:
```
cd IKON-backend/
docker-compose up --build
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
