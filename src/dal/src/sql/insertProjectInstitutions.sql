INSERT INTO projectsinstitutions(project_id, institution_id, relation_type)
VALUES($1,  (SELECT id AS institution_id FROM institutions WHERE name = $2), $2)

--UPDATE mfnprojects SET kooperationspartner = kooperationspartner + $2 +','
--WHERE id = $1;