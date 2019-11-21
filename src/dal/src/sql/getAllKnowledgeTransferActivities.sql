SELECT k.*,
ARRAY_AGG(DISTINCT t.type) AS targetgroups
FROM ktas AS k
LEFT JOIN ktastargetgroups AS kt ON kt.kta_id = k.id
LEFT JOIN targetgroups AS t ON kt.targetgroup_id = t.id
GROUP BY k.id
ORDER BY k.id
