CREATE TABLE IF NOT EXISTS institutions (
  id INTEGER PRIMARY KEY ,
  name TEXT,
  address TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  internet TEXT
);

CREATE TABLE IF NOT EXISTS people (
  id INTEGER NOT NULL PRIMARY KEY ,
  name TEXT,
  address TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  internet TEXT,
  institution_name TEXT,
  institution_id INTEGER REFERENCES institutions(id)
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER NOT NULL PRIMARY KEY ,
  title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  subject_area TEXT NOT NULL PRIMARY KEY ,
  review_board TEXT NOT NULL,
  research_area TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS countryCode (
  country TEXT NOT NULL PRIMARY KEY ,
  code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projectsCountries (
  project_id INTEGER REFERENCES projects(id),
  country TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projectsCountries (
  project_id INTEGER REFERENCES projects(id),
  person_id INTEGER REFERENCES people(id),
  relation_type TEXT
);

CREATE TABLE IF NOT EXISTS projectsSubjects (
  project_id INTEGER REFERENCES projects(id),
  subject_area TEXT REFERENCES subjects(subject_area),
  relation_type TEXT
);

CREATE TABLE IF NOT EXISTS institutionsGeolocations (
  institution_id INTEGER REFERENCES institutions(id),
  lat FLOAT8,
  long FLOAT8
);




