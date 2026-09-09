import { z } from "zod";

/** Jeden kształt błędu dla całego API — .claude/rules/contracts.md. */
export const API_ERROR_CODES = [
  "VALIDATION_FAILED",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL",
] as const;

export const apiErrorCodeSchema = z.enum(API_ERROR_CODES);

export const apiValidationIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
    message: z.string(),
    issues: z.array(apiValidationIssueSchema).optional(),
  }),
});

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type ApiValidationIssue = z.infer<typeof apiValidationIssueSchema>;
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
