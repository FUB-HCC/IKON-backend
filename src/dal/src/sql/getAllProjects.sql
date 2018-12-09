SELECT *
FROM project_view
WHERE project_view.institution_id = $1
OFFSET $2
LIMIT $3