/**
 * Export all query definitions
 * 
 * This file imports all metric query definitions and exports them as an array.
 * To add a new metric, simply create a new file in this directory and import it here.
 */

import queryCount from './queryCount';
import dataSize from './dataSize';
import queryDuration from './queryDuration';
import errorRate from './errorRate';

// Create a named array of all queries
const allQueries = [
  queryCount,
  dataSize,
  queryDuration,
  errorRate
];

export default allQueries;