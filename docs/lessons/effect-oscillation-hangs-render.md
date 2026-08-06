---
id: effect-oscillation-hangs-render
title: An effect that compared '' against undefined re-rendered forever, and act() made it a synchronous hang
status: observed
layer: widget-ui
scope: src/components/MetricWidget.js local filter effects; any effect that setStates a freshly built object
symptom: >-
  rendering one widget config never returns. No error, no timeout, and console.log
  lines placed before the render never appear — so it looks like the test body never
  started, when in fact it started and never yielded.
last_verified: 2026-08-06
evidence:
  - 'render() with the same mocks completed in 47ms once enableFiltering/labelField/localFilterFields were removed from the fixture, and never returned with them present'
  - "the options memo returns {} while data is null, so options for each field is [], nextValue becomes ('' || '') = '' and previousValue is undefined — '' !== undefined set hasChanges on every pass, so the effect assigned a new object forever"
  - 'the effect depends on the options memo, and the memo depends on the state the effect writes, so each pass invalidated the next'
  - 'two live metrics use localFilterFields: api_execution_gpay_flows_snapshot and api_execution_gpay_flows_inout_by_label_snapshot — the second matches the failing fixture exactly'
  - "vitest buffers a task's stdout and flushes it at async boundaries, so a synchronous loop swallows the logs written just before it; the hook's logs flushed and the test body's did not, which is what located the loop"
---
## Symptom

One widget config renders forever. Nothing is reported: no assertion failure, no timeout, and
the `console.log` you added immediately before `render()` does not appear. The obvious reading
— that execution never reached the test body — is wrong, and following it costs an hour.

## Root cause

An effect wrote state derived from a memo that depended on that same state, and its
change-detection compared unequal representations of "nothing".

While `data` is still null the options memo returns `{}`, so every field's option list is
empty. `nextValue` collapses to `''` while `previousValue` is `undefined`. Those are not
strictly equal, so `hasChanges` was true on every pass, so the effect assigned a brand-new
object, which invalidated the memo, which re-ran the effect. The loop only existed in the
window before the fetch resolved — and it never resolved, because it never got a turn.

In a browser this is a re-render loop that spins until data lands and then settles, which is
why it was never reported as a bug. Under React's `act()` the flush is a synchronous loop
that never yields, so the pending fetch cannot resolve and the loop is permanent. Same defect,
two completely different presentations.

## Forbidden action

Never let an effect's change test compare `undefined` against a manufactured `''` or `0`.
Normalise both sides — `nextValue !== (previousValue || '')` — or the effect can never reach
a fixed point.

Do not add a state bail-out that still returns a new object. The oscillation survives any
guard that produces a fresh reference; convergence requires returning the *previous* reference
so React can stop.

Do not conclude that missing logs mean unreached code. Vitest flushes a task's stdout at
async boundaries, so a synchronous loop eats whatever was logged just before it.

## Detection

No static check catches this. The reliable localisation is to strip the fixture's config keys
until the render completes: the last key you removed names the code path, which was
`localFilterFields` here. Then read that path's effects for a setState whose dependency chain
runs back through the state it writes.

`pnpm test` catches this specific one now: the suite hangs outright if it returns.

## Safe remediation

Normalise the comparison so an absent selection and an empty selection are the same thing.
Then verify with the config that reproduced it, not with a simplified one — the loop needs a
real multi-field `localFilterFields` to appear.

Check the live metrics on that path afterwards. `api_execution_gpay_flows_snapshot` and
`api_execution_gpay_flows_inout_by_label_snapshot` were both spinning through their load
window in the browser, briefly and invisibly, for as long as this existed.

## Enforcement

`MetricWidget.test.jsx` in `pnpm test`, run by CI on every PR. Its first two tests exercise
the multi-filter path with a two-field config, so the loop cannot return unnoticed.

The class is not enforced. Any other effect that writes a memo's own dependency can do this
again, and only a render that never returns will say so.
