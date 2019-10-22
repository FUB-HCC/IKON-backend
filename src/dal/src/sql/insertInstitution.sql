INSERT INTO institutions(id, name, address )
VALUES (DEFAULT, $1, $1)
ON CONFLICT (name) DO NOTHING;
