INSERT INTO targetgroups(id, type)
VALUES (DEFAULT, $1)
ON CONFLICT (type) DO NOTHING; 
