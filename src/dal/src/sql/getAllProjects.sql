/*SELECT *
FROM mfnprojects
JOIN projects ON mfnprojects.id = projects.id
JOIN projectsinstitutions ON projectsinstitutions.project_id = projects.id
WHERE projects.id !=  $1
OFFSET $2
LIMIT $3*/

/*SELECT mfnprojects.*, projects.*, ARRAY_AGG(DISTINCT projectsinstitutions.institution_id) AS cooperating_institutions
FROM mfnprojects
JOIN projects ON mfnprojects.id = projects.id
LEFT JOIN projectsinstitutions ON projectsinstitutions.project_id = projects.id
WHERE projects.id !=  $1
OFFSET $2
LIMIT $3*/

SELECT proj.*,
    ARRAY_AGG(DISTINCT projectsinstitutions.institution_id) AS cooperating_institutions,
    CONCAT('http://gepris.dfg.de/gepris/projekt/', proj.id) AS href,
    (SELECT id AS institution_id FROM institutions WHERE name = 'Museum für Naturkunde Berlin'),
    FIRST(mfn.organisational_unit) AS Organisationseinheit,
    FIRST(mfn.acronyme) AS Akronym,
    FIRST(mfn.hatantragsteller) AS Antragsteller,
    FIRST(mfn.hatmittelgeber) AS hatmittelgeber,
    FIRST(mfn.ispartof) AS ispartof,
    FIRST(mfn.hatleitthema) AS hatleitthema,
    FIRST(mfn.project_leader) AS Projektleiter,
    FIRST(mfn.projekttrager) AS projekttrager,
    FIRST(mfn.weitere_informationen) AS WeitereInformationen
    
  FROM projects AS proj
  INNER JOIN mfnprojects AS mfn ON mfn.id = proj.id

  -- Match the hosting institution to projects
  LEFT JOIN projectsinstitutions
  ON proj.id = projectsinstitutions.project_id
  WHERE proj.id != $1
  GROUP BY proj.id
  ORDER BY proj.id
  OFFSET $2
  LIMIT $3;
