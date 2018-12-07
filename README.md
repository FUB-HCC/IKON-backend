# IKON backend

One Paragraph of project description goes here

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You will need [NDocker](https://docs.docker.com/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed in order to run the backend. 


### Installing

A step by step series of examples that tell you how to get a development env running

First you need to clone the repository.
In order to do that navigate to the folder where you want to save the project and execute:

```
git clone --recurse-submodules -j8 https://github.com/FUB-HCC/IKON-backend.git
```

Then proceed by building and running the containers:
```
docker-compose build
docker-compose up
```

### Coding style

This project is going to use ESLint and Pylint for code-style checking. 

```
Give an example
```

## Roadmap
| Feature       				| Description                                    											   |															    Progress  |
| ------------- 				|:-------------:                                 											   |    															    -----:|
| File matching 				| Loads and extracts information from all given files using an in-memory SQL database          | :red_circle: :red_circle: :red_circle: :white_circle: :white_check_mark: |
| Feature extraction      	    | Loads project from the given data and computes an embedding of the projects in a toppic space| :red_circle: :red_circle: :red_circle: :red_circle: :heavy_check_mark:   |
| Concise architecture   		| Is built with best practices in mind and a thought-out plan		    				   |:red_circle: :red_circle: :white_circle: :white_circle: :white_check_mark:|
| Interprocess communication	| Different processes (API, file loader, feature extractor) should be able to call eachother   |:white_circle: :white_circle: :white_circle: :white_circle: :white_check_mark:|
| Defined API endpoints   		| Offers public and well-documented API endpoints for all currently implemented features	   |:red_circle: :red_circle: :red_circle: :red_circle: :heavy_check_mark:|
| Coding style   		  		| Every piece of code followes a standardized coding style									   |:white_circle: :white_circle: :white_circle: :white_circle: :white_check_mark:|
| Continous Delivery	  		| Tests exist and are tested for on every communication 									   |:white_circle: :white_circle: :white_circle: :white_circle: :white_check_mark:|
| Dockerized    		  		| The backend and all its services run in Docker containers									   |:white_circle: :white_circle: :white_circle: :white_circle: :white_check_mark:|


Add additional notes about how to deploy this on a live system

## Built With

* [Express](http://expressjs.com/de/) - The web framework used
* [Scikit-Learn](http://scikit-learn.org/stable/index.html) - The framework for the NLP 
* [Spacy](https://spacy.io/) - Used for text pre-processing


## Authors

This is getting completed later.

## License

This project is licensed under the APGL 3 License - see the [LICENSE.md](LICENSE.md) file for details
