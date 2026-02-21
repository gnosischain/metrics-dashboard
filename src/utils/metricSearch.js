const DEFAULT_RESULT_LIMIT = 8;
const NON_NAVIGABLE_METRIC_IDS = new Set(['global_filter']);

const normalizeText = (value = '') => {
  return String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const tokenize = (value = '') => {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(' ').filter(Boolean) : [];
};

const isEditDistanceAtMostOne = (leftRaw = '', rightRaw = '') => {
  const left = String(leftRaw);
  const right = String(rightRaw);

  if (left === right) return true;

  const leftLength = left.length;
  const rightLength = right.length;
  const lengthDiff = Math.abs(leftLength - rightLength);
  if (lengthDiff > 1) return false;

  if (leftLength === rightLength) {
    let mismatchCount = 0;
    for (let i = 0; i < leftLength; i += 1) {
      if (left[i] !== right[i]) {
        mismatchCount += 1;
        if (mismatchCount > 1) return false;
      }
    }
    return mismatchCount <= 1;
  }

  const longer = leftLength > rightLength ? left : right;
  const shorter = leftLength > rightLength ? right : left;
  let longerIndex = 0;
  let shorterIndex = 0;
  let consumedSkip = false;

  while (longerIndex < longer.length && shorterIndex < shorter.length) {
    if (longer[longerIndex] === shorter[shorterIndex]) {
      longerIndex += 1;
      shorterIndex += 1;
      continue;
    }

    if (consumedSkip) {
      return false;
    }

    consumedSkip = true;
    longerIndex += 1;
  }

  return true;
};

const tokenMatchScore = (queryToken, targetTokens = [], weights = {}) => {
  if (!queryToken || !targetTokens.length) return 0;

  const {
    tokenExact = 0,
    tokenPrefix = 0,
    tokenSubstring = 0,
    tokenTypo = 0
  } = weights;

  let bestScore = 0;
  for (const targetToken of targetTokens) {
    if (queryToken === targetToken) {
      return tokenExact;
    }

    if (targetToken.startsWith(queryToken)) {
      bestScore = Math.max(bestScore, tokenPrefix);
      continue;
    }

    if (targetToken.includes(queryToken)) {
      bestScore = Math.max(bestScore, tokenSubstring);
      continue;
    }

    if (queryToken.length >= 4 && targetToken.length >= 4 && isEditDistanceAtMostOne(queryToken, targetToken)) {
      bestScore = Math.max(bestScore, tokenTypo);
    }
  }

  return bestScore;
};

const fieldMatchScore = (queryNormalized, queryTokens, fieldNormalized, fieldTokens, weights = {}) => {
  if (!fieldNormalized) return 0;

  const {
    phraseExact = 0,
    phrasePrefix = 0,
    phraseSubstring = 0,
    allTokensBonus = 0,
    partialTokensBonus = 0
  } = weights;

  let score = 0;

  if (fieldNormalized === queryNormalized) {
    score += phraseExact;
  } else if (fieldNormalized.startsWith(queryNormalized)) {
    score += phrasePrefix;
  } else if (fieldNormalized.includes(queryNormalized)) {
    score += phraseSubstring;
  }

  let matchedTokens = 0;
  for (const queryToken of queryTokens) {
    const tokenScore = tokenMatchScore(queryToken, fieldTokens, weights);
    if (tokenScore > 0) {
      matchedTokens += 1;
      score += tokenScore;
    }
  }

  if (queryTokens.length > 0 && matchedTokens === queryTokens.length) {
    score += allTokensBonus;
  } else if (matchedTokens > 0) {
    score += matchedTokens * partialTokensBonus;
  }

  return score;
};

const ensureSearchField = (entry = {}) => {
  return entry._search || {
    metricNameNormalized: normalizeText(entry.metricName),
    metricNameTokens: tokenize(entry.metricName),
    metricIdNormalized: normalizeText(entry.metricId),
    metricIdTokens: tokenize(entry.metricId),
    tabNameNormalized: normalizeText(entry.tabName),
    tabNameTokens: tokenize(entry.tabName),
    dashboardNameNormalized: normalizeText(entry.dashboardName),
    dashboardNameTokens: tokenize(entry.dashboardName),
    detailsNormalized: normalizeText(`${entry.description || ''} ${entry.metricDescription || ''}`),
    detailsTokens: tokenize(`${entry.description || ''} ${entry.metricDescription || ''}`)
  };
};

const getEntryScore = (entry, queryNormalized, queryTokens) => {
  const fields = ensureSearchField(entry);

  const metricNameScore = fieldMatchScore(
    queryNormalized,
    queryTokens,
    fields.metricNameNormalized,
    fields.metricNameTokens,
    {
      phraseExact: 980,
      phrasePrefix: 820,
      phraseSubstring: 560,
      tokenExact: 220,
      tokenPrefix: 170,
      tokenSubstring: 120,
      tokenTypo: 90,
      allTokensBonus: 240,
      partialTokensBonus: 40
    }
  );

  const metricIdScore = fieldMatchScore(
    queryNormalized,
    queryTokens,
    fields.metricIdNormalized,
    fields.metricIdTokens,
    {
      phraseExact: 540,
      phrasePrefix: 460,
      phraseSubstring: 320,
      tokenExact: 120,
      tokenPrefix: 90,
      tokenSubstring: 70,
      tokenTypo: 50,
      allTokensBonus: 110,
      partialTokensBonus: 20
    }
  );

  const tabScore = fieldMatchScore(
    queryNormalized,
    queryTokens,
    fields.tabNameNormalized,
    fields.tabNameTokens,
    {
      phraseExact: 220,
      phrasePrefix: 180,
      phraseSubstring: 120,
      tokenExact: 70,
      tokenPrefix: 50,
      tokenSubstring: 34,
      tokenTypo: 20,
      allTokensBonus: 56,
      partialTokensBonus: 10
    }
  );

  const dashboardScore = fieldMatchScore(
    queryNormalized,
    queryTokens,
    fields.dashboardNameNormalized,
    fields.dashboardNameTokens,
    {
      phraseExact: 180,
      phrasePrefix: 140,
      phraseSubstring: 96,
      tokenExact: 58,
      tokenPrefix: 42,
      tokenSubstring: 28,
      tokenTypo: 16,
      allTokensBonus: 44,
      partialTokensBonus: 8
    }
  );

  const detailsScore = fieldMatchScore(
    queryNormalized,
    queryTokens,
    fields.detailsNormalized,
    fields.detailsTokens,
    {
      phraseExact: 100,
      phrasePrefix: 82,
      phraseSubstring: 54,
      tokenExact: 28,
      tokenPrefix: 22,
      tokenSubstring: 14,
      tokenTypo: 8,
      allTokensBonus: 24,
      partialTokensBonus: 4
    }
  );

  return metricNameScore + metricIdScore + tabScore + dashboardScore + detailsScore;
};

export const buildMetricSearchIndex = (dashboards = []) => {
  if (!Array.isArray(dashboards)) return [];

  const index = [];
  const dedupe = new Set();

  dashboards.forEach((dashboard) => {
    if (!dashboard || !Array.isArray(dashboard.tabs)) {
      return;
    }

    dashboard.tabs.forEach((tab) => {
      if (!tab || !Array.isArray(tab.metrics)) {
        return;
      }

      tab.metrics.forEach((metric) => {
        const metricId = typeof metric?.id === 'string' ? metric.id.trim() : '';
        if (!metricId || NON_NAVIGABLE_METRIC_IDS.has(metricId)) {
          return;
        }

        const dedupeKey = `${dashboard.id || ''}::${tab.id || ''}::${metricId}`;
        if (dedupe.has(dedupeKey)) {
          return;
        }
        dedupe.add(dedupeKey);

        const metricName = typeof metric.name === 'string' && metric.name.trim()
          ? metric.name.trim()
          : metricId;
        const description = typeof metric.description === 'string' ? metric.description.trim() : '';
        const metricDescription = typeof metric.metricDescription === 'string' ? metric.metricDescription.trim() : '';

        const entry = {
          key: dedupeKey,
          dashboardId: dashboard.id,
          dashboardName: dashboard.name || dashboard.id || '',
          tabId: tab.id,
          tabName: tab.name || tab.id || '',
          metricId,
          metricName,
          description,
          metricDescription
        };

        entry._search = ensureSearchField(entry);
        index.push(entry);
      });
    });
  });

  return index;
};

export const searchMetricIndex = (index = [], query = '', options = {}) => {
  if (!Array.isArray(index) || index.length === 0) return [];

  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const queryTokens = tokenize(normalizedQuery);
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? options.limit
    : DEFAULT_RESULT_LIMIT;

  return index
    .map((entry) => ({
      entry,
      score: getEntryScore(entry, normalizedQuery, queryTokens)
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;

      const nameCompare = String(left.entry.metricName).localeCompare(String(right.entry.metricName));
      if (nameCompare !== 0) return nameCompare;

      const dashboardCompare = String(left.entry.dashboardName).localeCompare(String(right.entry.dashboardName));
      if (dashboardCompare !== 0) return dashboardCompare;

      const tabCompare = String(left.entry.tabName).localeCompare(String(right.entry.tabName));
      if (tabCompare !== 0) return tabCompare;

      return String(left.entry.metricId).localeCompare(String(right.entry.metricId));
    })
    .slice(0, limit)
    .map(({ entry }) => entry);
};
