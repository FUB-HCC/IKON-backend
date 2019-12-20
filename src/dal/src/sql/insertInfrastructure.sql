INSERT INTO infrastructure (name, description)
VALUES ($1, $2)
ON CONFLICT (name) DO NOTHING;
