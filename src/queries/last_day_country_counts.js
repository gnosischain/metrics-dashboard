const metric = {
    id: 'last_day_country_counts',
    name: 'Top Countries',
    description: 'Last day peers per country',
    format: 'formatNumber',
    labelField: 'country',
    valueField: 'cnt',
    chartType: 'horizontalBar',
    color: '#3e6957',
    query: `SELECT 
                country
                ,SUM(cnt) AS cnt 
            FROM dbt.p2p_peers_geo_latest
            GROUP BY 1
            QUALIFY ROW_NUMBER() OVER (PARTITION BY country ORDER BY cnt DESC) <10`,
  };
  
  export default metric;