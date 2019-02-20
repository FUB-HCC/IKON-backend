# IKON backend

One Paragraph of project description goes here

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You will need [Docker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed in order to run the backend. 


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
<<<<<<< HEAD
docker-compose build
docker-compose up
=======
npm install 
```

Finally end the setup process by installing the dependencies for the RPC server:
```
cd src/rpcserver/
pipenv install
```
Now you can start the server by executing:
```
cd ../../
npm start
>>>>>>> ca0e0471db93482df7e8873604af8e95fc00c87b
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

This is getting completed later.

## License

This project is licensed under the APGL 3 License - see the [LICENSE.md](LICENSE.md) file for details
