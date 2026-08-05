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
  - '.github/workflows/ci.yml — the verify-windows job sets core.autocrlf=true before checkout and runs the same parity check'
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

Because the fault is platform-dependent, the check also runs on `windows-latest` in CI with
`core.autocrlf=true` forced before checkout. A normalisation regression fails there while
the Linux leg stays green.

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

The normalisation is in `scripts/export-queries.js` and `scripts/build-search-registry.js`;
the parity check runs on both Ubuntu and Windows in `.github/workflows/ci.yml`. Status
moves to `enforced` once that workflow has run on `main`.
