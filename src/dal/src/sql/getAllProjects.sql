SELECT *
FROM mfnprojects
JOIN projects ON mfnprojects.id = projects.id
WHERE projects.id !=  $1
OFFSET $2
LIMIT $3