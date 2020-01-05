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

COPY institutions(name, address, phone, fax, email, internet) FROM '/dump_data/gepris/neueAdressen.csv' DELIMITER ',' CSV HEADER;
CREATE INDEX institutions_idx ON institutions (id);

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

CREATE TABLE IF NOT EXISTS ProjectsInfrastructure (
    infrastructure VARCHAR,
    project_id INTEGER REFERENCES Projects(id)
);

CREATE TABLE IF NOT EXISTS ProjectsCollections (
    collection VARCHAR,
    project_id INTEGER REFERENCES Projects(id)
);

CREATE TABLE IF NOT EXISTS ktas (
  id INTEGER PRIMARY KEY,
  title TEXT,
  external_initiative BOOLEAN NOT NULL ,
  format TEXT,
  social_goals TEXT,
  field_of_action TEXT,
  goal TEXT NOT NULL,
  project_id INTEGER,
  start_date DATE,
  end_date DATE,
  href TEXT,
  description TEXT,
  organisational_unit TEXT
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


CREATE TABLE IF NOT EXISTS projectsInstitutions (
  project_id INTEGER ,
  institution_id INTEGER,
  relation_type TEXT
);

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

