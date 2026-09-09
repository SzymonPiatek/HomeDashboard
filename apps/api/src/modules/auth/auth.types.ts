export const SESSION_KINDS = ["kiosk", "standard"] as const;
export type SessionKind = (typeof SESSION_KINDS)[number];

export type AccountRecord = {
  id: string;
  email: string;
  googleSub: string | null;
};

export type SessionRecord = {
  id: string;
  accountId: string;
  tokenHash: string;
  kind: SessionKind;
  expiresAt: Date;
};

export type SessionWithAccount = SessionRecord & { account: AccountRecord };

export type AccountRepository = {
  /** Tożsamość konta ma dwa źródła: hasło i googleSub (ADR-0004 przyszłościowo). */
  upsertByGoogleSub(params: { googleSub: string; email: string }): Promise<AccountRecord>;
};

export type SessionRepository = {
  create(params: {
    accountId: string;
    tokenHash: string;
    kind: SessionKind;
    expiresAt: Date;
  }): Promise<SessionRecord>;
  findByTokenHashWithAccount(tokenHash: string): Promise<SessionWithAccount | null>;
  updateExpiresAt(id: string, expiresAt: Date): Promise<void>;
  deleteById(id: string): Promise<void>;
};
