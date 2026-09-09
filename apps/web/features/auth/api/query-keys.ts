// Jedyne miejsce budowania kluczy zapytań obszaru auth — .claude/rules/web.md.
export const authKeys = {
  session: () => ["auth", "session"] as const,
};
