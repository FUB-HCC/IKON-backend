/*SELECT DISTINCT i.*, i3.lat, i3.lon
FROM projectsinstitutions
JOIN institutions i on projectsinstitutions.institution_id = i.id
AND projectsinstitutions.institution_id = $1
LEFT JOIN institutionsgeolocations i3 on i.id = i3.institution_id

UNION

SELECT DISTINCT i2.*, i3.lat, i3.lon
FROM projectsinstitutions
JOIN projectspeople on projectsinstitutions.project_id = projectspeople.project_id AND projectsinstitutions.institution_id = $1
JOIN people on projectspeople.person_id = people.id
JOIN peopleinstitutions on people.id = peopleinstitutions.people_id
JOIN institutions i2 on peopleinstitutions.institution_id = i2.id
LEFT JOIN institutionsgeolocations i3 on i2.id = i3.institution_id

ORDER BY id */

SELECT DISTINCT i.id, i.name, i.address, i3.lat, i3.lon
FROM projectsinstitutions
JOIN mfnprojects mp ON mp.id = projectsinstitutions.project_id
LEFT JOIN institutions i on projectsinstitutions.institution_id = i.id
LEFT JOIN institutionsgeolocations i3 on i.id = i3.institution_id
WHERE i3.lat IS NOT NULL AND i.id IS NOT NULL

ORDER BY id;
