INSERT INTO projects (id, title, project_abstract, funding_start_year, funding_end_year, participating_subject_areas, description, origin)
VALUES ($1, $2, $3, to_date($4, '1/YYYY/MM/DD'), to_date($5, '1/YYYY/MM/DD'), NULL, $6, 'MFN');

