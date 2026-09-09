import "express";

declare global {
  namespace Express {
    interface Request {
      /** Ustawiane przez middleware `cookies` (src/http/cookies.ts). */
      cookies: Record<string, string>;
      /** Ustawiane przez `requireSession` (src/modules/auth/require-session.ts). */
      auth?: {
        accountId: string;
        email: string;
        sessionId: string;
      };
    }
  }
}
