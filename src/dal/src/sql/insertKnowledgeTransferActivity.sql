INSERT INTO ktas (id, title, external_initiative, format, social_goals, field_of_action, goal,  project_id, start_date, end_date, href, description, organisational_unit)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, to_date($9, '1/YYYY/MM/DD'),to_date($10, '1/YYYY/MM/DD'), $11, $12, $13)
ON CONFLICT (id) DO NOTHING;
