import { describe, expect, it } from "vitest";

import { parseCookieHeader } from "./cookies.js";

describe("parseCookieHeader", () => {
  it("zwraca pusty obiekt, gdy nagłówek nie istnieje", () => {
    expect(parseCookieHeader(undefined)).toEqual({});
  });

  it("parsuje pojedyncze ciasteczko", () => {
    expect(parseCookieHeader("session=abc123")).toEqual({ session: "abc123" });
  });

  it("parsuje wiele ciasteczek rozdzielonych średnikiem", () => {
    expect(parseCookieHeader("a=1; b=2;c=3")).toEqual({ a: "1", b: "2", c: "3" });
  });

  it("dekoduje wartości zakodowane przez encodeURIComponent", () => {
    const value = encodeURIComponent(JSON.stringify({ state: "xyz" }));

    expect(parseCookieHeader(`oauth_state=${value}`)).toEqual({
      oauth_state: JSON.stringify({ state: "xyz" }),
    });
  });

  it("pomija segmenty bez znaku '='", () => {
    expect(parseCookieHeader("garbage;a=1")).toEqual({ a: "1" });
  });
});
