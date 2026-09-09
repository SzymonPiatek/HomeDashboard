import type { ApiValidationIssue } from "@repo/contracts/error";
import type { z } from "zod";

export function mapZodIssues(error: z.ZodError): ApiValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
