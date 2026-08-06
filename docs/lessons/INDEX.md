# Lessons index

Each record is one *mistake class* that has actually happened here, written to be found by
symptom. If you are debugging, search this page for what you are seeing rather than for what
you think the cause is — every entry below was originally misdiagnosed as something else.

New record: follow `docs/workflows/incident.md`. Do not add a lesson for a one-off bug; a
lesson earns its place by being repeatable and by having a detection story.

## Grouped by symptom

### "I changed it, and nothing happened"

The dashboard has three places a metric must be registered, and two of them fail silently.

| Lesson | Layer | Status | Reach for it when |
|---|---|---|---|
| [export-queries-drift](export-queries-drift.md) | build-pipeline | observed | SQL is right in `src/queries` and the dashboard serves the old number |
| [quoted-keys-skipped-by-exporter](quoted-keys-skipped-by-exporter.md) | build-pipeline | observed | a metric behaves as if the exporter ignores it — because it does |
| [yaml-placement-gate](yaml-placement-gate.md) | layout-config | observed | a new metric renders nowhere and search cannot find it either |

### "A diff appeared that I did not make"

| Lesson | Layer | Status | Reach for it when |
|---|---|---|---|
| [crlf-export-drift](crlf-export-drift.md) | build-pipeline | observed | running a generator rewrites hundreds of files with only `\r` changing |

### "This test fails and I did not touch anything near it"

| Lesson | Layer | Status | Reach for it when |
|---|---|---|---|
| [tests-that-expire-instead-of-failing](tests-that-expire-instead-of-failing.md) | test-suite | observed | a long-passing test fails and `git log` shows no relevant change |

### "It hangs, and no timeout fires"

Both of these present as silence. A timeout races a pending operation, so it cannot fire when
the runner is awaiting a module that never loads or a render that never yields.

| Lesson | Layer | Status | Reach for it when |
|---|---|---|---|
| [barrel-import-cycle-hangs-tests](barrel-import-cycle-hangs-tests.md) | widget-ui | observed | a test file prints the RUN banner and nothing else, ever |
| [effect-oscillation-hangs-render](effect-oscillation-hangs-render.md) | widget-ui | observed | one widget config never finishes rendering, and logs before it vanish |

### "Upstream moved and nothing warned us"

| Lesson | Layer | Status | Reach for it when |
|---|---|---|---|
| [upstream-rename-breaks-a-card](upstream-rename-breaks-a-card.md) | query-definition | observed | a card broke with no commit here and every dbt test upstream is green |
| [non-contract-dbt-reads](non-contract-dbt-reads.md) | query-definition | observed | a card broke after a dbt change that broke no contract |
| [id-does-not-name-the-table](id-does-not-name-the-table.md) | query-definition | observed | you need to know who reads a model, or a rename found no consumers |

## Layer vocabulary

`layer` is a path prefix, so a record can be matched to the code you are about to touch.

| Layer | Paths |
|---|---|
| `query-definition` | `src/queries/**` |
| `layout-config` | `public/dashboard.yml`, `public/dashboards/**` |
| `widget-ui` | `src/components/**` |
| `client-data` | `src/services/**`, `src/utils/**` |
| `serverless-api` | `api/**` |
| `build-pipeline` | `scripts/**`, `vite.config.ts`, `.github/workflows/**` |
| `test-suite` | `**/*.test.*` |

## Status vocabulary

Status describes the **deployed** state, never your working tree. A fix sitting in an
unmerged branch does not make a lesson `remediated`.

| Status | Meaning |
|---|---|
| `observed` | seen at least once, no safeguard yet |
| `remediated` | the specific instance is fixed and deployed, the class can recur |
| `enforced` | a gate makes recurrence fail loudly — name the gate in the record |

Every record above is `observed` because their gates land in the same change that introduces
them and have not yet run on `main`. Bumping them to `enforced` is a deliberate follow-up,
not a formality: it means someone confirmed the gate actually fires.
