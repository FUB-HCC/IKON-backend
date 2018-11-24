SELECT DISTINCT i.*, i3.lat, i3.long
FROM projects
JOIN projectsinstitutions on projects.id = projectsinstitutions.project_id
JOIN institutions i on projectsinstitutions.institution_id = i.id
LEFT JOIN institutionsgeolocations i3 on i.id = i3.institution_id

UNION

SELECT DISTINCT i2.*, i3.lat, i3.long
FROM projects
JOIN projectspeople on projects.id = projectspeople.project_id
JOIN people on projectspeople.person_id = people.id
JOIN institutions i2 on people.institution_id = i2.id
LEFT JOIN institutionsgeolocations i3 on i2.id = i3.institution_id

ORDER BY id