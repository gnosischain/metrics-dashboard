const metric = {
  "id": "api_execution_gnosis_app_gpay_migration_reactivated_spend",
  "name": "Reactivated (card spend)",
  "description": "Made a card payment since migration",
  "metricDescription": "Migrated cards whose NEW Safe has made a card payment (action='Payment') since 2026-06-04 \u2014 the strict 'using the card again' definition (~23% of ever-funded).",
  "chartType": "numberDisplay",
  "format": "formatNumber",
  "valueField": "value",
  "query": "SELECT toInt64(uniqExact(c.canonical_address)) AS value FROM dbt.int_execution_gpay_safe_canonical c INNER JOIN dbt.int_execution_gpay_activity a ON lower(a.wallet_address) = c.canonical_address WHERE a.date >= '2026-06-04' AND a.action = 'Payment'"
};
export default metric;
