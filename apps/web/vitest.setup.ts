import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Brak test.globals w konfiguracji (styl repo — importy jawne), więc auto-cleanup
// biblioteki testing-library trzeba zarejestrować ręcznie.
afterEach(() => {
  cleanup();
});

// jsdom nie implementuje ResizeObserver — potrzebne przez pozycjonowanie w Radix
// (np. AlertDialog, Tooltip).
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver ??= ResizeObserverStub;
