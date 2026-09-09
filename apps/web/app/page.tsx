import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

export default function DashboardPage() {
  return (
    <AuthGate>
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-2 p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Pulpit domowy</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
        <p className="text-muted-foreground">
          Szkielet aplikacji. Elementy pulpitu pojawią się tutaj.
        </p>
      </main>
    </AuthGate>
  );
}
