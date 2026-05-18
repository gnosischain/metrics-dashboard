import { createRequire } from 'module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const {
  buildPaginatedMetricSql,
  normalizeMetricPagination,
} = require('./metrics-pagination');

describe('metrics pagination helpers', () => {
  it('uses bounded defaults for Circles holdings', () => {
    const pagination = normalizeMetricPagination('api_execution_circles_v2_avatar_holdings_by_token', {});
    const sql = buildPaginatedMetricSql('SELECT * FROM holdings_source ORDER BY ignored DESC', pagination);

    expect(pagination.page).toBe(1);
    expect(pagination.pageSize).toBe(50);
    expect(pagination.includeTotal).toBe(true);
    expect(sql.orderBy).toBe('balance_demurraged DESC, token_address ASC');
    expect(sql.query).toContain('LIMIT 50');
    expect(sql.query).toContain('OFFSET 0');
    expect(sql.query).not.toContain('ignored DESC');
    expect(sql.countQuery).toContain('count() AS total');
  });

  it('applies LIMIT and OFFSET for Circles trust relations pages', () => {
    const pagination = normalizeMetricPagination('api_execution_circles_v2_avatar_trust_relations', {
      page: '3',
      pageSize: '25',
      sortField: 'counterparty',
      sortDir: 'desc',
    });
    const sql = buildPaginatedMetricSql('SELECT * FROM trust_relations_source', pagination);

    expect(pagination.page).toBe(3);
    expect(pagination.pageSize).toBe(25);
    expect(sql.orderBy).toBe('counterparty DESC, direction ASC');
    expect(sql.offset).toBe(50);
    expect(sql.query).toContain('LIMIT 25');
    expect(sql.query).toContain('OFFSET 50');
  });

  it('adds includeTotal metadata and search filtering for allowlisted metrics', () => {
    const pagination = normalizeMetricPagination('api_execution_circles_v2_avatar_trust_relations', {
      includeTotal: true,
      search: "alice's trust",
    });
    const sql = buildPaginatedMetricSql('SELECT * FROM trust_relations_source', pagination);

    expect(pagination.includeTotal).toBe(true);
    expect(sql.query).toContain("alice''s trust");
    expect(sql.query).toContain('positionCaseInsensitive(toString(direction)');
    expect(sql.countQuery).toContain("alice''s trust");
  });

  it('falls back safely when the requested sort field is invalid', () => {
    const pagination = normalizeMetricPagination('api_execution_circles_v2_avatar_holdings_by_token', {
      sortField: 'drop table balances',
      sortDir: 'asc',
      pageSize: '9999',
    });
    const sql = buildPaginatedMetricSql('SELECT * FROM holdings_source', pagination);

    expect(pagination.sortField).toBe(null);
    expect(pagination.pageSize).toBe(500);
    expect(sql.orderBy).toBe('balance_demurraged DESC, token_address ASC');
    expect(sql.query).not.toMatch(/drop table/i);
  });
});
