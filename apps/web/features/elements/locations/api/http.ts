import { apiErrorSchema } from "@repo/contracts/error";

// Wspólny kształt błędu API (.claude/rules/contracts.md) — wyciąga komunikat,
// z awaryjnym tekstem, gdy odpowiedź nie da się sparsować (np. 502 z proxy).
export async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = apiErrorSchema.parse(await response.json());
    return body.error.message;
  } catch {
    return fallback;
  }
}
