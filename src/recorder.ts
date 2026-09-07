import { downloadBundle } from "./bundle.js";
import { safeUrl, selectorFor } from "./redact.js";
import type { BugEvent, BugReplayBundle, RecorderOptions } from "./types.js";

const id = () => crypto.randomUUID();

export class BugReplayRecorder {
  private events: BugEvent[] = [];
  private started = 0;
  private sessionId = id();
  private cleanups: Array<() => void> = [];
  private options: Required<RecorderOptions>;

  constructor(options: RecorderOptions = {}) {
    this.options = {
      maxEvents: options.maxEvents ?? 2000,
      captureConsole: options.captureConsole ?? true,
      captureNetworkErrors: options.captureNetworkErrors ?? true
    };
  }

  start(): void {
    if (this.started) return;
    this.started = performance.now();

    const add = (event: BugEvent) => {
      if (this.events.length < this.options.maxEvents) this.events.push(event);
    };
    const listen = <K extends keyof WindowEventMap>(type: K, handler: (event: WindowEventMap[K]) => void) => {
      window.addEventListener(type, handler as EventListener);
      this.cleanups.push(() => window.removeEventListener(type, handler as EventListener));
    };

    listen("click", (event) => {
      const target = event.target instanceof Element ? selectorFor(event.target) : undefined;
      add({ id: id(), type: "click", at: Math.round(performance.now() - this.started), target, detail: { button: event.button } });
    });

    listen("input", (event) => {
      const target = event.target instanceof Element ? selectorFor(event.target) : undefined;
      add({ id: id(), type: "input", at: Math.round(performance.now() - this.started), target, detail: { inputType: (event as InputEvent).inputType ?? "unknown" } });
    });

    listen("popstate", () => add({ id: id(), type: "navigation", at: Math.round(performance.now() - this.started), detail: { url: safeUrl(location.href), kind: "popstate" } }));
    listen("hashchange", () => add({ id: id(), type: "navigation", at: Math.round(performance.now() - this.started), detail: { url: safeUrl(location.href), kind: "hashchange" } }));

    listen("error", (event) => {
      if (event instanceof ErrorEvent) {
        add({ id: id(), type: "uncaught-error", at: Math.round(performance.now() - this.started), detail: { message: event.message, filename: safeUrl(event.filename), line: event.lineno, column: event.colno } });
      }
    });

    if (this.options.captureConsole) {
      const original = console.error;
      console.error = (...args: unknown[]) => {
        add({ id: id(), type: "console-error", at: Math.round(performance.now() - this.started), detail: { message: args.map(String).slice(0, 5).join(" ") } });
        original.apply(console, args);
      };
      this.cleanups.push(() => { console.error = original; });
    }

    if (this.options.captureNetworkErrors) {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          return await originalFetch(...args);
        } catch (error) {
          const request = args[0] instanceof Request ? args[0].url : String(args[0]);
          add({ id: id(), type: "network-error", at: Math.round(performance.now() - this.started), detail: { url: safeUrl(request), message: error instanceof Error ? error.message : String(error) } });
          throw error;
        }
      };
      this.cleanups.push(() => { window.fetch = originalFetch; });
    }
  }

  stop(): BugReplayBundle {
    if (!this.started) throw new Error("Recorder has not been started");
    for (const cleanup of this.cleanups.splice(0)) cleanup();

    const bundle: BugReplayBundle = {
      schemaVersion: 1,
      id: this.sessionId,
      startedAt: new Date(Date.now() - Math.round(performance.now() - this.started)).toISOString(),
      durationMs: Math.round(performance.now() - this.started),
      page: { url: safeUrl(location.href), title: document.title },
      environment: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewport: { width: window.innerWidth, height: window.innerHeight }
      },
      events: this.events
    };
    this.started = 0;
    return bundle;
  }

  download(bundle: BugReplayBundle, filename?: string): void {
    downloadBundle(bundle, filename);
  }
}
