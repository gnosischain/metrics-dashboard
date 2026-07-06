const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_reactivation_rate_funded",
  "name": "Reactivation rate",
  "description": "Reactivated / ever-funded",
  "metricDescription": "Share of EVER-FUNDED migrated cards that resumed any activity since 2026-06-04 (honest adoption; over all 66k migrated incl. empty shells it is ~27%).",
  "chartType": "numberDisplay",
  "format": "formatPercentageInt",
  "valueField": "value",
  "query": "SELECT round(react * 100.0 / funded, 1) AS value FROM (SELECT (SELECT uniqExact(c.canonical_address) FROM dbt.int_execution_gpay_safe_canonical c INNER JOIN dbt.int_execution_gpay_activity a ON lower(a.wallet_address)=c.canonical_address WHERE a.date >= '2026-06-04') AS react, (SELECT countIf((lower(address) IN (SELECT DISTINCT lower(address) FROM dbt.int_execution_gpay_balances_daily WHERE balance_usd > 0) OR lower(canonical_address) IN (SELECT DISTINCT lower(address) FROM dbt.int_execution_gpay_balances_daily WHERE balance_usd > 0))) FROM dbt.int_execution_gpay_safe_canonical) AS funded)"
};
export default metric;
