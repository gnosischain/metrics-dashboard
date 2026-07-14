const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_reactivation_rate_funded",
  "name": "Reactivation rate",
  "description": "Reactivated / ever-funded",
  "metricDescription": `Share of **ever-funded** migrated cards that have resumed activity since the 2026-06-04 migration cutover. Numerator = distinct **new** (canonical) Safes with at least one \`int_execution_gpay_activity\` row (any action: payment, top-up, deposit, withdrawal, cashback) dated on/after \`2026-06-04\`. Denominator = migrated old→new pairs (one row per old Safe in \`int_execution_gpay_safe_canonical\`) whose old **or** new Safe ever held a positive USD balance (\`balance_usd > 0\`) on any day. Never-funded empty-shell migrations are excluded from the denominator, so this reads higher than reactivation measured over all migrated pairs. Point-in-time, percent.`,
  "chartType": "numberDisplay",
  "format": "formatPercentageInt",
  "valueField": "value",
  "query": "SELECT round(react * 100.0 / funded, 1) AS value FROM (SELECT (SELECT uniqExact(c.canonical_address) FROM dbt.int_execution_gpay_safe_canonical c INNER JOIN dbt.int_execution_gpay_activity a ON lower(a.wallet_address)=c.canonical_address WHERE a.date >= '2026-06-04') AS react, (SELECT countIf((lower(address) IN (SELECT DISTINCT lower(address) FROM dbt.int_execution_gpay_balances_daily WHERE balance_usd > 0) OR lower(canonical_address) IN (SELECT DISTINCT lower(address) FROM dbt.int_execution_gpay_balances_daily WHERE balance_usd > 0))) FROM dbt.int_execution_gpay_safe_canonical) AS funded)"
};
export default metric;
