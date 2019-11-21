SELECT DISTINCT i.id, i.name, i.address
FROM projectsinstitutions
JOIN mfnprojects mp ON mp.id = projectsinstitutions.project_id
LEFT JOIN institutions i on projectsinstitutions.institution_id = i.id

ORDER BY id;
