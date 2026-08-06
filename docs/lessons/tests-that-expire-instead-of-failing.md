---
id: tests-that-expire-instead-of-failing
title: A test with fixed calendar dates against a rolling window does not fail, it expires
status: observed
layer: test-suite
scope: src/**/*.test.* — any test exercising code that filters by a window relative to now
symptom: >-
  a test that passed for months starts failing with no related code change. The
  commit blamed for breaking it touches nothing nearby, and the assertion looks
  like a logic bug: an empty array where rows were expected.
last_verified: 2026-08-05
evidence:
  - 'src/services/accountPortfolio.js getMovements computes a 90-day cutoff from Date.now() and drops rows older than it'
  - 'the test fixture hardcoded 2026-03-02 and 2026-03-03 — inside the window when written, outside it by 2026-08-05, producing "expected [] to have a length of 2"'
  - 'git log shows accountPortfolio.js unchanged in the relevant period; only the calendar moved'
  - 'measured 2026-08-05: 9 test files under src/ contain hardcoded ISO date literals, so the pattern is live rather than a one-off'
---
## Symptom

A test fails and the natural assumption is that someone broke the code. The assertion supports
that reading — an empty array where two rows were expected looks exactly like a filtering or
mapping bug. Time is spent reading the implementation, which turns out to be correct.

The tell is that `git log` shows no relevant change to the code under test. If nothing changed
and the result changed, the input changed — and the input includes today's date.

## Root cause

The code under test filters against a window computed from `Date.now()`. The test supplies
fixtures with fixed calendar dates. Those dates sat inside the window when the test was
written, so it passed; as the window slid forward they fell outside it, and the fixture became
invisible to the code it was meant to exercise.

This does not fail at the moment the mistake is made, which is what makes it expensive. It
fails weeks or months later, in someone else's change, and presents as their regression.

## Forbidden action

Do not use fixed calendar dates in a fixture for code that filters relative to now. Do not
"fix" an expired test by widening the production window — that changes behaviour to satisfy a
test artefact. Do not freeze time globally to make the fixture valid again unless the test is
genuinely about time handling; it hides the coupling rather than removing it.

## Detection

There is no reliable static check — a date literal is only a problem in combination with a
relative filter, which no grep can see.

The diagnostic habit is what catches it: when a test fails and `git log` shows nothing relevant
changed, compare the fixture's dates against any window the code computes from `Date.now()`
before reading the implementation further.

## Safe remediation

Derive fixture dates from the current date:

```js
const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
```

Use the derived values in both the fixture and the assertions, so the two cannot drift apart.
Keep the offsets comfortably inside the window — a fixture at 89 days against a 90-day cutoff
is a different flake waiting to happen.

Where a test is genuinely about date handling, fake the clock explicitly (`vi.useFakeTimers`)
so the intent is visible instead of implied.

## Enforcement

None. No gate can distinguish a meaningful date literal from an expiring one, so this record is
the safeguard: the 9 files listed in the evidence are the places to check first when a test
fails for no apparent reason. That changes if fixture dates ever move behind a shared helper,
which could then be required by lint.

One test here does fail on the calendar deliberately, and it is not an instance of this fault:
`scripts/__tests__/lessons.test.js` rejects any lesson whose `last_verified` is more than 400
days old, so an unmaintained record stops the build instead of quietly becoming folklore. The
expiry *is* the assertion there, and the failure message says to re-verify and bump the date. Do
that rather than raising `MAX_AGE_DAYS`, which would turn a deliberate deadline into exactly the
silent decay described above.
