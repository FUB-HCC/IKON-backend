--------------------------------------------------------------------------------------------------------------------
--- Create institution table  and load data from a csv file

CREATE TABLE IF NOT EXISTS institutions (
  id SERIAL PRIMARY KEY ,
  name TEXT,
  address TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  internet TEXT
);

COPY institutions FROM '/dump_data/gepris/extracted_institution_data.csv' DELIMITER ',' CSV HEADER;
COPY institutions FROM '/dump_data/gepris/neueAdressen.csv' DELIMITER ',' CSV HEADER;
CREATE INDEX institutions_idx ON institutions (id);

--------------------------------------------------------------------------------------------------------------------
--- Create people table  and load data from a csv file
--- Create connection between people and institutions

CREATE TABLE IF NOT EXISTS peopleTemp (
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

COPY peopleTemp FROM '/dump_data/gepris/people_joined_with_institutions.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY ,
  name TEXT NOT NULL
);

INSERT INTO people (id, name)
SELECT DISTINCT id, name
FROM peopleTemp;

CREATE INDEX people_idx ON people (id);

CREATE TABLE IF NOT EXISTS peopleInstitutions (
  people_id INTEGER REFERENCES people(id),
  address TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  internet TEXT,
  institution_name TEXT,
  institution_id INTEGER REFERENCES institutions(id)
);

INSERT INTO peopleInstitutions (people_id, address, phone, fax, email, internet, institution_name, institution_id)
SELECT DISTINCT id, address, phone, fax, email, internet, institution_name, institution_id
FROM peopleTemp;

DROP TABLE peopleTemp;

--------------------------------------------------------------------------------------------------------------------
--- Create format table  and load data from a csv file

/*

Sadly, the MfN doesn't provide a structured set of formats

CREATE TABLE IF NOT EXISTS formats (
  id SERIAL PRIMARY KEY ,
  type TEXT NOT NULL
);

COPY formats(type) FROM '/dump_data/project_input/WTA-Formate.csv' DELIMITER ',' CSV HEADER;

*/

--------------------------------------------------------------------------------------------------------------------
--- Create targetgroup table  and load data from a csv file

CREATE TABLE IF NOT EXISTS targetgroups (
  id SERIAL PRIMARY KEY ,
  type TEXT UNIQUE NOT NULL
);

COPY targetgroups(type) FROM '/dump_data/project_input/WTA-Zielgruppen.csv' DELIMITER ',' CSV HEADER;

--------------------------------------------------------------------------------------------------------------------
--- Create project inheritance hierarchy and copy DFG projects via temporary tables (TODO: Is there a better way?)

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY ,
  title TEXT,
  project_abstract TEXT NOT NULL,
  funding_start_year DATE,
  funding_end_year DATE,
  participating_subject_areas TEXT,
  description TEXT,
  origin TEXT
);

CREATE TABLE IF NOT EXISTS DFGProjects (
  id INTEGER PRIMARY KEY REFERENCES projects(id),
  dfg_process TEXT
);

CREATE TABLE IF NOT EXISTS MFNProjects (
  id INTEGER PRIMARY KEY REFERENCES projects(id),
  organisational_unit TEXT,
  acronyme TEXT,
  HatAntragsteller TEXT,
  FoerderkennzeichenDrittmittelprojekt TEXT,
  HatMittelgeber TEXT,
  IsPartOf TEXT,
  HatLeitthema TEXT,
  project_leader TEXT,
  Projekttrager TEXT,
  Redaktionelle_Beschreibung TEXT,
  Status TEXT,
  Summary TEXT,
  TitelProjekt TEXT,
  TitelEN TEXT,
  Weitere_Informationen TEXT,
  Zusammenfassung TEXT
);

CREATE TABLE IF NOT EXISTS ktas (
  id INTEGER PRIMARY KEY,
  external_initiative BOOLEAN NOT NULL ,
  format TEXT,
  social_goals TEXT,
  field_of_action TEXT,
  goal TEXT NOT NULL,
  project_id INTEGER REFERENCES projects(id),
  start_date DATE,
  end_date DATE
);

CREATE TABLE IF NOT EXISTS Infrastructure (
    name VARCHAR PRIMARY KEY,
    description TEXT
);

CREATE TABLE IF NOT EXISTS Collections (
    name VARCHAR PRIMARY KEY,
    description TEXT
);

CREATE TABLE IF NOT EXISTS projectsTemp (
  id INTEGER PRIMARY KEY ,
  title TEXT,
  project_abstract TEXT,
  dfg_process TEXT,
  funding_start_year TEXT,
  funding_end_year TEXT,
  participating_subject_areas TEXT,
  description TEXT,
  origin TEXT
);

COPY projectsTemp FROM '/dump_data/gepris/extracted_project_data.csv' DELIMITER ',' CSV HEADER;
INSERT INTO projects (id, title, project_abstract, funding_start_year, funding_end_year, participating_subject_areas, description, origin)
SELECT DISTINCT id, title, project_abstract, to_date(funding_start_year, 'YYYY'), to_date(funding_end_year, 'YYYY'), participating_subject_areas, description, 'GEPRIS'
FROM projectsTemp;

INSERT INTO DFGProjects (id, dfg_process)
SELECT DISTINCT id, dfg_process
FROM projectsTemp;

DROP TABLE projectsTemp;

CREATE INDEX projects_idx ON projects (id);

--------------------------------------------------------------------------------------------------------------------
--- Create subjects table  and load data from a csv file

CREATE TABLE IF NOT EXISTS subjects (
  subject_area TEXT PRIMARY KEY ,
  review_board TEXT NOT NULL,
  research_area TEXT NOT NULL
);

COPY subjects FROM '/dump_data/gepris/subject_areas.csv' DELIMITER ',' CSV HEADER;

--------------------------------------------------------------------------------------------------------------------
--- Create countrycode table and load data from a csv file

CREATE TABLE IF NOT EXISTS countryCodes (
  country TEXT PRIMARY KEY,
  code TEXT NOT NULL
);

COPY countryCodes FROM '/dump_data/data_augmentation/country_code.csv' DELIMITER ',' CSV HEADER;

--------------------------------------------------------------------------------------------------------------------
--- Create quite a few m:n tables

CREATE TABLE IF NOT EXISTS ktasTargetgroups (
  kta_id INTEGER REFERENCES ktas(id),
  targetgroup_id INTEGER REFERENCES targetgroups(id)
);

CREATE TABLE IF NOT EXISTS ktasProjects (
  kta_id INTEGER REFERENCES ktas(id),
  project_id INTEGER REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS ktasSponsorsInstitution (
  kta_id INTEGER REFERENCES ktas(id),
  institution_id INTEGER REFERENCES institutions(id)
);

CREATE TABLE IF NOT EXISTS ktasConnectionsInstitution (
  kta_id INTEGER REFERENCES ktas(id),
  institution_id INTEGER REFERENCES institutions(id)
);

CREATE TABLE IF NOT EXISTS ktasCooperationsInstitution (
  kta_id INTEGER REFERENCES ktas(id),
  institution_id INTEGER REFERENCES institutions(id)
);

CREATE TABLE IF NOT EXISTS projectsCountries (
  project_id INTEGER REFERENCES projects(id),
  country TEXT REFERENCES countryCodes(country)
);

COPY projectsCountries FROM '/dump_data/gepris/projects_international_connections.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS projectsParticipatingSubjects (
  project_id INTEGER REFERENCES projects(id),
  subject TEXT NOT NULL
);

COPY projectsParticipatingSubjects FROM '/dump_data/gepris/project_ids_to_participating_subject_areas.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS projectsInstitutions (
  project_id INTEGER REFERENCES projects(id),
  institution_id INTEGER REFERENCES institutions(id),
  relation_type TEXT
);

--create unique index indexPS on projectsInstitutions (project_id, institution_id,relation_type );

COPY projectsInstitutions FROM '/dump_data/gepris/project_institution_relations.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS institutionsProjects (
  institution_id INTEGER REFERENCES institutions(id),
  project_id INTEGER REFERENCES projects(id)
);

COPY institutionsProjects FROM '/dump_data/gepris/projects_listed_on_institution_detail_pages.csv' DELIMITER ',' CSV HEADER;

INSERT INTO projectsInstitutions (project_id, institution_id, relation_type)
SELECT project_id, institution_id, 'UNKNOWN'
FROM institutionsProjects;

DROP TABLE institutionsProjects;

CREATE TABLE IF NOT EXISTS projectsPeople (
  project_id INTEGER REFERENCES projects(id),
  person_id INTEGER REFERENCES people(id),
  relation_type TEXT
);

COPY projectsPeople FROM '/dump_data/gepris/project_person_relations.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS projectsSubjects (
  project_id INTEGER REFERENCES projects(id),
  subject_area TEXT
);

COPY projectsSubjects FROM '/dump_data/gepris/project_ids_to_subject_areas.csv' DELIMITER ',' CSV HEADER;

CREATE TABLE IF NOT EXISTS institutionsGeolocations (
  institution_id INTEGER REFERENCES institutions(id),
  lat FLOAT8 NOT NULL,
  lon FLOAT8 NOT NULL
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

CREATE MATERIALIZED VIEW project_view AS
    SELECT proj.id AS id,
    FIRST(projectsinstitutions.institution_id) AS institution_id,
    ARRAY_AGG(DISTINCT countryCode.code) AS region,
    ARRAY_AGG(DISTINCT peopleinstitutions.institution_id) AS cooperating_institutions,
    FIRST(subjects.subject_area) AS subject_area,
    FIRST(subjects.review_board) AS review_board,
    FIRST(subjects.research_area) AS research_area,
    'Anonym' AS applicant,
    'DFG' AS sponsor,
    ARRAY_AGG(DISTINCT p.subject) AS side_topics,
    'Anonym' AS project_leader,
    FIRST(proj.funding_start_year) AS start_date,
    FIRST(proj.funding_end_year) AS end_date,
    FIRST(proj.title) AS title,
    FIRST(proj.project_abstract) AS abstract,
    CONCAT('http://gepris.dfg.de/gepris/projekt/', proj.id) AS href


  FROM projects AS proj

  -- Match the hosting institution to projects
  LEFT JOIN projectsinstitutions
  ON proj.id = projectsinstitutions.project_id

  -- Match the participatingsubject areas to projects
  LEFT JOIN projectsparticipatingsubjects p
  ON proj.id = p.project_id

  -- Match the country codes to projects
  LEFT JOIN projectsCountries AS countries
  ON proj.id = countries.project_id
  LEFT JOIN countryCodes AS countryCode
  ON countries.country = countryCode.country

  -- Match participating people to projects
  LEFT JOIN projectsPeople
  ON proj.id = projectsPeople.project_id
  LEFT JOIN people
  ON projectsPeople.person_id = people.id
  LEFT JOIN peopleinstitutions
  ON people.id = peopleinstitutions.people_id

  -- Match taxonomy
  LEFT JOIN projectsSubjects AS subj
  ON proj.id = subj.project_id
  LEFT JOIN subjects
  ON subj.subject_area = subjects.subject_area

  GROUP BY proj.id
  ORDER BY proj.id;

CREATE INDEX project_view_idx ON project_view (institution_id);
