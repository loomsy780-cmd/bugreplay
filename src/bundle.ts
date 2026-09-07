import type { BugReplayBundle } from "./types.js";

export function bundleToJson(bundle: BugReplayBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function downloadBundle(bundle: BugReplayBundle, filename = "bugreplay-session.bugreplay.json"): void {
  const blob = new Blob([bundleToJson(bundle)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function formatTimeline(bundle: BugReplayBundle): string {
  return bundle.events
    .map((event) => `${String(event.at).padStart(6, " ")}ms  ${event.type.padEnd(16)} ${event.target ?? ""}`)
    .join("\\n");
}
