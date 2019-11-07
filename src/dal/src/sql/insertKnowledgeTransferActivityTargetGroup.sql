INSERT INTO ktastargetgroups (kta_id, targetgroup_id)
VALUES ($1, (SELECT id AS targetgroup_id FROM targetgroups WHERE type = $2))
--ON CONFLICT DO NOTHING; 
