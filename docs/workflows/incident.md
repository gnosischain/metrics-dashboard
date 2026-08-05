# Recording a lesson

Use this after diagnosing something that wasted real time and can happen again. The test is
not "was this a bug" — it is **"would the next person make the same mistake?"** A typo does
not qualify. A seam that fails without saying so does.

## Before you write anything

Confirm the class is real:

1. Name the wrong belief that caused it. If you cannot, you have a bug report, not a lesson.
2. Check `docs/lessons/INDEX.md` for an existing record. Extending one with new evidence is
   almost always better than adding a near-duplicate.
3. Establish how it would be *caught*. A record with no detection story is a complaint.

## Write the record

`docs/lessons/<id>.md`, frontmatter first:

```yaml
---
id: kebab-case-matching-the-filename
title: A full sentence stating the mistake, not a topic label
status: observed | remediated | enforced
layer: query-definition | layout-config | widget-ui | client-data | serverless-api | build-pipeline
scope: the paths or metric families this actually applies to
symptom: >-
  what you would see and search for, in the words you would have used before
  you understood the cause
last_verified: YYYY-MM-DD
evidence:
  - 'a file and line, a measurement with its date, or a query and its result'
---
```

Then six sections, in this order and with these names — the validator enforces them:

| Section | Contains |
|---|---|
| `## Symptom` | the misleading surface behaviour, including what it gets mistaken for |
| `## Root cause` | the actual mechanism, in enough depth that the fix is obvious |
| `## Forbidden action` | what not to do, *including plausible fixes that cannot work* |
| `## Detection` | the command or gate that catches it, and how to find it by symptom |
| `## Safe remediation` | the correct sequence, with any ordering constraint called out |
| `## Enforcement` | the specific gate, or explicitly none — and what would change that |

Rules that keep the corpus trustworthy:

- **Every claim gets evidence or gets deleted.** Cite a file and line, or a measurement with
  the date you took it. "Sometimes flaky" is not evidence.
- **`status` is the deployed state.** Not your branch.
- **Write the symptom in pre-diagnosis language.** Records are found by symptom; if you title
  it with the cause, only someone who already knows will find it.
- **Record the fixes that cannot work.** For `crlf-export-drift`, ruling out `.gitattributes`
  saves more time than the actual fix, because it is the first thing everyone tries.

## Wire it up

1. Add a row to `docs/lessons/INDEX.md` under the matching symptom group.
2. Cite the lesson path from the gate that enforces it, so a failure points at the
   explanation — see the message in `scripts/export-queries.js --check`.
3. Run `pnpm test` — the lesson validator checks the schema, the section names, that
   `last_verified` is not absurd, and that the index and the files agree.

## Keeping it honest

`last_verified` is a claim that someone re-checked the evidence on that date. The validator
fails records older than 400 days, which forces a decision rather than letting the corpus
quietly become folklore: re-verify and bump the date, or delete the record.

When a gate starts covering a lesson, change `status` to `enforced` and name the gate. When a
whole class becomes impossible — the seam is gone, not merely guarded — delete the record and
say so in the commit. A corpus that only grows is one nobody trusts.
