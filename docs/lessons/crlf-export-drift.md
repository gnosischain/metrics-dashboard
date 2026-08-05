---
id: crlf-export-drift
title: The generators copy source bytes verbatim, so a Windows checkout writes CRLF into the JSON string values
status: observed
layer: build-pipeline
scope: scripts/export-queries.js, scripts/build-search-registry.js — every generator that reads src/queries/*.js as text
symptom: >-
  running `pnpm run export-queries` rewrites most of api/queries/*.json with no
  intended change; the diff shows only `\r` appearing before `\n` inside the
  "query" value. The same command on macOS or Linux reverts every one of them.
last_verified: 2026-08-05
evidence:
  - 'scripts/export-queries.js — the query regex captures the file substring verbatim; `.trim()` only touches the ends'
  - 'measured 2026-08-05 on a Windows checkout with core.autocrlf=true: 636 of 636 src/queries/*.js contain CRLF, and 0 of the committed api/queries/*.json contain an escaped CR'
  - '`git check-attr text eol -- src/queries/<file>.js` returns unspecified for both — there is no .gitattributes, so autocrlf governs'
  - 'no automated check covers this: a windows-latest CI leg was written and then removed on 2026-08-05 as disproportionate, and no unit test replaced it'
---
## Symptom

You run the exporter, expecting to publish one metric's SQL, and git reports several
hundred modified files under `api/queries/`. Every diff looks empty until you notice the
`\r` before each `\n` inside the `"query"` string. A colleague on macOS runs the same
command and the entire diff reverts. The two of you can bounce the tree back and forth
indefinitely, and any real SQL change is invisible in the noise.

## Root cause

Two facts combine.

Git's `core.autocrlf` defaults to `true` on a stock Git for Windows install, and this repo
has no `.gitattributes` to override it, so `src/queries/*.js` lands on disk with CRLF line
endings.

The generators do not parse JavaScript — they regex the file as text and capture the query
literal's bytes exactly as they appear. So the captured SQL contains `\r\n`, and
`JSON.stringify` faithfully encodes each one as the two-character escape `\r` inside the
string value.

The crucial part: at that point the carriage return is **data**, not a line ending. It is
the letter `r` after a backslash. Neither `.gitattributes`, nor `core.autocrlf`, nor any
git normalisation can undo it, because git only rewrites real end-of-line bytes. This is
why the problem survives every line-ending setting you try.

## Forbidden action

Do not try to fix this with `.gitattributes`, `eol=lf`, or `core.autocrlf` alone — it
cannot work, for the reason above. Do not commit the CRLF churn "to make the diff go
away"; that just moves the conflict to the next person on a different platform. Do not add
a comparison path that re-derives what a generator writes instead of calling the generator,
because the two will drift.

## Detection

`pnpm run check` runs `export-queries.js --check`, which regenerates in memory and compares
without writing. Anything out of sync is listed by id.

**That only detects it on a Windows machine.** CI runs on Ubuntu, where git checks everything
out with LF, so both normalisation calls are no-ops and the check passes whether they are
present or not. The Linux leg cannot fail from this fault — its passing says nothing about it.

So the first report will be a human on Windows seeing hundreds of files rewritten with only
`\r` in the diff. If that is what you are looking at, check that the two `normalizeNewlines`
calls in `scripts/export-queries.js` are still there before looking anywhere else.

## Safe remediation

Normalise newlines where the value is captured, before it is serialised:

```js
const normalizeNewlines = (value) => value.replace(/\r\n?/g, '\n');
```

Apply it on both sides — the value being written and the committed file being compared
against — or `--check` will report drift for the wrong reason. Comparison also has to
ignore trailing whitespace, since hand-maintained JSON carries a trailing newline that
`JSON.stringify` does not emit, and that cosmetic difference otherwise masks real ones.

## Enforcement

**None, deliberately.** The normalisation lives in `scripts/export-queries.js` (two calls) and
`scripts/build-search-registry.js` (one), and nothing verifies it stays. A `windows-latest` CI
leg reproducing a CRLF checkout was written on 2026-08-05 and removed the same day as
disproportionate to a one-line `.replace()`; no unit test was added in its place.

The accepted risk is specific. All three calls read as dead code to anyone on macOS or Linux,
where they provably do nothing, so they are plausible tidy-up targets. Each carries a
"do not remove" comment, which is the whole of the guard. Removing the one at the `--check`
comparison is the worse case: it does not corrupt output, it makes `pnpm run check` report all
635 files as stale for Windows developers only, and a gate that cries wolf stops being run —
which leaves `docs/lessons/export-queries-drift.md` unguarded, the fault that had two metrics
serving wrong numbers for months.

If this recurs, that is the evidence the comments were not enough, and the cheap fix is a unit
test asserting CRLF input yields LF output on both the write and the compare path. It runs
anywhere and needs no Windows runner. Status stays `observed`: the fault is fixed, but nothing
holds it fixed.
