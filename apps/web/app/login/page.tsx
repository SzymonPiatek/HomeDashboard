import { buttonVariants } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

// Start logowania to nawigacja przeglądarki, nigdy fetch — .claude/rules/web.md,
// sekcja "Przepływ zgody OAuth" (ADR-0001).
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 p-6">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">Logowanie</h1>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive bg-destructive/10 p-3 text-center text-sm text-destructive"
        >
          Nie udało się zalogować. Ten adres nie ma dostępu do aplikacji.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <a
          href="/api/auth/google/start?device=standard"
          className={buttonVariants({ size: "default" })}
        >
          Zaloguj się kontem Google
        </a>
        <a
          href="/api/auth/google/start?device=kiosk"
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          Zapamiętaj to urządzenie
        </a>
      </div>
    </main>
  );
}
