export type EventType =
  | "click"
  | "input"
  | "navigation"
  | "console-error"
  | "uncaught-error"
  | "network-error";

export interface BugEvent {
  id: string;
  type: EventType;
  at: number;
  target?: string;
  detail: Record<string, unknown>;
}

export interface BugReplayBundle {
  schemaVersion: 1;
  id: string;
  startedAt: string;
  durationMs: number;
  page: { url: string; title: string };
  environment: {
    userAgent: string;
    language: string;
    viewport: { width: number; height: number };
  };
  events: BugEvent[];
}

export interface RecorderOptions {
  maxEvents?: number;
  captureConsole?: boolean;
  captureNetworkErrors?: boolean;
}
