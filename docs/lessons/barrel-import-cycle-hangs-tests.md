---
id: barrel-import-cycle-hangs-tests
title: A component importing its own barrel turned a module-level throw into a test file that hung forever
status: observed
layer: widget-ui
scope: src/components/index.js and anything importing from it; src/test/setupTests.js
symptom: >-
  a test file prints the RUN banner and nothing else. No test name, no assertion,
  no error, and no timeout — --testTimeout and --hookTimeout both pass without
  firing, because nothing is running late; an import promise simply never settles.
last_verified: 2026-08-06
evidence:
  - 'importing a leaf component (./Card) resolved in 115ms; importing ./index resolved in 8s once unblocked; importing ./MetricWidget never resolved at all'
  - 'echarts-wordcloud probes canvas support at module scope and throws `Sorry your browser not support wordCloud` when HTMLCanvasElement.getContext returns null, which is what jsdom does with no canvas package installed'
  - 'src/components/index.js imports MetricWidget, and MetricWidget imported { Card, NumberWidget, TextWidget, TableWidget } from ./index — the only such edge in src/, found by grepping for barrel imports'
  - "with the default pool the run spawned ~30 node workers that thrashed the machine, so the reporter emitted nothing at all; --poolOptions.forks.maxForks=1 was what made the failure legible"
  - 'a previous note in src/components/AGENTS.md attributed the hang to module transform or environment teardown, which the bisect disproved'
---
## Symptom

`vitest run <file>` prints the `RUN` banner and stops. No test name, no error, no timeout,
and the process must be killed. Reducing the file does not help, because the file is not the
problem — the shape of the import graph is.

Do not read the timeout's silence as "the test is slow". A timeout races a pending
operation; it cannot fire when the runner is still awaiting a module that will never load.

## Root cause

Two faults compounding, and neither is visible on its own.

`echarts-wordcloud` decides at *module scope* whether the browser supports canvas, and
throws if not. jsdom has no canvas, so `getContext` returns null and the import throws. That
alone would be a legible error.

It became a hang because `src/components/index.js` imports `MetricWidget`, and
`MetricWidget` imported four components back from `./index`. Entering that cycle from
`MetricWidget` meant its import awaited the barrel while the barrel awaited it, so the throw
had nowhere to surface: the promise never settled, and no timeout applies to a module that is
still loading.

## Forbidden action

Never import from `./index` inside a module that `./index` imports. Import the sibling
module directly. The barrel exists for consumers, and a component is not a consumer of
itself.

Do not delete the canvas stub in `src/test/setupTests.js`. It is what keeps the chart set
importable under jsdom, and removing it reintroduces a module-scope throw rather than a test
failure. `measureText` must keep returning a constant non-zero width: `echarts-wordcloud`
walks font sizes down from 20 and stops when two measurements agree, so a zero or varying
width changes how long that loop runs.

## Detection

There is no static check. The diagnostic sequence is what to reuse, and it took four runs:

1. Re-run with `--poolOptions.forks.maxForks=1 --no-file-parallelism`. Nothing is diagnosable
   while 30 workers compete; this alone may turn a silent hang into a real timeout.
2. Import the module under test from a throwaway test with no mocks. If that hangs, it is the
   graph, not the test.
3. Import a leaf, then the barrel, then the module. The first one to hang names the cycle.
4. Remember that `console.log` output buffers per task. Logs that never appear do not prove
   the code never ran — see `effect-oscillation-hangs-render.md`, where that mattered.

## Safe remediation

Break the cycle at the component, not at the barrel: `MetricWidget` now imports `./Card`,
`./NumberWidget`, `./TextWidget` and `./TableWidget` directly. Tests that mocked `./index` to
intercept those four must mock the four modules instead, or the real ones load.

Fix the module-scope throw separately, in `setupTests.js`. Suppressing the symptom by mocking
the barrel in each test file would have left the cycle in place for the next module-level
throw to find.

## Enforcement

None static. `MetricWidget.test.jsx` is back in `pnpm test`, which CI runs on every PR, so
the specific regression fails loudly — the whole suite hanging is unmistakable. That is
coverage of the instance, not of the class: a new barrel import in another component would
recreate it.

The suite completes in ~80s unloaded (32 files, 288 tests) as of 2026-08-06, and took 178s on a
loaded machine. A run that does not finish at all is this class of fault, not a slow test.
