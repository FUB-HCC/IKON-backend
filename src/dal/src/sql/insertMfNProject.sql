INSERT INTO mfnprojects (id, organisational_unit, acronyme, hatantragsteller, foerderkennzeichendrittmittelprojekt, hatmittelgeber, ispartof, hatleitthema, project_leader, projekttrager, redaktionelle_beschreibung, status, summary, titelprojekt, titelen, weitere_informationen, zusammenfassung)
VALUES ($1, $2, $3, $4, $5, $6, NULL, NULL, $7, $8, $9, $10, $11, $12, $13, $14, $15)
ON CONFLICT (id) DO NOTHING;
