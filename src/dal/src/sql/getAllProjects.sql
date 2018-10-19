SELECT proj.id AS id,
  FIRST(projectsinstitutions.institution_id) AS institution_id,
  ARRAY_AGG(DISTINCT countryCode.code) AS region,
  ARRAY_AGG(DISTINCT people.institution_id) AS cooperating_institutions,
  FIRST(subjects.subject_area) AS subject_area,
  FIRST(subjects.review_board) AS review_board,
  FIRST(subjects.research_area) AS research_area,
  'Anonym' AS applicant,
  'DFG' AS sponsor,
  ARRAY_AGG(DISTINCT p.subject) AS side_topics,
  'Anonym' AS project_leader,
  FIRST(proj.funding_start_year) AS start_date,
  FIRST(proj.funding_end_year) AS end_date,
  FIRST(proj.title) AS title,
  FIRST(proj.project_abstract) AS abstract,
  CONCAT('http://gepris.dfg.de/gepris/projekt/', proj.id) AS href,
  '1' AS synergy


FROM projects AS proj

-- Match the hosting institution to projects
LEFT JOIN projectsinstitutions
ON proj.id = projectsinstitutions.project_id

-- Match the participatingsubject areas to projects
LEFT JOIN projectsparticipatingsubjects p
ON proj.id = p.project_id

-- Match the country codes to projects
LEFT JOIN projectsCountries AS countries
ON proj.id = countries.project_id
LEFT JOIN countryCodes AS countryCode
ON countries.country = countryCode.country

-- Match participating people to projects
LEFT JOIN projectsPeople
ON proj.id = projectsPeople.project_id
LEFT JOIN people
ON projectsPeople.person_id = people.id

-- Match taxonomy
LEFT JOIN projectsSubjects AS subj
ON proj.id = subj.project_id
LEFT JOIN subjects
ON subj.subject_area = subjects.subject_area

GROUP BY proj.id
ORDER BY proj.id

LIMIT 500