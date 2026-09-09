/** Adres logowania i OWNER_EMAIL są porównywane po tej samej normalizacji — ADR-0001. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
