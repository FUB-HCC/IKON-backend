# IKON backend

One Paragraph of project description goes here

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You will need [Node.js](https://nodejs.org/en/download/package-manager/), [Python3](https://docs.python.org/3/using/index.html) and [pipenv](https://docs.pipenv.org/) installed in order to run the backend. 


### Installing

A step by step series of examples that tell you how to get a development env running

First you need to clone the repository.
In order to do that navigate to the folder where you want to save the project and execute:

```
git clone https://github.com/FUB-HCC/IKON-backend.git
```

Then proceed by installing the dependencies for the API server:
```
cd IKON-backend/
npm install 
```

Finally end the setup process by installing the dependencies for the RPC server:
```
cd src/rpc_server/
pipenv install
```
Now you can start the server by executing:
```
cd ../../
npm start
```

### Coding style

This project is going to use ESLint and Pylint for code-style checking. 

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Express](http://expressjs.com/de/) - The web framework used
* [Scikit-Learn](http://scikit-learn.org/stable/index.html) - The framework for the NLP 
* [Spacy](https://spacy.io/) - Used for text pre-processing


## Authors

This is getting completed later.

## License

This project is licensed under the APGL 3 License - see the [LICENSE.md](LICENSE.md) file for details
