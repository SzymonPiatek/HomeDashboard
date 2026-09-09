import type { ApiErrorBody, ApiErrorCode, ApiValidationIssue } from "@repo/contracts/error";

/** Błąd domenowy z kształtem odpowiedzi znanym z góry — .claude/rules/api.md. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly issues?: ApiValidationIssue[];

  constructor(status: number, code: ApiErrorCode, message: string, issues?: ApiValidationIssue[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

export function buildErrorBody(
  code: ApiErrorCode,
  message: string,
  issues?: ApiValidationIssue[],
): ApiErrorBody {
  return { error: { code, message, ...(issues ? { issues } : {}) } };
}
