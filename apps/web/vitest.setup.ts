import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Brak test.globals w konfiguracji (styl repo — importy jawne), więc auto-cleanup
// biblioteki testing-library trzeba zarejestrować ręcznie.
afterEach(() => {
  cleanup();
});
