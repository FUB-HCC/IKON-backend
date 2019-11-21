INSERT INTO ktastargetgroups (kta_id, targetgroup_id)
SELECT $1, (SELECT id AS targetgroup_id FROM targetgroups WHERE type = $2)
where exists (select *
              from ktas
              where ktas.id = $1);
