CREATE TABLE IF NOT EXISTS institutions (
  institution_id INTEGER NOT NULL,
  name TEXT,
  address TEXT,
  phone TEXT,
  fax TEXT,
  email TEXT,
  internet TEXT,
  PRIMARY KEY(institution_id)
);