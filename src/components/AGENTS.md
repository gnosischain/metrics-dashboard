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
of `MetricWidget.test.jsx` for the pattern (`echarts`, `./index`, `EChartsContainer`,
`LabelSelector`, `InfoPopover`, the metrics service). Follow it: an unmocked chart or markdown
subtree makes a test slow and brittle.

Use `pnpm run test:ci`, not `pnpm test`. `MetricWidget.test.jsx` hangs and takes the whole
suite with it. What is known as of 2026-08-05: run in isolation it prints the `RUN` banner and
nothing else, and neither `--testTimeout=15000` nor `--hookTimeout=20000` bounds it — it was
still running at 7 minutes with both set. Since vitest applies those bounds to test bodies and
to hooks respectively, the stall is outside both, which points at module transform, environment
setup, or teardown rather than at any assertion. It leaves orphaned node workers behind, so
kill them after an attempt.

Do not read the absence of per-test output as evidence about *where* it stalls: piped
(non-TTY) output makes the reporter buffer everything until the file finishes, so a file that
never finishes prints nothing regardless of cause.

`test:ci` excludes that one file so the other 255 tests still gate. Fixing the hang and
deleting the exclusion is open work.

Do not use fixed calendar dates in fixtures for code that filters relative to now — the test
will expire instead of failing. See `docs/lessons/tests-that-expire-instead-of-failing.md`.
