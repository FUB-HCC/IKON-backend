INSERT INTO ktas (id, external_initiative, format, social_goals, field_of_action, goal, project_id)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT DO NOTHING;


