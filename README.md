# BugReplay

> Reproduce the bug, not the explanation.

BugReplay is a small, privacy-first browser session recorder that turns a bug reproduction into a portable JSON bundle.

Instead of sending *"click this, then refresh, then somehow it breaks"*, a user can capture a session and share the exact timeline of browser events, console errors, failed requests, viewport, URL, and environment metadata.

## MVP

- Zero backend: recordings stay in the browser until exported.
- Portable `.bugreplay.json` bundles.
- Click, navigation, input metadata, console errors, uncaught errors, and failed network requests.
- Automatic redaction of query strings, hashes, cookies, authorization headers, and form values.
- Human-readable timeline.
- Tiny TypeScript API with no framework dependency.
- Works as a drop-in script or with modern bundlers.

## Quick start

```bash
npm install
npm run build
```

Then use the browser API:

```ts
import { createRecorder } from "bugreplay";

const recorder = createRecorder();
recorder.start();

// ... reproduce the bug ...

const bundle = recorder.stop();
recorder.download(bundle, "checkout-failure.bugreplay.json");
```

## Privacy model

BugReplay deliberately does **not** capture raw input values. URLs are normalized to remove query strings and fragments. Network headers are reduced to safe metadata. The bundle contains only information required to reconstruct a useful reproduction timeline.

This is an MVP, not a security boundary. Review bundles before sharing them.

## Bundle format

```text
BugReplayBundle
├── schemaVersion
├── id
├── startedAt
├── durationMs
├── page
├── environment
└── events[]
    ├── click
    ├── input
    ├── navigation
    ├── console-error
    ├── uncaught-error
    └── network-error
```

The format is intentionally plain JSON so other debugging tools can consume it.

## Roadmap

- Playwright replay adapter
- DOM snapshots at selected checkpoints
- network request/response fingerprints
- React/Vue/Svelte adapters
- bundle viewer with a visual timeline
- shareable local `.bugreplay` package
- deterministic replay checks

## Why this exists

Screenshots describe what a bug looks like. Logs describe what happened somewhere in the system. BugReplay is designed to preserve the **sequence that led to the failure**.

## License

MIT
