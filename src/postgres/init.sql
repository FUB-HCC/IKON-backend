CREATE TABLE IF NOT EXISTS institutions (
  id INTEGER PRIMARY KEY ,
  name TEXT,
  address TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  internet TEXT
);

COPY institutions FROM '/dump_data/extracted_institution_data.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS people (
  num INTEGER,
  id INTEGER NOT NULL,
  name TEXT,
  address TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  internet TEXT,
  institution_name TEXT,
  institution_id INTEGER REFERENCES institutions(id)
);

COPY people FROM '/dump_data/people_joined_with_institutions.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS projects (
  num INTEGER,
  institution_id INTEGER REFERENCES institutions(id),
  id INTEGER PRIMARY KEY ,
  title TEXT,
  project_abstract TEXT,
  dfg_process TEXT,
  funding_start_year TEXT,
  funding_end_year TEXT,
  parent_project_id INTEGER,
  participating_subject_areas TEXT,
  description TEXT,
  subject_area TEXT,
  international_connections TEXT
);

COPY projects FROM '/dump_data/projects.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS subjects (
  subject_area TEXT NOT NULL PRIMARY KEY ,
  review_board TEXT NOT NULL,
  research_area TEXT NOT NULL
);

COPY subjects FROM '/dump_data/subject_areas.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS countryCodes (
  country TEXT PRIMARY KEY ,
  code TEXT NOT NULL
);

COPY countryCodes FROM '/dump_data/country_code.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS projectsCountries (
  project_id INTEGER NOT NULL,
  country TEXT 
);

COPY projectsCountries FROM '/dump_data/projects_international_connections.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS projectsParticipatingSubjects (
  project_id INTEGER NOT NULL,
  subject TEXT NOT NULL
);

COPY projectsParticipatingSubjects FROM '/dump_data/project_ids_to_participating_subject_areas.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS projectsInstitutions (
  project_id INTEGER NOT NULL,
  institution_id INTEGER REFERENCES institutions(id),
  relation_type TEXT
);

COPY projectsInstitutions FROM '/dump_data/project_institution_relations.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS institutionsProjects (
  institution_id INTEGER REFERENCES institutions(id),
  project_id INTEGER NOT NULL
);

COPY institutionsProjects FROM '/dump_data/projects_listed_on_institution_detail_pages.csv' DELIMITER ',' CSV HEADER;

INSERT INTO projectsInstitutions (project_id, institution_id, relation_type)
SELECT project_id, institution_id, 'UNKNOWN'
FROM institutionsProjects;

DROP TABLE institutionsProjects;

CREATE TABLE IF NOT EXISTS projectsPeople (
  project_id INTEGER NOT NULL,
  person_id INTEGER,
  relation_type TEXT
);

COPY projectsPeople FROM '/dump_data/project_person_relations.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS projectsSubjects (
  project_id INTEGER NOT NULL,
  subject_area TEXT
);

COPY projectsSubjects FROM '/dump_data/project_ids_to_subject_areas.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS institutionsGeolocations (
  institution_id INTEGER REFERENCES institutions(id),
  lat FLOAT8,
  long FLOAT8
);

-- Create a function that always returns the first non-NULL item
CREATE OR REPLACE FUNCTION public.first_agg ( anyelement, anyelement )
RETURNS anyelement LANGUAGE SQL IMMUTABLE STRICT AS $$
        SELECT $1;
$$;
 
-- And then wrap an aggregate around it
CREATE AGGREGATE public.FIRST (
        sfunc    = public.first_agg,
        basetype = anyelement,
        stype    = anyelement
);
 
-- Create a function that always returns the last non-NULL item
CREATE OR REPLACE FUNCTION public.last_agg ( anyelement, anyelement )
RETURNS anyelement LANGUAGE SQL IMMUTABLE STRICT AS $$
        SELECT $2;
$$;
 
-- And then wrap an aggregate around it
CREATE AGGREGATE public.LAST (
        sfunc    = public.last_agg,
        basetype = anyelement,
        stype    = anyelement
);




