export { BugReplayRecorder } from "./recorder.js";
export { bundleToJson, downloadBundle, formatTimeline } from "./bundle.js";
export { safeUrl, selectorFor } from "./redact.js";
export type { BugEvent, BugReplayBundle, EventType, RecorderOptions } from "./types.js";

import { BugReplayRecorder } from "./recorder.js";

export function createRecorder(options?: import("./types.js").RecorderOptions): BugReplayRecorder {
  return new BugReplayRecorder(options);
}
