import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const themeCss = readFileSync(
  fileURLToPath(new URL("../tailwind/theme.css", import.meta.url)),
  "utf8",
);

type Tokens = Record<string, string>;

function token(tokens: Tokens, name: string): string {
  const value = tokens[name];
  if (value === undefined) throw new Error(`Brak tokenu --${name} w theme.css`);
  return value;
}

function readTokens(selector: string): Tokens {
  const block = new RegExp(`${selector}\\s*\\{([^}]*)\\}`, "m").exec(themeCss);
  if (!block?.[1]) throw new Error(`Brak bloku ${selector} w theme.css`);

  const tokens: Tokens = {};
  for (const line of block[1].split("\n")) {
    const match = /--([a-z-]+):\s*(oklch\([^)]*\))/.exec(line);
    if (match?.[1] && match[2]) tokens[match[1]] = match[2];
  }
  return tokens;
}

function oklchToLinearSrgb(lightness: number, chroma: number, hue: number): number[] {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.min(1, Math.max(0, channel)));
}

function relativeLuminance(color: string): number {
  const match = /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/.exec(color);
  const [, lightness, chroma, hue] = match ?? [];
  if (lightness === undefined || chroma === undefined || hue === undefined) {
    throw new Error(`Nieobsługiwany zapis koloru: ${color}`);
  }

  const [r = 0, g = 0, b = 0] = oklchToLinearSrgb(Number(lightness), Number(chroma), Number(hue));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

const TEXT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["muted-foreground", "background"],
  ["muted-foreground", "muted"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["primary-foreground", "primary"],
  ["destructive-foreground", "destructive"],
];

const UI_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["border", "background"],
  ["input", "background"],
  ["ring", "background"],
  ["destructive", "background"],
];

const THEMES: ReadonlyArray<readonly [string, string]> = [
  ["jasny", ":root"],
  ["ciemny", "\\.dark"],
];

describe.each(THEMES)("tokeny motywu — tryb %s", (_name, selector) => {
  const tokens = readTokens(selector);

  it.each(TEXT_PAIRS)("tekst %s na tle %s ma kontrast co najmniej 4.5:1", (fg, bg) => {
    expect(contrastRatio(token(tokens, fg), token(tokens, bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(UI_PAIRS)("element interfejsu %s na tle %s ma kontrast co najmniej 3:1", (fg, bg) => {
    expect(contrastRatio(token(tokens, fg), token(tokens, bg))).toBeGreaterThanOrEqual(3);
  });
});
