INSERT INTO ktas (id, external_initiative, format, social_goals, field_of_action, goal,  project_id, start_date, end_date)
VALUES ($1, $2, $3, $4, $5, $6, $7, to_date($8, '1/YYYY/MM/DD'),to_date($9, '1/YYYY/MM/DD'))
--ON CONFLICT DO NOTHING;
