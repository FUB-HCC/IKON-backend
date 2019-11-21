SELECT DISTINCT targetgroups.id, targetgroups.type AS title
FROM targetgroups
JOIN ktasTargetgroups kt ON kt.targetgroup_id = targetgroups.id
