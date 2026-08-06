# src/components — widgets and charts

`MetricWidget` and `MetricGrid` are the hubs; most cards reach the screen through them.
Chart implementations live in `charts/ChartTypes/`, one file per type.

## Remounting is the recurring bug here

A card that remounts throws away its state and refetches its data. Because the render tree is
built from conditional branches, it is easy to unmount a whole subtree by accident — swapping
`<MetricGrid>` for a loading placeholder inside the same branch position unmounts every widget
under it.

Two instances of this existed in `Dashboard.js` until 2026-08-05, both fixed: one mounted the
grid prematurely during startup (before the tab resolved) and then remounted it with the real
metrics; the other swapped the grid for a placeholder on every tab change.

`Dashboard.test.jsx` guards this with mount/unmount counters. If you change the branch
structure around `MetricGrid`, that test is the one that will tell you.

## Config flows down, and dropping a key hides intent

Widgets receive a metric's `tableConfig` / chart config and forward it to the underlying
library. Forward declared values even when falsy: `TableWidget` used to drop
`responsiveLayout: false` because it only spread truthy values, which made a deliberate layout
decision invisible in the resulting config.

## Testing conventions

Component tests mock heavy children rather than rendering them — see the mock block at the top
of `MetricWidget.test.jsx` for the pattern (`echarts`, the metrics service, `EChartsContainer`,
`LabelSelector`, `InfoPopover`, and `./Card` / `./NumberWidget` / `./TextWidget` /
`./TableWidget` individually). Follow it: an unmocked chart or markdown subtree makes a test
slow and brittle.

Mock those four per module, never via `./index`. The barrel imports `MetricWidget`, so a
component reaching back into it closes a cycle — see the rule in the root `AGENTS.md`.

`pnpm test` runs everything: 289 tests in 33 files, ~80s unloaded as of 2026-08-06. There is no
`test:ci` variant any more, and a run that does not finish is a real fault rather than a slow
test. `MetricWidget.test.jsx` hung the suite until 2026-08-06 for two compounding reasons, both
recorded: a module-level throw inside a circular barrel import
(`docs/lessons/barrel-import-cycle-hangs-tests.md`) and an effect that re-rendered forever
(`docs/lessons/effect-oscillation-hangs-render.md`).

If a run stalls, cap the workers before anything else — `--poolOptions.forks.maxForks=1
--no-file-parallelism`. The default pool spawns roughly 30 workers here, and while they thrash
the reporter emits nothing at all, which is why this went undiagnosed. Those workers survive
killing the parent, so clean them up after an attempt.

Do not use fixed calendar dates in fixtures for code that filters relative to now — the test
will expire instead of failing. See `docs/lessons/tests-that-expire-instead-of-failing.md`.
